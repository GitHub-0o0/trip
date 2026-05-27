/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Sparkles, 
  Compass, 
  Coins, 
  AlertCircle, 
  ArrowLeft,
  Briefcase,
  Layers,
  CheckCircle,
  HelpCircle,
  Info,
  Search,
  CloudSun,
  Thermometer,
  RotateCcw,
  Edit2,
  Save,
  Coffee,
  Bus,
  ShoppingBag,
  DollarSign,
  Utensils,
  Home
} from 'lucide-react';
import { TripPlan } from '../types';

interface TravelAssistantProps {
  lang: 'zh' | 'en';
  currentPlan: TripPlan | null;
  onClose: () => void;
}

interface ChecklistItem {
  id: string;
  category: 'docs' | 'devices' | 'clothing' | 'toiletries' | 'meds' | 'custom';
  textZh: string;
  textEn: string;
  completed: boolean;
  isCustom?: boolean;
}

// Fixed standard exchange rates relative to 1 USD
const DEFAULT_EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1.0,
  CNY: 7.24,
  EUR: 0.92,
  GBP: 0.81,
  JPY: 155.80,
  SGD: 1.35,
  HKD: 7.82,
  CHF: 0.91,
};

const CURRENCY_INFO: { [key: string]: { symbol: string; nameZh: string; nameEn: string } } = {
  USD: { symbol: '$', nameZh: '美元 (USD)', nameEn: 'US Dollar (USD)' },
  CNY: { symbol: '¥', nameZh: '人民币 (CNY)', nameEn: 'Chinese Yuan (CNY)' },
  EUR: { symbol: '€', nameZh: '欧元 (EUR)', nameEn: 'Euro (EUR)' },
  GBP: { symbol: '£', nameZh: '英镑 (GBP)', nameEn: 'British Pound (GBP)' },
  JPY: { symbol: '¥', nameZh: '日元 (JPY)', nameEn: 'Japanese Yen (JPY)' },
  SGD: { symbol: 'S$', nameZh: '新加坡元 (SGD)', nameEn: 'Singapore Dollar (SGD)' },
  HKD: { symbol: 'HK$', nameZh: '港币 (HKD)', nameEn: 'Hong Kong Dollar (HKD)' },
  CHF: { symbol: 'CHF', nameZh: '瑞士法郎 (CHF)', nameEn: 'Swiss Franc (CHF)' },
};

// Travel Weather and Clothing Advice Data matching different cities
interface WeatherAdvice {
  cityId: string;
  nameZh: string;
  nameEn: string;
  tempZh: string;
  tempEn: string;
  seasonTipsZh: string[];
  seasonTipsEn: string[];
}

