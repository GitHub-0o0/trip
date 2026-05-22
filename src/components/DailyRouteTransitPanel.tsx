/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  MapPin, 
  Footprints, 
  Clock, 
  Compass, 
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { TripPlan, DetailedCityPlan, TransitInfo, POI } from '../types';

interface DailyRouteTransitPanelProps {
  currentPlan: TripPlan;
  activeCityIndex: number;
  lang: 'zh' | 'en';
  getCityLabel: (id: string) => string;
  onSelectCityIndex?: (index: number) => void;
}

// Haversine formula to compute exact distance between POIs safely
function getPoiDistance(coord1: any, coord2: any): number {
  if (!coord1 || !coord2) return 0;
  if (!Array.isArray(coord1) || !Array.isArray(coord2)) return 0;
  if (coord1.length < 2 || coord2.length < 2) return 0;

  const lat1 = typeof coord1[0] === 'number' ? coord1[0] : parseFloat(coord1[0]);
  const lon1 = typeof coord1[1] === 'number' ? coord1[1] : parseFloat(coord1[1]);
  const lat2 = typeof coord2[0] === 'number' ? coord2[0] : parseFloat(coord2[0]);
  const lon2 = typeof coord2[1] === 'number' ? coord2[1] : parseFloat(coord2[1]);

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // 2 decimal places
}

