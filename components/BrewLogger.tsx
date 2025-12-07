import React, { useState } from 'react';
import { Bean, BrewLog, BrewMethod, Equipment, EquipmentType } from '../types';
import { BREW_METHODS } from '../constants';
import { Droplet, Clock, Thermometer, Plus, ChevronDown, ChevronUp, Settings2, X, Pencil, Trash2 } from 'lucide-react';
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

  // Form State - Using 'any' to allow strings for numeric fields during editing (fixes decimal input bugs)
  const [formData, setFormData] = useState<any>({
    method: BrewMethod.V60,
    doseIn: '15',
    yieldOut: '225',
    timeSeconds: '150',
    temperature: '92',
    grinderId: '',
    brewerId: '',
    grinderSetting: '3.0',
    rating: '',
    notes: '',
  });

  const grinders = equipment.filter(e => e.type === EquipmentType.GRINDER);
  const brewers = equipment.filter(e => e.type === EquipmentType.BREWER || e.type === EquipmentType.OTHER);

  const resetForm = () => {
    setFormData({
      id: undefined,
      method: BrewMethod.V60,
      doseIn: '15',
      yieldOut: '225',
      timeSeconds: '150',
      temperature: '92',
      grinderId: '',
      brewerId: '',
      grinderSetting: '3.0',
      rating: '',
      notes: '',
      beanId: undefined, 
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

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条冲煮记录吗？')) {
      onDeleteLog(id);
      if (expandedLogId === id) setExpandedLogId(null);
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
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">冲煮记录</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium">记一笔</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-700">{formData.id ? '编辑冲煮记录' : '新冲煮'}</h3>
              <button type="button" onClick={resetForm} className="text-slate-400 p-2"><X size={20}/></button>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">咖啡豆 (库存)</label>
              <CustomSelect
                value={formData.beanId}
                onChange={(val) => setFormData({ ...formData, beanId: val })}
                placeholder="选择咖啡豆"
                options={beans.map(bean => ({
                    value: bean.id,
                    label: `${bean.name} - ${Number(bean.remainingWeight).toFixed(1).replace(/\.0$/, '')}g 剩余`
                }))}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">冲煮方式</label>
              <CustomSelect
                value={formData.method}
                onChange={(val) => setFormData({ ...formData, method: val as BrewMethod })}
                options={BREW_METHODS.map(m => ({ value: m, label: m }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 col-span-1 md:col-span-2">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">粉重(g)</label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center font-mono"
                        value={formData.doseIn}
                        onChange={e => setFormData({ ...formData, doseIn: e.target.value })}
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">
                       {isEspresso(formData.method as string) ? '液重(g)' : '注入水量(g)'}
                     </label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center font-mono"
                        value={formData.yieldOut}
                        onChange={e => setFormData({ ...formData, yieldOut: e.target.value })}
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 col-span-1 md:col-span-2">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">时间(s)</label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center font-mono"
                        value={formData.timeSeconds}
                        onChange={e => setFormData({ ...formData, timeSeconds: e.target.value })}
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">水温(°C)</label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center font-mono"
                        value={formData.temperature}
                        onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
            </div>
            
            <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">磨豆机</label>
                <CustomSelect
                    value={formData.grinderId}
                    onChange={(val) => setFormData({ ...formData, grinderId: val })}
                    placeholder="选择磨豆机"
                    options={[
                        { value: '', label: '未指定 / 无' },
                        ...grinders.map(g => ({
                            value: g.id,
                            label: `${g.name} ${g.brand ? `(${g.brand})` : ''}`
                        }))
                    ]}
                />
            </div>

             <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">研磨度</label>
              <input
                type="text"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.grinderSetting}
                onChange={e => setFormData({ ...formData, grinderSetting: e.target.value })}
                placeholder="例如: 24 clicks"
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">滤杯/设备</label>
              <CustomSelect
                    value={formData.brewerId}
                    onChange={(val) => setFormData({ ...formData, brewerId: val })}
                    placeholder="未指定 (默认)"
                    options={[
                        { value: '', label: '未指定 (默认)' },
                        ...brewers.map(b => ({
                            value: b.id,
                            label: `${b.name} ${b.brand ? `(${b.brand})` : ''}`
                        }))
                    ]}
                />
            </div>

             <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">评分 (可选 1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                placeholder="-"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-600 placeholder:text-slate-300"
                value={formData.rating}
                onChange={e => setFormData({ ...formData, rating: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">风味描述 / 备注</label>
              <textarea
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="口感如何？"
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-4">
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
                {formData.id ? '保存修改' : '保存记录'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {logs.slice().reverse().map(log => {
          const bean = beans.find(b => b.id === log.beanId);
          const isExpanded = expandedLogId === log.id;
          const grinderName = getEquipmentName(log.grinderId);
          const brewerName = getEquipmentName(log.brewerId);
          const isLogEspresso = isEspresso(log.method);

          return (
            <div key={log.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.99] transition-transform duration-100">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
              >
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm text-sm md:text-base ${
                      log.rating === undefined 
                        ? 'bg-slate-200 text-slate-400' 
                        : log.rating >= 8 ? 'bg-amber-500' : log.rating >= 6 ? 'bg-amber-400' : 'bg-slate-400'
                    }`}>
                    {log.rating !== undefined ? log.rating : '-'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm md:text-base truncate">{bean?.name || '未知咖啡豆'}</h4>
                    <p className="text-xs text-slate-500 truncate">{new Date(log.date).toLocaleDateString()} • {log.method}</p>
                  </div>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                       <div className="p-1.5 bg-white rounded-md shadow-sm text-amber-600"><Droplet size={14} /></div>
                       <div className="text-xs">
                         <span className="block text-[10px] text-slate-400">
                             {isLogEspresso ? '粉液比' : '粉水比'}
                         </span>
                         {log.doseIn}g / {log.yieldOut}g
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                       <div className="p-1.5 bg-white rounded-md shadow-sm text-amber-600"><Clock size={14} /></div>
                       <div className="text-xs">
                         <span className="block text-[10px] text-slate-400">时间</span>
                         {formatTime(log.timeSeconds)}
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                       <div className="p-1.5 bg-white rounded-md shadow-sm text-amber-600"><Thermometer size={14} /></div>
                       <div className="text-xs">
                         <span className="block text-[10px] text-slate-400">水温</span>
                         {log.temperature}°C
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                       <div className="p-1.5 bg-white rounded-md shadow-sm text-amber-600"><Settings2 size={14} /></div>
                       <div className="text-xs">
                         <span className="block text-[10px] text-slate-400">研磨</span>
                         {log.grinderSetting}
                       </div>
                    </div>
                  </div>
                  
                  {(grinderName || brewerName) && (
                      <div className="mb-3 flex flex-wrap gap-2">
                           {grinderName && <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{grinderName}</span>}
                           {brewerName && <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{brewerName}</span>}
                      </div>
                  )}

                  {log.notes && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 mb-1">
                        <p className="text-sm text-slate-700 italic">"{log.notes}"</p>
                      </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={() => handleEdit(log)}
                        className="flex items-center gap-1 text-slate-400 hover:text-amber-600 transition-colors py-1 px-2 hover:bg-slate-100 rounded-lg text-xs"
                    >
                        <Pencil size={14} /> 编辑
                    </button>
                    <button
                        onClick={() => handleDelete(log.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors py-1 px-2 hover:bg-slate-100 rounded-lg text-xs"
                    >
                        <Trash2 size={14} /> 删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="text-center p-8 text-slate-400">
            暂无记录。快去冲一杯咖啡吧！
          </div>
        )}
      </div>
    </div>
  );
};

export default BrewLogger;