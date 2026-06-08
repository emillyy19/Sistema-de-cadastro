import pytest

def test_create_colaborador_success(client):
    response = client.post(
        "/api/colaboradores",
        json={
            "nome": "João Silva",
            "email": "joao.silva@empresa.com",
            "cargo": "Analista de Segurança",
            "departamento": "Segurança da Informação",
            "status": "Ativo"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "João Silva"
    assert data["email"] == "joao.silva@empresa.com"
    assert data["id"] is not None

def test_create_colaborador_duplicate_email_failure(client):
    # Cria o primeiro
    client.post(
        "/api/colaboradores",
        json={
            "nome": "Maria Santos",
            "email": "maria.santos@empresa.com",
            "cargo": "Desenvolvedora",
            "departamento": "TI",
            "status": "Ativo"
        }
    )
    # Tenta criar o segundo com mesmo e-mail
    response = client.post(
        "/api/colaboradores",
        json={
            "nome": "Maria Souza",
            "email": "maria.santos@empresa.com",
            "cargo": "Gerente de Projetos",
            "departamento": "PMO",
            "status": "Ativo"
        }
    )
    assert response.status_code == 400
    assert "E-mail de colaborador já cadastrado" in response.json()["detail"]

def test_concessao_acesso_valido(client):
    # 1. Cria Colaborador
    colab_res = client.post(
        "/api/colaboradores",
        json={
            "nome": "Carlos Souza",
            "email": "carlos.souza@empresa.com",
            "cargo": "UX Designer",
            "departamento": "Design",
            "status": "Ativo"
        }
    )
    colab_id = colab_res.json()["id"]

    # 2. Cria Software
    soft_res = client.post(
        "/api/softwares",
        json={
            "nome_software": "Figma",
            "categoria": "Design",
            "tipo_licenca": "Premium"
        }
    )
    soft_id = soft_res.json()["id"]

    # 3. Concede acesso
    acesso_res = client.post(
        "/api/acessos",
        json={
            "id_colaborador": colab_id,
            "id_software": soft_id,
            "nivel_permissao": "Admin"
        }
    )
    assert acesso_res.status_code == 201
    data = acesso_res.json()
    assert data["id_colaborador"] == colab_id
    assert data["id_software"] == soft_id
    assert data["nivel_permissao"] == "Admin"

def test_concessao_acesso_duplicado_failure(client):
    # 1. Cria Colaborador
    colab_res = client.post(
        "/api/colaboradores",
        json={
            "nome": "Ana Lima",
            "email": "ana.lima@empresa.com",
            "cargo": "CFO",
            "departamento": "Financeiro",
            "status": "Ativo"
        }
    )
    colab_id = colab_res.json()["id"]

    # 2. Cria Software
    soft_res = client.post(
        "/api/softwares",
        json={
            "nome_software": "SAP",
            "categoria": "ERP",
            "tipo_licenca": "Corporativa"
        }
    )
    soft_id = soft_res.json()["id"]

    # 3. Concede primeiro acesso
    acesso_res1 = client.post(
        "/api/acessos",
        json={
            "id_colaborador": colab_id,
            "id_software": soft_id,
            "nivel_permissao": "Leitura"
        }
    )
    assert acesso_res1.status_code == 201

    # 4. Tenta conceder segundo acesso idêntico
    acesso_res2 = client.post(
        "/api/acessos",
        json={
            "id_colaborador": colab_id,
            "id_software": soft_id,
            "nivel_permissao": "Escrita"
        }
    )
    assert acesso_res2.status_code == 400
    assert "já possui acesso cadastrado para este software" in acesso_res2.json()["detail"]

def test_create_equipamento_success(client):
    response = client.post(
        "/api/equipamentos",
        json={
            "tag": "PAT-2026-X1",
            "codigo_maquina": "MAQ-NB-99",
            "fabricante": "Dell",
            "modelo": "Latitude 5430",
            "numero_serie": "SNDELL9988",
            "tipo_equipamento": "Notebook",
            "sistema_operacional": "Windows 11 Pro",
            "processador": "Intel Core i7",
            "memoria": "16GB DDR4",
            "status": "Estoque"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["tag"] == "PAT-2026-X1"
    assert data["status"] == "Estoque"
    assert data["id"] is not None

def test_create_equipamento_duplicate_tag_failure(client):
    # Cria o primeiro
    client.post(
        "/api/equipamentos",
        json={
            "tag": "PAT-2026-X2",
            "codigo_maquina": "MAQ-NB-100",
            "fabricante": "Dell",
            "modelo": "Latitude 5430",
            "numero_serie": "SNDELL9988",
            "tipo_equipamento": "Notebook",
            "status": "Estoque"
        }
    )
    # Tenta criar o segundo com a mesma tag
    response = client.post(
        "/api/equipamentos",
        json={
            "tag": "PAT-2026-X2",
            "codigo_maquina": "MAQ-NB-101",
            "fabricante": "Lenovo",
            "modelo": "ThinkPad L14",
            "numero_serie": "SNLENOVO11",
            "tipo_equipamento": "Notebook",
            "status": "Estoque"
        }
    )
    assert response.status_code == 400
    assert "Tag de patrimônio já cadastrada" in response.json()["detail"]

def test_update_equipamento_allocation(client):
    # 1. Cria Colaborador
    colab_res = client.post(
        "/api/colaboradores",
        json={
            "nome": "Carla Lima",
            "email": "carla@empresa.com",
            "cargo": "DevOps Engineer",
            "departamento": "TI",
            "status": "Ativo"
        }
    )
    colab_id = colab_res.json()["id"]

    # 2. Cria Equipamento
    eq_res = client.post(
        "/api/equipamentos",
        json={
            "tag": "PAT-2026-X3",
            "codigo_maquina": "MAQ-NB-102",
            "fabricante": "Apple",
            "modelo": "MacBook Pro M2",
            "numero_serie": "SNAPPM222",
            "tipo_equipamento": "Notebook",
            "status": "Estoque"
        }
    )
    eq_id = eq_res.json()["id"]

    # 3. Vincula ao Colaborador e altera status para Em Uso
    update_res = client.put(
        f"/api/equipamentos/{eq_id}",
        json={
            "status": "Em Uso",
            "id_colaborador": colab_id
        }
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["status"] == "Em Uso"
    assert data["id_colaborador"] == colab_id

