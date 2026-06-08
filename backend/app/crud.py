from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
from .logging_config import log_audit
from datetime import datetime

# --- COLABORADORES CRUD ---

def get_colaborador_by_email(db: Session, email: str):
    return db.query(models.Colaborador).filter(models.Colaborador.email == email).first()

def get_colaboradores(db: Session, search: str = None):
    query = db.query(models.Colaborador)
    if search:
        query = query.filter(
            or_(
                models.Colaborador.nome.ilike(f"%{search}%"),
                models.Colaborador.email.ilike(f"%{search}%"),
                models.Colaborador.departamento.ilike(f"%{search}%"),
                models.Colaborador.cargo.ilike(f"%{search}%")
            )
        )
    return query.all()

def create_colaborador(db: Session, colaborador: schemas.ColaboradorCreate):
    # Verifica duplicidade de email
    db_colab = get_colaborador_by_email(db, email=colaborador.email)
    if db_colab:
        raise ValueError("E-mail de colaborador já cadastrado.")

    db_colaborador = models.Colaborador(
        nome=colaborador.nome,
        email=colaborador.email,
        cargo=colaborador.cargo,
        departamento=colaborador.departamento,
        status=colaborador.status
    )
    db.add(db_colaborador)
    db.commit()
    db.refresh(db_colaborador)
    
    # Log de Auditoria
    log_audit(
        event_type="COLABORADOR_CRIADO",
        resource_id=db_colaborador.id,
        message=f"Colaborador {db_colaborador.nome} ({db_colaborador.email}) cadastrado com sucesso."
    )
    return db_colaborador

def update_colaborador(db: Session, colaborador_id: int, colaborador_data: schemas.ColaboradorUpdate):
    db_colaborador = db.query(models.Colaborador).filter(models.Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        return None

    # Se estiver alterando email, verifica se já existe em outro colaborador
    if colaborador_data.email and colaborador_data.email != db_colaborador.email:
        email_exists = get_colaborador_by_email(db, colaborador_data.email)
        if email_exists:
            raise ValueError("O novo e-mail já está sendo utilizado por outro colaborador.")

    # Verifica se houve alteração de status
    status_alterado = False
    status_anterior = db_colaborador.status
    novo_status = colaborador_data.status

    # Atualiza campos fornecidos
    update_data = colaborador_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_colaborador, key, value)

    db.commit()
    db.refresh(db_colaborador)

    # Auditoria específica para alteração de status
    if novo_status and novo_status != status_anterior:
        event_type = "COLABORADOR_ATIVADO" if novo_status == "Ativo" else "COLABORADOR_INATIVADO"
        log_audit(
            event_type=event_type,
            resource_id=db_colaborador.id,
            message=f"Status do colaborador alterado de {status_anterior} para {novo_status}."
        )
    
    log_audit(
        event_type="COLABORADOR_ATUALIZADO",
        resource_id=db_colaborador.id,
        message=f"Dados do colaborador {db_colaborador.nome} atualizados com sucesso."
    )
    return db_colaborador


# --- SOFTWARES CRUD ---

def get_softwares(db: Session):
    return db.query(models.Software).all()

def create_software(db: Session, software: schemas.SoftwareCreate):
    db_software = models.Software(
        nome_software=software.nome_software,
        categoria=software.categoria,
        tipo_licenca=software.tipo_licenca
    )
    db.add(db_software)
    db.commit()
    db.refresh(db_software)

    log_audit(
        event_type="SOFTWARE_CRIADO",
        resource_id=db_software.id,
        message=f"Software '{db_software.nome_software}' cadastrado na categoria '{db_software.categoria}'."
    )
    return db_software


# --- MATRIZ ACESSOS CRUD ---

def get_acessos(db: Session):
    # Retorna os acessos incluindo os dados do colaborador e software relacionados
    return db.query(models.MatrizAcesso).all()

