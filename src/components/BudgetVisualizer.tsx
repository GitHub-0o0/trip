/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TranslationDict } from '../data/i18n';
import { Ticket, Utensils, Hotel, Car, DollarSign } from 'lucide-react';

interface BudgetVisualizerProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  expense: {
    tickets: number;
    food: number;
    hotel: number;
    transit: number;
  };
}

export default function BudgetVisualizer({ t, lang, expense }: BudgetVisualizerProps) {
  const { tickets, food, hotel, transit } = expense;
  const grandLocalTotal = tickets + food + hotel + transit;

  const items = [
    {
      label: t.costTickets,
      val: tickets,
      icon: <Ticket className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-500',
      textClass: 'text-emerald-600',
    },
    {
      label: t.costFood,
      val: food,
      icon: <Utensils className="w-4 h-4 text-orange-600" />,
      bg: 'bg-orange-500',
      textClass: 'text-orange-600',
    },
    {
      label: t.costHotel,
      val: hotel,
      icon: <Hotel className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-500',
      textClass: 'text-indigo-600',
    },
    {
      label: t.costTransit,
      val: transit,
      icon: <Car className="w-4 h-4 text-sky-600" />,
      bg: 'bg-sky-500',
      textClass: 'text-sky-600',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
        <h4 className="font-sans font-bold text-slate-900 text-sm tracking-wide uppercase">{t.budgetBreakdown}</h4>
        <span className="font-mono text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {lang === 'zh' ? '人均预估' : 'Est. Per Person'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress bar visualizer column */}
        <div className="space-y-4">
          {items.map((item) => {
            const rawPercent = grandLocalTotal > 0 ? (item.val / grandLocalTotal) * 100 : 0;
            const percent = isNaN(rawPercent) ? 0 : Math.round(rawPercent);

            return (
              <div key={item.label} className="space-y-1.5 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-slate-900">
                      {lang === 'zh' ? '¥' : '$'}
                      {item.val}
                    </span>
                    <span className="text-slate-400 font-bold">({percent}%)</span>
                  </div>
                </div>

                {/* Styled progress level */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                  <div className={`h-full ${item.bg} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregate sum box as a beautiful Bento Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-center items-center">
          <span className="font-sans text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-2">
            {lang === 'zh' ? '当前城市当地共计花费' : 'LOCAL SUB-TOTAL SUM'}
          </span>
          <div className="flex items-baseline text-blue-600 font-sans">
            <span className="text-xl font-bold">{lang === 'zh' ? '¥' : '$'}</span>
            <span className="text-3xl font-extrabold tracking-tight ml-0.5 text-blue-600">{grandLocalTotal}</span>
          </div>
          <p className="font-sans text-[10px] text-slate-500 text-center leading-relaxed mt-3 max-w-xs font-medium">
            {lang === 'zh'
              ? '💡 注：此统计扣除城际大交通费用，包含餐饮、景区门票、当地联络及品质星钻酒店。'
              : '💡 Excludes intercity transit; covers tickets, gastronomy, stays, and localized transport.'}
          </p>
        </div>
      </div>
    </div>
  );
}
