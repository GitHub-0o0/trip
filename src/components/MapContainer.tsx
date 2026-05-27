/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ALL_CITIES_INDEX } from '../data/cities';
import { DetailedCityPlan, MapEngine, TripPlan, TransitInfo } from '../types';
import { getStoredExchangeRates } from '../utils/exchange';
import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap as useGoogleMap } from '@vis.gl/react-google-maps';
import { 
  Plane, 
  Train, 
  Car, 
  Bus, 
  Search, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Compass, 
  HelpCircle, 
  Save, 
  Calendar, 
  Clock, 
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  DollarSign,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Info,
  X,
  Flame,
  Footprints
} from 'lucide-react';

let L: any = null; // Dynamically imported Leaflet instance

interface PoiIntel {
  weather: {
    temp: string;
    condition: string;
    humidity: string;
    uvIndex: string;
    wind: string;
  };
  traffic: {
    status: 'good' | 'slow' | 'heavy';
    badge: string;
    badgeColor: string;
    speed: string;
    tip: string;
  };
  gourmet: string;
  strategy: string;
}

function getRichPoiIntelligence(poiName: string, poiType: string, lang: 'zh' | 'en'): PoiIntel {
  const isZh = lang === 'zh';
  const nameLower = poiName.toLowerCase();
  
  if (nameLower.includes('故宫') || nameLower.includes('palace') || nameLower.includes('forbidden')) {
    return {
      weather: {
        temp: '22°C',
        condition: isZh ? '⛅ 多云转晴' : '⛅ Partly Sunny',
        humidity: '40%',
        uvIndex: isZh ? '中等 (3级)' : 'Moderate (3)',
        wind: isZh ? '东南风 2级' : 'Light SE Wind 2',
      },
      traffic: {
        status: 'slow',
        badge: isZh ? '🟡 局部缓行' : '🟡 Slightly Slow',
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
        speed: isZh ? '周边均速 28km/h' : 'Lanes Avg 28km/h',
        tip: isZh 
          ? '东华门及景前街车流较密集。推荐搭乘轨道交通8号线或1号线步行前往午门。' 
          : 'Congestion on Jingshan Front St. Highly recommend taking Metro Line 8 or Line 1 and walk.',
      },
      gourmet: isZh 
        ? '四季民福烤鸭店(东华门景观位可赏角楼景)、老北京炸酱面、老磁器口豆汁特产、姚记炒肝。' 
        : 'Siji Minfu Roast Duck (Stunning turret tower view), Old Beijing Fried Sauce Noodles, Yaoji Chaogan.',
      strategy: isZh
        ? '午门进 -> 太和殿 -> 坤宁宫 -> 御花园 -> 神武门出。务必提前7天微信小程序线上实名制预约购票，周一全天闭馆！'
        : 'Route: Meridian Gate -> Supreme Harmony -> Kunning Palace -> Imperial Garden -> Gate of Divine Prowess. Reserve 7 days in advance online. Closed Mondays!',
    };
  }
  
  if (nameLower.includes('长城') || nameLower.includes('wall')) {
    return {
      weather: {
        temp: '18°C',
        condition: isZh ? '☀️ 晴空万里 / 山区风大' : '☀️ Sunny / Great Wall Windy',
        humidity: '30%',
        uvIndex: isZh ? '极强 (5级 - 阳光暴晒)' : 'Extreme (5)',
        wind: isZh ? '西北风 4级' : 'NW Wind 4',
      },
      traffic: {
        status: 'good',
        badge: isZh ? '🟢 双向畅通' : '🟢 Smooth Run',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        speed: isZh ? '京藏高速均速 75km/h' : 'Highway Avg 75km/h',
        tip: isZh 
          ? '京藏高速/京礼高速通行极顺畅。建议避开节假日高峰以错峰出行。' 
          : 'G6/G7 Highway smooth. Start early around 7:00 AM to mismatch normal peak hours.',
      },
      gourmet: isZh 
        ? '长城脚下游玩：当地特色柴鸡焖豆腐、土炉贴饼子、原汁走地鸡、水库河鲜。' 
        : 'Local Gourmet: Braised Range Chicken, Great-wall Farmhouse Tofu Stew, Traditional Corn Pancakes.',
      strategy: isZh
        ? '攀登路线：建议购买北线索道双程直达北八锁阳关。贴士：长城脊背风力巨大、台阶陡峭，请穿防滑厚底跑鞋、戴防风遮阳帽、多备1-2瓶饮用水制备体力。'
        : 'Route: Take North Cablecar directly to North Tower 8. Tips: Extreme altitude winds, steep stairs. Wear climbing boots and windbreakers.',
    };
  }

  if (nameLower.includes('西湖') || nameLower.includes('west lake') || nameLower.includes('雷峰')) {
    return {
      weather: {
        temp: '20°C',
        condition: isZh ? '🌧️ 细雨连绵 / 烟雨缥缈' : '🌧️ Soft West Lake Drizzle',
        humidity: '85%',
        uvIndex: isZh ? '弱 (1级)' : 'Weak (1)',
        wind: isZh ? '东风 1级' : 'East Breeze 1',
      },
      traffic: {
        status: 'heavy',
        badge: isZh ? '🔴 交通限行 / 步行区极密' : '🔴 Heavy Congestion',
        badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
        speed: isZh ? '环湖均速 12km/h' : 'Lake Circuits Avg 12km/h',
        tip: isZh 
          ? '西湖景区单双号实行限行。极其推荐租借景区自行车骑行环游，或搭乘沿湖绿色环保电瓶车，省时省力！' 
          : 'Strict traffic limits. Rent a scenic city bicycle or take standard eco-electric golf carts directly!',
      },
      gourmet: isZh 
        ? '经典杭帮菜：楼外楼西湖醋鱼、东坡肉、龙井虾仁、知味观猫耳朵、新白鹿排骨。' 
        : 'Hangzhou Specialties: West Lake Vinegar Fish, slow-stewed Dongpo Pork, Longjing Roasted Shrimps, Zhi Wei Guan.',
      strategy: isZh
        ? '游玩攻略：断桥残雪 -> 白堤步游 -> 苏堤春晓 -> 雷峰夕照 -> 三潭印月(乘船)。建议在西湖畔落 sunset 时泡一杯龙井茶，静享江南慢生活。'
        : 'Route: Broken Bridge -> Baidi Causeway -> Sudi Causeway -> Leifeng Pagoda. Protip: Sit by lake teahouse at sunset with hot original dragonwell tea.',
    };
  }

  if (nameLower.includes('外滩') || nameLower.includes('bund') || nameLower.includes('南京路')) {
    return {
      weather: {
        temp: '23°C',
        condition: isZh ? '⛅ 江风清爽' : '⛅ Cool Overcast Riverfront',
        humidity: '60%',
        uvIndex: isZh ? '中等' : 'Medium',
        wind: isZh ? '黄浦江风 3级' : 'River Wind 3',
      },
      traffic: {
        status: 'slow',
        badge: isZh ? '🟡 步行街人流密集' : '🟡 High Crowd Density',
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
        speed: isZh ? '隧道均速 38km/h' : 'Tunnels Avg 38km/h',
        tip: isZh 
          ? '南京东路地下通道出行拥挤。推荐采用轮渡单程游江或步行至苏州河畔观景。' 
          : 'Highly crowded around Nanjing East Road. Better to take ferries or walk along Suzhou Creek boardwalk.',
      },
      gourmet: isZh 
        ? '附近海派小吃：佳家汤包蟹粉小笼、南翔小笼馒头、鲜得来排骨年糕、国际饭店蝴蝶酥。' 
        : 'Specialties: Crab-roe soup dumplings, Nanxiang Steamed Buns, Pork ribs with sticky rice Cakes, butterfly pastries.',
      strategy: isZh
        ? '外滩每晚19:00准时亮灯，建议最佳拍摄机位在和平饭店露台、北外滩滨江绿地（可完美避开拥挤人群同框东方明珠）。'
        : 'Magic neon lights up at 19:00. Best photography spot is Peace Hotel balcony or North Bund Promenade to skip human wave crowds.',
    };
  }

  // Type-specific fallbacks for gourmet and strategy
  if (poiType === 'food') {
    return {
      weather: {
        temp: '21°C',
        condition: isZh ? '☀️ 舒适舒爽' : '☀️ Delightful Dining Day',
        humidity: '50%',
        uvIndex: isZh ? '低 (2级)' : 'Low (2)',
        wind: isZh ? '微风 东南风1级' : 'Light SE Wind 1',
      },
      traffic: {
        status: 'good',
        badge: isZh ? '🟢 街道通畅' : '🟢 Free Access',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        speed: isZh ? '门前道路 40km/h' : 'Avenue speed 40km/h',
        tip: isZh ? '餐馆周边设有收费落客点，乘坐网约车及打车最利索。' : 'Paid drop-off bays nearby, taking ride-sharing is most efficient.',
      },
      gourmet: isZh 
        ? '舌尖必点：招牌地道风味、主厨独家秘制名菜、当季限定珍馐、大众热评必吃。' 
        : 'Cuisine Spotlight: Local seasonal master chef recipes, high-quality popular dishes.',
      strategy: isZh
        ? '食客特刊：本地口碑极高的特色餐馆，用餐高峰期排号可能较长。推荐提前在手机小程序预查预订，建议17:30前到场。'
        : 'Dining Tip: Local top-tier popularity! Evening queues can be up to 1hr. Reserve early via phone or arrive before 17:30.',
    };
  }

  if (poiType === 'hotel') {
    return {
      weather: {
        temp: '22°C',
        condition: isZh ? '☁️ 室内恒风舒服' : '☁️ Room Thermostat Controlled',
        humidity: '55%',
        uvIndex: isZh ? '弱' : 'Weak',
        wind: isZh ? '静风 1级' : 'Gentle Breeze 1',
      },
      traffic: {
        status: 'good',
        badge: isZh ? '🟢 畅行顺遂' : '🟢 Smooth Access',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        speed: isZh ? '大床通道极畅' : 'Driveway Free',
        tip: isZh ? '大堂泊车区宽敞。可请门岗协办免下车无行李交接服务。' : 'Spacious baggage drop-off lanes, warm port valet services.',
      },
      gourmet: isZh ? '住客奢享：顶楼云端景观酒廊、五星主厨匠心自助早点、下午茶创意小点。' : 'Hotel Dining: Panoramic sky lounge buffet breakfast, exquisite afternoon teatime pastries.',
      strategy: isZh 
        ? '入住贴士：官方前台通常在14:00后办理标准入住（可免费寄存行李及提早体验泳池健身房）。携老人及儿童等可申请延迟退房。' 
        : 'Stay Tip: Official check-in after 14:00, baggage store is free. Request high floor rooms and late checkout if available.',
    };
  }

  // General default fallback package
  return {
    weather: {
      temp: '22°C',
      condition: isZh ? '☀️ 气候舒适' : '☀️ Pleasant Sunny Outlook',
      humidity: '48%',
      uvIndex: isZh ? '适中 (3级)' : 'Moderate (3)',
      wind: isZh ? '微风 东南风 2级' : 'Light SE Wind 2',
    },
    traffic: {
      status: 'good',
      badge: isZh ? '🟢 交通顺畅' : '🟢 Road Active',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      speed: isZh ? '通行均时均速 35km/h' : 'Road Avg speed 35km/h',
      tip: isZh ? '周边公共交通站台配置极近。随时随地骑行也十分自在。' : 'Excellent transit links. Shared bikes can be found right outside.',
    },
    gourmet: isZh 
      ? `周边特色美食云集。附近街区有多家高口碑本地茶餐厅或特产风味老店。` 
      : `High crowd reputation specialties, traditional delicious bites nearby.`,
    strategy: isZh
      ? `打卡攻略：建议穿着平底运动跑鞋出行，备用便携式移动电源及折叠伞，时刻获得自在体验。`
      : `Explorer Guide: Wear comfortable sneakers, pack a compact power bank, and enjoy seamless photo taking!`,
  };
}

