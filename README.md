# GOV-IT - Sistema de Governança de TI e Matriz de Acessos

Este é um sistema robusto e moderno de **Governança de TI e Controle de Acessos** corporativos. Ele permite mapear colaboradores, catalogar softwares licenciados pela empresa e controlar ativamente a concessão e revogação de acessos, com foco total em segurança, logs de auditoria e conformidade.

---

## 🚀 Tecnologias Utilizadas

-   **Backend:** Python 3.10 + FastAPI (RESTful API de alta performance)
-   **ORM & Banco de Dados:** SQLAlchemy + SQLite (Banco relacional leve e portátil)
-   **Frontend:** React 19 + Vite + Tailwind CSS (Interface administrativa responsiva, glassmorphism e paleta dark premium)
-   **Ícones:** Lucide React
-   **Infraestrutura:** Docker e Docker Compose (Orquestração completa)
-   **Testes Automatizados:** Pytest (Backend) & Jest + React Testing Library (Frontend)

---

## 🛠️ Arquitetura do Sistema e Banco de Dados

O banco de dados relacional (SQLite) foi modelado com três entidades estruturadas:

1.  **Colaboradores:** Gerencia dados de funcionários (Nome, E-mail, Cargo, Departamento) e o estado ativo (`Ativo` ou `Inativo`).
2.  **Softwares/Ferramentas:** Catálogo de sistemas corporativos, categorizados por área (ex: Desenvolvimento, RH, Finanças) e tipo de licenciamento.
3.  **Matriz de Acessos:** Tabela associativa (Nível de Permissão, Data de Concessão) que liga Colaboradores e Softwares.

### Regras de Negócio e Governança Implantadas:
-   **Prevenção de Duplicidade:** O sistema impede que o mesmo software seja associado mais de uma vez para o mesmo colaborador (bloqueio nativo no backend e aviso no frontend).
-   **Bloqueio de Novos Acessos a Inativos:** Não é permitido conceder novos acessos a colaboradores que estejam com status `Inativo`.
-   **Triagem e Risco ("Pendente de Revogação"):** Se um colaborador for inativado no painel, a matriz de acessos destaca visualmente seus acessos vigentes como ⚠️ **"Pendente de Revogação"** com efeito pulsante de atenção, e fornece um botão vermelho de ação prioritária de revogação para a equipe de DevOps/TI.

---

## 📊 Sistema de Auditoria (Logs Estruturados)

Cada modificação crítica no sistema gera registros de logs estruturados em tempo real, gravados tanto no console (stdout do Docker) quanto no arquivo persistente `backend/logs/audit.log`.

**Formato do Log:**
`[TIMESTAMP] - LEVEL - EVENT: [EVENT_TYPE] - RESOURCE_ID: [ID] - DETAILS: [Mensagem explicativa]`

### Principais Eventos Mapeados:
-   `COLABORADOR_CRIADO`
-   `COLABORADOR_ATUALIZADO`
-   `COLABORADOR_INATIVADO` / `COLABORADOR_ATIVADO`
-   `SOFTWARE_CRIADO`
-   `ACESSO_CONCEDIDO`
-   `ACESSO_REVOGADO`

---

## ⚡ Como Rodar a Aplicação

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Iniciar os Containers (Backend e Frontend)
Na raiz do projeto (onde está o arquivo `docker-compose.yml`), execute o comando abaixo:

```bash
docker-compose up --build
```

Este comando irá:
1. Instalar as dependências do backend Python, executar a suíte de testes do `pytest` automática, e iniciar o servidor FastAPI na porta **8000** (`http://localhost:8000`).
2. Compilar os assets estáticos do React com Vite e servi-los através de um container Nginx otimizado exposto na porta **80** (`http://localhost`).

Para abrir a aplicação administrativa, acesse no seu navegador: **`http://localhost`**

---

## 🧪 Execução de Testes Automatizados

Garantimos estabilidade total ao entregar testes para o Backend e Frontend.

### 1. Testes de Backend (FastAPI + Pytest)
Com o container Docker em execução, dispare o comando abaixo:

```bash
docker-compose exec backend pytest
```

Ou, caso prefira rodar localmente fora do Docker (requer instalar `pip install -r backend/requirements.txt`):
```bash
cd backend
pytest
```

*Os testes de backend cobrem:*
-   Cadastro de colaborador válido e restrição de email duplicado.
-   Vínculo de acesso válido de software.
-   Bloqueio estrito de duplicidade de acesso (mesmo software e usuário).

### 2. Testes de Frontend (React + Jest + RTL)
Para rodar os testes unitários do frontend que simulam a renderização da Matriz de Governança e o preenchimento/disparo do formulário de acesso:

```bash
cd frontend
npm run test
```

*Os testes de frontend cobrem:*
-   Renderização correta de cards e formulários.
-   Dropdowns de colaboradores/softwares contendo dados corretos.
-   Simulação de mock de disparo de API no formulário de concessão de acesso.