import React, { useState } from 'react';
import { Bean, SpecialtyRecipe, Ingredient } from '../types';
import { Plus, Trash2, Martini, X, CheckCircle, ChevronDown, Save, Pencil } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface SpecialtyManagerProps {
  beans: Bean[];
  recipes: SpecialtyRecipe[];
  onAddRecipe: (recipe: SpecialtyRecipe) => void;
  onUpdateRecipe: (recipe: SpecialtyRecipe) => void;
  onDeleteRecipe: (id: string) => void;
}

const BASE_OPTIONS = ["金酒", "朗姆酒", "龙舌兰", "伏特加", "威士忌", "白兰地", "君度", "可可", "浓缩咖啡", "冷萃咖啡", "抹茶"];

const SpecialtyManager: React.FC<SpecialtyManagerProps> = ({ beans, recipes, onAddRecipe, onUpdateRecipe, onDeleteRecipe }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    id: undefined,
    name: '',
    bases: [], // Array of { item: string, amount: string }
    ingredients: [{ item: '', amount: '' }],
    instructions: '',
  });

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: '',
      bases: [],
      ingredients: [{ item: '', amount: '' }],
      instructions: '',
    });
    setIsFormOpen(false);
    setEditingRecipeId(null);
  };

  const handleToggleBase = (baseName: string) => {
    const exists = formData.bases.find((b: Ingredient) => b.item === baseName);
    if (exists) {
      setFormData({
        ...formData,
        bases: formData.bases.filter((b: Ingredient) => b.item !== baseName)
      });
    } else {
      setFormData({
        ...formData,
        bases: [...formData.bases, { item: baseName, amount: '' }]
      });
    }
  };

  const handleBaseAmountChange = (baseName: string, amount: string) => {
    setFormData({
      ...formData,
      bases: formData.bases.map((b: Ingredient) => b.item === baseName ? { ...b, amount } : b)
    });
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
      bases: recipe.bases || [],
      ingredients: recipe.ingredients || [{ item: '', amount: '' }]
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
      bases: formData.bases,
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

  const renderFormFields = (isInline: boolean = false) => (
    <div className={`${isInline ? '' : 'bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 mb-6'} animate-in fade-in slide-in-from-top-4`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-700">{formData.id ? '编辑特调' : '新建特调配方'}</h3>
          <button type="button" onClick={resetForm} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">特调名称</label>
            <input
              type="text"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
              placeholder=""
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">基底</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {BASE_OPTIONS.map(opt => {
                const isSelected = formData.bases.some((b: Ingredient) => b.item === opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleBase(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isSelected 
                        ? 'bg-amber-600 border-amber-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-amber-500 hover:text-amber-600'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            
            {formData.bases.length > 0 && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {formData.bases.map((base: Ingredient) => (
                  <div key={base.item} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 w-16 shrink-0">{base.item}</span>
                    <input
                      type="text"
                      placeholder="用量"
                      className="flex-1 p-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500"
                      value={base.amount}
                      onChange={e => handleBaseAmountChange(base.item, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">辅料</label>
          <div className="space-y-3">
            {formData.ingredients.map((ing: Ingredient, idx: number) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="text"
                    placeholder=""
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    value={ing.item}
                    onChange={e => handleIngredientChange(idx, 'item', e.target.value)}
                  />
                </div>
                <div className="w-24 md:w-32 shrink-0">
                  <input
                    type="text"
                    placeholder="用量"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    value={ing.amount}
                    onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="flex items-center gap-1 text-xs text-amber-600 font-bold hover:underline py-1"
          >
            <Plus size={14} /> 添加辅料
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">制作步骤 / 笔记</label>
          <textarea
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-32 resize-none text-sm leading-relaxed"
            placeholder="描述制作流程、口感细节..."
            value={formData.instructions}
            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm">取消</button>
          <button type="submit" className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-md flex items-center gap-2 text-sm transition-all active:scale-95">
            <Save size={16}/> 保存配方
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">特调配方</h2>
        <button
          onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium">{isFormOpen ? '收起表单' : '新配方'}</span>
        </button>
      </div>

      {isFormOpen && renderFormFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Martini size={48} className="mb-4 opacity-30" />
            <p>暂无特调配方记录</p>
            <button onClick={() => setIsFormOpen(true)} className="mt-2 text-amber-600 font-medium hover:underline">开启创意调配</button>
          </div>
        ) : (
          [...recipes].sort((a, b) => b.date - a.date).map(recipe => {
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
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">{recipe.name}</h3>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {recipe.bases && recipe.bases.length > 0 && (
                      <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-100 font-bold truncate max-w-[150px]">
                        {recipe.bases.map(b => b.item).join(', ')}
                      </span>
                    )}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium truncate max-w-[150px]">
                        {recipe.ingredients.map(i => i.item).join(', ')}
                      </span>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 animate-in fade-in slide-in-from-top-1">
                      {recipe.bases && recipe.bases.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">基底组成</h4>
                          <ul className="grid grid-cols-1 gap-1.5 text-sm text-slate-700">
                            {recipe.bases.map((base, i) => (
                              <li key={i} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                <span className="font-bold">{base.item}</span>
                                <span className="font-bold text-amber-700">{base.amount}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {recipe.ingredients.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">辅料组成</h4>
                          <ul className="grid grid-cols-1 gap-1.5 text-sm text-slate-700">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i} className="flex justify-between border-b border-slate-50 pb-1">
                                <span>{ing.item}</span>
                                <span className="font-medium text-slate-400">{ing.amount}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {recipe.instructions && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">制作方法</h4>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">{recipe.instructions}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(recipe); }} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"><Pencil size={14} /> 编辑</button>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm('确定删除此配方吗？')) onDeleteRecipe(recipe.id); }} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"><Trash2 size={14} /> 删除</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SpecialtyManager;