import React, { useState, useEffect } from "react";
import { Plus, ShieldAlert, Key, UserMinus, ShieldCheck, Calendar, X, AlertTriangle } from "lucide-react";
import { api } from "../utils/api";

export default function Governanca() {
  const [acessos, setAcessos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [softwares, setSoftwares] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id_colaborador: "",
    id_software: "",
    nivel_permissao: "Leitura",
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [acessosData, colabsData, softsData] = await Promise.all([
        api.getAcessos(),
        api.getColaboradores(),
        api.getSoftwares()
      ]);
      
      setAcessos(acessosData);
      // Filtra apenas colaboradores Ativos para novos vínculos para reforçar governança
      setColaboradores(colabsData);
      setSoftwares(softsData);
    } catch (err) {
      setError("Não foi possível carregar as informações de governança.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Limpa mensagens temporárias
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!formData.id_colaborador || !formData.id_software) {
      setError("Por favor, selecione um colaborador e um software.");
      return;
    }

    // Verifica se o colaborador selecionado é inativo
    const selecionado = colaboradores.find(c => c.id === parseInt(formData.id_colaborador));
    if (selecionado && selecionado.status === "Inativo") {
      setError("Governança TI: Não é permitido conceder novos acessos a colaboradores com status 'Inativo'.");
      return;
    }

    try {
      setError("");
      await api.createAcesso({
        id_colaborador: parseInt(formData.id_colaborador),
        id_software: parseInt(formData.id_software),
        nivel_permissao: formData.nivel_permissao
      });
      setSuccess("Acesso concedido e registrado com sucesso!");
      setFormData({ id_colaborador: "", id_software: "", nivel_permissao: "Leitura" });
      loadAllData();
    } catch (err) {
      setError(err.message || "Falha ao vincular acesso.");
    }
  };

  const handleRevokeAccess = async (acessoId) => {
    if (!window.confirm("Atenção: Tem certeza de que deseja REVOGAR este acesso de software? Esta ação será registrada no histórico de auditoria.")) {
      return;
    }

    try {
      setError("");
      await api.revokeAcesso(acessoId);
      setSuccess("Acesso revogado com sucesso!");
      loadAllData();
    } catch (err) {
      setError(err.message || "Erro ao revogar acesso.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Matriz & Governança de Acessos</h1>
        <p className="mt-2 text-slate-400">Atribuição de permissões de softwares, triagem de segurança e revogação de acessos.</p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-300">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Painel de Vinculação de Acesso */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Key className="text-violet-400" size={20} />
          <h2 className="text-lg font-bold text-white">Conceder Novo Acesso</h2>
        </div>

        <form onSubmit={handleGrantAccess} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Dropdown Colaboradores */}
          <div className="space-y-2">
            <label htmlFor="colaborador-select" className="text-xs font-semibold text-slate-300">1. Selecionar Colaborador</label>
            <select
              id="colaborador-select"
              name="id_colaborador"
              value={formData.id_colaborador}
              onChange={handleInputChange}
              className="w-full glass-input text-sm bg-slate-950"
            >
              <option value="">-- Selecionar --</option>
              {colaboradores.map((colab) => (
                <option 
                  key={colab.id} 
                  value={colab.id}
                  disabled={colab.status === "Inativo"}
                >
                  {colab.nome} {colab.status === "Inativo" ? "(Inativo - Bloqueado)" : `(${colab.cargo})`}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Softwares */}
          <div className="space-y-2">
            <label htmlFor="software-select" className="text-xs font-semibold text-slate-300">2. Selecionar Software</label>
            <select
              id="software-select"
              name="id_software"
              value={formData.id_software}
              onChange={handleInputChange}
              className="w-full glass-input text-sm bg-slate-950"
            >
              <option value="">-- Selecionar --</option>
              {softwares.map((soft) => (
                <option key={soft.id} value={soft.id}>
                  {soft.nome_software} ({soft.categoria})
                </option>
              ))}
            </select>
          </div>

          {/* Nível de Permissão */}
          <div className="space-y-2">
            <label htmlFor="permissao-select" className="text-xs font-semibold text-slate-300">3. Nível de Permissão</label>
            <select
              id="permissao-select"
              name="nivel_permissao"
              value={formData.nivel_permissao}
              onChange={handleInputChange}
              className="w-full glass-input text-sm bg-slate-950"
            >
              <option value="Leitura">Leitura</option>
              <option value="Escrita">Escrita</option>
              <option value="Admin">Admin</option>
              <option value="Dono">Dono</option>
            </select>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-violet-900/10 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            <span>Conceder Acesso</span>
          </button>
        </form>
      </div>

      {/* Matriz de Acessos Ativos */}
      <div className="glass-panel overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-800 bg-slate-900/20">
          <h2 className="text-lg font-bold text-white">Matriz de Acessos Ativos</h2>
          <p className="text-xs text-slate-400 mt-1">Exibição de todas as permissões vigentes. Linhas vermelhas indicam pendências críticas de revogação.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-500 border-t-transparent"></div>
          </div>
        ) : acessos.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <ShieldCheck className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="font-semibold text-white">Nenhum acesso ativo na matriz</p>
            <p className="text-xs">Vincule colaboradores a softwares para povoar a matriz de governança.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Colaborador</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Software</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nível</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Concedido Em</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {acessos.map((acesso) => {
                  const isColabInativo = acesso.colaborador.status === "Inativo";
                  
                  return (
                    <tr 
                      key={acesso.id} 
                      className={`transition-colors duration-200 ${
                        isColabInativo 
                          ? "bg-red-950/20 border-l-4 border-l-amber-500 hover:bg-red-950/30" 
                          : "hover:bg-slate-900/30"
                      }`}
                    >
                      {/* Colaborador */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{acesso.colaborador.nome}</div>
                        <div className="text-xs text-slate-500">{acesso.colaborador.email} • {acesso.colaborador.departamento}</div>
                      </td>

                      {/* Software */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{acesso.software.nome_software}</div>
                        <div className="text-xs text-slate-500">{acesso.software.categoria}</div>
                      </td>

                      {/* Nível de Permissão */}
                      <td className="px-6 py-4">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-md font-semibold ${
                          acesso.nivel_permissao === "Dono" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          acesso.nivel_permissao === "Admin" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" :
                          acesso.nivel_permissao === "Escrita" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {acesso.nivel_permissao}
                        </span>
                      </td>

                      {/* Data de Concessão */}
                      <td className="px-6 py-4 text-slate-300 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-500" />
                          <span>{formatDate(acesso.data_concessao)}</span>
                        </div>
                      </td>

                      {/* Status de Auditoria */}
                      <td className="px-6 py-4">
                        {isColabInativo ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse-slow">
                            <ShieldAlert size={12} className="animate-ping" />
                            <span>Pendente de Revogação</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                            <ShieldCheck size={12} />
                            <span>Ativo e Conforme</span>
                          </span>
                        )}
                      </td>

                      {/* Botão de Revogação */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevokeAccess(acesso.id)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border ${
                            isColabInativo 
                              ? "bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600 shadow-md shadow-amber-900/15" 
                              : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900"
                          }`}
                          title="Revogar credenciais de acesso"
                        >
                          <UserMinus size={13} />
                          <span>Revogar Acesso</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
