import React, { useState } from 'react';
import { Bean, SpecialtyRecipe, Ingredient } from '../types';
import { Plus, Trash2, Martini, X, ChevronDown, Save, Pencil } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface SpecialtyManagerProps {
  beans: Bean[];
  recipes: SpecialtyRecipe[];
  onAddRecipe: (recipe: SpecialtyRecipe) => void;
  onUpdateRecipe: (recipe: SpecialtyRecipe) => void;
  onDeleteRecipe: (id: string) => void;
}

const SpecialtyManager: React.FC<SpecialtyManagerProps> = ({ beans, recipes, onAddRecipe, onUpdateRecipe, onDeleteRecipe }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    id: undefined,
    name: '',
    baseBeanId: '',
    ingredients: [{ item: '', amount: '' }],
    instructions: '',
  });

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: '',
      baseBeanId: '',
      ingredients: [{ item: '', amount: '' }],
      instructions: '',
    });
    setIsFormOpen(false);
    setEditingRecipeId(null);
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { item: '', amount: '' }]
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = [...formData.ingredients];
    updated.splice(index, 1);
    setFormData({ ...formData, ingredients: updated });
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    setFormData({ ...formData, ingredients: updated });
  };

  const handleEdit = (recipe: SpecialtyRecipe) => {
    setFormData({
      ...recipe,
    });
    setEditingRecipeId(recipe.id);
    setIsFormOpen(false);
    setExpandedRecipeId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("请输入特调名称");
      return;
    }

    const recipeData: SpecialtyRecipe = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      baseBeanId: formData.baseBeanId || undefined,
      ingredients: formData.ingredients.filter((i: any) => i.item),
      instructions: formData.instructions,
      date: formData.date || Date.now(),
    };

    if (formData.id) {
      onUpdateRecipe(recipeData);
    } else {
      onAddRecipe(recipeData);
    }
    resetForm();
  };

  const getBeanName = (id?: string) => {
    if (!id) return null;
    return beans.find(b => b.id === id)?.name || '未知咖啡豆';
  };

  const renderFormFields = (isInline: boolean = false) => (
    <div className={`${isInline ? '' : 'bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-6'} animate-in fade-in slide-in-from-top-4`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-slate-800">{formData.id ? '编辑特调配方' : '新特调配方'}</h3>
          <button type="button" onClick={resetForm} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">特调名称</label>
            <input
              type="text"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
              placeholder="例如: 橙意冷萃 / 桂花拿铁"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">基底咖啡豆 (可选)</label>
            <CustomSelect
              value={formData.baseBeanId}
              onChange={val => setFormData({ ...formData, baseBeanId: val })}
              options={[{ value: '', label: '未指定' }, ...beans.map(b => ({ value: b.id, label: b.name }))]}
              placeholder="选择作为基底的豆子..."
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">配料表</label>
          {formData.ingredients.map((ing: Ingredient, idx: number) => (
            <div key={idx} className="flex gap-2.5 items-center animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="配料名称"
                className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                value={ing.item}
                onChange={e => handleIngredientChange(idx, 'item', e.target.value)}
              />
              <input
                type="text"
                placeholder="用量"
                className="w-24 md:w-36 p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                value={ing.amount}
                onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemoveIngredient(idx)}
                className="p-2.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddIngredient}
            className="flex items-center gap-1.5 text-xs text-amber-600 font-bold hover:underline py-2 active:scale-95 transition-transform"
          >
            <Plus size={14} strokeWidth={3} /> 添加配料成分
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">制作步骤 / 笔记</label>
          <textarea
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-36 resize-none text-sm font-medium leading-relaxed"
            placeholder="描述详细制作流程、口感细节..."
            value={formData.instructions}
            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm">取消</button>
          <button type="submit" className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md flex items-center gap-2 text-sm transition-all active:scale-95">
            <Save size={16}/> 保存配方
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">特调</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 font-bold text-sm"
        >
          <Plus size={18} />
          <span>{isFormOpen ? '收起表单' : '新配方'}</span>
        </button>
      </div>

      {isFormOpen && renderFormFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {recipes.length > 0 && [...recipes].sort((a, b) => b.date - a.date).map(recipe => {
            if (editingRecipeId === recipe.id) {
              return <div key={recipe.id} className="col-span-1 md:col-span-2 lg:col-span-3">{renderFormFields(true)}</div>;
            }
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <div
                key={recipe.id}
                onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden ${isExpanded ? 'shadow-md border-amber-200 ring-1 ring-amber-100' : 'shadow-sm border-slate-100 hover:border-amber-200'}`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2.5">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{recipe.name}</h3>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-300`}>
                      <ChevronDown size={22} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    {recipe.baseBeanId && <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md truncate max-w-[150px] border border-amber-100">☕ {getBeanName(recipe.baseBeanId)}</span>}
                    <span className="text-slate-400 ml-auto uppercase tracking-wider">{new Date(recipe.date).toLocaleDateString()}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-50 space-y-5 animate-in fade-in slide-in-from-top-1">
                      {recipe.ingredients.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">配料组成</h4>
                          <ul className="grid grid-cols-1 gap-1.5">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i} className="flex justify-between text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                                <span className="text-slate-700 font-bold">{ing.item}</span>
                                <span className="font-bold text-amber-700">{ing.amount}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {recipe.instructions && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">制作方法</h4>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{recipe.instructions}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(recipe); }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-700 px-3.5 py-2 rounded-xl hover:bg-amber-50 transition-all"><Pencil size={14} /> 编辑</button>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm('确定删除此配方吗？')) onDeleteRecipe(recipe.id); }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 px-3.5 py-2 rounded-xl hover:bg-red-50 transition-all"><Trash2 size={14} /> 删除</button>
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

export default SpecialtyManager;