import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, Loader2, Share2, ExternalLink, Save } from 'lucide-react';
import { Bean, BrewLog, Equipment } from '../types';
import { saveBeans, saveEquipment, saveLogs } from '../services/storageService';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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
  
  const [isNative, setIsNative] = useState(false);
  const [supportsFileSystemApi, setSupportsFileSystemApi] = useState(false);
  const [isMobileWeb, setIsMobileWeb] = useState(false);
  const [canWebShare, setCanWebShare] = useState(false);
  
  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    if (!native) {
        if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
            setSupportsFileSystemApi(true);
        }
        if (typeof navigator !== 'undefined') {
            const mobileCheck = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            setIsMobileWeb(mobileCheck);
            setCanWebShare(!!navigator.share);
        }
    }
  }, []);

  const getExportDataString = () => {
    const data = {
        version: '1.0',
        timestamp: Date.now(),
        beans,
        logs,
        equipment
    };
    return JSON.stringify(data, null, 2);
  };

  const handlePreviewData = () => {
      try {
          const jsonString = getExportDataString();
          const newWindow = window.open('', '_blank');
          if (newWindow) {
              newWindow.document.write(`
                  <html>
                      <head><title>Coffee App 数据备份</title></head>
                      <body style="margin:0; padding:16px; font-family: sans-serif; background: #f8fafc; color: #334155;">
                          <div style="margin-bottom: 16px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
                              <p style="margin:0 0 8px 0; font-weight:bold;">提示：</p>
                              <p style="margin:0; font-size: 14px;">这是您的数据纯文本。您可以全选复制并保存。</p>
                          </div>
                          <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace; font-size: 12px;">${jsonString}</pre>
                      </body>
                  </html>
              `);
              newWindow.document.close();
          }
      } catch (e: any) {
          alert("预览失败");
      }
  };

  const handleNativeSave = async () => {
    setIsExporting(true);
    try {
        const jsonString = getExportDataString();
        const fileName = `coffee_backup_${new Date().toISOString().split('T')[0]}.txt`;
        await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        alert(`保存成功！\n文件已保存至：${fileName}`);
    } catch (e: any) {
        alert(`保存失败: ${e.message}`);
    } finally {
        setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
      try {
        const jsonString = getExportDataString();
        const fileName = `coffee_backup_${new Date().toISOString().split('T')[0]}.txt`;
        const result = await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: Directory.Cache,
            encoding: Encoding.UTF8
        });
        await Share.share({
            title: 'Coffee App 备份',
            url: result.uri,
            dialogTitle: '分享备份文件'
        });
      } catch (e: any) {
          console.error(e);
      }
  };

  const handleWebExport = () => {
    setIsExporting(true);
    try {
        const jsonString = getExportDataString();
        const fileName = `coffee_backup_${new Date().toISOString().split('T')[0]}.txt`;
        const blob = new Blob([jsonString], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            setIsExporting(false);
        }, 100);
    } catch (e: any) {
        setIsExporting(false);
    }
  };

  const handleWebNativeSave = async () => {
      setIsExporting(true);
      try {
          const jsonString = getExportDataString();
          const fileName = `coffee_backup_${new Date().toISOString().split('T')[0]}.txt`;
          // @ts-ignore
          const fileHandle = await window.showSaveFilePicker({
              suggestedName: fileName,
              types: [{ description: 'Text File', accept: { 'text/plain': ['.txt'] } }],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          alert("保存成功！");
      } catch (e: any) {
          if (e.name !== 'AbortError') alert(`保存失败: ${e.message}`);
      } finally {
          setIsExporting(false);
      }
  };

  const handleWebShare = async () => {
      const jsonString = getExportDataString();
      const fileName = `coffee_backup_${new Date().toISOString().split('T')[0]}.txt`;
      if (!navigator.share) return;
      try {
          const file = new File([jsonString], fileName, { type: 'text/plain' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Coffee App 备份' });
          } else {
              await navigator.share({ title: 'Coffee App 备份', text: jsonString });
          }
      } catch (e) {
          console.error(e);
      }
  };

  const processImportJSON = (jsonString: string) => {
      try {
        const json = JSON.parse(jsonString);
        if (!json.beans || !json.logs || !Array.isArray(json.beans) || !Array.isArray(json.logs)) {
          throw new Error('无效格式');
        }
        saveBeans(json.beans);
        saveLogs(json.logs);
        const importedEquipment = json.equipment && Array.isArray(json.equipment) ? json.equipment : [];
        saveEquipment(importedEquipment);
        onImportSuccess(json.beans, json.logs, importedEquipment);
        setImportStatus('success');
        setStatusMessage(`成功恢复: ${json.beans.length} 款豆子, ${json.logs.length} 条记录`);
      } catch (err) {
        setImportStatus('error');
        setStatusMessage('导入失败: 数据格式错误');
      }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        processImportJSON(event.target?.result as string);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-slate-800">设置</h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center gap-3 mb-5 text-amber-700">
                    <div className="p-2 bg-amber-50 rounded-xl">
                        <Download size={22} />
                    </div>
                    <h3 className="text-lg font-bold">数据备份</h3>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                    将所有冲煮数据、豆仓记录和设备信息导出为备份文件。
                </p>
                <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex gap-2">
                        {isNative ? (
                            <>
                                <button onClick={handleNativeSave} disabled={isExporting} className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-200 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.98]">
                                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 保存
                                </button>
                                <button onClick={handleNativeShare} className="flex-1 py-3 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                                    <Share2 size={16} /> 分享
                                </button>
                            </>
                        ) : (
                            <>
                                {supportsFileSystemApi && (
                                    <button onClick={handleWebNativeSave} disabled={isExporting} className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-200 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 另存为
                                    </button>
                                )}
                                {canWebShare && (
                                    <button onClick={handleWebShare} className={`flex-1 py-3 ${(!supportsFileSystemApi && isMobileWeb) ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'} rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]`}>
                                        <Share2 size={16} /> 分享
                                    </button>
                                )}
                                <button onClick={handleWebExport} disabled={isExporting} className={`flex-1 py-3 ${(supportsFileSystemApi || (canWebShare && isMobileWeb)) ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-amber-600 text-white hover:bg-amber-700'} rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]`}>
                                    {isExporting && !supportsFileSystemApi ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 下载
                                </button>
                            </>
                        )}
                    </div>
                    {!isNative && (
                        <button onClick={handlePreviewData} className="w-full py-3 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                            <ExternalLink size={16} /> 预览纯文本数据
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center gap-3 mb-5 text-slate-700">
                    <div className="p-2 bg-slate-50 rounded-xl">
                        <Upload size={22} />
                    </div>
                    <h3 className="text-lg font-bold">数据恢复</h3>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                    从备份文件恢复数据。注意：这会<span className="text-red-500">覆盖</span>当前所有内容。
                </p>
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".txt,.json" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-[0.98] mt-auto">
                    <Upload size={16} /> 导入备份文件
                </button>
            </div>
       </div>
        {(importStatus === 'success' || importStatus === 'error') && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border ${importStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {importStatus === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="font-bold text-sm">{statusMessage}</span>
                <button onClick={() => setImportStatus('idle')} className="ml-auto font-black text-lg">×</button>
            </div>
        )}
    </div>
  );
};

export default Settings;