def create_acesso(db: Session, acesso: schemas.MatrizAcessoCreate):
    # 1. Verifica se colaborador existe
    colab = db.query(models.Colaborador).filter(models.Colaborador.id == acesso.id_colaborador).first()
    if not colab:
        raise ValueError("Colaborador informado não existe.")

    # 2. Verifica se software existe
    soft = db.query(models.Software).filter(models.Software.id == acesso.id_software).first()
    if not soft:
        raise ValueError("Software informado não existe.")

    # 3. Verifica duplicidade de acessos (mesmo software e colaborador)
    acesso_existente = db.query(models.MatrizAcesso).filter(
        models.MatrizAcesso.id_colaborador == acesso.id_colaborador,
        models.MatrizAcesso.id_software == acesso.id_software
    ).first()
    
    if acesso_existente:
        raise ValueError("Este colaborador já possui acesso cadastrado para este software.")

    db_acesso = models.MatrizAcesso(
        id_colaborador=acesso.id_colaborador,
        id_software=acesso.id_software,
        nivel_permissao=acesso.nivel_permissao,
        data_concessao=datetime.utcnow()
    )
    db.add(db_acesso)
    db.commit()
    db.refresh(db_acesso)

    log_audit(
        event_type="ACESSO_CONCEDIDO",
        resource_id=db_acesso.id,
        message=f"Acesso concedido para {colab.nome} no software '{soft.nome_software}' com nível {db_acesso.nivel_permissao}."
    )
    return db_acesso

def revoke_acesso(db: Session, acesso_id: int):
    db_acesso = db.query(models.MatrizAcesso).filter(models.MatrizAcesso.id == acesso_id).first()
    if not db_acesso:
        return False

    colab_nome = db_acesso.colaborador.nome if db_acesso.colaborador else "Desconhecido"
    soft_nome = db_acesso.software.nome_software if db_acesso.software else "Desconhecido"

    db.delete(db_acesso)
    db.commit()

    log_audit(
        event_type="ACESSO_REVOGADO",
        resource_id=acesso_id,
        message=f"Acesso revogado do colaborador {colab_nome} para o software '{soft_nome}'."
    )
    return True


# --- DASHBOARD STATS ---

def get_dashboard_stats(db: Session):
    total_colab = db.query(models.Colaborador).count()
    total_soft = db.query(models.Software).count()
    
    # Acessos ativos = Acessos onde o colaborador está "Ativo"
    acessos_ativos = db.query(models.MatrizAcesso).join(models.Colaborador).filter(
        models.Colaborador.status == "Ativo"
    ).count()

    # Acessos pendentes de revogação = Acessos onde o colaborador está "Inativo"
    acessos_pendentes = db.query(models.MatrizAcesso).join(models.Colaborador).filter(
        models.Colaborador.status == "Inativo"
    ).count()

    # Estatísticas de Equipamentos
    total_eq = db.query(models.Equipamento).count()
    eq_estoque = db.query(models.Equipamento).filter(models.Equipamento.status == "Estoque").count()
    eq_uso = db.query(models.Equipamento).filter(models.Equipamento.status == "Em Uso").count()
    eq_devolucao = db.query(models.Equipamento).filter(models.Equipamento.status == "Em Devolução").count()
    eq_nao_encontrado = db.query(models.Equipamento).filter(models.Equipamento.status == "Não Encontrado").count()

    return {
        "total_colaboradores": total_colab,
        "total_softwares": total_soft,
        "acessos_ativos": acessos_ativos,
        "acessos_pendentes_revogacao": acessos_pendentes,
        "total_equipamentos": total_eq,
        "equipamentos_estoque": eq_estoque,
        "equipamentos_uso": eq_uso,
        "equipamentos_devolucao": eq_devolucao,
        "equipamentos_nao_encontrado": eq_nao_encontrado
    }


# --- EQUIPAMENTOS CRUD ---

def get_equipamento_by_tag(db: Session, tag: str):
    return db.query(models.Equipamento).filter(models.Equipamento.tag == tag).first()

def get_equipamentos(db: Session, search: str = None, status: str = None):
    query = db.query(models.Equipamento)
    if status:
        query = query.filter(models.Equipamento.status == status)
    if search:
        query = query.filter(
            or_(
                models.Equipamento.tag.ilike(f"%{search}%"),
                models.Equipamento.codigo_maquina.ilike(f"%{search}%"),
                models.Equipamento.fabricante.ilike(f"%{search}%"),
                models.Equipamento.modelo.ilike(f"%{search}%"),
                models.Equipamento.numero_serie.ilike(f"%{search}%")
            )
        )
    return query.all()

