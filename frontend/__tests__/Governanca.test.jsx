import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Governanca from "../src/pages/Governanca";
import { api } from "../src/utils/api";

// Mock da API para controle isolado de respostas
jest.mock("../src/utils/api", () => ({
  api: {
    getAcessos: jest.fn(),
    getColaboradores: jest.fn(),
    getSoftwares: jest.fn(),
    createAcesso: jest.fn(),
    revokeAcesso: jest.fn(),
  },
}));

describe("Módulo de Governança e Matriz de Acessos", () => {
  const mockColaboradores = [
    { id: 1, nome: "João Silva", email: "joao@empresa.com", cargo: "Analista", departamento: "TI", status: "Ativo" },
    { id: 2, nome: "Maria Souza", email: "maria@empresa.com", cargo: "Gerente", departamento: "RH", status: "Inativo" },
  ];

  const mockSoftwares = [
    { id: 1, nome_software: "Slack", categoria: "Comunicação", tipo_licenca: "Pro" },
  ];

  const mockAcessos = [
    {
      id: 10,
      nivel_permissao: "Admin",
      data_concessao: "2026-05-20T10:00:00.000Z",
      colaborador: mockColaboradores[0],
      software: mockSoftwares[0],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getColaboradores.mockResolvedValue(mockColaboradores);
    api.getSoftwares.mockResolvedValue(mockSoftwares);
    api.getAcessos.mockResolvedValue(mockAcessos);
  });

  test("Deve renderizar o formulário de concessão de acesso e a tabela da matriz", async () => {
    render(<Governanca />);

    // Verifica se carrega os dados nos cabeçalhos e formulários
    expect(screen.getByText("Conceder Novo Acesso")).toBeInTheDocument();

    // Aguarda o encerramento do loading e renderização dos dados na tabela usando findByText com timeout de aquecimento
    const colabName = await screen.findByText("João Silva", {}, { timeout: 4000 });
    expect(colabName).toBeInTheDocument();

    expect(screen.getByText("Matriz de Acessos Ativos")).toBeInTheDocument();
    expect(screen.getByText("Slack")).toBeInTheDocument();
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
  });

  test("Deve conter dropdowns com opções válidas de colaboradores e softwares", async () => {
    render(<Governanca />);

    await waitFor(() => {
      const selectColab = screen.getByLabelText("1. Selecionar Colaborador");
      const selectSoft = screen.getByLabelText("2. Selecionar Software");
      
      expect(selectColab).toBeInTheDocument();
      expect(selectSoft).toBeInTheDocument();
    });
  });

  test("Deve tentar submeter o formulário chamando a API de vínculo", async () => {
    api.createAcesso.mockResolvedValue({ id: 99, id_colaborador: 1, id_software: 1, nivel_permissao: "Escrita" });
    
    render(<Governanca />);

    // Espera os dropdowns carregarem na tela (fim do loading)
    const selectColab = await screen.findByLabelText("1. Selecionar Colaborador");
    const selectSoft = await screen.findByLabelText("2. Selecionar Software");
    const btnGrant = screen.getByRole("button", { name: /Conceder Acesso/i });

    // Simula seleção do colaborador Ativo
    fireEvent.change(selectColab, { target: { value: "1" } });
    // Simula seleção do software
    fireEvent.change(selectSoft, { target: { value: "1" } });

    // Dispara a submissão
    fireEvent.click(btnGrant);

    await waitFor(() => {
      // Verifica se a API de criação de acesso foi disparada com os IDs parsed
      expect(api.createAcesso).toHaveBeenCalledWith({
        id_colaborador: 1,
        id_software: 1,
        nivel_permissao: "Leitura", // valor padrão
      });
    });
  });
});
