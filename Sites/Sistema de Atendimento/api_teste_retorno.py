from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

app = FastAPI(
    title="Sistema de Gerenciamento de Projetos Fake",
    description="API fake com mais de 100 linhas contendo rotinas CRUD completas para usuários e tarefas.",
    version="1.0.0"
)

# --- ENUMS ---
class StatusTarefa(str, Enum):
    pendente = "pendente"
    em_andamento = "em_andamento"
    concluida = "concluida"

class PapelUsuario(str, Enum):
    admin = "admin"
    desenvolvedor = "desenvolvedor"
    gerente = "gerente"

# --- MODELOS ---
class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^\S+@\S+\.\S+$")
    papel: PapelUsuario

class UsuarioCriar(UsuarioBase):
    senha: str = Field(..., min_length=6)

class UsuarioResposta(UsuarioBase):
    id: int
    data_criacao: datetime

class TarefaBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=100)
    descricao: Optional[str] = None
    status: StatusTarefa = StatusTarefa.pendente
    usuario_id: Optional[int] = None

class TarefaCriar(TarefaBase):
    pass

class TarefaResposta(TarefaBase):
    id: int
    data_criacao: datetime

# --- BANCO DE DADOS EM MEMÓRIA ---
db_usuarios = [
    {
        "id": 1,
        "nome": "Alice Silva",
        "email": "alice@exemplo.com",
        "senha": "senha_segura",
        "papel": PapelUsuario.admin,
        "data_criacao": datetime(2023, 1, 15, 10, 0, 0)
    },
    {
        "id": 2,
        "nome": "Bob Souza",
        "email": "bob@exemplo.com",
        "senha": "outra_senha",
        "papel": PapelUsuario.desenvolvedor,
        "data_criacao": datetime(2023, 2, 20, 14, 30, 0)
    }
]

db_tarefas = [
    {
        "id": 1,
        "titulo": "Configurar ambiente",
        "descricao": "Instalar dependências do projeto e docker",
        "status": StatusTarefa.concluida,
        "usuario_id": 2,
        "data_criacao": datetime(2023, 3, 1, 9, 0, 0)
    },
    {
        "id": 2,
        "titulo": "Criar API REST",
        "descricao": "Desenvolver endpoints CRUD utilizando FastAPI",
        "status": StatusTarefa.em_andamento,
        "usuario_id": 2,
        "data_criacao": datetime(2023, 3, 5, 11, 15, 0)
    }
]

# --- UTILITÁRIOS ---
def gerar_novo_id(banco_de_dados: list) -> int:
    if not banco_de_dados:
        return 1
    return max(item["id"] for item in banco_de_dados) + 1

# --- ENDPOINTS DE USUÁRIOS ---
@app.get("/usuarios", response_model=List[UsuarioResposta], tags=["Usuários"])
def listar_usuarios():
    return db_usuarios

@app.get("/usuarios/{usuario_id}", response_model=UsuarioResposta, tags=["Usuários"])
def obter_usuario(usuario_id: int):
    for usuario in db_usuarios:
        if usuario["id"] == usuario_id:
            return usuario
    raise HTTPException(status_code=404, detail="Usuário não encontrado")

@app.post("/usuarios", response_model=UsuarioResposta, status_code=status.HTTP_201_CREATED, tags=["Usuários"])
def criar_usuario(usuario: UsuarioCriar):
    novo_usuario = usuario.model_dump()
    novo_usuario["id"] = gerar_novo_id(db_usuarios)
    novo_usuario["data_criacao"] = datetime.now()
    db_usuarios.append(novo_usuario)
    return novo_usuario

@app.put("/usuarios/{usuario_id}", response_model=UsuarioResposta, tags=["Usuários"])
def atualizar_usuario(usuario_id: int, dados_atualizados: UsuarioCriar):
    for i, usuario in enumerate(db_usuarios):
        if usuario["id"] == usuario_id:
            usuario_atualizado = dados_atualizados.model_dump()
            usuario_atualizado["id"] = usuario_id
            usuario_atualizado["data_criacao"] = usuario["data_criacao"]
            db_usuarios[i] = usuario_atualizado
            return usuario_atualizado
    raise HTTPException(status_code=404, detail="Usuário não encontrado")

@app.delete("/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Usuários"])
def deletar_usuario(usuario_id: int):
    for i, usuario in enumerate(db_usuarios):
        if usuario["id"] == usuario_id:
            del db_usuarios[i]
            return
    raise HTTPException(status_code=404, detail="Usuário não encontrado")

# --- ENDPOINTS DE TAREFAS ---
@app.get("/tarefas", response_model=List[TarefaResposta], tags=["Tarefas"])
def listar_tarefas():
    return db_tarefas

@app.get("/tarefas/{tarefa_id}", response_model=TarefaResposta, tags=["Tarefas"])
def obter_tarefa(tarefa_id: int):
    for tarefa in db_tarefas:
        if tarefa["id"] == tarefa_id:
            return tarefa
    raise HTTPException(status_code=404, detail="Tarefa não encontrada")

@app.post("/tarefas", response_model=TarefaResposta, status_code=status.HTTP_201_CREATED, tags=["Tarefas"])
def criar_tarefa(tarefa: TarefaCriar):
    if tarefa.usuario_id is not None:
        usuario_existe = any(u["id"] == tarefa.usuario_id for u in db_usuarios)
        if not usuario_existe:
            raise HTTPException(status_code=400, detail="ID de usuário inválido")
            
    nova_tarefa = tarefa.model_dump()
    nova_tarefa["id"] = gerar_novo_id(db_tarefas)
    nova_tarefa["data_criacao"] = datetime.now()
    db_tarefas.append(nova_tarefa)
    return nova_tarefa

@app.put("/tarefas/{tarefa_id}", response_model=TarefaResposta, tags=["Tarefas"])
def atualizar_tarefa(tarefa_id: int, dados_atualizados: TarefaCriar):
    if dados_atualizados.usuario_id is not None:
        usuario_existe = any(u["id"] == dados_atualizados.usuario_id for u in db_usuarios)
        if not usuario_existe:
            raise HTTPException(status_code=400, detail="ID de usuário inválido")

    for i, tarefa in enumerate(db_tarefas):
        if tarefa["id"] == tarefa_id:
            tarefa_atualizada = dados_atualizados.model_dump()
            tarefa_atualizada["id"] = tarefa_id
            tarefa_atualizada["data_criacao"] = tarefa["data_criacao"]
            db_tarefas[i] = tarefa_atualizada
            return tarefa_atualizada
    raise HTTPException(status_code=404, detail="Tarefa não encontrada")

@app.delete("/tarefas/{tarefa_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Tarefas"])
def deletar_tarefa(tarefa_id: int):
    for i, tarefa in enumerate(db_tarefas):
        if tarefa["id"] == tarefa_id:
            del db_tarefas[i]
            return
    raise HTTPException(status_code=404, detail="Tarefa não encontrada")