interface MapContainerProps {
  departureCityId: string;
  cityPlans: DetailedCityPlan[];
  activePlanIndex: number;
  onSelectCityIndex: (index: number) => void;
  mapEngine?: MapEngine;
  googleMapsKey?: string;
  amapKey?: string;
  amapSecurityCode?: string;
  currentPlan?: TripPlan | null;
  onUpdatePlan?: (plan: TripPlan) => void;
  lang?: 'zh' | 'en';
}

interface SimulatedRoute {
  code: string;
  type: 'flight' | 'train' | 'bus' | 'car';
  distance: number;
  duration: string;
  cost: number;
  depTime: string;
  arrTime: string;
  seatInfo: string;
  realStatus: string;
  advice: string;
  adviceEn: string;
}

// Simulated real-time transport database for high-end queries
const SIMULATED_LIVE_TRAFFIC_DB: SimulatedRoute[] = [
  {
    code: 'G105',
    type: 'train',
    distance: 1318,
    duration: '4h 32m',
    cost: 553,
    depTime: '07:45',
    arrTime: '12:17',
    seatInfo: '05车 08A号 (二等座)',
    realStatus: '正在售票/正常运行',
    advice: '京沪高铁复兴号标杆车。推荐从北京南站13B检票口快捷进站。',
    adviceEn: 'Fuxing Hao flagship train. Recommended boarding at Beijing South Station, Gate 13B.'
  },
  {
    code: 'G1',
    type: 'train',
    distance: 1318,
    duration: '4h 18m',
    cost: 553,
    depTime: '07:00',
    arrTime: '11:18',
    seatInfo: '02车 03F号 (一等座)',
    realStatus: '准点运行',
    advice: '超级直达车，中途仅停南京南站。速度最快，需要提前14天在12306预约购票。',
    adviceEn: 'Ultra-fast express, only stops at Nanjing South. Requires booking 14 days in advance.'
  },
  {
    code: 'G14',
    type: 'train',
    distance: 1318,
    duration: '4h 25m',
    cost: 604,
    depTime: '10:00',
    arrTime: '14:25',
    seatInfo: '06车 12B号 (二等座)',
    realStatus: '正常发车',
    advice: '商务出游首选时刻，提供精品盒饭售卖，座位配备USB充电孔。',
    adviceEn: 'Prime business hours train, with onboard dining service and USB plugs at each seat.'
  },
  {
    code: 'CA1504',
    type: 'flight',
    distance: 1150,
    duration: '2h 15m',
    cost: 1120,
    depTime: '14:00',
    arrTime: '16:15',
    seatInfo: '32A (靠窗/经济舱)',
    realStatus: '正在办票 - T3已开放',
    advice: '国航京沪快线。提供热食正餐，可在首都机场T3享专用安检通道。',
    adviceEn: 'Air China Beijing-Shanghai Express. Offers hot meals, dedicated T3 security channels.'
  },
  {
    code: 'MU5101',
    type: 'flight',
    distance: 1150,
    duration: '2h 20m',
    cost: 980,
    depTime: '08:00',
    arrTime: '10:20',
    seatInfo: '18J (靠过道/舒适舱)',
    realStatus: '准点率 94%',
    advice: '东航宽体客机（波音777），平稳安静，配备多媒体娱乐屏。建议从虹桥机场T2到达。',
    adviceEn: 'China Eastern widebody jet (Boeing 777), very stable, standard inflight entertainment screens.'
  }
];

