from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Colaborador(Base):
    __tablename__ = "colaboradores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    cargo = Column(String, nullable=False)
    departamento = Column(String, nullable=False)
    status = Column(String, default="Ativo", nullable=False)  # "Ativo" ou "Inativo"

    # Relacionamentos
    acessos = relationship("MatrizAcesso", back_populates="colaborador", cascade="all, delete-orphan")
    equipamentos = relationship("Equipamento", back_populates="colaborador")

class Software(Base):
    __tablename__ = "softwares"

    id = Column(Integer, primary_key=True, index=True)
    nome_software = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    tipo_licenca = Column(String, nullable=False)

    # Relacionamentos
    acessos = relationship("MatrizAcesso", back_populates="software", cascade="all, delete-orphan")

class MatrizAcesso(Base):
    __tablename__ = "matriz_acessos"

    id = Column(Integer, primary_key=True, index=True)
    id_colaborador = Column(Integer, ForeignKey("colaboradores.id"), nullable=False)
    id_software = Column(Integer, ForeignKey("softwares.id"), nullable=False)
    nivel_permissao = Column(String, nullable=False)  # "Leitura", "Escrita", "Admin", "Dono"
    data_concessao = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    colaborador = relationship("Colaborador", back_populates="acessos")
    software = relationship("Software", back_populates="acessos")

class Equipamento(Base):
    __tablename__ = "equipamentos"

    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String, unique=True, index=True, nullable=False)
    codigo_maquina = Column(String, nullable=False)
    fabricante = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    numero_serie = Column(String, nullable=False)
    tipo_equipamento = Column(String, nullable=False)  # "Notebook", "Desktop", "Monitor", "Outro"
    sistema_operacional = Column(String, nullable=True)
    processador = Column(String, nullable=True)
    memoria = Column(String, nullable=True)
    status = Column(String, default="Estoque", nullable=False)  # "Estoque", "Em Uso", "Em Devolução", "Não Encontrado"
    id_colaborador = Column(Integer, ForeignKey("colaboradores.id"), nullable=True)

    # Relacionamentos
    colaborador = relationship("Colaborador", back_populates="equipamentos")

