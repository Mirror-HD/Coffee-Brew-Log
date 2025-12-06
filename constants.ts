import { RoastLevel, BrewMethod, BeanCategory, EquipmentType } from './types';

export const ROAST_LEVELS = Object.values(RoastLevel);
export const BREW_METHODS = Object.values(BrewMethod);
export const BEAN_CATEGORIES = Object.values(BeanCategory);
export const EQUIPMENT_TYPES = Object.values(EquipmentType);

export const MOCK_BEANS = [
  {
    id: '1',
    name: '耶加雪菲 (Yirgacheffe)',
    roaster: 'Blue Bottle',
    roastLevel: RoastLevel.LIGHT,
    origin: '埃塞俄比亚',
    process: '水洗',
    variety: 'Heirloom',
    tastingNotes: '茉莉花, 柠檬, 桃子',
    category: BeanCategory.SINGLE_ORIGIN,
    purchaseDate: '2023-10-01',
    roastDate: '2023-09-25',
    price: 128,
    weight: 250,
    remainingWeight: 200,
    isActive: true,
    dateAdded: Date.now() - 10000000
  }
];

export const APP_STORAGE_KEY_BEANS = 'brewlog_beans_v3'; 
export const APP_STORAGE_KEY_LOGS = 'brewlog_logs_v3';
export const APP_STORAGE_KEY_EQUIPMENT = 'brewlog_equipment_v1';