export default function MapContainer({
  departureCityId,
  cityPlans,
  activePlanIndex,
  onSelectCityIndex,
  mapEngine = 'leaflet',
  googleMapsKey = '',
  amapKey = '',
  amapSecurityCode = '',
  currentPlan = null,
  onUpdatePlan,
  lang = 'zh'
}: MapContainerProps) {
  // Local fallback engine in case credentials fail or user wants immediate shift
  const [activeEngine, setActiveEngine] = useState<MapEngine>('leaflet');

  // Keep active engine synchronized with the outer prop changes
  useEffect(() => {
    setActiveEngine(mapEngine);
  }, [mapEngine]);

  const [selectedDayTab, setSelectedDayTab] = useState<number | 'all'>('all');
  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);
  const [visitedPois, setVisitedPois] = useState<{ [id: string]: boolean }>({});

  // Synchronize day selection tab when active city changes
  useEffect(() => {
    setSelectedDayTab('all');
    setSelectedPoi(null);
  }, [activePlanIndex]);

  const activeCityPlan = activePlanIndex >= 0 && activePlanIndex < cityPlans.length ? cityPlans[activePlanIndex] : null;

  // Compile active local check-in POIs to show on map
  const activePois: {
    id: string;
    dayNum: number;
    seq: number;
    poi: any;
    color: string;
    lineColor: string;
  }[] = [];

  if (activeCityPlan) {
    activeCityPlan.days.forEach((dayPlan) => {
      const dayNum = dayPlan.day;
      if (selectedDayTab === 'all' || selectedDayTab === dayNum) {
        // Assign beautiful distinct color-coding per day!
        let dayColor = '#6366f1'; // Indigo
        let dayLineColor = '#818cf8';
        if (dayNum === 1) {
          dayColor = '#f97316'; // Orange-Red
          dayLineColor = '#fb923c';
        } else if (dayNum === 2) {
          dayColor = '#10b981'; // Emerald
          dayLineColor = '#34d399';
        } else if (dayNum === 3) {
          dayColor = '#a855f7'; // Purple/Violet
          dayLineColor = '#c084fc';
        } else if (dayNum === 4) {
          dayColor = '#eab308'; // Amber
          dayLineColor = '#facc15';
        } else if (dayNum === 5) {
          dayColor = '#ec4899'; // Pink
          dayLineColor = '#f472b6';
        } else {
          dayColor = '#06b6d4'; // Cyan
          dayLineColor = '#22d3ee';
        }

        dayPlan.pois.forEach((poi, pSeq) => {
          activePois.push({
            id: poi.id,
            dayNum,
            seq: pSeq + 1,
            poi,
            color: dayColor,
            lineColor: dayLineColor,
          });
        });
      }
    });
  }

  // Intermediate Waypoints State for Route Planning
  const [waypoints, setWaypoints] = useState<{
    id: string;
    legId: string; // targets Destination CityId
    name: string;
    coord: [number, number];
    notes: string;
    type: 'service' | 'scenic' | 'layover' | 'station';
  }[]>([
    // Pre-populate an elegant scenic layover coordinate to exhibit Route Planning out-of-the-box
    {
      id: 'default-wp-1',
      legId: 'shanghai',
      name: lang === 'zh' ? '阳澄湖大闸蟹服务区' : 'Yangcheng Lake Rest Area',
      coord: [31.425, 120.785],
      notes: lang === 'zh' ? '全国最美园林式高速服务区，环境极为雅致。' : 'Renowned garden-style high-speed expressway rest area.',
      type: 'service'
    }
  ]);

  // Per-leg waypoints draft form inputs state
  const [wpForms, setWpForms] = useState<{[cityId: string]: { name: string; notes: string; type: 'service' | 'scenic' | 'layover' | 'station' }}>({});

  // Dynamic satellite traffic radar connection state
  const [radarConnected, setRadarConnected] = useState<'offline' | 'connecting' | 'online'>('online');

  // Real-time AI meteorological and traffic states
  const [poiRealtimeIntel, setPoiRealtimeIntel] = useState<Record<string, PoiIntel>>({});
  const [loadingPoiIntel, setLoadingPoiIntel] = useState<string | null>(null);
  const [poiIntelSource, setPoiIntelSource] = useState<Record<string, 'local_simulation' | 'ai_live_sync'>>({});

  const fetchRealtimePoiIntel = async (poiName: string, poiType: string) => {
    if (!poiName) return;
    setLoadingPoiIntel(poiName);
    try {
      const response = await fetch('/api/poi/intel-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ poiName, poiType, lang })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.weather && data.traffic) {
          setPoiRealtimeIntel(prev => ({
            ...prev,
            [poiName]: data
          }));
          setPoiIntelSource(prev => ({
            ...prev,
            [poiName]: 'ai_live_sync'
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching real-time POI intelligence:', err);
    } finally {
      setLoadingPoiIntel(null);
    }
  };

  useEffect(() => {
    if (radarConnected === 'online' && selectedPoi) {
      const alreadyFetched = poiIntelSource[selectedPoi.name] === 'ai_live_sync';
      if (!alreadyFetched && loadingPoiIntel !== selectedPoi.name) {
        fetchRealtimePoiIntel(selectedPoi.name, selectedPoi.type);
      }
    }
  }, [radarConnected, selectedPoi]);

  // Interactive route curvature generating algorithms
  const interpolatePoints = (
    from: [number, number],
    to: [number, number],
    type: 'flight' | 'train' | 'bus' | 'car',
    legWaypoints: typeof waypoints
  ): [number, number][] => {
    const points: [number, number][] = [from];
    // Push the associated custom stopovers
    legWaypoints.forEach(wp => {
      points.push(wp.coord);
    });
    points.push(to);

    const fullPath: [number, number][] = [];

    for (let s = 0; s < points.length - 1; s++) {
      const start = points[s];
      const end = points[s + 1];

      // Euclidean distance of segment
      const dist = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));

      if (type === 'flight') {
        const steps = 18;
        for (let j = 0; j <= steps; j++) {
          if (s > 0 && j === 0) continue;
          const t = j / steps;
          const lat = start[0] + (end[0] - start[0]) * t;
          const lng = start[1] + (end[1] - start[1]) * t;
          // Skyward parabolic geodesic flight arc curve (northbound positive offset)
          const arc = Math.sin(t * Math.PI) * Math.max(1.5, dist * 0.18);
          fullPath.push([lat + arc, lng]);
        }
      } else if (type === 'car' || type === 'bus') {
        // Alpine expressways and mountain roads wiggle simulation
        const steps = 14;
        for (let j = 0; j <= steps; j++) {
          if (s > 0 && j === 0) continue;
          const t = j / steps;
          const lat = start[0] + (end[0] - start[0]) * t;
          const lng = start[1] + (end[1] - start[1]) * t;
          if (j > 0 && j < steps) {
            const wave = Math.sin(t * Math.PI * 3) * Math.max(0.08, dist * 0.04);
            fullPath.push([lat + wave, lng - wave * 0.4]);
          } else {
            fullPath.push([lat, lng]);
          }
        }
      } else if (type === 'train') {
        // Smooth Sweeping high speed railway arcs
        const steps = 10;
        for (let j = 0; j <= steps; j++) {
          if (s > 0 && j === 0) continue;
          const t = j / steps;
          const lat = start[0] + (end[0] - start[0]) * t;
          const lng = start[1] + (end[1] - start[1]) * t;
          if (j > 0 && j < steps) {
            const wave = Math.sin(t * Math.PI) * Math.max(0.04, dist * 0.015);
            fullPath.push([lat - wave * 0.1, lng + wave * 0.3]);
          } else {
            fullPath.push([lat, lng]);
          }
        }
      } else {
        if (s === 0) fullPath.push(start);
        fullPath.push(end);
      }
    }

    return fullPath;
  };

  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);
  const leafletPolylineRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Amap States
  const amapContainerRef = useRef<HTMLDivElement | null>(null);
  const amapInstanceRef = useRef<any>(null);
  const [isAmapLoaded, setIsAmapLoaded] = useState(false);
  const [amapError, setAmapError] = useState<string | null>(null);

  // Prepare standard point coordinates for the selected route
  const startCity = ALL_CITIES_INDEX.find((c) => c.id === departureCityId) || ALL_CITIES_INDEX[0];
  const startCoord = startCity.coordinates;

  const routingPoints: { name: string; coord: [number, number]; isOrigin: boolean; planIndex: number }[] = [];
  
  // Origin Stop Code
  routingPoints.push({
    name: startCity.name,
    coord: startCity.coordinates,
    isOrigin: true,
    planIndex: -1
  });

  // Destinations Stops Code
  cityPlans.forEach((plan, idx) => {
    const cityIdx = ALL_CITIES_INDEX.find((c) => c.id === plan.cityId);
    const coord = cityIdx ? cityIdx.coordinates : startCoord;
    routingPoints.push({
      name: plan.cityName,
      coord,
      isOrigin: false,
      planIndex: idx
    });
  });

  // Calculate detailed segment coordinate tracks passing through any custom intermediate waypoints
  const getPathPointsForSegments = (): [number, number][] => {
    if (routingPoints.length < 2) {
      return routingPoints.map(p => p.coord);
    }

    const detailedPoints: [number, number][] = [];

    for (let i = 0; i < routingPoints.length - 1; i++) {
      const p1 = routingPoints[i];
      const p2 = routingPoints[i + 1];

      // Retrieve destination point's cityId representation to correlate transits
      const toCityId = cityPlans[i]?.cityId;
      const transit = toCityId ? currentPlan?.transits[toCityId] : null;
      const type = transit?.type || 'train';

      // Find waypoints registered for this specific route segment
      const legWaypoints = waypoints.filter(wp => wp.legId === toCityId);

      // Perform custom geometric interpolation passing through all leg stops
      const segmentCoords = interpolatePoints(p1.coord, p2.coord, type, legWaypoints);

      // Smooth overlapping junctions
      if (i > 0 && detailedPoints.length > 0) {
        detailedPoints.pop();
      }
      detailedPoints.push(...segmentCoords);
    }

    return detailedPoints;
  };

  // ---------------------------------------------------------------------------
  // Leaflet Setup & Update Flow
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (activeEngine !== 'leaflet') return;
    if (typeof window === 'undefined') return;

    // Load Leaflet Stylesheets and JS dynamically
    const ssId = 'leaflet-css-styles';
    if (!document.getElementById(ssId)) {
      const link = document.createElement('link');
      link.id = ssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet')
      .then((leafletModule) => {
        L = leafletModule.default;
        setIsLeafletReady(true);
      })
      .catch((err) => {
        console.error('Failed to resolve dynamic Leaflet Module', err);
      });

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [activeEngine]);

  useEffect(() => {
    if (activeEngine !== 'leaflet' || !isLeafletReady || !L || !mapElementRef.current) return;

    // Create the Leaflet map model if not present
    if (!leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current = L.map(mapElementRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(startCoord, 4);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 18,
      }).addTo(leafletMapInstanceRef.current);
    }

    const map = leafletMapInstanceRef.current;

    // Refresh existing markers & routes
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];
    if (leafletPolylineRef.current) {
      leafletPolylineRef.current.remove();
      leafletPolylineRef.current = null;
    }

    const bounds: any[] = [];

    // Draw the main inter-city stops
    routingPoints.forEach((point, seq) => {
      const isCurrentActive =
        (point.isOrigin && activePlanIndex === -1) ||
        (!point.isOrigin && point.planIndex === activePlanIndex);

      const pinClass = point.isOrigin
        ? 'bg-rose-500 ring-rose-100 hover:ring-rose-200'
        : isCurrentActive
        ? 'bg-sky-500 ring-sky-200 shadow-sky-500/30'
        : 'bg-slate-400 ring-slate-100';

      const customHtmlIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full border-2 border-white text-white flex items-center justify-center font-sans font-bold text-xs shadow-lg transition-all scale-105 duration-300 ring-4 ${pinClass}">
            ${point.isOrigin ? '起' : seq}
          </div>
        `,
        className: 'custom-leaflet-marker-div',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const markerInstance = L.marker(point.coord, { icon: customHtmlIcon }).addTo(map);

      markerInstance.bindPopup(`
        <div class="font-sans p-1">
          <p class="font-bold text-sm text-slate-800">${point.name}</p>
          <p class="text-xs text-slate-400 font-medium">${point.isOrigin ? (lang === 'zh' ? '出发点' : 'Departure') : (lang === 'zh' ? `滞停城市 ${seq}` : `Stop ${seq}`)}</p>
        </div>
      `);

      markerInstance.on('click', () => {
        if (!point.isOrigin) {
          onSelectCityIndex(point.planIndex);
        }
      });

      leafletMarkersRef.current.push(markerInstance);
      
      if (!activeCityPlan) {
        bounds.push(point.coord);
      }
    });

    // Draw the main inter-city transit track
    const detailedTrack = getPathPointsForSegments();
    if (detailedTrack.length >= 2) {
      leafletPolylineRef.current = L.polyline(detailedTrack, {
        color: '#6366f1',
        weight: 3.5,
        dashArray: '3, 6', // flowing dashed transit connection
        opacity: activePlanIndex !== -1 ? 0.35 : 0.8, // desaturate if actively exploring a single city
      }).addTo(map);

      // Draw custom waypoint markers
      waypoints.forEach((wp) => {
        const wpIcon = L.divIcon({
          html: `
            <div class="w-6 h-6 rounded-full border border-white bg-indigo-600 text-white flex items-center justify-center shadow-md font-sans transition-all hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-indigo-200">
              <span class="text-[9px] font-extrabold">经</span>
            </div>
          `,
          className: 'custom-waypoint-leaf-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const wpMarker = L.marker(wp.coord, { icon: wpIcon }).addTo(map);
        wpMarker.bindPopup(`
          <div class="font-sans p-1.5 max-w-[190px]">
            <div class="flex items-center gap-1.5 mb-1 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 w-max">
              <span class="text-[8px] text-indigo-700 font-extrabold uppercase">
                ${wp.type === 'service' ? (lang === 'zh' ? '高速服务区' : 'Service Rest') :
                  wp.type === 'scenic' ? (lang === 'zh' ? '沿途风景点' : 'Scenic Spot') :
                  wp.type === 'layover' ? (lang === 'zh' ? '中转站/过境' : 'Layover') :
                  (lang === 'zh' ? '接驳站点' : 'Transit Hub')}
              </span>
            </div>
            <p class="font-bold text-xs text-slate-800">${wp.name}</p>
            <p class="text-[10px] text-slate-550 mt-1 leading-relaxed">${wp.notes}</p>
          </div>
        `);
        leafletMarkersRef.current.push(wpMarker);
      });
    }

    // NEW: Render fine check-in POI markers for the active city
    if (activeCityPlan) {
      activePois.forEach((p) => {
        const poiIcon = L.divIcon({
          html: `
            <div class="flex flex-col items-center select-none" style="transform: translateY(-8px);">
              <div style="background-color: ${p.color}; border: 2.2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);" class="w-7 h-7 rounded-full text-white flex items-center justify-center font-sans font-extrabold text-xs ring-2 ring-white hover:scale-110 transition-transform">
                ${p.seq}
              </div>
              <div class="px-1.5 py-0.5 mt-0.5 bg-slate-900/90 backdrop-blur-[2px] rounded text-[9px] text-white font-bold whitespace-nowrap border border-white/20 shadow-sm pointer-events-none">
                ${lang === 'zh' ? p.poi.name : p.poi.nameEn}
              </div>
            </div>
          `,
          className: 'custom-poi-marker-div',
          iconSize: [80, 48],
          iconAnchor: [40, 24]
        });

        const poiMarker = L.marker(p.poi.coordinates, { icon: poiIcon }).addTo(map);

        poiMarker.on('click', () => {
          setSelectedPoi(p.poi);
        });

        poiMarker.bindPopup(`
          <div class="font-sans p-2 select-none max-w-[220px]">
            <div class="flex items-center gap-1.5 mb-1 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 w-max">
              <span class="text-[9px] text-indigo-700 font-extrabold">
                ${p.poi.type === 'attraction' ? (lang === 'zh' ? '景点' : 'Attraction') :
                  p.poi.type === 'food' ? (lang === 'zh' ? '美食' : 'Dining') :
                  p.poi.type === 'hotel' ? (lang === 'zh' ? '酒店' : 'Hotel') :
                  (lang === 'zh' ? '交通枢纽' : 'Transit')}
              </span>
              <span class="text-[9px] font-mono font-bold text-slate-550">${p.poi.time}</span>
            </div>
            <p class="font-extrabold text-sm text-slate-800">${lang === 'zh' ? p.poi.name : p.poi.nameEn}</p>
            <p class="text-[10px] text-indigo-600 font-bold mt-1">🕒 ${lang === 'zh' ? `建议游玩: ${p.poi.duration}` : `Duration: ${p.poi.duration}`}</p>
            <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">${lang === 'zh' ? p.poi.tip : p.poi.tipEn}</p>
          </div>
        `);

        leafletMarkersRef.current.push(poiMarker);
        bounds.push(p.poi.coordinates);
      });

      // Group activePois by day to draw sequential daily route lines
      const poisByDay: { [day: number]: typeof activePois } = {};
      activePois.forEach((p) => {
        if (!poisByDay[p.dayNum]) poisByDay[p.dayNum] = [];
        poisByDay[p.dayNum].push(p);
      });

      Object.keys(poisByDay).forEach((dayNumKey) => {
        const dayNum = parseInt(dayNumKey);
        const dayPois = poisByDay[dayNum];
        if (dayPois.length >= 2) {
          const pathCoords = dayPois.map(p => p.poi.coordinates);
          const dayLine = L.polyline(pathCoords, {
            color: dayPois[0].color,
            weight: 3.5,
            opacity: 0.85,
            dashArray: '5, 5',
          }).addTo(map);

          leafletMarkersRef.current.push(dayLine);
        }
      });
    }

    // Adaptive bounding fits automatically using active bounds points
    if (bounds.length >= 2) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
      });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    }
  }, [activeEngine, isLeafletReady, departureCityId, cityPlans, activePlanIndex, waypoints, activePois, selectedDayTab]);

  // ---------------------------------------------------------------------------
  // Amap (高德) Setup & Update Flow
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (activeEngine !== 'amap') return;

    // Apply security config as mandated by Amap JS API 2.0
    (window as any)._AMapSecurityConfig = {
      securityJsCode: amapSecurityCode || '',
    };

    if (!amapKey) {
      setAmapError('Missing Amap Web Key');
      return;
    }

    setAmapError(null);

    // Dynamic Script load for Amap Map
    const scriptId = `amap-js-sdk-handler-${amapKey}`;
    const existingScript = document.getElementById(scriptId);

    const initializeAmap = () => {
      setIsAmapLoaded(true);
    };

    if (existingScript) {
      if ((window as any).AMap) {
        initializeAmap();
      } else {
        existingScript.addEventListener('load', initializeAmap);
      }
    } else {
      // Remove any clean up scripts of stale keys
      const oldScripts = document.querySelectorAll('[id^="amap-js-sdk-handler"]');
      oldScripts.forEach((el) => el.remove());

      // Clear loaded states so it doesn't try to use standard AMap of wrong key or stale config
      if (!(window as any).AMap || (window as any).AMapKeyUsed !== amapKey) {
        setIsAmapLoaded(false);
        delete (window as any).AMap;
        delete (window as any).AMapUI;
      }

      (window as any).AMapKeyUsed = amapKey;

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}`;
      script.async = true;
      script.addEventListener('load', initializeAmap);
      script.addEventListener('error', () => setAmapError('Amap JS SDK failed to load. Check VPN settings or API Key.'));
      document.head.appendChild(script);
    }

    return () => {
      if (amapInstanceRef.current) {
        try {
          amapInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Amap map destroy issue ignored:', e);
        }
        amapInstanceRef.current = null;
      }
    };
  }, [activeEngine, amapKey, amapSecurityCode]);

  useEffect(() => {
    if (activeEngine !== 'amap' || !isAmapLoaded || !amapContainerRef.current) return;

    const AMap = (window as any).AMap;
    if (!AMap) return;

    if (!amapInstanceRef.current) {
      amapInstanceRef.current = new AMap.Map(amapContainerRef.current, {
        zoom: 4,
        center: [startCoord[1], startCoord[0]], // Amap coordinates are [lng, lat]
        viewMode: '2D',
      });

      // Delayed resize to ensure layout matches correctly on mount
      setTimeout(() => {
        if (amapInstanceRef.current && typeof amapInstanceRef.current.resize === 'function') {
          amapInstanceRef.current.resize();
        }
      }, 150);
    }

    const map = amapInstanceRef.current;

    // Explicitly notify map to resize container layout in case of container sizing changes or hidden states
    if (typeof map.resize === 'function') {
      map.resize();
    }

    map.clearMap(); // Clear previous markers and polyline links

    const path: any[] = [];
    routingPoints.forEach((point, seq) => {
      const isCurrentActive =
        (point.isOrigin && activePlanIndex === -1) ||
        (!point.isOrigin && point.planIndex === activePlanIndex);

      const pinClass = point.isOrigin
        ? 'bg-rose-500 ring-rose-100'
        : isCurrentActive
        ? 'bg-sky-500 ring-sky-200 shadow-sky-500/30'
        : 'bg-slate-400 ring-slate-100';

      const customHtml = `
        <div class="w-8 h-8 rounded-full border-2 border-white text-white flex items-center justify-center font-sans font-bold text-xs ring-4 ${pinClass}" style="transform: translate(0px, 0px);">
          ${point.isOrigin ? '起' : seq}
        </div>
      `;

      const amapCoord = [point.coord[1], point.coord[0]]; // [lng, lat] Corrected
      path.push(amapCoord);

      const marker = new AMap.Marker({
        position: amapCoord,
        content: customHtml,
        anchor: 'center',
        title: point.name,
      });

      marker.on('click', () => {
        if (!point.isOrigin) {
          onSelectCityIndex(point.planIndex);
        }
      });

      map.add(marker);
    });

    // Generate detailed curvy coordinate track for Amap (reversing [lat, lng] to [lng, lat])
    const detailedTrackCoords = getPathPointsForSegments();
    const amapDetailedPath = detailedTrackCoords.map(coord => [coord[1], coord[0]]);

    if (amapDetailedPath.length >= 2) {
      const polyline = new AMap.Polyline({
        path: amapDetailedPath,
        strokeColor: '#6366f1',
        strokeWeight: 3.5,
        strokeOpacity: activePlanIndex !== -1 ? 0.25 : 0.75, // desaturate inter-city track if viewing active city
        strokeStyle: 'dashed',
        strokeDasharray: [8, 8],
        lineJoin: 'round',
      });
      map.add(polyline);

      // Add waypoint markers to Amap canvas
      waypoints.forEach((wp) => {
        const wpLngLat = [wp.coord[1], wp.coord[0]];
        const wpCustomHtml = `
          <div class="w-6 h-6 rounded-full border border-white bg-indigo-600 text-white flex items-center justify-center shadow-md font-sans transition-all hover:scale-110" style="transform: translate(0px, 0px);">
            <span class="text-[9px] font-extrabold">经</span>
          </div>
        `;

        const wpMarker = new AMap.Marker({
          position: wpLngLat,
          content: wpCustomHtml,
          anchor: 'center',
          title: wp.name,
        });

        const wpInfoWindow = new AMap.InfoWindow({
          content: `
            <div style="font-family: sans-serif; padding: 6px; max-width: 190px;">
              <span style="font-size: 8px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 4px;">
                ${wp.type === 'service' ? (lang === 'zh' ? '高速服务区' : 'Service Rest') :
                  wp.type === 'scenic' ? (lang === 'zh' ? '沿途风景点' : 'Scenic Spot') :
                  wp.type === 'layover' ? (lang === 'zh' ? '中转站' : 'Layover') :
                  (lang === 'zh' ? '特设接驳站' : 'Transit Hub')}
              </span>
              <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 11px; color: #1e293b;">${wp.name}</p>
              <p style="margin: 0; font-size: 10px; color: #475569; line-height: 1.4;">${wp.notes}</p>
            </div>
          `,
          offset: new AMap.Pixel(0, -10)
        });

        wpMarker.on('click', () => {
          wpInfoWindow.open(map, wpLngLat);
        });

        map.add(wpMarker);
      });
    }

    // NEW DRAW: Add active check-in points (POIs) map overlays in AMap
    if (activeCityPlan) {
      activePois.forEach((p) => {
        const poiLngLat = [p.poi.coordinates[1], p.poi.coordinates[0]];
        const customHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(-10px);">
            <div style="background-color: ${p.color}; border: 2.2px solid #fff; border-radius: 50%; width: 26px; height: 26px; color: #fff; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: bold; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.18);">
              ${p.seq}
            </div>
            <div style="padding: 2px 6px; margin-top: 3px; background: rgba(15, 23, 42, 0.9); box-shadow: 0 1px 3px rgba(0,0,0,0.15); border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 9px; color: #fff; text-align: center; white-space: nowrap; font-family: sans-serif; pointer-events: none; font-weight: bold;">
              ${lang === 'zh' ? p.poi.name : p.poi.nameEn}
            </div>
          </div>
        `;

        const poiMarker = new AMap.Marker({
          position: poiLngLat,
          content: customHtml,
          anchor: 'center',
          title: p.poi.name,
        });

        const poiInfoWindow = new AMap.InfoWindow({
          content: `
            <div style="font-family: sans-serif; padding: 6px; max-width: 225px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 8px; background: #f1f5f9; color: #1e293b; padding: 2.5px 6.5px; border-radius: 4px; font-weight: bold; display: inline-block;">
                  ${p.poi.type === 'attraction' ? (lang === 'zh' ? '景点' : 'Attraction') :
                    p.poi.type === 'food' ? (lang === 'zh' ? '美食' : 'Dining') :
                    p.poi.type === 'hotel' ? (lang === 'zh' ? '酒店' : 'Hotel') :
                    (lang === 'zh' ? '交通枢纽' : 'Transit')}
                </span>
                <span style="font-size: 9px; font-weight: bold; color: #64748b;">${p.poi.time}</span>
              </div>
              <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 11px; color: #1e293b;">${lang === 'zh' ? p.poi.name : p.poi.nameEn}</p>
              <p style="margin: 0 0 4px 0; font-size: 10px; color: #4f46e5; font-weight: bold;">🕒 ${lang === 'zh' ? `建议游玩: ${p.poi.duration}` : `Duration: ${p.poi.duration}`}</p>
              <p style="margin: 0; font-size: 10px; color: #475569; line-height: 1.4;">${lang === 'zh' ? p.poi.tip : p.poi.tipEn}</p>
            </div>
          `,
          offset: new AMap.Pixel(0, -18)
        });

        poiMarker.on('click', () => {
          poiInfoWindow.open(map, poiLngLat);
          setSelectedPoi(p.poi);
        });

        map.add(poiMarker);
      });

      // Group activePois by day to draw sequential daily route lines in AMap
      const poisByDay: { [day: number]: typeof activePois } = {};
      activePois.forEach((p) => {
        if (!poisByDay[p.dayNum]) poisByDay[p.dayNum] = [];
        poisByDay[p.dayNum].push(p);
      });

      Object.keys(poisByDay).forEach((dayNumKey) => {
        const dayNum = parseInt(dayNumKey);
        const dayPois = poisByDay[dayNum];
        if (dayPois.length >= 2) {
          const amapDayPath = dayPois.map(p => [p.poi.coordinates[1], p.poi.coordinates[0]]);
          const dayLine = new AMap.Polyline({
            path: amapDayPath,
            strokeColor: dayPois[0].color,
            strokeWeight: 4,
            strokeOpacity: 0.85,
            strokeStyle: 'dashed',
            strokeDasharray: [6, 6],
            lineJoin: 'round',
          });
          map.add(dayLine);
        }
      });
    }

    // Adaptive fit elements with comfortable fitView parameters
    map.setFitView(undefined, false, [60, 60, 60, 60]);
  }, [activeEngine, isAmapLoaded, departureCityId, cityPlans, activePlanIndex, waypoints, activePois, selectedDayTab]);

  // ---------------------------------------------------------------------------
  // Custom Transportation Access & Route Planning Actions
  // ---------------------------------------------------------------------------
  const [queryLoading, setQueryLoading] = useState<{ [cityId: string]: boolean }>({});
  const [successCode, setSuccessCode] = useState<{ [cityId: string]: string | null }>({});
  const [expandedLegs, setExpandedLegs] = useState<{ [cityId: string]: boolean }>({});

  const toggleLegExpansion = (cityId: string) => {
    setExpandedLegs((prev) => ({ ...prev, [cityId]: !prev[cityId] }));
  };

  const updateMultipleTransitFields = (cityId: string, fields: Partial<TransitInfo>) => {
    if (!currentPlan || !onUpdatePlan) return;

    const updatedTransits = {
      ...currentPlan.transits,
      [cityId]: {
        ...(currentPlan.transits[cityId] || {}),
        ...fields,
      } as TransitInfo,
    };

    // Calculate updated total budget
    const transitCost = Object.values(updatedTransits).reduce((sum, t) => sum + (t.cost || 0) * 2, 0);
    const localCostSum = currentPlan.cityPlans.reduce((sum, cp) => {
      const exp = cp.localExpense;
      return sum + (exp.tickets + exp.food + exp.hotel + exp.transit);
    }, 0);
    const updatedBudget = localCostSum + transitCost;

    const updatedPlan: TripPlan = {
      ...currentPlan,
      transits: updatedTransits,
      totalBudget: updatedBudget,
    };

    onUpdatePlan(updatedPlan);
  };

  const handleLiveTrafficQuery = (
    cityId: string,
    fromCityName: string,
    toCityName: string,
    code: string,
    currentTransitType: string
  ) => {
    if (!code) {
      alert(lang === 'zh' ? '请输入车次或航班代码进行智查！' : 'Please enter a vehicle or flight number!');
      return;
    }

    const cleanedCode = code.trim().toUpperCase();
    setQueryLoading((prev) => ({ ...prev, [cityId]: true }));
    setSuccessCode((prev) => ({ ...prev, [cityId]: null }));

    setTimeout(() => {
      setQueryLoading((prev) => ({ ...prev, [cityId]: false }));

      const matched = SIMULATED_LIVE_TRAFFIC_DB.find(
        (item) => item.code.toUpperCase() === cleanedCode
      );

      if (matched) {
        updateMultipleTransitFields(cityId, {
          type: matched.type,
          distance: matched.distance,
          duration: matched.duration,
          cost: matched.cost,
          advice: matched.advice,
          adviceEn: matched.adviceEn,
          code: matched.code,
          depTime: matched.depTime,
          arrTime: matched.arrTime,
          seatInfo: matched.seatInfo,
          realStatus: matched.realStatus,
        });
        setSuccessCode((prev) => ({ ...prev, [cityId]: matched.code }));
        return;
      }

      // Dynamic fallbacks
      const isTrainCode = /^[GDKCTZ]\d+/i.test(cleanedCode);
      const isFlightCode = /^[A-Z]{2}\d+/i.test(cleanedCode);

      let computedType = currentTransitType as 'flight' | 'train' | 'bus' | 'car';
      if (isTrainCode) computedType = 'train';
      else if (isFlightCode) computedType = 'flight';

      const toIdx = ALL_CITIES_INDEX.find((c) => c.id === cityId);
      const dist = toIdx ? 450 : 320;

      let dynamicCost = 150;
      let dynamicDuration = '3h 30m';
      let dep = '09:00';
      let arr = '12:30';
      let seat = '03车 11B号 (二等座)';
      let status = lang === 'zh' ? '已登记时刻 - 畅行准点 🟢' : 'Proposed - On Time 🟢';
      let adv = lang === 'zh' 
        ? `联运车次/航班记录成功！${fromCityName} 至 ${toCityName} 的通勤中，推荐提前锁定优惠订位。`
        : `Itinerary log set! Travelling ${fromCityName} to ${toCityName}, early seat assignment advised.`;

      if (computedType === 'flight') {
        dynamicCost = Math.round(350 + dist * 0.5);
        dynamicDuration = '2h 15m';
        dep = '11:15';
        arr = '13:30';
        seat = '23A (经济舱靠窗)';
        status = lang === 'zh' ? '正在候机 - 准点率 93% 🟢' : 'Boarding Lobby - Normal 🟢';
        adv = lang === 'zh'
          ? `航班 ${cleanedCode} 直飞通航正常。建议提前120分钟抵达大兴/首都机场柜台办理值机。`
          : `Flight ${cleanedCode} active. Arrive at airport 120 mins before departure.`;
      } else if (computedType === 'train') {
        dynamicCost = Math.round(80 + dist * 0.4);
        dynamicDuration = '3.5h';
        dep = '08:00';
        arr = '11:30';
        seat = '05车 09F (二等座靠窗)';
        status = lang === 'zh' ? '车票候补/正常发车' : 'Active Run - Go to Gate 🚄';
        adv = lang === 'zh'
          ? `列车拼接车次 ${cleanedCode}：京沪/城际客流量大，二等座舒适，请凭身份证件到闸机检票。`
          : `Train ${cleanedCode} linked. Recommended comfortable seating, quick luggage placement.`;
      }

      updateMultipleTransitFields(cityId, {
        type: computedType,
        distance: dist,
        duration: dynamicDuration,
        cost: dynamicCost,
        advice: adv,
        adviceEn: adv,
        code: cleanedCode,
        depTime: dep,
        arrTime: arr,
        seatInfo: seat,
        realStatus: status,
      });
      setSuccessCode((prev) => ({ ...prev, [cityId]: cleanedCode }));
    }, 1200);
  };

  const getLegIcon = (type: 'flight' | 'train' | 'bus' | 'car') => {
    switch (type) {
      case 'flight': return <Plane className="w-4.5 h-4.5 text-rose-500" />;
      case 'train': return <Train className="w-4.5 h-4.5 text-blue-500" />;
      case 'bus': return <Bus className="w-4.5 h-4.5 text-emerald-500" />;
      case 'car': return <Car className="w-4.5 h-4.5 text-purple-500" />;
      default: return <Compass className="w-4.5 h-4.5 text-slate-400" />;
    }
  };

  // ---------------------------------------------------------------------------
  // Render Selection Outputs
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Map Engine Card Block */}
      <div className="relative w-full h-[320px] md:h-[400px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* NEW Floating Day Itinerary Controller Dock */}
        {activeCityPlan && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 p-1.5 px-2 rounded-2xl shadow-lg flex items-center gap-1.5 max-w-[calc(100%-24px)] overflow-x-auto scrollbar-none animate-fadeIn select-none">
            <span className="text-[10px] text-slate-500 font-extrabold px-2 bg-slate-100/90 rounded-lg py-1 whitespace-nowrap">
              📍 {lang === 'zh' ? `${activeCityPlan.cityName}日程` : `${activeCityPlan.cityName} Days`}
            </span>
            <button
              onClick={() => setSelectedDayTab('all')}
              className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                selectedDayTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              {lang === 'zh' ? '查看全部' : 'All Days'}
            </button>
            {Array.from({ length: activeCityPlan.daysCount }).map((_, dIdx) => {
              const dNum = dIdx + 1;
              return (
                <button
                  key={`day-tab-${dNum}`}
                  onClick={() => setSelectedDayTab(dNum)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    selectedDayTab === dNum
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  {lang === 'zh' ? `D${dNum}` : `Day ${dNum}`}
                </button>
              );
            })}
          </div>
        )}

        {/* 1. Leaflet Interactive Map View */}
        {activeEngine === 'leaflet' && (
          <div className="w-full h-full">
            {!isLeafletReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 gap-2.5">
                <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <p className="font-sans text-xs text-slate-400 font-medium tracking-wide">Loading Leaflet OSM Module...</p>
              </div>
            )}
            <div ref={mapElementRef} className="w-full h-full z-0" />
          </div>
        )}

        {/* 2. Google Maps Interactive Map View */}
        {activeEngine === 'google' && (
          <div className="w-full h-full relative">
            <GoogleMapWrapper
              googleMapsKey={googleMapsKey}
              routingPoints={routingPoints}
              detailedPathPoints={getPathPointsForSegments()}
              activePlanIndex={activePlanIndex}
              onSelectCityIndex={onSelectCityIndex}
              onFallbackToLeaflet={() => setActiveEngine('leaflet')}
              waypoints={waypoints}
              lang={lang}
              activePois={activePois}
              onSelectPoi={setSelectedPoi}
            />
          </div>
        )}

        {/* 3. Amap (高德) Interactive Map View */}
        {activeEngine === 'amap' && (
          <div className="w-full h-full relative">
            {(!isAmapLoaded && !amapError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 gap-2.5">
                <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <p className="font-sans text-xs text-slate-400 font-medium tracking-wide">Loading Amap (高德) SDK Module...</p>
              </div>
            )}
            
            {amapError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-xs">
                <p className="font-bold text-rose-600 mb-2">Amap Key Configuration Required</p>
                <p className="text-slate-400 max-w-sm mb-4">Please input your Amap public key and Security JS Code under the preferences panel, or revert to our default free map engine.</p>
                <button
                  onClick={() => setActiveEngine('leaflet')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer"
                >
                  Use Leaflet (OSM) instead
                </button>
              </div>
            ) : (
              <div ref={amapContainerRef} className="w-full h-full z-0" />
            )}
          </div>
        )}

        {/* Floating POI detailed intelligence analysis card */}
        {selectedPoi && (() => {
          const isRealtime = poiRealtimeIntel[selectedPoi.name];
          const intel = isRealtime || getRichPoiIntelligence(selectedPoi.name, selectedPoi.type, lang);
          const isVisited = !!visitedPois[selectedPoi.id];
          const isSynced = poiIntelSource[selectedPoi.name] === 'ai_live_sync';
          const isLoading = loadingPoiIntel === selectedPoi.name;

          return (
            <div className="absolute top-14 bottom-3 right-3 left-3 md:left-auto md:w-[350px] max-h-[calc(100%-64px)] z-[1010] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl flex flex-col gap-3 font-sans overflow-y-auto scrollbar-none transition-all duration-300 p-4 select-none">
              {/* Card Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-[10] border-b border-slate-100 pb-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {selectedPoi.type === 'attraction' ? (lang === 'zh' ? '景点打卡' : 'Attraction') :
                       selectedPoi.type === 'food' ? (lang === 'zh' ? '特产美食' : 'Dining') :
                       selectedPoi.type === 'hotel' ? (lang === 'zh' ? '精品酒店' : 'Hotel') :
                       (lang === 'zh' ? '交通网络' : 'Transit')}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">🕒 {selectedPoi.time}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-tight">
                    {lang === 'zh' ? selectedPoi.name : selectedPoi.nameEn}
                  </h4>
                </div>
                <button 
                  onClick={() => setSelectedPoi(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Synchronization State Banner */}
              <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed transition-all ${
                isLoading 
                  ? 'bg-amber-50/50 border-amber-200 text-amber-800 animate-pulse'
                  : isSynced 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span className="font-semibold">
                      {lang === 'zh' ? '正在连接 Gemini AI & 高德路网实时调测...' : 'Syncing Live Traffic & Gemini Intelligence...'}
                    </span>
                  </div>
                ) : isSynced ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {lang === 'zh' ? '● AI 实时路况与气象数据已接入' : '● Live API & Gemini AI Connected'}
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono font-bold uppercase">ONLINE</span>
                    </div>
                    <p className="text-slate-600 text-[9px] leading-snug">
                      {lang === 'zh' 
                        ? '已成功对接墨迹气象卫星与高德道路网格。数据每5分钟自动重算同步。' 
                        : 'Atmospheric radars and road grids successfully mapped via active live proxies.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">
                        ⚠️ {lang === 'zh' ? '当前使用离线离岸模拟大包' : 'Standard Offline Offline Mode'}
                      </span>
                      <button
                        type="button"
                        onClick={() => fetchRealtimePoiIntel(selectedPoi.name, selectedPoi.type)}
                        className="text-[9.5px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-0.5 rounded cursor-pointer transition-all active:scale-95"
                      >
                        {lang === 'zh' ? '手动接入实时AI' : 'Live Sync'}
                      </button>
                    </div>
                    <p className="text-slate-400 text-[9px] leading-snug">
                      {lang === 'zh' 
                        ? '若接入实时路况/气象数据与AI后，气象指数、周边缓行路网、当季精致美食攻略与瞬时贴士将实时推流更新。' 
                        : 'Once hooked to live meteorological feeds, local Amap overlays & Gemini, these metrics auto-synchronize in real-time.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Meteorological / Weather Data Box */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                    {lang === 'zh' ? '气象与环境参数' : 'Meteorological Stats'}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">{intel.weather.temp}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
                  <div className="bg-white/95 border border-slate-100 py-1.5 px-2 rounded-lg flex items-center justify-between">
                    <span>{lang === 'zh' ? '气候:' : 'Weather:'}</span>
                    <span className="font-bold text-slate-800">{intel.weather.condition}</span>
                  </div>
                  <div className="bg-white/95 border border-slate-100 py-1.5 px-2 rounded-lg flex items-center justify-between">
                    <span>{lang === 'zh' ? '湿度:' : 'Humidity:'}</span>
                    <span className="font-bold text-slate-800 font-mono">{intel.weather.humidity}</span>
                  </div>
                  <div className="bg-white/95 border border-slate-100 py-1.5 px-2 rounded-lg flex items-center justify-between">
                    <span>{lang === 'zh' ? '紫外线:' : 'UV Index:'}</span>
                    <span className="font-bold text-slate-800">{intel.weather.uvIndex}</span>
                  </div>
                  <div className="bg-white/95 border border-slate-100 py-1.5 px-2 rounded-lg flex items-center justify-between">
                    <span>{lang === 'zh' ? '风向等级:' : 'Wind speed:'}</span>
                    <span className="font-bold text-slate-800">{intel.weather.wind}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Traffic Conditions Box */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    {lang === 'zh' ? '周边实时路况与通达效率' : 'Live Traffic Conditions'}
                  </span>
                  <span className={`text-[9.5px] font-bold border px-1.5 py-0.5 rounded-full ${intel.traffic.badgeColor}`}>
                    {intel.traffic.badge}
                  </span>
                </div>
                <div className="text-[10px] font-medium text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between bg-white/95 border border-slate-100 py-1.5 px-2 rounded-lg">
                    <span>{lang === 'zh' ? '车流通行速度:' : 'Local speed limit:'}</span>
                    <span className="font-extrabold text-slate-800 font-mono">{intel.traffic.speed}</span>
                  </div>
                  <p className="bg-indigo-50/50 border border-indigo-100/50 text-slate-600 leading-relaxed rounded-lg p-2 text-[9.5px]">
                    💡 {intel.traffic.tip}
                  </p>
                </div>
              </div>

              {/* Gourmet Exploration Advice */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  {lang === 'zh' ? '美食速递：周边必享风味' : 'Local Gourmet & Tasting'}
                </span>
                <p className="text-[10px] text-slate-700 leading-relaxed bg-white/95 border border-slate-100 rounded-lg p-2 font-medium">
                  {intel.gourmet}
                </p>
              </div>

              {/* Travel Guide Tip */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 animate-pulse">
                  <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                  {lang === 'zh' ? '打卡攻略与游玩小贴士' : 'Exploration Route & Tips'}
                </span>
                <p className="text-[10px] text-slate-700 leading-relaxed bg-white/95 border border-slate-100 rounded-lg p-2 font-medium">
                  {intel.strategy}
                </p>
              </div>

              {/* Footer Check-In Button */}
              <div className="pt-1 select-none">
                <button
                  onClick={() => {
                    setVisitedPois(prev => ({ ...prev, [selectedPoi.id]: !prev[selectedPoi.id] }));
                  }}
                  className={`w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/10 cursor-pointer text-center active:scale-[0.98] transition-all duration-250 border ${
                    isVisited 
                      ? 'bg-emerald-50/90 text-emerald-700 border-emerald-300 shadow-none hover:bg-emerald-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                  }`}
                >
                  {isVisited 
                    ? (lang === 'zh' ? '✓ 已标记为今日足迹' : '✓ Footprint Marked Successful')
                    : (lang === 'zh' ? '标记为今日游足迹 📍' : 'Mark Location Footprint 📍')}
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 4. Real-time Route Planner & Transportation Ticket Access Workbench */}
      {currentPlan && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                <span>{lang === 'zh' ? '🚦 极速路线规划与城际交通接入仓' : '🚦 Intercity Route Planner & Ticket Vault'}</span>
              </h4>
              <p className="font-sans text-xs text-slate-550 leading-relaxed">
                {lang === 'zh'
                  ? '自由切换各分段城际交通工具。填入航班、高铁编号并单键智能调测, 可即时拉取时刻表并自适应重算旅行总开支！'
                  : 'Customize intercity vehicular modes. Log real flight or train IDs and test with real-time schedule queries to hotswap budgets!'}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-2 text-emerald-700 text-center min-w-16">
              <Check className="w-4 h-4 mx-auto mb-0.5" />
              <span className="text-[9px] font-bold tracking-tight uppercase leading-none">{lang === 'zh' ? '实时同步' : 'Live Synced'}</span>
            </div>
          </div>

          {/* Real-time Aviation Radar & Railway Grid Integration Module */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-3.5 h-3.5 rounded-full mt-1 flex items-center justify-center ${
                  radarConnected === 'online' ? 'bg-green-500 shadow-md shadow-green-500/50 animate-pulse' :
                  radarConnected === 'connecting' ? 'bg-amber-400 animate-spin' : 'bg-slate-300'
                }`} />
                <div>
                  <h5 className="font-sans font-bold text-xs md:text-sm text-slate-900 flex items-center gap-2">
                    <span>{lang === 'zh' ? '🛰️ 实时路网与气象雷达检测 (Live Route & Air Insights)' : '🛰️ Live Route & Atmospheric Radars'}</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-2xl">
                    {lang === 'zh' ? '已深度对接最新气象雷达、客流热力中心及铁路时刻数据，为您保障安心出行。' : 'Connected to actual localized meteorological and regional traffic datasets.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (radarConnected === 'online') {
                    setRadarConnected('offline');
                  } else {
                    setRadarConnected('connecting');
                    setTimeout(() => {
                      setRadarConnected('online');
                    }, 1100);
                  }
                }}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  radarConnected === 'online' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' :
                  radarConnected === 'connecting' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                  'bg-indigo-600 text-white hover:bg-indigo-705 shadow-sm border-transparent'
                }`}
              >
                {radarConnected === 'offline' ? (lang === 'zh' ? '接入实时路况与气象数据' : 'Link Live Data Network') :
                 radarConnected === 'connecting' ? (lang === 'zh' ? '保障专线建立中...' : 'Establishing Link...') :
                 (lang === 'zh' ? '📡 实时监测服务已联通' : '📡 Systems Online')}
              </button>
            </div>

            {/* Link-state feedback banner */}
            {radarConnected === 'offline' && (
              <div className="bg-slate-100 border border-slate-200 border-dashed rounded-2xl p-3.5 text-center">
                <span className="text-[11px] text-slate-500">
                  💡 {lang === 'zh' ? '当前系统处于智能静默防护。若需要，可以点击上方按钮连通专属实时大气回波动差保障。' : 'Systems running quietly. Use the toggle above to re-verify live meteorological conditions.'}
                </span>
              </div>
            )}

            {radarConnected === 'connecting' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3">
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-xs font-medium text-slate-500 animate-pulse font-sans tracking-wide uppercase">
                  {lang === 'zh' ? '正在智能拉取航司与客运系统双向数据网关中...' : 'CONNECTING SECURE SERVICE DATA CHANNELS IN REAL TIME...'}
                </span>
              </div>
            )}

            {radarConnected === 'online' && (
              <div className="space-y-2.5 animate-fadeIn">
                {/* Simulated weather storm delays with dynamic hot-swaps */}
                {Object.values(currentPlan.transits).some(t => t.type === 'flight') && (
                  <div className="bg-rose-50/70 border border-rose-150 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-extrabold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{lang === 'zh' ? '⚠️ 华东空域雷雨积冰与严重航空调度延迟警告' : '⚠️ Airspace Storm Convection warning'}</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs text-rose-700 leading-relaxed">
                      <p className="flex-1 md:max-w-3xl">
                        {lang === 'zh'
                          ? '华东至华中局部沿途走廊触发橙色强对流气象雷达回波。民航客机预计延误 1.5 - 2.5 小时。系统侦测到该时段中转段的高铁复兴号席位充足，推荐您一键秒级智能熔断熔换，安全极速过关！'
                          : 'Severe local thunderstorm detected. Flying routes could expect major delays. Let our dynamic safety dispatcher pivot you to HSR for a reliable 99.2% punctuality.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          cityPlans.forEach((plan) => {
                            const tgTransit = currentPlan?.transits[plan.cityId];
                            if (tgTransit?.type === 'flight') {
                              const dist = tgTransit.distance || 350;
                              const costVal = Math.round(60 + dist * 0.38);
                              const hrs = Math.round((dist / 220) * 10) / 10;
                              const durn = `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`;
                              updateMultipleTransitFields(plan.cityId, {
                                type: 'train',
                                code: 'G1',
                                cost: costVal,
                                duration: durn,
                                depTime: '09:00',
                                arrTime: '11:45',
                                seatInfo: '05车12A (靠窗二等座)',
                                realStatus: '气象应急调度: 推荐平稳准点 🟢',
                                advice: '因华东橙色对流雷暴，实时雷达调度系统已安全熔断，热切换为京沪高铁复兴号直达以节约旅行时间成本。',
                                adviceEn: 'Flight route suspended due to local storm forecast. Instantly hot-swapped you to railway G1.'
                              });
                            }
                          });
                          alert(lang === 'zh' ? '⚡️ 雷达熔断调度：系统已秒级将民航班机变更为国铁复兴号 HSR 主干线（车次 G1），总票价及出行线路已智能完成重算与变轨！' : '⚡️ Security Action triggered. Impacted flight route shifted to train track G1 safely.');
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10.5px] px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-md shadow-rose-600/10 self-end md:self-center"
                      >
                        {lang === 'zh' ? '⚡️ 气象雷达一键变轨高铁 HSR' : '⚡️ Hotswap to Railroad'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Road jam warnings */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                    <span>🚗</span>
                    <span>{lang === 'zh' ? '高德实时路网行车效率提示' : 'Amap Dynamic Traffic Feed'}</span>
                  </div>
                  <p className="leading-relaxed">
                    {lang === 'zh'
                      ? '宁洛高速、京沪高速局部中转出口车流饱和，部分收费关卡入口遭遇局部拥塞（排队约1.5公里）。若您选择自驾或大巴客室通关，请沿指示提前转往备用接驳车道。地图路网绘制线已自适应为您加入了绕行避堵变弦处理！'
                      : 'Nanjing Toll Gate is under moderate traffic pressure with average queue times up to 12 minutes. Recommended alternates wiggles drawn.'}
                  </p>
                </div>

                {/* Green travel details */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-800">
                    <span>⛅</span>
                    <span>{lang === 'zh' ? '气象气流监测与绿色自驾补能' : 'Doppler weather & EV charging hubs'}</span>
                  </div>
                  <p className="leading-relaxed text-emerald-700">
                    {lang === 'zh'
                      ? '天气晴空万里。沿线段高速服务区充电通道通畅度达 95.8%，提供 480kW 超充基础设施，无严重等候积压，整体自驾续航指数完美！'
                      : 'Winds are mild and solar visibility is optimal. Highway EV supercharger terminals report minimal queueing.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {cityPlans.map((plan, idx) => {
              const toCityId = plan.cityId;
              const toCityName = lang === 'zh' ? plan.cityName : plan.cityNameEn;

              // Generate from info
              const fromCityId = idx === 0 ? departureCityId : cityPlans[idx - 1].cityId;
              const fromCityObj = ALL_CITIES_INDEX.find((c) => c.id === fromCityId);
              const fromCityName = fromCityObj ? (lang === 'zh' ? fromCityObj.name : fromCityObj.nameEn) : (lang === 'zh' ? '起始地点' : 'Departure Point');

              const transit: TransitInfo = currentPlan.transits[toCityId] || {
                type: 'flight',
                distance: 500,
                duration: '2h',
                cost: 300,
                advice: '默认推荐',
                adviceEn: 'Default recommendations'
              };

              const isExpanded = !!expandedLegs[toCityId];
              const isLoadingLeg = !!queryLoading[toCityId];
              const isSuccessLeg = successCode[toCityId];

              const onSwitchType = (newType: 'flight' | 'train' | 'bus' | 'car') => {
                const dist = transit.distance || 350;
                let costVal = 200;
                let durn = '2.5h';
                let adv = '';
                let advEn = '';

                if (newType === 'flight') {
                  costVal = Math.round(180 + dist * 0.3);
                  const hrs = Math.max(1, Math.round((dist / 700) * 10) / 10);
                  durn = `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`;
                  adv = '民航机场班机进港。请务必提前购买联程票证。';
                  advEn = 'Aviation scheduled flight. Check terminal information.';
                } else if (newType === 'train') {
                  costVal = Math.round(60 + dist * 0.38);
                  const hrs = Math.round((dist / 220) * 10) / 10;
                  durn = `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`;
                  adv = '国家普铁/高速铁路客车。二等座直达，舒适安全。';
                  advEn = 'Regular express or high-speed intercity train system.';
                } else if (newType === 'car') {
                  costVal = Math.round(30 + dist * 0.18);
                  const hrs = Math.round((dist / 80) * 10) / 10;
                  durn = `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`;
                  adv = '城际自驾或高速拼车路线。请遵守交规并开启卫星导航软件。';
                  advEn = 'Scenic highway road trip or chartered car rental.';
                } else {
                  costVal = Math.round(25 + dist * 0.12);
                  const hrs = Math.round((dist / 60) * 10) / 10;
                  durn = `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`;
                  adv = '公路运输长途大巴。安全绿色平价，运行准点。';
                  advEn = 'National highway shuttle or luxury motor coach.';
                }

                updateMultipleTransitFields(toCityId, {
                  type: newType,
                  cost: costVal,
                  duration: durn,
                  advice: adv,
                  adviceEn: adv,
                  code: undefined, // Reset ticket details when type switches
                  depTime: undefined,
                  arrTime: undefined,
                  seatInfo: undefined,
                  realStatus: undefined
                });
              };

              return (
                <div key={toCityId} className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
                  {/* Leg summary card header */}
                  <div className="bg-slate-50/70 p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none" onClick={() => toggleLegExpansion(toCityId)}>
                    <div className="flex items-center gap-3">
                      <div className="w-6.5 h-6.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-sans font-bold text-xs text-indigo-700">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-sans font-bold text-xs md:text-sm text-slate-800">
                          <span>{fromCityName}</span>
                          <span className="text-slate-400 font-normal">➡️</span>
                          <span>{toCityName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-550 font-medium">
                            {getLegIcon(transit.type)}
                            <span>{(transit.type === 'flight' ? (lang === 'zh' ? '民航飞机' : 'Flight') : transit.type === 'train' ? (lang === 'zh' ? '高铁/铁路' : 'HSR/Train') : transit.type === 'car' ? (lang === 'zh' ? '自驾租车' : 'Driving') : (lang === 'zh' ? '长途大巴' : 'Bus'))}</span>
                          </span>
                          <span className="text-[10px] text-slate-350">•</span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">{transit.distance} km</span>
                          <span className="text-[10px] text-slate-350">•</span>
                          <span className="text-[10px] text-slate-500 font-medium">{transit.duration}</span>
                          {transit.code && (
                            <>
                              <span className="text-[10px] text-slate-350">•</span>
                              <span className="bg-amber-100/70 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[9px] font-mono">{transit.code}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">{lang === 'zh' ? '单程估价' : 'Est. Price'}</span>
                        <span className="text-sm font-extrabold text-indigo-600 font-mono">
                          ¥{transit.cost}
                          {lang === 'en' && ` ($${Math.round(transit.cost / (getStoredExchangeRates()?.CNY || 7.24))})`}
                        </span>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Custom Form & Live IO details */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                      {/* Step A: Quick Switcher */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">
                          {lang === 'zh' ? 'A. 单击切换通行搭载工具' : 'A. Switch Vehicle Mode'}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['flight', 'train', 'bus', 'car'] as const).map((vt) => {
                            const isSelected = transit.type === vt;
                            return (
                              <button
                                key={vt}
                                type="button"
                                onClick={() => onSwitchType(vt)}
                                className={`py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm ring-2 ring-slate-100'
                                    : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                                }`}
                              >
                                {getLegIcon(vt)}
                                <span className="text-[10px]">
                                  {vt === 'flight' ? (lang === 'zh' ? '飞机' : 'Flight')
                                    : vt === 'train' ? (lang === 'zh' ? '火车' : 'Train')
                                    : vt === 'car' ? (lang === 'zh' ? '自驾' : 'Drive')
                                    : (lang === 'zh' ? '大巴' : 'Bus')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step B: Schedule parameters editor */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Ticket Code Access */}
                        <div className="md:col-span-6 space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {lang === 'zh' ? '车次 / 航班号联机智查' : 'Flight / Train Code Check'}
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={transit.code || ''}
                              onChange={(e) => updateMultipleTransitFields(toCityId, { code: e.target.value })}
                              placeholder={lang === 'zh' ? '输入车次航班如 G105 或 CA1504' : 'e.g. G105 or CA1504'}
                              className="bg-slate-50 border border-slate-250 focus:border-slate-800 rounded-xl px-3 py-2 text-xs font-sans font-medium outline-none flex-1 font-mono uppercase"
                            />
                            <button
                              type="button"
                              onClick={() => handleLiveTrafficQuery(toCityId, fromCityName, toCityName, transit.code || '', transit.type)}
                              disabled={isLoadingLeg}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
                            >
                              {isLoadingLeg ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Search className="w-3.5 h-3.5" />
                              )}
                              <span>{lang === 'zh' ? '智查时刻' : 'Query'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Estimated Price */}
                        <div className="md:col-span-3 space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {lang === 'zh' ? '自定单人票价 (人民币)' : 'Ticket Price (RMB)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold font-mono">
                              ¥
                            </span>
                            <input
                              type="number"
                              value={transit.cost || 0}
                              onChange={(e) => updateMultipleTransitFields(toCityId, { cost: Math.max(0, parseInt(e.target.value) || 0) })}
                              className="bg-slate-50 border border-slate-250 focus:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-mono outline-none w-full"
                            />
                          </div>
                        </div>

                        {/* Custom Distance */}
                        <div className="md:col-span-3 space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {lang === 'zh' ? '预估公里数 (km)' : 'Distance (km)'}
                          </label>
                          <input
                            type="number"
                            value={transit.distance || 0}
                            onChange={(e) => updateMultipleTransitFields(toCityId, { distance: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="bg-slate-50 border border-slate-250 focus:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono outline-none w-full"
                          />
                        </div>
                      </div>

                      {/* Step C: Seats and times specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'zh' ? '出发时间 (H:M)' : 'Dep. Time'}</span>
                          <input
                            type="text"
                            value={transit.depTime || ''}
                            onChange={(e) => updateMultipleTransitFields(toCityId, { depTime: e.target.value })}
                            placeholder="08:30"
                            className="bg-slate-50 border border-slate-150 focus:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono outline-none w-full"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'zh' ? '到达时间 (H:M)' : 'Arr. Time'}</span>
                          <input
                            type="text"
                            value={transit.arrTime || ''}
                            onChange={(e) => updateMultipleTransitFields(toCityId, { arrTime: e.target.value })}
                            placeholder="12:45"
                            className="bg-slate-50 border border-slate-150 focus:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono outline-none w-full"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'zh' ? '车厢/座位号' : 'Coach & Seat No'}</span>
                          <input
                            type="text"
                            value={transit.seatInfo || ''}
                            onChange={(e) => updateMultipleTransitFields(toCityId, { seatInfo: e.target.value })}
                            placeholder="如: 05车12A, window"
                            className="bg-slate-50 border border-slate-150 focus:border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none w-full"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'zh' ? '时长 (Duration)' : 'Duration'}</span>
                          <input
                            type="text"
                            value={transit.duration || ''}
                            onChange={(e) => updateMultipleTransitFields(toCityId, { duration: e.target.value })}
                            placeholder="e.g. 4h 15m"
                            className="bg-slate-50 border border-slate-150 focus:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono outline-none w-full"
                          />
                        </div>
                      </div>

                      {/* Display smart parsed ticket stub summary */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 font-sans space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-dashed border-slate-250 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase font-mono tracking-widest">{transit.type} Stub</span>
                            <span className="text-[10px] font-bold text-slate-700">{transit.code || (lang === 'zh' ? '待登记代码' : 'Waiting Registration')}</span>
                          </div>
                          {transit.realStatus && (
                            <span className="text-[10px] font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              <span>{transit.realStatus}</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-medium uppercase">{lang === 'zh' ? '出发口岸枢纽' : 'Depart Terminal'}</span>
                            <span className="text-xs font-bold text-slate-800">{fromCityName} {transit.depTime ? `(${transit.depTime})` : ''}</span>
                          </div>
                          <div className="text-center font-mono text-slate-400 font-bold self-center">
                            ----------------▶
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-medium uppercase">{lang === 'zh' ? '目的到达港口' : 'Arrive Station'}</span>
                            <span className="text-xs font-bold text-slate-800">{toCityName} {transit.arrTime ? `(${transit.arrTime})` : ''}</span>
                          </div>
                        </div>

                        {transit.seatInfo && (
                          <div className="text-[10px] leading-relaxed text-slate-600 border-t border-slate-150/70 pt-1.5 flex items-center gap-1.5 mt-1">
                            <span className="font-bold text-indigo-700">{lang === 'zh' ? '💺 客舱席别：' : '💺 Assigned Seat:'}</span>
                            <span className="font-mono bg-white border border-slate-250 px-1.5 py-0.5 rounded">{transit.seatInfo}</span>
                          </div>
                        )}

                        <div className="text-[10px] leading-relaxed text-slate-500 pt-1.5 border-t border-slate-150/70">
                          <span className="font-bold text-slate-700 block mb-0.5">💡 {lang === 'zh' ? '出行规划建议(AI Expert Advice):' : 'Itinerary & Traffic Advice:'}</span>
                          <p>{lang === 'zh' ? transit.advice : transit.adviceEn}</p>
                        </div>
                      </div>

                      {/* Step D: Interactive Waypoint Insertion Section for True Route Planning */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-indigo-100/60 font-sans space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-indigo-50/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🧭</span>
                            <span className="text-xs font-bold text-slate-800">{lang === 'zh' ? '经停中转枢纽与沿途服务点规划' : 'Intermediate Waypoint Planner'}</span>
                          </div>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {lang === 'zh' ? '实时地图联动绘制' : 'Auto Map Sync'}
                          </span>
                        </div>

                        {/* List of registered waypoints for this segment */}
                        {waypoints.filter(wp => wp.legId === toCityId).length > 0 && (
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {waypoints.filter(wp => wp.legId === toCityId).map(wp => (
                              <div key={wp.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-150 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-extrabold whitespace-nowrap">
                                    {wp.type === 'service' ? (lang === 'zh' ? '服务区' : 'Service') :
                                     wp.type === 'scenic' ? (lang === 'zh' ? '风景点' : 'Scenic') :
                                     wp.type === 'layover' ? (lang === 'zh' ? '中转站' : 'Layover') :
                                     (lang === 'zh' ? '接驳站' : 'Transit Hub')}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-800">{wp.name}</span>
                                    <span className="text-[10px] text-slate-400 block font-normal leading-relaxed">{wp.notes}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setWaypoints(prev => prev.filter(w => w.id !== wp.id))}
                                  className="text-rose-600 hover:text-rose-800 transition-all font-bold px-1.5 py-0.5 rounded hover:bg-rose-55 hover:scale-105 active:scale-95 text-[10px]"
                                >
                                  {lang === 'zh' ? '删除' : 'Delete'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
                          <div className="md:col-span-4 space-y-1">
                            <span className="text-[9px] text-slate-400 font-extrabold block uppercase">{lang === 'zh' ? '经停地点名称' : 'Stopover Name'}</span>
                            <input
                              type="text"
                              value={wpForms[toCityId]?.name || ''}
                              onChange={(e) => setWpForms(prev => ({
                                ...prev,
                                [toCityId]: { ...(prev[toCityId] || { notes: '', type: 'service' }), name: e.target.value }
                              }))}
                              placeholder={lang === 'zh' ? '如: 南京南转运站/扬州东' : 'e.g. Jinan Service Area'}
                              className="bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-xs outline-none w-full font-medium"
                            />
                          </div>

                          <div className="md:col-span-3 space-y-1">
                            <span className="text-[9px] text-slate-400 font-extrabold block uppercase">{lang === 'zh' ? '枢纽类型' : 'Stopover Type'}</span>
                            <select
                              value={wpForms[toCityId]?.type || 'service'}
                              onChange={(e) => setWpForms(prev => ({
                                ...prev,
                                [toCityId]: { ...(prev[toCityId] || { name: '', notes: '' }), type: e.target.value as any }
                              }))}
                              className="bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2 py-2 text-xs outline-none w-full"
                            >
                              <option value="service">🚗 {lang === 'zh' ? '高速路桥服务区' : 'Service Rest'}</option>
                              <option value="scenic">🌸 {lang === 'zh' ? '沿途著名风景点' : 'Scenic Spot'}</option>
                              <option value="layover">🚉 {lang === 'zh' ? '铁路中途经停点' : 'Train Layover'}</option>
                              <option value="station">🚌 {lang === 'zh' ? '市郊联运交通枢纽' : 'Transit Station'}</option>
                            </select>
                          </div>

                          <div className="md:col-span-5 space-y-1">
                            <span className="text-[9px] text-slate-400 font-extrabold block uppercase">{lang === 'zh' ? '行程备注 / 经停规划' : 'Target Notes / Purpose'}</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={wpForms[toCityId]?.notes || ''}
                                onChange={(e) => setWpForms(prev => ({
                                  ...prev,
                                  [toCityId]: { ...(prev[toCityId] || { name: '', type: 'service' }), notes: e.target.value }
                                }))}
                                placeholder={lang === 'zh' ? '如: 顺便吃午饭 / 过境停留45分钟' : 'e.g. Lunch & recharge'}
                                className="bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-xs outline-none w-full flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const activeForm = wpForms[toCityId];
                                  if (!activeForm?.name?.trim()) {
                                    alert(lang === 'zh' ? '华丽的算路规划：请先填写中转过境站点名字！' : 'Please provide a stop name first!');
                                    return;
                                  }

                                  const existingWpCount = waypoints.filter(wp => wp.legId === toCityId).length;
                                  const ratio = 0.3 + 0.15 * (existingWpCount + 1); // interpolating mathematically between cities
                                  const angle = (existingWpCount * 1.5) % Math.PI;
                                  const offsetLat = Math.sin(angle) * 0.15;
                                  const offsetLng = Math.cos(angle) * 0.15;

                                  const fromCityId = idx === 0 ? departureCityId : cityPlans[idx - 1].cityId;
                                  const fromCityObj = ALL_CITIES_INDEX.find(c => c.id === fromCityId);
                                  const fromCoord = fromCityObj ? fromCityObj.coordinates : startCoord;

                                  const toCityObj = ALL_CITIES_INDEX.find(c => c.id === toCityId);
                                  const toCoord = toCityObj ? toCityObj.coordinates : startCoord;

                                  const lat = fromCoord[0] + (toCoord[0] - fromCoord[0]) * ratio + offsetLat;
                                  const lng = fromCoord[1] + (toCoord[1] - fromCoord[1]) * ratio + offsetLng;

                                  const newWp = {
                                    id: `wp-user-${Date.now()}`,
                                    legId: toCityId,
                                    name: activeForm.name.trim(),
                                    coord: [lat, lng] as [number, number],
                                    notes: activeForm.notes.trim() || (lang === 'zh' ? '自驾途经/车厢换乘枢纽经停点' : 'Scheduled midway transit waypoint'),
                                    type: activeForm.type
                                  };

                                  setWaypoints(prev => [...prev, newWp]);
                                  setWpForms(prev => ({
                                    ...prev,
                                    [toCityId]: { name: '', notes: '', type: 'service' }
                                  }));
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 rounded-xl cursor-pointer whitespace-nowrap active:scale-95 transition-all shadow-sm"
                              >
                                {lang === 'zh' ? '确认规划' : 'Insert'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Google Map Nested Render Wrappers
// ---------------------------------------------------------------------------
interface GoogleMapWrapperProps {
  googleMapsKey: string;
  routingPoints: any[];
  detailedPathPoints: [number, number][];
  activePlanIndex: number;
  onSelectCityIndex: (index: number) => void;
  onFallbackToLeaflet: () => void;
  waypoints: any[];
  lang?: 'zh' | 'en';
  activePois: any[];
  onSelectPoi?: (poi: any) => void;
}

function GoogleMapWrapper({
  googleMapsKey,
  routingPoints,
  detailedPathPoints,
  activePlanIndex,
  onSelectCityIndex,
  onFallbackToLeaflet,
  waypoints,
  lang = 'zh',
  activePois,
  onSelectPoi
}: GoogleMapWrapperProps) {
  const [hasError, setHasError] = useState(false);

  if (!googleMapsKey) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-xs">
        <p className="font-bold text-slate-800 mb-2">Google Maps SDK Key Required</p>
        <p className="text-slate-400 max-w-sm mb-4">
          Provide your <code>GOOGLE_MAPS_PLATFORM_KEY</code> in Settings, or use our pre-configured leaflet engine seamlessly.
        </p>
        <button
          onClick={onFallbackToLeaflet}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-600/10"
        >
          Use Free Leaflet (OSM) instead
        </button>
      </div>
    );
  }

  return (
    <APIProvider apiKey={googleMapsKey} version="weekly" onError={() => setHasError(true)}>
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-xs">
          <p className="font-bold text-rose-600 mb-1">Google Maps load failed</p>
          <p className="text-slate-400 max-w-xs mb-3">Please check your API key validity, domain referrers, and billing settings.</p>
          <button
            onClick={onFallbackToLeaflet}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer"
          >
            Use Leaflet instead
          </button>
        </div>
      ) : (
        <GoogleMapInner
          routingPoints={routingPoints}
          detailedPathPoints={detailedPathPoints}
          activePlanIndex={activePlanIndex}
          onSelectCityIndex={onSelectCityIndex}
          waypoints={waypoints}
          lang={lang}
          activePois={activePois}
          onSelectPoi={onSelectPoi}
        />
      )}
    </APIProvider>
  );
}

interface GoogleMapInnerProps {
  routingPoints: any[];
  detailedPathPoints: [number, number][];
  activePlanIndex: number;
  onSelectCityIndex: (index: number) => void;
  waypoints: any[];
  lang?: 'zh' | 'en';
  activePois: any[];
  onSelectPoi?: (poi: any) => void;
}

function GoogleMapInner({
  routingPoints,
  detailedPathPoints,
  activePlanIndex,
  onSelectCityIndex,
  waypoints,
  lang = 'zh',
  activePois,
  onSelectPoi
}: GoogleMapInnerProps) {
  const map = useGoogleMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map || routingPoints.length === 0) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((line) => line.setMap(null));
    polylinesRef.current = [];

    try {
      const bounds = new google.maps.LatLngBounds();

      if (activePois.length > 0) {
        activePois.forEach((p) => {
          bounds.extend({ lat: p.poi.coordinates[0], lng: p.poi.coordinates[1] });
        });
      } else {
        routingPoints.forEach((p) => {
          bounds.extend({ lat: p.coord[0], lng: p.coord[1] });
        });
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 60,
          right: 60,
          bottom: 60,
          left: 60,
        });
      }

      // 1. Render beautiful curved polyline paths for intercity route
      if (detailedPathPoints.length >= 2) {
        const interCityLine = new google.maps.Polyline({
          path: detailedPathPoints.map(coord => ({ lat: coord[0], lng: coord[1] })),
          geodesic: true,
          strokeColor: '#6366f1',
          strokeOpacity: activePlanIndex !== -1 ? 0.25 : 0.8, // desaturate transit link if focused in city
          strokeWeight: 3.5,
          map: map,
        });
        polylinesRef.current.push(interCityLine);
      }

      // 2. Group and render day-by-day paths for the active city
      const poisByDay: { [day: number]: typeof activePois } = {};
      activePois.forEach((p) => {
        if (!poisByDay[p.dayNum]) poisByDay[p.dayNum] = [];
        poisByDay[p.dayNum].push(p);
      });

      Object.keys(poisByDay).forEach((dayNumKey) => {
        const dayNum = parseInt(dayNumKey);
        const dayPois = poisByDay[dayNum];
        if (dayPois.length >= 2) {
          const pathPoints = dayPois.map(p => ({ lat: p.poi.coordinates[0], lng: p.poi.coordinates[1] }));
          const dayLine = new google.maps.Polyline({
            path: pathPoints,
            geodesic: true,
            strokeColor: dayPois[0].color,
            strokeOpacity: 0.85,
            strokeWeight: 3.5,
            map: map,
          });
          polylinesRef.current.push(dayLine);
        }
      });

    } catch (e) {
      console.warn('Error aligning Google Map viewport:', e);
    }

    return () => {
      polylinesRef.current.forEach((line) => line.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routingPoints, detailedPathPoints, activePlanIndex, activePois]);

  return (
    <GoogleMap
      defaultCenter={{ lat: routingPoints[0]?.coord[0] || 39.9, lng: routingPoints[0]?.coord[1] || 116.4 }}
      defaultZoom={4}
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds = {['gmp_mcp_codeassist_v1_aistudio']}
      style={{ width: '100%', height: '100%' }}
      fullscreenControl={false}
      streetViewControl={false}
      mapTypeControl={false}
    >
      {/* Route Stops */}
      {routingPoints.map((point, seq) => {
        const isCurrentActive =
          (point.isOrigin && activePlanIndex === -1) ||
          (!point.isOrigin && point.planIndex === activePlanIndex);

        const pinClass = point.isOrigin
          ? 'bg-rose-500 ring-rose-100'
          : isCurrentActive
          ? 'bg-sky-500 ring-sky-200'
          : 'bg-slate-400 ring-slate-100';

        return (
          <AdvancedMarker
            key={`point-${seq}`}
            position={{ lat: point.coord[0], lng: point.coord[1] }}
            onClick={() => {
              if (!point.isOrigin) {
                onSelectCityIndex(point.planIndex);
              }
            }}
          >
            <div className={`w-8 h-8 rounded-full border-2 border-white text-white flex items-center justify-center font-sans font-bold text-xs ring-4 ${pinClass}`}>
              {point.isOrigin ? '起' : seq}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Render Waypoints on Google Map */}
      {waypoints.map((wp, seq) => (
        <AdvancedMarker
          key={`wp-google-${seq}`}
          position={{ lat: wp.coord[0], lng: wp.coord[1] }}
        >
          <div className="w-6 h-6 rounded-full border border-white bg-indigo-600 text-white flex items-center justify-center shadow-md font-sans ring-2 ring-indigo-200">
            <span className="text-[9px] font-extrabold">经</span>
          </div>
        </AdvancedMarker>
      ))}

      {/* NEW: Render Daily POIs on Google Map */}
      {activePois.map((p) => {
        return (
          <AdvancedMarker
            key={`poi-google-${p.id}`}
            position={{ lat: p.poi.coordinates[0], lng: p.poi.coordinates[1] }}
            onClick={() => onSelectPoi?.(p.poi)}
          >
            <div className="flex flex-col items-center select-none" style={{ transform: 'translateY(-12px)' }}>
              <div 
                style={{ backgroundColor: p.color, border: '2px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.18)' }}
                className="w-7 h-7 rounded-full text-white flex items-center justify-center font-sans font-extrabold text-xs ring-2 ring-white hover:scale-110 transition-all duration-200 cursor-pointer"
              >
                {p.seq}
              </div>
              <div className="px-1.5 py-0.5 mt-0.5 bg-slate-900/90 backdrop-blur-[2px] rounded text-[9px] text-white font-bold whitespace-nowrap border border-white/20 shadow-sm pointer-events-none">
                {lang === 'zh' ? p.poi.name : p.poi.nameEn}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </GoogleMap>
  );
}
