import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, Loader2, HardDrive } from 'lucide-react';
import { Bean, BrewLog, Equipment } from '../types';
import { saveBeans, saveEquipment, saveLogs } from '../services/storageService';

interface SettingsProps {
  beans: Bean[];
  logs: BrewLog[];
  equipment: Equipment[];
  onImportSuccess: (beans: Bean[], logs: BrewLog[], equipment: Equipment[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ beans, logs, equipment, onImportSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Use setTimeout to allow the UI to show the loading spinner before the synchronous(ish) download blocks
    setTimeout(() => {
        try {
            const data = {
              version: '1.0',
              timestamp: Date.now(),
              beans,
              logs,
              equipment
            };
    
            const fileName = `coffee_backup_${new Date().toISOString().split('T')[0]}.json`;
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create a link element, hide it, click it, and remove it
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setIsExporting(false);
            }, 100);
    
        } catch (e: any) {
            console.error("Export failed:", e);
            alert(`导出出错: ${e.message || e}`);
            setIsExporting(false);
        }
    }, 500);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!json.beans || !json.logs || !Array.isArray(json.beans) || !Array.isArray(json.logs)) {
          throw new Error('无效的备份文件格式');
        }

        // Save to local storage
        saveBeans(json.beans);
        saveLogs(json.logs);
        // Handle equipment backward compatibility
        const importedEquipment = json.equipment && Array.isArray(json.equipment) ? json.equipment : [];
        saveEquipment(importedEquipment);

        // Update App state
        onImportSuccess(json.beans, json.logs, importedEquipment);
        
        setImportStatus('success');
        setStatusMessage(`成功导入: ${json.beans.length} 款豆子, ${json.logs.length} 条记录`);
      } catch (err) {
        console.error(err);
        setImportStatus('error');
        setStatusMessage('导入失败: 文件格式错误或损坏');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
       <h2 className="text-xl md:text-2xl font-bold text-slate-800">数据归档与管理</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
         {/* Export Section */}
         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3 md:mb-4 text-amber-700">
                <div className="p-2 bg-amber-50 rounded-lg">
                    <Download size={24} />
                </div>
                <h3 className="text-lg font-semibold">本地导出 (备份)</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4 md:mb-6 leading-relaxed">
                将您的所有咖啡豆、冲煮记录和设备数据导出为 JSON 文件并保存到您的设备中。
            </p>
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <HardDrive size={18} />}
                {isExporting ? '生成中...' : '下载备份文件'}
            </button>
         </div>

         {/* Import Section */}
         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3 md:mb-4 text-slate-700">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Upload size={24} />
                </div>
                <h3 className="text-lg font-semibold">本地导入 (恢复)</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4 md:mb-6 leading-relaxed">
                从您设备上的备份文件恢复数据。注意：这将覆盖当前的现有数据，请谨慎操作。
            </p>
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
                <Upload size={18} />
                选择备份文件
            </button>

            {importStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={16} />
                    {statusMessage}
                </div>
            )}
            {importStatus === 'error' && (
                 <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                    <AlertCircle size={16} />
                    {statusMessage}
                </div>
            )}
         </div>
       </div>

       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
           <p className="font-semibold mb-1">隐私与存储说明</p>
           <p className="mb-2">Coffee 所有数据均存储在您的本地浏览器中，不会上传到云端。</p>
           <p className="font-semibold mb-1">使用说明</p>
           <p>点击“下载备份文件”将直接生成一个 JSON 文件并保存到您的设备。您可以将此文件发送到其他设备进行数据迁移。</p>
       </div>
    </div>
  );
};

export default Settings;