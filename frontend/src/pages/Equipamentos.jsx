import React, { useState, useEffect } from "react";
import { Plus, Search, Cpu, UserCheck, Trash2, Edit3, X, HardDrive, AlertCircle, Info, RefreshCw } from "lucide-react";
import { api } from "../utils/api";

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // States de Formulário
  const [formData, setFormData] = useState({
    tag: "",
    codigo_maquina: "",
    fabricante: "",
    modelo: "",
    numero_serie: "",
    tipo_equipamento: "Notebook",
    sistema_operacional: "",
    processador: "",
    memoria: "",
    status: "Estoque",
    id_colaborador: ""
  });

  const [selectedEqId, setSelectedEqId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eqs, colabs] = await Promise.all([
        api.getEquipamentos(searchTerm, statusFilter),
        api.getColaboradores()
      ]);
      setEquipamentos(eqs);
      setColaboradores(colabs);
    } catch (err) {
      setError("Não foi possível carregar o inventário de equipamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter]);

  // Temporizadores de Alertas
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

  // Se o status for alterado para 'Estoque', limpa o colaborador para segurança de alocação
  useEffect(() => {
    if (formData.status === "Estoque") {
      setFormData((prev) => ({ ...prev, id_colaborador: "" }));
    }
  }, [formData.status]);

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!formData.tag || !formData.codigo_maquina || !formData.fabricante || !formData.modelo || !formData.numero_serie) {
      setError("Por favor, preencha todos os campos obrigatórios do equipamento.");
      return;
    }

    try {
      setError("");
      const payload = {
        ...formData,
        id_colaborador: formData.id_colaborador ? parseInt(formData.id_colaborador) : null,
        // Limpa campos técnicos caso não seja notebook
        sistema_operacional: formData.tipo_equipamento === "Notebook" ? formData.sistema_operacional : null,
        processador: formData.tipo_equipamento === "Notebook" ? formData.processador : null,
        memoria: formData.tipo_equipamento === "Notebook" ? formData.memoria : null
      };

      await api.createEquipamento(payload);
      setSuccess("Equipamento cadastrado com sucesso!");
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Erro ao cadastrar equipamento.");
    }
  };

  const handleOpenEdit = (eq) => {
    setSelectedEqId(eq.id);
    setFormData({
      tag: eq.tag,
      codigo_maquina: eq.codigo_maquina,
      fabricante: eq.fabricante,
      modelo: eq.modelo,
      numero_serie: eq.numero_serie,
      tipo_equipamento: eq.tipo_equipamento,
      sistema_operacional: eq.sistema_operacional || "",
      processador: eq.processador || "",
      memoria: eq.memoria || "",
      status: eq.status,
      id_colaborador: eq.id_colaborador ? eq.id_colaborador.toString() : ""
    });
    setShowEditModal(true);
  };

  const handleEditEquipment = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const payload = {
        ...formData,
        id_colaborador: formData.id_colaborador ? parseInt(formData.id_colaborador) : -1, // -1 avisa desvinculação no CRUD
        sistema_operacional: formData.tipo_equipamento === "Notebook" ? formData.sistema_operacional : null,
        processador: formData.tipo_equipamento === "Notebook" ? formData.processador : null,
        memoria: formData.tipo_equipamento === "Notebook" ? formData.memoria : null
      };

      await api.updateEquipamento(selectedEqId, payload);
      setSuccess("Equipamento atualizado com sucesso!");
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Erro ao atualizar equipamento.");
    }
  };

  const handleDeleteEquipment = async (id, tag) => {
    if (!window.confirm(`Tem certeza que deseja DELETAR o equipamento Tag ${tag}?`)) {
      return;
    }
    try {
      setError("");
      await api.deleteEquipamento(id);
      setSuccess("Equipamento removido do inventário.");
      loadData();
    } catch (err) {
      setError(err.message || "Erro ao remover equipamento.");
    }
  };

  const resetForm = () => {
    setFormData({
      tag: "",
      codigo_maquina: "",
      fabricante: "",
      modelo: "",
      numero_serie: "",
      tipo_equipamento: "Notebook",
      sistema_operacional: "",
      processador: "",
      memoria: "",
      status: "Estoque",
      id_colaborador: ""
    });
    setSelectedEqId(null);
  };

  // Contadores analíticos rápidos baseados no state
  const total = equipamentos.length;
  const emEstoque = equipamentos.filter((e) => e.status === "Estoque").length;
  const emUso = equipamentos.filter((e) => e.status === "Em Uso").length;
  const emDevolucao = equipamentos.filter((e) => e.status === "Em Devolução").length;
  const naoEncontrado = equipamentos.filter((e) => e.status === "Não Encontrado").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Cpu className="text-violet-400" />
            <span>Inventário de Equipamentos</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Mapeamento físico de hardware, alocação de dispositivos a colaboradores e ciclo de vida de ativos.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="py-3 px-5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-violet-900/10 active:scale-95 flex items-center justify-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Cadastrar Equipamento</span>
        </button>
      </div>

      {/* ALERTAS */}
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

      {/* METRICAS RAPIDAS DE ATIVOS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Ativos</span>
          <span className="text-2xl font-black text-white mt-1">{total}</span>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-blue-500 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Em Estoque</span>
          <span className="text-2xl font-black text-blue-400 mt-1">{emEstoque}</span>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-emerald-500 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Em Uso</span>
          <span className="text-2xl font-black text-emerald-400 mt-1">{emUso}</span>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-amber-500 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Em Devolução</span>
          <span className="text-2xl font-black text-amber-400 mt-1">{emDevolucao}</span>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-red-500 flex flex-col justify-center col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Não Encontrados</span>
          <span className="text-2xl font-black text-red-400 mt-1 animate-pulse">{naoEncontrado}</span>
        </div>
      </div>

      {/* BARRA DE FILTROS E BUSCA */}
      <div className="glass-panel p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Pesquisa textual */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por Tag, Código, Modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Filtro por status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        >
          <option value="">Todos os Status</option>
          <option value="Estoque">Em Estoque</option>
          <option value="Em Uso">Em Uso</option>
          <option value="Em Devolução">Em Devolução</option>
          <option value="Não Encontrado">Não Encontrado</option>
        </select>

        {/* Botão de limpeza/refresh */}
        <button
          onClick={() => { setSearchTerm(""); setStatusFilter(""); loadData(); }}
          className="py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 rounded-lg flex items-center justify-center gap-1.5 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={12} />
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* TABELA DE EQUIPAMENTOS */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-500 border-t-transparent"></div>
          </div>
        ) : equipamentos.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <HardDrive className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="font-semibold text-white">Nenhum equipamento cadastrado</p>
            <p className="text-xs">Clique em 'Cadastrar Equipamento' para alimentar o inventário de TI.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Patrimônio / Tag</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Código / Tipo</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Dispositivo</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Alocação</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {equipamentos.map((eq) => {
                  const isNotebook = eq.tipo_equipamento === "Notebook";
                  
                  return (
                    <tr key={eq.id} className="transition-colors duration-200 hover:bg-slate-900/30">
                      {/* Tag Patrimonial */}
                      <td className="px-6 py-4 font-mono text-sm font-bold text-violet-400">
                        {eq.tag}
                      </td>

                      {/* Código e Tipo */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{eq.codigo_maquina}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{eq.tipo_equipamento}</div>
                      </td>

                      {/* Descrição e Especificação */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{eq.fabricante} {eq.modelo}</div>
                        <div className="text-xs text-slate-500">S/N: {eq.numero_serie}</div>
                        {isNotebook && (eq.processador || eq.memoria || eq.sistema_operacional) && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                              <Info size={9} />
                              {eq.sistema_operacional || "S/SO"} • {eq.processador || "S/CPU"} • {eq.memoria || "S/RAM"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Alocação / Colaborador */}
                      <td className="px-6 py-4 text-sm">
                        {eq.colaborador ? (
                          <div>
                            <div className="font-semibold text-white">{eq.colaborador.nome}</div>
                            <div className="text-xs text-slate-500">{eq.colaborador.departamento}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <UserCheck size={12} className="text-slate-600" />
                            Disponível no Estoque
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          eq.status === "Em Uso" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                          eq.status === "Estoque" ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                          eq.status === "Em Devolução" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                          "bg-red-500/10 text-red-400 border border-red-500/15 animate-pulse"
                        }`}>
                          <span>{eq.status}</span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(eq)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Alterar Status e Vincular"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(eq.id, eq.tag)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                          title="Deletar Equipamento"
                        >
                          <Trash2 size={14} />
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

      {/* MODAL ADICIONAR EQUIPAMENTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl overflow-hidden shadow-2xl relative animate-scaleUp">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="text-violet-400" />
                <span>Cadastrar Novo Equipamento</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEquipment} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tag */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Tag / Patrimônio *</label>
                  <input
                    type="text"
                    name="tag"
                    required
                    placeholder="Ex: PAT-2026-01"
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Código */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Código da Máquina *</label>
                  <input
                    type="text"
                    name="codigo_maquina"
                    required
                    placeholder="Ex: MAQ-NB-75"
                    value={formData.codigo_maquina}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Fabricante */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Fabricante *</label>
                  <input
                    type="text"
                    name="fabricante"
                    required
                    placeholder="Ex: Dell, Apple, Lenovo"
                    value={formData.fabricante}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    required
                    placeholder="Ex: Latitude 5430, Macbook Air M2"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Número Série */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Número de Série *</label>
                  <input
                    type="text"
                    name="numero_serie"
                    required
                    placeholder="Ex: CN-0275S-749..."
                    value={formData.numero_serie}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Tipo de Equipamento */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Tipo de Equipamento *</label>
                  <select
                    name="tipo_equipamento"
                    value={formData.tipo_equipamento}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950"
                  >
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Teclado">Teclado / Mouse</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* SEÇÃO NOTEBOOK: CONDICIONAL */}
              {formData.tipo_equipamento === "Notebook" && (
                <div className="p-4 rounded-xl border border-violet-500/10 bg-violet-500/5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider">
                    <Info size={12} />
                    <span>Especificações Técnicas do Notebook</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* OS */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Sistema Operacional</label>
                      <input
                        type="text"
                        name="sistema_operacional"
                        placeholder="Ex: Windows 11, macOS Sequoia"
                        value={formData.sistema_operacional}
                        onChange={handleInputChange}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                    {/* Processador */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Processador</label>
                      <input
                        type="text"
                        name="processador"
                        placeholder="Ex: Intel i7, Apple M2"
                        value={formData.processador}
                        onChange={handleInputChange}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                    {/* Memoria */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Memória RAM</label>
                      <input
                        type="text"
                        name="memoria"
                        placeholder="Ex: 16GB, 32GB"
                        value={formData.memoria}
                        onChange={handleInputChange}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ALOCAÇÃO INICIAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Status Operacional *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950"
                  >
                    <option value="Estoque">Em Estoque</option>
                    <option value="Em Uso">Em Uso</option>
                    <option value="Em Devolução">Em Devolução</option>
                    <option value="Não Encontrado">Não Encontrado</option>
                  </select>
                </div>

                {/* Colaborador */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Responsável / Colaborador</label>
                  <select
                    name="id_colaborador"
                    value={formData.id_colaborador}
                    disabled={formData.status === "Estoque"}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Sem vínculo (Disponível)</option>
                    {colaboradores.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.status === "Inativo"}>
                        {c.nome} ({c.cargo} • {c.departamento}) {c.status === "Inativo" ? "- [Inativo]" : ""}
                      </option>
                    ))}
                  </select>
                  {formData.status === "Estoque" && (
                    <span className="text-[10px] text-slate-500 block">Equipamentos em estoque não possuem colaborador associado.</span>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all duration-200"
                >
                  Salvar Equipamento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / VINCULAR EQUIPAMENTO */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl overflow-hidden shadow-2xl relative animate-scaleUp">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="text-violet-400" />
                <span>Atualizar Equipamento & Alocação</span>
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditEquipment} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tag */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Tag / Patrimônio *</label>
                  <input
                    type="text"
                    name="tag"
                    required
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Código */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Código da Máquina *</label>
                  <input
                    type="text"
                    name="codigo_maquina"
                    required
                    value={formData.codigo_maquina}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Fabricante */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Fabricante *</label>
                  <input
                    type="text"
                    name="fabricante"
                    required
                    value={formData.fabricante}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    required
                    value={formData.modelo}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Número Série */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Número de Série *</label>
                  <input
                    type="text"
                    name="numero_serie"
                    required
                    value={formData.numero_serie}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm"
                  />
                </div>

                {/* Tipo de Equipamento */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Tipo de Equipamento *</label>
                  <select
                    name="tipo_equipamento"
                    value={formData.tipo_equipamento}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950"
                  >
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Teclado">Teclado / Mouse</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* SEÇÃO NOTEBOOK: CONDICIONAL */}
              {formData.tipo_equipamento === "Notebook" && (
                <div className="p-4 rounded-xl border border-violet-500/10 bg-violet-500/5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider">
                    <Info size={12} />
                    <span>Especificações Técnicas do Notebook</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* OS */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Sistema Operacional</label>
                      <input
                        type="text"
                        name="sistema_operacional"
                        placeholder="Ex: Windows 11"
                        value={formData.sistema_operacional}
                        onChange={handleInputChange}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                    {/* Processador */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Processador</label>
                      <input
                        type="text"
                        name="processador"
                        placeholder="Ex: Intel i7"
                        value={formData.processador}
                        onChange={handleInputChange}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                    {/* Memoria */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Memória RAM</label>
                      <input
                        type="text"
                        name="memoria"
                        placeholder="Ex: 16GB"
                        value={formData.memoria}
                        onChange={handleInputChange}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ALOCAÇÃO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Status Operacional *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950"
                  >
                    <option value="Estoque">Em Estoque</option>
                    <option value="Em Uso">Em Uso</option>
                    <option value="Em Devolução">Em Devolução</option>
                    <option value="Não Encontrado">Não Encontrado</option>
                  </select>
                </div>

                {/* Colaborador */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Responsável / Colaborador</label>
                  <select
                    name="id_colaborador"
                    value={formData.id_colaborador}
                    disabled={formData.status === "Estoque"}
                    onChange={handleInputChange}
                    className="w-full glass-input text-sm bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Sem vínculo (Disponível)</option>
                    {colaboradores.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.status === "Inativo"}>
                        {c.nome} ({c.cargo} • {c.departamento}) {c.status === "Inativo" ? "- [Inativo]" : ""}
                      </option>
                    ))}
                  </select>
                  {formData.status === "Estoque" && (
                    <span className="text-[10px] text-slate-500 block">Equipamentos em estoque não possuem colaborador associado.</span>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all duration-200"
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
