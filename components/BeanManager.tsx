import React, { useState } from 'react';
import { Bean, RoastLevel, BeanCategory, BlendPart, BeanOwner } from '../types';
import { ROAST_LEVELS, BEAN_CATEGORIES, BEAN_OWNERS } from '../constants';
import { Plus, Trash2, Calendar, Layers, X, Search, Pencil, CheckCircle2, AlertTriangle, Users, ChevronDown } from 'lucide-react';
import { CoffeeBeanIcon } from './CustomIcons';
import CustomSelect from './CustomSelect';

interface BeanManagerProps {
  beans: Bean[];
  onAddBean: (bean: Bean) => void;
  onUpdateBean: (bean: Bean) => void;
  onDeleteBean: (id: string) => void;
}

const BeanManager: React.FC<BeanManagerProps> = ({ beans, onAddBean, onUpdateBean, onDeleteBean }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedBeanId, setExpandedBeanId] = useState<string | null>(null);
  const [isRoastDateUnknown, setIsRoastDateUnknown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [beanToDelete, setBeanToDelete] = useState<{id: string, name: string} | null>(null);
  const [blendParts, setBlendParts] = useState<BlendPart[]>([]);
  
  const [newPart, setNewPart] = useState<{
      origin: string;
      variety: string;
      process: string;
      roastLevel: RoastLevel;
      ratio: string;
  }>({
      origin: '',
      variety: '',
      process: '',
      roastLevel: RoastLevel.MEDIUM,
      ratio: ''
  });

  const [formData, setFormData] = useState<any>({
    id: undefined,
    name: '',
    roaster: '',
    roastLevel: RoastLevel.MEDIUM,
    origin: '',
    process: '',
    variety: '',
    tastingNotes: '',
    category: BeanCategory.SINGLE_ORIGIN,
    owner: BeanOwner.PERSONAL,
    purchaseDate: '',
    roastDate: '',
    price: '',           
    weight: '250',       
    remainingWeight: '250',
    isActive: true,
    dateAdded: undefined
  });

  const handleAddBlendPart = () => {
    if (!newPart.origin) return;
    setBlendParts([...blendParts, {
        ...newPart,
        ratio: newPart.ratio ? parseFloat(newPart.ratio) : undefined
    }]);
    setNewPart({ origin: '', variety: '', process: '', roastLevel: RoastLevel.MEDIUM, ratio: '' });
  };

  const handleRemoveBlendPart = (index: number) => {
    const updated = [...blendParts];
    updated.splice(index, 1);
    setBlendParts(updated);
  };

  const closeForm = () => {
      setEditingId(null);
      setBlendParts([]);
      setNewPart({ origin: '', variety: '', process: '', roastLevel: RoastLevel.MEDIUM, ratio: '' });
      setIsRoastDateUnknown(false);
      setFormData({
        id: undefined,
        name: '',
        roaster: '',
        roastLevel: RoastLevel.MEDIUM,
        origin: '',
        process: '',
        variety: '',
        tastingNotes: '',
        category: BeanCategory.SINGLE_ORIGIN,
        owner: BeanOwner.PERSONAL,
        purchaseDate: '',
        roastDate: '',
        price: '',
        weight: '250',
        remainingWeight: '250',
        isActive: true,
        dateAdded: undefined
      });
  };

  const startAdding = () => {
      closeForm();
      setEditingId('NEW');
  };

  const startEditing = (bean: Bean) => {
    setFormData({
        ...bean,
        owner: bean.owner || BeanOwner.PERSONAL,
        purchaseDate: bean.purchaseDate || '',
        roastDate: bean.roastDate || '',
        tastingNotes: bean.tastingNotes || '',
        variety: bean.variety || '',
        price: bean.price !== undefined ? bean.price.toString() : '',
        weight: bean.weight.toString(),
        remainingWeight: bean.remainingWeight.toString()
    });
    setBlendParts(bean.blendParts || []);
    setNewPart({ origin: '', variety: '', process: '', roastLevel: RoastLevel.MEDIUM, ratio: '' });
    setIsRoastDateUnknown(bean.roastDate === '');
    setEditingId(bean.id);
  };

  const confirmDelete = () => {
      if (beanToDelete) {
          onDeleteBean(beanToDelete.id);
          setBeanToDelete(null);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.roaster) return;

    const isClub = formData.owner === BeanOwner.CLUB;
    const initialWeight = parseFloat(formData.weight) || 0;
    const currentRemaining = isClub ? 0 : (parseFloat(formData.remainingWeight) || 0);
    const priceVal = formData.price === '' ? undefined : parseFloat(formData.price);
    const isBlend = formData.category === BeanCategory.BLEND;

    const displayOrigin = isBlend ? '拼配产地' : (formData.origin || '未知产地');
    const displayProcess = isBlend ? '混合处理' : (formData.process || '水洗');

    const beanData: Bean = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name!,
      roaster: formData.roaster!,
      roastLevel: formData.roastLevel as RoastLevel,
      origin: displayOrigin,
      process: displayProcess,
      variety: formData.variety || '',
      tastingNotes: formData.tastingNotes || '',
      category: formData.category as BeanCategory,
      owner: formData.owner as BeanOwner,
      blendParts: isBlend ? blendParts : [],
      purchaseDate: formData.purchaseDate,
      roastDate: isRoastDateUnknown ? '' : formData.roastDate, 
      price: priceVal,
      weight: initialWeight,
      remainingWeight: currentRemaining,
      isActive: formData.isActive ?? true,
      dateAdded: formData.dateAdded || Date.now(),
    };

    if (formData.id) {
        onUpdateBean(beanData);
    } else {
        onAddBean(beanData);
    }
    closeForm();
  };

  const calculateRestingDays = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    const start = new Date(dateStr);
    const now = new Date();
    start.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  const getRestingStatusColor = (days: number) => {
      if (days < 7) return 'bg-blue-50 text-blue-600 border-blue-100';
      if (days <= 60) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      return 'bg-orange-50 text-orange-600 border-orange-100';
  };

  const filteredBeans = beans.filter(bean => {
    const query = searchQuery.toLowerCase();
    return (
      bean.name.toLowerCase().includes(query) ||
      bean.roaster.toLowerCase().includes(query) ||
      bean.origin.toLowerCase().includes(query) ||
      (bean.variety && bean.variety.toLowerCase().includes(query)) ||
      (bean.tastingNotes && bean.tastingNotes.toLowerCase().includes(query))
    );
  }).sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
  });

  const totalRatio = blendParts.reduce((sum, p) => sum + (p.ratio || 0), 0);

  const renderForm = () => {
    const isClubOwner = formData.owner === BeanOwner.CLUB;
    
    return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 mb-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-slate-800">
              {formData.id ? '编辑咖啡豆' : '新咖啡豆'}
          </h3>
          <button type="button" onClick={closeForm} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">名称</label>
            <input
            type="text"
            placeholder="例如: 耶加雪菲 / 意式拼配"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            />
        </div>

        <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">烘焙商</label>
            <input
            type="text"
            placeholder="例如: Blue Bottle"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            value={formData.roaster}
            onChange={e => setFormData({ ...formData, roaster: e.target.value })}
            required
            />
        </div>

        <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
          <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">类型</label>
              <CustomSelect
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val as BeanCategory })}
                options={BEAN_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              />
          </div>
          
          <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">烘焙度</label>
              <CustomSelect
                value={formData.category === BeanCategory.BLEND ? '' : formData.roastLevel}
                onChange={(val) => setFormData({ ...formData, roastLevel: val as RoastLevel })}
                options={ROAST_LEVELS.map(level => ({ value: level, label: `${level}` }))}
                disabled={formData.category === BeanCategory.BLEND}
                placeholder={formData.category === BeanCategory.BLEND ? ' ' : '请选择'}
              />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">所有者</label>
            <div className="flex gap-6">
                {BEAN_OWNERS.map(ownerType => (
                    <label key={ownerType} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="radio"
                                name="owner"
                                value={ownerType}
                                checked={formData.owner === ownerType}
                                onChange={() => setFormData({...formData, owner: ownerType})}
                                className="peer appearance-none w-5 h-5 rounded-full border border-slate-300 checked:border-amber-600 transition-colors"
                            />
                            <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-amber-600 scale-0 peer-checked:scale-100 transition-transform"></div>
                        </div>
                        <span className={`text-sm group-hover:text-amber-700 transition-colors ${formData.owner === ownerType ? 'text-amber-700 font-bold' : 'text-slate-600 font-medium'}`}>
                            {ownerType === BeanOwner.PERSONAL ? '个人' : '社团'}
                        </span>
                    </label>
                ))}
            </div>
        </div>

        {formData.category === BeanCategory.SINGLE_ORIGIN ? (
            <>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">产地</label>
                    <input
                        type="text"
                        placeholder="例如: 埃塞俄比亚"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        value={formData.origin}
                        onChange={e => setFormData({ ...formData, origin: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">处理法</label>
                        <input
                        type="text"
                        placeholder="例如: 水洗"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        value={formData.process}
                        onChange={e => setFormData({ ...formData, process: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">豆种</label>
                        <input
                        type="text"
                        placeholder="例如: 瑰夏"
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        value={formData.variety}
                        onChange={e => setFormData({ ...formData, variety: e.target.value })}
                        />
                    </div>
                </div>
            </>
        ) : (
            <div className="col-span-1 md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers size={14}/> 拼配配方
                </label>
                
                {blendParts.length > 0 && (
                    <ul className="mb-4 space-y-2">
                        {blendParts.map((part, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">
                                        {part.origin}
                                        {part.variety && <span className="font-medium text-slate-500"> · {part.variety}</span>}
                                    </span>
                                    <span className="text-[11px] text-slate-400 mt-0.5">{part.process} · {part.roastLevel}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold text-xs">
                                      {part.ratio !== undefined ? `${part.ratio}%` : '未知比例'}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveBlendPart(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <X size={18}/>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {totalRatio < 100 ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">添加组成成分</div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input 
                                placeholder="产地 (必填)" 
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                                value={newPart.origin} 
                                onChange={e => setNewPart({...newPart, origin: e.target.value})}
                            />
                             <input 
                                placeholder="豆种" 
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                                value={newPart.variety} 
                                onChange={e => setNewPart({...newPart, variety: e.target.value})}
                            />
                            <input 
                                placeholder="处理法" 
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                                value={newPart.process} 
                                onChange={e => setNewPart({...newPart, process: e.target.value})}
                            />
                             <CustomSelect
                                className="text-sm"
                                value={newPart.roastLevel} 
                                onChange={(val) => setNewPart({...newPart, roastLevel: val as RoastLevel})}
                                options={ROAST_LEVELS.map(l => ({ value: l, label: l }))}
                             />
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="flex-1 relative">
                                <input 
                                    type="number" 
                                    step="0.1"
                                    placeholder="比例" 
                                    className="w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                                    value={newPart.ratio} 
                                    onChange={e => setNewPart({...newPart, ratio: e.target.value})}
                                    onWheel={(e) => e.currentTarget.blur()}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddBlendPart}
                                disabled={!newPart.origin}
                                className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-6 py-2.5 text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                            >
                                <Plus size={16} strokeWidth={3} />
                                添加
                            </button>
                        </div>
                    </div>
                ) : (
                     <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 font-bold">
                        <CheckCircle2 size={18}/> 配方已完整
                    </div>
                )}
            </div>
        )}

        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
             <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">规格(g)</label>
             <input
              type="number"
              step="0.1"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              value={formData.weight}
              onChange={e => {
                const val = e.target.value;
                setFormData((prev: any) => ({ 
                  ...prev, 
                  weight: val,
                  remainingWeight: (!prev.id && prev.owner === BeanOwner.PERSONAL) ? val : prev.remainingWeight 
                }));
              }}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          <div>
             <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">剩余(g)</label>
             <input
              type="number"
              step="0.1"
              className={`w-full p-3 border rounded-xl outline-none transition-colors text-sm ${isClubOwner ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-amber-500'}`}
              value={isClubOwner ? '' : formData.remainingWeight}
              placeholder={isClubOwner ? '-' : ''}
              disabled={isClubOwner}
              onChange={e => setFormData({ ...formData, remainingWeight: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          <div>
             <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">价格(¥)</label>
             <input
              type="number"
              step="0.1"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          <div>
             <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">烘焙日期</label>
             <input
                type="date"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                value={formData.roastDate}
                onChange={e => setFormData({ ...formData, roastDate: e.target.value })}
                disabled={isRoastDateUnknown}
              />
              <div className="flex items-center gap-1.5 mt-2">
                <input 
                  type="checkbox" 
                  id="roastUnknown"
                  checked={isRoastDateUnknown}
                  onChange={(e) => {
                    setIsRoastDateUnknown(e.target.checked);
                    if(e.target.checked) setFormData({ ...formData, roastDate: '' });
                  }}
                  className="w-3.5 h-3.5 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                />
                <label htmlFor="roastUnknown" className="text-xs text-slate-500 font-medium">日期未知</label>
              </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">风味描述</label>
          <input
            type="text"
            placeholder="例如: 茉莉花, 柑橘"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            value={formData.tastingNotes}
            onChange={e => setFormData({ ...formData, tastingNotes: e.target.value })}
          />
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
            <span className="text-sm font-bold text-slate-700">库存状态</span>
            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: true})}
                    className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${
                        formData.isActive ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    在喝
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: false})}
                     className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${
                        !formData.isActive ? 'bg-slate-200 text-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    喝完了
                </button>
            </div>
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={closeForm}
            className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md shadow-amber-200 text-sm"
          >
            {formData.id ? '保存修改' : '添加咖啡豆'}
          </button>
        </div>
      </form>
    </div>
    );
  };

  return (
    <div className="space-y-6">
      {beanToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setBeanToDelete(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">确认删除</h3>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                          您确定要删除 <span className="font-bold text-slate-800">"{beanToDelete.name}"</span> 吗？
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setBeanToDelete(null)}
                          className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                      >
                          取消
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200 text-sm"
                      >
                          确认删除
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">豆仓</h2>
        
        <div className="flex flex-col-reverse md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input 
              type="text" 
              placeholder="搜索名称、产地、风味..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm shadow-sm"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          </div>
          
          <button
            onClick={() => editingId === 'NEW' ? closeForm() : startAdding()}
            className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-sm font-bold"
          >
            <Plus size={18} />
            <span>添加咖啡豆</span>
          </button>
        </div>
      </div>

      {editingId === 'NEW' && renderForm()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {filteredBeans.length > 0 && filteredBeans.map(bean => {
             if (editingId === bean.id) {
                 return <div key={bean.id} className="col-span-1 md:col-span-2 lg:col-span-3">{renderForm()}</div>;
             }

             const percentage = bean.weight > 0 ? (bean.remainingWeight / bean.weight) * 100 : 0;
             const isLow = percentage < 20;
             const isBlend = bean.category === BeanCategory.BLEND;
             const isFinished = !bean.isActive;
             const restingDays = isFinished ? null : calculateRestingDays(bean.roastDate);
             const isClub = bean.owner === BeanOwner.CLUB;
             const unitPrice = (bean.price && bean.weight) ? (bean.price / bean.weight).toFixed(3) : null;
             const isExpanded = expandedBeanId === bean.id;

             return (
              <div 
                key={bean.id} 
                onClick={() => setExpandedBeanId(isExpanded ? null : bean.id)}
                className={`bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer ${isFinished ? 'opacity-60 grayscale-[0.2]' : ''}`}
              >
                <div className={`h-1.5 ${isFinished ? 'bg-slate-300' : isClub ? 'bg-indigo-500' : 'bg-amber-600'}`}></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-slate-800 leading-snug truncate">{bean.name}</h3>
                      <p className="text-amber-700 text-sm font-bold mt-0.5 truncate">{bean.roaster}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                         <div className="flex items-center gap-1.5">
                            {restingDays !== null && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getRestingStatusColor(restingDays)}`}>
                                    养{restingDays}天
                                </span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${isBlend ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                {bean.category}
                            </span>
                         </div>
                         <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-300`}>
                             <ChevronDown size={20} />
                         </div>
                    </div>
                  </div>
                  
                  {!isClub && (
                    <div className="mt-1 mb-2">
                        <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-400 uppercase tracking-wide">
                            <span>库存</span>
                            <span className={isLow ? 'text-red-500' : 'text-slate-700'}>
                                {Number(bean.remainingWeight).toFixed(1).replace(/\.0$/, '')}g / {Number(bean.weight).toFixed(1).replace(/\.0$/, '')}g
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ${isFinished ? 'bg-slate-200' : isLow ? 'bg-red-400' : 'bg-emerald-500'}`} 
                                style={{width: `${Math.min(100, Math.max(0, percentage))}%`}}
                            ></div>
                        </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 animate-in fade-in slide-in-from-top-1">
                        <div className="space-y-3">
                            {!isBlend ? (
                            <>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">烘焙度</span>
                                    <span className="font-bold text-slate-700">{bean.roastLevel}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">产地</span>
                                    <span className="font-bold text-slate-700">{bean.origin}</span>
                                </div>
                                {bean.variety && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">豆种</span>
                                        <span className="font-bold text-slate-700">{bean.variety}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">处理法</span>
                                    <span className="font-bold text-slate-700">{bean.process}</span>
                                </div>
                            </>
                            ) : (
                                bean.blendParts && bean.blendParts.length > 0 && (
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">拼配配方</span>
                                        <ul className="text-xs space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {bean.blendParts.map((part, idx) => (
                                                <li key={idx} className="flex justify-between items-start last:border-0 pb-2.5 last:pb-0 border-b border-slate-200/50">
                                                    <div className="flex flex-col pr-2">
                                                        <span className="text-slate-800 font-bold">{part.origin}</span>
                                                        <span className="text-[10px] text-slate-500 mt-0.5">{part.variety || '-'} · {part.process} · {part.roastLevel}</span>
                                                    </div>
                                                    <span className="text-slate-700 font-mono font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                                                        {part.ratio !== undefined ? `${part.ratio}%` : '?%'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            )}

                            {(bean.price || unitPrice) && (
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">价格信息</span>
                                    <div className="flex items-center gap-2">
                                        {bean.price && <span className="text-slate-700 font-bold text-sm">¥{bean.price}</span>}
                                        {unitPrice && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-[4px] text-[10px] font-black border border-amber-100">¥{unitPrice}/g</span>}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12}/> 烘焙日期</span>
                                <span className="font-bold text-slate-700 text-sm">{bean.roastDate ? bean.roastDate.replace(/-/g, '/') : '未知'}</span>
                            </div>
                        </div>

                        {bean.tastingNotes && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
                                "{bean.tastingNotes}"
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-2.5 pt-1">
                            <button
                            onClick={(e) => { e.stopPropagation(); startEditing(bean); }}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-amber-700 transition-colors py-2 px-3.5 hover:bg-amber-50 rounded-xl text-xs font-bold"
                            >
                            <Pencil size={14} /> 编辑
                            </button>
                            <button
                            onClick={(e) => { e.stopPropagation(); setBeanToDelete({id: bean.id, name: bean.name}); }}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition-colors py-2 px-3.5 hover:bg-red-50 rounded-xl text-xs font-bold"
                            >
                            <Trash2 size={14} /> 删除
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              </div>
             );
        })}
      </div>
    </div>
  );
};

export default BeanManager;