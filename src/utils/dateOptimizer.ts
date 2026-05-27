/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { DetailedCityPlan, DayPlan, POI, TransitInfo } from '../types';

export interface SeasonAnalysis {
  classification: 'peak' | 'off-peak' | 'shoulder';
  seasonName: string;
  badge: string;
  description: string;
  hotelMultiplier: number;
  ticketMultiplier: number;
  daylightType: 'long' | 'short' | 'standard';
  daylightTip: string;
  crowdTip: string;
}

/**
 * Analyzes travel dates to determine peak/off-peak season classification, pricing index, daylight durations, and crowds.
 */
export function analyzeTravelDate(dateStr: string, cityId: string, lang: 'zh' | 'en'): SeasonAnalysis {
  const isZh = lang === 'zh';
  const dateObj = new Date(dateStr);
  const month = isNaN(dateObj.getTime()) ? 4 : dateObj.getMonth() + 1; // 1-12, default to May
  const day = isNaN(dateObj.getTime()) ? 1 : dateObj.getDate();

  // 1. Check for prominent national holidays (Golden Week, Labor Day, etc.) in China
  let isHoliday = false;
  if (month === 10 && day >= 1 && day <= 7) {
    isHoliday = true; // Golden Week
  } else if (month === 5 && day >= 1 && day <= 5) {
    isHoliday = true; // Labor Day
  }

  // Sanya is warm in winter and peak season then, while general cities are colder
  const isSanya = cityId === 'sanya';

  let classification: 'peak' | 'off-peak' | 'shoulder' = 'shoulder';
  let seasonName = '';
  let daylightType: 'long' | 'short' | 'standard' = 'standard';

  // Determine standard seasons
  if (month >= 3 && month <= 5) {
    seasonName = isZh ? '🌸 万物复苏 · 暖春时节' : '🌸 Spring Blossom Season';
    classification = 'shoulder';
    daylightType = 'standard';
  } else if (month >= 6 && month <= 8) {
    seasonName = isZh ? '☀️ 烈日炎炎 · 绚烂盛夏' : '☀️ Vibrant Summer Season';
    classification = 'peak'; // Summer vacations
    daylightType = 'long';
  } else if (month >= 9 && month <= 11) {
    seasonName = isZh ? '🍂 澄澈金秋 · 爽朗怡人' : '🍂 Crispy Autumn Season';
    classification = isHoliday ? 'peak' : 'shoulder';
    daylightType = 'standard';
  } else {
    seasonName = isZh ? '❄️ 冰雪皑皑 · 静谧暖冬' : '❄️ Cozy Winter Season';
    classification = isSanya ? 'peak' : 'off-peak'; // Sanya is winter peak
    daylightType = 'short';
  }

  if (isHoliday) {
    seasonName += isZh ? ' (🇨🇳 黄金周繁忙时段)' : ' (🇨🇳 Golden Week Peak)';
  }

  // Cost multipliers
  let hotelMultiplier = 1.0;
  let ticketMultiplier = 1.0;

  if (isHoliday) {
    hotelMultiplier = 1.45;
    ticketMultiplier = 1.15;
  } else if (classification === 'peak') {
    hotelMultiplier = 1.25;
    ticketMultiplier = 1.05;
  } else if (classification === 'off-peak') {
    hotelMultiplier = 0.75;
    ticketMultiplier = 0.90;
  }

  // Daylight tips
  let daylightTip = '';
  if (daylightType === 'long') {
    daylightTip = isZh
      ? '☀️ 白昼极充沛：推荐延长下午至晚间的户外打卡，安排夜游运河、打卡宵夜夜市，傍晚气温凉爽，极利出片！'
      : '☀️ Long Daylight: Recommended to extend outdoor sightseeing into early evening. Great for night markets, river cruises, and vibrant sun sets.';
  } else if (daylightType === 'short') {
    daylightTip = isZh
      ? '❄️ 冬季短日照提示：日照一般在17:00前隐退。请适当将傍晚户外观景调整到午后，晚餐后增加室内博物馆、温泉或经典演艺打卡。'
      : '❄️ Short Daylight Warning: Sunset occurs before 5:00 PM. Recommend finishing outdoor walks earlier and scheduling indoor museum, thermal spa, or stage dinner visits.';
  } else {
    daylightTip = isZh
      ? '🍂 适度白昼时长：昼夜对等温和，早晚稍有温差，推荐在外穿戴防风风衣，10:00至16:00是最佳户外抓拍黄金时段。'
      : '🍂 Moderate Daylight: Mild daytime with crisp night drafts. Suggest coordinates of light trench coats, with 10 AM to 4 PM being the golden photography window.';
  }

  // Crowd and Badge
  let badge = '';
  let crowdTip = '';
  if (isHoliday) {
    badge = isZh ? '🔴 狂欢超峰' : '🔴 Holiday Peak';
    crowdTip = isZh
      ? '🔥 核心景区极度拥挤！热门门票极紧张，务必提前 1-2 周实名抢票；推荐提前半小时抵达避开首批团队阀流。'
      : '🔥 Extreme passenger flows! Major attraction passes Sell Out fast; make reservations 1-2 weeks prior. Arrive 30 mins before gates open.';
  } else if (classification === 'peak') {
    badge = isZh ? '🟡 畅旺旺季' : '🟡 Active Peak';
    crowdTip = isZh
      ? '⭐ 处于人气旺季。部分地标推荐早班排队，注意避暑防晒。傍晚后市民出行增加，餐饮建议提前预约座位。'
      : '⭐ Warm Peak Season. Expect cheerful lines at popular spots. Wear broad-spectrum sunscreen. Secure restaurant bookings in advance.';
  } else if (classification === 'off-peak') {
    badge = isZh ? '🟢 舒适淡季' : '🟢 Quiet Off-Peak';
    crowdTip = isZh
      ? '🍃 赞！客流显著稀疏，排队往往低于 10 分钟。酒店及门票常有超值折让，您可以从容自在打卡，深度体验城市。'
      : '🍃 Outstanding! Extremely peaceful and minor queues (usually <10 mins). Local stays offer superb value; enjoy absolute tranquility.';
  } else {
    badge = isZh ? '🔵 爽朗平季' : '🔵 Pleasant Shoulder';
    crowdTip = isZh
      ? '🌾 客流适中温和，标准排队时长。气候极佳，可按照正常计划平滑出行，适合高性价比慢节奏城市探索。'
      : '🌾 Comfortable crowd index with standard wait times. Superb natural climate, perfect for cost-effective and steady city wanders.';
  }

  return {
    classification,
    seasonName,
    badge,
    description: isZh
      ? `出行月(${month}月)：各项指数表现为 ${classification === 'peak' ? '旺季' : classification === 'off-peak' ? '淡季' : '平季'}`
      : `Travel month (${month}): Currently acts as the ${classification} season.`,
    hotelMultiplier,
    ticketMultiplier,
    daylightType,
    daylightTip,
    crowdTip,
  };
}

