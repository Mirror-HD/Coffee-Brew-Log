import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Coffee } from 'lucide-react';
import { CoffeeBeanIcon, HandGrinderIcon, SpecialtyIcon } from './CustomIcons';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const navItems = [
    { id: 'dashboard', label: '概览', icon: LayoutDashboard },
    { id: 'brews', label: '记录', icon: Coffee },
    { id: 'specialty', label: '特调', icon: SpecialtyIcon },
    { id: 'beans', label: '豆仓', icon: CoffeeBeanIcon },
    { id: 'equipment', label: '设备', icon: HandGrinderIcon },
  ] as const;

  const isSettingsActive = activeTab === 'settings';

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Top Header - Logo triggers Settings */}
      <header className="md:hidden fixed top-0 left-0 right-0 pt-12 pb-4 bg-amber-600 text-white shadow-md z-[100] flex items-center px-4 transition-all">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 font-bold text-xl active:scale-95 transition-all outline-none rounded-lg px-2 py-0.5 ${isSettingsActive ? 'bg-amber-700/50 ring-1 ring-white/30' : ''}`}
        >
           <Coffee className="stroke-2 w-6 h-6" />
           <span>Coffee</span>
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <nav className="hidden md:flex bg-white border-r border-slate-200 w-64 flex-col flex-shrink-0 z-[100] shadow-none">
        <div className="p-5 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 font-bold text-xl tracking-tight transition-all outline-none rounded-xl p-2.5 group w-full
              ${isSettingsActive 
                ? 'bg-amber-50 text-amber-700' 
                : 'text-amber-700 hover:bg-slate-50'}
            `}
          >
            <Coffee className={`stroke-2 transition-transform duration-300 ${isSettingsActive ? 'scale-110' : 'group-hover:rotate-12'} w-6 h-6`} />
            <span>Coffee</span>
          </button>
        </div>

        <div className="flex flex-col flex-1 p-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-amber-50 text-amber-700 font-semibold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  text-sm
                `}
              >
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:overflow-hidden overflow-x-hidden md:p-5 pt-24 pb-[calc(4rem+12px+env(safe-area-inset-bottom,0px))] md:pb-5 px-3 w-full scroll-smooth flex flex-col h-full">
        <div className="max-w-7xl w-full mx-auto md:px-2 animate-in fade-in duration-300 flex-1 flex flex-col min-h-0 h-auto md:h-full">
           {children}
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-[100] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                  flex flex-col items-center justify-center w-full h-full gap-1
                  transition-colors duration-200
                  ${isActive ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}
                `}
              >
                <div className={`p-1 rounded-full transition-transform duration-200 ${isActive ? 'bg-amber-50 scale-110' : ''}`}>
                    <Icon size={22} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;