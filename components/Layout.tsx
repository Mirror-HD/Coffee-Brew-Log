import React, { useState } from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Coffee, Archive, X, Menu } from 'lucide-react';
import { CoffeeBeanIcon, HandGrinderIcon, SpecialtyIcon } from './CustomIcons';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenArchive: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, onOpenArchive, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '概览', icon: LayoutDashboard },
    { id: 'brews', label: '记录', icon: Coffee },
    { id: 'beans', label: '豆仓', icon: CoffeeBeanIcon },
    { id: 'specialty', label: '特调', icon: SpecialtyIcon },
    { id: 'equipment', label: '设备', icon: HandGrinderIcon },
  ] as const;

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const handleArchiveClick = () => {
    closeDrawer();
    onOpenArchive();
  };

  // Shared header padding: keeps amber bar heights identical across app header & drawer header
  const headerPadding = 'px-4 pt-12 pb-4 md:pt-4';

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden">

      {/* Top Header: hamburger (left) + logo (right, display only) */}
      <header className={`bg-amber-600 text-white shadow-md z-10 flex items-center justify-between shrink-0 transition-all ${headerPadding}`}>
        <button 
          onClick={openDrawer}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-lg active:scale-95 transition-all outline-none hover:bg-amber-700/50"
          aria-label="打开菜单"
        >
          <Menu className="stroke-2 w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 font-bold text-xl px-2 py-0.5">
          <Coffee className="stroke-2 w-6 h-6" />
          <span>Coffee</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-row overflow-hidden">

        {/* Sidebar (Desktop) */}
        <nav className="hidden md:flex bg-white border-r border-slate-200 w-64 flex-col flex-shrink-0 z-[100] shadow-none">
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
        <main className="flex-1 overflow-y-auto md:overflow-hidden overflow-x-hidden pt-4 pb-6 px-3 md:p-5 w-full scroll-smooth flex flex-col min-h-0">
          <div className="max-w-7xl w-full mx-auto md:px-2 animate-in fade-in duration-300 flex-1 flex flex-col min-h-0 h-auto md:h-full">
             {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t border-slate-200 z-10 pb-safe shrink-0">
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

      {/* Drawer Overlay (always mounted for slide animation) */}
      <div className="fixed inset-0 z-[200] pointer-events-none" role="dialog" aria-modal="true" aria-hidden={!drawerOpen}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeDrawer}
        />
        {/* Drawer Panel */}
        <div 
          className={`absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out pointer-events-auto ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Drawer Header - mirrors top header height */}
          <div className={`flex items-center justify-start shrink-0 bg-amber-600 text-white shadow-md ${headerPadding}`}>
            <button 
              onClick={closeDrawer}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-lg active:scale-95 transition-all outline-none hover:bg-amber-700/50 text-white/80 hover:text-white"
              aria-label="关闭菜单"
            >
              <X className="stroke-2 w-6 h-6" />
            </button>
          </div>
          {/* Drawer Menu */}
          <div className="flex flex-col p-4 gap-1">
            <button
              onClick={handleArchiveClick}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                text-slate-600 hover:bg-amber-50 hover:text-amber-700
                text-sm font-medium w-full text-left
              `}
            >
              <Archive size={20} className="stroke-2" />
              <span>数据归档</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
