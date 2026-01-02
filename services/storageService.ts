import { Bean, BrewLog, Equipment, SpecialtyRecipe } from '../types';
import { APP_STORAGE_KEY_BEANS, APP_STORAGE_KEY_LOGS, APP_STORAGE_KEY_EQUIPMENT, APP_STORAGE_KEY_SPECIALTY, MOCK_BEANS } from '../constants';

export const getBeans = (): Bean[] => {
  const stored = localStorage.getItem(APP_STORAGE_KEY_BEANS);
  if (!stored) return MOCK_BEANS; 
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveBeans = (beans: Bean[]) => {
  localStorage.setItem(APP_STORAGE_KEY_BEANS, JSON.stringify(beans));
};

export const getLogs = (): BrewLog[] => {
  const stored = localStorage.getItem(APP_STORAGE_KEY_LOGS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveLogs = (logs: BrewLog[]) => {
  localStorage.setItem(APP_STORAGE_KEY_LOGS, JSON.stringify(logs));
};

export const getEquipment = (): Equipment[] => {
  const stored = localStorage.getItem(APP_STORAGE_KEY_EQUIPMENT);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveEquipment = (equipment: Equipment[]) => {
  localStorage.setItem(APP_STORAGE_KEY_EQUIPMENT, JSON.stringify(equipment));
};

export const getSpecialtyRecipes = (): SpecialtyRecipe[] => {
  const stored = localStorage.getItem(APP_STORAGE_KEY_SPECIALTY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveSpecialtyRecipes = (recipes: SpecialtyRecipe[]) => {
  localStorage.setItem(APP_STORAGE_KEY_SPECIALTY, JSON.stringify(recipes));
};