const WEATHER_ADVICE_DATABASE: WeatherAdvice[] = [
  {
    cityId: 'harbin',
    nameZh: '哈尔滨',
    nameEn: 'Harbin',
    tempZh: '冬季 -15°C 至 -30°C（严寒冰雪季），夏季 18°C 至 28°C（凉爽避暑季）',
    tempEn: 'Winter -15°C to -30°C (Polar Glacial), Summer 18°C to 28°C (Pleasingly breeze)',
    seasonTipsZh: [
      '❄️ 冬季出行：必须备好加厚羽绒服（充绒量250g+）、高领保暖内衣、防滑雪地靴，并贴好暖宝宝以防手机因严寒关机。',
      '🕶️ 冰雪反射阳光强烈，建议携带舒适偏光的防雪盲墨镜和补水面霜。',
      '🍃 夏季出行：昼夜温差较大，建议携带一件轻薄的防风外套或卫衣。'
    ],
    seasonTipsEn: [
      '❄️ Winter Travel: Heavy puffers (250g+ down), thermal leggings, wind-proof gloves, and high-traction boots are emergency-level must-haves!',
      '🕶️ Bring premium polarized sunglasses to shield against heavy snow reflectivity and intense ultraviolet light.',
      '🍃 Summer Travel: Temperature shifts rapidly between day/night; pocket a lightweight fleece layer.'
    ]
  },
  {
    cityId: 'sanya',
    nameZh: '三亚',
    nameEn: 'Sanya',
    tempZh: '全新常年 22°C 至 33°C（常夏热带海岛候，紫外线极强）',
    tempEn: 'Year-round 22°C to 33°C (Tropical Sunny Beach, ultra-strong UV exposure)',
    seasonTipsZh: [
      '🧴 核心防晒：高倍数海洋友好(Reef-safe)防晒霜（SPF50+）、宽檐遮阳帽、偏光太阳镜。',
      '👙 水上娱乐：请直入速干泳衣、涉水浮潜鞋（防珊瑚礁划伤）、防尘防雨手机防水密封袋。',
      '🦟 热带雨林茂密，备一瓶高浓度避蚊胺(DEET)或柠檬香茅精油防蚊液。'
    ],
    seasonTipsEn: [
      '🧴 Sun Defense: Reef-safe ocean friendly high-protection sunscreen (SPF50+), protective shades, and elegant sun hats.',
      '👙 Water Gear: Pack swift-dry swim attire, anti-scratch coral reef shoes, and highly sealed waterproof phone containers.',
      '🦟 Tropical Rain-forest: Carry robust DEET or eco-friendly herbal mosquito repellent lotion to guard against bugs.'
    ]
  },
  {
    cityId: 'kyoto',
    nameZh: '京都',
    nameEn: 'Kyoto',
    tempZh: '春季 10°C~20°C（樱花季），秋季 11°C~21°C（枫叶红斑），夏季湿热',
    tempEn: 'Spring 10°C~20°C (Cherry Blossom), Autumn 11°C~21°C (Maple Foliage), Summer humid',
    seasonTipsZh: [
      '⛩️ 穿脱鞋备忘：由于常需脱鞋进入古刹榻榻米（如清水寺、二条城），请务必穿着干净、高弹性、无破油的厚底纯棉高筒袜。',
      '👟 京都步行阶梯和碎石子山道极长（如伏见稻荷千本鸟居），一双极致缓震防滑跑鞋能给大底无限呵护。',
      '👜 绝美古风：适合自备或者租借高颜值轻盈改良汉服/和服，轻松拍出古建筑清幽大片。'
    ],
    seasonTipsEn: [
      '⛩️ Footwear Etiquette: Temples require walking on Tatami in socks (e.g., Kiyomizu-dera). Keep premium, clean, scent-free socks handy.',
      '👟 Trekking Trails: Uneven pebble roads abound (e.g. Fushimi Inari shrines). Protect your heels with excellent walking runners.',
      '👜 Ancient Vibe: Perfect environment to rent or prepare traditional graceful fashion lines for picturesque snapshots.'
    ]
  },
  {
    cityId: 'hangzhou',
    nameZh: '杭州',
    nameEn: 'Hangzhou',
    tempZh: '春季 12°C 至 22°C，秋季 14°C 至 23°C（气候温和多雨，烟雨江南）',
    tempEn: 'Spring 12°C to 22°C, Autumn 14°C to 23°C (Classic misty-rain temperate weather)',
    seasonTipsZh: [
      '☔ 烟雨西湖：雨伞或带有防水涂层的轻锋外壳上装是江南旅行的神器，随时应付说落就下的江南细雨。',
      '🥿 步行至上：步行环湖或苏堤春晓长度达 10KM+，建议搭配气垫走路鞋或松糕乐福鞋。',
      '🍵 泡茶伴手：准备好一个小号极简水杯，路过龙井茶市或灵隐景区时，可以随时接满地道龙井泉。'
    ],
    seasonTipsEn: [
      '☔ Misty Westlake: Expect frequent drizzle. A sturdy lightweight umbrella or water-resistant hard shell is heavily advisable.',
      '🥿 Stroll Friendly: Walking the entire Westlake causes 10KM+ footprints. Style with deep cushioned flats or comfort sneakers.',
      '🍵 Tea Tasting: Carry a pocket-sized flask to fill with warm organic Longjing tea on the go around scenic villages.'
    ]
  },
  {
    cityId: 'london',
    nameZh: '伦敦',
    nameEn: 'London',
    tempZh: '冬季 3°C 至 9°C，夏季 14°C 至 24°C（多变海洋性气候，一日四季）',
    tempEn: 'Winter 3°C to 9°C, Summer 14°C to 24°C (Highly oceanic transit, four seasons in a day)',
    seasonTipsZh: [
      '🧥 穿搭建议：洋葱式多层次叠穿法是王道（T恤 + 针织衫 + 风衣/呢大衣），方便根据阴晴随时穿脱。',
      '☂️ 实用抗风：多阵雨且常伴有强风，雨伞易被吹翻，防泼水连帽冲锋衣或战壕风衣比传统雨伞更为省心。',
      '🔌 插头必看：英规方脚三插头插座，一定要携带支持中国插头转为英规的国际多功能转换插头。'
    ],
    seasonTipsEn: [
      '🧥 Wear Logic: Layering is essential. "Onion-shell" setup (T-shirt + wool cardigan + windcoat) lets you adapt to rapid hourly shifts.',
      '☂️ Sturdy Rain-jacket: Showers occur alongside high gusts; a rain-slicker jacket with hood beats a flapping umbrella.',
      '🔌 Adapter Specs: Standard UK three-pin square socket. Double-check your universal adapter plugs before fly-off.'
    ]
  }
];

