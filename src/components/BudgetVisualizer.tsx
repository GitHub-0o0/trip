/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TranslationDict } from '../data/i18n';
import { Ticket, Utensils, Hotel, Car, RefreshCw } from 'lucide-react';
import { formatCostDual, getCityCurrency, getStoredExchangeRates } from '../utils/exchange';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BudgetVisualizerProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  expense: {
    tickets: number;
    food: number;
    hotel: number;
    transit: number;
  };
  cityId?: string;
  travelerCount?: number;
}

export default function BudgetVisualizer({ t, lang, expense, cityId = 'beijing', travelerCount = 1 }: BudgetVisualizerProps) {
  const { tickets, food, hotel, transit } = expense;
  const grandLocalTotal = tickets + food + hotel + transit;
  const rates = getStoredExchangeRates();

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const items = [
    {
      id: 'tickets',
      label: t.costTickets,
      val: tickets,
      icon: <Ticket className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-500',
      textClass: 'text-emerald-600',
    },
    {
      id: 'food',
      label: t.costFood,
      val: food,
      icon: <Utensils className="w-4 h-4 text-orange-600" />,
      bg: 'bg-orange-500',
      textClass: 'text-orange-600',
    },
    {
      id: 'hotel',
      label: t.costHotel,
      val: hotel,
      icon: <Hotel className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-500',
      textClass: 'text-indigo-600',
    },
    {
      id: 'transit',
      label: t.costTransit,
      val: transit,
      icon: <Car className="w-4 h-4 text-sky-600" />,
      bg: 'bg-sky-500',
      textClass: 'text-sky-600',
    },
  ];

  // Prepare chart data filtering positive nodes
  const chartData = [
    { id: 'tickets', name: t.costTickets, value: tickets, color: '#10b981' },
    { id: 'food', name: t.costFood, value: food, color: '#f97316' },
    { id: 'hotel', name: t.costHotel, value: hotel, color: '#6366f1' },
    { id: 'transit', name: t.costTransit, value: transit, color: '#0ea5e9' },
  ].filter((item) => item.value > 0);

  const hasData = chartData.length > 0;

  // Placeholder data for empty state
  const fallbackData = [
    { id: 'none', name: lang === 'zh' ? '暂无数据' : 'Zero Allocated', value: 1, color: '#e2e8f0' }
  ];

  const getIndexInChart = (id: string) => {
    return chartData.findIndex((c) => c.id === id);
  };

  const currencyInfo = getCityCurrency(cityId);

  // Derive dynamic details for HUD center of donut
  const hoveredItem = activeIndex !== null && hasData ? chartData[activeIndex] : null;
  const centerLabel = hoveredItem ? hoveredItem.name : (lang === 'zh' ? `${travelerCount}人总计` : `${travelerCount} Pax Total`);
  const centerValue = hoveredItem ? hoveredItem.value : grandLocalTotal;
  const centerPercent = hoveredItem && grandLocalTotal > 0
    ? Math.round((hoveredItem.value / grandLocalTotal) * 100)
    : 100;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-2">
        <div className="space-y-0.5">
          <h4 className="font-sans font-bold text-slate-900 text-sm tracking-wide uppercase">{t.budgetBreakdown}</h4>
          <span className="text-[10px] text-slate-400 block font-medium">
            {lang === 'zh'
              ? `参考汇率: 1 USD = ${rates.CNY || 7.24} CNY • 1 USD = ${rates[currencyInfo.code] || 1.0} ${currencyInfo.code}`
              : `Rates: 1 USD = ${rates.CNY || 7.24} CNY • 1 USD = ${rates[currencyInfo.code] || 1.0} ${currencyInfo.code}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin-reverse" />
            <span>{lang === 'zh' ? '实时汇率挂载' : 'Exchange Active'}</span>
          </span>
          <span className="font-mono text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {travelerCount > 1 
              ? (lang === 'zh' ? `${travelerCount}人合算人民币预估` : `${travelerCount} Travelers Total in RMB`)
              : (lang === 'zh' ? '人民币单人基准预估' : 'Est. Single Pax in RMB')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Progress bar visualizer column */}
        <div className="space-y-4 flex flex-col justify-center">
          {items.map((item) => {
            const rawPercent = grandLocalTotal > 0 ? (item.val / grandLocalTotal) * 100 : 0;
            const percent = isNaN(rawPercent) ? 0 : Math.round(rawPercent);

            const dualLabel = formatCostDual(item.val, cityId, lang);
            const chartIdx = getIndexInChart(item.id);
            const isHovered = activeIndex !== null && activeIndex === chartIdx;

            return (
              <div 
                key={item.label} 
                className={`space-y-1.5 font-sans p-2 rounded-2xl transition-all duration-300 ${
                  isHovered ? 'bg-slate-50/80 shadow-xs translate-x-1' : 'opacity-90 hover:opacity-100'
                }`}
                onMouseEnter={() => {
                  if (chartIdx !== -1) setActiveIndex(chartIdx);
                }}
                onMouseLeave={() => {
                  setActiveIndex(null);
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-slate-900">
                      {dualLabel}
                    </span>
                    <span className="text-slate-400 font-bold">({percent}%)</span>
                  </div>
                </div>

                {/* Styled progress level */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                  <div 
                    className={`h-full ${item.bg} rounded-full transition-all duration-500`} 
                    style={{ 
                      width: `${percent}%`,
                      filter: isHovered ? 'brightness(1.05) saturate(1.1)' : 'none'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recharts Donut Pie Visual Column with Interactive Center HUD */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-4 flex flex-col justify-center items-center min-h-[220px] relative">
          <span className="font-sans text-[9px] text-slate-450 font-bold tracking-widest uppercase mb-1">
            {lang === 'zh' ? '成分占比构成' : 'PROPORTIONAL SPLIT'}
          </span>
          <div className="relative w-full h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hasData ? chartData : fallbackData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="83%"
                  paddingAngle={hasData ? 4 : 0}
                  dataKey="value"
                  onMouseEnter={(_, index) => {
                    if (hasData) {
                      setActiveIndex(index);
                    }
                  }}
                  onMouseLeave={() => {
                    setActiveIndex(null);
                  }}
                >
                  {(hasData ? chartData : fallbackData).map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.id}`} 
                      fill={entry.color} 
                      stroke="#ffffff"
                      strokeWidth={2}
                      style={{
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'default',
                        transition: 'all 0.25s ease-out',
                        transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: '50% 50%',
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.65
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Perfectly centered HTML overlay acting as high-fidelity tooltip HUD */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center select-none">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold max-w-[110px] truncate">
                {centerLabel}
              </span>
              <span className="text-base font-extrabold text-slate-800 tracking-tight mt-0.5 leading-tight">
                {centerValue > 0 ? formatCostDual(centerValue, cityId, lang) : (lang === 'zh' ? '暂未设算' : 'None')}
              </span>
              {hoveredItem && grandLocalTotal > 0 && (
                <span className="text-[9px] font-mono font-extrabold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 mt-1 border border-emerald-100">
                  {centerPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Aggregate sum box as a beautiful Bento Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col justify-center items-center">
          <span className="font-sans text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-2">
            {lang === 'zh' ? '当前目的地预估花费主轴' : 'LOCAL ESTIMATED SUB-TOTAL'}
          </span>
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex items-baseline text-blue-600 font-sans">
              <span className="text-xl font-bold">¥</span>
              <span className="text-3xl font-extrabold tracking-tight ml-0.5 text-blue-600">{grandLocalTotal}</span>
            </div>
            {currencyInfo.code !== 'CNY' && (
              <div className="text-xs text-slate-500 font-mono font-bold bg-white shadow-xs px-3 py-1 rounded-xl border border-slate-200/50">
                {lang === 'zh' ? '当地折合约: ' : 'Local Approx: '}
                {currencyInfo.symbol}
                {Math.round(grandLocalTotal / (rates.CNY || 7.24) * (rates[currencyInfo.code] || 1.0)).toLocaleString()} {currencyInfo.code}
              </div>
            )}
          </div>
          <p className="font-sans text-[10px] text-slate-500 text-center leading-relaxed mt-3 max-w-xs font-medium">
            {lang === 'zh'
              ? `💡 注：此统计扣除跨城大交通，为 ${travelerCount} 人出行的前述分类预估总计，优享酒店/租车等共享成本折扣。`
              : `💡 Excludes intercity transits. Estimated sum mapped for ${travelerCount} travelers, optimizing shared lodging & local transit limits.`}
          </p>
        </div>
      </div>
    </div>
  );
}
