from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import engine, Base, get_db
from . import crud, schemas, models

# Cria as tabelas no banco de dados SQLite caso não existam
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Governança de TI e Matriz de Acessos",
    description="API para gerenciar colaboradores, softwares e concessão/revogação de acessos.",
    version="1.0.0"
)

# Configuração de CORS para permitir acesso do Frontend (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique as origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API de Governança de TI ativa e operacional!"}


# --- ENDPOINTS: COLABORADORES ---

@app.get("/api/colaboradores", response_model=List[schemas.ColaboradorResponse])
def read_colaboradores(search: str = None, db: Session = Depends(get_db)):
    return crud.get_colaboradores(db, search=search)

@app.post("/api/colaboradores", response_model=schemas.ColaboradorResponse, status_code=status.HTTP_201_CREATED)
def create_colaborador(colaborador: schemas.ColaboradorCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_colaborador(db, colaborador=colaborador)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.put("/api/colaboradores/{colaborador_id}", response_model=schemas.ColaboradorResponse)
def update_colaborador(colaborador_id: int, colaborador_data: schemas.ColaboradorUpdate, db: Session = Depends(get_db)):
    try:
        updated_colab = crud.update_colaborador(db, colaborador_id=colaborador_id, colaborador_data=colaborador_data)
        if not updated_colab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado.")
        return updated_colab
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# --- ENDPOINTS: SOFTWARES ---

@app.get("/api/softwares", response_model=List[schemas.SoftwareResponse])
def read_softwares(db: Session = Depends(get_db)):
    return crud.get_softwares(db)

@app.post("/api/softwares", response_model=schemas.SoftwareResponse, status_code=status.HTTP_201_CREATED)
def create_software(software: schemas.SoftwareCreate, db: Session = Depends(get_db)):
    return crud.create_software(db, software=software)


# --- ENDPOINTS: MATRIZ DE ACESSOS ---

@app.get("/api/acessos", response_model=List[schemas.MatrizAcessoDetailedResponse])
def read_acessos(db: Session = Depends(get_db)):
    return crud.get_acessos(db)

@app.post("/api/acessos", response_model=schemas.MatrizAcessoSimpleResponse, status_code=status.HTTP_201_CREATED)
def create_acesso(acesso: schemas.MatrizAcessoCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_acesso(db, acesso=acesso)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.delete("/api/acessos/{acesso_id}", status_code=status.HTTP_200_OK)
def delete_acesso(acesso_id: int, db: Session = Depends(get_db)):
    success = crud.revoke_acesso(db, acesso_id=acesso_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Acesso não encontrado ou já revogado.")
    return {"message": "Acesso revogado com sucesso.", "acesso_id": acesso_id}


# --- ENDPOINTS: DASHBOARD ---

@app.get("/api/dashboard/stats", response_model=schemas.DashboardStatsResponse)
def read_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


# --- ENDPOINTS: EQUIPAMENTOS ---

@app.get("/api/equipamentos", response_model=List[schemas.EquipamentoDetailedResponse])
def read_equipamentos(search: str = None, status: str = None, db: Session = Depends(get_db)):
    return crud.get_equipamentos(db, search=search, status=status)

@app.post("/api/equipamentos", response_model=schemas.EquipamentoResponse, status_code=status.HTTP_201_CREATED)
def create_equipamento(equipamento: schemas.EquipamentoCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_equipamento(db, equipamento=equipamento)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.put("/api/equipamentos/{equipamento_id}", response_model=schemas.EquipamentoResponse)
def update_equipamento(equipamento_id: int, equipamento_data: schemas.EquipamentoUpdate, db: Session = Depends(get_db)):
    try:
        updated = crud.update_equipamento(db, equipamento_id=equipamento_id, equipamento_data=equipamento_data)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipamento não encontrado.")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.delete("/api/equipamentos/{equipamento_id}", status_code=status.HTTP_200_OK)
def delete_equipamento(equipamento_id: int, db: Session = Depends(get_db)):
    success = crud.delete_equipamento(db, equipamento_id=equipamento_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipamento não encontrado.")
    return {"message": "Equipamento deletado com sucesso.", "equipamento_id": equipamento_id}

