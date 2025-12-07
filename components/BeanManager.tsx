import React, { useState } from 'react';
import { Bean, RoastLevel, BeanCategory, BlendPart } from '../types';
import { ROAST_LEVELS, BEAN_CATEGORIES } from '../constants';
import { Plus, Trash2, Scale, Calendar, Layers, X, Search, Pencil, CheckCircle2 } from 'lucide-react';
import { CoffeeBeanIcon } from './CustomIcons';
import CustomSelect from './CustomSelect';

interface BeanManagerProps {
  beans: Bean[];
  onAddBean: (bean: Bean) => void;
  onUpdateBean: (bean: Bean) => void;
  onDeleteBean: (id: string) => void;
}

const BeanManager: React.FC<BeanManagerProps> = ({ beans, onAddBean, onUpdateBean, onDeleteBean }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRoastDateUnknown, setIsRoastDateUnknown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Blend Parts State
  const [blendParts, setBlendParts] = useState<BlendPart[]>([]);
  // Use string for ratio input to avoid parsing bugs while typing
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

  // Use 'any' to allow strings in number fields (fixes decimal input bug)
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

  const resetForm = () => {
      setBlendParts([]);
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
        purchaseDate: '',
        roastDate: '',
        price: '',
        weight: '250',
        remainingWeight: '250',
        isActive: true,
        dateAdded: undefined
      });
      setIsRoastDateUnknown(false);
      setIsFormOpen(false);
  };

  const handleEdit = (bean: Bean) => {
    setFormData({
        ...bean,
        purchaseDate: bean.purchaseDate || '',
        roastDate: bean.roastDate || '',
        tastingNotes: bean.tastingNotes || '',
        variety: bean.variety || '',
        price: bean.price !== undefined ? bean.price.toString() : '',
        // Convert numbers to string for inputs
        weight: bean.weight.toString(),
        remainingWeight: bean.remainingWeight.toString()
    });
    setBlendParts(bean.blendParts || []);
    // If roastDate is empty string, assume it was unknown
    setIsRoastDateUnknown(bean.roastDate === '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.roaster) return;

    // Parse numbers on submit, not on change
    const initialWeight = parseFloat(formData.weight) || 0;
    const currentRemaining = parseFloat(formData.remainingWeight) || 0;
    const priceVal = formData.price === '' ? undefined : parseFloat(formData.price);

    const isBlend = formData.category === BeanCategory.BLEND;

    // Determine aggregate values for display if blend
    const displayOrigin = isBlend ? '拼配产地' : (formData.origin || '未知产地');
    const displayProcess = isBlend ? '混合处理' : (formData.process || '水洗');

    const beanData: Bean = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name!,
      roaster: formData.roaster!,
      // If blend, we might save the state's roastLevel but it's ignored in UI
      roastLevel: formData.roastLevel as RoastLevel,
      origin: displayOrigin,
      process: displayProcess,
      variety: formData.variety || '',
      tastingNotes: formData.tastingNotes || '',
      category: formData.category as BeanCategory,
      
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

    resetForm();
  };

  // Helper to calculate resting days
  const calculateRestingDays = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    const start = new Date(dateStr);
    const now = new Date();
    // Reset times to compare dates only to avoid timezone/time-of-day issues
    start.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  // Helper to determine resting status color
  const getRestingStatusColor = (days: number) => {
      if (days < 7) return 'bg-blue-50 text-blue-600 border-blue-100'; // Fresh
      if (days <= 60) return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Prime
      return 'bg-orange-50 text-orange-600 border-orange-100'; // Old
  };

  // Filter beans based on search query
  const filteredBeans = beans.filter(bean => {
    const query = searchQuery.toLowerCase();
    return (
      bean.name.toLowerCase().includes(query) ||
      bean.roaster.toLowerCase().includes(query) ||
      bean.origin.toLowerCase().includes(query) ||
      (bean.variety && bean.variety.toLowerCase().includes(query)) ||
      (bean.tastingNotes && bean.tastingNotes.toLowerCase().includes(query))
    );
  });

  const totalRatio = blendParts.reduce((sum, p) => sum + (p.ratio || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">我的咖啡豆</h2>
        
        <div className="flex flex-col-reverse md:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="搜索名称、产地、风味..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm shadow-sm"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          </div>
          
          <button
            onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
            className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span className="font-medium">添加新豆</span>
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-700">
                  {formData.id ? '编辑咖啡豆' : '新咖啡豆'}
              </h3>
              <button type="button" onClick={resetForm} className="text-slate-400 p-2"><X size={20}/></button>
            </div>
            
            <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">名称</label>
                <input
                type="text"
                placeholder="例如: 耶加雪菲 / 意式拼配"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                />
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">烘焙商</label>
                <input
                type="text"
                placeholder="例如: Blue Bottle"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.roaster}
                onChange={e => setFormData({ ...formData, roaster: e.target.value })}
                required
                />
            </div>

            <div className="grid grid-cols-2 gap-3 col-span-1 md:col-span-2">
              <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">类型</label>
                  <CustomSelect
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val as BeanCategory })}
                    options={BEAN_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                  />
              </div>
              
              <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                      烘焙度
                  </label>
                  <CustomSelect
                    value={formData.category === BeanCategory.BLEND ? '' : formData.roastLevel}
                    onChange={(val) => setFormData({ ...formData, roastLevel: val as RoastLevel })}
                    options={ROAST_LEVELS.map(level => ({ value: level, label: `${level}` }))}
                    disabled={formData.category === BeanCategory.BLEND}
                    placeholder={formData.category === BeanCategory.BLEND ? ' ' : '请选择'}
                  />
              </div>
            </div>

            {/* Conditional Rendering based on Category */}
            {formData.category === BeanCategory.SINGLE_ORIGIN ? (
                <>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">产地</label>
                        <input
                            type="text"
                            placeholder="例如: 埃塞俄比亚"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            value={formData.origin}
                            onChange={e => setFormData({ ...formData, origin: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 col-span-1 md:col-span-2">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">处理法</label>
                            <input
                            type="text"
                            placeholder="例如: 水洗"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            value={formData.process}
                            onChange={e => setFormData({ ...formData, process: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">豆种</label>
                            <input
                            type="text"
                            placeholder="例如: 瑰夏"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                            value={formData.variety}
                            onChange={e => setFormData({ ...formData, variety: e.target.value })}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Layers size={16}/> 拼配配方
                    </label>
                    
                    {/* List of added parts */}
                    {blendParts.length > 0 && (
                        <ul className="mb-3 space-y-2">
                            {blendParts.map((part, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-700">
                                            {part.origin}
                                            {part.variety && <span className="font-normal text-slate-500"> · {part.variety}</span>}
                                        </span>
                                        <span className="text-[10px] text-slate-400">{part.process}, {part.roastLevel}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 bg-slate-100 px-1 rounded">
                                          {part.ratio !== undefined ? `${part.ratio}%` : '未知比例'}
                                        </span>
                                        <button type="button" onClick={() => handleRemoveBlendPart(idx)} className="text-red-400 hover:text-red-600">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Adder */}
                    {totalRatio < 100 ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1 ml-1">产地</label>
                                <input 
                                    placeholder="产地" 
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={newPart.origin} 
                                    onChange={e => setNewPart({...newPart, origin: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-[10px] text-slate-500 mb-1 ml-1">豆种</label>
                                <input 
                                    placeholder="豆种" 
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={newPart.variety} 
                                    onChange={e => setNewPart({...newPart, variety: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1 ml-1">处理法</label>
                                <input 
                                    placeholder="处理" 
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={newPart.process} 
                                    onChange={e => setNewPart({...newPart, process: e.target.value})}
                                />
                            </div>
                            <div>
                                 <label className="block text-[10px] text-slate-500 mb-1 ml-1">烘焙度</label>
                                 <CustomSelect
                                    className="text-sm"
                                    value={newPart.roastLevel} 
                                    onChange={(val) => setNewPart({...newPart, roastLevel: val as RoastLevel})}
                                    options={ROAST_LEVELS.map(l => ({ value: l, label: l }))}
                                 />
                            </div>
                             
                             <div className="flex gap-2 col-span-2 md:col-span-1">
                                <div className="w-full">
                                    <label className="block text-[10px] text-slate-500 mb-1 ml-1">比例%</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="%" 
                                        className="p-2 border rounded-lg text-sm w-full"
                                        value={newPart.ratio} 
                                        onChange={e => setNewPart({...newPart, ratio: e.target.value})}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleAddBlendPart}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg px-2 h-[38px]"
                                >
                                    <Plus size={18} />
                                </button>
                             </div>
                        </div>
                    ) : (
                         <div className="flex items-center justify-center gap-2 p-2 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
                            <CheckCircle2 size={16}/> 配方比例已完整 (100%)
                        </div>
                    )}
                </div>
            )}

            <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-1">
                 <label className="block text-xs font-medium text-slate-500 mb-1">规格(g)</label>
                 <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.weight}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData((prev: any) => ({ 
                      ...prev, 
                      weight: val,
                      // If creating new bean, sync remaining with weight automatically for convenience
                      remainingWeight: !prev.id ? val : prev.remainingWeight 
                    }));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div className="col-span-1">
                 <label className="block text-xs font-medium text-slate-500 mb-1">剩余(g)</label>
                 <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.remainingWeight}
                  onChange={e => setFormData({ ...formData, remainingWeight: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div className="col-span-1">
                 <label className="block text-xs font-medium text-slate-500 mb-1">价格(¥)</label>
                 <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div className="col-span-1">
                 <label className="block text-xs font-medium text-slate-500 mb-1">烘焙日期</label>
                 <input
                    type="date"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                    value={formData.roastDate}
                    onChange={e => setFormData({ ...formData, roastDate: e.target.value })}
                    disabled={isRoastDateUnknown}
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <input 
                      type="checkbox" 
                      id="roastUnknown"
                      checked={isRoastDateUnknown}
                      onChange={(e) => {
                        setIsRoastDateUnknown(e.target.checked);
                        if(e.target.checked) setFormData({ ...formData, roastDate: '' });
                      }}
                      className="w-3 h-3 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                    />
                    <label htmlFor="roastUnknown" className="text-[10px] text-slate-500">日期未知</label>
                  </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">风味描述</label>
              <input
                type="text"
                placeholder="例如: 茉莉花, 柑橘"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.tastingNotes}
                onChange={e => setFormData({ ...formData, tastingNotes: e.target.value })}
              />
            </div>
            
             {/* Active/Finished Status Toggle */}
            <div className="col-span-1 md:col-span-2 bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200">
                <span className="text-sm font-medium text-slate-700">状态</span>
                <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, isActive: true})}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                            formData.isActive ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        在喝
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, isActive: false})}
                         className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
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
                onClick={resetForm}
                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md shadow-amber-200"
              >
                {formData.id ? '保存' : '添加'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredBeans.length > 0 ? (
          filteredBeans.map(bean => {
           // Calculate inventory percentage
           const percentage = bean.weight > 0 ? (bean.remainingWeight / bean.weight) * 100 : 0;
           const isLow = percentage < 20;
           const isBlend = bean.category === BeanCategory.BLEND;
           const isFinished = !bean.isActive || bean.remainingWeight <= 0;
           const restingDays = calculateRestingDays(bean.roastDate);
           
           return (
            <div key={bean.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full active:scale-[0.99] transition-transform duration-100 ${isFinished ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              <div className={`h-1.5 ${isFinished ? 'bg-slate-300' : 'bg-amber-600'}`}></div>
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight truncate">{bean.name}</h3>
                    <p className="text-amber-700 text-sm font-medium mt-1 truncate">{bean.roaster}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] px-2 py-1 rounded-full border ${isBlend ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    {bean.category}
                  </span>
                </div>
                
                {/* Inventory Bar */}
                <div className="mt-3 mb-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1"><Scale size={12}/> 库存</span>
                        <span className={`font-medium ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                            {Number(bean.remainingWeight).toFixed(1).replace(/\.0$/, '')}g / {Number(bean.weight).toFixed(1).replace(/\.0$/, '')}g
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isFinished ? 'bg-slate-300' : isLow ? 'bg-red-400' : 'bg-emerald-500'}`} 
                            style={{width: `${Math.min(100, Math.max(0, percentage))}%`}}
                        ></div>
                    </div>
                </div>

                <div className="space-y-1.5 text-sm text-slate-600 mt-auto">
                   
                  {!isBlend ? (
                     <>
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span className="text-slate-400 text-xs">烘焙度</span>
                        <span className="font-medium text-xs">{bean.roastLevel}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                            <span className="text-slate-400 text-xs">产地</span>
                            <span className="font-medium truncate max-w-[120px] text-xs" title={bean.origin}>{bean.origin}</span>
                        </div>
                         {bean.variety && (
                            <div className="flex justify-between pb-1">
                                <span className="text-slate-400 text-xs">豆种</span>
                                <span className="font-medium text-xs">{bean.variety}</span>
                            </div>
                        )}
                     </>
                  ) : (
                      bean.blendParts && bean.blendParts.length > 0 && (
                          <div className="pt-1">
                              <span className="text-xs text-slate-400 block mb-1">拼配详情:</span>
                              <ul className="text-xs space-y-1 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                                  {bean.blendParts.map((part, idx) => (
                                      <li key={idx} className="flex justify-between items-start border-b border-slate-100 last:border-0 pb-1 last:pb-0 mb-1 last:mb-0">
                                          <div className="flex flex-col min-w-0 pr-2">
                                            <span className="text-slate-700 font-medium truncate">
                                                {part.origin}
                                                {part.variety && <span className="font-normal text-slate-500"> · {part.variety}</span>}
                                            </span>
                                            <span className="text-[10px] text-slate-500 truncate">{part.process} · {part.roastLevel}</span>
                                          </div>
                                          <span className="text-slate-600 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap">
                                            {part.ratio !== undefined ? `${part.ratio}%` : '?%'}
                                          </span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )
                  )}
                  
                   <div className="flex justify-between pt-2 border-t border-slate-50 pb-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={12}/> 烘焙日期</span>
                        <div className="flex items-center gap-1.5">
                            {restingDays !== null && (
                                <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${getRestingStatusColor(restingDays)}`}>
                                    已养 {restingDays} 天
                                </span>
                            )}
                            <span>{bean.roastDate ? bean.roastDate.replace(/-/g, '/') : '未知'}</span>
                        </div>
                   </div>
                </div>

                {bean.tastingNotes && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-sm text-slate-700 italic truncate">{bean.tastingNotes}</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleEdit(bean)}
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-600 transition-colors py-1 px-2 hover:bg-slate-50 rounded-lg text-xs"
                  >
                    <Pencil size={14} /> 编辑
                  </button>
                  <button
                    onClick={() => onDeleteBean(bean.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors py-1 px-2 hover:bg-slate-50 rounded-lg text-xs"
                  >
                    <Trash2 size={14} /> 删除
                  </button>
                </div>
              </div>
            </div>
           );
        })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
             {searchQuery ? (
                 <>
                    <Search size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">未找到匹配的咖啡豆</p>
                 </>
             ) : (
                 <>
                    <CoffeeBeanIcon size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">您的豆仓是空的</p>
                    <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="mt-2 text-amber-600 font-medium hover:underline">添加第一包咖啡豆</button>
                 </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeanManager;