from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# --- COLABORADOR SCHEMAS ---
class ColaboradorBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    cargo: str = Field(..., min_length=2, max_length=100)
    departamento: str = Field(..., min_length=2, max_length=100)
    status: str = Field("Ativo", pattern="^(Ativo|Inativo)$")

class ColaboradorCreate(ColaboradorBase):
    pass

class ColaboradorUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    cargo: Optional[str] = Field(None, min_length=2, max_length=100)
    departamento: Optional[str] = Field(None, min_length=2, max_length=100)
    status: Optional[str] = Field(None, pattern="^(Ativo|Inativo)$")

class ColaboradorResponse(ColaboradorBase):
    id: int

    class Config:
        from_attributes = True


# --- SOFTWARE SCHEMAS ---
class SoftwareBase(BaseModel):
    nome_software: str = Field(..., min_length=1, max_length=100)
    categoria: str = Field(..., min_length=2, max_length=100)
    tipo_licenca: str = Field(..., min_length=2, max_length=100)

class SoftwareCreate(SoftwareBase):
    pass

class SoftwareResponse(SoftwareBase):
    id: int

    class Config:
        from_attributes = True


# --- MATRIZ ACESSO SCHEMAS ---
class MatrizAcessoBase(BaseModel):
    nivel_permissao: str = Field(..., pattern="^(Leitura|Escrita|Admin|Dono)$")

class MatrizAcessoCreate(MatrizAcessoBase):
    id_colaborador: int
    id_software: int

class MatrizAcessoSimpleResponse(MatrizAcessoBase):
    id: int
    id_colaborador: int
    id_software: int
    data_concessao: datetime

    class Config:
        from_attributes = True

# Resposta detalhada trazendo dados aninhados
class MatrizAcessoDetailedResponse(BaseModel):
    id: int
    nivel_permissao: str
    data_concessao: datetime
    colaborador: ColaboradorResponse
    software: SoftwareResponse

    class Config:
        from_attributes = True


# --- DASHBOARD STATS SCHEMA ---
class DashboardStatsResponse(BaseModel):
    total_colaboradores: int
    total_softwares: int
    acessos_ativos: int
    acessos_pendentes_revogacao: int
    total_equipamentos: int
    equipamentos_estoque: int
    equipamentos_uso: int
    equipamentos_devolucao: int
    equipamentos_nao_encontrado: int


# --- EQUIPAMENTO SCHEMAS ---
class EquipamentoBase(BaseModel):
    tag: str = Field(..., min_length=2, max_length=50)
    codigo_maquina: str = Field(..., min_length=2, max_length=50)
    fabricante: str = Field(..., min_length=2, max_length=100)
    modelo: str = Field(..., min_length=2, max_length=100)
    numero_serie: str = Field(..., min_length=2, max_length=100)
    tipo_equipamento: str = Field(..., pattern="^(Notebook|Desktop|Monitor|Teclado|Outro)$")
    sistema_operacional: Optional[str] = None
    processador: Optional[str] = None
    memoria: Optional[str] = None
    status: str = Field("Estoque", pattern="^(Estoque|Em Uso|Em Devolução|Não Encontrado)$")

class EquipamentoCreate(EquipamentoBase):
    id_colaborador: Optional[int] = None

class EquipamentoUpdate(BaseModel):
    tag: Optional[str] = Field(None, min_length=2, max_length=50)
    codigo_maquina: Optional[str] = Field(None, min_length=2, max_length=50)
    fabricante: Optional[str] = Field(None, min_length=2, max_length=100)
    modelo: Optional[str] = Field(None, min_length=2, max_length=100)
    numero_serie: Optional[str] = Field(None, min_length=2, max_length=100)
    tipo_equipamento: Optional[str] = Field(None, pattern="^(Notebook|Desktop|Monitor|Teclado|Outro)$")
    sistema_operacional: Optional[str] = None
    processador: Optional[str] = None
    memoria: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(Estoque|Em Uso|Em Devolução|Não Encontrado)$")
    id_colaborador: Optional[int] = None

class EquipamentoResponse(EquipamentoBase):
    id: int
    id_colaborador: Optional[int] = None

    class Config:
        from_attributes = True

class EquipamentoDetailedResponse(EquipamentoBase):
    id: int
    id_colaborador: Optional[int] = None
    colaborador: Optional[ColaboradorResponse] = None

    class Config:
        from_attributes = True

