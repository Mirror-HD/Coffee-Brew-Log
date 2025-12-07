import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  const handleExport = async () => {
    const data = {
      version: '1.0',
      timestamp: Date.now(),
      beans,
      logs,
      equipment
    };

    const fileName = `brewlog_backup_${new Date().toISOString().split('T')[0]}.json`;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Try Web Share API (Level 2 with files) for mobile devices
    // This enables "Save to Files" on iOS and better file handling on Android
    // allowing users to pick the root directory or any other folder.
    try {
        const file = new File([blob], fileName, { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Coffee App Backup',
                text: 'Coffee App Data Backup',
            });
            return;
        }
    } catch (error) {
        console.warn('Web Share API failed or dismissed, falling back to legacy download:', error);
        // Continue to legacy download method if share fails
    }

    // Standard download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                <h3 className="text-lg font-semibold">导出数据 (备份)</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4 md:mb-6 leading-relaxed">
                将您的所有咖啡豆、冲煮记录和设备数据导出为 JSON 文件。建议定期备份以防数据丢失。
            </p>
            <button 
                onClick={handleExport}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
                <Download size={18} />
                下载 / 保存备份
            </button>
         </div>

         {/* Import Section */}
         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3 md:mb-4 text-slate-700">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Upload size={24} />
                </div>
                <h3 className="text-lg font-semibold">导入数据 (恢复)</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4 md:mb-6 leading-relaxed">
                从之前的备份文件中恢复数据。注意：这将覆盖当前的现有数据，请谨慎操作。
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
           <p className="font-semibold mb-1">手机端下载说明</p>
           <p>点击“下载 / 保存备份”后，如弹出分享菜单，请选择 <strong>“存储到文件”</strong> (iOS) 或 <strong>“保存到手机/文件管理器”</strong> (Android) 以便选择保存位置（如手机根目录）。</p>
       </div>
    </div>
  );
};

export default Settings;