/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core App Types

export interface POI {
  id: string;
  name: string;
  nameEn: string;
  type: 'attraction' | 'food' | 'hotel' | 'transit';
  time: string; // e.g. "09:00"
  duration: string; // e.g. "3h" or "1.5h"
  cost: number; // local cost in USD/CNY equivalent
  bestTime: string; // best watch hour
  crowdTimes: string; // crowded parts
  tip: string; // tip or description
  tipEn: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface DayPlan {
  day: number;
  pois: POI[];
}

export interface DetailedCityPlan {
  cityId: string;
  cityName: string;
  cityNameEn: string;
  daysCount: number;
  bestSeason: string;
  bestSeasonEn: string;
  localExpense: {
    tickets: number; // gate fees
    food: number;
    hotel: number;
    transit: number; // intra-city transit
  };
  veteranTips: string[];
  veteranTipsEn: string[];
  days: DayPlan[];
  isAiEnhanced: boolean;
}

export interface TransitInfo {
  type: 'flight' | 'train' | 'bus' | 'car';
  distance: number; // km
  duration: string; // e.g., "3h 45m"
  cost: number;
  advice: string;
  adviceEn: string;
  // Dynamic schedule & transport information access
  code?: string;
  depTime?: string;
  arrTime?: string;
  seatInfo?: string;
  realStatus?: string;
}

export interface CitySelection {
  cityId: string;
  days: number;
}

export interface TripPlan {
  id: string;
  title: string;
  createdAt: string;
  departureCity: string; // e.g., "beijing"
  selectedDestinations: CitySelection[];
  cityPlans: DetailedCityPlan[]; // corresponding plan detail
  transits: { [cityId: string]: TransitInfo }; // transit route to this city
  totalBudget: number;
  totalDays: number;
  departureDate?: string; // "YYYY-MM-DD" e.g., "2026-05-28"
  departureTime?: string; // "HH:MM" e.g., "09:00"
  returnDate?: string; // "YYYY-MM-DD"
  returnTime?: string; // "HH:MM"
  travelMode?: string; // "flight" | "train" | "car" | "all"
  travelerCount?: number;
}

export interface CityIndex {
  id: string;
  name: string;
  nameEn: string;
  pinyin: string;
  region: string;
  regionEn: string;
  isInternational: boolean;
  coordinates: [number, number];
}

export interface GeoDBCitySearchResult {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  countryEn: string;
  coordinates: [number, number];
}

export type LlmProvider = 'gemini' | 'deepseek' | 'qwen' | 'minimax' | 'custom';
export type MapEngine = 'leaflet' | 'google' | 'amap';

export interface CustomLlmConfig {
  provider: LlmProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ParsedReceipt {
  id: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  status: 'pending' | 'success' | 'error';
  receiptType: 'flight' | 'train' | 'hotel' | 'attraction' | 'dining' | 'other';
  fromCity?: string;
  toCity?: string;
  date?: string;
  time?: string;
  amount?: number;
  currency?: string;
  description?: string;
  notes?: string;
}

