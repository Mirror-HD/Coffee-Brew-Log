import React, { useState } from 'react';
import { Equipment, EquipmentType } from '../types';
import { EQUIPMENT_TYPES } from '../constants';
import { Plus, Trash2, Settings, X, ChevronDown } from 'lucide-react';
import { HandGrinderIcon, V60Icon, ScaleIcon } from './CustomIcons';

interface EquipmentManagerProps {
  equipment: Equipment[];
  onAddEquipment: (eq: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

const EquipmentManager: React.FC<EquipmentManagerProps> = ({ equipment, onAddEquipment, onDeleteEquipment }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    brand: '',
    type: EquipmentType.GRINDER,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) return;

    const newEquipment: Equipment = {
      id: crypto.randomUUID(),
      name: formData.name,
      brand: formData.brand || '',
      type: formData.type as EquipmentType,
      notes: formData.notes || ''
    };

    onAddEquipment(newEquipment);
    setIsFormOpen(false);
    setFormData({
      name: '',
      brand: '',
      type: EquipmentType.GRINDER,
      notes: ''
    });
  };

  const getTypeIcon = (type: EquipmentType) => {
    switch (type) {
      case EquipmentType.GRINDER: return <HandGrinderIcon size={18} />;
      case EquipmentType.BREWER: return <V60Icon size={18} />;
      case EquipmentType.SCALE: return <ScaleIcon size={18} />;
      default: return <Settings size={18} />;
    }
  };

  // Group equipment by type
  const groupedEquipment = EQUIPMENT_TYPES.map(type => ({
    type,
    items: equipment.filter(e => e.type === type)
  })).filter(group => group.items.length > 0 || group.type === EquipmentType.GRINDER);

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">我的设备</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium">添加设备</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-700">添加新设备</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 p-2"><X size={20}/></button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">设备类型</label>
              <div className="relative">
                <select
                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-slate-700 rounded-xl px-4 py-3 pr-10 outline-none transition-all duration-200 cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EquipmentType })}
                >
                    {EQUIPMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">品牌</label>
              <input
                type="text"
                placeholder="例如: Comandante, Hario"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
               <label className="block text-xs font-medium text-slate-500 mb-1">设备名称 (型号)</label>
               <input
                type="text"
                placeholder="例如: C40 MK4, V60 02 陶瓷"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
               <label className="block text-xs font-medium text-slate-500 mb-1">备注</label>
               <input
                type="text"
                placeholder="例如: 红色点击版"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md shadow-amber-200"
              >
                保存设备
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {groupedEquipment.map(group => (
            <div key={group.type}>
                <h3 className="text-base md:text-lg font-semibold text-slate-600 mb-3 flex items-center gap-2">
                    {getTypeIcon(group.type)}
                    {group.type}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.length === 0 ? (
                        <div className="col-span-full bg-slate-50 p-4 rounded-lg text-slate-400 text-sm text-center border border-dashed border-slate-200">
                            暂无{group.type}记录
                        </div>
                    ) : (
                        group.items.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow active:scale-[0.99]">
                                <div>
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                    <div className="text-sm text-amber-700">{item.brand}</div>
                                    {item.notes && <div className="text-xs text-slate-500 mt-2">{item.notes}</div>}
                                </div>
                                <button
                                    onClick={() => onDeleteEquipment(item.id)}
                                    className="text-slate-300 hover:text-red-500 p-2 -mr-2"
                                    title="删除"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        ))}
        
        {equipment.length === 0 && !isFormOpen && (
            <div className="text-center p-12 text-slate-400">
                <p>还没有添加任何设备。</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentManager;