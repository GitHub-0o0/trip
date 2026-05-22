/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationDict {
  brandTitle: string;
  brandSub: string;
  wizardTitle: string;
  originLabel: string;
  originPlaceholder: string;
  popularOrigins: string;
  destLabel: string;
  destPlaceholder: string;
  popularDests: string;
  selectedDestsTitle: string;
  daysLabel: string;
  aiEnhanceLabel: string;
  aiEnhanceSub: string;
  btnNext: string;
  btnPrev: string;
  btnGenerate: string;
  loadingTitle: string;
  loadingSub: string;
  overviewTitle: string;
  totalBudget: string;
  totalDays: string;
  budgetBreakdown: string;
  cityDetailsTitle: string;
  bestSeason: string;
  veteranTips: string;
  tabDay: string;
  viewDetails: string;
  duration: string;
  cost: string;
  bestWatchTime: string;
  crowdedHours: string;
  localTips: string;
  btnBack: string;
  navPlan: string;
  navOverview: string;
  navHistory: string;
  navSettings: string;
  navCompare: string;
  navReceipts: string;
  receiptsTitle: string;
  receiptsSub: string;
  btnClearCache: string;
  aboutTitle: string;
  historyTitle: string;
  noHistory: string;
  settingsLanguage: string;
  compareTitle: string;
  colCity: string;
  colDays: string;
  colTransit: string;
  colExpense: string;
  colTotal: string;
  colSeason: string;
  colTags: string;
  recommendLabel: string;
  transitFlight: string;
  transitTrain: string;
  transitCar: string;
  transitBus: string;
  transitPrice: string;
  transitDuration: string;
  transitAdvice: string;
  costTickets: string;
  costFood: string;
  costHotel: string;
  costTransit: string;
  aiEnhancedActive: string;
  aiUpgradeBtn: string;
  errorForbiddenOrig: string;
  errorMaxDest: string;
  errorNoDest: string;
  errorOrigRequired: string;
  searchAddUnknown: string;
  onlineSearching: string;
}

