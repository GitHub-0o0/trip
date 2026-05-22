/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetailedCityPlan, TransitInfo, CityIndex } from '../types';
import { TranslationDict } from '../data/i18n';
import { ALL_CITIES_INDEX } from '../data/cities';
import { Compass, Sparkles, Scale, AlertCircle } from 'lucide-react';

interface PlanComparisonProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  cityPlans: DetailedCityPlan[];
  transits: { [cityId: string]: TransitInfo };
}

export default function PlanComparison({ t, lang, cityPlans, transits }: PlanComparisonProps) {
  // Evaluates if city matches May ideal tourism timeline (spring/early-summer is gorgeous in Kyoto, Tokyo, Paris, Beijing, Hangzhou, Guilin, etc.)
  const isIdealForMay = (cityId: string): boolean => {
    const ideals = ['tokyo', 'kyoto', 'paris', 'beijing', 'hangzhou', 'guilin', 'xiamen', 'kunming'];
    return ideals.includes(cityId);
  };

  const getCityTags = (cityId: string): string[] => {
    switch (cityId) {
      case 'beijing':
        return lang === 'zh' ? ['皇家古建', '胡同京韵', '金秋长城'] : ['Imperial', 'Hutong Code', 'Great Wall'];
      case 'shanghai':
        return lang === 'zh' ? ['十里洋场', '摩天高空', '法租梧桐'] : ['Bund Glow', 'Skyscrapers', 'French Concession'];
      case 'xian':
        return lang === 'zh' ? ['兵俑史壮', '古墙骑行', '大唐夜色'] : ['Clay Army', 'Wall Cycling', 'Tang Dynasty'];
      case 'chengdu':
        return lang === 'zh' ? ['憨萌滚滚', '巴蜀麻辣', '闲憩盖碗'] : ['Cute Pandas', 'Spicy Hotpot', 'Teahouse Tea'];
      case 'kyoto':
        return lang === 'zh' ? ['唐风古朴', '鸟居红廊', '抹茶禅境'] : ['Tang Elegance', 'Red Torii', 'Zen Gardens'];
      case 'paris':
        return lang === 'zh' ? ['铁塔落日', '左岸咖啡', '宫廊印象'] : ['Eiffel Sunset', 'Left-Bank Cafe', 'Museum Art'];
      case 'sanya':
        return lang === 'zh' ? ['椰风白沙', '热带雨林', '海鲜饕宴'] : ['White Sand', 'Rainforest', 'Fresh Seafood'];
      case 'tokyo':
        return lang === 'zh' ? ['繁华十字', '二次元秋叶', '天空落日'] : ['Neon Shibuya', 'Anime Akiba', 'Sunset Sky'];
      default:
        return lang === 'zh' ? ['异域奇趣', '深度越野'] : ['Exotic Vibe', 'Adventures'];
    }
  };

  if (cityPlans.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <p className="font-sans text-xs text-slate-500 font-bold">
          {lang === 'zh' ? '请先在规划中设定并生成您的行程方案，之后在此一键评估对比。' : 'Please configure your travel itinerary first to view comparison grids here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 mb-6 col-span-3">
        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-sans font-bold text-lg text-slate-900 tracking-tight">{t.compareTitle}</h2>
          <p className="font-sans text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
            {lang === 'zh' ? '★ 针对 May 2026 行程规划季定制权重评判' : '★ Weighted comparison optimized for May 2026 vacation'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-inner bg-slate-50/20">
        <table className="w-full font-sans border-collapse text-left text-xs min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-widest text-[9px]">
              <th className="px-5 py-4">{t.colCity}</th>
              <th className="px-4 py-4 text-center">{t.colDays}</th>
              <th className="px-4 py-4">{t.colTransit}</th>
              <th className="px-4 py-4">{t.colExpense}</th>
              <th className="px-4 py-4">{t.colTotal}</th>
              <th className="px-4 py-4 text-center">{t.colSeason}</th>
              <th className="px-5 py-4">{t.colTags}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
            {cityPlans.map((plan) => {
              const transit = transits[plan.cityId];
              const transitCost = transit ? transit.cost * 2 : 0; // roundtrip transit estimate
              const tickets = plan.localExpense.tickets;
              const food = plan.localExpense.food;
              const hotel = plan.localExpense.hotel;
              const localTransit = plan.localExpense.transit;
              const localSum = tickets + food + hotel + localTransit;
              const citySumTotal = transitCost + localSum;

              const isIdeal = isIdealForMay(plan.cityId);
              const tags = getCityTags(plan.cityId);

              return (
                <tr key={plan.cityId} className="hover:bg-slate-100/50 transition-colors bg-white">
                  <td className="px-5 py-4.5 font-bold text-slate-900 text-sm">
                    {lang === 'zh' ? plan.cityName : plan.cityNameEn}
                  </td>
                  <td className="px-4 py-4.5 text-center font-extrabold text-slate-700">
                    {plan.daysCount}
                  </td>
                  <td className="px-4 py-4.5">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900">
                        {lang === 'zh' ? '¥' : '$'}{transitCost}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                        {transit ? (lang === 'zh' ? transit.type === 'flight' ? '双程飞机' : '高铁往返' : transit.type) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900">
                        {lang === 'zh' ? '¥' : '$'}{localSum}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                        {lang === 'zh' ? `${plan.daysCount}天在当地吃住行` : `${plan.daysCount}d onsite stay`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4.5 font-sans font-extrabold text-blue-600 text-sm">
                    {lang === 'zh' ? '¥' : '$'}{citySumTotal}
                  </td>
                  <td className="px-4 py-4.5 text-center">
                    {isIdeal ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-sans text-[9px] px-2.5 py-1 rounded-full border border-amber-150 font-bold shadow-sm animate-pulse">
                        <span>🌟 5月最佳</span>
                      </span>
                    ) : (
                      <span className="text-slate-450 font-medium">{lang === 'zh' ? '适宜四季' : 'Adaptive'}</span>
                    )}
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tg) => (
                        <span
                          key={tg}
                          className="font-sans text-[10px] px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 font-bold"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
