/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ALL_CITIES_INDEX, CN_CITIES, INTL_CITIES } from '../data/cities';
import { CityIndex, CitySelection, CustomLlmConfig } from '../types';
import { TranslationDict } from '../data/i18n';
import { Search, MapPin, Plus, Trash2, Sliders, ChevronRight, HelpCircle, Compass, ArrowRight, Loader, Sparkles, GripVertical, Calendar, Clock, Plane, Train, Car, Users } from 'lucide-react';
import ImagePlanner from './ImagePlanner';
import { analyzeTravelDate } from '../utils/dateOptimizer';

interface CitySelectorProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  departureCity: string;
  setDepartureCity: (city: string) => void;
  selectedDestinations: CitySelection[];
  setSelectedDestinations: React.Dispatch<React.SetStateAction<CitySelection[]>>;
  isAiEnhanced: boolean;
  setIsAiEnhanced: (enhanced: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  customLlmConfig: CustomLlmConfig;
  customCities: CityIndex[];
  onAddCustomCity: (city: CityIndex) => void;
  departureDate: string;
  setDepartureDate: (date: string) => void;
  departureTime: string;
  setDepartureTime: (time: string) => void;
  returnDate: string;
  setReturnDate: (date: string) => void;
  returnTime: string;
  setReturnTime: (time: string) => void;
  travelMode: string;
  setTravelMode: (mode: string) => void;
  travelerCount: number;
  setTravelerCount: (count: number) => void;
}

