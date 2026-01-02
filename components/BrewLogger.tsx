import React, { useState } from 'react';
import { Bean, BrewLog, BrewMethod, Equipment, EquipmentType } from '../types';
import { BREW_METHODS } from '../constants';
import { Droplet, Clock, Thermometer, Plus, ChevronDown, X, Pencil, Trash2, AlertTriangle, RotateCw, Timer, CheckCircle, Save, Play } from 'lucide-react';
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
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  const isColdBrew = (method?: string) => method === BrewMethod.COLD_BREW;
  const isEspresso = (method?: string) => method === BrewMethod.ESPRESSO;

  const [formData, setFormData] = useState<any>({
    method: BrewMethod.V60,
    doseIn: '15',
    purgeWeight: '',
    yieldOut: '225',
    timeSeconds: '',
    temperature: '',
    grinderId: '',
    brewerId: '',
    grinderSetting: '',
    notes: '',
  });

  const grinders = equipment.filter(e => e.type === EquipmentType.GRINDER);
  const brewers = equipment.filter(e => e.type === EquipmentType.BREWER || e.type === EquipmentType.OTHER);

  const getLastSettings = (method: BrewMethod) => {
      const lastLog = [...logs].reverse().find(l => l.method === method);
      return {
          grinderId: lastLog?.grinderId || '',
          brewerId: lastLog?.brewerId || '',
          grinderSetting: lastLog?.grinderSetting || '',
          purgeWeight: lastLog?.purgeWeight?.toString() || ''
      };
  };

  const getDefaultsForMethod = (method: BrewMethod) => {
      const lastSettings = getLastSettings(method);
      if (method === BrewMethod.ESPRESSO) {
          return {
              doseIn: '18', yieldOut: '', timeSeconds: '', temperature: '',
              grinderId: lastSettings.grinderId, brewerId: '', grinderSetting: lastSettings.grinderSetting,
              purgeWeight: lastSettings.purgeWeight || '',
          };
      } 
      if (method === BrewMethod.COLD_BREW) {
          return {
              doseIn: '30', yieldOut: '300', timeSeconds: '0', temperature: '0', 
              grinderId: lastSettings.grinderId, brewerId: '', grinderSetting: lastSettings.grinderSetting,
              purgeWeight: lastSettings.purgeWeight || '',
              startDate: new Date().toISOString().slice(0, 13) + ':00',
          };
      }
      return {
          doseIn: '15', yieldOut: '225', timeSeconds: '', temperature: '',
          grinderId: lastSettings.grinderId, brewerId: lastSettings.brewerId, grinderSetting: lastSettings.grinderSetting,
          purgeWeight: lastSettings.purgeWeight || '',
      };
  };

  const resetForm = () => {
    const defaultMethod = BrewMethod.V60;
    const defaults = getDefaultsForMethod(defaultMethod);
    setFormData({
      id: undefined, beanId: undefined, method: defaultMethod, ...defaults, notes: '', 
    });
    setIsFormOpen(false);
    setEditingLogId(null);
  };

  const handleEdit = (log: BrewLog) => {
    setFormData({
        ...log,
        doseIn: log.doseIn.toString(),
        purgeWeight: log.purgeWeight?.toString() || '',
        yieldOut: log.yieldOut.toString(),
        timeSeconds: log.timeSeconds.toString(),
        temperature: log.temperature.toString(),
        startDate: isColdBrew(log.method) ? new Date(log.date).toISOString().slice(0, 13) + ':00' : undefined
    });
    setIsFormOpen(false); 
    setEditingLogId(log.id);
    setExpandedLogId(null); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beanId) {
      alert("请选择一款咖啡豆");
      return;
    }

    const dose = parseFloat(formData.doseIn) || 0;
    const purge = parseFloat(formData.purgeWeight) || 0;
    const yieldVal = parseFloat(formData.yieldOut) || 0;
    const timeVal = parseFloat(formData.timeSeconds) || 0;
    const tempVal = parseFloat(formData.temperature) || 0; 
    
    const logDate = (isColdBrew(formData.method) && formData.startDate) 
        ? new Date(formData.startDate).getTime() 
        : (formData.date || Date.now());

    if (!formData.id && onUpdateBean) {
        const selectedBean = beans.find(b => b.id === formData.beanId);
        if (selectedBean) {
            const newRemaining = Math.max(0, selectedBean.remainingWeight - (dose + purge));
            onUpdateBean({ ...selectedBean, remainingWeight: newRemaining });
        }
    }

    const logData: BrewLog = {
      id: formData.id || crypto.randomUUID(),
      beanId: formData.beanId,
      date: logDate,
      method: formData.method as BrewMethod,
      doseIn: dose,
      purgeWeight: purge || undefined,
      yieldOut: yieldVal,
      timeSeconds: timeVal,
      temperature: tempVal,
      grinderId: formData.grinderId,
      brewerId: isColdBrew(formData.method) ? '' : formData.brewerId,
      grinderSetting: formData.grinderSetting || '',
      notes: formData.notes || '',
    };

    if (formData.id) {
        onUpdateLog(logData);
    } else {
        onAddLog(logData);
    }
    resetForm();
  };

  const handleFinishColdBrew = (log: BrewLog) => {
      const now = Date.now();
      const diffSeconds = Math.floor((now - log.date) / 1000);
      onUpdateLog({ ...log, timeSeconds: Math.max(1, diffSeconds) });
  };

  const formatDuration = (seconds: number, method?: BrewMethod) => {
    if (method === BrewMethod.COLD_BREW) {
        const totalHours = Math.floor(seconds / 3600);
        if (totalHours >= 24) {
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            return hours > 0 ? `${days}天${hours}小时` : `${days}天`;
        }
        return `${Math.max(1, totalHours)}小时`;
    }
    if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}时${mins}分`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEquipmentName = (id?: string) => {
      if (!id) return '';
      const eq = equipment.find(e => e.id === id);
      return eq ? eq.name : '';
  };

  const renderFormFields = (isInline: boolean = false) => (
    <div className={`${isInline ? '' : 'bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-6'} animate-in fade-in slide-in-from-top-4`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-slate-800">{formData.id ? '编辑冲煮' : '记一杯'}</h3>
                <button type="button" onClick={resetForm} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">咖啡豆</label>
                <CustomSelect
                    value={formData.beanId}
                    onChange={(val) => setFormData({ ...formData, beanId: val })}
                    options={beans.filter(b => b.isActive || b.id === formData.beanId).map(b => ({ value: b.id, label: `${b.name} (${b.roaster})` }))}
                    placeholder="选择咖啡豆..."
                />
            </div>

            <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">冲煮方式</label>
                <CustomSelect
                    value={formData.method}
                    onChange={(val) => {
                        const newMethod = val as BrewMethod;
                        setFormData((prev: any) => ({ ...prev, method: newMethod, ...getDefaultsForMethod(newMethod) }));
                    }}
                    options={BREW_METHODS.map(m => ({ value: m, label: m }))}
                />
            </div>

            {isColdBrew(formData.method) ? (
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">起始时间</label>
                    <input
                        type="datetime-local" step="3600"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">时间 (秒)</label>
                        <input
                            type="number" value={formData.timeSeconds}
                            onChange={e => setFormData({ ...formData, timeSeconds: e.target.value })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                        />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">水温 (°C)</label>
                        <input
                            type="number" step="0.5" value={formData.temperature}
                            onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                            placeholder={isEspresso(formData.method) ? '可不填' : ''}
                        />
                     </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">粉重 (g)</label>
                    <input
                        type="number" step="0.1" value={formData.doseIn}
                        onChange={e => setFormData({ ...formData, doseIn: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                    />
                 </div>
                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">洗磨 (g)</label>
                    <input
                        type="number" step="0.1" value={formData.purgeWeight}
                        onChange={e => setFormData({ ...formData, purgeWeight: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                        placeholder="可选"
                    />
                 </div>
                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{isEspresso(formData.method) ? '液重 (g)' : '注水 (g)'}</label>
                    <input
                        type="number" step="0.1" value={formData.yieldOut}
                        onChange={e => setFormData({ ...formData, yieldOut: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                    />
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">磨豆机</label>
                    <CustomSelect
                        value={formData.grinderId}
                        onChange={(val) => setFormData({ ...formData, grinderId: val })}
                        options={[{value: '', label: '未指定'}, ...grinders.map(g => ({ value: g.id, label: g.name }))]}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">研磨刻度</label>
                    <input
                        type="text" value={formData.grinderSetting}
                        onChange={e => setFormData({ ...formData, grinderSetting: e.target.value })}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                        placeholder="例如: 3.5"
                    />
                </div>
            </div>
             
            {!isEspresso(formData.method) && !isColdBrew(formData.method) && (
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">滤杯/器具</label>
                    <CustomSelect
                        value={formData.brewerId}
                        onChange={(val) => setFormData({ ...formData, brewerId: val })}
                        options={[{value: '', label: '未指定'}, ...brewers.map(b => ({ value: b.id, label: b.name }))]}
                    />
                </div>
            )}

            <div className="col-span-1 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">风味笔记</label>
                <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none text-sm font-medium"
                    placeholder="描述口感、风味细节..."
                />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm">取消</button>
                <button type="submit" className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md flex items-center gap-2 text-sm transition-all active:scale-95">
                    {isInline ? <Save size={16}/> : (isColdBrew(formData.method) && formData.timeSeconds === '0' ? <Play size={16}/> : <CheckCircle size={16}/>)}
                    {isColdBrew(formData.method) && formData.timeSeconds === '0' && !formData.id ? '开始冷萃' : (formData.id ? '保存修改' : '保存冲煮记录')}
                </button>
            </div>
        </form>
    </div>
  );

  return (
    <div className="space-y-6">
      {logToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setLogToDelete(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">确认删除</h3>
                      <p className="text-sm text-slate-500 mt-2">您确定要删除这条冲煮记录吗？</p>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setLogToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">取消</button>
                      <button onClick={() => { if(logToDelete){ onDeleteLog(logToDelete); setLogToDelete(null); } }} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm shadow-sm shadow-red-200">确认删除</button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">记录</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 font-bold text-sm"
        >
          <Plus size={18} />
          <span>{isFormOpen ? '收起表单' : '记一杯'}</span>
        </button>
      </div>

      {isFormOpen && renderFormFields()}

      <div className="space-y-4">
        {logs.length > 0 && [...logs].sort((a, b) => b.date - a.date).map(log => {
                const isEditing = editingLogId === log.id;
                const isExpanded = expandedLogId === log.id;
                const bean = beans.find(b => b.id === log.beanId);
                const isOngoingColdBrew = isColdBrew(log.method) && log.timeSeconds === 0;

                if (isEditing) {
                    return (
                        <div key={log.id} className="bg-white rounded-2xl border border-amber-200 shadow-lg p-6 animate-in zoom-in-95 duration-200">
                            {renderFormFields(true)}
                        </div>
                    );
                }
                
                return (
                    <div key={log.id} 
                        onClick={() => !isEditing && setExpandedLogId(isExpanded ? null : log.id)}
                        className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden ${isExpanded ? 'shadow-md border-amber-200 ring-1 ring-amber-100' : 'shadow-sm border-slate-100 hover:border-amber-200'} ${isOngoingColdBrew ? 'border-blue-200 bg-blue-50/20' : ''}`}
                    >
                        <div className="p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        {bean?.name || '未知咖啡豆'}
                                        {isOngoingColdBrew && <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>}
                                    </h3>
                                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{new Date(log.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 items-center">
                                    <span className={`px-2 py-0.5 rounded-md ${isOngoingColdBrew ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>{log.method}</span>
                                    <span className="flex items-center gap-1"><Droplet size={13} className="text-amber-600"/> {log.doseIn}g / {log.yieldOut}g</span>
                                    {isOngoingColdBrew ? (
                                        <span className="flex items-center gap-1 text-blue-600 font-bold italic"><Timer size={13}/> 萃取中...</span>
                                    ) : (
                                        log.timeSeconds > 0 && <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400"/> {formatDuration(log.timeSeconds, log.method)}</span>
                                    )}
                                </div>
                            </div>
                            
                            {isOngoingColdBrew ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleFinishColdBrew(log); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                                >
                                    <CheckCircle size={16}/> 结束冷萃
                                </button>
                            ) : (
                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-300 md:ml-4 flex justify-center`}>
                                    <ChevronDown size={22} />
                                </div>
                            )}
                        </div>

                        {isExpanded && (
                             <div className="px-5 pb-5 pt-1 border-t border-slate-50 bg-slate-50/30">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">磨豆机 / 刻度</span>
                                        <div className="text-sm font-bold text-slate-700 leading-snug">
                                            {getEquipmentName(log.grinderId) || '未指定'}
                                            <span className="text-amber-600 mx-1.5">@</span>
                                            {log.grinderSetting || '-'}
                                        </div>
                                    </div>
                                    {!isEspresso(log.method) && !isColdBrew(log.method) && (
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">滤杯/器具</span>
                                            <div className="text-sm font-bold text-slate-700 leading-snug">{getEquipmentName(log.brewerId) || '未指定'}</div>
                                        </div>
                                    )}
                                    {log.temperature > 0 && (
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">冲煮水温</span>
                                            <div className="text-sm font-bold text-slate-700 leading-snug flex items-center gap-1"><Thermometer size={14} className="text-red-400"/> {log.temperature}°C</div>
                                        </div>
                                    )}
                                    <div>
                                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">粉液比</span>
                                         <div className="text-sm font-bold text-slate-700 leading-snug">1 : {(log.yieldOut / log.doseIn).toFixed(1)}</div>
                                    </div>
                                </div>
                                
                                {log.notes && (
                                    <div className="mt-5 p-4 bg-white rounded-xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed shadow-sm">
                                        "{log.notes}"
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 mt-5 pt-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(log); }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-700 px-3.5 py-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all"><Pencil size={14} /> 编辑</button>
                                    <button onClick={(e) => { e.stopPropagation(); setLogToDelete(log.id); }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 px-3.5 py-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all"><Trash2 size={14} /> 删除</button>
                                </div>
                             </div>
                        )}
                    </div>
                );
            })}
      </div>
    </div>
  );
};

export default BrewLogger;