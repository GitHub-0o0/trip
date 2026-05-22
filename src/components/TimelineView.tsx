/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DayPlan, POI } from '../types';
import { TranslationDict } from '../data/i18n';
import { Clock, DollarSign, Compass, Utensils, Home, Car, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

interface TimelineViewProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  days: DayPlan[];
}

export default function TimelineView({ t, lang, days }: TimelineViewProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [expandedPois, setExpandedPois] = useState<{ [poiId: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedPois((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPoiIcon = (type: POI['type']) => {
    switch (type) {
      case 'attraction':
        return (
          <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
            <Compass className="w-4.5 h-4.5" />
          </div>
        );
      case 'food':
        return (
          <div className="p-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl">
            <Utensils className="w-4.5 h-4.5" />
          </div>
        );
      case 'hotel':
        return (
          <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
            <Home className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl">
            <Car className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  const currentDayPlan = days.find((d) => d.day === activeDay) || days[0];

  // Logic to highlight warnings based on text values
  const renderPoiWarning = (poi: POI) => {
    const textToScan = (poi.tip + ' ' + poi.tipEn).toLowerCase();
    let alertText = '';

    if (textToScan.includes('门票') || textToScan.includes('ticket') || textToScan.includes('预约')) {
      alertText = lang === 'zh'
        ? '💡 高峰期需提前买票或微信实名申报约，不提供现场补票票'
        : '💡 Entry requires advanced ticket verification online, onsite lockers unavailable';
    } else if (textToScan.includes('高原') || textToScan.includes('altitude') || textToScan.includes('高反')) {
      alertText = lang === 'zh'
        ? '⚠️ 地区高海拔，剧烈运动极易诱发急性高原反应，自备足袋富氧'
        : '⚠️ High altitude! Limit strenuous physical activity and keep organic hydration';
    } else if (textToScan.includes('台风') || textToScan.includes('typhoon') || textToScan.includes('暴雨')) {
      alertText = lang === 'zh'
        ? '⚠️ 沿海季风雷电高危险时，极端灾害时或临闭港限飞'
        : '⚠️ Coastal typhoon seasons are active; check ferry alerts prior';
    }

    if (!alertText) return null;

    return (
      <div className="mt-2.5 flex items-start gap-2 bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="font-sans text-[11px] text-amber-800 leading-relaxed font-medium">
          {alertText}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date switching tabs row */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-2.5 scrollbar-none gap-2">
        {days.map((d) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(d.day)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide shrink-0 transition-all cursor-pointer border ${
              activeDay === d.day
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-550 hover:text-slate-800'
            }`}
          >
            {t.tabDay.replace('{n}', d.day.toString())}
          </button>
        ))}
      </div>

      {/* Primary Timeline Tree visualizer */}
      <div className="relative pl-6 border-l border-slate-250 space-y-6 ml-3 py-1">
        {currentDayPlan?.pois?.length > 0 ? (
          currentDayPlan.pois.map((poi, idx) => {
            const isExpanded = !!expandedPois[poi.id];
            return (
              <div key={poi.id} className="relative">
                {/* Visual Circle Node anchor */}
                <div className="absolute -left-[43px] top-2 z-10 bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-white">
                    {idx + 1}
                  </div>
                </div>

                {/* Main Card Block */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-blue-400/50 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {getPoiIcon(poi.type)}
                      <div>
                        {/* Title block */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {poi.time}
                          </span>
                          <h4 className="font-sans font-bold text-slate-900 text-sm md:text-base">
                            {lang === 'zh' ? poi.name : poi.nameEn}
                          </h4>
                        </div>

                        {/* Timing labels row */}
                        <div className="flex flex-wrap items-center gap-3.5 text-slate-400 text-xs mt-2.5 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {t.duration}
                            <span className="font-bold text-slate-700">{poi.duration}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                            {t.cost}
                            <span className="font-bold text-slate-700">
                              {poi.cost === 0
                                ? (lang === 'zh' ? '免费' : 'Free')
                                : `${lang === 'zh' ? '¥' : '$'}${poi.cost}`}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand click button trigger */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(poi.id)}
                      className="text-xs text-blue-600 hover:text-blue-850 font-sans font-bold flex items-center gap-1 w-fit self-end sm:self-start bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? (lang === 'zh' ? '收起' : 'Hide') : t.viewDetails}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Context expand details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100/90 mt-4 pt-4 space-y-3.5">
                      <p className="font-sans text-xs text-slate-600 leading-relaxed font-normal">
                        {lang === 'zh' ? poi.tip : poi.tipEn}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div className="text-xs font-sans">
                          <span className="text-slate-400 font-medium">{t.bestWatchTime}</span>
                          <p className="text-slate-700 font-bold mt-0.5">{poi.bestTime || '-'}</p>
                        </div>
                        <div className="text-xs font-sans">
                          <span className="text-slate-400 font-medium">{t.crowdedHours}</span>
                          <p className="text-slate-700 font-bold mt-0.5 text-rose-500">{poi.crowdTimes || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render Altitude/Ticket/Typhoon Warnings */}
                  {renderPoiWarning(poi)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 font-sans text-slate-400 text-xs">No POIs logged for this day.</div>
        )}
      </div>
    </div>
  );
}
