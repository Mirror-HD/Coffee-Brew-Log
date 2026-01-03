export enum BeanCategory {
  SINGLE_ORIGIN = '单品',
  BLEND = '拼配'
}

export enum BeanOwner {
  PERSONAL = '个人',
  CLUB = '社团'
}

export enum RoastLevel {
  LIGHT = '浅烘焙',
  MEDIUM_LIGHT = '中浅烘焙',
  MEDIUM = '中烘焙',
  MEDIUM_DARK = '中深烘焙',
  DARK = '深烘焙'
}

export enum BrewMethod {
  V60 = '手冲 (V60)',
  ESPRESSO = '意式浓缩',
  COLD_BREW = '冷萃',
  AEROPRESS = '爱乐压',
  FRENCH_PRESS = '法压壶',
  MOKA_POT = '摩卡壶'
}

export enum EquipmentType {
  GRINDER = '磨豆机',
  BREWER = '滤杯/器具',
  SCALE = '电子秤',
  OTHER = '其他'
}

export interface Equipment {
  id: string;
  name: string; // e.g., Comandante C40
  type: EquipmentType;
  brand?: string;
  notes?: string;
}

export interface BlendPart {
  origin: string;
  variety?: string; // New: Bean Variety per part
  process: string;
  roastLevel: RoastLevel;
  ratio?: number; // percentage
}

export interface Bean {
  id: string;
  name: string;
  roaster: string;
  roastLevel: RoastLevel; // Overall roast level representation
  origin: string; // Overall origin representation (e.g., "Global Blend")
  process?: string; // Overall process representation
  variety?: string; // New: Bean Variety (e.g., Geisha, Bourbon)
  tastingNotes?: string;
  category: BeanCategory;
  
  owner?: BeanOwner; // New: Owner field (Personal or Club)

  // New: Detailed parts for Blends
  blendParts?: BlendPart[]; 

  purchaseDate?: string;
  roastDate?: string;
  price?: number;
  weight: number; // Initial weight in grams
  remainingWeight: number; // Current weight in grams
  isActive: boolean; // true if currently in stock
  dateAdded: number;
}

export interface BrewLog {
  id: string;
  beanId: string;
  date: number;
  method: BrewMethod;
  
  // Equipment Linking
  grinderId?: string; // Link to Equipment ID
  brewerId?: string; // Link to Equipment ID
  
  grinderSetting: string;
  doseIn: number; // grams
  purgeWeight?: number; // grams used to purge grinder
  yieldOut: number; // grams
  timeSeconds: number;
  temperature: number; // Celsius
  notes: string;
}

export interface Ingredient {
  item: string;
  amount: string;
}

export interface SpecialtyRecipe {
  id: string;
  name: string;
  baseBeanId?: string;
  bases?: Ingredient[]; // Supported bases with amounts
  ingredients: Ingredient[];
  instructions: string;
  date: number;
}

export type Tab = 'dashboard' | 'beans' | 'brews' | 'equipment' | 'settings' | 'specialty';