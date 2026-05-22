/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ALL_CITIES_INDEX, CN_CITIES, INTL_CITIES } from '../data/cities';
import { CityIndex, CitySelection, CustomLlmConfig } from '../types';
import { TranslationDict } from '../data/i18n';
import { Search, MapPin, Plus, Trash2, Sliders, ChevronRight, HelpCircle, Compass, ArrowRight, Loader, Sparkles } from 'lucide-react';

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
  onAddCustomCity
}: CitySelectorProps) {
  const [step, setStep] = useState<1 | 2>(1);
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
              <h4 className="font-sans font-bold text-slate-500 text-xs uppercase tracking-wider">
                {t.selectedDestsTitle} ({selectedDestinations.length}/10)
              </h4>
              <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-none pr-1">
                {selectedDestinations.map((dest, index) => (
                  <div
                    key={dest.cityId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center font-sans font-extrabold text-xs text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-sans text-sm font-bold text-slate-800">
                          {getCityLabel(dest.cityId)}
                        </span>
                      </div>
                    </div>

                    {/* Adjust stay days */}
                    <div className="flex items-center gap-4">
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
                ))}
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
