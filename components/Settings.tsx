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
  
  // Platform Detection
  const [isNative, setIsNative] = useState(false);
  // Web capabilities
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
                      <body style="margin:0; padding:16px; font-family: monospace; background: #f8fafc; color: #334155;">
                          <div style="margin-bottom: 16px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
                              <p style="margin:0 0 8px 0; font-weight:bold;">提示：</p>
                              <p style="margin:0; font-size: 14px;">这是您的数据纯文本。您可以"全选+复制"，或使用浏览器的"分享/保存网页"功能。</p>
                          </div>
                          <pre style="white-space: pre-wrap; word-wrap: break-word;">${jsonString}</pre>
                      </body>
                  </html>
              `);
              newWindow.document.close();
          } else {
              alert("无法打开新窗口，请检查是否被浏览器拦截，或直接使用'复制数据'。");
          }
      } catch (e: any) {
          console.error("Preview failed", e);
          alert("打开预览失败");
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
        alert(`保存成功！\n文件已保存至您的【文档】文件夹:\n${fileName}`);
    } catch (e: any) {
        console.error("Native save failed:", e);
        alert(`保存失败: ${e.message}\n请尝试使用"分享备份"功能。`);
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
            text: '这是我的咖啡冲煮记录备份',
            url: result.uri,
            dialogTitle: '分享备份文件'
        });
      } catch (e: any) {
          console.error("Native share failed:", e);
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
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            setIsExporting(false);
        }, 100);
    } catch (e: any) {
        console.error("Export failed:", e);
        alert(`导出出错: ${e.message}`);
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
      if (!navigator.share) {
          alert("浏览器不支持分享");
          return;
      }
      try {
          const file = new File([jsonString], fileName, { type: 'text/plain' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Coffee App 备份', text: '备份数据' });
          } else {
              await navigator.share({ title: 'Coffee App 备份数据', text: jsonString });
          }
      } catch (e) {
          console.error("Share failed", e);
      }
  };

  const processImportJSON = (jsonString: string) => {
      try {
        const json = JSON.parse(jsonString);
        if (!json.beans || !json.logs || !Array.isArray(json.beans) || !Array.isArray(json.logs)) {
          throw new Error('无效的备份数据格式');
        }
        saveBeans(json.beans);
        saveLogs(json.logs);
        const importedEquipment = json.equipment && Array.isArray(json.equipment) ? json.equipment : [];
        saveEquipment(importedEquipment);
        onImportSuccess(json.beans, json.logs, importedEquipment);
        setImportStatus('success');
        setStatusMessage(`成功恢复: ${json.beans.length} 款豆子, ${json.logs.length} 条记录`);
      } catch (err) {
        console.error(err);
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
    <div className="space-y-4 md:space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-xl md:text-2xl font-bold text-slate-800">数据归档</h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-3 md:mb-4 text-amber-700">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Download size={24} />
                        </div>
                        <h3 className="text-lg font-semibold">数据备份</h3>
                    </div>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                    <div className="flex gap-2">
                        {isNative ? (
                            <>
                                <button onClick={handleNativeSave} disabled={isExporting} className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    保存到手机
                                </button>
                                <button onClick={handleNativeShare} className="flex-1 py-3 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                                    <Share2 size={18} /> 分享
                                </button>
                            </>
                        ) : (
                            <>
                                {supportsFileSystemApi && (
                                    <button onClick={handleWebNativeSave} disabled={isExporting} className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 另存为
                                    </button>
                                )}
                                {canWebShare && (
                                    <button onClick={handleWebShare} className={`flex-1 py-3 ${(!supportsFileSystemApi && isMobileWeb) ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'} rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]`}>
                                        <Share2 size={18} /> 分享
                                    </button>
                                )}
                                <button onClick={handleWebExport} disabled={isExporting} className={`flex-1 py-3 ${(supportsFileSystemApi || (canWebShare && isMobileWeb)) ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-amber-600 text-white hover:bg-amber-700'} rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]`}>
                                    {isExporting && !supportsFileSystemApi ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 下载
                                </button>
                            </>
                        )}
                    </div>
                    {!isNative && (
                        <button onClick={handlePreviewData} className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                            <ExternalLink size={18} /> 预览数据
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-3 md:mb-4 text-slate-700">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Upload size={24} />
                        </div>
                        <h3 className="text-lg font-semibold">数据恢复</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 md:mb-6 leading-relaxed">
                        选择之前的备份文件 (.txt 或 .json) 进行恢复。<br/>
                        <span className="text-amber-600 font-medium">注意：这将覆盖当前所有数据。</span>
                    </p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".txt,.json" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                    <Upload size={18} /> {isNative ? '选择文件 (从存储)' : '选择备份文件'}
                </button>
            </div>
       </div>
        {(importStatus === 'success' || importStatus === 'error') && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${importStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {importStatus === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="font-medium text-sm">{statusMessage}</span>
                <button onClick={() => setImportStatus('idle')} className="ml-auto opacity-50 hover:opacity-100"><div className="text-lg">×</div></button>
            </div>
        )}
    </div>
  );
};

export default Settings;