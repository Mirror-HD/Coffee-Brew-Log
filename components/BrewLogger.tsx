import React, { useState } from 'react';
import { Bean, BrewLog, BrewMethod, Equipment, EquipmentType } from '../types';
import { BREW_METHODS } from '../constants';
import { Droplet, Clock, Thermometer, Plus, ChevronDown, ChevronUp, Settings2, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface BrewLoggerProps {
  logs: BrewLog[];
  beans: Bean[];
  equipment: Equipment[];
  onAddLog: (log: BrewLog) => void;
  onUpdateLog: (log: BrewLog) => void;
  onDeleteLog: (id: string) => void;
  onUpdateBean?: (bean: Bean) => void; 
}

const BrewLogger: React.FC<BrewLoggerProps> = ({ logs, beans, equipment, onAddLog, onUpdateLog, onDeleteLog, onUpdateBean }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  // Helper to get last used settings for a specific method
  const getLastSettings = (method: BrewMethod) => {
      // Search from newest to oldest
      const lastLog = [...logs].reverse().find(l => l.method === method);
      return {
          grinderId: lastLog?.grinderId || '',
          brewerId: lastLog?.brewerId || '',
          grinderSetting: lastLog?.grinderSetting || ''
      };
  };

  // Helper to get defaults based on method
  const getDefaultsForMethod = (method: BrewMethod) => {
      const lastSettings = getLastSettings(method);
      
      if (method === BrewMethod.ESPRESSO) {
          return {
              doseIn: '18',
              yieldOut: '', // Blank for Espresso
              timeSeconds: '', // Blank
              temperature: '', // Blank and optional
              grinderId: lastSettings.grinderId,
              brewerId: '', // No brewer for Espresso usually
              grinderSetting: lastSettings.grinderSetting,
          };
      } 
      
      if (method === BrewMethod.V60) {
           return {
              doseIn: '15',
              yieldOut: '225',
              timeSeconds: '', // Blank
              temperature: '', // Blank
              grinderId: lastSettings.grinderId,
              brewerId: lastSettings.brewerId,
              grinderSetting: lastSettings.grinderSetting,
          };
      }

      // Fallback for other methods (Reuse V60 logic or generic)
      return {
          doseIn: '15',
          yieldOut: '225',
          timeSeconds: '',
          temperature: '',
          grinderId: lastSettings.grinderId,
          brewerId: lastSettings.brewerId,
          grinderSetting: lastSettings.grinderSetting,
      };
  };

  // Form State - Using 'any' to allow strings for numeric fields during editing
  const [formData, setFormData] = useState<any>({
    method: BrewMethod.V60,
    doseIn: '15',
    yieldOut: '225',
    timeSeconds: '',
    temperature: '',
    grinderId: '',
    brewerId: '',
    grinderSetting: '',
    rating: '',
    notes: '',
  });

  const grinders = equipment.filter(e => e.type === EquipmentType.GRINDER);
  const brewers = equipment.filter(e => e.type === EquipmentType.BREWER || e.type === EquipmentType.OTHER);

  const resetForm = () => {
    // Default to V60 when opening fresh
    const defaultMethod = BrewMethod.V60;
    const defaults = getDefaultsForMethod(defaultMethod);

    setFormData({
      id: undefined,
      beanId: undefined,
      method: defaultMethod,
      ...defaults,
      rating: '',
      notes: '', 
    });
    setIsFormOpen(false);
  };

  const handleEdit = (log: BrewLog) => {
    // Convert numbers to strings for form state
    setFormData({
        ...log,
        doseIn: log.doseIn.toString(),
        yieldOut: log.yieldOut.toString(),
        timeSeconds: log.timeSeconds.toString(),
        temperature: log.temperature.toString(),
        rating: log.rating !== undefined ? log.rating.toString() : '',
    });
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (logToDelete) {
      onDeleteLog(logToDelete);
      if (expandedLogId === logToDelete) setExpandedLogId(null);
      setLogToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beanId) {
      alert("请选择一款咖啡豆");
      return;
    }

    const dose = parseFloat(formData.doseIn) || 0;
    const yieldVal = parseFloat(formData.yieldOut) || 0;
    const timeVal = parseFloat(formData.timeSeconds) || 0;
    // For Espresso, if temp is empty, it saves as 0. 
    // This is consistent with current behavior where 0 implies not recorded/cold if we don't have nullable types.
    const tempVal = parseFloat(formData.temperature) || 0; 
    const ratingVal = formData.rating ? parseFloat(formData.rating) : undefined;
    
    // Only deduct inventory for NEW logs to avoid double deduction on edit
    if (!formData.id && onUpdateBean) {
        const selectedBean = beans.find(b => b.id === formData.beanId);
        if (selectedBean) {
            const newRemaining = Math.max(0, selectedBean.remainingWeight - dose);
            onUpdateBean({ ...selectedBean, remainingWeight: newRemaining });
        }
    }

    const logData: BrewLog = {
      id: formData.id || crypto.randomUUID(),
      beanId: formData.beanId,
      date: formData.date || Date.now(),
      method: formData.method as BrewMethod,
      doseIn: dose,
      yieldOut: yieldVal,
      timeSeconds: timeVal,
      temperature: tempVal,
      
      grinderId: formData.grinderId,
      brewerId: formData.brewerId,
      
      grinderSetting: formData.grinderSetting || '',
      rating: ratingVal,
      notes: formData.notes || '',
    };

    if (formData.id) {
        onUpdateLog(logData);
    } else {
        onAddLog(logData);
    }

    resetForm();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEquipmentName = (id?: string) => {
      if (!id) return '';
      const eq = equipment.find(e => e.id === id);
      return eq ? eq.name : '';
  };

  // Helper to determine labels based on method
  const isEspresso = (method?: string) => method === BrewMethod.ESPRESSO;

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Custom Delete Modal */}
      {logToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setLogToDelete(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center mb-5">
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                        <AlertTriangle size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">确认删除</h3>
                      <p className="text-sm text-slate-600 mt-1">
                          您确定要删除这条冲煮记录吗？
                          <br/><span className="text-xs text-slate-400 mt-1 block">此操作无法撤销。</span>
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setLogToDelete(null)}
                          className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
                      >
                          删除
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">冲煮记录</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium">{isFormOpen ? '关闭' : '记一杯'}</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 mb-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-700">{formData.id ? '编辑记录' : '新冲煮'}</h3>
                    <button type="button" onClick={resetForm} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">咖啡豆</label>
                    <CustomSelect
                        value={formData.beanId}
                        onChange={(val) => setFormData({ ...formData, beanId: val })}
                        options={beans.filter(b => b.isActive || b.id === formData.beanId).map(b => ({ value: b.id, label: `${b.name} (${b.roaster})` }))}
                        placeholder="选择咖啡豆..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">冲煮方式</label>
                    <CustomSelect
                        value={formData.method}
                        onChange={(val) => {
                            const newMethod = val as BrewMethod;
                            const defaults = getDefaultsForMethod(newMethod);
                            setFormData((prev: any) => ({
                                ...prev,
                                method: newMethod,
                                ...defaults
                            }));
                        }}
                        options={BREW_METHODS.map(m => ({ value: m, label: m }))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">粉重 (g)</label>
                        <input
                            type="number" step="0.1"
                            value={formData.doseIn}
                            onChange={e => setFormData({ ...formData, doseIn: e.target.value })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{isEspresso(formData.method) ? '液重 (g)' : '注水 (g)'}</label>
                        <input
                            type="number" step="0.1"
                            value={formData.yieldOut}
                            onChange={e => setFormData({ ...formData, yieldOut: e.target.value })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">时间 (秒)</label>
                        <input
                            type="number"
                            value={formData.timeSeconds}
                            onChange={e => setFormData({ ...formData, timeSeconds: e.target.value })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">水温 (°C)</label>
                        <input
                            type="number" step="0.5"
                            value={formData.temperature}
                            onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            onWheel={(e) => e.currentTarget.blur()}
                            placeholder={isEspresso(formData.method) ? '可不填' : ''}
                        />
                     </div>
                </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">磨豆机</label>
                     <CustomSelect
                        value={formData.grinderId}
                        onChange={(val) => setFormData({ ...formData, grinderId: val })}
                        options={[{value: '', label: '未指定'}, ...grinders.map(g => ({ value: g.id, label: g.name }))]}
                    />
                </div>
                 
                 {/* Hide Brewer selection for Espresso */}
                 {!isEspresso(formData.method) && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">滤杯/器具</label>
                        <CustomSelect
                            value={formData.brewerId}
                            onChange={(val) => setFormData({ ...formData, brewerId: val })}
                            options={[{value: '', label: '未指定'}, ...brewers.map(b => ({ value: b.id, label: b.name }))]}
                        />
                    </div>
                 )}

                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">研磨刻度</label>
                    <input
                        type="text"
                        value={formData.grinderSetting}
                        onChange={e => setFormData({ ...formData, grinderSetting: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="例如: 3.5"
                    />
                </div>

                <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">评分 (1-10)</label>
                     <input
                        type="number" step="0.5" max="10"
                        value={formData.rating}
                        onChange={e => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                        onWheel={(e) => e.currentTarget.blur()}
                     />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">风味笔记</label>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
                        placeholder="描述口感、风味..."
                    />
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md shadow-amber-200"
                    >
                        {formData.id ? '更新记录' : '保存记录'}
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="space-y-4">
        {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p>暂无冲煮记录</p>
                <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="mt-2 text-amber-600 font-medium hover:underline">开始第一次冲煮</button>
            </div>
        ) : (
            [...logs].sort((a, b) => b.date - a.date).map(log => {
                const bean = beans.find(b => b.id === log.beanId);
                const isExpanded = expandedLogId === log.id;
                
                return (
                    <div key={log.id} 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden ${isExpanded ? 'shadow-md border-amber-200 ring-1 ring-amber-100' : 'shadow-sm border-slate-100 hover:border-amber-200'}`}
                    >
                        <div className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-800">{bean?.name || '未知咖啡豆'}</h3>
                                    <span className="text-xs text-slate-400 font-mono">{new Date(log.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-600 items-center">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-md">{log.method}</span>
                                    <span className="flex items-center gap-1"><Droplet size={12}/> {log.doseIn}g / {log.yieldOut}g</span>
                                    {log.timeSeconds > 0 && <span className="flex items-center gap-1"><Clock size={12}/> {formatTime(log.timeSeconds)}</span>}
                                    {log.rating && <span className="text-amber-600 font-bold">★ {log.rating}</span>}
                                </div>
                            </div>
                            
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400 md:ml-4 flex justify-center`}>
                                <ChevronDown size={20} />
                            </div>
                        </div>

                        {isExpanded && (
                             <div className="px-4 pb-4 pt-0 border-t border-slate-50 bg-slate-50/30">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-slate-600">
                                    <div>
                                        <span className="block text-xs text-slate-400 mb-1">磨豆机 / 刻度</span>
                                        <span className="font-medium">{getEquipmentName(log.grinderId) || '未指定'}</span>
                                        <span className="text-slate-400 mx-1">@</span>
                                        <span className="font-medium">{log.grinderSetting || '-'}</span>
                                    </div>
                                    {!isEspresso(log.method) && (
                                        <div>
                                            <span className="block text-xs text-slate-400 mb-1">滤杯</span>
                                            <span className="font-medium">{getEquipmentName(log.brewerId) || '未指定'}</span>
                                        </div>
                                    )}
                                    {log.temperature > 0 && (
                                        <div>
                                            <span className="block text-xs text-slate-400 mb-1">水温</span>
                                            <span className="flex items-center gap-1"><Thermometer size={14}/> {log.temperature}°C</span>
                                        </div>
                                    )}
                                    <div>
                                         <span className="block text-xs text-slate-400 mb-1">粉液比</span>
                                         <span className="font-medium">1 : {(log.yieldOut / log.doseIn).toFixed(1)}</span>
                                    </div>
                                </div>
                                
                                {log.notes && (
                                    <div className="mt-4 bg-white p-3 rounded-lg border border-slate-100 italic text-slate-700 text-sm">
                                        "{log.notes}"
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-slate-100/50">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(log); }}
                                        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                                    >
                                        <Pencil size={14} /> 编辑
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setLogToDelete(log.id); }}
                                        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                                    >
                                        <Trash2 size={14} /> 删除
                                    </button>
                                </div>
                             </div>
                        )}
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default BrewLogger;