export default function TravelAssistant({ lang, currentPlan, onClose }: TravelAssistantProps) {
  const isZh = lang === 'zh';
  
  // State for Currency Converter with custom manual editing support
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('trip_ai_custom_exchange_rates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error parsing exchange rates from local storage', e);
      }
    }
    return { ...DEFAULT_EXCHANGE_RATES };
  });

  const [isEditingRates, setIsEditingRates] = useState<boolean>(false);
  const [editingRatesTemp, setEditingRatesTemp] = useState<{ [key: string]: string }>({});

  const [baseVal, setBaseVal] = useState<string>('100');
  const [baseCurrency, setBaseCurrency] = useState<string>('CNY');
  const [convertedVals, setConvertedVals] = useState<{ [key: string]: string }>({});

  const saveExchangeRates = (newRates: { [key: string]: number }) => {
    setExchangeRates(newRates);
    localStorage.setItem('trip_ai_custom_exchange_rates', JSON.stringify(newRates));
  };

  // Calculate currency exchange using the mutable state `exchangeRates`
  useEffect(() => {
    const valNum = parseFloat(baseVal);
    if (isNaN(valNum) || baseVal.trim() === '') {
      const emptyVals: { [key: string]: string } = {};
      Object.keys(exchangeRates).forEach(cur => {
        emptyVals[cur] = '';
      });
      setConvertedVals(emptyVals);
      return;
    }

    // Convert input base value to USD
    const usdVal = valNum / exchangeRates[baseCurrency];
    const newVals: { [key: string]: string } = {};
    Object.keys(exchangeRates).forEach(cur => {
      if (cur === baseCurrency) {
        newVals[cur] = baseVal;
      } else {
        const result = usdVal * exchangeRates[cur];
        // Format based on value size
        newVals[cur] = result.toFixed(result < 10 ? 2 : 1);
      }
    });
    setConvertedVals(newVals);
  }, [baseVal, baseCurrency, exchangeRates]);

  const handleCurrencyInput = (val: string, currency: string) => {
    // Basic filter to prevent illegal inputs
    const sanitized = val.replace(/[^0-9.]/g, '');
    setBaseCurrency(currency);
    setBaseVal(sanitized);
  };

  // Handle Edit Rate Input
  const handleRateEditInput = (val: string, cur: string) => {
    const sanitized = val.replace(/[^0-9.]/g, '');
    setEditingRatesTemp(prev => ({
      ...prev,
      [cur]: sanitized
    }));
  };

  const handleSaveAllRates = () => {
    const newRates = { ...exchangeRates };
    let hasChanges = false;
    Object.keys(editingRatesTemp).forEach(cur => {
      const parsedVal = parseFloat(editingRatesTemp[cur]);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        newRates[cur] = parsedVal;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      saveExchangeRates(newRates);
    }
    setIsEditingRates(false);
  };

  const handleResetDefaultRates = () => {
    if (confirm(isZh ? '确认要恢复系统默认模型基础汇率吗？' : 'Are you sure to restore default system exchange rates?')) {
      saveExchangeRates({ ...DEFAULT_EXCHANGE_RATES });
      setIsEditingRates(false);
    }
  };

  // Quick Calculator Price Presets
  const QUICK_PRESETS = [
    { nameZh: '☕ 精致咖啡/饮品', nameEn: '☕ Coffe/Drinks', values: { CNY: 30, USD: 4, EUR: 3.8, JPY: 600 } },
    { nameZh: '🚌 单程公交/城轨', nameEn: '🚌 Inner-transit Ticket', values: { CNY: 15, USD: 2, EUR: 1.8, JPY: 300 } },
    { nameZh: '🍱 简餐/特色小吃', nameEn: '🍱 Quick Dinner/Snack', values: { CNY: 60, USD: 8, EUR: 7.5, JPY: 1200 } },
    { nameZh: '🏨 旅馆普通押金', nameEn: '🏨 Hotel Safe Deposit', values: { CNY: 500, USD: 70, EUR: 65, JPY: 11000 } }
  ];

  const applyPresetValue = (currency: string, value: number) => {
    setBaseCurrency(currency);
    setBaseVal(value.toString());
  };

  // State for Packing Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<'docs' | 'devices' | 'clothing' | 'toiletries' | 'meds' | 'custom'>('custom');

  // Checklist Search and Filtering
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unpacked' | 'packed' | 'custom'>('all');

  // Load / initialize checklist
  useEffect(() => {
    const stored = localStorage.getItem('trip_ai_checklist');
    if (stored) {
      try {
        setChecklist(JSON.parse(stored));
        return;
      } catch (e) {
        console.error('Failed to parse checklist:', e);
      }
    }

    // Build smart default checklist based on plan destinations
    const defaults: ChecklistItem[] = [
      // Docs
      { id: 'def-1', category: 'docs', textZh: '身份证 & 护照/签证明细', textEn: 'ID Card & Passport/Visa details', completed: false },
      { id: 'def-2', category: 'docs', textZh: '酒店 & 高铁/机票预订确认单', textEn: 'Hotel & Transport confirmations', completed: false },
      { id: 'def-3', category: 'docs', textZh: '现金与主备双信用卡', textEn: 'Cash & Dual Credit Cards', completed: false },
      
      // Devices
      { id: 'def-4', category: 'devices', textZh: '智能手机 & 高速充电宝', textEn: 'Smartphone & Fast powerbank', completed: false },
      { id: 'def-5', category: 'devices', textZh: '数据线与无线耳机', textEn: 'Charging cables & Wireless earphones', completed: false },
      
      // Clothing
      { id: 'def-6', category: 'clothing', textZh: '应季换洗衣物与舒适步履鞋', textEn: 'Seasonal clothes & Comfy sneakers', completed: false },
      { id: 'def-7', category: 'clothing', textZh: '遮阳帽/便携晴雨伞', textEn: 'Sun Hat / Compact umbrella', completed: false },
      
      // Toiletries
      { id: 'def-8', category: 'toiletries', textZh: '牙刷毛巾及便携式洗护装', textEn: 'Toothbrush & Travel size toiletries', completed: false },
      { id: 'def-9', category: 'toiletries', textZh: '纸巾/湿便洗脸巾', textEn: 'Tissues / Biodegradable wipes', completed: false },
      
      // Meds
      { id: 'def-10', category: 'meds', textZh: '感冒消炎/肠胃急救药', textEn: 'Cold/Enteritis relief pills', completed: false },
      { id: 'def-11', category: 'meds', textZh: '高韧性创可贴', textEn: 'High-adhesion band-aids', completed: false },
    ];

    // Read cities in current active plan to tailor recommendations
    const citiesStr = currentPlan 
      ? JSON.stringify(currentPlan.selectedDestinations).toLowerCase() 
      : '';

    // Context-dependent rules
    // Rule A: International flight or transport check
    const isInternational = currentPlan && currentPlan.selectedDestinations.some(d => 
      ['london', 'tokyo', 'paris', 'kyoto', 'geneva', 'singapore', 'new_york'].includes(d.cityId.toLowerCase())
    );

    if (isInternational) {
      defaults.push({
        id: 'context-plug',
        category: 'devices',
        textZh: '🔌 万能多国转换插头',
        textEn: '🔌 Universal travel adapter bundle',
        completed: false
      });
      defaults.push({
        id: 'context-insurance',
        category: 'docs',
        textZh: '🛡️ 境外航空旅游紧急医疗险保单',
        textEn: '🛡️ International travel health insurance slip',
        completed: false
      });
    }

    // Rule B: Sanya (Tropical Beach Stop)
    if (citiesStr.includes('sanya') || citiesStr.includes('三亚')) {
      defaults.push({
        id: 'context-beach-swim',
        category: 'clothing',
        textZh: '⛱️ 泳衣/比基尼/高排汗沙滩服',
        textEn: '⛱️ Swimming trunks/bikini & breezy outfits',
        completed: false
      });
      defaults.push({
        id: 'context-beach-sun',
        category: 'toiletries',
        textZh: '🧴 高倍海洋友好防晒霜 (SPF50+)',
        textEn: '🧴 Reef-safe high Protection sunscreen (SPF50+)',
        completed: false
      });
    }

    // Rule C: Harbin (Extremely Cold Northern Stop)
    if (citiesStr.includes('harbin') || citiesStr.includes('哈尔滨')) {
      defaults.push({
        id: 'context-cold-coat',
        category: 'clothing',
        textZh: '❄️ 极寒羽绒服 & 加厚保暖内衣组',
        textEn: '❄️ Extreme down parkas & thermal underwear layers',
        completed: false
      });
      defaults.push({
        id: 'context-cold-glove',
        category: 'clothing',
        textZh: '🧤 防风防水触屏手套/暖宝宝贴',
        textEn: '🧤 Windproof touch-screen gloves & adhesive handwarmers',
        completed: false
      });
    }

    // Rule D: Kyoto/Hangzhou (Temples & Tea culture)
    if (citiesStr.includes('kyoto') || citiesStr.includes('hangzhou') || citiesStr.includes('京都') || citiesStr.includes('杭州')) {
      defaults.push({
        id: 'context-walk-socks',
        category: 'clothing',
        textZh: '🚶🧦 适合塌塌米/古建筑脱鞋游览的干净中筒袜',
        textEn: '🚶🧦 Clean high-quality socks for frequent shoe removal in shrines',
        completed: false
      });
    }

    setChecklist(defaults);
    localStorage.setItem('trip_ai_checklist', JSON.stringify(defaults));
  }, [currentPlan]);

  // Persist edits
  const saveChecklist = (newItems: ChecklistItem[]) => {
    setChecklist(newItems);
    localStorage.setItem('trip_ai_checklist', JSON.stringify(newItems));
  };

  const handleToggleTodo = (id: string) => {
    const updated = checklist.map(it => 
      it.id === id ? { ...it, completed: !it.completed } : it
    );
    saveChecklist(updated);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      category: newTodoCategory,
      textZh: newTodoText.trim(),
      textEn: newTodoText.trim(),
      completed: false,
      isCustom: true
    };

    const updated = [newItem, ...checklist];
    saveChecklist(updated);
    setNewTodoText('');
  };

  const handleDeleteTodo = (id: string) => {
    const updated = checklist.filter(it => it.id !== id);
    saveChecklist(updated);
  };

  const clearCompleted = () => {
    if (confirm(isZh ? '确认要清除所有已勾选的随身物品吗？' : 'Are you sure to clear all checked items?')) {
      const updated = checklist.filter(it => !it.completed);
      saveChecklist(updated);
    }
  };

  // Reset to default packing checklist template based on the current itinerary
  const handleResetChecklist = () => {
    if (confirm(isZh ? '确认要重置清单并重新生成建议吗？您手动添加的自定义项目将被清空。' : 'Confirm resetting checklist? All custom modifications will be cleared.')) {
      localStorage.removeItem('trip_ai_checklist');
      // Build smart default checklist
      const defaults: ChecklistItem[] = [
        { id: 'def-1', category: 'docs', textZh: '身份证 & 护照/签证明细', textEn: 'ID Card & Passport/Visa details', completed: false },
        { id: 'def-2', category: 'docs', textZh: '酒店 & 高铁/机票预订确认单', textEn: 'Hotel & Transport confirmations', completed: false },
        { id: 'def-3', category: 'docs', textZh: '现金与主备双信用卡', textEn: 'Cash & Dual Credit Cards', completed: false },
        { id: 'def-4', category: 'devices', textZh: '智能手机 & 高速充电宝', textEn: 'Smartphone & Fast powerbank', completed: false },
        { id: 'def-5', category: 'devices', textZh: '数据线与无线耳机', textEn: 'Charging cables & Wireless earphones', completed: false },
        { id: 'def-6', category: 'clothing', textZh: '应季换洗衣物与舒适步履鞋', textEn: 'Seasonal clothes & Comfy sneakers', completed: false },
        { id: 'def-7', category: 'clothing', textZh: '遮阳帽/便携晴雨伞', textEn: 'Sun Hat / Compact umbrella', completed: false },
        { id: 'def-8', category: 'toiletries', textZh: '牙刷毛巾及便携式洗护装', textEn: 'Toothbrush & Travel size toiletries', completed: false },
        { id: 'def-9', category: 'toiletries', textZh: '纸巾/湿便洗脸巾', textEn: 'Tissues / Biodegradable wipes', completed: false },
        { id: 'def-10', category: 'meds', textZh: '感冒消炎/肠胃急救药', textEn: 'Cold/Enteritis relief pills', completed: false },
        { id: 'def-11', category: 'meds', textZh: '高韧性创可贴', textEn: 'High-adhesion band-aids', completed: false },
      ];

      const citiesStr = currentPlan 
        ? JSON.stringify(currentPlan.selectedDestinations).toLowerCase() 
        : '';

      const isInternational = currentPlan && currentPlan.selectedDestinations.some(d => 
        ['london', 'tokyo', 'paris', 'kyoto', 'geneva', 'singapore', 'new_york'].includes(d.cityId.toLowerCase())
      );

      if (isInternational) {
        defaults.push({ id: 'context-plug', category: 'devices', textZh: '🔌 万能多国转换插头', textEn: '🔌 Universal travel adapter bundle', completed: false });
        defaults.push({ id: 'context-insurance', category: 'docs', textZh: '🛡️ 境外航空旅游紧急医疗险保单', textEn: '🛡️ International travel health insurance slip', completed: false });
      }

      if (citiesStr.includes('sanya') || citiesStr.includes('三亚')) {
        defaults.push({ id: 'context-beach-swim', category: 'clothing', textZh: '⛱️ 泳衣/比基尼/高排汗沙滩服', textEn: '⛱️ Swimming trunks/bikini & breezy outfits', completed: false });
        defaults.push({ id: 'context-beach-sun', category: 'toiletries', textZh: '🧴 高倍海洋友好防晒霜 (SPF50+)', textEn: '🧴 Reef-safe high Protection sunscreen (SPF50+)', completed: false });
      }

      if (citiesStr.includes('harbin') || citiesStr.includes('哈尔滨')) {
        defaults.push({ id: 'context-cold-coat', category: 'clothing', textZh: '❄️ 极寒羽绒服 & 加厚保暖内衣组', textEn: '❄️ Extreme down parkas & thermal underwear layers', completed: false });
        defaults.push({ id: 'context-cold-glove', category: 'clothing', textZh: '🧤 防风防水触屏手套/暖宝宝贴', textEn: '🧤 Windproof touch-screen gloves & adhesive handwarmers', completed: false });
      }

      if (citiesStr.includes('kyoto') || citiesStr.includes('hangzhou') || citiesStr.includes('京都') || citiesStr.includes('杭州')) {
        defaults.push({ id: 'context-walk-socks', category: 'clothing', textZh: '🚶🧦 适合塌塌米/古建筑脱鞋游览的干净中筒袜', textEn: '🚶🧦 Clean high-quality socks for frequent shoe removal in shrines', completed: false });
      }

      saveChecklist(defaults);
    }
  };

  // Switch all checklist items state
  const handleToggleAll = (completed: boolean) => {
    const updated = checklist.map(it => ({ ...it, completed }));
    saveChecklist(updated);
  };

  // Grouped items config
  const CATEGORIES = [
    { key: 'docs', labelZh: '💼 证件与资金', labelEn: '💼 Documents & Funds' },
    { key: 'devices', labelZh: '🔌 电子与数码', labelEn: '🔌 Gadgets & Tech' },
    { key: 'clothing', labelZh: '👗 服饰与鞋履', labelEn: '👗 Clothes & Footwear' },
    { key: 'toiletries', labelZh: '🧼 洗护与防护', labelEn: '🧼 Toiletries & Skincare' },
    { key: 'meds', labelZh: '💊 随身非处方药', labelEn: '💊 Medicine & Health' },
    { key: 'custom', labelZh: '✨ 自定义添加', labelEn: '✨ Custom Additions' }
  ];

  // Active user's custom weather selector or auto-matched
  const [selectedWeatherCity, setSelectedWeatherCity] = useState<string>(() => {
    if (currentPlan && currentPlan.selectedDestinations.length > 0) {
      const match = WEATHER_ADVICE_DATABASE.find(item => 
        currentPlan.selectedDestinations.some(d => d.cityId.toLowerCase() === item.cityId)
      );
      if (match) return match.cityId;
    }
    return 'hangzhou';
  });

  const activeWeatherAdvice = WEATHER_ADVICE_DATABASE.find(item => item.cityId === selectedWeatherCity) || WEATHER_ADVICE_DATABASE[0];

  // Calculate statistics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(it => it.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 105 / 1.05) : 0; // standard round

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 px-1 md:py-6 animate-fade-in font-sans">
      
      {/* 1. HEADER PORT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100/30">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-5 h-5 text-indigo-650" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isZh ? '智能畅行随行行李与汇率大师' : 'Smart Travel Companion Master'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            {isZh 
              ? '为您提供了自适应的气候穿搭顾问、精细分类的随身打包清单、一键全局归一的离线可编辑即时汇率矩阵，轻松实现完美行前准备。' 
              : 'Empowers your journey with contextually tailored luggage checklists, micro-clothing guidelines, and editable offline currency conversions.'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="group inline-flex items-center justify-center p-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer shrink-0"
          title={isZh ? '返回工具箱' : 'Back to Toolkit'}
        >
          <div className="flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span className="select-none font-bold text-white text-xs transition-all duration-300 overflow-hidden max-w-0 opacity-0 group-hover:max-w-32 group-hover:opacity-100 group-hover:ml-1.5 whitespace-nowrap leading-none">
              {isZh ? '返回工具箱' : 'Back to Suite'}
            </span>
          </div>
        </button>
      </div>

      {/* NEW: DYNAMIC WEATHER & SEASONAL CLOTHE ADVICE PANEL (Point 1) */}
      <div className="bg-gradient-to-br from-indigo-50/40 via-sky-50/20 to-white border border-indigo-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-900">
              <CloudSun className="w-5 h-5 text-indigo-650 shrink-0" />
              <h3 className="font-bold text-sm md:text-base">
                {isZh ? '自适应目的地天气穿搭顾问' : 'Adaptive Weather & Dressing Advisory'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              {isZh 
                ? '支持基于当前行程城市的智能推荐，并在下方切换其他热门或具有极端气象代表性的目的地面板。' 
                : 'Focuses on your active travel stops weather, or pick any typical city below to adjust presets.'}
            </p>
          </div>

          {/* Preset Cities Selector for Dressing suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {WEATHER_ADVICE_DATABASE.map(city => {
              const matchesPlan = currentPlan && currentPlan.selectedDestinations.some(d => d.cityId.toLowerCase() === city.cityId);
              return (
                <button
                  key={city.cityId}
                  onClick={() => setSelectedWeatherCity(city.cityId)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                    selectedWeatherCity === city.cityId
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                      : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                  }`}
                >
                  {isZh ? city.nameZh : city.nameEn}
                  {matchesPlan && <span className="ml-1 text-[9px] text-emerald-500 bg-emerald-50 px-1 rounded">✔</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected City Weather & Clothes Guide Output */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4 space-y-2 border-r border-slate-100 pr-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider select-none">
              {isZh ? '📊 目标气候/气温特征' : '📊 Climate & Temperature'}
            </div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-50 rounded-xl">
                <Thermometer className="w-5 h-5 text-amber-500 animate-pulse" />
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-800 leading-relaxed">
                {isZh ? activeWeatherAdvice.tempZh : activeWeatherAdvice.tempEn}
              </span>
            </div>
            <div className="pt-2 text-[10px] text-slate-400">
              {isZh ? '* 数据参考多年均温及近期极端变化模型，出行前请查阅即时天气。' : '* Statistical benchmark for travel packing strategy.'}
            </div>
          </div>

          <div className="md:col-span-8 space-y-2.5">
            <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{isZh ? '💡 资深领队出行指南及必备穿搭' : '💡 Pro Packing & Outfit Recommendations'}</span>
            </div>
            <ul className="space-y-2">
              {(isZh ? activeWeatherAdvice.seasonTipsZh : activeWeatherAdvice.seasonTipsEn).map((tip, idx) => (
                <li key={idx} className="text-xs text-slate-600 font-medium leading-relaxed flex items-start gap-1.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                  <span className="text-indigo-500 font-mono mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CHECKLIST (8 cols) WITH PREMIUM FILTERS & ACTIONS (Point 2) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-650" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                {isZh ? '随身出行智能清单' : 'Luggage Dynamic Checklist'}
              </h3>
            </div>
            
            {/* Template Reset options & Toggle all */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResetChecklist}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl transition-all font-bold cursor-pointer"
                title="Reset list to default suggestions"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{isZh ? '恢复建议' : 'Reset Suggests'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                className="inline-flex items-center text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {isZh ? '全勾 ✔' : 'Check All ✔'}
              </button>
              
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                className="inline-flex items-center text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {isZh ? '全空 □' : 'Uncheck All □'}
              </button>
            </div>
          </div>

          {/* Progress Progress Banner */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">
                {isZh ? `随行物品打包进度 (${completedItems}/${totalItems})` : `Overall Packed Progress (${completedItems}/${totalItems})`}
              </span>
              <span className="font-mono font-bold text-indigo-750">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden border border-slate-100">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Point 2 Checklist Optimization: Search Field & Smart Status Filter Buttons */}
          <div className="space-y-3">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white rounded-2xl overflow-hidden px-3 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={isZh ? '在当下打包清单中实时模糊搜索...' : 'Search items instantly...'}
                className="flex-1 bg-transparent border-none text-xs text-slate-800 placeholder:text-slate-400 py-2.5 px-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-slate-405 hover:text-slate-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Tab Buttons */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isZh ? `全部 (${totalItems})` : `All (${totalItems})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unpacked')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeFilter === 'unpacked'
                    ? 'bg-amber-50 text-amber-700 border border-amber-250/50'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isZh ? `未打包 (${totalItems - completedItems})` : `Unpacked (${totalItems - completedItems})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('packed')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeFilter === 'packed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/50'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isZh ? `已打包 (${completedItems})` : `Packed (${completedItems})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('custom')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeFilter === 'custom'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isZh ? '✨ 特备/自定义' : '✨ Special/Custom'}
              </button>
            </div>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-inner"
              placeholder={isZh ? '手动添加您的特殊打包项... (回车或按加号键确认)' : 'Manually add custom travel item...'}
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
            <div className="relative shrink-0">
              <select
                value={newTodoCategory}
                onChange={(e: any) => setNewTodoCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 outline-none text-xs rounded-2xl px-3 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 max-w-[100px] sm:max-w-none"
              >
                <option value="custom">{isZh ? '🎒 特备' : '🎒 Custom'}</option>
                <option value="docs">{isZh ? '💼 证件' : '💼 Docs'}</option>
                <option value="devices">{isZh ? '🔌 数码' : '🔌 Tech'}</option>
                <option value="clothing">{isZh ? '👗 服饰' : '👗 Clothes'}</option>
                <option value="toiletries">{isZh ? '🧼 洗护' : '🧼 Care'}</option>
                <option value="meds">{isZh ? '💊 备药' : '💊 Meds'}</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center shrink-0"
              title="Add to packing checklist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Checklist Categories Lists */}
          <div className="space-y-5">
            {CATEGORIES.map(category => {
              // Get item values
              let categoryItems = checklist.filter(it => it.category === category.key);
              
              // Apply searches
              if (searchTerm.trim() !== '') {
                categoryItems = categoryItems.filter(it => 
                  it.textZh.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  it.textEn.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }

              // Apply status filters
              if (activeFilter === 'unpacked') {
                categoryItems = categoryItems.filter(it => !it.completed);
              } else if (activeFilter === 'packed') {
                categoryItems = categoryItems.filter(it => it.completed);
              } else if (activeFilter === 'custom') {
                categoryItems = categoryItems.filter(it => it.isCustom || it.id.startsWith('context'));
              }

              if (categoryItems.length === 0) return null;

              return (
                <div key={category.key} className="space-y-2 pb-2 border-b border-slate-103 last:border-b-0">
                  <h4 className="font-bold text-xs text-slate-500 tracking-wide uppercase select-none">
                    {isZh ? category.labelZh : category.labelEn}
                  </h4>
                  <div className="space-y-1.5">
                    {categoryItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                          item.completed 
                            ? 'bg-slate-50/50 border-slate-100 text-slate-400 line-through font-medium' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:border-indigo-150 font-semibold'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTodo(item.id)}
                          className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-605 shrink-0" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-400 shrink-0 hover:text-indigo-600 transition-colors" />
                          )}
                          <span className="text-xs break-all leading-normal">
                            {isZh ? item.textZh : item.textEn}
                          </span>
                        </button>
                        
                        {(item.isCustom || item.id.startsWith('context')) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTodo(item.id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-405 hover:text-red-500 transition-all cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty checklist warning */}
            {checklist.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                {isZh ? '当前清单为空，请点击上方“恢复建议”或手动添加！' : 'Checklist is empty. Tap "Reset Suggests" or add custom items.'}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENCY Master WITH PRESETS & EDITABLE RATES (Point 3) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                {isZh ? '跨币种对齐计算器' : 'Multi-currency master'}
              </h3>
            </div>
            
            {/* Rate edit command button */}
            <div className="flex items-center gap-1.5">
              {isEditingRates ? (
                <button
                  onClick={handleSaveAllRates}
                  className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-lg cursor-pointer transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isZh ? '保存' : 'Save'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const temp: { [key: string]: string } = {};
                    Object.keys(exchangeRates).forEach(cur => {
                      temp[cur] = exchangeRates[cur].toString();
                    });
                    setEditingRatesTemp(temp);
                    setIsEditingRates(true);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg cursor-pointer transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isZh ? '校正汇率' : 'Shift Rates'}</span>
                </button>
              )}
              {isEditingRates && (
                <button
                  onClick={handleResetDefaultRates}
                  className="text-[9px] text-rose-500 hover:underline flex items-center shrink-0 cursor-pointer"
                >
                  {isZh ? '重置' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-amber-50/20 border border-amber-100/70 rounded-2xl p-4 flex gap-2.5 text-amber-850">
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] leading-relaxed font-semibold">
                {isZh 
                  ? '在任意输入字段输入金额即可双向联动折算。' 
                  : 'Enter val in any currency block to sync all calculations instantly.'}
              </p>
              {isEditingRates && (
                <p className="text-[9px] text-amber-600 leading-normal font-bold">
                  {isZh 
                    ? '⚠️ 您目前已进入汇率手动校准模式！请输入每 1 美元 (USD) 所对应的各币种离岸公允比值。' 
                    : '⚠️ Editing mode active! Input base values corresponding to 1 USD.'}
                </p>
              )}
            </div>
          </div>

          {/* Quick Pricing Presets Panel */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
              {isZh ? '⚡ 常用消费智能快捷测算单' : '⚡ Travel Spot Price Presets'}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPresetValue('CNY', preset.values.CNY)}
                  className="text-left p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-150 rounded-xl transition-all cursor-pointer text-slate-700 hover:text-indigo-850 group"
                >
                  <div className="text-[10px] font-bold truncate">
                    {isZh ? preset.nameZh : preset.nameEn}
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-450 group-hover:text-indigo-600 font-bold mt-0.5 flex items-center justify-between">
                    <span>¥{preset.values.CNY} / ${preset.values.USD}</span>
                    <span className="text-[9px] text-slate-350 select-none">⚡</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Currency List */}
          <div className="space-y-4">
            {Object.keys(exchangeRates).map(cur => {
              const info = CURRENCY_INFO[cur] || { symbol: cur, nameZh: `${cur} 货币 (自定义)`, nameEn: `${cur} Currency (Custom)` };
              const curVal = convertedVals[cur] || '';
              const exchangeRateBaseVal = exchangeRates[cur];

              return (
                <div key={cur} className="space-y-1.5 bg-slate-50/40 p-2.5 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-550 px-1">
                    <span>{isZh ? info.nameZh : info.nameEn}</span>
                    
                    {/* Inline Rate display or dynamic input editor */}
                    {isEditingRates ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono">1 USD =</span>
                        <input
                          type="text"
                          className="w-16 text-center font-mono font-bold text-[10.5px] bg-white border border-indigo-200 text-indigo-700 rounded px-1 max-h-[18px]"
                          value={editingRatesTemp[cur] || ''}
                          onChange={(e) => handleRateEditInput(e.target.value, cur)}
                          disabled={cur === 'USD'} // USD is base
                        />
                        <span className="text-[9.5px] text-slate-450 uppercase font-mono">{cur}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-slate-400">1 USD = {exchangeRateBaseVal} {cur}</span>
                    )}
                  </div>

                  <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white rounded-2xl overflow-hidden transition-all shadow-inner">
                    <span className="absolute left-4 font-bold text-xs text-slate-500">
                      {info.symbol}
                    </span>
                    <input
                      type="text"
                      className="w-full text-right bg-transparent border-none text-slate-800 font-mono font-bold text-sm h-12 py-3 px-4 pl-12 focus:outline-none"
                      placeholder="0.00"
                      value={curVal}
                      onChange={(e) => handleCurrencyInput(e.target.value, cur)}
                    />
                    <div className="bg-slate-200/50 border-l border-slate-200 px-4 flex items-center justify-center font-bold text-[10px] text-slate-600 uppercase tracking-wider select-none shrink-0 h-12 w-16">
                      {cur}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed font-semibold">
            {isZh 
              ? '* 支持手动在上方校正各币种的实际汇率。默认参考 2026 核心离岸清算公允估算。' 
              : '* Customizable exchange rates. System defaults derived from 2026 macro banker models.'}
          </p>
        </div>

      </div>

    </div>
  );
}