export default function DailyRouteTransitPanel({
  currentPlan,
  activeCityIndex,
  lang,
  getCityLabel,
  onSelectCityIndex
}: DailyRouteTransitPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    intercity: true,
    day1: true,
    day2: true,
    day3: true,
  });

  if (!currentPlan) return null;

  const activeCityPlan = currentPlan.cityPlans ? currentPlan.cityPlans[activeCityIndex] : null;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getLegIcon = (type: any) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4 text-rose-500" />;
      case 'train': return <Train className="w-4 h-4 text-blue-500" />;
      case 'bus': return <Bus className="w-4 h-4 text-emerald-500" />;
      case 'car': return <Car className="w-4 h-4 text-purple-500" />;
      default: return <Compass className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLegLabel = (type: any) => {
    if (lang === 'zh') {
      switch (type) {
        case 'flight': return '民航客机';
        case 'train': return '高铁/快铁';
        case 'bus': return '长途巴士';
        case 'car': return '自驾/租车';
      }
    } else {
      switch (type) {
        case 'flight': return 'Flight';
        case 'train': return 'HSR / Train';
        case 'bus': return 'Long-distance Bus';
        case 'car': return 'Driving/Car Rental';
      }
    }
    return String(type || '');
  };

  // Helper for inner-city POI transfer recommendation depending on distance
  const getTransferMode = (distance: number) => {
    if (distance === 0) return null;
    if (distance < 1.2) {
      return {
        mode: lang === 'zh' ? '🚶‍♂️ 步行观光' : '🚶‍♂️ Walk',
        icon: <Footprints className="w-3.5 h-3.5 text-slate-500" />,
        duration: Math.max(5, Math.round(distance * 14)) + 'm',
        color: 'text-slate-600 bg-slate-50 border-slate-200/40',
        tip: lang === 'zh' ? '近距离，穿街走巷领略市井人文气息' : 'Walk over to admire details of local neighborhood shops'
      };
    } else if (distance < 5.0) {
      return {
        mode: lang === 'zh' ? '🚇 地铁 / 公众交通' : '🚇 Metro / Bus',
        icon: <Train className="w-3.5 h-3.5 text-blue-500" />,
        duration: Math.round(distance * 4.5 + 8) + 'm',
        color: 'text-blue-700 bg-blue-50 border-blue-100',
        tip: lang === 'zh' ? '绿色低碳，选择轨道交通能完美避堵' : 'Low carbon impact: fast subways escape congestion hotspots'
      };
    } else {
      return {
        mode: lang === 'zh' ? '🚗 的士车 / 网约车' : '🚗 Taxi / Cab',
        icon: <Car className="w-3.5 h-3.5 text-amber-600" />,
        duration: Math.max(10, Math.round(distance * 2.5 + 4)) + 'm',
        color: 'text-amber-700 bg-amber-50 border-amber-100',
        tip: lang === 'zh' ? '跨区较远，建议叫一辆出租车省时舒心' : 'Crosses sectors, book an on-demand ride to maximize speed'
      };
    }
  };

  const hasIntercityTransits = currentPlan.cityPlans && currentPlan.cityPlans.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 animate-pulse" />
          <h4 className="font-sans font-extrabold text-slate-800 text-sm tracking-tight uppercase">
            {lang === 'zh' ? '每日推荐交通及行程线路' : 'DAILY TRANSIT & ROUTING'}
          </h4>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {lang === 'zh' ? '全智能算路' : 'Auto Routing'}
        </span>
      </div>

      {/* SECTION 1: INTERCITY PROGRESSION AND WAYPOINTS INTEGRATION */}
      {hasIntercityTransits && (
        <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('intercity')}
            className="w-full bg-slate-50/70 p-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100/50 transition-all border-b border-slate-100 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>✈️</span>
              <span>{lang === 'zh' ? '路线经停站点与大交通' : 'Routing Stops & Intercity Transit'}</span>
            </span>
            {expandedSections.intercity ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {expandedSections.intercity && (
            <div className="p-4 bg-white space-y-4">
              {currentPlan.cityPlans.map((plan, idx) => {
                if (!plan) return null;
                const toCityId = plan.cityId;
                const toCityLabel = lang === 'zh' ? plan.cityName : plan.cityNameEn;
                const fromCityId = idx === 0 ? currentPlan.departureCity : (currentPlan.cityPlans[idx - 1] ? currentPlan.cityPlans[idx - 1].cityId : '');
                const fromCityLabel = fromCityId ? getCityLabel(fromCityId) : '';

                const transit: TransitInfo = (currentPlan.transits && currentPlan.transits[toCityId]) || {
                  type: 'train',
                  distance: 350,
                  duration: '2h 15m',
                  cost: 150,
                  advice: lang === 'zh' ? '默认干线连接' : 'Standard link',
                  adviceEn: 'Standard link'
                };

                const isCurrentActive = idx === activeCityIndex;

                return (
                  <div key={`ic-${toCityId}`} className="relative pl-5 border-l-2 border-dashed border-slate-200 last:border-0 pb-3 last:pb-1 z-10">
                    <div className={`absolute -left-[6.5px] top-1.5 w-3 h-3 rounded-full transition-colors ${
                      isCurrentActive ? 'bg-indigo-600 ring-4 ring-indigo-100 animate-pulse' : 'bg-slate-300'
                    }`} />
                    
                    {/* Departure info header for the initial node */}
                    {idx === 0 && fromCityLabel && (
                      <div className="text-[10px] text-slate-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                        <span>🛫 {lang === 'zh' ? '出发于' : 'Depart from'}</span>
                        <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-sans">{fromCityLabel}</span>
                      </div>
                    )}

                    {/* Highly polished clickable City Card */}
                    <button
                      type="button"
                      onClick={() => onSelectCityIndex?.(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 relative group cursor-pointer ${
                        isCurrentActive
                          ? 'bg-slate-900 border-slate-950 text-white shadow-md ring-4 ring-slate-100'
                          : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-5.5 h-5.5 rounded-lg text-[11px] font-bold leading-none flex items-center justify-center font-mono ${
                            isCurrentActive ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-extrabold text-xs md:text-sm tracking-tight leading-none block">
                              {toCityLabel}
                            </span>
                            <span className={`text-[9px] uppercase tracking-wide font-semibold mt-1 block ${
                              isCurrentActive ? 'text-slate-300' : 'text-slate-450'
                            }`}>
                              {plan.daysCount} {plan.daysCount === 1 ? (lang === 'zh' ? '天行程' : 'Day') : (lang === 'zh' ? '天行程' : 'Days')}
                            </span>
                          </div>
                        </div>

                        {/* Status Tags */}
                        <div className="flex items-center gap-1">
                          {isCurrentActive && (
                            <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wide">
                              {lang === 'zh' ? '当前查看' : 'Viewing'}
                            </span>
                          )}
                          {plan.isAiEnhanced ? (
                            <span className={`text-[8.5px] font-extrabold font-mono px-1.5 py-0.5 rounded ${
                              isCurrentActive
                                ? 'bg-indigo-500/35 text-indigo-200 border border-indigo-400/20'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              AI
                            </span>
                          ) : (
                            <span className={`text-[8.5px] font-extrabold font-mono px-1.5 py-0.5 rounded ${
                              isCurrentActive
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : 'bg-slate-100 text-slate-500 border-transparent'
                            }`}>
                              Local
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Transit description link card inside */}
                      {transit && (
                        <div className={`mt-2 pt-2 border-t border-dashed flex items-center justify-between flex-wrap gap-2 text-[10px] ${
                          isCurrentActive ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-500'
                        }`}>
                          <div className="flex items-center gap-1.5 font-semibold">
                            {getLegIcon(transit.type)}
                            <span>{getLegLabel(transit.type)} {transit.code && `(${transit.code})`}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[9.5px]">
                            <span>⏱️ {transit.duration}</span>
                            <span>🛣️ {transit.distance}km</span>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: INSIDE THE CURRENT ACTIVE CITY - DAILY PLAN ROUTING DETAILS */}
      {activeCityPlan && activeCityPlan.days && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-500">
              {lang === 'zh'
                ? `目的城市[${activeCityPlan.cityName}]游玩日接驳路线`
                : `Active Destination [${activeCityPlan.cityNameEn}] Daily transits`}
            </span>
          </div>

          {activeCityPlan.days.map((dayPlan) => {
            const sectionId = `day${dayPlan.day}`;
            const isExpanded = expandedSections[sectionId] !== false;

            return (
              <div key={`day-sc-${dayPlan.day}`} className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection(sectionId)}
                  className="w-full bg-slate-50/70 p-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100/40 transition-all border-b border-slate-100 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center font-mono font-black text-[10px] scale-95 shadow-sm">
                      D{dayPlan.day}
                    </span>
                    <span>{lang === 'zh' ? `第 ${dayPlan.day} 天 景点衔接路线` : `Day ${dayPlan.day} Sightseeing Route`}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white space-y-3 font-sans">
                    {dayPlan.pois.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        {lang === 'zh' ? '当天暂无安排景点线路' : 'No sightseeing arranged for today'}
                      </p>
                    ) : (
                      <div className="space-y-3.5 relative">
                        {dayPlan.pois.map((poi, pIdx) => {
                          const isLast = pIdx === dayPlan.pois.length - 1;
                          const nextPoi = isLast ? null : dayPlan.pois[pIdx + 1];

                          // Calculate distance to the next POI
                          const distToNext = nextPoi 
                            ? getPoiDistance(poi.coordinates, nextPoi.coordinates)
                            : 0;

                          const transMode = nextPoi ? getTransferMode(distToNext) : null;

                          return (
                            <div key={`day-${dayPlan.day}-poi-${poi.id}`} className="space-y-3">
                              {/* POI Node */}
                              <div className="flex items-start gap-2.5 relative">
                                {/* Chronology bullet timeline line */}
                                {!isLast && (
                                  <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-100 z-0" style={{ marginBottom: '-1rem' }} />
                                )}

                                <div className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[10px] font-bold text-slate-600 z-10 mt-0.5">
                                  {poi.time}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">
                                      {lang === 'zh' ? poi.name : poi.nameEn}
                                    </h5>
                                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                                      🕒 {poi.duration}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                                    💡 {lang === 'zh' ? poi.tip : poi.tipEn}
                                  </p>
                                </div>
                              </div>

                              {/* Transit Transition link node between POIs */}
                              {nextPoi && transMode && (
                                <div className="ml-6 pl-2.5 py-1.5 border-l-2 border-dashed border-indigo-100 flex flex-col gap-1 items-start bg-slate-50/60 rounded-xl p-2.5 text-left border border-slate-100/60">
                                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-700">
                                    {transMode.icon}
                                    <span>{transMode.mode}</span>
                                    <span className="text-[10px] text-indigo-650 font-mono font-extrabold bg-indigo-50/70 border border-indigo-100/60 px-1.5 py-0.1 rounded-md">
                                      ~{distToNext} km
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      ({transMode.duration})
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 italic">
                                    {transMode.tip}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
