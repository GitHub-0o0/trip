/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { translations, TranslationDict } from './data/i18n';
import { TripPlan, DetailedCityPlan, CitySelection, TransitInfo, CustomLlmConfig, POI, CityIndex } from './types';
import { ALL_CITIES_INDEX, generateTransit, generateLocalPlan } from './data/cities';
import CitySelector from './components/CitySelector';
import MapContainer from './components/MapContainer';
import TimelineView from './components/TimelineView';
import BudgetVisualizer from './components/BudgetVisualizer';
import PlanComparison from './components/PlanComparison';
import HistoryArchive from './components/HistoryArchive';
import ReceiptMergeManager from './components/ReceiptMergeManager';
import PlanSyncManager from './components/PlanSyncManager';
import DailyRouteTransitPanel from './components/DailyRouteTransitPanel';
import CommunityForum from './components/CommunityForum';
import {
  Compass,
  Map,
  Scale,
  Archive,
  Sliders,
  Sparkles,
  Plane,
  Train,
  Car,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  Trash,
  Info,
  Calendar,
  DollarSign,
  MapPin,
  Trash2,
  X,
  Users
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [departureCity, setDepartureCity] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<CitySelection[]>([]);
  const [isAiEnhanced, setIsAiEnhanced] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null);
  const [historyPlans, setHistoryPlans] = useState<TripPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'plan' | 'itinerary' | 'compare' | 'history' | 'settings' | 'receipts' | 'forum'>('plan');
  const [activeCityIndex, setActiveCityIndex] = useState(0);

  // Custom LLM Configuration
  const [customLlmConfig, setCustomLlmConfig] = useState<CustomLlmConfig>({
    provider: (process.env.DEEPSEEK_API_KEY || '').startsWith('sk-') ? 'deepseek' : 'gemini',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  });

  // Map Engine & keys configuration
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google' | 'amap'>('leaflet');
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [amapKey, setAmapKey] = useState('60a7d9ce28b99a07f485f6e9ccce4ce3');
  const [amapSecurityCode, setAmapSecurityCode] = useState('');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [enhancingCityId, setEnhancingCityId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Cities dynamically created and written by LLM
  const [customCities, setCustomCities] = useState<CityIndex[]>([]);

  // Fetch translation dictionary
  const t: TranslationDict = translations[lang];

  // 1. Restore historical archives on startup
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('trip_ai_lang');
      if (savedLang === 'zh' || savedLang === 'en') {
        setLang(savedLang);
      }

      const storedHistory = localStorage.getItem('trip_ai_history');
      if (storedHistory) {
        setHistoryPlans(JSON.parse(storedHistory));
      }

      const storedCustomCities = localStorage.getItem('trip_ai_custom_cities');
      if (storedCustomCities) {
        setCustomCities(JSON.parse(storedCustomCities));
      }

      const cachedActive = localStorage.getItem('trip_ai_current_plan');
      if (cachedActive) {
        const parsedPlan = JSON.parse(cachedActive);
        setCurrentPlan(parsedPlan);
        setDepartureCity(parsedPlan.departureCity || '');
        setSelectedDestinations(parsedPlan.selectedDestinations || []);
        setActiveTab('itinerary');
      }

      const storedLlm = localStorage.getItem('trip_ai_custom_llm_config');
      if (storedLlm) {
        const parsed = JSON.parse(storedLlm);
        if (!parsed.apiKey && parsed.provider === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
          parsed.apiKey = process.env.DEEPSEEK_API_KEY;
        }
        setCustomLlmConfig(parsed);
      } else if (process.env.DEEPSEEK_API_KEY) {
        setCustomLlmConfig({
          provider: 'deepseek',
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseUrl: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat',
        });
      }

      const storedMapEngine = localStorage.getItem('trip_ai_map_engine');
      if (storedMapEngine === 'leaflet' || storedMapEngine === 'google' || storedMapEngine === 'amap') {
        setMapEngine(storedMapEngine as any);
      }

      const storedGoogleKey = localStorage.getItem('trip_ai_google_maps_key') || process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
      setGoogleMapsKey(storedGoogleKey);

      const storedAmapKey = localStorage.getItem('trip_ai_amap_key') || process.env.AMAP_KEY || '60a7d9ce28b99a07f485f6e9ccce4ce3';
      setAmapKey(storedAmapKey);

      const storedAmapSecurityCode = localStorage.getItem('trip_ai_amap_security_code') || '';
      setAmapSecurityCode(storedAmapSecurityCode);
    } catch (err) {
      console.error('Error recovering state from local storage', err);
    }
  }, []);

  // 2. Persist history list changes
  const saveHistoryToStorage = (updatedHistory: TripPlan[]) => {
    setHistoryPlans(updatedHistory);
    localStorage.setItem('trip_ai_history', JSON.stringify(updatedHistory));
  };

  const handleAddCustomCity = (city: CityIndex) => {
    setCustomCities((prev) => {
      const exists = prev.some((c) => c.id === city.id);
      if (exists) return prev;
      const updated = [...prev, city];
      localStorage.setItem('trip_ai_custom_cities', JSON.stringify(updated));
      return updated;
    });
  };

  // Convert city code to localized name safely
  const getCityLabel = (id: string | null | undefined) => {
    if (!id) return '';
    const city = [...ALL_CITIES_INDEX, ...customCities].find((c) => c.id === id);
    if (!city) {
      return id.charAt(0).toUpperCase() + id.slice(1);
    }
    return lang === 'zh' ? city.name : city.nameEn;
  };

  // 3. Main Itinerary Generator Request Handler
  const handleGeneratePlan = async () => {
    if (!departureCity) {
      setErrorMessage(t.errorOrigRequired);
      return;
    }
    if (selectedDestinations.length === 0) {
      setErrorMessage(t.errorNoDest);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        destinations: selectedDestinations,
        isAiEnhanced,
        lang,
        customLlm: customLlmConfig,
      };

      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status code ${res.status}`);
      }

      const data = await res.json();
      const plans: DetailedCityPlan[] = data.plans;

      if (data.isFallback) {
        setErrorMessage(
          lang === 'zh'
            ? '⚠️ 检测到您的 GEMINI_API_KEY 尚未配置。为了给您提供流畅、不中断的规划旅程，在后台我们已无缝加载高保真当地旅行模版作为优质补充。您可随时在 AI Studio 侧栏“Settings > Secrets”中配置密钥 “GEMINI_API_KEY”，一键解锁由大模型实时深度驱策与定制的闪耀行程！'
            : '⚠️ We detected your GEMINI_API_KEY is not configured yet. To keep your experience smooth and uninterrupted, we have seamlessly loaded our rich high-fidelity local pre-defined travel templates. Feel free to add your "GEMINI_API_KEY" secret in the "Settings > Secrets" panel to unlock real-time Gemini AI itineraries!'
        );
      }

      // Draw transits sequentially
      const transits: { [cityId: string]: TransitInfo } = {};
      let previousPoint = departureCity;

      selectedDestinations.forEach((dest) => {
        transits[dest.cityId] = generateTransit(previousPoint, dest.cityId);
        previousPoint = dest.cityId;
      });

      // Calculate totals
      const totalDays = selectedDestinations.reduce((sum, d) => sum + d.days, 0);
      const transitCost = (Object.values(transits) as TransitInfo[]).reduce((sum, t) => sum + t.cost * 2, 0); // double transport cost for return trip estimates
      const localCost = plans.reduce((sum, p) => {
        const exp = p.localExpense;
        return sum + exp.tickets + exp.food + exp.hotel + exp.transit;
      }, 0);

      const totalBudget = transitCost + localCost;

      // Form historical title
      const title = `${getCityLabel(departureCity)} → ${selectedDestinations.map((d) => getCityLabel(d.cityId)).join(' → ')}`;

      const newPlan: TripPlan = {
        id: 'plan_' + Date.now(),
        title,
        createdAt: new Date().toISOString(),
        departureCity,
        selectedDestinations,
        cityPlans: plans,
        transits,
        totalBudget,
        totalDays,
      };

      // Set active
      setCurrentPlan(newPlan);
      localStorage.setItem('trip_ai_current_plan', JSON.stringify(newPlan));

      // Append history plan (Max 20 logs)
      const filteredHistory = historyPlans.filter((h) => h.id !== newPlan.id);
      const updatedHistory = [newPlan, ...filteredHistory].slice(0, 20);
      saveHistoryToStorage(updatedHistory);

      setActiveCityIndex(0);
      setActiveTab('itinerary');
    } catch (err: any) {
      console.error('Error generating detailed trip plan!', err);
      setErrorMessage(err.message || 'Connectivity fault. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Single-city AI post-upgrade triggering
  const handleEnhanceSingleCity = async (cityId: string, daysCount: number) => {
    if (!currentPlan) return;

    setEnhancingCityId(cityId);
    try {
      const payload = {
        cityId,
        daysCount,
        cityName: getCityLabel(cityId),
        lang,
        customLlm: customLlmConfig,
      };

      const res = await fetch('/api/plan/enhance-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('API server failed');
      }

      const upgradedCityPlan: DetailedCityPlan = await res.json();

      if (!upgradedCityPlan.isAiEnhanced) {
        setErrorMessage(
          lang === 'zh'
            ? '⚠️ 检测到您的 GEMINI_API_KEY 尚未配置，未能在云端启用 AI 完美重构。已为您维持本地高保真路线状态，您可随时在 AI Studio 侧栏 “Settings > Secrets” 进行配置。'
            : '⚠️ We detected your GEMINI_API_KEY is not configured yet. Maintained the local pre-defined itineraries for this city. You can configure your API key in the "Settings > Secrets" panel.'
        );
      }

      // Remap updated plan
      const updatedCityPlans = currentPlan.cityPlans.map((p) => (p.cityId === cityId ? upgradedCityPlan : p));

      // Reevaluate local expenditure & totals
      const transitCost = (Object.values(currentPlan.transits) as TransitInfo[]).reduce((sum, t) => sum + t.cost * 2, 0);
      const localCost = updatedCityPlans.reduce((sum, p) => {
        const exp = p.localExpense;
        return sum + exp.tickets + exp.food + exp.hotel + exp.transit;
      }, 0);

      const totalBudget = transitCost + localCost;

      const upgradedPlan: TripPlan = {
        ...currentPlan,
        cityPlans: updatedCityPlans,
        totalBudget,
      };

      setCurrentPlan(upgradedPlan);
      localStorage.setItem('trip_ai_current_plan', JSON.stringify(upgradedPlan));

      // Update history list item if matched
      const renamedHistory = historyPlans.map((h) => (h.id === currentPlan.id ? upgradedPlan : h));
      saveHistoryToStorage(renamedHistory);
    } catch (err) {
      console.error('Error upgrading single city to AI', err);
    } finally {
      setEnhancingCityId(null);
    }
  };

  // 4b. Update current plan details from subcomponents (e.g. MapContainer Route Planner)
  const handleUpdatePlan = (updatedPlan: TripPlan) => {
    setCurrentPlan(updatedPlan);
    localStorage.setItem('trip_ai_current_plan', JSON.stringify(updatedPlan));
    const updatedHistory = historyPlans.map((h) => h.id === updatedPlan.id ? updatedPlan : h);
    saveHistoryToStorage(updatedHistory);
  };

  // 4c. Update current active city spots (POIs) reordered or edited under a day plan
  const handleUpdateCityPois = (dayNumber: number, updatedPois: POI[]) => {
    if (!currentPlan) return;
    const updatedCityPlans = currentPlan.cityPlans.map((cityPlan, cityIdx) => {
      if (cityIdx === activeCityIndex) {
        const updatedDays = cityPlan.days.map((dayPlan) => {
          if (dayPlan.day === dayNumber) {
            return {
              ...dayPlan,
              pois: updatedPois
            };
          }
          return dayPlan;
        });
        return {
          ...cityPlan,
          days: updatedDays
        };
      }
      return cityPlan;
    });

    const updatedPlan: TripPlan = {
      ...currentPlan,
      cityPlans: updatedCityPlans
    };
    handleUpdatePlan(updatedPlan);
  };

  // 5. Historical plan restoration trigger
  const handleLoadHistoricalPlan = (plan: TripPlan) => {
    setCurrentPlan(plan);
    setDepartureCity(plan.departureCity);
    setSelectedDestinations(plan.selectedDestinations);
    localStorage.setItem('trip_ai_current_plan', JSON.stringify(plan));
    setActiveCityIndex(0);
    setActiveTab('itinerary');
  };

  // 6. Delete a historical plan
  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyPlans.filter((h) => h.id !== id);
    saveHistoryToStorage(updated);

    // If currently active is deleted, clear active state
    if (currentPlan && currentPlan.id === id) {
      setCurrentPlan(null);
      localStorage.removeItem('trip_ai_current_plan');
    }
  };

  // 7. Erase completely
  const handleClearAllStorage = () => {
    if (confirm(lang === 'zh' ? '确定清除全部历史计划和城市缓存吗？此操作无法撤销。' : 'Purge all archived itineraries and caches? This cannot be undone.')) {
      localStorage.clear();
      setDepartureCity('');
      setSelectedDestinations([]);
      setCurrentPlan(null);
      setHistoryPlans([]);
      setActiveTab('plan');
    }
  };

  const handleLanguageSwitch = (newLang: 'zh' | 'en') => {
    setLang(newLang);
    localStorage.setItem('trip_ai_lang', newLang);
  };

  // 8. Custom LLM Handlers
  const [testStatus, setTestStatus] = useState<{
    isLoading: boolean;
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProviderChange = (provider: CustomLlmConfig['provider']) => {
    setTestStatus(null);
    setSaveSuccess(false);

    let defaultUrl = '';
    let defaultModel = '';

    switch (provider) {
      case 'gemini':
        defaultUrl = '';
        defaultModel = '';
        break;
      case 'deepseek':
        defaultUrl = 'https://api.deepseek.com';
        defaultModel = 'deepseek-chat';
        break;
      case 'minimax':
        defaultUrl = 'https://api.minimax.chat/v1';
        defaultModel = 'abab6.5g-chat';
        break;
      case 'qwen':
        defaultUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
        defaultModel = 'qwen-turbo';
        break;
      case 'custom':
        defaultUrl = 'https://api.openai.com/v1';
        defaultModel = 'gpt-4o-mini';
        break;
    }

    setCustomLlmConfig({
      provider,
      apiKey: provider === 'gemini' ? '' : customLlmConfig.provider === 'gemini' ? '' : customLlmConfig.apiKey,
      baseUrl: defaultUrl,
      model: defaultModel,
    });
  };

  const handleSaveConfig = () => {
    localStorage.setItem('trip_ai_custom_llm_config', JSON.stringify(customLlmConfig));
    localStorage.setItem('trip_ai_map_engine', mapEngine);
    localStorage.setItem('trip_ai_google_maps_key', googleMapsKey);
    localStorage.setItem('trip_ai_amap_key', amapKey);
    localStorage.setItem('trip_ai_amap_security_code', amapSecurityCode);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleTestConnection = async () => {
    setTestStatus({ isLoading: true });
    try {
      const res = await fetch('/api/plan/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLlm: customLlmConfig }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestStatus({
          isLoading: false,
          success: false,
          error: data.error || 'Upstream validation failed.',
        });
      } else {
        setTestStatus({
          isLoading: false,
          success: true,
          message: data.message,
        });
      }
    } catch (err: any) {
      setTestStatus({
        isLoading: false,
        success: false,
        error: err.message || 'Network Timeout',
      });
    }
  };

  const [amapTestStatus, setAmapTestStatus] = useState<{
    isLoading: boolean;
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleTestAmapConnection = async () => {
    setAmapTestStatus({ isLoading: true });
    try {
      const res = await fetch('/api/plan/test-amap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: amapKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAmapTestStatus({
          isLoading: false,
          success: false,
          error: data.error || 'Amap key validation failed.',
        });
      } else {
        setAmapTestStatus({
          isLoading: false,
          success: true,
          message: data.message,
        });
      }
    } catch (err: any) {
      setAmapTestStatus({
        isLoading: false,
        success: false,
        error: err.message || 'Network Timeout',
      });
    }
  };

  // Segment transit visual helper
  const getTransitIcon = (type: TransitInfo['type']) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5 text-indigo-650" />;
      case 'train':
        return <Train className="w-5 h-5 text-indigo-650" />;
      default:
        return <Car className="w-5 h-5 text-indigo-650" />;
    }
  };

  const getTransitLabel = (type: TransitInfo['type']) => {
    switch (type) {
      case 'flight':
        return t.transitFlight;
      case 'train':
        return t.transitTrain;
      default:
        return t.transitCar;
    }
  };

  const currentActiveCityPlan = currentPlan ? currentPlan.cityPlans[activeCityIndex] : null;

  const getActiveAiName = () => {
    if (customLlmConfig.provider === 'gemini') {
      return 'Google Gemini 3.5';
    }
    if (customLlmConfig.provider === 'deepseek') {
      return 'DeepSeek';
    }
    if (customLlmConfig.provider === 'qwen') {
      return lang === 'zh' ? '通义千问' : 'Qwen';
    }
    if (customLlmConfig.provider === 'minimax') {
      return 'MiniMax';
    }
    return lang === 'zh' ? 'Custom AI' : 'Custom AI';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col scrollbar-thin">
      {/* 1. BRAND GLOBAL HEADER */}
      <header className="sticky top-0 bg-white/90 border-b border-slate-200 py-4 px-6 md:px-8 flex items-center justify-between backdrop-blur-md z-45 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <div>
            <h1 className="font-sans font-bold text-slate-900 text-lg md:text-xl tracking-tight">
              Trip AI <span className="text-blue-600">旅途</span>
            </h1>
            <p className="font-sans text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">
              {lang === 'zh' ? 'AI 驱动的全球智能行程规划助手 v1.0' : 'Intelligent Route Planner v1.0'}
            </p>
          </div>
        </div>

        {/* Global Actions with Avatars and Toggles */}
        <div className="flex items-center gap-4">
          {/* Bento-style avatar pile for destinations */}
          <div className="hidden sm:flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm" title="Beijing Stop">BJ</div>
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm" title="London Stop">LD</div>
            <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-600 shadow-sm" title="Paris Stop">PR</div>
          </div>
          <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

          <div className="flex bg-slate-100/80 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => handleLanguageSwitch('zh')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                lang === 'zh' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => handleLanguageSwitch('en')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                lang === 'en' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* 2. LOADING SCREEN OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-fade-in text-center">
          <div className="bg-white rounded-3xl p-8 max-w-lg shadow-2xl space-y-5 border border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 animate-pulse"></div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-slate-800 text-lg">{t.loadingTitle}</h3>
              <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {t.loadingSub}
              </p>
            </div>

            {/* Circular Orbit Spinner */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENTS WRAPPER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-24">
        {errorMessage && (
          <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-red-700 animate-fade-in font-sans items-start justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div className="text-xs">
                <strong className="block font-bold mb-0.5">Notification Alert</strong>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: ROADWAY SEARCH PLANNERS */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <CitySelector
              t={t}
              lang={lang}
              departureCity={departureCity}
              setDepartureCity={setDepartureCity}
              selectedDestinations={selectedDestinations}
              setSelectedDestinations={setSelectedDestinations}
              isAiEnhanced={isAiEnhanced}
              setIsAiEnhanced={setIsAiEnhanced}
              onGenerate={handleGeneratePlan}
              isLoading={isLoading}
              customLlmConfig={customLlmConfig}
              customCities={customCities}
              onAddCustomCity={handleAddCustomCity}
            />

            <PlanSyncManager
              currentPlan={currentPlan}
              onLoadSyncedPlan={handleLoadHistoricalPlan}
              lang={lang}
              t={t}
            />
          </div>
        )}

        {/* TAB 2: CURRENT ACTIVE ITINERARY VIEWER */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            {!currentPlan ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-sm">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-sans font-bold text-slate-700 text-sm mb-1">
                  {lang === 'zh' ? '暂无生成的行程方案' : 'No active trip generated'}
                </h3>
                <p className="font-sans text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-6">
                  {lang === 'zh'
                    ? '请先回到“规划行程”模块配置并计算您的多站目的地航线规划。'
                    : 'Get started by creating your departure and destination schedules inside standard planner.'}
                </p>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {lang === 'zh' ? '立即去策划' : 'Go Configure Itinerary'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Aggregate Top Overview Banner */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-50/50 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12"></div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        {lang === 'zh' ? '特快高定通道' : 'High-End Custom Route'}
                      </span>
                    </div>

                    {/* Sequential destinations flow */}
                    <h3 className="font-sans font-extrabold text-slate-800 text-lg md:text-xl flex flex-wrap items-center gap-2 tracking-tight">
                      <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-xl text-xs border border-rose-100 flex items-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        {getCityLabel(currentPlan.departureCity)}
                      </span>
                      <span className="text-slate-300 font-normal">→</span>
                      {currentPlan.selectedDestinations.map((d, index) => (
                        <React.Fragment key={d.cityId}>
                          <span className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold font-sans">
                            {getCityLabel(d.cityId)} ({d.days}d)
                          </span>
                          {index < currentPlan.selectedDestinations.length - 1 && (
                            <span className="text-slate-300 font-normal">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </h3>

                    {/* Schedule statistics row */}
                    <div className="flex items-center gap-4 text-xs font-sans font-medium text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar className="w-4 h-4 text-slate-450" />
                        {t.totalDays}: <span className="font-bold text-slate-700">{currentPlan.totalDays}</span>
                      </span>
                      <span className="flex items-center gap-1 font-sans">
                        <DollarSign className="w-4 h-4 text-slate-450" />
                        {t.totalBudget}:{' '}
                        <span className="font-bold text-indigo-600 text-sm">
                          {lang === 'zh' ? '¥' : '$'}
                          {currentPlan.totalBudget}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(lang === 'zh' ? '确认丢弃重新进入规划向导吗？' : 'Discard current plan and re-configure dream schedule?')) {
                        setSelectedDestinations([]);
                        setCurrentPlan(null);
                        localStorage.removeItem('trip_ai_current_plan');
                        setActiveTab('plan');
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-sans font-semibold border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all self-end md:self-center"
                  >
                    {t.btnBack}
                  </button>
                </div>

                {/* 2. Interactive Map view and City selectors */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Integrated Daily recommended transit & travel route timeline */}
                  <div className="lg:col-span-4 shrink-0 animate-fade-in">
                    <DailyRouteTransitPanel
                      currentPlan={currentPlan}
                      activeCityIndex={activeCityIndex}
                      lang={lang}
                      getCityLabel={getCityLabel}
                      onSelectCityIndex={setActiveCityIndex}
                    />
                  </div>

                  {/* Right Column: Custom interactive map routing */}
                  <div className="lg:col-span-8">
                    <MapContainer
                      departureCityId={currentPlan.departureCity}
                      cityPlans={currentPlan.cityPlans}
                      activePlanIndex={activeCityIndex}
                      onSelectCityIndex={setActiveCityIndex}
                      mapEngine={mapEngine}
                      googleMapsKey={googleMapsKey}
                      amapKey={amapKey}
                      amapSecurityCode={amapSecurityCode}
                      currentPlan={currentPlan}
                      onUpdatePlan={handleUpdatePlan}
                      lang={lang}
                    />
                  </div>
                </div>

                {/* 3. Render current selected City Detail block */}
                {currentActiveCityPlan && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left side details and timeline */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                      {/* Active header meta status */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-5 flex-wrap gap-4">
                        <div>
                          <h3 className="font-sans font-bold text-slate-900 text-lg md:text-xl flex items-center gap-2 tracking-tight">
                            <span>{lang === 'zh' ? currentActiveCityPlan.cityName : currentActiveCityPlan.cityNameEn}</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                              {currentActiveCityPlan.daysCount} {currentActiveCityPlan.daysCount === 1 ? 'Day' : 'Days'}
                            </span>
                          </h3>
                          <p className="font-sans text-xs text-slate-400 leading-relaxed mt-1.5 font-medium">
                            {t.bestSeason}{' '}
                            <span className="text-slate-800 font-bold">
                              {lang === 'zh' ? currentActiveCityPlan.bestSeason : currentActiveCityPlan.bestSeasonEn}
                            </span>
                          </p>
                        </div>

                        {/* Upgrade Button triggered individually */}
                        <div>
                          {currentActiveCityPlan.isAiEnhanced ? (
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-sans text-xs px-3.5 py-2.5 rounded-xl border border-blue-100 font-bold shadow-sm">
                              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                              <span>{t.aiEnhancedActive}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleEnhanceSingleCity(
                                  currentActiveCityPlan.cityId,
                                  currentActiveCityPlan.daysCount
                                )
                              }
                              disabled={enhancingCityId === currentActiveCityPlan.cityId}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-4.5 py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
                            >
                              {enhancingCityId === currentActiveCityPlan.cityId ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              )}
                              <span>{t.aiUpgradeBtn}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Itinerary Timeline */}
                      <TimelineView t={t} lang={lang} days={currentActiveCityPlan.days} onUpdatePois={handleUpdateCityPois} />
                    </div>

                    {/* Right side: visual costs analysis and survival advice lists */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Cost items progress */}
                      <BudgetVisualizer t={t} lang={lang} expense={currentActiveCityPlan.localExpense} />

                      {/* Dynamic AI Status Card (Derived from Bento theme HTML block) */}
                      <div className="bg-blue-600 rounded-3xl p-6 shadow-md text-white space-y-4">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] font-bold opacity-90 uppercase tracking-widest">{getActiveAiName()} AI Status</span>
                          </div>
                          <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                        </div>
                        <p className="text-xs font-medium leading-relaxed opacity-95">
                          {currentActiveCityPlan.isAiEnhanced
                            ? (lang === 'zh'
                              ? `“AI 成功加载完成！${currentActiveCityPlan.cityName} 每日餐饮，住宿，以及景点拥堵状况已完美校对校正，保障高品质体验。”`
                              : `"Itinerary upgraded! Categorical dining hotspots, staying ratings, and localized timing grids for ${currentActiveCityPlan.cityNameEn} are optimized."`)
                            : (lang === 'zh'
                              ? `“建议点击上方 'AI 精兵一键升级' 启用 ${getActiveAiName()} 重构算法校对路线通联。”`
                              : `"Click the AI Upgrade Button above to invoke ${getActiveAiName()} model optimization engine for this stop."`)
                          }
                        </p>
                      </div>

                      {/* Veteran secrets card and list */}
                      <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm font-sans space-y-4.5">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                          <Compass className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-sm leading-tight tracking-wide text-slate-850 uppercase">{t.veteranTips}</h4>
                        </div>
                        <ul className="space-y-3.5">
                          {(lang === 'zh' ? currentActiveCityPlan.veteranTips : currentActiveCityPlan.veteranTipsEn)?.map(
                            (tip, i) => (
                              <li key={i} className="flex gap-3 items-start text-xs font-medium text-slate-600 leading-relaxed">
                                <span className="w-5 h-5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] shrink-0">
                                  {i + 1}
                                </span>
                                <p className="flex-1">{tip}</p>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PLANK COMPARISONS */}
        {activeTab === 'compare' && (
          <PlanComparison
            t={t}
            lang={lang}
            cityPlans={currentPlan ? currentPlan.cityPlans : []}
            transits={currentPlan ? currentPlan.transits : {}}
          />
        )}

        {/* TAB 4: HISTORY ARCHIVES LIST */}
        {activeTab === 'history' && (
          <HistoryArchive
            t={t}
            lang={lang}
            plans={historyPlans}
            onSelectPlan={handleLoadHistoricalPlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {/* TAB 5: SYSTEM PREFERENCES & ABOUT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* 1. General Preferences card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6 font-sans">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <Sliders className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-800 text-base">{t.navSettings}</h3>
              </div>

              {/* Languages Preferences Panel */}
              <div className="space-y-2">
                <label className="block text-slate-600 font-semibold text-xs tracking-wide uppercase">
                  {t.settingsLanguage}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLanguageSwitch('zh')}
                    className={`flex-1 border px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      lang === 'zh'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/10'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>简体中文</span>
                  </button>
                  <button
                    onClick={() => handleLanguageSwitch('en')}
                    className={`flex-1 border px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      lang === 'en'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/10'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Map Engine Selection Panel */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <label className="block text-slate-600 font-semibold text-xs tracking-wide uppercase">
                  {lang === 'zh' ? '交互地图引擎' : 'Map Provider Engine'}
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMapEngine('leaflet')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-16 ${
                      mapEngine === 'leaflet'
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 border-dashed'
                    }`}
                  >
                    <span className="text-xs">Leaflet</span>
                    <span className="text-[9px] text-slate-400 font-medium">OSM (Default)</span>
                  </button>

                  <button
                    onClick={() => setMapEngine('google')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-16 ${
                      mapEngine === 'google'
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 border-dashed'
                    }`}
                  >
                    <span className="text-xs">Google Maps</span>
                    <span className="text-[9px] text-slate-400 font-medium">{lang === 'zh' ? '谷歌地图' : 'Official SDK'}</span>
                  </button>

                  <button
                    onClick={() => setMapEngine('amap')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-16 ${
                      mapEngine === 'amap'
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 border-dashed'
                    }`}
                  >
                    <span className="text-xs">Amap (高德)</span>
                    <span className="text-[9px] text-slate-400 font-medium">{lang === 'zh' ? '国内首选' : 'China Map'}</span>
                  </button>
                </div>

                {/* Conditional Key Configuration */}
                {mapEngine === 'google' && (
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 animate-fadeIn text-xs">
                    <label className="block text-slate-600 font-semibold text-[11px] tracking-wide uppercase">
                      Google Maps API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIStudio key or custom key (AI_zaSy...)"
                      value={googleMapsKey}
                      onChange={(e) => setGoogleMapsKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all font-mono text-slate-800 shadow-inner"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {lang === 'zh'
                        ? '您可将 GOOGLE_MAPS_PLATFORM_KEY 密钥直接贴在此处（或在 AI Studio 的 Settings > Secrets 侧栏进行配置，我们将同步自动加载）。'
                        : 'You can input your GOOGLE_MAPS_PLATFORM_KEY here. Or, configure it in the AI Studio "Secrets" side panel for automatic loading.'}
                    </p>
                  </div>
                )}

                {mapEngine === 'amap' && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-slate-100 animate-fadeIn text-xs">
                    <div className="space-y-1.5">
                      <label className="block text-slate-600 font-semibold text-[11px] tracking-wide uppercase font-bold">
                        {lang === 'zh' ? '高德 Web 服务 JavaScript Key' : 'Amap JS Key'}
                      </label>
                      <input
                        type="password"
                        placeholder="e.g. 52cxxxxxxxxxxxxxxxxxxxxx"
                        value={amapKey}
                        onChange={(e) => setAmapKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all font-mono text-slate-800 shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-600 font-semibold text-[11px] tracking-wide uppercase font-mono">
                        {lang === 'zh' ? '高德安全密钥 (AMap Security JS Code)' : 'Amap Security Code'}
                      </label>
                      <input
                        type="password"
                        placeholder="e.g. 718xxxxxxxxxxxxxxxxxxxxx"
                        value={amapSecurityCode}
                        onChange={(e) => setAmapSecurityCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all font-mono text-slate-800 shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {lang === 'zh'
                        ? '支持中国大陆境外及境内无 VPN 极速、双语街景和自适应缩放描画。'
                        : 'Amap JS API v2.0 requires active security JS Code configured alongside the public consumer key block.'}
                    </p>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={amapTestStatus?.isLoading || !amapKey}
                        onClick={handleTestAmapConnection}
                        className={`border px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          amapTestStatus?.isLoading
                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                            : !amapKey
                            ? 'bg-slate-50 text-slate-350 border-slate-150 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        {amapTestStatus?.isLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span>{lang === 'zh' ? '正在校验高德 API Key...' : 'Validating Amap Secret...'}</span>
                          </>
                        ) : (
                          <>
                            <span>🔍</span>
                            <span>{lang === 'zh' ? '验证高德地图 Key' : 'Verify Amap Key'}</span>
                          </>
                        )}
                      </button>

                      {amapTestStatus && (
                        <div className={`p-3 rounded-2xl border text-[11px] leading-relaxed flex flex-col gap-1 ${
                          amapTestStatus.success
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                            : 'bg-rose-50 border-rose-100 text-rose-800'
                        }`}>
                          <div className="font-bold">
                            {amapTestStatus.success ? (
                              <span>{lang === 'zh' ? '✅ 高德 Key 校验成功！' : '✅ Amap Key Verified!'}</span>
                            ) : (
                              <span>{lang === 'zh' ? '❌ 高德 Key 验证失败' : '❌ Verification Failed'}</span>
                            )}
                          </div>
                          {amapTestStatus.message && <p className="font-mono text-[10px] opacity-90 break-all">{amapTestStatus.message}</p>}
                          {amapTestStatus.error && <p className="font-mono text-[10px] opacity-90 break-all">{amapTestStatus.error}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Custom LLM / Domestic API configuration channel card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6 font-sans">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-base">
                  {lang === 'zh' ? 'AI 行程规划模型渠道' : 'AI Trip Planner Routing'}
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === 'zh'
                  ? '系统默认使用预配置的 Google Gemini 3.5 闪电大模型提供云端解析。如果您在国内环境且希望获得极致、稳定的专属线路，推荐在此接入您个人的 DeepSeek (推荐)、阿里通义千问、MiniMax 等国内服务商接口。密钥在本地双端对称沙盒存储，不泄露至任何第三方。'
                  : 'By default, we utilize a pre-configured Google Gemini 3.5 Flash backend. For localized or customized travel planning depth, configure your personal domestic LLM keys below (DeepSeek recommended, Qwen, or MiniMax) – fully private and client-persisted.'}
              </p>

              {/* Provider Quick selector Grid */}
              <div className="space-y-2">
                <label className="block text-slate-600 font-semibold text-xs tracking-wide uppercase">
                  {lang === 'zh' ? '服务商选择' : 'LLM Provider'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'gemini', label: 'Google Gemini', subtitle: lang === 'zh' ? '云端默认闪闪模型' : 'Default cloud engine' },
                    { id: 'deepseek', label: 'DeepSeek', subtitle: lang === 'zh' ? '深度求索 (推荐)' : 'DeepSeek V3 / R1' },
                    { id: 'qwen', label: '通义千问 (Qwen)', subtitle: lang === 'zh' ? '阿里云大语言模型' : 'Alibaba Cloud Qwen' },
                    { id: 'minimax', label: 'MiniMax', subtitle: lang === 'zh' ? '稀宇科技 abab' : 'MiniMax abab' },
                    { id: 'custom', label: 'Custom Endpoint', subtitle: lang === 'zh' ? '任意 OpenAI 兼容' : 'Custom OpenAI compatible' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderChange(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                        customLlmConfig.provider === p.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/30'
                          : 'border-slate-150 bg-slate-50/50 hover:border-slate-250'
                      }`}
                    >
                      <span className={`font-bold text-xs ${customLlmConfig.provider === p.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {p.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                        {p.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional parameters */}
              {customLlmConfig.provider !== 'gemini' && (
                <div className="space-y-4 border-t border-slate-50 pt-4 animate-fadeIn">
                  {/* API KEY Input field */}
                  <div className="space-y-1">
                    <label className="block text-slate-600 font-semibold text-[11px] tracking-wide uppercase">
                      API Access Key
                    </label>
                    <input
                      type="password"
                      placeholder={
                        customLlmConfig.provider === 'deepseek' ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxx' : 'pasted secret key...'
                      }
                      value={customLlmConfig.apiKey}
                      onChange={(e) => setCustomLlmConfig({ ...customLlmConfig, apiKey: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all font-mono text-slate-800 shadow-inner"
                    />
                    <p className="text-[10px] text-slate-400">
                      {lang === 'zh'
                        ? '此密钥存储在您的浏览器本地缓存中，仅直接透传发送至大模型服务器。'
                        : 'Stored exclusively inside your local storage cache, and routed straight to secure APIs.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BASE URL Input field */}
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-semibold text-[11px] tracking-wide uppercase">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://api.deepseek.com"
                        value={customLlmConfig.baseUrl}
                        onChange={(e) => setCustomLlmConfig({ ...customLlmConfig, baseUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all font-mono text-slate-750"
                      />
                    </div>

                    {/* MODEL ID Input field */}
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-semibold text-[11px] tracking-wide uppercase">
                        Model / Alias Name
                      </label>
                      <input
                        type="text"
                        placeholder="deepseek-chat"
                        value={customLlmConfig.model}
                        onChange={(e) => setCustomLlmConfig({ ...customLlmConfig, model: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs px-4 py-3 rounded-2xl outline-none transition-all font-mono text-slate-750"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Indicator & Control row */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                {/* Diagnostics Connect Feedback banner */}
                {testStatus && (
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col gap-1.5 ${
                    testStatus.success
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-sm'
                      : 'bg-rose-50 border-rose-100 text-rose-800 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      {testStatus.success ? (
                        <>
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{lang === 'zh' ? '✅ 接口测试验证成功！' : '✅ Connection tested successfully!'}</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span>{lang === 'zh' ? '❌ 接口验证失败' : '❌ Target connection failed'}</span>
                        </>
                      )}
                    </div>
                    {testStatus.message && (
                      <div className="font-mono bg-white/60 p-2.5 rounded-xl border border-emerald-250/20 mt-1 select-all break-all text-[11px]">
                        {testStatus.message}
                      </div>
                    )}
                    {testStatus.error && (
                      <div className="font-mono bg-white/60 p-2.5 rounded-xl border border-rose-250/20 mt-1 max-h-24 overflow-y-auto break-all text-[11px]">
                        {testStatus.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Save configuration popups feedback */}
                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200/40 text-emerald-800 rounded-2xl text-xs font-semibold animate-pulse flex items-center gap-2 shadow-sm shadow-emerald-105/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    <span>{lang === 'zh' ? '🎉 新的主机模型配置已成功保存！旅行计划已完美应用！' : '🎉 Channels saved successfully! Applied flawlessly to subsequent routing!'}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {customLlmConfig.provider !== 'gemini' && (
                    <button
                      type="button"
                      disabled={testStatus?.isLoading || !customLlmConfig.apiKey}
                      onClick={handleTestConnection}
                      className={`flex-1 border px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        testStatus?.isLoading
                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                          : !customLlmConfig.apiKey
                          ? 'bg-slate-50 text-slate-350 border-slate-150 cursor-not-allowed'
                          : 'bg-white text-slate-750 border-slate-200 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      {testStatus?.isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span>{lang === 'zh' ? '正在连接接口...' : 'Sending diagnose handshake...'}</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>{lang === 'zh' ? '测试连接' : 'Test API Endpoint'}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💾</span>
                    <span>{lang === 'zh' ? '保存并应用设置' : 'Save & Hotswap Model'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. High-risk cache clearing card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-4 font-sans">
              <span className="block text-slate-650 font-semibold text-xs tracking-wide uppercase">
                {lang === 'zh' ? '缓存安全诊断' : 'Safety & Storage operations'}
              </span>
              <button
                type="button"
                onClick={handleClearAllStorage}
                className="bg-rose-50 hover:bg-rose-100/80 border border-rose-100 text-rose-700 font-semibold text-xs px-4.5 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.btnClearCache}</span>
              </button>
            </div>

            {/* 4. About Card details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-4 font-sans text-xs text-slate-500">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Info className="w-4.5 h-4.5 text-slate-400" />
                <h4 className="font-bold text-slate-700 text-sm leading-tight">{t.aboutTitle}</h4>
              </div>
              <p className="leading-relaxed font-light">
                {lang === 'zh'
                  ? '“旅途（Trip AI）”全球智能行程规划助手是由 Google AI Studio 强力驱动的跨端旅行导航产品，面向全球自由行、多目的地连游及对出海极度挑剔的顶级玩家用户贴心打造。'
                  : '"Trip AI" Global Itinerary Planner is tailored for modern smart travelers demanding seamless, high-fidelity daily schedules, dining, staying rates, and localized routing.'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono font-semibold pt-1 border-t border-slate-100/60">
                <span>Version 1.1 (Prod)</span>
                <span>© May 2026 Trip AI Labs</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <ReceiptMergeManager
            lang={lang}
            t={t}
            currentPlan={currentPlan}
            setCurrentPlan={setCurrentPlan}
            setActiveTab={setActiveTab}
            setErrorMessage={setErrorMessage}
          />
        )}

        {activeTab === 'forum' && (
          <CommunityForum
            currentPlan={currentPlan}
            onClonePlan={(plan) => {
              setCurrentPlan(plan);
              if (plan.departureCity) {
                setDepartureCity(plan.departureCity);
              }
              if (plan.selectedDestinations) {
                setSelectedDestinations(plan.selectedDestinations);
              }
              setActiveCityIndex(0);
              setActiveTab('itinerary');
            }}
            lang={lang}
            onClose={() => setActiveTab('plan')}
          />
        )}
      </main>

      {/* 4. SEAMLESS DOCK NAVIGATION BAR (BOTTOM STICKY) */}
      <footer className="fixed bottom-0 left-0 right-0 h-18 bg-white/95 border-t border-slate-200 py-2.5 px-4 flex items-center justify-around backdrop-blur-md z-45 shadow-sm">
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
            activeTab === 'plan' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Compass className="w-5.5 h-5.5" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none">{t.navPlan}</span>
        </button>

        <button
          onClick={() => {
            if (currentPlan) setActiveTab('itinerary');
            else alert(lang === 'zh' ? '请先生成规划方案，再切换至Itinerary细节哦' : 'Please envision an active dream schedule first!');
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 relative ${
            activeTab === 'itinerary' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-650'
          } ${!currentPlan ? 'opacity-40 hover:opacity-55' : ''}`}
        >
          <Map className="w-5.5 h-5.5" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none">{t.navOverview}</span>
        </button>

        <button
          onClick={() => {
            if (currentPlan) setActiveTab('compare');
            else alert(lang === 'zh' ? '请先生成规划方案，再切换至评估对比哦' : 'Please envision an active dream schedule first!');
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
            activeTab === 'compare' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-650'
          } ${!currentPlan ? 'opacity-40 hover:opacity-55' : ''}`}
        >
          <Scale className="w-5.5 h-5.5" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none">{t.navCompare}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
            activeTab === 'history' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Archive className="w-5.5 h-5.5" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none">{t.navHistory}</span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
            activeTab === 'receipts' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <FileSpreadsheet className="w-5.5 h-5.5" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none">{t.navReceipts}</span>
        </button>

        <button
          onClick={() => setActiveTab('forum')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
            activeTab === 'forum' ? 'text-blue-600 font-bold scale-105 animate-pulse' : 'text-slate-400 hover:text-slate-650 animate-none'
          }`}
          id="nav-forum-tab-btn"
        >
          <Users className="w-5.5 h-5.5 text-indigo-500" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none text-indigo-700">{t.navForum}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
            activeTab === 'settings' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Sliders className="w-5.5 h-5.5" />
          <span className="text-[10px] select-none font-bold tracking-tight leading-none">{t.navSettings}</span>
        </button>
      </footer>
    </div>
  );
}
