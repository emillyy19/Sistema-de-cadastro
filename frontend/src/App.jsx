import React, { useState } from "react";
import { LayoutDashboard, Users, Laptop, ShieldCheck, ShieldAlert, Key, Cpu } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import Softwares from "./pages/Softwares";
import Governanca from "./pages/Governanca";
import Equipamentos from "./pages/Equipamentos";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "colaboradores", label: "Colaboradores", icon: Users },
    { id: "softwares", label: "Softwares / TI", icon: Laptop },
    { id: "equipamentos", label: "Equipamentos", icon: Cpu },
    { id: "governanca", label: "Governança TI", icon: ShieldCheck },
  ];

  const renderActivePage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard setPage={setPage} />;
      case "colaboradores":
        return <Colaboradores />;
      case "softwares":
        return <Softwares />;
      case "equipamentos":
        return <Equipamentos />;
      case "governanca":
        return <Governanca />;
      default:
        return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen text-slate-100 selection:bg-violet-500/30 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950/70 border-r border-slate-800/80 backdrop-blur-xl p-6 space-y-8 shrink-0">
        
        {/* LOGO E SISTEMA */}
        <div className="flex items-center space-x-3 px-2">
          <div className="rounded-xl bg-violet-600 p-2.5 text-white shadow-md shadow-violet-900/35 flex items-center justify-center">
            <Key size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-violet-400 bg-clip-text text-transparent">
              GOV-IT
            </h2>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">
              Access Matrix
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 block mb-3">
            Módulos Administrativos
          </span>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600/15 text-violet-400 border border-violet-500/20 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/30 border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? "text-violet-400" : "text-slate-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* FOOTER DO MENU */}
        <div className="border-t border-slate-800/60 pt-4 px-2 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Sistema Seguro</span>
          </div>
          <p className="text-[10px] text-slate-500">Versão de Governança v1.0.0</p>
        </div>
      </aside>

      {/* PAINEL PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR (Versão mobile básica e Perfil) */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-950/40 border-b border-slate-850">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-violet-600 p-2 text-white">
              <Key size={16} />
            </div>
            <h2 className="text-md font-bold text-white tracking-wider">GOV-IT</h2>
          </div>
          
          <div className="flex gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`p-2.5 rounded-lg transition-colors ${
                    isActive ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-900"
                  }`}
                  title={item.label}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

    </div>
  );
}