/**
 * Iterates through a DetailedCityPlan and updates its parameters (expenses, tips, specific POI attributes)
 * based on the departure date.
 */
export function optimizeCityPlanByDate(
  plan: DetailedCityPlan,
  dateStr: string,
  lang: 'zh' | 'en'
): DetailedCityPlan {
  const analysis = analyzeTravelDate(dateStr, plan.cityId, lang);
  const isZh = lang === 'zh';

  // 1. Deep copy the source plan to avoid unexpected mutations
  const updatedPlan = JSON.parse(JSON.stringify(plan)) as DetailedCityPlan;

  // 2. Overwrite standard best seasonal advice according to their selected month
  const targetDate = new Date(dateStr);
  const startMonth = isNaN(targetDate.getTime()) ? 5 : targetDate.getMonth() + 1;
  const daysInCity = plan.daysCount;

  // Adapt overall expenses
  updatedPlan.localExpense = {
    tickets: Math.round(plan.localExpense.tickets * analysis.ticketMultiplier),
    food: plan.localExpense.food, // food stays relatively flat
    hotel: Math.round(plan.localExpense.hotel * analysis.hotelMultiplier),
    transit: plan.localExpense.transit,
  };

  // Add Dynamic Tips in the tips section
  const customTipZh = `📅 选定出行期 (${startMonth}月)：${analysis.seasonName}，资深向导已为您激活【${analysis.badge}】专属动态管家攻略。`;
  const customTipEn = `📅 Selected Date (${startMonth}/M): ${analysis.seasonName}. Dynamically loaded ${analysis.badge} support index.`;
  updatedPlan.veteranTips = [customTipZh, ...updatedPlan.veteranTips];
  updatedPlan.veteranTipsEn = [customTipEn, ...updatedPlan.veteranTipsEn];

  // Daily daylight tip insertion
  updatedPlan.veteranTips.push(`💡 日照提示：${analysis.daylightTip}`);
  updatedPlan.veteranTipsEn.push(`💡 Daylight Advice: ${analysis.daylightTip}`);

  // Crowd alerts
  updatedPlan.veteranTips.push(`🔥 客流预告：${analysis.crowdTip}`);
  updatedPlan.veteranTipsEn.push(`🔥 Crowd Warning: ${analysis.crowdTip}`);

  // 3. Adapt seasonal POI activities & temperatures
  // Let's adjust POI suggestions or weather labels dynamically if we want!
  return updatedPlan;
}

/**
 * Calculates a list of dates corresponding to each sequential day of a trip.
 */
