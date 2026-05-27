/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TripPlan, CitySelection } from '../types';
import { TranslationDict } from '../data/i18n';
import { ALL_CITIES_INDEX } from '../data/cities';
import { getStoredExchangeRates } from '../utils/exchange';
import { Archive, Calendar, Trash2, ArrowRight, FolderOpen, MapPin, Activity } from 'lucide-react';

interface HistoryArchiveProps {
  t: TranslationDict;
  lang: 'zh' | 'en';
  plans: TripPlan[];
  onSelectPlan: (plan: TripPlan) => void;
  onDeletePlan: (id: string, e: React.MouseEvent) => void;
}

export default function HistoryArchive({ t, lang, plans, onSelectPlan, onDeletePlan }: HistoryArchiveProps) {
  const getCityLabel = (id: string) => {
    const city = ALL_CITIES_INDEX.find((c) => c.id === id);
    if (!city) return id.toUpperCase();
    return lang === 'zh' ? city.name : city.nameEn;
  };

  if (plans.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-350">
          <Archive className="w-8 h-8" />
        </div>
        <h3 className="font-sans font-bold text-slate-700 text-sm mb-1">
          {lang === 'zh' ? '暂无收藏的日程行程' : 'No saved routes in favorites'}
        </h3>
        <p className="font-sans text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          {t.noHistory}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2.5 mb-2">
        <FolderOpen className="w-5 h-5 text-slate-700" />
        <h3 className="font-sans font-bold text-slate-900 border-b-2 border-blue-500 pb-0.5 text-base">{t.historyTitle}</h3>
      </div>

      <div className="space-y-4">
        {plans.map((p) => {
          // Format date timestamp nicely
          let formattedDate = p.createdAt;
          try {
            const dateObj = new Date(p.createdAt);
            formattedDate = dateObj.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch (e) {
            // fallback
          }

          const depName = getCityLabel(p.departureCity);

          return (
            <div
              key={p.id}
              onClick={() => onSelectPlan(p)}
              className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden shadow-sm"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-sans text-[10px] text-slate-400 font-bold tracking-wide uppercase">
                    {formattedDate}
                  </span>
                  {p.cityPlans.some((cp) => cp.isAiEnhanced) && (
                    <span className="bg-blue-50 text-blue-600 font-sans text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                      ✨ AI
                    </span>
                  )}
                </div>

                {/* Travel route chain */}
                <div className="flex flex-wrap items-center gap-1.5 font-sans">
                  <span className="bg-rose-50 text-rose-600 font-bold px-2.5 py-1 text-xs rounded-xl border border-rose-100 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {depName}
                  </span>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-350 shrink-0" />

                  {p.selectedDestinations.map((dest, i) => (
                    <React.Fragment key={dest.cityId}>
                      <span className="bg-slate-50 text-slate-700 font-bold px-2.5 py-1 text-xs rounded-xl border border-slate-200">
                        {getCityLabel(dest.cityId)} ({dest.days}d)
                      </span>
                      {i < p.selectedDestinations.length - 1 && (
                        <ArrowRight className="w-3 text-slate-350 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Summary rates info line */}
                <div className="flex items-center gap-4 text-xs font-sans font-medium text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    {t.totalDays}: <span className="font-bold text-slate-755">{p.totalDays}</span>
                  </span>
                  <span>
                    {t.totalBudget}:{' '}
                    <span className="font-bold text-blue-600 text-sm">
                      ¥{p.totalBudget}
                      {lang === 'en' && ` ($${Math.round(p.totalBudget / (getStoredExchangeRates()?.CNY || 7.24))})`}
                    </span>
                  </span>
                </div>
              </div>

              {/* purging and trash button */}
              <button
                type="button"
                onClick={(e) => onDeletePlan(p.id, e)}
                className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all self-end md:self-center bg-slate-50 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                title="Delete this itinerary"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
