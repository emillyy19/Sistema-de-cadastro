-- Esquema de Banco de Dados compatível com PostgreSQL / Supabase
-- Sistema de Governança de TI, Acessos e Equipamentos (GOV-IT)

-- 1. Criação da tabela de Colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo'))
);

-- 2. Criação da tabela de Softwares
CREATE TABLE IF NOT EXISTS softwares (
    id SERIAL PRIMARY KEY,
    nome_software VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    tipo_licenca VARCHAR(100) NOT NULL
);

-- 3. Criação da tabela da Matriz de Acessos
CREATE TABLE IF NOT EXISTS matriz_acessos (
    id SERIAL PRIMARY KEY,
    id_colaborador INT NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    id_software INT NOT NULL REFERENCES softwares(id) ON DELETE CASCADE,
    nivel_permissao VARCHAR(20) NOT NULL CHECK (nivel_permissao IN ('Leitura', 'Escrita', 'Admin', 'Dono')),
    data_concessao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Criação da tabela de Equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(50) UNIQUE NOT NULL,
    codigo_maquina VARCHAR(50) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL,
    tipo_equipamento VARCHAR(20) NOT NULL CHECK (tipo_equipamento IN ('Notebook', 'Desktop', 'Monitor', 'Teclado', 'Outro')),
    sistema_operacional VARCHAR(100),
    processador VARCHAR(100),
    memoria VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Estoque' CHECK (status IN ('Estoque', 'Em Uso', 'Em Devolução', 'Não Encontrado')),
    id_colaborador INT REFERENCES colaboradores(id) ON DELETE SET NULL
);

-- Índices recomendados para otimização de buscas no Supabase
CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores(nome);
CREATE INDEX IF NOT EXISTS idx_equipamentos_tag ON equipamentos(tag);
CREATE INDEX IF NOT EXISTS idx_matriz_acessos_colab ON matriz_acessos(id_colaborador);
CREATE INDEX IF NOT EXISTS idx_matriz_acessos_soft ON matriz_acessos(id_software);