def create_equipamento(db: Session, equipamento: schemas.EquipamentoCreate):
    # Verifica tag duplicada
    db_eq = get_equipamento_by_tag(db, tag=equipamento.tag)
    if db_eq:
        raise ValueError("Tag de patrimônio já cadastrada.")

    # Se id_colaborador for fornecido, verifica se existe
    if equipamento.id_colaborador:
        colab = db.query(models.Colaborador).filter(models.Colaborador.id == equipamento.id_colaborador).first()
        if not colab:
            raise ValueError("Colaborador informado não existe.")

    db_equipamento = models.Equipamento(
        tag=equipamento.tag,
        codigo_maquina=equipamento.codigo_maquina,
        fabricante=equipamento.fabricante,
        modelo=equipamento.modelo,
        numero_serie=equipamento.numero_serie,
        tipo_equipamento=equipamento.tipo_equipamento,
        sistema_operacional=equipamento.sistema_operacional,
        processador=equipamento.processador,
        memoria=equipamento.memoria,
        status=equipamento.status,
        id_colaborador=equipamento.id_colaborador
    )
    db.add(db_equipamento)
    db.commit()
    db.refresh(db_equipamento)

    log_audit(
        event_type="EQUIPAMENTO_CRIADO",
        resource_id=db_equipamento.id,
        message=f"Equipamento '{db_equipamento.fabricante} {db_equipamento.modelo}' (Tag: {db_equipamento.tag}) cadastrado com sucesso."
    )
    return db_equipamento

def update_equipamento(db: Session, equipamento_id: int, equipamento_data: schemas.EquipamentoUpdate):
    db_equipamento = db.query(models.Equipamento).filter(models.Equipamento.id == equipamento_id).first()
    if not db_equipamento:
        return None

    # Se estiver alterando a tag, verifica duplicidade
    if equipamento_data.tag and equipamento_data.tag != db_equipamento.tag:
        tag_exists = get_equipamento_by_tag(db, equipamento_data.tag)
        if tag_exists:
            raise ValueError("A nova tag já está cadastrada em outro equipamento.")

    # Se estiver vinculando ou alterando colaborador
    colab_alterado = False
    novo_colab_id = equipamento_data.id_colaborador
    antigo_colab_id = db_equipamento.id_colaborador

    if novo_colab_id is not None and novo_colab_id != antigo_colab_id:
        if novo_colab_id == -1 or novo_colab_id == 0:  # Representação de desvincular
            equipamento_data.id_colaborador = None
            colab_alterado = True
        else:
            colab = db.query(models.Colaborador).filter(models.Colaborador.id == novo_colab_id).first()
            if not colab:
                raise ValueError("Colaborador informado não existe.")
            colab_alterado = True

    status_anterior = db_equipamento.status
    novo_status = equipamento_data.status

    # Atualiza
    update_data = equipamento_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "id_colaborador" and (value == -1 or value == 0):
            setattr(db_equipamento, key, None)
        else:
            setattr(db_equipamento, key, value)

    db.commit()
    db.refresh(db_equipamento)

    # Logs de Auditoria
    if colab_alterado:
        if db_equipamento.id_colaborador:
            colab_nome = db_equipamento.colaborador.nome if db_equipamento.colaborador else "Desconhecido"
            log_audit(
                event_type="EQUIPAMENTO_VINCULADO",
                resource_id=db_equipamento.id,
                message=f"Equipamento Tag {db_equipamento.tag} vinculado ao colaborador {colab_nome}."
            )
        else:
            log_audit(
                event_type="EQUIPAMENTO_DESVINCULADO",
                resource_id=db_equipamento.id,
                message=f"Equipamento Tag {db_equipamento.tag} desvinculado do colaborador anterior."
            )

    if novo_status and novo_status != status_anterior:
        log_audit(
            event_type="EQUIPAMENTO_STATUS_ALTERADO",
            resource_id=db_equipamento.id,
            message=f"Status do equipamento Tag {db_equipamento.tag} alterado de {status_anterior} para {novo_status}."
        )

    log_audit(
        event_type="EQUIPAMENTO_ATUALIZADO",
        resource_id=db_equipamento.id,
        message=f"Dados do equipamento Tag {db_equipamento.tag} atualizados com sucesso."
    )
    return db_equipamento

def delete_equipamento(db: Session, equipamento_id: int):
    db_equipamento = db.query(models.Equipamento).filter(models.Equipamento.id == equipamento_id).first()
    if not db_equipamento:
        return False

    tag = db_equipamento.tag
    desc = f"{db_equipamento.fabricante} {db_equipamento.modelo}"

    db.delete(db_equipamento)
    db.commit()

    log_audit(
        event_type="EQUIPAMENTO_DELETADO",
        resource_id=equipamento_id,
        message=f"Equipamento '{desc}' (Tag: {tag}) deletado do inventário."
    )
    return True

