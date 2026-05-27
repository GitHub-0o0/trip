/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DayPlan, POI } from '../types';
import { TranslationDict } from '../data/i18n';
import { Clock, DollarSign, Compass, Utensils, Home, Car, ChevronDown, ChevronUp, AlertCircle, Sparkles, Plus, Trash2, MapPin } from 'lucide-react';
import { formatCostDual } from '../utils/exchange';

interface TimelineViewProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  days: DayPlan[];
  onUpdatePois?: (day: number, updatedPois: POI[]) => void;
  cityId?: string;
  departureDate?: string;
  departureTime?: string;
  returnDate?: string;
  returnTime?: string;
  isFirstCityPlan?: boolean;
  isLastCityPlan?: boolean;
}

export default function TimelineView({
  t,
  lang,
  days,
  onUpdatePois,
  cityId = 'beijing',
  departureDate,
  departureTime = '09:00',
  returnDate,
  returnTime = '18:00',
  isFirstCityPlan = false,
  isLastCityPlan = false,
}: TimelineViewProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [expandedPois, setExpandedPois] = useState<{ [poiId: string]: boolean }>({});

  const getDayDateLabel = (dayNum: number) => {
    if (!departureDate) return '';
    const startBase = new Date(departureDate);
    if (isNaN(startBase.getTime())) return '';
    
    // Add (dayNum - 1) days to the departure date
    const d = new Date(startBase);
    d.setDate(startBase.getDate() + (dayNum - 1));
    
    const m = d.getMonth() + 1;
    const dateNum = d.getDate();
    const dayOfWeek = d.getDay();
    const weekdayName = lang === 'zh'
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayOfWeek]
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
      
    return lang === 'zh'
      ? `${m}月${dateNum}日`
      : `${m}/${dateNum}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedPois((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [isAddingSpot, setIsAddingSpot] = useState(false);
  
  // Custom Spot Form States
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotNameEn, setNewSpotNameEn] = useState('');
  const [newSpotType, setNewSpotType] = useState<POI['type']>('attraction');
  const [newSpotTime, setNewSpotTime] = useState('10:00');
  const [newSpotDuration, setNewSpotDuration] = useState('2h');
  const [newSpotCost, setNewSpotCost] = useState('0');
  const [newSpotTip, setNewSpotTip] = useState('');
  const [newSpotTipEn, setNewSpotTipEn] = useState('');
  const [newSpotLat, setNewSpotLat] = useState('');
  const [newSpotLng, setNewSpotLng] = useState('');

  const currentDayPlan = days.find((d) => d.day === activeDay) || days[0];

  const handleDeletePoi = (id: string) => {
    if (!onUpdatePois || !currentDayPlan) return;
    const confirmed = window.confirm(lang === 'zh' ? '确定要删除此打卡地点吗？' : 'Are you sure you want to delete this check-in spot?');
    if (!confirmed) return;
    const updated = currentDayPlan.pois.filter(p => p.id !== id);
    onUpdatePois(activeDay, updated);
  };

  const openAddSpotModal = () => {
    // Determine sensible default coordinates based on existing POIs
    let defaultLat = 39.9042;
    let defaultLng = 116.4074;
    
    for (const d of days) {
      if (d.pois && d.pois.length > 0) {
        defaultLat = d.pois[0].coordinates[0];
        defaultLng = d.pois[0].coordinates[1];
        break;
      }
    }
    
    // Default time based on last POI of active day
    let defaultTime = '10:00';
    if (currentDayPlan && currentDayPlan.pois && currentDayPlan.pois.length > 0) {
      const lastPoi = currentDayPlan.pois[currentDayPlan.pois.length - 1];
      const match = lastPoi.time.match(/^(\d{2}):(\d{2})$/);
      if (match) {
        let hour = parseInt(match[1]) + 2;
        if (hour >= 24) hour = 23;
        const hrStr = hour.toString().padStart(2, '0');
        defaultTime = `${hrStr}:00`;
      }
    }
    
    setNewSpotName('');
    setNewSpotNameEn('');
    setNewSpotType('attraction');
    setNewSpotTime(defaultTime);
    setNewSpotDuration('2h');
    setNewSpotCost('0');
    setNewSpotTip('');
    setNewSpotTipEn('');
    
    // Add small random offset to lat/lng so that newly added spots are slightly offset from each other
    const randomOffsetLat = (Math.random() - 0.5) * 0.005;
    const randomOffsetLng = (Math.random() - 0.5) * 0.005;
    setNewSpotLat((defaultLat + randomOffsetLat).toFixed(4));
    setNewSpotLng((defaultLng + randomOffsetLng).toFixed(4));
    setIsAddingSpot(true);
  };

  const handleSaveCustomSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePois || !currentDayPlan) return;
    
    if (!newSpotName.trim()) {
      alert(lang === 'zh' ? '请输入打卡地点名称' : 'Please enter the spot name');
      return;
    }
    
    const latNum = parseFloat(newSpotLat);
    const lngNum = parseFloat(newSpotLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert(lang === 'zh' ? '请输入有效的经纬度数值' : 'Please enter valid latitude and longitude coordinates');
      return;
    }
    
    const nextPoi: POI = {
      id: `custom-poi-${Date.now()}`,
      name: newSpotName.trim(),
      nameEn: newSpotNameEn.trim() || newSpotName.trim(),
      type: newSpotType,
      time: newSpotTime || '12:00',
      duration: newSpotDuration || '1h',
      cost: parseFloat(newSpotCost) || 0,
      bestTime: newSpotTime || '12:00',
      crowdTimes: '14:00-16:00',
      tip: newSpotTip.trim() || (lang === 'zh' ? '自定义添加的出行打卡地点' : 'Custom added point of interest.'),
      tipEn: newSpotTipEn.trim() || newSpotTip.trim() || 'Custom added point of interest.',
      coordinates: [latNum, lngNum]
    };
    
    // Append and sort chronologically by time
    const updated = [...(currentDayPlan.pois || []), nextPoi].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
    
    onUpdatePois(activeDay, updated);
    setIsAddingSpot(false);
  };

  // Earth distance formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleOptimizeSequence = () => {
    if (!currentDayPlan || !currentDayPlan.pois || currentDayPlan.pois.length <= 1 || !onUpdatePois) return;

    const originalPois = [...currentDayPlan.pois];
    const n = originalPois.length;

    let bestSeq = originalPois;
    let minDistance = Infinity;

    // Helper to calculate total distance of a route sequence
    const getRouteDistance = (route: POI[]) => {
      let d = 0;
      for (let i = 0; i < route.length - 1; i++) {
        const p1 = route[i].coordinates;
        const p2 = route[i + 1].coordinates;
        d += getDistance(p1[0], p1[1], p2[0], p2[1]);
      }
      return d;
    };

    // Calculate optimal itinerary
    if (n <= 8) {
      // Brute-force permutation of elements 1 to n-1, keeping the first element as starting anchor (usually hotel/start spot)
      const rest = originalPois.slice(1);
      const permute = (arr: POI[]): POI[][] => {
        if (arr.length === 0) return [[]];
        const result: POI[][] = [];
        for (let i = 0; i < arr.length; i++) {
          const current = arr[i];
          const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
          const subPerms = permute(remaining);
          for (const sp of subPerms) {
            result.push([current, ...sp]);
          }
        }
        return result;
      };

      const permutations = permute(rest);
      for (const p of permutations) {
        const fullCandidate = [originalPois[0], ...p];
        const dist = getRouteDistance(fullCandidate);
        if (dist < minDistance) {
          minDistance = dist;
          bestSeq = fullCandidate;
        }
      }
    } else {
      // Nearest neighbor greedy solver for very large N (>8)
      const unvisited = [...originalPois.slice(1)];
      const path = [originalPois[0]];
      let current = originalPois[0];

      while (unvisited.length > 0) {
        let nearestIdx = 0;
        let nearDist = Infinity;
        for (let i = 0; i < unvisited.length; i++) {
          const d = getDistance(
            current.coordinates[0],
            current.coordinates[1],
            unvisited[i].coordinates[0],
            unvisited[i].coordinates[1]
          );
          if (d < nearDist) {
            nearDist = d;
            nearestIdx = i;
          }
        }
        current = unvisited[nearestIdx];
        path.push(current);
        unvisited.splice(nearestIdx, 1);
      }
      bestSeq = path;
    }

    // Keep the timeline chronologically structured by keeping morning-to-night timestamps sorted,
    // but applying them respectively to the new spatial-optimized POI layout.
    const originalTimes = originalPois.map(p => p.time).sort();
    const finalPois = bestSeq.map((poi, idx) => ({
      ...poi,
      time: originalTimes[idx]
    }));

    onUpdatePois(activeDay, finalPois);
    
    const successMsg = lang === 'zh'
      ? `⚡ 路线优化成功！已将本市第 ${activeDay} 天的 ${n} 个打卡景点按空间邻近度重选排序，避免 backtrack 回头路，助您在旅途节约日常通勤时间！`
      : `⚡ Route optimized! Reordered Day ${activeDay}'s ${n} points of interest by spatial proximity to eliminate tedious backtracking!`;
    alert(successMsg);
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
      {/* Date switching tabs row & TSP Route optimizer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex overflow-x-auto scrollbar-none gap-2">
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide shrink-0 transition-all cursor-pointer border ${
                activeDay === d.day
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <span>{t.tabDay.replace('{n}', d.day.toString())}</span>
                {departureDate && (
                  <span className={`text-[9px] mt-0.5 opacity-80 font-mono font-bold ${
                    activeDay === d.day ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {getDayDateLabel(d.day)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {onUpdatePois && (
            <button
              type="button"
              onClick={openAddSpotModal}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold rounded-xl shadow-sm border border-indigo-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '添加自定义打卡点' : 'Add Custom Spot'}</span>
            </button>
          )}

          {currentDayPlan?.pois?.length > 1 && onUpdatePois && (
            <button
              type="button"
              onClick={handleOptimizeSequence}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{lang === 'zh' ? '顺路排序 (TSP)' : 'Optimize Sequence (TSP)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Departure & Return Time Alignment HUD Banners */}
      {activeDay === 1 && isFirstCityPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 shadow-3xs">
          <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h5 className="text-xs font-bold font-sans text-blue-900 leading-snug">
              {lang === 'zh' 
                ? `📅 首日行程安全对接中 (大交通：${departureTime})` 
                : `📅 Day 1 Schedule Aligned (Transit: ${departureTime})`}
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-1">
              {lang === 'zh'
                ? `💡 系统已完美匹配大交通。下午/抵达后活动在您于 ${departureTime} 前后抵达目的地后流畅接轨，上午时光留白供您从容值机/长途移动。`
                : `💡 The itinerary has resolved departure schedules automatically. Morning hours are reserved for airport boarding and travel, while local POIs start fully after arrival around ${departureTime}.`}
            </p>
          </div>
        </div>
      )}

      {activeDay === days.length && isLastCityPlan && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 shadow-3xs">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <Compass className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <h5 className="text-xs font-bold font-sans text-emerald-900 leading-snug">
              {lang === 'zh' 
                ? `📅 末日回程完美闭环 (大交通：${returnTime})` 
                : `📅 Final Day Schedule Aligned (Transit: ${returnTime})`}
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-1">
              {lang === 'zh'
                ? `💡 返程大交通已智能锁定。今日最后打卡活动在中午前后准时收尾，充分为您预留了前往航站楼/火车站值机、防误机的黄金3小时。`
                : `💡 Return closure resolved successfully. Local check-ins conclude before noon, saving a standard 3-hour window to catch your ${returnTime} connection safely.`}
            </p>
          </div>
        </div>
      )}

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
                                : formatCostDual(poi.cost, cityId, lang)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions button row */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      {onUpdatePois && (
                        <button
                          type="button"
                          onClick={() => handleDeletePoi(poi.id)}
                          className="text-xs text-rose-650 hover:text-rose-800 font-sans font-bold flex items-center gap-1 w-fit bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          title={lang === 'zh' ? '删除此打卡地点' : 'Delete spot'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === 'zh' ? '删除' : 'Delete'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(poi.id)}
                        className="text-xs text-blue-600 hover:text-blue-850 font-sans font-bold flex items-center gap-1 w-fit bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        <span>{isExpanded ? (lang === 'zh' ? '收起' : 'Hide') : t.viewDetails}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
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

      {/* Custom Spot Addition Modal */}
      {isAddingSpot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-bold text-base">
                  {lang === 'zh' ? '添加自定义打卡点' : 'Add Custom Spot'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingSpot(false)}
                className="text-slate-400 hover:text-white transition-colors text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomSpot} className="p-6 md:p-8 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              {/* Day info status tag */}
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800">
                  {lang === 'zh' ? `📅 正在为第 ${activeDay} 天规划日程` : `📅 Planning Day ${activeDay}`}
                </span>
                <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-2.5 py-1 rounded-lg font-extrabold font-mono text-right">
                  POI CUSTOMIZER
                </span>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-600">
                    {lang === 'zh' ? '中文名称 *' : 'Name (Chinese) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'zh' ? '例如：外滩观景台' : 'e.g. The Bund'}
                    value={newSpotName}
                    onChange={(e) => setNewSpotName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-600">
                    {lang === 'zh' ? '英文名称 (或拼音)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'zh' ? '例如：The Bund Viewpoint' : 'e.g. The Bund Viewpoint'}
                    value={newSpotNameEn}
                    onChange={(e) => setNewSpotNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Type select and time selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-600">
                    {lang === 'zh' ? '地点分类' : 'Spot Type'}
                  </label>
                  <select
                    value={newSpotType}
                    onChange={(e) => setNewSpotType(e.target.value as POI['type'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                  >
                    <option value="attraction">{lang === 'zh' ? '景点 (Attraction)' : 'Attraction'}</option>
                    <option value="food">{lang === 'zh' ? '美食 (Dining)' : 'Dining'}</option>
                    <option value="hotel">{lang === 'zh' ? '酒店 (Hotel)' : 'Hotel'}</option>
                    <option value="transit">{lang === 'zh' ? '交通枢纽 (Transit)' : 'Transit'}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-600">
                    {lang === 'zh' ? '参观时刻 *' : 'Visit Time *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30, 14:00"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    title={lang === 'zh' ? '请输入24小时格式，例如 15:45' : 'Please input 24-hour format, e.g. 15:45'}
                    value={newSpotTime}
                    onChange={(e) => setNewSpotTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Duration and Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-600">
                    {lang === 'zh' ? '建议游玩用时长' : 'Duration'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2h, 1.5h, 45m"
                    value={newSpotDuration}
                    onChange={(e) => setNewSpotDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-600">
                    {lang === 'zh' ? '花费预估 (等额人民币)' : 'Expected Cost (RMB / ¥)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                      ¥
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 0 for free"
                      value={newSpotCost}
                      onChange={(e) => setNewSpotCost(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Geographic coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <div className="col-span-1 md:col-span-2 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  {lang === 'zh' ? '地图高精落点经纬度坐标' : 'Precise Map Coordinates'}
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500">
                    {lang === 'zh' ? '纬度 Latitude *' : 'Latitude *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 31.2304"
                    value={newSpotLat}
                    onChange={(e) => setNewSpotLat(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500">
                    {lang === 'zh' ? '经度 Longitude *' : 'Longitude *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 121.4737"
                    value={newSpotLng}
                    onChange={(e) => setNewSpotLng(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description inputs */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-600">
                  {lang === 'zh' ? '行程特色 tips 与建议' : 'Description / Advice'}
                </label>
                <textarea
                  placeholder={lang === 'zh' ? '例如：推荐在日落前半小时到达观景台，可以拍摄到绝美的极佳城市全景风光...' : 'e.g. Highly recommended at sunset...'}
                  value={newSpotTip}
                  onChange={(e) => setNewSpotTip(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* English tips */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-600">
                  {lang === 'zh' ? 'Tips & Suggestions (English)' : 'Tips & Suggestions (English)'}
                </label>
                <textarea
                  placeholder="e.g. Highly recommended to arrive half hour before sunset for perfect golden hour captures..."
                  value={newSpotTipEn}
                  onChange={(e) => setNewSpotTipEn(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Actions submit row */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingSpot(false)}
                  className="px-4.5 py-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
                >
                  {lang === 'zh' ? '保存打卡点' : 'Save Spot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
