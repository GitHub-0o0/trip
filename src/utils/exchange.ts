/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global state / cached details for exchange rates in the application
export const DEFAULT_EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1.0,
  CNY: 7.24,
  EUR: 0.92,
  GBP: 0.81,
  JPY: 155.8,
  SGD: 1.35,
  HKD: 7.82,
  CHF: 0.91,
};

// Gets the active, valid exchange rates (checks localStorage or uses default)
export function getStoredExchangeRates(): { [key: string]: number } {
  const saved = localStorage.getItem('trip_ai_custom_exchange_rates');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure all required default keys exist
      return { ...DEFAULT_EXCHANGE_RATES, ...parsed };
    } catch (e) {
      console.warn('Error reading stored exchange rates', e);
    }
  }
  return { ...DEFAULT_EXCHANGE_RATES };
}

// Fetch rates from public open API
export async function fetchLiveExchangeRates(): Promise<{ [key: string]: number } | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    if (data && data.result === 'success' && data.rates) {
      const fetchedRates = data.rates;
      const filtered: { [key: string]: number } = {};
      Object.keys(DEFAULT_EXCHANGE_RATES).forEach((cur) => {
        if (fetchedRates[cur]) {
          filtered[cur] = parseFloat(fetchedRates[cur].toFixed(4));
        } else {
          filtered[cur] = DEFAULT_EXCHANGE_RATES[cur];
        }
      });
      // Save to localStorage with timestamp
      localStorage.setItem('trip_ai_custom_exchange_rates', JSON.stringify(filtered));
      localStorage.setItem('trip_ai_exchange_rates_updated', Date.now().toString());
      return filtered;
    }
  } catch (error) {
    console.error('Failed to fetch live exchange rates:', error);
  }
  return null;
}

// Map of cityId to local currency
export const CITY_CURRENCY_MAP: { [cityId: string]: { code: string; symbol: string; nameZh: string; nameEn: string } } = {
  beijing: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  shanghai: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  xian: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  chengdu: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  harbin: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  sanya: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  guangzhou: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  hangzhou: { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' },
  kyoto: { code: 'JPY', symbol: '円', nameZh: '日元', nameEn: 'JPY' },
  tokyo: { code: 'JPY', symbol: '円', nameZh: '日元', nameEn: 'JPY' },
  london: { code: 'GBP', symbol: '£', nameZh: '英镑', nameEn: 'GBP' },
  paris: { code: 'EUR', symbol: '€', nameZh: '欧元', nameEn: 'EUR' },
  geneva: { code: 'CHF', symbol: 'CHF', nameZh: '瑞士法郎', nameEn: 'CHF' },
  singapore: { code: 'SGD', symbol: 'S$', nameZh: '新加坡元', nameEn: 'SGD' },
  new_york: { code: 'USD', symbol: '$', nameZh: '美元', nameEn: 'USD' },
};

// Gets currency details for a city
export function getCityCurrency(cityId: string) {
  const normId = cityId.toLowerCase();
  return CITY_CURRENCY_MAP[normId] || { code: 'CNY', symbol: '¥', nameZh: '人民币', nameEn: 'RMB' };
}

// Formats cost in CNY with local currency details side-by-side using stored exchange rates
export function formatCostDual(cnyAmount: number, cityId: string, lang: 'zh' | 'en' = 'zh'): string {
  const currencyInfo = getCityCurrency(cityId);
  if (currencyInfo.code === 'CNY') {
    return `¥${cnyAmount}`;
  }
  
  const rates = getStoredExchangeRates();
  const cnyRate = rates['CNY'] || 7.24;
  const targetRate = rates[currencyInfo.code] || 1.0;
  
  // cnyAmount to USD, then USD to targetLocal
  const usdVal = cnyAmount / cnyRate;
  const localVal = usdVal * targetRate;
  
  const localFormatted = localVal < 10 ? localVal.toFixed(2) : Math.round(localVal).toLocaleString();
  const label = lang === 'zh' ? '约' : 'approx.';
  
  return `¥${cnyAmount} (${label} ${currencyInfo.symbol}${localFormatted})`;
}

export interface LocalExpenseType {
  tickets: number;
  food: number;
  hotel: number;
  transit: number;
}

/**
 * Dynamically scales expense categories based on traveler count:
 * - Tickets / Attraction Gate Fees: Scaled per person (x travelerCount)
 * - Food / Dining: Scaled per person (x travelerCount)
 * - Lodging / Hotel Stay: Shared, assuming 2 people per room (x ceil(travelerCount / 2))
 * - Intra-city Local Transit: Shared, assuming 3 people per group (x ceil(travelerCount / 3))
 */
export function getScaledLocalExpense(exp: LocalExpenseType, travelerCount: number, isAiEnhanced?: boolean): LocalExpenseType {
  if (isAiEnhanced) {
    return exp; // If AI already calculated the budget dynamically using real searched rates for N travelers, return as-is
  }
  const n = Math.max(1, travelerCount || 1);
  return {
    tickets: exp.tickets * n,
    food: exp.food * n,
    hotel: exp.hotel * Math.ceil(n / 2),
    transit: exp.transit * Math.ceil(n / 3),
  };
}

