import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, UserCheck, UserX, AlertTriangle, X } from "lucide-react";
import { api } from "../utils/api";

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modais de Criação / Edição
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    status: "Ativo",
  });
  
  const [editingId, setEditingId] = useState(null);

  // Carrega Colaboradores
  const loadColaboradores = async (searchTerm = "") => {
    try {
      setLoading(true);
      const data = await api.getColaboradores(searchTerm);
      setColaboradores(data);
    } catch (err) {
      setError("Não foi possível carregar a lista de colaboradores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce busca simples de 300ms
    const timer = setTimeout(() => {
      loadColaboradores(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.createColaborador(formData);
      setSuccess("Colaborador cadastrado com sucesso!");
      setIsCreateOpen(false);
      setFormData({ nome: "", email: "", cargo: "", departamento: "", status: "Ativo" });
      loadColaboradores(search);
    } catch (err) {
      setError(err.message || "Erro ao cadastrar colaborador.");
    }
  };

  const handleEditClick = (colab) => {
    setEditingId(colab.id);
    setFormData({
      nome: colab.nome,
      email: colab.email,
      cargo: colab.cargo,
      departamento: colab.departamento,
      status: colab.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.updateColaborador(editingId, formData);
      setSuccess("Colaborador atualizado com sucesso!");
      setIsEditOpen(false);
      setEditingId(null);
      setFormData({ nome: "", email: "", cargo: "", departamento: "", status: "Ativo" });
      loadColaboradores(search);
    } catch (err) {
      setError(err.message || "Erro ao atualizar colaborador.");
    }
  };

  const toggleStatusInline = async (colab) => {
    try {
      const newStatus = colab.status === "Ativo" ? "Inativo" : "Ativo";
      await api.updateColaborador(colab.id, { status: newStatus });
      setSuccess(`Colaborador ${colab.nome} foi marcado como ${newStatus}!`);
      loadColaboradores(search);
    } catch (err) {
      setError(err.message || "Erro ao alterar status do colaborador.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Módulo de Colaboradores</h1>
          <p className="mt-2 text-slate-400">Gerenciamento de equipes, cargos, departamentos e estados de atividade corporativa.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ nome: "", email: "", cargo: "", departamento: "", status: "Ativo" });
            setIsCreateOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/20 active:scale-95 self-start"
        >
          <Plus size={18} />
          <span>Cadastrar Colaborador</span>
        </button>
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

      {/* Barra de Filtros */}
      <div className="glass-panel p-4 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, cargo ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Listagem */}
      <div className="glass-panel overflow-hidden">
        {loading && colaboradores.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-500 border-t-transparent"></div>
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Search className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="font-semibold text-white">Nenhum colaborador encontrado</p>
            <p className="text-xs">Tente ajustar o termo de pesquisa ou cadastre um novo registro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nome / Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Cargo</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Departamento</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {colaboradores.map((colab) => (
                  <tr key={colab.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{colab.nome}</div>
                      <div className="text-xs text-slate-500">{colab.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{colab.cargo}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{colab.departamento}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatusInline(colab)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                          colab.status === "Ativo"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        }`}
                        title="Clique para alternar o status"
                      >
                        {colab.status === "Ativo" ? (
                          <>
                            <UserCheck size={12} />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <UserX size={12} />
                            <span>Inativo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(colab)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Editar cadastro"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CRIAR COLABORADOR */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 space-y-6 relative border-slate-700/80">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            
            <div>
              <h3 className="text-xl font-bold text-white">Cadastrar Novo Colaborador</h3>
              <p className="text-xs text-slate-400 mt-1">Preencha os dados abaixo de acordo com o registro oficial do RH.</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: João da Silva"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">E-mail Corporativo</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ex: joao.silva@empresa.com"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    required
                    value={formData.cargo}
                    onChange={handleInputChange}
                    placeholder="Ex: Desenvolvedor Jr"
                    className="w-full glass-input text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Departamento</label>
                  <input
                    type="text"
                    name="departamento"
                    required
                    value={formData.departamento}
                    onChange={handleInputChange}
                    placeholder="Ex: Engenharia"
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Status Inicial</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full glass-input text-sm bg-slate-950"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors shadow-md shadow-violet-900/10"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR COLABORADOR */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 space-y-6 relative border-slate-700/80">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            
            <div>
              <h3 className="text-xl font-bold text-white">Editar Colaborador</h3>
              <p className="text-xs text-slate-400 mt-1">Altere as informações cadastrais e clique em salvar.</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">E-mail Corporativo</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    required
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Departamento</label>
                  <input
                    type="text"
                    name="departamento"
                    required
                    value={formData.departamento}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Status de Atividade</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full glass-input text-sm bg-slate-950"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
                {formData.status === "Inativo" && (
                  <div className="mt-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2 text-amber-400">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span className="text-[11px] leading-relaxed">
                      <strong>Aviso de Governança:</strong> Ao marcar como <strong>Inativo</strong>, todos os softwares vinculados a este colaborador na matriz passarão automaticamente a constar como <strong>"Pendente de Revogação"</strong>.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