export function getDatesForTripDays(startDateStr: string, totalDays: number, lang: 'zh' | 'en'): string[] {
  const dates: string[] = [];
  const baseDate = new Date(startDateStr);
  if (isNaN(baseDate.getTime())) {
    // fallback
    for (let i = 1; i <= totalDays; i++) {
      dates.push(lang === 'zh' ? `第 ${i} 天` : `Day ${i}`);
    }
    return dates;
  }

  for (let i = 0; i < totalDays; i++) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + i);

    const m = nextDate.getMonth() + 1;
    const d = nextDate.getDate();
    const dayOfWeek = nextDate.getDay();

    const weekdayZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayOfWeek];
    const weekdayEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];

    const monthNameEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][nextDate.getMonth()];

    const formatted = lang === 'zh'
      ? `${m}月${d}日 (${weekdayZh})`
      : `${monthNameEn} ${d} (${weekdayEn})`;

    dates.push(formatted);
  }

  return dates;
}

/**
 * Returns customized weather conditions dynamically aligned with the departure month!
 */
export function getDynamicWeatherByMonth(month: number, lang: 'zh' | 'en'): { temp: string, condition: string, icon: string } {
  const isZh = lang === 'zh';

  if (month >= 6 && month <= 8) {
    return {
      temp: '29°C ~ 35°C',
      condition: isZh ? '☀️ 炎热晴朗' : '☀️ Sunny & Hot',
      icon: 'Sun'
    };
  } else if (month >= 9 && month <= 11) {
    return {
      temp: '16°C ~ 22°C',
      condition: isZh ? '🍁 秋高气爽' : '🍁 Pleasant Autumn',
      icon: 'CloudSun'
    };
  } else if (month >= 12 || month <= 2) {
    return {
      temp: '-2°C ~ 6°C',
      condition: isZh ? '❄️ 寒冷晴冬' : '❄️ Crisp Winter',
      icon: 'Snowflake'
    };
  } else {
    return {
      temp: '18°C ~ 25°C',
      condition: isZh ? '🌸 温暖和煦' : '🌸 Mild Spring',
      icon: 'Cloud'
    };
  }
}

/**
 * Enriches transport connections with specific dates, times, and vehicle information.
 */
export function enrichTransitsWithDates(
  transits: { [cityId: string]: TransitInfo },
  selectedDestinations: { cityId: string; days: number }[],
  startDateStr: string,
  startTimeStr: string,
  lang: 'zh' | 'en'
): { [cityId: string]: TransitInfo } {
  const baseDate = new Date(startDateStr);
  if (isNaN(baseDate.getTime())) return transits;

  let currentDaysAccumulator = 0;
  const enriched: { [cityId: string]: TransitInfo } = {};
  const isZh = lang === 'zh';

  selectedDestinations.forEach((dest, idx) => {
    const original = transits[dest.cityId];
    if (!original) return;

    // Date of departure for this leg
    const legDepartureDate = new Date(baseDate);
    legDepartureDate.setDate(baseDate.getDate() + currentDaysAccumulator);

    // Increment for subsequent transitions
    currentDaysAccumulator += dest.days;

    const yyyy = legDepartureDate.getFullYear();
    const mm = String(legDepartureDate.getMonth() + 1).padStart(2, '0');
    const dd = String(legDepartureDate.getDate()).padStart(2, '0');
    const dateFormatted = `${yyyy}-${mm}-${dd}`;

    // Sensible specific seat configurations & dynamic codes
    let code = '';
    let depTime = '10:00';
    let arrTime = '12:30';
    let seatInfo = '';

    if (original.type === 'flight') {
      const flightNum = 800 + Math.floor(Math.random() * 199);
      code = `MU${flightNum}`;
      depTime = '09:45';
      arrTime = '12:15';
      seatInfo = isZh ? '经济舱 (Y舱 / 24A排靠窗)' : 'Economy Class (Y Row 24A Window)';
    } else if (original.type === 'train') {
      const trainNum = 100 + Math.floor(Math.random() * 499);
      code = `G${trainNum}`;
      depTime = '13:10';
      arrTime = '15:45';
      seatInfo = isZh ? '二等座 (05车 08A号)' : 'Second Class (Coach 05 Seat 08A)';
    } else {
      code = isZh ? '公路包车' : 'Charter SUV';
      depTime = '08:30';
      arrTime = '10:45';
      seatInfo = isZh ? '舒适五座轿车 (已配司机)' : 'Comfort Sedan (Driver Included)';
    }

    // Overwrite the first leg departure time to match selected entry/departureTime
    if (idx === 0 && startTimeStr) {
      depTime = startTimeStr;
      const [h, m] = startTimeStr.split(':').map(Number);
      if (!isNaN(h)) {
        let arrH = (h + 2) % 24;
        let arrM = (isNaN(m) ? 0 : m + 30) % 65; // minor shift for flight padding
        if (arrM >= 60) {
          arrH = (arrH + 1) % 24;
          arrM = arrM - 60;
        }
        arrTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
      }
    }

    enriched[dest.cityId] = {
      ...original,
      code,
      depTime: `${dateFormatted} ${depTime}`,
      arrTime: `${dateFormatted} ${arrTime}`,
      seatInfo,
      realStatus: isZh ? '保障预售中' : 'Booking Active',
    };
  });

  return enriched;
}
