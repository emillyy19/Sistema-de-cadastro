import React, { useState, useEffect } from "react";
import { Plus, Laptop, Tag, ShieldCheck, X } from "lucide-react";
import { api } from "../utils/api";

export default function Softwares() {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome_software: "",
    categoria: "Desenvolvimento",
    tipo_licenca: "Pro",
  });

  const loadSoftwares = async () => {
    try {
      setLoading(true);
      const data = await api.getSoftwares();
      setSoftwares(data);
    } catch (err) {
      setError("Não foi possível carregar a lista de softwares.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSoftwares();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.createSoftware(formData);
      setSuccess("Software cadastrado com sucesso!");
      setIsCreateOpen(false);
      setFormData({ nome_software: "", categoria: "Desenvolvimento", tipo_licenca: "Pro" });
      loadSoftwares();
    } catch (err) {
      setError(err.message || "Erro ao cadastrar software.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Softwares & Ferramentas</h1>
          <p className="mt-2 text-slate-400">Catálogo de ferramentas autorizadas corporativamente, licenças e categorias de aplicação.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/20 active:scale-95 self-start"
        >
          <Plus size={18} />
          <span>Cadastrar Software</span>
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

      {/* Grid de Softwares */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-500 border-t-transparent"></div>
        </div>
      ) : softwares.length === 0 ? (
        <div className="glass-panel py-16 text-center text-slate-500 space-y-2">
          <Laptop className="mx-auto text-slate-600 mb-2" size={32} />
          <p className="font-semibold text-white">Nenhum software cadastrado</p>
          <p className="text-xs">Registre as ferramentas autorizadas da empresa para associá-las aos colaboradores.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {softwares.map((soft) => (
            <div key={soft.id} className="glass-panel glass-panel-hover p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{soft.nome_software}</h3>
                    <span className="text-[10px] text-slate-500">ID: {soft.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                    <Tag size={10} />
                    {soft.categoria}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                    <ShieldCheck size={10} />
                    Licença: {soft.tipo_licenca}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CRIAR SOFTWARE */}
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
              <h3 className="text-xl font-bold text-white">Cadastrar Novo Software</h3>
              <p className="text-xs text-slate-400 mt-1">Insira as credenciais do software licenciado para controle de conformidade.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome do Software</label>
                <input
                  type="text"
                  name="nome_software"
                  required
                  value={formData.nome_software}
                  onChange={handleInputChange}
                  placeholder="Ex: Jira, Slack, AWS Console"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Categoria</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950"
                  >
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Comunicação">Comunicação</option>
                    <option value="Design">Design</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Gestão de Projetos">Gestão de Projetos</option>
                    <option value="Infraestrutura / Cloud">Infraestrutura / Cloud</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipo de Licença</label>
                  <select
                    name="tipo_licenca"
                    value={formData.tipo_licenca}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950"
                  >
                    <option value="Gratuito / Open Source">Gratuito / OS</option>
                    <option value="Pro / Por Usuário">Pro (Individual)</option>
                    <option value="Enterprise / Corporativa">Enterprise (Corp)</option>
                    <option value="Faturamento por Consumo">Faturamento / Consumo</option>
                  </select>
                </div>
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
                  Salvar Software
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