export const translations: { [lang: string]: TranslationDict } = {
  zh: {
    brandTitle: '旅途 (Trip AI)',
    brandSub: '基于 AI 的全球智能行程规划助手',
    wizardTitle: '开启您的专属探索日程',
    originLabel: '第一步：选择出发城市',
    originPlaceholder: '搜索城市名称/拼音字母/英文名 (如 "北京"、"bj"、"beijing")',
    popularOrigins: '热门出发城市',
    destLabel: '第二步：添加您的行程目的地 (最多 10 个)',
    destPlaceholder: '搜索您向往的目的地城市并添加...',
    popularDests: '人气目的地推荐',
    selectedDestsTitle: '已添加目的地及其停驻天数',
    daysLabel: '停留时长',
    aiEnhanceLabel: '开启 AI 行程智能增强 (推荐)',
    aiEnhanceSub: '由 Gemini 大模型实时规划、定制专属精细化、高可信度吃住行玩 POI 信息',
    btnNext: '下一步',
    btnPrev: '返回上步',
    btnGenerate: '一键生成梦想路线 🚀',
    loadingTitle: 'Trip AI 正在为您深度定制行程中...',
    loadingSub: '正在调用 Gemini 精准规划每个城市的景点串联、寻找地道吃住与交通花费，大概需要 5-10 秒，请稍后...',
    overviewTitle: '行程方案全貌汇总',
    totalBudget: '总预算预估',
    totalDays: '行程总天数',
    budgetBreakdown: '费用项多维拆解',
    cityDetailsTitle: '分段行程及攻略',
    bestSeason: '最佳行游季：',
    veteranTips: '老家老玩家通关经验',
    tabDay: '第 {n} 天',
    viewDetails: '展开景点详情',
    duration: '游玩时长：',
    cost: '人均预估：',
    bestWatchTime: '黄金观赏时段：',
    crowdedHours: '拥挤预警段：',
    localTips: '通关建议：',
    btnBack: '重归修改',
    navPlan: '规划行程',
    navOverview: '行程方案',
    navCompare: '多城对比',
    navHistory: '收藏夹',
    navSettings: '设置中心',
    navReceipts: '票据归并',
    receiptsTitle: '智能旅客票据行程归并箱',
    receiptsSub: '支持拖拽或选择您的机票订单 PDF、高铁购票截图、酒店预定确认单或餐饮发票，AI 将秒级抓取多站行程，并智能合流归编至您的行程计划中！',
    btnClearCache: '清理全部本地缓存及历史计划',
    aboutTitle: '关于“旅途”',
    historyTitle: '已存档行程计划',
    noHistory: '您的收藏夹空空如也，快去规划你的第一个梦想行程吧！',
    settingsLanguage: '系统语言 (Language)',
    compareTitle: '目的地目的地全方位要素PK对比',
    colCity: '评估城市',
    colDays: '天数',
    colTransit: '往返大交通价格',
    colExpense: '当地每日吃住门票',
    colTotal: '累计总投入',
    colSeason: '此季是否最佳',
    colTags: '核心风格魅力',
    recommendLabel: '🌟 当月极力推荐',
    transitFlight: '飞机航线 ✈️',
    transitTrain: '高速铁路 🚄',
    transitCar: '自驾出行 🚗',
    transitBus: '长途巴士 🚌',
    transitPrice: '预估费用：',
    transitDuration: '平均用时：',
    transitAdvice: '交通决策建议：',
    costTickets: '景区门票',
    costFood: '饕餮美食',
    costHotel: '甄选住宿',
    costTransit: '市内打车/地铁',
    aiEnhancedActive: '已深度激发 AI 增强 🧙‍♂️',
    aiUpgradeBtn: '🚀 激发 AI 智能优化当前城市',
    errorForbiddenOrig: '出发城市不能加入目的地中！',
    errorMaxDest: '目的地数量最多支持 10 个！',
    errorNoDest: '请至少添加一个目的地城市！',
    errorOrigRequired: '请先设定您的出发点！',
    searchAddUnknown: ' 🔍 未在全球库，可在检索后自动建立在线专档',
    onlineSearching: '正在全球 GeoDB 数据库索找中...',
  },
  en: {
    brandTitle: 'Trip AI',
    brandSub: 'Personalized Global Itinerary Planner Powered by AI',
    wizardTitle: 'Customize Your Travel Dream Route',
    originLabel: 'Step 1: Choose Your Departure Point',
    originPlaceholder: 'Search by city name/initials/English... (e.g. "Beijing", "Tokyo")',
    popularOrigins: 'Popular Departure Cities',
    destLabel: 'Step 2: Add Destinations (Up to 10 cities)',
    destPlaceholder: 'Search destinations to append to your line...',
    popularDests: 'Recommended Places',
    selectedDestsTitle: 'Added Destinations & Duration Settings',
    daysLabel: 'Stay Duration',
    aiEnhanceLabel: 'Enable AI Itinerary Enhancement (Highly Recommended)',
    aiEnhanceSub: 'Trigger Gemini to plan deep daily schedules, real coordinates, local eateries and budgeting',
    btnNext: 'Next Step',
    btnPrev: 'Back',
    btnGenerate: 'Envision Dream Route 🚀',
    loadingTitle: 'Customising Your Itineraries...',
    loadingSub: 'Calling Gemini to calculate optimal daily schedules, find certified local dining, stay rates and travel coordinates. Holds up for 5-10 secs, hang tight...',
    overviewTitle: 'Itinerary Path Overview',
    totalBudget: 'Projected Budget',
    totalDays: 'Entire Duration',
    budgetBreakdown: 'Expenses Breakdown Matrix',
    cityDetailsTitle: 'Detailed Schedules & Local Wisdom',
    bestSeason: 'Optimal Season: ',
    veteranTips: 'Veteran Secrets & Survival Tips',
    tabDay: 'Day {n}',
    viewDetails: 'Expand Details',
    duration: 'Duration: ',
    cost: 'Est. Cost: ',
    bestWatchTime: 'Optimal Hours: ',
    crowdedHours: 'Peak Crowds: ',
    localTips: 'Veteran Tip: ',
    btnBack: 'Reconfigure Plan',
    navPlan: 'Plan Route',
    navOverview: 'Itinerary View',
    navCompare: 'Contrast Grid',
    navHistory: 'Favorites Archive',
    navSettings: 'Preferences',
    navReceipts: 'Invoice Merge',
    receiptsTitle: 'Smart Ticket & Itinerary Ledger',
    receiptsSub: 'Drag and drop PDFs or screenshots of flights, high-speed rail receipts, hotel confirmations, or attraction gates. AI parses routes and merges them directly into your dynamic calendar!',
    btnClearCache: 'Reset Database, Archives & Cache',
    aboutTitle: 'About Trip AI',
    historyTitle: 'Saved Plans Archive',
    noHistory: 'No travel routes logged yet! Jump into Route Planner to craft your first journey.',
    settingsLanguage: 'System Language',
    compareTitle: 'Destinations Contrast & Month Matching',
    colCity: 'City Evaluated',
    colDays: 'Days',
    colTransit: 'Inter-City Transport (Roundtrip)',
    colExpense: 'Stay, Dining & Gate Fees / Day',
    colTotal: 'Calculated Sum-total',
    colSeason: 'Ideal Month',
    colTags: 'Vibe & Aesthetic Core',
    recommendLabel: '🌟 Recommended for May',
    transitFlight: 'Aviation Route ✈️',
    transitTrain: 'High-speed Rail 🚄',
    transitCar: 'Scenic Free Drive 🚗',
    transitBus: 'Expedition Bus 🚌',
    transitPrice: 'Est. Transit Fee: ',
    transitDuration: 'Est. Flight Time: ',
    transitAdvice: 'Movement Advice: ',
    costTickets: 'Gate Entry Tickets',
    costFood: 'Gastronomy / Fine Eats',
    costHotel: 'Premier Lodging & Bedding',
    costTransit: 'Taxi & Local Subways',
    aiEnhancedActive: 'Gemini Plan Activated 🧙‍♂️',
    aiUpgradeBtn: '🚀 Ask Gemini to Optimize This City',
    errorForbiddenOrig: 'The departure city cannot be a destination!',
    errorMaxDest: 'The maximum destinations count is 10!',
    errorNoDest: 'Please include at least one destination point!',
    errorOrigRequired: 'Please declare your departure city first!',
    searchAddUnknown: ' 🔍 Not found locally. Add online via global indexes',
    onlineSearching: 'Searching the global GeoDB registry...',
  }
};
