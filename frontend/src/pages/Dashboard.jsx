import React, { useEffect, useState } from "react";
import { Users, ShieldAlert, Laptop, KeyRound, ArrowRight, Activity, Cpu } from "lucide-react";
import { api } from "../utils/api";

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState({
    total_colaboradores: 0,
    total_softwares: 0,
    acessos_ativos: 0,
    acessos_pendentes_revogacao: 0,
    total_equipamentos: 0,
    equipamentos_estoque: 0,
    equipamentos_uso: 0,
    equipamentos_devolucao: 0,
    equipamentos_nao_encontrado: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentAcessos, setRecentAcessos] = useState([]);
  const [permissionStats, setPermissionStats] = useState([]);
  const [softwareStats, setSoftwareStats] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const data = await api.getStats();
        setStats(data);
        
        // Também carrega acessos recentes para preencher a tela
        const acessos = await api.getAcessos();
        
        // Calcular estatísticas de níveis de permissão
        const permissionsCount = { Leitura: 0, Escrita: 0, Admin: 0, Dono: 0 };
        const softwareCount = {};
        
        acessos.forEach(ac => {
          const perm = ac.nivel_permissao;
          if (permissionsCount[perm] !== undefined) {
            permissionsCount[perm]++;
          }
          const softName = ac.software?.nome_software || "Outros";
          softwareCount[softName] = (softwareCount[softName] || 0) + 1;
        });
        
        const total = acessos.length;
        const pStats = Object.keys(permissionsCount).map(key => ({
          name: key,
          value: permissionsCount[key],
          percentage: total > 0 ? Math.round((permissionsCount[key] / total) * 100) : 0
        }));
        
        const sStats = Object.keys(softwareCount).map(key => ({
          name: key,
          value: softwareCount[key]
        })).sort((a, b) => b.value - a.value).slice(0, 5);
        
        setPermissionStats(pStats);
        setSoftwareStats(sStats);
        
        // Ordena por id decrescente para pegar os mais novos
        const sorted = [...acessos].sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentAcessos(sorted);
      } catch (err) {
        setError("Não foi possível carregar as métricas do painel.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard de Governança</h1>
        <p className="mt-2 text-slate-400">Visão analítica de conformidade, controle de acessos e auditoria de softwares.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* Total Colaboradores */}
        <div className="glass-panel glass-panel-hover p-6 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-400">Colaboradores</span>
            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.total_colaboradores}</h3>
          </div>
          <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <Users size={24} />
          </div>
        </div>

        {/* Total Softwares */}
        <div className="glass-panel glass-panel-hover p-6 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-400">Ferramentas de TI</span>
            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.total_softwares}</h3>
          </div>
          <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            <Laptop size={24} />
          </div>
        </div>

        {/* Total Equipamentos */}
        <div className="glass-panel glass-panel-hover p-6 flex items-center justify-between group" onClick={() => setPage("equipamentos")} style={{ cursor: "pointer" }}>
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-400">Equipamentos de TI</span>
            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.total_equipamentos}</h3>
          </div>
          <div className="rounded-2xl bg-violet-500/10 p-4 text-violet-400 group-hover:scale-110 transition-transform duration-300">
            <Cpu size={24} />
          </div>
        </div>

        {/* Acessos Ativos */}
        <div className="glass-panel glass-panel-hover p-6 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-400">Acessos Ativos</span>
            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.acessos_ativos}</h3>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <KeyRound size={24} />
          </div>
        </div>

        {/* Pendentes de Revogação */}
        <div className="glass-panel glass-panel-hover p-6 flex items-center justify-between group border-amber-500/10 hover:border-amber-500/30">
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-400">Pendentes de Revogação</span>
            <h3 className={`text-3xl font-bold tracking-tight ${stats.acessos_pendentes_revogacao > 0 ? "text-amber-400 animate-pulse-slow" : "text-white"}`}>
              {stats.acessos_pendentes_revogacao}
            </h3>
          </div>
          <div className={`rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300 ${stats.acessos_pendentes_revogacao > 0 ? "bg-amber-500/20 text-amber-400" : "bg-slate-800/50 text-slate-400"}`}>
            <ShieldAlert size={24} />
          </div>
        </div>

      </div>

      {/* Seção de Gráficos e Insights de Governança */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Acessos por Nível (Donut Chart SVG) */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-4">
            <Activity className="text-violet-400" size={20} />
            <h2 className="text-lg font-bold text-white">Nível de Permissões na Matriz</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800/60"
                  strokeWidth="8"
                  fill="transparent"
                />
                
                {/* Dynamic Slice Circles */}
                {(() => {
                  let accumulated = 0;
                  const totalCount = stats.acessos_ativos + stats.acessos_pendentes_revogacao || 1;
                  const isZero = stats.acessos_ativos + stats.acessos_pendentes_revogacao === 0;
                  
                  if (isZero) return null;
                  
                  const colors = {
                    Leitura: "#64748b",
                    Escrita: "#3b82f6",
                    Admin: "#8b5cf6",
                    Dono: "#ef4444"
                  };
                  
                  return permissionStats.map((item, idx) => {
                    const r = 40;
                    const c = 2 * Math.PI * r;
                    const strokeDasharray = `${c}`;
                    const slicePercentage = (item.value / totalCount) * 100;
                    const strokeDashoffset = c - (slicePercentage / 100) * c;
                    const rotation = (accumulated / 100) * 360;
                    accumulated += slicePercentage;
                    
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={r}
                        stroke={colors[item.name] || "#94a3b8"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transformOrigin: "50px 50px",
                          transform: `rotate(${rotation}deg)`,
                          transition: "all 0.5s ease"
                        }}
                      />
                    );
                  });
                })()}
              </svg>
              
              {/* Inner Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {stats.acessos_ativos + stats.acessos_pendentes_revogacao}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Vínculos
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-3 flex-1 w-full max-w-[180px]">
              {(() => {
                const colors = {
                  Leitura: "bg-slate-500",
                  Escrita: "bg-blue-500",
                  Admin: "bg-violet-500",
                  Dono: "bg-red-500"
                };
                
                return permissionStats.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${colors[item.name] || "bg-slate-400"}`}></span>
                      <span className="font-medium text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">{item.value} ({item.percentage}%)</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Gráfico 2: Softwares mais Populares (Bar Chart CSS) */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-4">
            <Activity className="text-violet-400" size={20} />
            <h2 className="text-lg font-bold text-white">Softwares mais Utilizados</h2>
          </div>
          
          <div className="space-y-4">
            {softwareStats.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Nenhum dado de software para exibir gráficos ainda.
              </div>
            ) : (
              (() => {
                const maxVal = Math.max(...softwareStats.map(s => s.value)) || 1;
                
                return softwareStats.map((item, idx) => {
                  const percentWidth = Math.round((item.value / maxVal) * 100);
                  
                  return (
                    <div key={idx} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="group-hover:text-white transition-colors">{item.name}</span>
                        <span className="text-slate-400">{item.value} {item.value === 1 ? "acesso" : "acessos"}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/60">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500 shadow-sm shadow-violet-500/20 group-hover:from-violet-500 group-hover:to-indigo-400"
                          style={{ width: `${percentWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>

      </div>

      {/* Painel Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Acessos Recentes */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="text-violet-400" size={20} />
              <h2 className="text-xl font-bold text-white">Últimas Atividades de Governança</h2>
            </div>
            <button 
              onClick={() => setPage("governanca")}
              className="flex items-center space-x-1 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>Gerenciar Matriz</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentAcessos.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                Nenhuma concessão de acesso registrada ainda.
              </div>
            ) : (
              recentAcessos.map((acesso) => (
                <div key={acesso.id} className="py-4 flex items-center justify-between hover:bg-slate-900/20 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-white text-sm">{acesso.colaborador.nome}</p>
                    <p className="text-xs text-slate-400">{acesso.colaborador.email} • {acesso.colaborador.cargo}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                      {acesso.software.nome_software}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Nível: {acesso.nivel_permissao}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumo de Riscos de Conformidade */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="text-amber-500" size={20} />
            <h2 className="text-xl font-bold text-white">Riscos de Conformidade</h2>
          </div>
          
          <div className="space-y-4">
            {stats.acessos_pendentes_revogacao > 0 ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
                <p className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                  Risco Médio/Alto Detectado
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Existem <strong>{stats.acessos_pendentes_revogacao}</strong> acessos de softwares vinculados a colaboradores que foram inativados no sistema. Revogue estes acessos imediatamente na Matriz de Acessos para evitar vazamento de credenciais.
                </p>
                <button
                  onClick={() => setPage("governanca")}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  Ir para Governança e Revogar
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-400">Empresa Conforme</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Excelente! Todos os colaboradores inativos têm seus acessos devidamente revogados. Nenhum risco de segurança pendente na matriz ativa.
                </p>
              </div>
            )}

            <div className="border border-slate-800 rounded-xl p-4 space-y-3 bg-slate-950/20">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Políticas de Segurança</span>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Impeça a duplicidade de contas.</li>
                <li>Desative acessos no mesmo dia da demissão.</li>
                <li>Revise trimestralmente os acessos tipo "Dono".</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
