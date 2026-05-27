/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CityIndex, DetailedCityPlan, POI, TransitInfo } from '../types';

export const CN_CITIES: CityIndex[] = [
  { id: 'beijing', name: '北京', nameEn: 'Beijing', pinyin: 'beijing', region: '华北', regionEn: 'North China', isInternational: false, coordinates: [39.9042, 116.4074] },
  { id: 'shanghai', name: '上海', nameEn: 'Shanghai', pinyin: 'shanghai', region: '华东', regionEn: 'East China', isInternational: false, coordinates: [31.2304, 121.4737] },
  { id: 'guangzhou', name: '广州', nameEn: 'Guangzhou', pinyin: 'guangzhou', region: '华南', regionEn: 'South China', isInternational: false, coordinates: [23.1291, 113.2644] },
  { id: 'shenzhen', name: '深圳', nameEn: 'Shenzhen', pinyin: 'shenzhen', region: '华南', regionEn: 'South China', isInternational: false, coordinates: [22.5431, 114.0579] },
  { id: 'xian', name: '西安', nameEn: "Xi'an", pinyin: 'xian', region: '西北', regionEn: 'Northwest China', isInternational: false, coordinates: [34.3416, 108.9398] },
  { id: 'chengdu', name: '成都', nameEn: 'Chengdu', pinyin: 'chengdu', region: '西南', regionEn: 'Southwest China', isInternational: false, coordinates: [30.5728, 104.0668] },
  { id: 'hangzhou', name: '杭州', nameEn: 'Hangzhou', pinyin: 'hangzhou', region: '华东', regionEn: 'East China', isInternational: false, coordinates: [30.2741, 120.1551] },
  { id: 'chongqing', name: '重庆', nameEn: 'Chongqing', pinyin: 'chongqing', region: '西南', regionEn: 'Southwest China', isInternational: false, coordinates: [29.5630, 106.5516] },
  { id: 'sanya', name: '三亚', nameEn: 'Sanya', pinyin: 'sanya', region: '华南', regionEn: 'South China', isInternational: false, coordinates: [18.2525, 109.5120] },
  { id: 'guilin', name: '桂林', nameEn: 'Guilin', pinyin: 'guilin', region: '华南', regionEn: 'South China', isInternational: false, coordinates: [25.2736, 110.2901] },
  { id: 'lhasa', name: '拉萨', nameEn: 'Lhasa', pinyin: 'lasa', region: '西北', regionEn: 'Tibet China', isInternational: false, coordinates: [29.6524, 91.1172] },
  { id: 'xiamen', name: '厦门', nameEn: 'Xiamen', pinyin: 'xiamen', region: '华东', regionEn: 'East China', isInternational: false, coordinates: [24.4798, 118.0894] },
  { id: 'kunming', name: '昆明', nameEn: 'Kunming', pinyin: 'kunming', region: '西南', regionEn: 'Southwest China', isInternational: false, coordinates: [25.0406, 102.7122] },
  { id: 'harbin', name: '哈尔滨', nameEn: 'Harbin', pinyin: 'haerbin', region: '东北', regionEn: 'Northeast China', isInternational: false, coordinates: [45.8038, 126.5349] },
  { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', pinyin: 'xianggang', region: '港澳台', regionEn: 'HK & Macau', isInternational: false, coordinates: [22.3193, 114.1694] },
  { id: 'macau', name: '澳门', nameEn: 'Macau', pinyin: 'aomen', region: '港澳台', regionEn: 'HK & Macau', isInternational: false, coordinates: [22.1987, 113.5439] },
  { id: 'taipei', name: '台北', nameEn: 'Taipei', pinyin: 'taibei', region: '港澳台', regionEn: 'Taiwan', isInternational: false, coordinates: [25.0330, 121.5654] }
];

export const INTL_CITIES: CityIndex[] = [
  { id: 'tokyo', name: '东京', nameEn: 'Tokyo', pinyin: 'dongjing', region: '东亚', regionEn: 'East Asia', isInternational: true, coordinates: [35.6762, 139.6503] },
  { id: 'kyoto', name: '京都', nameEn: 'Kyoto', pinyin: 'jingdu', region: '东亚', regionEn: 'East Asia', isInternational: true, coordinates: [35.0116, 135.7681] },
  { id: 'bangkok', name: '曼谷', nameEn: 'Bangkok', pinyin: 'mangu', region: '东南亚', regionEn: 'Southeast Asia', isInternational: true, coordinates: [13.7563, 100.5018] },
  { id: 'singapore', name: '新加坡', nameEn: 'Singapore', pinyin: 'xinjiapo', region: '东南亚', regionEn: 'Southeast Asia', isInternational: true, coordinates: [1.3521, 103.8198] },
  { id: 'paris', name: '巴黎', nameEn: 'Paris', pinyin: 'bali', region: '欧洲', regionEn: 'Europe', isInternational: true, coordinates: [48.8566, 2.3522] },
  { id: 'london', name: '伦敦', nameEn: 'London', pinyin: 'lundun', region: '欧洲', regionEn: 'Europe', isInternational: true, coordinates: [51.5074, -0.1278] },
  { id: 'newyork', name: '纽约', nameEn: 'New York', pinyin: 'niuyue', region: '北美', regionEn: 'North America', isInternational: true, coordinates: [40.7128, -74.0060] },
  { id: 'losangeles', name: '洛杉矶', nameEn: 'Los Angeles', pinyin: 'luoshanji', region: '北美', regionEn: 'North America', isInternational: true, coordinates: [34.0522, -118.2437] },
  { id: 'sydney', name: '悉尼', nameEn: 'Sydney', pinyin: 'xini', region: '大洋洲', regionEn: 'Oceania', isInternational: true, coordinates: [-33.8688, 151.2093] },
  { id: 'rome', name: '罗马', nameEn: 'Rome', pinyin: 'luoma', region: '欧洲', regionEn: 'Europe', isInternational: true, coordinates: [41.9028, 12.4964] },
  { id: 'reykjavik', name: '雷克雅未克', nameEn: 'Reykjavik', pinyin: 'leikeyawieke', region: '欧洲', regionEn: 'Europe', isInternational: true, coordinates: [64.1466, -21.9426] },
  { id: 'cairo', name: '开罗', nameEn: 'Cairo', pinyin: 'kailuo', region: '非洲', regionEn: 'Africa', isInternational: true, coordinates: [30.0444, 31.2357] },
  { id: 'phuket', name: '普吉岛', nameEn: 'Phuket', pinyin: 'pujidao', region: '东南亚', regionEn: 'Southeast Asia', isInternational: true, coordinates: [7.8804, 98.3922] }
];

export const ALL_CITIES_INDEX: CityIndex[] = [...CN_CITIES, ...INTL_CITIES];

// Helper to calculate a rough geodesic distance (km)
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth major radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Generates logical travel/transit schedule between two sets of coordinates
export function generateTransit(fromId: string, toId: string): TransitInfo {
  const fromCity = ALL_CITIES_INDEX.find((c) => c.id === fromId);
  const toCity = ALL_CITIES_INDEX.find((c) => c.id === toId);

  if (!fromCity || !toCity) {
    return {
      type: 'flight',
      distance: 800,
      duration: '2h 15m',
      cost: 450,
      advice: '未知路线，建议优先选择飞机客运。',
      adviceEn: 'Unknown route, flying is generally recommended.',
    };
  }

  const dist = getDistance(fromCity.coordinates[0], fromCity.coordinates[1], toCity.coordinates[0], toCity.coordinates[1]);

  if (fromCity.isInternational || toCity.isInternational || dist > 1200) {
    const flightDurationHours = Math.max(1, Math.round((dist / 750) * 10) / 10);
    const cost = Math.round(150 + dist * 0.25);
    return {
      type: 'flight',
      distance: dist,
      duration: `${Math.floor(flightDurationHours)}h ${Math.round((flightDurationHours % 1) * 60)}m`,
      cost,
      advice: `远距离航线，推荐搭乘大型客机直飞、或经航空枢纽中转。提前2-3个月订票常有特价。`,
      adviceEn: `Long-distance flight. Booking 2-3 months early is highly recommended to secure direct or budget tickets.`,
    };
  } else if (dist < 300) {
    const cost = Math.round(30 + dist * 0.15);
    const hours = Math.round((dist / 80) * 10) / 10;
    return {
      type: 'car',
      distance: dist,
      duration: `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`,
      cost,
      advice: `两地相距较近，推荐自驾或包车出行。路况良好，随时出发。`,
      adviceEn: `Short distance, perfect for self-driving or hiring a local charter. Comfortable highways available.`,
    };
  } else {
    const cost = Math.round(50 + dist * 0.35);
    const hours = Math.round((dist / 220) * 10) / 10;
    return {
      type: 'train',
      distance: dist,
      duration: `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`,
      cost,
      advice: `中等距离。中国高铁/当地城际铁路是最佳选择，安全、快速且直达。`,
      adviceEn: `Moderate distance. High-speed rail or regional intercity trains are the best choices for fast, comfortable journeys.`,
    };
  }
}

// Outstanding prebuilt templates for Beijing, Shanghai, Xi'an, Chengdu, Kyoto, Paris, Sanya, Tokyo
export const CITIES_DETAIL: { [cityId: string]: DetailedCityPlan } = {
  beijing: {
    cityId: 'beijing',
    cityName: '北京',
    cityNameEn: 'Beijing',
    daysCount: 3,
    bestSeason: '9月-11月（秋季，天高气爽，金秋香山最美）',
    bestSeasonEn: 'Sep - Nov (Autumn: crisp air, breathtaking golden foliage at Xiangshan)',
    localExpense: { tickets: 180, food: 220, hotel: 450, transit: 60 },
    veteranTips: [
      '故宫门票一定要提前7天在官方渠道实名预订！',
      '升旗仪式极早，建议住天安门或前门附近以便清晨步行。',
      '去长城一定要选八达岭早班专线或直通车，错开堵车高峰。'
    ],
    veteranTipsEn: [
      'Forbidden City tickets must be booked on the official channel 7 days in advance!',
      'Flag raising is very early; lodging near Tiananmen or Qianmen is critical.',
      'Take the early express bus line to Badaling Wall to bypass heavy congestion.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'bj-p1',
            name: '天安门广场与升旗仪式',
            nameEn: 'Tiananmen Square & Flag Raising',
            type: 'attraction',
            time: '05:30',
            duration: '1.5h',
            cost: 0,
            bestTime: '清晨升旗动作一刹那',
            crowdTimes: '05:00-06:00 极其拥挤',
            tip: '必须提前1天在官方微信小程序预约！由于安检严密，建议最少提前40分钟抵达。',
            tipEn: 'Must reserve on the WeChat mini-program 1 day prior. Due to security scans, arrive 40 mins early.',
            coordinates: [39.9055, 116.3976]
          },
          {
            id: 'bj-p2',
            name: '故宫博物院',
            nameEn: 'The Palace Museum (Forbidden City)',
            type: 'attraction',
            time: '08:30',
            duration: '4h',
            cost: 60,
            bestTime: '午门开门第一时间或午后14点',
            crowdTimes: '10:00-13:00 人山人海',
            tip: '沿着中轴线走（太和殿、乾清宫、御花园），珍宝馆与钟表馆非常值得额外购票观赏。',
            tipEn: 'Walk the historic central meridian. Treasure and Clock halls are highly worth the minor extra fee.',
            coordinates: [39.9163, 116.3972]
          },
          {
            id: 'bj-p3',
            name: '四季民福烤鸭（灯市口店）',
            nameEn: 'Siji Minfu Roast Duck (Dengshikou)',
            type: 'food',
            time: '13:00',
            duration: '1.5h',
            cost: 150,
            bestTime: '11:30之前或13:30之后错峰避开排队',
            crowdTimes: '12:00-13:00 爆满，排队2小时以上',
            tip: '北京烤鸭地标！酥香嫩滑，一定要点一盘鸭皮蘸白糖，还有传统贝勒烤肉。',
            tipEn: 'The pinnacle of Peking Duck. Order the crispy skin dipped in white sugar and traditional grilled mutton.',
            coordinates: [39.9189, 116.4170]
          },
          {
            id: 'bj-p4',
            name: '景山公园（看故宫全景）',
            nameEn: 'Jingshan Park (Forbidden City Birdview)',
            type: 'attraction',
            time: '15:30',
            duration: '1.5h',
            cost: 2,
            bestTime: '日落前半小时万春亭观紫禁城全景',
            crowdTimes: '周末下午游人较多',
            tip: '登上万春亭，俯瞰一览无余的故宫全景，是北京拍故宫全貌最好的落脚点。',
            tipEn: 'Climb the Wanchun Pavilion at sunset to enjoy the uninterrupted panoramic overview of the Palace.',
            coordinates: [39.9238, 116.3969]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'bj-p5',
            name: '颐和园',
            nameEn: 'The Summer Palace',
            type: 'attraction',
            time: '09:00',
            duration: '3.5h',
            cost: 30,
            bestTime: '上午气温适宜，适合游湖',
            crowdTimes: '11:00后旅游团较多',
            tip: '推荐租一条小电子船畅行在昆明湖上。十七孔桥在冬日会有十七孔桥落日金光奇景。',
            tipEn: 'Highly advise renting a small electronic boat on Kunming Lake. The 17-hole bridge has legendary sunset magic in winter.',
            coordinates: [39.9998, 116.2755]
          },
          {
            id: 'bj-p6',
            name: '南锣鼓巷与胡同体验',
            nameEn: 'Nanluoguxiang & Traditional Hutongs',
            type: 'attraction',
            time: '14:00',
            duration: '2.5h',
            cost: 0,
            bestTime: '阴凉午后，适合胡同散步',
            crowdTimes: '节假日主街完全挤不动',
            tip: '避开南锣鼓巷主街人流，折入两旁安静的胡同（五道营、雨儿胡同），租一辆共享单车慢慢骑。',
            tipEn: 'Bypass the hyper-touristic main street; turn directly into historic quiet side lanes on a bicycle.',
            coordinates: [39.9372, 116.4034]
          },
          {
            id: 'bj-p7',
            name: '后海与什刹海民谣酒吧',
            nameEn: 'Shichahai & Back Lakes Folk Bars',
            type: 'attraction',
            time: '18:30',
            duration: '3h',
            cost: 80,
            bestTime: '夜色渐浓，湖面倒影斑斓',
            crowdTimes: '20:00-22:00 黄金时段',
            tip: '在湖畔找一家驻唱安静、能看到湖景的民谣小酒馆，体验老北京夜生活。',
            tipEn: 'Find an intimate, quiet live-music pub overlooking the scenic water to experience true local nightlife.',
            coordinates: [39.9392, 116.3908]
          }
        ]
      },
      {
        day: 3,
        pois: [
          {
            id: 'bj-p8',
            name: '天坛公园与祈年殿',
            nameEn: 'Temple of Heaven',
            type: 'attraction',
            time: '08:30',
            duration: '2.5h',
            cost: 34,
            bestTime: '清晨有大批本地晨习悠闲的老北京居民',
            crowdTimes: '10:00 后主干道游客涌入',
            tip: '买联票（含祈年殿、回音壁和大祀殿），回音壁站在两个角落能听到细小的声波传导。',
            tipEn: 'Buy a combo ticket including the Hall of Prayer. Stand at opposite corners of Echo Wall to test the sound physics.',
            coordinates: [39.8837, 116.4128]
          },
          {
            id: 'bj-p9',
            name: '798艺术区',
            nameEn: '798 Art District',
            type: 'attraction',
            time: '13:00',
            duration: '3h',
            cost: 0,
            bestTime: '午后文艺散心',
            crowdTimes: '工作日人少，周末艺术展人气极高',
            tip: '老工厂旧址改建的先锋艺术园区。各种奇特雕塑、画廊、独立咖啡馆，极其出片。',
            tipEn: 'A masterfully repurposed industrial-factory-complex full of installations, art galleries, and boutique lofts.',
            coordinates: [39.9841, 116.4950]
          }
        ]
      }
    ]
  },
  shanghai: {
    cityId: 'shanghai',
    cityName: '上海',
    cityNameEn: 'Shanghai',
    daysCount: 2,
    bestSeason: '3月-5月（春光明媚），10月-11月（秋高气爽）',
    bestSeasonEn: 'Mar - May (Flora Blossom), Oct - Nov (Charming Golden Autumn)',
    localExpense: { tickets: 120, food: 260, hotel: 550, transit: 50 },
    veteranTips: [
      '外滩绝美观光夜灯22:00准时关闭，请务必提前到场看璀璨外滩。',
      '豫园城隍庙小吃商业化严重，本地经典小吃更推荐去老弄堂里的私享小店。',
      '想要避开人群，可在清晨7点半沿着武康路梧桐树林散步骑行。'
    ],
    veteranTipsEn: [
      'The iconic Bund neon lights shut off at exactly 22:00! Secure your viewing early.',
      'Yuyuan food courts are highly commercialised; local gems are usually hidden inside old alleyways.',
      'For peaceful scenic walks, jog under the historic plane trees of Wukang Road around 07:30 AM.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'sh-p1',
            name: '豫园 & 老城隍庙',
            nameEn: 'Yuyuan Garden & Old Town Market',
            type: 'attraction',
            time: '09:00',
            duration: '2.5h',
            cost: 40,
            bestTime: '早上开园时分，假山回廊最为安详',
            crowdTimes: '11:00之后市集摩肩接踵',
            tip: '江南园林杰作。豫园九曲桥、湖心亭非常漂亮。推荐在老字号绿波廊品尝招牌松糕。',
            tipEn: 'Magnificent southern landscape style. The famous Nine-Turning Bridge is a visual dream. Try steamed treats at Lu Bo Lang.',
            coordinates: [31.2272, 121.4921]
          },
          {
            id: 'sh-p2',
            name: '南京路步行街与申城观光1号线',
            nameEn: 'Nanjing Road Pedestrian Street',
            type: 'attraction',
            time: '13:00',
            duration: '2h',
            cost: 5,
            bestTime: '适合走马观花地体验摩登经典老建筑',
            crowdTimes: '午后人群开始聚拢',
            tip: '汇集诸多上海经典中华老字号，可搭乘萌萌的“铛铛车”复古轻轨，也可以一路散步走到外滩。',
            tipEn: 'The century-old artery of retail. Take a signature retro trolley for a quick cross towards the waterfront.',
            coordinates: [31.2347, 121.4746]
          },
          {
            id: 'sh-p3',
            name: '外滩江风揽胜（中山东一路）',
            nameEn: 'The Bund',
            type: 'attraction',
            time: '16:00',
            duration: '2h',
            cost: 0,
            bestTime: '黄昏18:00蓝调时刻，对岸陆家嘴霓虹初绽',
            crowdTimes: '19:00-21:00 观光台人挨着人',
            tip: '上海核心灵魂所在。左手老洋行万国建筑群，右手现代陆家嘴摩天森林，强烈推荐做 2 元的渡轮体验。',
            tipEn: 'The monumental heart of Shanghai. Experience the dual world of imperial old structures and towering modern glass block skyscrapers.',
            coordinates: [31.2416, 121.4897]
          },
          {
            id: 'sh-p4',
            name: '佳家汤包（传统本帮蟹黄小笼）',
            nameEn: 'Jiajia Soup Dumplings (Authentic Xiaolongbao)',
            type: 'food',
            time: '18:30',
            duration: '1h',
            cost: 65,
            bestTime: '17:30 开晚市前排队',
            crowdTimes: '用餐高峰经常卖完收档',
            tip: '现包现蒸，蟹粉鲜肉小笼汤汁饱满，汤面清澈不浑浊，配上一碗姜丝陈醋堪称天作之合。',
            tipEn: 'Freshly folded, paper-thin steamed dumplings bursting with savory hot pork and golden crab roe.',
            coordinates: [31.2335, 121.4725]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'sh-p5',
            name: '武康大楼与经典法租界漫游',
            nameEn: 'Wukang Mansion & Formex French Concession',
            type: 'attraction',
            time: '09:00',
            duration: '3h',
            cost: 0,
            bestTime: '清晨阳光柔和照射在大楼红砖立面上',
            crowdTimes: '下午大批街拍网红聚集在拐角处',
            tip: '著名邬达克建筑代表作，极像一艘巨轮。沿着武康路、安福路随心漫步，享受茂密法国梧桐掩映的惬意。',
            tipEn: 'Designed by legendary architect Hudec, mimicking a towering ocean liner. Walk and experience the rich cafe culture.',
            coordinates: [31.2052, 121.4335]
          },
          {
            id: 'sh-p6',
            name: '陆家嘴三件套（上海中心观光大厅）',
            nameEn: 'Lujiazui Skyscrapers (Shanghai Tower)',
            type: 'attraction',
            time: '14:00',
            duration: '3.5h',
            cost: 180,
            bestTime: '如果天气能见度绝佳，可在高空云端俯瞰滚滚黄浦江',
            crowdTimes: '周末下午登顶排队超过1小时',
            tip: '上海中心118层121层是世界级高空地标，观光梯速度高达 18m/s，将魔都天际线踩在大脚之下。',
            tipEn: 'Rise to the clouds inside Shanghai Tower. Enjoy unmatched panoramic heights of the dynamic metropolis.',
            coordinates: [31.2355, 121.5015]
          },
          {
            id: 'sh-p7',
            name: '东方明珠广播电视塔',
            nameEn: 'Oriental Pearl Tower',
            type: 'attraction',
            time: '18:00',
            duration: '2.5h',
            cost: 160,
            bestTime: '夜幕初降，明珠塔亮起梦幻紫光',
            crowdTimes: '19:00-20:30 人群拥堵',
            tip: '独特的全透明悬空玻璃盘道，敢于在这俯身往下看，仿佛直接踩在悬空云彩中。',
            tipEn: 'Walk the spectacular circular glass gallery hanging high above. Thrilling panoramic vistas guaranteed.',
            coordinates: [31.2397, 121.4998]
          }
        ]
      }
    ]
  },
  xian: {
    cityId: 'xian',
    cityName: '西安',
    cityNameEn: "Xi'an",
    daysCount: 2,
    bestSeason: '3月-5月，9月-11月（免去夏暑冬寒，最为宜游）',
    bestSeasonEn: 'Mar - May, Sep - Nov (Pleasant climate, bypassing heavy summer heat & dry freeze)',
    localExpense: { tickets: 230, food: 140, hotel: 320, transit: 45 },
    veteranTips: [
      '秦始皇兵马俑不在市区！在临潼区，建议直接坐地铁9号线后转乘专线大巴最安全便宜。',
      '大唐不夜城最好看的时间在傍晚19:30之后华灯初上时，各类古装小剧目和不倒翁互动会相继开演。',
      '永兴坊是陕西非遗美食街，各种摔碗酒、肉夹馍物美价廉。'
    ],
    veteranTipsEn: [
      'The Terracotta Army is far away in Lintong! Take Metro Line 9 and transfer to the direct tourist shuttle.',
      'Grand Tang Everbright City shines best after 19:30 with historic performances and cascading lights.',
      'Yongxingfang features traditional Shaanxi intangible heritage and street delicacies at incredible rates.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'xa-p1',
            name: '秦始皇兵马俑博物馆',
            nameEn: 'Terracotta Warriors Museum',
            type: 'attraction',
            time: '08:30',
            duration: '4h',
            cost: 120,
            bestTime: '早上开门第一时间直奔一号坑看宏大兵阵',
            crowdTimes: '10:00-14:00 大批旅游团疯狂涌入',
            tip: '建议务必在门口请一位持证官方导游讲解，倾听兵马俑发掘背后的考古传奇和前世今生，否则就只是一堆泥土。',
            tipEn: 'Hiring a certified professional guide is crucial. Listening to archaeology stories brings history to life.',
            coordinates: [34.3842, 109.2785]
          },
          {
            id: 'xa-p2',
            name: '老米家大雨泡馍（回民街）',
            nameEn: 'Lao Mi Jia Beef & Mutton Paomo',
            type: 'food',
            time: '13:00',
            duration: '1.5h',
            cost: 45,
            bestTime: '13:30 稍晚时段错峰用餐',
            crowdTimes: '12:00-13:00 极其狭窄拥挤',
            tip: '体验传统吃法，选精致小碗亲手把馍掰得像黄豆一般大。煮出来的泡馍才软烂吸汁、唇齿留香。',
            tipEn: 'Tear your pita bread manually into soy-bean size pieces for the kitchen to boil with savory, long-simmered bone broth.',
            coordinates: [34.2638, 108.9402]
          },
          {
            id: 'xa-p3',
            name: '碑林博物馆 & 书院门街',
            nameEn: 'Beilin Museum & Shuyuanmen',
            type: 'attraction',
            time: '15:00',
            duration: '2.5h',
            cost: 50,
            bestTime: '日落落霞照在古碑石刻上，幽深雅致',
            crowdTimes: '游客适中，多为书法金石爱好者',
            tip: '中国最大的石碑历史藏馆，历代书法巨匠（颜真卿、柳公权、王羲之）的真实字帖遗迹都在这里，震撼人心。',
            tipEn: 'The Forest of Stone Steles. It houses the finest ancient collections of China’s calligraphy masters.',
            coordinates: [34.2562, 108.9490]
          },
          {
            id: 'xa-p4',
            name: '西安古城墙（骑行日落）',
            nameEn: "Xi'an Ancient City Wall (Sunset Ride)",
            type: 'attraction',
            time: '18:00',
            duration: '2h',
            cost: 54,
            bestTime: '傍晚金黄日落洒满古老箭楼的时刻',
            crowdTimes: '永宁门入口傍晚排队极其密集',
            tip: '建议从南门（永宁门）登墙，并在墙上租一辆双人或单人自行车，踩行在千年古砖上，晚风拂面。',
            tipEn: 'Climb via the South Gate. Rent a bicycle to ride on the historic wide brick ramparts under lovely twilight.',
            coordinates: [34.2555, 108.9461]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'xa-p5',
            name: '陕西历史博物馆',
            nameEn: 'Shaanxi History Museum',
            type: 'attraction',
            time: '09:00',
            duration: '3.5h',
            cost: 0,
            bestTime: '需要提前3天在公众号抢免费门票，推荐看大唐玉器展',
            crowdTimes: '任何时间都极其火爆',
            tip: '古都瑰宝，珍藏有各种流光溢彩的唐三彩、极其精细的鎏金舞马衔杯纹银壶，绝对让你叹为观止。',
            tipEn: 'Prehistoric and dynastic museum. Golden beasts, terracotta figurines and Tang ceramics of unrivaled quality.',
            coordinates: [34.2255, 108.9554]
          },
          {
            id: 'xa-p6',
            name: '大雁塔 & 大慈恩寺公园',
            nameEn: 'Giant Wild Goose Pagoda',
            type: 'attraction',
            time: '14:00',
            duration: '2.5h',
            cost: 40,
            bestTime: '阳光洒满白塔身，在喷泉池旁留影最佳',
            crowdTimes: '北广场大喷泉演出现场人头攒动',
            tip: '唐玄奘西行取经归来藏经的佛塔。北广场有气势磅礴的大型矩阵式音乐水幕，非常生动。',
            tipEn: 'The sacred Buddhist sanctuary built for housing Sanskrit sutras fetched by monk Xuanzang from India.',
            coordinates: [34.2201, 108.9592]
          },
          {
            id: 'xa-p7',
            name: '大唐不夜城（梦回盛唐）',
            nameEn: 'Great Tang All Day Mall',
            type: 'attraction',
            time: '18:30',
            duration: '3h',
            cost: 0,
            bestTime: '夜色辉煌，华灯绚烂，全街化为不夜乾坤',
            crowdTimes: '20:00 后主街道寸步难行',
            tip: '强烈建议租一身国风汉服、搭配绝美的盛唐容妆，漫步在大街上，一秒沉浸式穿回大唐极乐盛宴。',
            tipEn: 'The absolute high-light. Dress deep in traditional Hanfu robes and walk the brilliant historic neon avenues.',
            coordinates: [34.2155, 108.9615]
          }
        ]
      }
    ]
  },
  chengdu: {
    cityId: 'chengdu',
    cityName: '成都',
    cityNameEn: 'Chengdu',
    daysCount: 2,
    bestSeason: '3月-6月（温和花香），9月-11月（红叶秋景）',
    bestSeasonEn: 'Mar - Jun (Spring Blossom), Sep - Nov (Stunning Red Forest & Autumn Breeze)',
    localExpense: { tickets: 110, food: 220, hotel: 340, transit: 40 },
    veteranTips: [
      '去看大熊猫基地越早越好！早晨7:30开园，大熊猫最活泼好动并进行喂食，太晚去熊猫就在梦乡里躺平了。',
      '太古里附近的高档川菜多有改良（辣度温和），地道的苍蝇小馆隐藏在九眼桥和建设路后巷中。',
      '在人民公园喝盖碗茶需要自己动手抢位置，推荐招牌鹤鸣茶社。'
    ],
    veteranTipsEn: [
      'The earlier to the Panda Base, the better! Playful baby pandas eat and roll around early; they sleep all PM.',
      'Upscale fusion spots adapt dishes for tourists; for fiery authentic taste, head to neighborhood side alleyways.',
      'Grabbing wicker chairs at Heming Teahouse requires patience and quick feet. Perfect tea spot.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'cd-p1',
            name: '成都大熊猫繁育研究基地',
            nameEn: 'Giant Panda Breeding Base',
            type: 'attraction',
            time: '07:30',
            duration: '4h',
            cost: 55,
            bestTime: '清晨08:00大熊猫集中啃食竹子、嬉戏爬树',
            crowdTimes: '09:30后太阳升起，游客长队几百米，熊猫回舍避暑了',
            tip: '买南门进、西门出的单向票票最为省劲，首冲熊猫幼儿别墅，可以近距离看到超萌的熊猫幼仔。',
            tipEn: 'Enter through the South Gate and exit West to save energy. Sprint to the baby villas immediately.',
            coordinates: [30.7335, 104.1444]
          },
          {
            id: 'cd-p2',
            name: '宽窄巷子 & 绝活川剧变脸',
            nameEn: 'Kuanzhai Alley & Sichuan Opera',
            type: 'attraction',
            time: '13:00',
            duration: '2.5h',
            cost: 40,
            bestTime: '午后在古朴川式宅院内歇脚纳凉',
            crowdTimes: '窄巷子中段极其逼仄拥堵',
            tip: '清代满城遗存，很有巴蜀韵味。巷子里的茶馆随处有掏耳朵（舒耳体验），找一家小戏台喝茶看绝技变脸、喷火表演。',
            tipEn: 'The historic streets preserve Qing dynasty compounds. Visit a teatheater to watch face-changing acts.',
            coordinates: [30.6651, 104.0532]
          },
          {
            id: 'cd-p3',
            name: '大龙燚火锅（春熙路经典麻辣）',
            nameEn: 'Da Long Yi Hot Pot (Chunxi Road)',
            type: 'food',
            time: '18:00',
            duration: '2h',
            cost: 130,
            bestTime: '17:00 前往拿号或网上预约',
            crowdTimes: '18:30-20:30 人潮涌动',
            tip: '正宗重牛油九宫格，鲜毛肚、生抠鹅肠、挂面鸭肠烫红锅，香气扑鼻。怕辣可配油碟（香油+大蒜）。',
            tipEn: 'The heavy aromatic beef-fat hotpot experience. Dip in custom garlic-sesame oil to curb the wild fire spice.',
            coordinates: [30.6542, 104.0798]
          },
          {
            id: 'cd-p4',
            name: '锦里古街（夜游看大红灯笼）',
            nameEn: 'Jinli Ancient Street 夜阑人静',
            type: 'attraction',
            time: '20:30',
            duration: '1.5h',
            cost: 0,
            bestTime: '21:00 全街大红灯笼高挂，璀璨迷人',
            crowdTimes: '夜市期间人挨着人，热闹非凡',
            tip: '临近武侯祠，传说中西蜀最古老的一条街。夜里红红火火的灯笼亮起，仿若身处千与千寻神明小镇，很有氛围。',
            tipEn: 'Adjacent to Wuhou Shrine. The lovely golden and red lanterns illuminated at night generate cozy cinematic vibes.',
            coordinates: [30.6481, 104.0494]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'cd-p5',
            name: '武侯祠（三国圣地与红墙）',
            nameEn: 'Wuhou Shrine (Red Wall Bamboo)',
            type: 'attraction',
            time: '09:00',
            duration: '2.5h',
            cost: 50,
            bestTime: '上午晨光斑驳打在夹道红墙上，拍照宛如古画',
            crowdTimes: '11:00起，红墙照相打卡点需要排队',
            tip: '全国唯一的君臣合祀祠庙，刘备与诸葛亮在此。西侧的红墙夹道、清幽翠竹是著名的网红出片机位，极富传统禅意。',
            tipEn: 'Dedicated to Zhuge Liang and Liu Bei. The red walls framed by deep green bamboo forest are visual perfection.',
            coordinates: [30.6475, 104.0485]
          },
          {
            id: 'cd-p6',
            name: '鹤鸣茶社与人民公园（体验安逸生活）',
            nameEn: 'Heming Teahouse (People’s Park Mini)',
            type: 'attraction',
            time: '13:30',
            duration: '3h',
            cost: 30,
            bestTime: '清闲下午，微风划过湖面最为悠然',
            crowdTimes: '周末下午一位难求',
            tip: '点一客招牌盖碗绿茶（竹叶青或碧潭飘雪），躺在嘎吱作响的竹编藤椅上，看老成都下棋闲聊，可以待上一整个下午。',
            tipEn: 'Rent a traditional bamboo chair, sip premium green tea, listen to cicadas, and experience Chengdu’s slow pace.',
            coordinates: [30.6558, 104.0601]
          },
          {
            id: 'cd-p7',
            name: '都江堰水利工程',
            nameEn: 'Dujiangyan Irrigation System',
            type: 'attraction',
            time: '17:00',
            duration: '3h',
            cost: 80,
            bestTime: '19:30 蓝调时刻看南桥著名的“蓝眼泪”璀璨亮灯',
            crowdTimes: '19:00 南桥观景平台上挤满了等灯的游客',
            tip: '两千多年前沿用至今的生态无坝排沙水利奇迹。傍晚南桥江水滔滔在莹蓝灯光映射下璀璨如梦，即“蓝眼泪”奇观。',
            tipEn: 'The miraculous ancient delta that harnesses wild rivers. After dusk, the illuminated river under South Bridge glows blue.',
            coordinates: [30.9984, 103.6268]
          }
        ]
      }
    ]
  },
  kyoto: {
    cityId: 'kyoto',
    cityName: '京都',
    cityNameEn: 'Kyoto',
    daysCount: 2,
    bestSeason: '11月中下（深秋红叶极盛），4月上旬（阳春染井吉野樱盛放）',
    bestSeasonEn: 'Late Nov (Peak maple autumn red), Early Apr (Spectacular Sakura cherry blossoms)',
    localExpense: { tickets: 50, food: 180, hotel: 480, transit: 30 },
    veteranTips: [
      '清水寺清晨6:00即开门！强烈建议清早8点前抵达，此时能拍到无人的清水舞台和清水古街。',
      '京都巴士一日券使用极其便利。不建议做计程车，费用极贵且早晚在河原町堵车严重。',
      '清水寺至三年坂二年坂多有石级，需穿舒适布鞋。'
    ],
    veteranTipsEn: [
      'Kiyomizu-dera opens at 06:00 AM! Highly recommend visiting before 08:30 for a pristine crowds-free garden stage.',
      ' Kyobus unlimited travel pass is a stellar deal. Taxi fees are astronomical and clog near main hubs.',
      'Sannenzaka and Ninenzaka have steep stone tiles; wear comfy athletic sneakers.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'ky-p1',
            name: '伏见稻荷大社（千本鸟居）',
            nameEn: 'Fushimi Inari-taisha Sanctuary',
            type: 'attraction',
            time: '08:00',
            duration: '2.5h',
            cost: 0,
            bestTime: '上午阳光斜射透进红色牌坊柱廊最佳',
            crowdTimes: '10:00-15:00 密密麻麻全是人',
            tip: '依山而建的成千上万座朱红色鸟居通道。如果想避开人群，请往山上多攀登20分钟，人烟会骤降，极美。',
            tipEn: 'The legendary serpentine red tunnels of torii arches. Walk 20 minutes higher up the mountain for zero tourists.',
            coordinates: [34.9671, 135.7727]
          },
          {
            id: 'ky-p2',
            name: '清水寺 & 三年坂二年坂',
            nameEn: 'Kiyomizu-dera & Ancient Sannenzaka Lanes',
            type: 'attraction',
            time: '13:00',
            duration: '3.5h',
            cost: 4,
            bestTime: '午后闲逛，清水寺舞台俯瞰全景最佳',
            crowdTimes: '全天游客爆棚，尤其是二年坂拐弯著名的塔机位',
            tip: '清水寺悬空木舞台是中国和日本唐代大木作风格继承。顺步游玩具有浓烈大正昭和民房氛围的二年坂、三年坂古街。',
            tipEn: 'The floating cantilevered wooden deck. Walk Ninhonzaka / Sannenzaka lanes with traditional wooden matcha tea stores.',
            coordinates: [34.9948, 135.7850]
          },
          {
            id: 'ky-p3',
            name: '衹园·花见小路风风火火',
            nameEn: 'Gion Hanami-koji Street',
            type: 'attraction',
            time: '18:00',
            duration: '2h',
            cost: 0,
            bestTime: '薄暮黄昏，町屋木格窗透出橘红灯光',
            crowdTimes: '19:00-21:00 游人极多',
            tip: '京都最经典的艺伎街。两旁是奢华古典的京都料亭町屋。偶遇匆匆路过的真实和服艺伎艺人，不可强行合照、触碰。',
            tipEn: 'The traditional lantern-lined district of ochaya (teahouses). Respect geishas and local rules strictly; no stalking.',
            coordinates: [35.0024, 135.7738]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'ky-p4',
            name: '金阁寺（鹿苑寺舍利殿）',
            nameEn: 'Kinkaku-ji (The Golden Pavilion)',
            type: 'attraction',
            time: '09:00',
            duration: '2h',
            cost: 8,
            bestTime: '早晨10:00前阳光直射整栋覆盖金箔的阁楼最为耀眼夺目',
            crowdTimes: '11:00-13:00 走道限制单向通行',
            tip: '整栋阁楼在镜湖池中倒影如画。金阁寺门票是一张写着“家内安全开运招福”的御守护纸，别具收藏意义。',
            tipEn: 'Plated in pure gold leaf reflecting flawlessly on Kyoto Mirror Lake garden. The ticket is a personal talisman.',
            coordinates: [35.0394, 135.7292]
          },
          {
            id: 'ky-p5',
            name: '岚山竹林小径 & 渡月桥',
            nameEn: 'Arashiyama Bamboo Grove & Togetsukyo Bridge',
            type: 'attraction',
            time: '13:00',
            duration: '3h',
            cost: 0,
            bestTime: '午后有清幽穿林微风，渡月桥上视野开阔',
            crowdTimes: '小径核心竹林段拍照游客很多',
            tip: '可以搭乘经典的嵯峨野复古观光小火车，或是在渡月桥旁的桂川畔静坐看山光水色。小径竹子高耸遮天，静谧。',
            tipEn: 'Walk the majestic shade beneath soaring emerald green hollow stalks. Majestic river and wood scenes wait.',
            coordinates: [35.0156, 135.6715]
          }
        ]
      }
    ]
  },
  paris: {
    cityId: 'paris',
    cityName: '巴黎',
    cityNameEn: 'Paris',
    daysCount: 3,
    bestSeason: '5月-10月（阳光晴朗常伴，极其适合露天塞纳河散心）',
    bestSeasonEn: 'May - Oct (Amiable mild breeze, sunny daylight, magnificent for café hopping & Seine cruise)',
    localExpense: { tickets: 120, food: 320, hotel: 750, transit: 65 },
    veteranTips: [
      '卢浮宫、奥赛美术馆每逢周二或周一限期闭馆，必须预买定时票，带上PDF存手机备查。',
      '巴黎地铁治安堪忧，吉普赛小偷常在1号线和快轨上抢夺手机钱包，切勿拿贵重物品露宿。',
      '去凯旋门拍照不一定登顶，下穿人行通道在正下方的金字塔形拱门前打卡最为震撼。'
    ],
    veteranTipsEn: [
      'Louvre closed on Tuesdays, Orsay on Mondays! Secure timed web vouchers. Carry digital files.',
      'Metro safety requires caution! Don’t put high-value gadgets in outer backpacks or open jacket pockets.',
      'No need to climb the Arc de Triomphe for a stellar picture; standing directly underneath gives maximum raw size perspective.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'pa-p1',
            name: '卢浮宫博物馆（看“蒙娜丽莎”）',
            nameEn: 'Louvre Museum Art Haven',
            type: 'attraction',
            time: '09:00',
            duration: '4h',
            cost: 22,
            bestTime: '提前预约 09:00 第一场次安检进入',
            crowdTimes: '10:00-14:00 镇馆三宝门前全是围观大队',
            tip: '古典艺术圣殿。首冲断臂维纳斯、胜利女神和蒙娜丽莎。贝聿铭设计的玻璃金字塔是极好的现代中庭。',
            tipEn: 'The golden cradle of Western visual art. See Da Vinci’s masterpiece and classical Greek sculptures.',
            coordinates: [48.8606, 2.3376]
          },
          {
            id: 'pa-p2',
            name: '塞纳河左岸经典花神咖啡馆',
            nameEn: 'Café de Flore (Left Bank Landmark)',
            type: 'food',
            time: '14:00',
            duration: '1.5h',
            cost: 35,
            bestTime: '找临街的藤椅露天雅座晒太阳暖和',
            crowdTimes: '下午茶时分排长队',
            tip: '巴黎左岸人文思潮的摇篮，毕加索、萨特曾在此辩论。点一杯经典的热巧克力（L’Chocolat Chaud）和羊角包。',
            tipEn: 'The historical sanctuary of philosophy, writers and art. Perfect to watch the stylish Parisians walk by.',
            coordinates: [48.8542, 2.3299]
          },
          {
            id: 'pa-p3',
            name: '埃菲尔铁塔与战神广场落霞',
            nameEn: 'Eiffel Tower & Champ de Mars',
            type: 'attraction',
            time: '16:30',
            duration: '2.5h',
            cost: 0,
            bestTime: '落日金光洒满铁塔钢骨和傍晚整点铁塔闪灯时刻',
            crowdTimes: '日落时刻草坪上游人密布',
            tip: '在夏约宫观景台（Trocadéro）拍摄铁塔全貌无遮挡。每逢入夜后整点，会有5分钟绚烂的金色星光灯闪烁。',
            tipEn: 'Unrivaled views are shot from Trocadéro terrace across the river. The glittering golden dots spark every hour.',
            coordinates: [48.8584, 2.2945]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'pa-p4',
            name: '巴黎圣母院外貌（西堤岛漫步）',
            nameEn: 'Cathédrale Notre-Dame (Île de la Cité)',
            type: 'attraction',
            time: '10:00',
            duration: '2h',
            cost: 0,
            bestTime: '塞纳河晨雾散去，圣母院飞扶壁巍峨可见',
            crowdTimes: '周边步行桥上拍照者众多',
            tip: '哥特式大建筑的巅峰之作。顺路在旁边的莎士比亚书店（Shakespeare & Company）选购一本盖有独特邮戳的中世纪图书。',
            tipEn: 'The apex of French gothic. Grab a souvenir book from the famous Shakespeare & Co. across the lane.',
            coordinates: [48.8530, 2.3499]
          },
          {
            id: 'pa-p5',
            name: '奥赛博物馆',
            nameEn: 'Musée d’Orsay Impressionism',
            type: 'attraction',
            time: '13:30',
            duration: '3h',
            cost: 16,
            bestTime: '下午在巨大的旧火车站玻璃穹顶下看画最惬意',
            crowdTimes: '14:30 黄金人流高峰',
            tip: '由火车站改建的精美博物馆。收藏了世界最顶尖的印象派和后印象派大师杰作（梵高、莫奈、雷诺阿、塞尚）。',
            tipEn: 'A restored Beaux-Arts railway terminal containing legendary paintings by Van Gogh, Monet, and Renoir.',
            coordinates: [48.8599, 2.3265]
          },
          {
            id: 'pa-p6',
            name: '塞纳河日落豪华游船商务体验',
            nameEn: 'Seine River Cruise (Bateaux Parisiens)',
            type: 'attraction',
            time: '18:00',
            duration: '1.5h',
            cost: 18,
            bestTime: '金红晚霞染红两岸巴黎皇家行宫和古桥的瞬间',
            crowdTimes: '每班定点游船座位满满',
            tip: '登船徐行穿过新桥、亚历山大三世桥。两岸卢浮宫、协和广场在金辉余晖中倒影流淌，美不胜收。',
            tipEn: 'Cruise under historic stone bridges which light up like floating embers in the shimmering twilight water.',
            coordinates: [48.8615, 2.3235]
          }
        ]
      },
      {
        day: 3,
        pois: [
          {
            id: 'pa-p7',
            name: '香榭丽舍大街 & 巴黎凯旋门',
            nameEn: 'Champs-Élysées & Arc de Triomphe',
            type: 'attraction',
            time: '09:30',
            duration: '2.5h',
            cost: 13,
            bestTime: '上午车辆和行人稀少，主干道视廊极佳',
            crowdTimes: '午后买奢侈品的排队长龙布满人行道',
            tip: '可以买票登上凯旋门顶端平台，笔直朝下的12条宏大林荫大道像光芒般散开，俯瞰极致几何震撼。',
            tipEn: 'A monumental stone arch built for victory. Stand on top to gaze at the twelve geometric stellar avenues.',
            coordinates: [48.8738, 2.2950]
          },
          {
            id: 'pa-p8',
            name: '蒙马特高地 & 圣心大教堂（写生画家）',
            nameEn: 'Montmartre & Sacré-Cœur Basilica',
            type: 'attraction',
            time: '13:30',
            duration: '3h',
            cost: 0,
            bestTime: '看画家在小丘广场勾勒肖像，在圣心堂台阶听流浪歌手唱歌',
            crowdTimes: '台阶和周围窄巷常有防不胜防的红绳套手推销',
            tip: '俯瞰全巴黎日落与天际线的最高落脚处。小心在此纠缠游客硬套红绳的人，微笑并快速推手走开即可。',
            tipEn: 'The bohemian home of artists. Gaze at Paris rooftop lines from the steep stairs of the giant white chapel.',
            coordinates: [48.8867, 2.3431]
          }
        ]
      }
    ]
  },
  sanya: {
    cityId: 'sanya',
    cityName: '三亚',
    cityNameEn: 'Sanya',
    daysCount: 2,
    bestSeason: '10月-次年4月（避开高热暴雨和台风季，天蓝温润，避寒天堂）',
    bestSeasonEn: 'Oct - Apr (Dry breeze, escaping cold winter, prime beach sun leisure)',
    localExpense: { tickets: 160, food: 180, hotel: 680, transit: 80 },
    veteranTips: [
      '蜈支洲岛船票含在门票内，极力推荐坐早班8:00第一班渡轮登岛，海水能见度极高，沙滩最干净！',
      '三亚本地海鲜宰客现象时有发生，推荐去火车头万人海鲜广场或亚龙湾正规餐饮中心团购，算好价格再开单。',
      '热带天堂森林公园里的过江龙索桥是拍摄电影非诚勿扰同款网红打卡点，周末排队至少40分钟起。'
    ],
    veteranTipsEn: [
      'Wuzhizhou island ferries are included in tickets. Take the first 08:00 AM ride for premium clear water.',
      'To prevent seafood pricing tricks, stick to government-certified seafood centers and verify scales first.',
      'Tropical Paradise forest bridge was made famous in cinema. Avoid peak noon queues if possible.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'sy-p1',
            name: '亚龙湾国家旅游度假区（椰风海滩）',
            nameEn: 'Yalong Bay Golden Coastline',
            type: 'attraction',
            time: '09:00',
            duration: '3h',
            cost: 0,
            bestTime: '上午阳光璀璨，沙滩最显白细，海浪温和',
            crowdTimes: '下午大批酒店泳客漫步海边',
            tip: '享有“天下第一湾”之美誉。沙滩洁白如银，海水清澈蔚蓝。这里非常适合游泳、体验香蕉船等海上游乐。',
            tipEn: 'Renowned as the crown beach. Ultra-fine white sand and turquoise surf. Perfect for diving or light coastal reading.',
            coordinates: [18.2238, 109.6582]
          },
          {
            id: 'sy-p2',
            name: '林姐椰子鸡（亚龙湾店）',
            nameEn: 'Sister Lin Coconut Chicken (Yalong)',
            type: 'food',
            time: '12:30',
            duration: '1.5h',
            cost: 110,
            bestTime: '大快朵颐椰汁煮文昌鸡的香气，适合中午清润开胃',
            crowdTimes: '12:00-13:00 店内几乎坐满',
            tip: '三亚必吃名菜。用三个新鲜椰子现开倒汤作为锅底，不添加一滴水。加入海南散养文昌鸡，汤底清甜、鸡肉紧实弹牙。',
            tipEn: 'Vibrant local classic. Fresh raw coconut water boiled with organic, tender Wenchang chicken segments.',
            coordinates: [18.2301, 109.6450]
          },
          {
            id: 'sy-p3',
            name: '亚龙湾热带天堂森林公园',
            nameEn: 'Yalong Bay Tropical Forest Park',
            type: 'attraction',
            time: '14:30',
            duration: '4h',
            cost: 140,
            bestTime: '下午16:00在沧海楼俯瞰整个弧形亚龙湾，大开眼界',
            crowdTimes: '索道和观光电车中转处常排长队',
            tip: '坐极速过山车般的丛林游览车，越过高大热带雨林。站在索桥上，被满目翠绿包围，仿佛漫步在精灵森林之中。',
            tipEn: 'Ride fast open-air mountain shuttles. Standing on the high bridge over the deep valley offers supreme photography.',
            coordinates: [18.2392, 109.6385]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'sy-p4',
            name: '蜈支洲岛度假区（三亚玻璃水天堂）',
            nameEn: 'Wuzhizhou Coral Island Marine',
            type: 'attraction',
            time: '08:00',
            duration: '5.5h',
            cost: 136,
            bestTime: '上午海水极度清澈，太阳照射下现出梦幻蓝绿色分层',
            crowdTimes: '10:00后码头等船区会有大型旅游团聚集排长队',
            tip: '被称为中国马尔代夫。如果预算充裕，强烈购买观光车环岛游（电瓶车），能在车上饱览不开放的壮丽怪石和玻璃海。',
            tipEn: 'Commonly described as China’s Maldives. Getting a buggy-car ticket lets you inspect secret volcanic rocks and private lagoons.',
            coordinates: [18.3142, 109.7612]
          },
          {
            id: 'sy-p5',
            name: '第一市场海鲜加工大餐',
            nameEn: 'First Market Fresh Seafood Haven',
            type: 'food',
            time: '18:30',
            duration: '2.5h',
            cost: 160,
            bestTime: '傍晚大红市场刚进海鲜时食材最新鲜生猪好肉',
            crowdTimes: '19:00-21:00 极其喧嚣拥挤',
            tip: '建议自己去水产摊挑生猛青蟹、皮皮虾、芒果螺，切记算准斤两，并送到口碑极好的老牌店进行加工，辣炒与椒盐是最棒的口味。',
            tipEn: 'Pick fresh giant crabs, mantis shrimp and clams from vendors, choose spicy stir-fry or garlic-butter in trusted stores.',
            coordinates: [18.2492, 109.5101]
          }
        ]
      }
    ]
  },
  tokyo: {
    cityId: 'tokyo',
    cityName: '东京',
    cityNameEn: 'Tokyo',
    daysCount: 3,
    bestSeason: '10月-11月（红叶与银杏叶漫天），3月-4月（落樱粉白缤纷）',
    bestSeasonEn: 'Oct - Nov (Autumn golden ginkgo & deep maple reds), Mar - Apr (Sakura cherry season)',
    localExpense: { tickets: 80, food: 220, hotel: 650, transit: 50 },
    veteranTips: [
      'SHIBUYA SKY（涩谷天空）露天观光台门票极抢手，通常在提前4周售票当天数分钟内将日落黄金档售空，请提早下手。',
      '东京地铁极其密如蛛网，单独买单次票既费心又多花钱，一定要买 24h / 48h / 72h 地铁无限次通票。',
      '筑地场外市场小吃众多，多数店铺13:00后陆续收市，建议清空胃口早上9:00前往。'
    ],
    veteranTipsEn: [
      'SHIBUYA SKY open sunset tickets sell out within minutes of release! Reserve exactly 4 weeks early online.',
      'Tokyo subways are legendary labyrinth-like webs. Buy the 24/48/72 hours Tokyo Subway Ticket to save cost & stress.',
      'Tsukiji Outer Market has amazing fresh fish. Shuts down near 13:00; head early for ultimate brunch spoils.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'tk-p1',
            name: '浅草寺与仲见世通',
            nameEn: 'Senso-ji Temple & Nakamise Shopping',
            type: 'attraction',
            time: '08:30',
            duration: '2.5h',
            cost: 0,
            bestTime: '清晨红漆雷门和主院无大批拥挤游客的最佳拍照角度',
            crowdTimes: '10:00 之后主街道被人群彻底吞没',
            tip: '东京最悠久的佛寺，极巨大的“雷门”红色提灯极具震慑力。在大殿可以花100日元拍手抽一张签，抽到凶系挂在架子上消灾。',
            tipEn: 'The oldest, iconic temple of Tokyo. Draw an omikuji (fortune slip); tie any bad luck results onto the iron racks.',
            coordinates: [35.7148, 139.7967]
          },
          {
            id: 'tk-p2',
            name: '筑地场外市场（享寿司、生蚝大餐）',
            nameEn: 'Tsukiji Outer Market Seafood Feast',
            type: 'food',
            time: '11:30',
            duration: '2h',
            cost: 90,
            bestTime: '趁着新鲜货满载时大饱口福',
            crowdTimes: '11:00-12:30 所有招牌海鲜丼长队密布',
            tip: '生猪肉、玉子烧、现开生蚝极多。可以尝试香甜多汁的炭烤和牛肉串和正宗的吞拿鱼寿司，食材极佳。',
            tipEn: 'Enjoy ultra-fresh tuna bowls, grilled wagyu skewers, sweet tamagoyaki egg blocks and massive sea oysters.',
            coordinates: [35.6655, 139.7702]
          },
          {
            id: 'tk-p3',
            name: '秋叶原电器街及动漫二次元圣心',
            nameEn: 'Akihabara Electric Town',
            type: 'attraction',
            time: '14:00',
            duration: '3.5h',
            cost: 0,
            bestTime: '午后淘货时光，高达玩具、绝版手办琳琅满目',
            crowdTimes: '周末步行街开放，客流到达顶峰',
            tip: '全球硬核漫迷的朝圣首选地。大名鼎鼎的Mandarake（手办店）和Radio Kaikan（电波会馆）非常耐看，藏品无数。',
            tipEn: 'The ultimate anime and gaming capital. Towering stores are packed full of retro game boxes and collectible figurines.',
            coordinates: [35.6997, 139.7714]
          },
          {
            id: 'tk-p4',
            name: '东京塔眺望（六本木之丘看塔最佳）',
            nameEn: 'Tokyo Tower View (Roppongi Hills)',
            type: 'attraction',
            time: '18:30',
            duration: '2.5h',
            cost: 15,
            bestTime: '红白东京塔在漫天霓虹中亮起温馨橙光的一刻',
            crowdTimes: '展望台看塔落地玻璃窗前极受欢迎',
            tip: '与其登塔，不如在六本木之丘（Roppongi Hills）观光层远望东京塔。暖金明艳的巨塔在璀璨东京夜色背景中如一颗耀眼珠宝。',
            tipEn: 'Viewing the tower from Roppongi Hills is infinitely more gorgeous than climbing it, framing it perfectly beside neon roads.',
            coordinates: [35.6586, 139.7454]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'tk-p5',
            name: '明治神宫（闹市里的森林绿肺）',
            nameEn: 'Meiji Jingu Shrine & Forest',
            type: 'attraction',
            time: '09:00',
            duration: '2h',
            cost: 0,
            bestTime: '清晨薄雾中，参天大树和鸟鸣带来极度宁静安祥',
            crowdTimes: '周末有极大概率目睹传统神道婚礼（神前结婚式）',
            tip: '步入巨大宏伟的木制“大鸟居”，穿越参天巨木构筑之林荫幽径，可以购买一份心愿木绘（绘马）写上祈愿。',
            tipEn: 'Pass the colossal wooden Torii arch built of 1500-year-old cedar. Walking the gravel path naturally calms the mind.',
            coordinates: [35.6764, 139.6993]
          },
          {
            id: 'tk-p6',
            name: '表参道 & 原宿竹下通街头时尚',
            nameEn: 'Omotesando & Harajuku Fashion Stroll',
            type: 'attraction',
            time: '11:30',
            duration: '3h',
            cost: 0,
            bestTime: '午后散心，看怪中怪奇的朋克朋克和洛丽塔打扮',
            crowdTimes: '竹下通坡道上全是东京年轻人',
            tip: '一街之隔，两个世界：竹下通聚集着色彩斑斓、吃着彩虹可丽饼的原宿二次元少年；表参道林立顶尖的几何安藤忠雄等名师大师级建筑。',
            tipEn: 'Two worlds: Harajuku pops with colorful cosplay and giant crêpes; Omotesando layout features sleek master architecture galleries.',
            coordinates: [35.6686, 139.7094]
          },
          {
            id: 'tk-p7',
            name: '涩谷十字路口与涩谷SKY高空落日',
            nameEn: 'Shibuya Crossing & SHIBUYA SKY',
            type: 'attraction',
            time: '15:30',
            duration: '3h',
            cost: 16,
            bestTime: '日落前半小时至华灯璀璨的黄金2小时过渡',
            crowdTimes: '17:00-19:00 日落时段一位难求，必须提前1个月预约',
            tip: '登上47层露天天空瞭望台，看著名的“涩谷对角马路”行人群流如蚁，并在高空中俯瞰，天气晴朗能直接眺望富士山！',
            tipEn: 'Rise to the open-air roof of Shibuya Sky. Gaze down on the busiest crossing in the world. Clear days offer views of Mount Fuji.',
            coordinates: [35.6585, 139.7018]
          }
        ]
      },
      {
        day: 3,
        pois: [
          {
            id: 'tk-p8',
            name: '新宿御苑',
            nameEn: 'Shinjuku Gyoen Garden',
            type: 'attraction',
            time: '09:30',
            duration: '2.5h',
            cost: 4,
            bestTime: '上午微风吹起大草坪树梢，野餐体验绝佳',
            crowdTimes: '樱花季极其拥挤，多为野餐赏樱客',
            tip: '新海诚《言叶之庭》动画的核心原型地。日式池泉回游园林、英式大温室与法式刺绣画院相结合，美不胜收。',
            tipEn: 'The central garden featured in anime "The Garden of Words". Walk the masterfully curated Japanese, French and English zones.',
            coordinates: [35.6852, 139.7101]
          }
        ]
      }
    ]
  },
  guangzhou: {
    cityId: 'guangzhou',
    cityName: '广州',
    cityNameEn: 'Guangzhou',
    daysCount: 2,
    bestSeason: '10月-次年3月 (气温适宜，饮茶赏夜最佳)',
    bestSeasonEn: 'Oct-Mar (Amiable cool breeze, prime Canton dining)',
    localExpense: { tickets: 10, food: 180, hotel: 350, transit: 30 },
    veteranTips: [
      '“陶陶居”和“点都德”是极高人气的代表茶楼，建议上午8:00前抵达入座避开排队，享用地道早茶点心。',
      '广州塔（小蛮腰）在江畔夜晚19:00至22:00亮灯最为绚烂。如果不想排长队登塔，珠江北岸的海心沙或花城广场是最佳免费拍照点。'
    ],
    veteranTipsEn: [
      'Tao Tao Ju and Dian Du De are prime Cantonese tea houses. Secure seats before 08:00 AM to enjoy legendary dim sum stress-free.',
      'Canton Tower lights up brilliantly from 19:00 to 22:00. Head to Haixinsha Park across the river for breathtaking free skyline views.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'gz-p1',
            name: '陈家祠（岭南木雕石雕博物馆）',
            nameEn: 'Chen Clan Ancestral Hall',
            type: 'attraction',
            time: '09:00',
            duration: '2h',
            cost: 10,
            bestTime: '清晨柔和阳光照亮精细砖雕雕刻，适合微距摄影',
            crowdTimes: '10:30后大批团客抵达，走廊较为拥挤',
            tip: '堪称“岭南艺术建筑的璀璨明珠”。汇聚了极尽繁复的灰塑、石雕、木雕，每一处神话寓言栩栩如生。',
            tipEn: 'Commonly framed as the crown jewel of Lingnan arts and architecture. Observe ornate brick reliefs and historical woodcarvings.',
            coordinates: [23.1257, 113.2428]
          },
          {
            id: 'gz-p2',
            name: '泮溪酒家（荔湾湖畔园林早茶）',
            nameEn: 'Panxi Garden Restaurant',
            type: 'food',
            time: '11:30',
            duration: '1.5h',
            cost: 80,
            bestTime: '临池荷花阁榻，佐以精湛茶点，凉风过岸最惬意',
            crowdTimes: '12:00-13:30 经典大厅全部客满',
            tip: '全国极负盛名的国营老字号园林酒店。招牌红米肠、粉蒸排骨、笋尖虾饺让人流连忘返。',
            tipEn: 'The monumental legacy Cantonese teahouse in Liwan. Enjoy traditional steam baskets beside bridges and weeping willows.',
            coordinates: [23.1245, 113.2356]
          },
          {
            id: 'gz-p3',
            name: '沙面岛（欧华复古风情历史街区）',
            nameEn: 'Shamian Island European Settlement',
            type: 'attraction',
            time: '14:30',
            duration: '3h',
            cost: 0,
            bestTime: '落日晚霞斜斜透入斑驳古树阴，极富怀旧感',
            crowdTimes: '周末下午会有大批婚纱摄影和旅拍人士聚集',
            tip: '曾经的英法租界地，这里林立着数十座新古典主义、哥特及巴洛克式西式别墅。非常适合在绿荫下品尝精品冷萃咖啡。',
            tipEn: 'The historical sandbox of classic European villas. Stroll amongst hundred-year camphor trees and colonial structures.',
            coordinates: [23.1116, 113.2405]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: 'gz-p4',
            name: '海心桥与二沙岛步道',
            nameEn: 'Haixin Bridge & Ersha Island Walk',
            type: 'attraction',
            time: '15:30',
            duration: '2.5h',
            cost: 0,
            bestTime: '黄昏斜阳倒映珠江水面，微风微澜',
            crowdTimes: '18:00后下班和散步市民会显著增加',
            tip: '横跨珠江的标志性人行曲桥，从这可以闲庭信步至绿海般的二沙岛，两岸绿意葱茏，小蛮腰近在咫尺。',
            tipEn: 'A magnificent curved pedestrian bridge across Pearl River. Walk among massive lawns to find stunning skyline points.',
            coordinates: [23.1102, 113.3150]
          },
          {
            id: 'gz-p5',
            name: '惠食佳（Binjiang 滨江大连店）',
            nameEn: 'Huishijia Gourmet Restaurant',
            type: 'food',
            time: '18:30',
            duration: '2h',
            cost: 130,
            bestTime: '趁着热腾腾、滋滋作响端上桌时瞬间品尝，镬气十足',
            crowdTimes: '每天晚上18:30-20:30排长队，一定要提前排号',
            tip: '登上《舌尖上的中国》的招牌啫啫煲专家。黄鳝啫啫煲、蚝烙以及经典煲仔饭，绝对是广府厨艺精粹的完美体验。',
            tipEn: 'The legendary establishment featured in documentaries. Sizzling claypots of fresh eel, ginger, and garlic caramelized perfectly.',
            coordinates: [23.1112, 113.2750]
          }
        ]
      }
    ]
  },
  hangzhou: {
    cityId: 'hangzhou',
    cityName: '杭州',
    cityNameEn: 'Hangzhou',
    daysCount: 2,
    bestSeason: '3月-5月 (桃花初綻、细雨苏堤)，9月-11月 (满陇桂雨、平湖秋月)',
    bestSeasonEn: 'Mar-May (Spring peach blossoms and misty rains), Sep-Nov (Sweet osmanthus and clear golden moon)',
    localExpense: { tickets: 55, food: 150, hotel: 420, transit: 30 },
    veteranTips: [
      '西湖在周末或晴天游客极多，强烈推荐安排清晨6:30以前或者晚上21:00之后散步游览，能完全领略到“苏堤春晓”的静谧神韵。',
      '龙井村和九溪十八涧连接紧凑，非常适合下午开展徒步。在山谷农家院落，要一盏现泡正宗西湖龙井茶，呼吸雨林山谷芬芳。'
    ],
    veteranTipsEn: [
      'The West Lake is legendary for holiday crowds. Try an early walk before 06:30 AM to catch Zen-like mist and glassy, quiet waters.',
      'The Nine Creeks valley is perfect for woodland trekking. Order a cup of authentic organic Longjing Green Tea direct from tea farmers.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'hz-p1',
            name: '西湖苏堤漫步与三潭印月游船',
            nameEn: 'Su Causeway Walk & West Lake Ferry',
            type: 'attraction',
            time: '08:00',
            duration: '3h',
            cost: 55,
            bestTime: '清晨微风吹动翠柳，湖面水平如镜，光影迷离',
            crowdTimes: '09:30后团队大巴在断桥和堤岸集散，人稠',
            tip: '乘船至湖心深处，能近距离观赏三座立于水中的宋代石塔，这也是中国人民币一元纸币的实景背景地。',
            tipEn: 'Walk the classic willow-lined boulevard, then hop a wooden cruiser to view the three historical stone shrines rising out of the water.',
            coordinates: [30.2450, 120.1412]
          },
          {
            id: 'hz-p2',
            name: '楼外楼（百年西湖畔名馆）',
            nameEn: 'Lou Wai Lou Historic Lakeside Restaurant',
            type: 'food',
            time: '11:30',
            duration: '1.5h',
            cost: 110,
            bestTime: '临窗隔案俯眺西湖水光，佐以名品香气，极为享受',
            crowdTimes: '中午12:00后入店点餐通常需要等待超过半小时',
            tip: '声名远扬的江南文化老字号。西湖醋鱼、东坡肉、龙井虾仁是代代相传、不容错过的极尽优雅名肴。',
            tipEn: 'The hundred-year culinary landmark situated directly on West Lake edge. Taste glazed tender Dongpo pork cubes and sweetened vinegar sea fish.',
            coordinates: [30.2520, 120.1420]
          },
          {
            id: 'hz-p3',
            name: '灵隐古刹与飞来峰造像',
            nameEn: 'Lingyin Temple & Feilai Peak Grottoes',
            type: 'attraction',
            time: '14:00',
            duration: '3.5h',
            cost: 75,
            bestTime: '午后斜光掠过古树林梢，投射在斑驳青苔和石壁大佛上，极富禅意',
            crowdTimes: '主殿大雄宝殿内常年香火缭绕、游人如织',
            tip: '隐于苍翠参天老树丛林中，灵隐寺是国内香火最旺的千年名刹。飞来峰石壁上开凿的数百尊精美佛雕刻功力非凡。',
            tipEn: 'A magnificent thousand-year Buddhist monastery hidden in primeval towering cryptomeria glades. View ancient grotto sandstone carvings.',
            coordinates: [30.2432, 120.1015]
          }
        ]
      }
    ]
  },
  london: {
    cityId: 'london',
    cityName: '伦敦',
    cityNameEn: 'London',
    daysCount: 2,
    bestSeason: '5月-9月 (温和晴朗，昼长夜短多达16小时，公园绿阴如海)',
    bestSeasonEn: 'May-Sep (Pleasant, sunny and cool. Long summer daylight up to 16h, lovely picnics)',
    localExpense: { tickets: 40, food: 220, hotel: 750, transit: 50 },
    veteranTips: [
      '伦敦大部分顶级国家级博物馆（如大英博物馆、国家美术馆、自然历史博物馆）都是完全免费开放的，但一定要提前在官方网站上预定免费的入馆电子票。',
      '伦敦眼的价格非常昂贵，如果想要免费饱览壮观的伦敦高空全景，可以提前预约位于金融城小山丘的空中花园 (Sky Garden)。'
    ],
    veteranTipsEn: [
      'National museums in London (British Museum, National Gallery, etc.) are entirely free for the public, but booking timed-entry tickets online early is highly required.',
      'The London Eye tickets are pricey; save budgets by booking free entrance passes to the Sky Garden for scenic, lush indoor platform panoramic views.'
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: 'ld-p1',
            name: '大英博物馆（世界文明历史圣殿）',
            nameEn: 'The British Museum',
            type: 'attraction',
            time: '10:00',
            duration: '3.5h',
            cost: 0,
            bestTime: '上午入场，在大穹顶玻璃采光中拍摄恢宏合影',
            crowdTimes: '每天的11:00后展厅的核心埃及木乃伊长廊会寸步难行',
            tip: '震撼的世界文明宝库。千万不要错过罗塞塔石碑（Rosetta Stone）和精美绝伦的帕特农神庙大理石雕，饱览历史岁月。',
            tipEn: 'The grand world treasure vault. Pay close inspection to the legendary Rosetta Stone and magnificent Elgin Marbles under the beautiful geometric glass dome.',
            coordinates: [51.5194, -0.1270]
          },
          {
            id: 'ld-p2',
            name: 'The Eagle Pub（Covent Garden 经典地道酒馆）',
            nameEn: 'The Eagle Pub - Covent Garden',
            type: 'food',
            time: '13:30',
            duration: '1.5h',
            cost: 30,
            bestTime: '热气腾腾的刚起锅炸鱼入口一刻最为香酥。配上一口精酿，唇齿留香',
            crowdTimes: '12:30 抢夺卡座极为活跃，排位较紧凑',
            tip: '体验最正宗的伦敦饮食街头文化——大分量炸鱼薯条（Fish & Chips），搭配一口饱含果香的Pale Ale，风味绝佳。',
            tipEn: 'Taste standard, perfectly battered crispy golden cod segments paired with fat chips, mushy peas and dynamic tartar sauces.',
            coordinates: [51.5135, -0.1240]
          },
          {
            id: 'ld-p3',
            name: '大本钟、西敏寺与泰晤士河岸观景',
            nameEn: 'Big Ben, Westminster & Thames Embankment',
            type: 'attraction',
            time: '15:30',
            duration: '3h',
            cost: 0,
            bestTime: '日落晚霞勾勒出伦敦眼与红色双层巴士缓缓驶过西敏桥的黄金画面',
            crowdTimes: '桥头中央地带游客极多，务必随时注意个人财物安全',
            tip: '伦敦举世闻名的第一风景。拍摄壮观的伊丽莎白塔（大本钟），顺着江岸漫步至雄伟的威斯敏斯特教堂，耳畔回响沉重悠扬的古老钟声。',
            tipEn: 'Take perfect postcards of the majestic Elizabeth Tower, cross the bridge to inspect Gothic Westminster Abbey, and listen to authentic chimes.',
            coordinates: [51.5007, -0.1246]
          }
        ]
      }
    ]
  }
};

