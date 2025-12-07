import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BeanManager from './components/BeanManager';
import BrewLogger from './components/BrewLogger';
import EquipmentManager from './components/EquipmentManager';
import Settings from './components/Settings';
import { Bean, BrewLog, Equipment, Tab } from './types';
import { getBeans, saveBeans, getLogs, saveLogs, getEquipment, saveEquipment } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [beans, setBeans] = useState<Bean[]>([]);
  const [logs, setLogs] = useState<BrewLog[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Data
  useEffect(() => {
    setBeans(getBeans());
    setLogs(getLogs());
    setEquipment(getEquipment());
    setIsLoading(false);
  }, []);

  // Persist Data Changes
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

  const handleDataImport = (newBeans: Bean[], newLogs: BrewLog[], newEquipment: Equipment[]) => {
      setBeans(newBeans);
      setLogs(newLogs);
      setEquipment(newEquipment);
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-amber-700">Coffee 启动中...</div>;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard logs={logs} beans={beans} />
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
          onUpdateBean={handleUpdateBean}
        />
      )}

      {activeTab === 'equipment' && (
        <EquipmentManager 
            equipment={equipment}
            onAddEquipment={handleAddEquipment}
            onDeleteEquipment={handleDeleteEquipment}
        />
      )}

      {activeTab === 'settings' && (
        <Settings 
            beans={beans}
            logs={logs}
            equipment={equipment}
            onImportSuccess={handleDataImport}
        />
      )}
    </Layout>
  );
};

export default App;