import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Coffee, Settings } from 'lucide-react';
import { CoffeeBeanIcon, HandGrinderIcon } from './CustomIcons';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'brews', label: '记录', icon: Coffee }, // Shortened label for mobile
    { id: 'beans', label: '豆仓', icon: CoffeeBeanIcon }, // Shortened label
    { id: 'equipment', label: '设备', icon: HandGrinderIcon },
    { id: 'settings', label: '设置', icon: Settings }, // Shortened label
  ] as const;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center px-4">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-lg">
           <Coffee className="stroke-2 w-5 h-5" />
           <span>BrewLog</span>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <nav className="hidden md:flex bg-white border-r border-slate-200 w-64 flex-col flex-shrink-0 z-50 shadow-none">
        <div className="p-6">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xl tracking-tight">
            <Coffee className="stroke-2" />
            <span>BrewLog</span>
          </div>
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
                <span>{item.label === '记录' ? '冲煮记录' : item.label === '豆仓' ? '咖啡豆' : item.label === '设置' ? '数据归档' : item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden md:p-8 pt-16 pb-24 md:pb-8 px-4 w-full scroll-smooth">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
           {children}
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50 pb-safe">
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