export function generateLocalPlan(cityId: string, daysRequested: number): DetailedCityPlan {
  // If we have detailed custom templates, we use them directly
  const cachedPlan = CITIES_DETAIL[cityId];
  const cityIdx = ALL_CITIES_INDEX.find((c) => c.id === cityId);
  const name = cityIdx ? cityIdx.name : cityId;
  const nameEn = cityIdx ? cityIdx.nameEn : cityId;
  const lat = cityIdx ? cityIdx.coordinates[0] : 39.9042;
  const lng = cityIdx ? cityIdx.coordinates[1] : 116.4074;

  if (cachedPlan) {
    // If the days requested match, return. If days are different, scale dynamically.
    const result: DetailedCityPlan = JSON.parse(JSON.stringify(cachedPlan));
    result.daysCount = daysRequested;
    
    if (daysRequested <= cachedPlan.days.length) {
      result.days = result.days.slice(0, daysRequested);
    } else {
      // Loop over existing days to pad to the requested length
      while (result.days.length < daysRequested) {
        const nextDayNum = result.days.length + 1;
        const originalDayTemplate = cachedPlan.days[(nextDayNum - 1) % cachedPlan.days.length];
        const deepCopyDay = JSON.parse(JSON.stringify(originalDayTemplate));
        deepCopyDay.day = nextDayNum;
        // Mutate individual POI IDs to avoid duplicates in react keys
        deepCopyDay.pois.forEach((poi: POI, idx: number) => {
          poi.id = `${cityId}-p-d${nextDayNum}-${idx}`;
        });
        result.days.push(deepCopyDay);
      }
    }

    // Multiply local cost estimates
    const ratio = daysRequested / cachedPlan.daysCount;
    result.localExpense = {
      tickets: Math.round(cachedPlan.localExpense.tickets * ratio),
      food: Math.round(cachedPlan.localExpense.food * ratio),
      hotel: Math.round(cachedPlan.localExpense.hotel * ratio),
      transit: Math.round(cachedPlan.localExpense.transit * ratio),
    };

    return result;
  }

  // Fallback for non-cached cities - Generate a beautiful structured programmatic template matching the city selection
  const days: { day: number; pois: POI[] }[] = [];
  for (let d = 1; d <= daysRequested; d++) {
    days.push({
      day: d,
      pois: [
        {
          id: `${cityId}-programmatic-d${d}-p1`,
          name: `${name}核心名胜漫步 (D${d}-01)`,
          nameEn: `${nameEn} Landmark Excursion (Day ${d} - AM)`,
          type: 'attraction',
          time: '09:00',
          duration: '3h',
          cost: 60,
          bestTime: '09:00 - 11:30',
          crowdTimes: '10:30-12:00',
          tip: '该城市的代表性地标。文化气势恢宏，人文底蕴极为深厚，建议请导览或者配合官方耳机解读享受古典景观。',
          tipEn: 'The definitive local point of high interest. Beautiful architecture and scenery. Early stroll is delightful.',
          coordinates: [lat + 0.005 * d, lng - 0.008 * d]
        },
        {
          id: `${cityId}-programmatic-d${d}-p2`,
          name: `${name}特色老字号饕餮大餐 (D${d}-02)`,
          nameEn: `${nameEn} Gourmet Legacy (Day ${d} - Lunch)`,
          type: 'food',
          time: '12:30',
          duration: '1.5h',
          cost: 75,
          bestTime: '12:00 - 13:00',
          crowdTimes: '12:30 爆满',
          tip: '该地区久负盛名的传统排队老铺。招牌特色风味让人流连忘返，风味绝佳！配上一碗鲜汤简直绝伦。',
          tipEn: 'Voted high by local critiques. Savory dishes prepared using raw, organic local methods.',
          coordinates: [lat - 0.003 * d, lng + 0.002 * d]
        },
        {
          id: `${cityId}-programmatic-d${d}-p3`,
          name: `${name}现代人文街区与午后游赏 (D${d}-03)`,
          nameEn: `${nameEn} Cultural Neighborhood (Day ${d} - PM)`,
          type: 'attraction',
          time: '14:30',
          duration: '3.5h',
          cost: 25,
          bestTime: '15:00',
          crowdTimes: '周末或节假日道路密布热闹',
          tip: '极具浪漫或当地烟火气的市井商业老街。林立着独立咖啡馆、陶艺馆与手推画摊，非常文艺出圈。',
          tipEn: 'A fascinating walking lane loaded with street vendors, local handicrafts and unique photo opportunities.',
          coordinates: [lat - 0.008 * d, lng - 0.003 * d]
        }
      ]
    });
  }

  return {
    cityId,
    cityName: name,
    cityNameEn: nameEn,
    daysCount: daysRequested,
    bestSeason: '适宜四季行游（春秋最盛）',
    bestSeasonEn: 'All seasons amiable (Spring & Autumn are perfect)',
    localExpense: {
      tickets: 80 * daysRequested,
      food: 120 * daysRequested,
      hotel: 280 * daysRequested,
      transit: 30 * daysRequested,
    },
    veteranTips: [
      `游玩 ${name} 时，建议准备轻便随身行囊与自适应鞋履。`,
      '提前查看当地轨道或者客运通行证，不仅便捷还能享受巨额折惠。',
      '避开高峰景区的流动推销食品，多选择老街弄里的深耕老字号。'
    ],
    veteranTipsEn: [
      `When traveling through ${nameEn}, pack light and carry responsive footwear.`,
      'Inter-district transportation combined passes frequently slash prices by half.',
      'To curb dynamic gourmet pricing traps, look deep into residential old avenues.'
    ],
    isAiEnhanced: false,
    days
  };
}
