import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BeanManager from './components/BeanManager';
import BrewLogger from './components/BrewLogger';
import EquipmentManager from './components/EquipmentManager';
import Settings from './components/Settings';
import SpecialtyManager from './components/SpecialtyManager';
import { Bean, BrewLog, Equipment, Tab, SpecialtyRecipe } from './types';
import { X } from 'lucide-react';
import { getBeans, saveBeans, getLogs, saveLogs, getEquipment, saveEquipment, getSpecialtyRecipes, saveSpecialtyRecipes } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [beans, setBeans] = useState<Bean[]>([]);
  const [logs, setLogs] = useState<BrewLog[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [specialtyRecipes, setSpecialtyRecipes] = useState<SpecialtyRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Load Data
  useEffect(() => {
    setBeans(getBeans());
    setLogs(getLogs());
    setEquipment(getEquipment());
    setSpecialtyRecipes(getSpecialtyRecipes());
    setIsLoading(false);

    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist();
    }
  }, []);

  const handleAddBean = (newBean: Bean) => {
    const updated = [newBean, ...beans];
    setBeans(updated);
    saveBeans(updated);
  };

  const handleDeleteBean = (id: string) => {
    const updated = beans.filter(b => b.id !== id);
    setBeans(updated);
    saveBeans(updated);
  };

  const handleUpdateBean = (updatedBean: Bean) => {
    const updated = beans.map(b => b.id === updatedBean.id ? updatedBean : b);
    setBeans(updated);
    saveBeans(updated);
  };

  const handleAddLog = (newLog: BrewLog) => {
    const updated = [...logs, newLog];
    setLogs(updated);
    saveLogs(updated);
  };

  const handleUpdateLog = (updatedLog: BrewLog) => {
    const updated = logs.map(l => l.id === updatedLog.id ? updatedLog : l);
    setLogs(updated);
    saveLogs(updated);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    saveLogs(updated);
  };

  const handleAddEquipment = (newEquipment: Equipment) => {
    const updated = [...equipment, newEquipment];
    setEquipment(updated);
    saveEquipment(updated);
  };

  const handleDeleteEquipment = (id: string) => {
    const updated = equipment.filter(e => e.id !== id);
    setEquipment(updated);
    saveEquipment(updated);
  };

  const handleAddSpecialty = (recipe: SpecialtyRecipe) => {
    const updated = [recipe, ...specialtyRecipes];
    setSpecialtyRecipes(updated);
    saveSpecialtyRecipes(updated);
  };

  const handleUpdateSpecialty = (recipe: SpecialtyRecipe) => {
    const updated = specialtyRecipes.map(r => r.id === recipe.id ? recipe : r);
    setSpecialtyRecipes(updated);
    saveSpecialtyRecipes(updated);
  };

  const handleDeleteSpecialty = (id: string) => {
    const updated = specialtyRecipes.filter(r => r.id !== id);
    setSpecialtyRecipes(updated);
    saveSpecialtyRecipes(updated);
  };

  const handleDataImport = (newBeans: Bean[], newLogs: BrewLog[], newEquipment: Equipment[], newSpecialty: SpecialtyRecipe[]) => {
      setBeans(newBeans);
      setLogs(newLogs);
      setEquipment(newEquipment);
      setSpecialtyRecipes(newSpecialty);
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-amber-700">Coffee 启动中...</div>;
  }

  return (
    <>
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onOpenArchive={() => setIsArchiveOpen(true)}>
      {activeTab === 'dashboard' && (
        <Dashboard logs={logs} beans={beans} onUpdateLog={handleUpdateLog} />
      )}
      
      {activeTab === 'beans' && (
        <BeanManager 
          beans={beans} 
          onAddBean={handleAddBean} 
          onUpdateBean={handleUpdateBean}
          onDeleteBean={handleDeleteBean} 
        />
      )}

      {activeTab === 'brews' && (
        <BrewLogger 
          logs={logs} 
          beans={beans}
          equipment={equipment}
          onAddLog={handleAddLog}
          onUpdateLog={handleUpdateLog}
          onDeleteLog={handleDeleteLog}
          onUpdateBean={handleUpdateBean}
        />
      )}

      {activeTab === 'specialty' && (
        <SpecialtyManager 
          beans={beans}
          recipes={specialtyRecipes}
          onAddRecipe={handleAddSpecialty}
          onUpdateRecipe={handleUpdateSpecialty}
          onDeleteRecipe={handleDeleteSpecialty}
        />
      )}

      {activeTab === 'equipment' && (
        <EquipmentManager 
            equipment={equipment}
            onAddEquipment={handleAddEquipment}
            onDeleteEquipment={handleDeleteEquipment}
        />
      )}
    </Layout>
    {isArchiveOpen && (
      <div className="fixed inset-0 z-[300] bg-slate-50 flex flex-col" role="dialog" aria-modal="true">
        <header className="bg-amber-600 text-white shadow-md z-10 flex items-center justify-between px-4 pt-12 pb-4 md:pt-4 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl px-2 py-0.5">
            <span>数据归档</span>
          </div>
          <button
            onClick={() => setIsArchiveOpen(false)}
            className="p-2 rounded-lg hover:bg-amber-700/50 active:scale-95 transition-all text-white/80 hover:text-white"
            aria-label="关闭"
          >
            <X size={22} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-3 md:p-5">
          <div className="max-w-5xl w-full mx-auto md:px-2 pt-4 pb-6">
            <Settings 
              beans={beans}
              logs={logs}
              equipment={equipment}
              specialtyRecipes={specialtyRecipes}
              onImportSuccess={handleDataImport}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default App;