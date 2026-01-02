import React, { useState } from 'react';
import { Equipment, EquipmentType } from '../types';
import { EQUIPMENT_TYPES } from '../constants';
import { Plus, Trash2, Settings, X } from 'lucide-react';
import { HandGrinderIcon, V60Icon, ScaleIcon } from './CustomIcons';
import CustomSelect from './CustomSelect';

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
      case EquipmentType.GRINDER: return <HandGrinderIcon size={18} className="text-slate-400" />;
      case EquipmentType.BREWER: return <V60Icon size={18} className="text-slate-400" />;
      case EquipmentType.SCALE: return <ScaleIcon size={18} className="text-slate-400" />;
      default: return <Settings size={18} className="text-slate-400" />;
    }
  };

  const groupedEquipment = EQUIPMENT_TYPES.map(type => ({
    type,
    items: equipment.filter(e => e.type === type)
  })).filter(group => group.items.length > 0 || group.type === EquipmentType.GRINDER);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">设备</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 font-bold text-sm"
        >
          <Plus size={18} />
          <span>添加设备</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold text-slate-800">添加新设备</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">设备类型</label>
              <CustomSelect
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val as EquipmentType })}
                options={EQUIPMENT_TYPES.map(t => ({ value: t, label: t }))}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">品牌</label>
              <input
                type="text"
                placeholder="例如: Comandante, Hario"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">设备型号</label>
               <input
                type="text"
                placeholder="例如: C40 MK4 / V60 02 陶瓷"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">备注</label>
               <input
                type="text"
                placeholder="例如: 常用研磨设定 25 clicks"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md shadow-amber-200 text-sm transition-all active:scale-95"
              >
                保存设备
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {groupedEquipment.map(group => (
            <div key={group.type}>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {getTypeIcon(group.type)}
                    {group.type}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.items.length === 0 ? (
                        <div className="col-span-full bg-slate-50 p-6 rounded-2xl text-slate-400 text-sm font-medium text-center border border-dashed border-slate-200/60">
                            暂无{group.type}记录
                        </div>
                    ) : (
                        group.items.map(item => (
                            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-all active:scale-[0.99] group">
                                <div className="min-w-0 pr-4">
                                    <div className="font-bold text-slate-800 text-base leading-snug truncate">{item.name}</div>
                                    <div className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-wide">{item.brand || '通用品牌'}</div>
                                    {item.notes && <div className="text-xs text-slate-400 mt-2.5 font-medium italic">"{item.notes}"</div>}
                                </div>
                                <button
                                    onClick={() => onDeleteEquipment(item.id)}
                                    className="text-slate-200 hover:text-red-500 p-2 -mr-2 transition-colors"
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
      </div>
    </div>
  );
};

export default EquipmentManager;