export default function CitySelector({
  t,
  lang,
  departureCity,
  setDepartureCity,
  selectedDestinations,
  setSelectedDestinations,
  isAiEnhanced,
  setIsAiEnhanced,
  onGenerate,
  isLoading,
  customLlmConfig,
  customCities,
  onAddCustomCity,
  departureDate,
  setDepartureDate,
  departureTime,
  setDepartureTime,
  returnDate,
  setReturnDate,
  returnTime,
  setReturnTime,
  travelMode,
  setTravelMode,
  travelerCount,
  setTravelerCount
}: CitySelectorProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
      
      // Make drag preview nicer in modern engines
      try {
        const dragGhost = (e.currentTarget as HTMLElement).cloneNode(true) as HTMLElement;
        dragGhost.style.opacity = '0.7';
        dragGhost.style.position = 'absolute';
        dragGhost.style.top = '-9999px';
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 20, 20);
        setTimeout(() => document.body.removeChild(dragGhost), 0);
      } catch (err) {
        // fallback to standard browser drag ghost
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const updated = [...selectedDestinations];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(index, 0, removed);
    setDraggedIdx(index);
    setSelectedDestinations(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityIndex[]>([]);
  const [regionFilter, setRegionFilter] = useState<'all' | 'cn' | 'intl'>('all');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger brief alert banner
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [isGeneratingCity, setIsGeneratingCity] = useState(false);

  // Perform city matching
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      return;
    }

    // Local filters (static + custom generated)
    const allAvailable = [...ALL_CITIES_INDEX, ...customCities];
    const matched = allAvailable.filter((c) => {
      const isRegionOk =
        regionFilter === 'all' ||
        (regionFilter === 'cn' && !c.isInternational) ||
        (regionFilter === 'intl' && c.isInternational);

      if (!isRegionOk) return false;

      return (
        c.name.includes(query) ||
        c.nameEn.toLowerCase().includes(query) ||
        c.pinyin.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query) ||
        c.regionEn.toLowerCase().includes(query)
      );
    });

    setSearchResults(matched);

    // If query is longer than 1 character and no local match, request our AI server index search
    if (matched.length === 0 && query.length >= 2) {
      const delaySearch = setTimeout(async () => {
        setIsSearchingOnline(true);
        try {
          const res = await fetch(`/api/cities/search?query=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (err) {
          console.error('Online search lookup failed', err);
        } finally {
          setIsSearchingOnline(false);
        }
      }, 500);

      return () => clearTimeout(delaySearch);
    }
  }, [searchQuery, regionFilter, customCities]);

  // Handle departure click assignment
  const handleSelectDeparture = (id: string) => {
    // Validate mutual exclusiveness
    if (selectedDestinations.some((d) => d.cityId === id)) {
      triggerToast(t.errorForbiddenOrig);
      return;
    }
    setDepartureCity(id);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle destination append
  const handleAddDestination = (id: string) => {
    if (!departureCity) {
      triggerToast(t.errorOrigRequired);
      return;
    }
    if (id === departureCity) {
      triggerToast(t.errorForbiddenOrig);
      return;
    }
    if (selectedDestinations.some((d) => d.cityId === id)) {
      return; // already added, skip
    }
    if (selectedDestinations.length >= 10) {
      triggerToast(t.errorMaxDest);
      return;
    }

    setSelectedDestinations((prev) => [...prev, { cityId: id, days: 2 }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveDestination = (id: string) => {
    setSelectedDestinations((prev) => prev.filter((d) => d.cityId !== id));
  };

  const handleUpdateDays = (id: string, daysValue: number) => {
    setSelectedDestinations((prev) =>
      prev.map((d) => (d.cityId === id ? { ...d, days: Math.max(1, Math.min(15, daysValue)) } : d))
    );
  };

  const getCityLabel = (id: string) => {
    const city = [...ALL_CITIES_INDEX, ...customCities].find((c) => c.id === id);
    if (!city) {
      // capitalised id helper
      return id.charAt(0).toUpperCase() + id.slice(1);
    }
    return lang === 'zh' ? city.name : city.nameEn;
  };

  const handleGenerateAndWriteCity = async (queryText: string, type: 'departure' | 'destination') => {
    setIsGeneratingCity(true);
    try {
      const response = await fetch('/api/cities/generate-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          customLlm: customLlmConfig
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server rejected city generation');
      }

      const data = await response.json();
      if (data.success && data.cityIndex) {
        const newCity = data.cityIndex;
        onAddCustomCity(newCity);
        
        if (type === 'departure') {
          setDepartureCity(newCity.id);
          triggerToast(lang === 'zh' ? `已深度解析并写入出发城市：${newCity.name} 🚀` : `Departure city initialized & written: ${newCity.nameEn} 🚀`);
        } else {
          handleAddDestination(newCity.id);
          triggerToast(lang === 'zh' ? `已深度解析并写入目的地：${newCity.name} 🚀` : `Destination city initialized & written: ${newCity.nameEn} 🚀`);
        }

        setSearchQuery('');
        setSearchResults([]);
      } else {
        throw new Error('Received payload layout format error');
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(lang === 'zh' ? `大模型写入失败: ${err.message}` : `LLM dynamic write failed: ${err.message}`);
    } finally {
      setIsGeneratingCity(false);
    }
  };

  const currentDepartureName = departureCity ? getCityLabel(departureCity) : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 relative overflow-hidden">
      {/* Background Decorative Gradient Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/70 rounded-full blur-2xl -z-10 translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-50/40 rounded-full blur-3xl -z-10 -translate-x-16 translate-y-16"></div>

      {/* Floating alert */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white font-sans text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md z-50 animate-bounce flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-blue-305" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Step Indicators Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg text-slate-930 tracking-tight">{t.wizardTitle}</h2>
            <p className="font-sans text-[10px] text-slate-400 uppercase font-bold tracking-wider">Step {step} of 2</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep(1)}
            disabled={isLoading}
            className={`w-4 h-4 rounded-full transition-all border ${
              step === 1 ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100' : 'bg-slate-200 border-transparent'
            }`}
            title="Step 1"
          ></button>
          <button
            onClick={() => {
              if (departureCity) setStep(2);
              else triggerToast(t.errorOrigRequired);
            }}
            disabled={isLoading || !departureCity}
            className={`w-4 h-4 rounded-full transition-all border ${
              step === 2 ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100' : 'bg-slate-200 border-transparent disabled:opacity-55'
            }`}
            title="Step 2"
          ></button>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: DEPARTURE CITY WIZARD */
        <div className="space-y-6">
          <div>
            <label className="block font-sans font-medium text-slate-700 mb-2">{t.originLabel}</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.originPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              {isSearchingOnline && (
                <div className="absolute right-3.5 top-3.5 flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0 animate-pulse">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
            </div>

            {/* Region Filtering for Searches */}
            {searchQuery && (
              <div className="flex gap-2 mt-3 text-xs">
                <button
                  type="button"
                  onClick={() => setRegionFilter('all')}
                  className={`px-3 py-1 rounded-full transition-all border font-semibold cursor-pointer ${
                    regionFilter === 'all' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'zh' ? '全部' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setRegionFilter('cn')}
                  className={`px-3 py-1 rounded-full transition-all border font-semibold cursor-pointer ${
                    regionFilter === 'cn' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'zh' ? '国内城市' : 'China'}
                </button>
                <button
                  type="button"
                  onClick={() => setRegionFilter('intl')}
                  className={`px-3 py-1 rounded-full transition-all border font-semibold cursor-pointer ${
                    regionFilter === 'intl' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'zh' ? '国际城市' : 'International'}
                </button>
              </div>
            )}
          </div>

          {/* Autocomplete Results Box */}
          {searchResults.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 max-h-56 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
              {searchResults.map((city) => (
                <div
                  key={city.id}
                  onClick={() => handleSelectDeparture(city.id)}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50/70 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-semibold">{lang === 'zh' ? city.name : city.nameEn}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                      {lang === 'zh' ? city.region : city.regionEn}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && !isSearchingOnline && (
            <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm animate-fade-in mt-1">
              <div className="flex items-center gap-2.5 text-slate-700 text-left">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                <span className="text-xs">
                  {lang === 'zh'
                    ? `没在列表中看到所需城市？让 AI 实时解析并写入新城市 "${searchQuery}"`
                    : `Don't see it? Ask AI to dynamically parse & write "${searchQuery}"`}
                </span>
              </div>
              <button
                type="button"
                disabled={isGeneratingCity}
                onClick={() => handleGenerateAndWriteCity(searchQuery, 'departure')}
                className="shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-sans text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {isGeneratingCity ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>
                  {isGeneratingCity
                    ? (lang === 'zh' ? '正在写入...' : 'Writing...')
                    : (lang === 'zh' ? '解析并写入' : 'Generate & Write')}
                </span>
              </button>
            </div>
          )}

          {/* Popular Departure Selection Row */}
          <div>
            <h4 className="font-sans font-bold text-slate-400 text-xs tracking-wider uppercase mb-3">
              {t.popularOrigins}
            </h4>
            <div className="flex flex-wrap gap-2">
              {CN_CITIES.slice(0, 7).map((city) => {
                const isActive = departureCity === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectDeparture(city.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl transition-all font-bold border cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{lang === 'zh' ? city.name : city.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actual Travel Date & Time Picker */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h4 className="font-sans font-bold text-slate-800 text-xs">
                  {lang === 'zh' ? '📅 出行日程与综合交通规划' : '📅 Travel Schedule & Transit Planner'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  {lang === 'zh'
                    ? '自适应动态优化多站景点的开放特性、当地推荐活动推荐、交通工具预算计算、整体酒店安排以及景区客流指数'
                    : 'Adaptive calculations of crowd volumes, seasonality, travel modes, and overall hotel budgets dynamic optimization.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Departure Section */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                  <span>🛫</span>
                  <span>{lang === 'zh' ? '启程出发配置' : 'DEPARTURE SCHEDULE'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">
                      {lang === 'zh' ? '首站出发日期' : 'Departure Date'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">
                      {lang === 'zh' ? '出发时刻' : 'Departure Time'}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Section */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-rose-500 tracking-wider flex items-center gap-1">
                  <span>🛬</span>
                  <span>{lang === 'zh' ? '回程返程配置' : 'RETURN SCHEDULE'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">
                      {lang === 'zh' ? '末站回程日期' : 'Return Date'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">
                      {lang === 'zh' ? '回程时刻' : 'Return Time'}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation warnings */}
            {returnDate && departureDate && returnDate < departureDate && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[10px] font-bold text-left flex items-start gap-1.5 shadow-3xs animate-pulse">
                <span>⚠️</span>
                <span>{lang === 'zh' ? '温馨提示：回程日期不得早于您的出发日期，请再次检查行程规划' : 'Kindly check: Your return date should be on or after the starting departure date!'}</span>
              </div>
            )}

            {/* Travel Mode/Transit Method Preference */}
            <div className="space-y-2 text-left pt-1">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {lang === 'zh' ? '首选出行交通方式偏好' : 'Travel Mode / Transit Preference'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', labelZh: '🌍 智能推荐 / 不限', labelEn: '🌍 Smart Route', icon: Sparkles },
                  { id: 'flight', labelZh: '✈️ 航班首选', labelEn: '✈️ Aircraft Prefer', icon: Plane },
                  { id: 'train', labelZh: '🚄 高铁优先', labelEn: '🚄 Railway Prefer', icon: Train },
                  { id: 'car', labelZh: '🚗 自驾/包车', labelEn: '🚗 Car Charter', icon: Car },
                ].map((mode) => {
                  const ModeIcon = mode.icon;
                  const isSelected = travelMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTravelMode(mode.id)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ModeIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? mode.labelZh.split(' ')[1] : mode.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Traveler Count Selection */}
            <div className="space-y-2 text-left pt-2 pb-1">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>{lang === 'zh' ? '同行旅客人数选择 (智能核算共享住宿与车辆)' : 'Number of Travelers Preference'}</span>
              </label>
              <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-3 max-w-sm shadow-3xs">
                <button
                  type="button"
                  onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
                  disabled={travelerCount <= 1}
                  className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-slate-200 select-none text-lg"
                >
                  -
                </button>
                <div className="flex-1 text-center font-sans font-extrabold text-slate-800 text-sm">
                  {travelerCount} {lang === 'zh' ? '人同行' : travelerCount === 1 ? 'Traveler' : 'Travelers'}
                </div>
                <button
                  type="button"
                  onClick={() => setTravelerCount(travelerCount + 1)}
                  className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition-all border border-slate-200 select-none text-lg"
                >
                  +
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                {lang === 'zh' 
                  ? '💡 出行人数调整将自动优化个人大交通（车机票）、门票、餐饮及共享成本（如双人标间酒店、租车合乘等）。'
                  : '💡 Dynamic traveler count scales individual transit tickets and admission charges linearly while shared hotel rooms and cars are optimized.'}
              </p>
            </div>

            {/* Live forecast panel based on selected date */}

            {/* Live forecast panel based on selected date */}
            {departureDate && (() => {
              const analysis = analyzeTravelDate(departureDate, departureCity || 'beijing', lang);
              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-3xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>💡</span>
                      {lang === 'zh' ? '行前专家季节提示' : 'Live Season Forecast'}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      analysis.classification === 'peak' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      analysis.classification === 'off-peak' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {analysis.badge}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-slate-500 leading-relaxed text-left">
                    <div className="flex items-start gap-1.5">
                      <span className="shrink-0 text-indigo-500 font-semibold">🌍</span>
                      <span>
                        <strong className="text-slate-700">{lang === 'zh' ? '气候特性：' : 'Climate: '}</strong>
                        {analysis.seasonName}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="shrink-0 text-amber-500 font-semibold">☀️</span>
                      <span>
                        <strong className="text-slate-700">{lang === 'zh' ? '白昼日照：' : 'Daylight Hours: '}</strong>
                        {analysis.daylightTip}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="shrink-0 text-rose-500 font-semibold">👥</span>
                      <span>
                        <strong className="text-slate-700">{lang === 'zh' ? '客流指数：' : 'Crowd Indices: '}</strong>
                        {analysis.crowdTip}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* New Image Upload AI Planner */}
          <ImagePlanner
            lang={lang}
            customLlmConfig={customLlmConfig}
            onImport={(depId, dests) => {
              setDepartureCity(depId);
              setSelectedDestinations(dests);
              triggerToast(lang === 'zh' ? '🎉 已成功从图像中导入航线与天数日程！' : '🎉 Successfully imported itinerary stops from image!');
              setStep(2);
            }}
          />

          {/* Selected Chip Overview block */}
          {departureCity && (
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-blue-600 uppercase font-bold tracking-wider">
                    {lang === 'zh' ? '出发口岸已选定' : 'Departure Point Locked'}
                  </p>
                  <p className="font-sans text-sm font-bold text-slate-900">{currentDepartureName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (departureCity) setStep(2);
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: DESTINATIONS ROADWAY CHRONICLE */
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-blue-600 hover:text-blue-800 font-sans font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            ← {t.btnPrev}
          </button>

          <div>
            <label className="block font-sans font-bold text-slate-700 text-sm mb-2">{t.destLabel}</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.destPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              {isSearchingOnline && (
                <div className="absolute right-3.5 top-3.5 flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0 animate-pulse">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
            </div>
          </div>

          {/* Autocomplete Results Box for Destinations */}
          {searchResults.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 max-h-56 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
              {searchResults.map((city) => (
                <div
                  key={city.id}
                  onClick={() => handleAddDestination(city.id)}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50/70 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-semibold">{lang === 'zh' ? city.name : city.nameEn}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded border border-slate-300">
                      {lang === 'zh' ? city.region : city.regionEn}
                    </span>
                  </div>
                  <button className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && !isSearchingOnline && (
            <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm animate-fade-in mt-1 mb-2">
              <div className="flex items-center gap-2.5 text-slate-700 text-left">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                <span className="text-xs">
                  {lang === 'zh'
                    ? `没在列表中看到所需城市？让 AI 实时解析并写入新城市 "${searchQuery}"`
                    : `Don't see it? Ask AI to dynamically parse & write "${searchQuery}"`}
                </span>
              </div>
              <button
                type="button"
                disabled={isGeneratingCity}
                onClick={() => handleGenerateAndWriteCity(searchQuery, 'destination')}
                className="shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-sans text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {isGeneratingCity ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>
                  {isGeneratingCity
                    ? (lang === 'zh' ? '正在写入...' : 'Writing...')
                    : (lang === 'zh' ? '解析并写入' : 'Generate & Write')}
                </span>
              </button>
            </div>
          )}

          {/* Popular Destinations List Row */}
          <div>
            <h4 className="font-sans font-bold text-slate-400 text-xs tracking-wider uppercase mb-3 text-left">
              {t.popularDests}
            </h4>
            <div className="flex flex-wrap gap-2 justify-start">
              {INTL_CITIES.slice(0, 7).map((city) => {
                const isSelected = selectedDestinations.some((d) => d.cityId === city.id);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleAddDestination(city.id)}
                    disabled={isSelected}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl transition-all font-bold border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 cursor-not-allowed opacity-75'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? city.name : city.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Added Destinations Card Container */}
          {selectedDestinations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-sans font-bold text-slate-500 text-xs uppercase tracking-wider">
                  {t.selectedDestsTitle} ({selectedDestinations.length}/10)
                </h4>
                {selectedDestinations.length > 1 && (
                  <span className="text-[10px] text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                    <span>↕️</span>
                    <span>{lang === 'zh' ? '鼠标长按并拖拽卡片可调整先后顺序' : 'Drag cards to adjust visit order'}</span>
                  </span>
                )}
              </div>
              <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-none pr-1">
                {selectedDestinations.map((dest, index) => {
                  const isBeingDragged = draggedIdx === index;
                  return (
                    <div
                      key={dest.cityId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl border transition-all select-none ${
                        isBeingDragged
                          ? 'opacity-35 border-dashed border-blue-400 bg-blue-50/20 scale-[0.97] shadow-inner'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-200 hover:bg-blue-50/10 cursor-grab active:cursor-grabbing hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-blue-500 p-0.5">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center font-sans font-extrabold text-xs text-blue-600 border border-blue-100 bg-white shadow-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-sans text-sm font-bold text-slate-800 tracking-tight">
                            {getCityLabel(dest.cityId)}
                          </span>
                        </div>
                      </div>

                      {/* Adjust stay days */}
                      <div className="flex items-center gap-4" onDragOver={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold font-sans">{t.daysLabel}:</span>
                          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white shadow-sm shadow-slate-100">
                            <button
                              type="button"
                              onClick={() => handleUpdateDays(dest.cityId, dest.days - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 font-sans font-bold text-sm"
                            >
                              -
                            </button>
                            <span className="w-7 text-center font-mono text-xs font-bold text-slate-800">
                              {dest.days}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateDays(dest.cityId, dest.days + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 font-sans font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Slider alternative control */}
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={dest.days}
                          onChange={(e) => handleUpdateDays(dest.cityId, parseInt(e.target.value))}
                          className="w-24 accent-blue-600 cursor-ew-resize h-1 bg-slate-200 rounded-lg"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveDestination(dest.cityId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Intelligent Upgrade Switcher Toggle */}
          <div className="border border-blue-100 bg-gradient-to-r from-blue-50/50 to-slate-50/30 rounded-2xl p-4.5 flex gap-3.5 items-start">
            <input
              id="ai-toggle"
              type="checkbox"
              checked={isAiEnhanced}
              onChange={(e) => setIsAiEnhanced(e.target.checked)}
              className="w-[18px] h-[18px] accent-blue-600 shrink-0 mt-1 cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="ai-toggle" className="block font-sans font-bold text-slate-850 text-sm cursor-pointer">
                {t.aiEnhanceLabel}
              </label>
              <p className="font-sans text-xs text-slate-500 leading-relaxed mt-0.5">{t.aiEnhanceSub}</p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex gap-3 justify-end items-center pt-2">
            <button
              type="button"
              onClick={() => onGenerate()}
              disabled={isLoading || selectedDestinations.length === 0}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-white font-sans font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md text-center cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              <span>{t.btnGenerate}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
