var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");

// src/data/cities.ts
var CN_CITIES = [
  { id: "beijing", name: "\u5317\u4EAC", nameEn: "Beijing", pinyin: "beijing", region: "\u534E\u5317", regionEn: "North China", isInternational: false, coordinates: [39.9042, 116.4074] },
  { id: "shanghai", name: "\u4E0A\u6D77", nameEn: "Shanghai", pinyin: "shanghai", region: "\u534E\u4E1C", regionEn: "East China", isInternational: false, coordinates: [31.2304, 121.4737] },
  { id: "guangzhou", name: "\u5E7F\u5DDE", nameEn: "Guangzhou", pinyin: "guangzhou", region: "\u534E\u5357", regionEn: "South China", isInternational: false, coordinates: [23.1291, 113.2644] },
  { id: "shenzhen", name: "\u6DF1\u5733", nameEn: "Shenzhen", pinyin: "shenzhen", region: "\u534E\u5357", regionEn: "South China", isInternational: false, coordinates: [22.5431, 114.0579] },
  { id: "xian", name: "\u897F\u5B89", nameEn: "Xi'an", pinyin: "xian", region: "\u897F\u5317", regionEn: "Northwest China", isInternational: false, coordinates: [34.3416, 108.9398] },
  { id: "chengdu", name: "\u6210\u90FD", nameEn: "Chengdu", pinyin: "chengdu", region: "\u897F\u5357", regionEn: "Southwest China", isInternational: false, coordinates: [30.5728, 104.0668] },
  { id: "hangzhou", name: "\u676D\u5DDE", nameEn: "Hangzhou", pinyin: "hangzhou", region: "\u534E\u4E1C", regionEn: "East China", isInternational: false, coordinates: [30.2741, 120.1551] },
  { id: "chongqing", name: "\u91CD\u5E86", nameEn: "Chongqing", pinyin: "chongqing", region: "\u897F\u5357", regionEn: "Southwest China", isInternational: false, coordinates: [29.563, 106.5516] },
  { id: "sanya", name: "\u4E09\u4E9A", nameEn: "Sanya", pinyin: "sanya", region: "\u534E\u5357", regionEn: "South China", isInternational: false, coordinates: [18.2525, 109.512] },
  { id: "guilin", name: "\u6842\u6797", nameEn: "Guilin", pinyin: "guilin", region: "\u534E\u5357", regionEn: "South China", isInternational: false, coordinates: [25.2736, 110.2901] },
  { id: "lhasa", name: "\u62C9\u8428", nameEn: "Lhasa", pinyin: "lasa", region: "\u897F\u5317", regionEn: "Tibet China", isInternational: false, coordinates: [29.6524, 91.1172] },
  { id: "xiamen", name: "\u53A6\u95E8", nameEn: "Xiamen", pinyin: "xiamen", region: "\u534E\u4E1C", regionEn: "East China", isInternational: false, coordinates: [24.4798, 118.0894] },
  { id: "kunming", name: "\u6606\u660E", nameEn: "Kunming", pinyin: "kunming", region: "\u897F\u5357", regionEn: "Southwest China", isInternational: false, coordinates: [25.0406, 102.7122] },
  { id: "harbin", name: "\u54C8\u5C14\u6EE8", nameEn: "Harbin", pinyin: "haerbin", region: "\u4E1C\u5317", regionEn: "Northeast China", isInternational: false, coordinates: [45.8038, 126.5349] },
  { id: "hongkong", name: "\u9999\u6E2F", nameEn: "Hong Kong", pinyin: "xianggang", region: "\u6E2F\u6FB3\u53F0", regionEn: "HK & Macau", isInternational: false, coordinates: [22.3193, 114.1694] },
  { id: "macau", name: "\u6FB3\u95E8", nameEn: "Macau", pinyin: "aomen", region: "\u6E2F\u6FB3\u53F0", regionEn: "HK & Macau", isInternational: false, coordinates: [22.1987, 113.5439] },
  { id: "taipei", name: "\u53F0\u5317", nameEn: "Taipei", pinyin: "taibei", region: "\u6E2F\u6FB3\u53F0", regionEn: "Taiwan", isInternational: false, coordinates: [25.033, 121.5654] }
];
var INTL_CITIES = [
  { id: "tokyo", name: "\u4E1C\u4EAC", nameEn: "Tokyo", pinyin: "dongjing", region: "\u4E1C\u4E9A", regionEn: "East Asia", isInternational: true, coordinates: [35.6762, 139.6503] },
  { id: "kyoto", name: "\u4EAC\u90FD", nameEn: "Kyoto", pinyin: "jingdu", region: "\u4E1C\u4E9A", regionEn: "East Asia", isInternational: true, coordinates: [35.0116, 135.7681] },
  { id: "bangkok", name: "\u66FC\u8C37", nameEn: "Bangkok", pinyin: "mangu", region: "\u4E1C\u5357\u4E9A", regionEn: "Southeast Asia", isInternational: true, coordinates: [13.7563, 100.5018] },
  { id: "singapore", name: "\u65B0\u52A0\u5761", nameEn: "Singapore", pinyin: "xinjiapo", region: "\u4E1C\u5357\u4E9A", regionEn: "Southeast Asia", isInternational: true, coordinates: [1.3521, 103.8198] },
  { id: "paris", name: "\u5DF4\u9ECE", nameEn: "Paris", pinyin: "bali", region: "\u6B27\u6D32", regionEn: "Europe", isInternational: true, coordinates: [48.8566, 2.3522] },
  { id: "london", name: "\u4F26\u6566", nameEn: "London", pinyin: "lundun", region: "\u6B27\u6D32", regionEn: "Europe", isInternational: true, coordinates: [51.5074, -0.1278] },
  { id: "newyork", name: "\u7EBD\u7EA6", nameEn: "New York", pinyin: "niuyue", region: "\u5317\u7F8E", regionEn: "North America", isInternational: true, coordinates: [40.7128, -74.006] },
  { id: "losangeles", name: "\u6D1B\u6749\u77F6", nameEn: "Los Angeles", pinyin: "luoshanji", region: "\u5317\u7F8E", regionEn: "North America", isInternational: true, coordinates: [34.0522, -118.2437] },
  { id: "sydney", name: "\u6089\u5C3C", nameEn: "Sydney", pinyin: "xini", region: "\u5927\u6D0B\u6D32", regionEn: "Oceania", isInternational: true, coordinates: [-33.8688, 151.2093] },
  { id: "rome", name: "\u7F57\u9A6C", nameEn: "Rome", pinyin: "luoma", region: "\u6B27\u6D32", regionEn: "Europe", isInternational: true, coordinates: [41.9028, 12.4964] },
  { id: "reykjavik", name: "\u96F7\u514B\u96C5\u672A\u514B", nameEn: "Reykjavik", pinyin: "leikeyawieke", region: "\u6B27\u6D32", regionEn: "Europe", isInternational: true, coordinates: [64.1466, -21.9426] },
  { id: "cairo", name: "\u5F00\u7F57", nameEn: "Cairo", pinyin: "kailuo", region: "\u975E\u6D32", regionEn: "Africa", isInternational: true, coordinates: [30.0444, 31.2357] },
  { id: "phuket", name: "\u666E\u5409\u5C9B", nameEn: "Phuket", pinyin: "pujidao", region: "\u4E1C\u5357\u4E9A", regionEn: "Southeast Asia", isInternational: true, coordinates: [7.8804, 98.3922] }
];
var ALL_CITIES_INDEX = [...CN_CITIES, ...INTL_CITIES];
var CITIES_DETAIL = {
  beijing: {
    cityId: "beijing",
    cityName: "\u5317\u4EAC",
    cityNameEn: "Beijing",
    daysCount: 3,
    bestSeason: "9\u6708-11\u6708\uFF08\u79CB\u5B63\uFF0C\u5929\u9AD8\u6C14\u723D\uFF0C\u91D1\u79CB\u9999\u5C71\u6700\u7F8E\uFF09",
    bestSeasonEn: "Sep - Nov (Autumn: crisp air, breathtaking golden foliage at Xiangshan)",
    localExpense: { tickets: 180, food: 220, hotel: 450, transit: 60 },
    veteranTips: [
      "\u6545\u5BAB\u95E8\u7968\u4E00\u5B9A\u8981\u63D0\u524D7\u5929\u5728\u5B98\u65B9\u6E20\u9053\u5B9E\u540D\u9884\u8BA2\uFF01",
      "\u5347\u65D7\u4EEA\u5F0F\u6781\u65E9\uFF0C\u5EFA\u8BAE\u4F4F\u5929\u5B89\u95E8\u6216\u524D\u95E8\u9644\u8FD1\u4EE5\u4FBF\u6E05\u6668\u6B65\u884C\u3002",
      "\u53BB\u957F\u57CE\u4E00\u5B9A\u8981\u9009\u516B\u8FBE\u5CAD\u65E9\u73ED\u4E13\u7EBF\u6216\u76F4\u901A\u8F66\uFF0C\u9519\u5F00\u5835\u8F66\u9AD8\u5CF0\u3002"
    ],
    veteranTipsEn: [
      "Forbidden City tickets must be booked on the official channel 7 days in advance!",
      "Flag raising is very early; lodging near Tiananmen or Qianmen is critical.",
      "Take the early express bus line to Badaling Wall to bypass heavy congestion."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "bj-p1",
            name: "\u5929\u5B89\u95E8\u5E7F\u573A\u4E0E\u5347\u65D7\u4EEA\u5F0F",
            nameEn: "Tiananmen Square & Flag Raising",
            type: "attraction",
            time: "05:30",
            duration: "1.5h",
            cost: 0,
            bestTime: "\u6E05\u6668\u5347\u65D7\u52A8\u4F5C\u4E00\u5239\u90A3",
            crowdTimes: "05:00-06:00 \u6781\u5176\u62E5\u6324",
            tip: "\u5FC5\u987B\u63D0\u524D1\u5929\u5728\u5B98\u65B9\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F\u9884\u7EA6\uFF01\u7531\u4E8E\u5B89\u68C0\u4E25\u5BC6\uFF0C\u5EFA\u8BAE\u6700\u5C11\u63D0\u524D40\u5206\u949F\u62B5\u8FBE\u3002",
            tipEn: "Must reserve on the WeChat mini-program 1 day prior. Due to security scans, arrive 40 mins early.",
            coordinates: [39.9055, 116.3976]
          },
          {
            id: "bj-p2",
            name: "\u6545\u5BAB\u535A\u7269\u9662",
            nameEn: "The Palace Museum (Forbidden City)",
            type: "attraction",
            time: "08:30",
            duration: "4h",
            cost: 60,
            bestTime: "\u5348\u95E8\u5F00\u95E8\u7B2C\u4E00\u65F6\u95F4\u6216\u5348\u540E14\u70B9",
            crowdTimes: "10:00-13:00 \u4EBA\u5C71\u4EBA\u6D77",
            tip: "\u6CBF\u7740\u4E2D\u8F74\u7EBF\u8D70\uFF08\u592A\u548C\u6BBF\u3001\u4E7E\u6E05\u5BAB\u3001\u5FA1\u82B1\u56ED\uFF09\uFF0C\u73CD\u5B9D\u9986\u4E0E\u949F\u8868\u9986\u975E\u5E38\u503C\u5F97\u989D\u5916\u8D2D\u7968\u89C2\u8D4F\u3002",
            tipEn: "Walk the historic central meridian. Treasure and Clock halls are highly worth the minor extra fee.",
            coordinates: [39.9163, 116.3972]
          },
          {
            id: "bj-p3",
            name: "\u56DB\u5B63\u6C11\u798F\u70E4\u9E2D\uFF08\u706F\u5E02\u53E3\u5E97\uFF09",
            nameEn: "Siji Minfu Roast Duck (Dengshikou)",
            type: "food",
            time: "13:00",
            duration: "1.5h",
            cost: 150,
            bestTime: "11:30\u4E4B\u524D\u621613:30\u4E4B\u540E\u9519\u5CF0\u907F\u5F00\u6392\u961F",
            crowdTimes: "12:00-13:00 \u7206\u6EE1\uFF0C\u6392\u961F2\u5C0F\u65F6\u4EE5\u4E0A",
            tip: "\u5317\u4EAC\u70E4\u9E2D\u5730\u6807\uFF01\u9165\u9999\u5AE9\u6ED1\uFF0C\u4E00\u5B9A\u8981\u70B9\u4E00\u76D8\u9E2D\u76AE\u8638\u767D\u7CD6\uFF0C\u8FD8\u6709\u4F20\u7EDF\u8D1D\u52D2\u70E4\u8089\u3002",
            tipEn: "The pinnacle of Peking Duck. Order the crispy skin dipped in white sugar and traditional grilled mutton.",
            coordinates: [39.9189, 116.417]
          },
          {
            id: "bj-p4",
            name: "\u666F\u5C71\u516C\u56ED\uFF08\u770B\u6545\u5BAB\u5168\u666F\uFF09",
            nameEn: "Jingshan Park (Forbidden City Birdview)",
            type: "attraction",
            time: "15:30",
            duration: "1.5h",
            cost: 2,
            bestTime: "\u65E5\u843D\u524D\u534A\u5C0F\u65F6\u4E07\u6625\u4EAD\u89C2\u7D2B\u7981\u57CE\u5168\u666F",
            crowdTimes: "\u5468\u672B\u4E0B\u5348\u6E38\u4EBA\u8F83\u591A",
            tip: "\u767B\u4E0A\u4E07\u6625\u4EAD\uFF0C\u4FEF\u77B0\u4E00\u89C8\u65E0\u4F59\u7684\u6545\u5BAB\u5168\u666F\uFF0C\u662F\u5317\u4EAC\u62CD\u6545\u5BAB\u5168\u8C8C\u6700\u597D\u7684\u843D\u811A\u70B9\u3002",
            tipEn: "Climb the Wanchun Pavilion at sunset to enjoy the uninterrupted panoramic overview of the Palace.",
            coordinates: [39.9238, 116.3969]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "bj-p5",
            name: "\u9890\u548C\u56ED",
            nameEn: "The Summer Palace",
            type: "attraction",
            time: "09:00",
            duration: "3.5h",
            cost: 30,
            bestTime: "\u4E0A\u5348\u6C14\u6E29\u9002\u5B9C\uFF0C\u9002\u5408\u6E38\u6E56",
            crowdTimes: "11:00\u540E\u65C5\u6E38\u56E2\u8F83\u591A",
            tip: "\u63A8\u8350\u79DF\u4E00\u6761\u5C0F\u7535\u5B50\u8239\u7545\u884C\u5728\u6606\u660E\u6E56\u4E0A\u3002\u5341\u4E03\u5B54\u6865\u5728\u51AC\u65E5\u4F1A\u6709\u5341\u4E03\u5B54\u6865\u843D\u65E5\u91D1\u5149\u5947\u666F\u3002",
            tipEn: "Highly advise renting a small electronic boat on Kunming Lake. The 17-hole bridge has legendary sunset magic in winter.",
            coordinates: [39.9998, 116.2755]
          },
          {
            id: "bj-p6",
            name: "\u5357\u9523\u9F13\u5DF7\u4E0E\u80E1\u540C\u4F53\u9A8C",
            nameEn: "Nanluoguxiang & Traditional Hutongs",
            type: "attraction",
            time: "14:00",
            duration: "2.5h",
            cost: 0,
            bestTime: "\u9634\u51C9\u5348\u540E\uFF0C\u9002\u5408\u80E1\u540C\u6563\u6B65",
            crowdTimes: "\u8282\u5047\u65E5\u4E3B\u8857\u5B8C\u5168\u6324\u4E0D\u52A8",
            tip: "\u907F\u5F00\u5357\u9523\u9F13\u5DF7\u4E3B\u8857\u4EBA\u6D41\uFF0C\u6298\u5165\u4E24\u65C1\u5B89\u9759\u7684\u80E1\u540C\uFF08\u4E94\u9053\u8425\u3001\u96E8\u513F\u80E1\u540C\uFF09\uFF0C\u79DF\u4E00\u8F86\u5171\u4EAB\u5355\u8F66\u6162\u6162\u9A91\u3002",
            tipEn: "Bypass the hyper-touristic main street; turn directly into historic quiet side lanes on a bicycle.",
            coordinates: [39.9372, 116.4034]
          },
          {
            id: "bj-p7",
            name: "\u540E\u6D77\u4E0E\u4EC0\u5239\u6D77\u6C11\u8C23\u9152\u5427",
            nameEn: "Shichahai & Back Lakes Folk Bars",
            type: "attraction",
            time: "18:30",
            duration: "3h",
            cost: 80,
            bestTime: "\u591C\u8272\u6E10\u6D53\uFF0C\u6E56\u9762\u5012\u5F71\u6591\u6593",
            crowdTimes: "20:00-22:00 \u9EC4\u91D1\u65F6\u6BB5",
            tip: "\u5728\u6E56\u7554\u627E\u4E00\u5BB6\u9A7B\u5531\u5B89\u9759\u3001\u80FD\u770B\u5230\u6E56\u666F\u7684\u6C11\u8C23\u5C0F\u9152\u9986\uFF0C\u4F53\u9A8C\u8001\u5317\u4EAC\u591C\u751F\u6D3B\u3002",
            tipEn: "Find an intimate, quiet live-music pub overlooking the scenic water to experience true local nightlife.",
            coordinates: [39.9392, 116.3908]
          }
        ]
      },
      {
        day: 3,
        pois: [
          {
            id: "bj-p8",
            name: "\u5929\u575B\u516C\u56ED\u4E0E\u7948\u5E74\u6BBF",
            nameEn: "Temple of Heaven",
            type: "attraction",
            time: "08:30",
            duration: "2.5h",
            cost: 34,
            bestTime: "\u6E05\u6668\u6709\u5927\u6279\u672C\u5730\u6668\u4E60\u60A0\u95F2\u7684\u8001\u5317\u4EAC\u5C45\u6C11",
            crowdTimes: "10:00 \u540E\u4E3B\u5E72\u9053\u6E38\u5BA2\u6D8C\u5165",
            tip: "\u4E70\u8054\u7968\uFF08\u542B\u7948\u5E74\u6BBF\u3001\u56DE\u97F3\u58C1\u548C\u5927\u7940\u6BBF\uFF09\uFF0C\u56DE\u97F3\u58C1\u7AD9\u5728\u4E24\u4E2A\u89D2\u843D\u80FD\u542C\u5230\u7EC6\u5C0F\u7684\u58F0\u6CE2\u4F20\u5BFC\u3002",
            tipEn: "Buy a combo ticket including the Hall of Prayer. Stand at opposite corners of Echo Wall to test the sound physics.",
            coordinates: [39.8837, 116.4128]
          },
          {
            id: "bj-p9",
            name: "798\u827A\u672F\u533A",
            nameEn: "798 Art District",
            type: "attraction",
            time: "13:00",
            duration: "3h",
            cost: 0,
            bestTime: "\u5348\u540E\u6587\u827A\u6563\u5FC3",
            crowdTimes: "\u5DE5\u4F5C\u65E5\u4EBA\u5C11\uFF0C\u5468\u672B\u827A\u672F\u5C55\u4EBA\u6C14\u6781\u9AD8",
            tip: "\u8001\u5DE5\u5382\u65E7\u5740\u6539\u5EFA\u7684\u5148\u950B\u827A\u672F\u56ED\u533A\u3002\u5404\u79CD\u5947\u7279\u96D5\u5851\u3001\u753B\u5ECA\u3001\u72EC\u7ACB\u5496\u5561\u9986\uFF0C\u6781\u5176\u51FA\u7247\u3002",
            tipEn: "A masterfully repurposed industrial-factory-complex full of installations, art galleries, and boutique lofts.",
            coordinates: [39.9841, 116.495]
          }
        ]
      }
    ]
  },
  shanghai: {
    cityId: "shanghai",
    cityName: "\u4E0A\u6D77",
    cityNameEn: "Shanghai",
    daysCount: 2,
    bestSeason: "3\u6708-5\u6708\uFF08\u6625\u5149\u660E\u5A9A\uFF09\uFF0C10\u6708-11\u6708\uFF08\u79CB\u9AD8\u6C14\u723D\uFF09",
    bestSeasonEn: "Mar - May (Flora Blossom), Oct - Nov (Charming Golden Autumn)",
    localExpense: { tickets: 120, food: 260, hotel: 550, transit: 50 },
    veteranTips: [
      "\u5916\u6EE9\u7EDD\u7F8E\u89C2\u5149\u591C\u706F22:00\u51C6\u65F6\u5173\u95ED\uFF0C\u8BF7\u52A1\u5FC5\u63D0\u524D\u5230\u573A\u770B\u7480\u74A8\u5916\u6EE9\u3002",
      "\u8C6B\u56ED\u57CE\u968D\u5E99\u5C0F\u5403\u5546\u4E1A\u5316\u4E25\u91CD\uFF0C\u672C\u5730\u7ECF\u5178\u5C0F\u5403\u66F4\u63A8\u8350\u53BB\u8001\u5F04\u5802\u91CC\u7684\u79C1\u4EAB\u5C0F\u5E97\u3002",
      "\u60F3\u8981\u907F\u5F00\u4EBA\u7FA4\uFF0C\u53EF\u5728\u6E05\u66687\u70B9\u534A\u6CBF\u7740\u6B66\u5EB7\u8DEF\u68A7\u6850\u6811\u6797\u6563\u6B65\u9A91\u884C\u3002"
    ],
    veteranTipsEn: [
      "The iconic Bund neon lights shut off at exactly 22:00! Secure your viewing early.",
      "Yuyuan food courts are highly commercialised; local gems are usually hidden inside old alleyways.",
      "For peaceful scenic walks, jog under the historic plane trees of Wukang Road around 07:30 AM."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "sh-p1",
            name: "\u8C6B\u56ED & \u8001\u57CE\u968D\u5E99",
            nameEn: "Yuyuan Garden & Old Town Market",
            type: "attraction",
            time: "09:00",
            duration: "2.5h",
            cost: 40,
            bestTime: "\u65E9\u4E0A\u5F00\u56ED\u65F6\u5206\uFF0C\u5047\u5C71\u56DE\u5ECA\u6700\u4E3A\u5B89\u8BE6",
            crowdTimes: "11:00\u4E4B\u540E\u5E02\u96C6\u6469\u80A9\u63A5\u8E35",
            tip: "\u6C5F\u5357\u56ED\u6797\u6770\u4F5C\u3002\u8C6B\u56ED\u4E5D\u66F2\u6865\u3001\u6E56\u5FC3\u4EAD\u975E\u5E38\u6F02\u4EAE\u3002\u63A8\u8350\u5728\u8001\u5B57\u53F7\u7EFF\u6CE2\u5ECA\u54C1\u5C1D\u62DB\u724C\u677E\u7CD5\u3002",
            tipEn: "Magnificent southern landscape style. The famous Nine-Turning Bridge is a visual dream. Try steamed treats at Lu Bo Lang.",
            coordinates: [31.2272, 121.4921]
          },
          {
            id: "sh-p2",
            name: "\u5357\u4EAC\u8DEF\u6B65\u884C\u8857\u4E0E\u7533\u57CE\u89C2\u51491\u53F7\u7EBF",
            nameEn: "Nanjing Road Pedestrian Street",
            type: "attraction",
            time: "13:00",
            duration: "2h",
            cost: 5,
            bestTime: "\u9002\u5408\u8D70\u9A6C\u89C2\u82B1\u5730\u4F53\u9A8C\u6469\u767B\u7ECF\u5178\u8001\u5EFA\u7B51",
            crowdTimes: "\u5348\u540E\u4EBA\u7FA4\u5F00\u59CB\u805A\u62E2",
            tip: "\u6C47\u96C6\u8BF8\u591A\u4E0A\u6D77\u7ECF\u5178\u4E2D\u534E\u8001\u5B57\u53F7\uFF0C\u53EF\u642D\u4E58\u840C\u840C\u7684\u201C\u94DB\u94DB\u8F66\u201D\u590D\u53E4\u8F7B\u8F68\uFF0C\u4E5F\u53EF\u4EE5\u4E00\u8DEF\u6563\u6B65\u8D70\u5230\u5916\u6EE9\u3002",
            tipEn: "The century-old artery of retail. Take a signature retro trolley for a quick cross towards the waterfront.",
            coordinates: [31.2347, 121.4746]
          },
          {
            id: "sh-p3",
            name: "\u5916\u6EE9\u6C5F\u98CE\u63FD\u80DC\uFF08\u4E2D\u5C71\u4E1C\u4E00\u8DEF\uFF09",
            nameEn: "The Bund",
            type: "attraction",
            time: "16:00",
            duration: "2h",
            cost: 0,
            bestTime: "\u9EC4\u660F18:00\u84DD\u8C03\u65F6\u523B\uFF0C\u5BF9\u5CB8\u9646\u5BB6\u5634\u9713\u8679\u521D\u7EFD",
            crowdTimes: "19:00-21:00 \u89C2\u5149\u53F0\u4EBA\u6328\u7740\u4EBA",
            tip: "\u4E0A\u6D77\u6838\u5FC3\u7075\u9B42\u6240\u5728\u3002\u5DE6\u624B\u8001\u6D0B\u884C\u4E07\u56FD\u5EFA\u7B51\u7FA4\uFF0C\u53F3\u624B\u73B0\u4EE3\u9646\u5BB6\u5634\u6469\u5929\u68EE\u6797\uFF0C\u5F3A\u70C8\u63A8\u8350\u505A 2 \u5143\u7684\u6E21\u8F6E\u4F53\u9A8C\u3002",
            tipEn: "The monumental heart of Shanghai. Experience the dual world of imperial old structures and towering modern glass block skyscrapers.",
            coordinates: [31.2416, 121.4897]
          },
          {
            id: "sh-p4",
            name: "\u4F73\u5BB6\u6C64\u5305\uFF08\u4F20\u7EDF\u672C\u5E2E\u87F9\u9EC4\u5C0F\u7B3C\uFF09",
            nameEn: "Jiajia Soup Dumplings (Authentic Xiaolongbao)",
            type: "food",
            time: "18:30",
            duration: "1h",
            cost: 65,
            bestTime: "17:30 \u5F00\u665A\u5E02\u524D\u6392\u961F",
            crowdTimes: "\u7528\u9910\u9AD8\u5CF0\u7ECF\u5E38\u5356\u5B8C\u6536\u6863",
            tip: "\u73B0\u5305\u73B0\u84B8\uFF0C\u87F9\u7C89\u9C9C\u8089\u5C0F\u7B3C\u6C64\u6C41\u9971\u6EE1\uFF0C\u6C64\u9762\u6E05\u6F88\u4E0D\u6D51\u6D4A\uFF0C\u914D\u4E0A\u4E00\u7897\u59DC\u4E1D\u9648\u918B\u582A\u79F0\u5929\u4F5C\u4E4B\u5408\u3002",
            tipEn: "Freshly folded, paper-thin steamed dumplings bursting with savory hot pork and golden crab roe.",
            coordinates: [31.2335, 121.4725]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "sh-p5",
            name: "\u6B66\u5EB7\u5927\u697C\u4E0E\u7ECF\u5178\u6CD5\u79DF\u754C\u6F2B\u6E38",
            nameEn: "Wukang Mansion & Formex French Concession",
            type: "attraction",
            time: "09:00",
            duration: "3h",
            cost: 0,
            bestTime: "\u6E05\u6668\u9633\u5149\u67D4\u548C\u7167\u5C04\u5728\u5927\u697C\u7EA2\u7816\u7ACB\u9762\u4E0A",
            crowdTimes: "\u4E0B\u5348\u5927\u6279\u8857\u62CD\u7F51\u7EA2\u805A\u96C6\u5728\u62D0\u89D2\u5904",
            tip: "\u8457\u540D\u90AC\u8FBE\u514B\u5EFA\u7B51\u4EE3\u8868\u4F5C\uFF0C\u6781\u50CF\u4E00\u8258\u5DE8\u8F6E\u3002\u6CBF\u7740\u6B66\u5EB7\u8DEF\u3001\u5B89\u798F\u8DEF\u968F\u5FC3\u6F2B\u6B65\uFF0C\u4EAB\u53D7\u8302\u5BC6\u6CD5\u56FD\u68A7\u6850\u63A9\u6620\u7684\u60EC\u610F\u3002",
            tipEn: "Designed by legendary architect Hudec, mimicking a towering ocean liner. Walk and experience the rich cafe culture.",
            coordinates: [31.2052, 121.4335]
          },
          {
            id: "sh-p6",
            name: "\u9646\u5BB6\u5634\u4E09\u4EF6\u5957\uFF08\u4E0A\u6D77\u4E2D\u5FC3\u89C2\u5149\u5927\u5385\uFF09",
            nameEn: "Lujiazui Skyscrapers (Shanghai Tower)",
            type: "attraction",
            time: "14:00",
            duration: "3.5h",
            cost: 180,
            bestTime: "\u5982\u679C\u5929\u6C14\u80FD\u89C1\u5EA6\u7EDD\u4F73\uFF0C\u53EF\u5728\u9AD8\u7A7A\u4E91\u7AEF\u4FEF\u77B0\u6EDA\u6EDA\u9EC4\u6D66\u6C5F",
            crowdTimes: "\u5468\u672B\u4E0B\u5348\u767B\u9876\u6392\u961F\u8D85\u8FC71\u5C0F\u65F6",
            tip: "\u4E0A\u6D77\u4E2D\u5FC3118\u5C42121\u5C42\u662F\u4E16\u754C\u7EA7\u9AD8\u7A7A\u5730\u6807\uFF0C\u89C2\u5149\u68AF\u901F\u5EA6\u9AD8\u8FBE 18m/s\uFF0C\u5C06\u9B54\u90FD\u5929\u9645\u7EBF\u8E29\u5728\u5927\u811A\u4E4B\u4E0B\u3002",
            tipEn: "Rise to the clouds inside Shanghai Tower. Enjoy unmatched panoramic heights of the dynamic metropolis.",
            coordinates: [31.2355, 121.5015]
          },
          {
            id: "sh-p7",
            name: "\u4E1C\u65B9\u660E\u73E0\u5E7F\u64AD\u7535\u89C6\u5854",
            nameEn: "Oriental Pearl Tower",
            type: "attraction",
            time: "18:00",
            duration: "2.5h",
            cost: 160,
            bestTime: "\u591C\u5E55\u521D\u964D\uFF0C\u660E\u73E0\u5854\u4EAE\u8D77\u68A6\u5E7B\u7D2B\u5149",
            crowdTimes: "19:00-20:30 \u4EBA\u7FA4\u62E5\u5835",
            tip: "\u72EC\u7279\u7684\u5168\u900F\u660E\u60AC\u7A7A\u73BB\u7483\u76D8\u9053\uFF0C\u6562\u4E8E\u5728\u8FD9\u4FEF\u8EAB\u5F80\u4E0B\u770B\uFF0C\u4EFF\u4F5B\u76F4\u63A5\u8E29\u5728\u60AC\u7A7A\u4E91\u5F69\u4E2D\u3002",
            tipEn: "Walk the spectacular circular glass gallery hanging high above. Thrilling panoramic vistas guaranteed.",
            coordinates: [31.2397, 121.4998]
          }
        ]
      }
    ]
  },
  xian: {
    cityId: "xian",
    cityName: "\u897F\u5B89",
    cityNameEn: "Xi'an",
    daysCount: 2,
    bestSeason: "3\u6708-5\u6708\uFF0C9\u6708-11\u6708\uFF08\u514D\u53BB\u590F\u6691\u51AC\u5BD2\uFF0C\u6700\u4E3A\u5B9C\u6E38\uFF09",
    bestSeasonEn: "Mar - May, Sep - Nov (Pleasant climate, bypassing heavy summer heat & dry freeze)",
    localExpense: { tickets: 230, food: 140, hotel: 320, transit: 45 },
    veteranTips: [
      "\u79E6\u59CB\u7687\u5175\u9A6C\u4FD1\u4E0D\u5728\u5E02\u533A\uFF01\u5728\u4E34\u6F7C\u533A\uFF0C\u5EFA\u8BAE\u76F4\u63A5\u5750\u5730\u94C19\u53F7\u7EBF\u540E\u8F6C\u4E58\u4E13\u7EBF\u5927\u5DF4\u6700\u5B89\u5168\u4FBF\u5B9C\u3002",
      "\u5927\u5510\u4E0D\u591C\u57CE\u6700\u597D\u770B\u7684\u65F6\u95F4\u5728\u508D\u665A19:30\u4E4B\u540E\u534E\u706F\u521D\u4E0A\u65F6\uFF0C\u5404\u7C7B\u53E4\u88C5\u5C0F\u5267\u76EE\u548C\u4E0D\u5012\u7FC1\u4E92\u52A8\u4F1A\u76F8\u7EE7\u5F00\u6F14\u3002",
      "\u6C38\u5174\u574A\u662F\u9655\u897F\u975E\u9057\u7F8E\u98DF\u8857\uFF0C\u5404\u79CD\u6454\u7897\u9152\u3001\u8089\u5939\u998D\u7269\u7F8E\u4EF7\u5EC9\u3002"
    ],
    veteranTipsEn: [
      "The Terracotta Army is far away in Lintong! Take Metro Line 9 and transfer to the direct tourist shuttle.",
      "Grand Tang Everbright City shines best after 19:30 with historic performances and cascading lights.",
      "Yongxingfang features traditional Shaanxi intangible heritage and street delicacies at incredible rates."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "xa-p1",
            name: "\u79E6\u59CB\u7687\u5175\u9A6C\u4FD1\u535A\u7269\u9986",
            nameEn: "Terracotta Warriors Museum",
            type: "attraction",
            time: "08:30",
            duration: "4h",
            cost: 120,
            bestTime: "\u65E9\u4E0A\u5F00\u95E8\u7B2C\u4E00\u65F6\u95F4\u76F4\u5954\u4E00\u53F7\u5751\u770B\u5B8F\u5927\u5175\u9635",
            crowdTimes: "10:00-14:00 \u5927\u6279\u65C5\u6E38\u56E2\u75AF\u72C2\u6D8C\u5165",
            tip: "\u5EFA\u8BAE\u52A1\u5FC5\u5728\u95E8\u53E3\u8BF7\u4E00\u4F4D\u6301\u8BC1\u5B98\u65B9\u5BFC\u6E38\u8BB2\u89E3\uFF0C\u503E\u542C\u5175\u9A6C\u4FD1\u53D1\u6398\u80CC\u540E\u7684\u8003\u53E4\u4F20\u5947\u548C\u524D\u4E16\u4ECA\u751F\uFF0C\u5426\u5219\u5C31\u53EA\u662F\u4E00\u5806\u6CE5\u571F\u3002",
            tipEn: "Hiring a certified professional guide is crucial. Listening to archaeology stories brings history to life.",
            coordinates: [34.3842, 109.2785]
          },
          {
            id: "xa-p2",
            name: "\u8001\u7C73\u5BB6\u5927\u96E8\u6CE1\u998D\uFF08\u56DE\u6C11\u8857\uFF09",
            nameEn: "Lao Mi Jia Beef & Mutton Paomo",
            type: "food",
            time: "13:00",
            duration: "1.5h",
            cost: 45,
            bestTime: "13:30 \u7A0D\u665A\u65F6\u6BB5\u9519\u5CF0\u7528\u9910",
            crowdTimes: "12:00-13:00 \u6781\u5176\u72ED\u7A84\u62E5\u6324",
            tip: "\u4F53\u9A8C\u4F20\u7EDF\u5403\u6CD5\uFF0C\u9009\u7CBE\u81F4\u5C0F\u7897\u4EB2\u624B\u628A\u998D\u63B0\u5F97\u50CF\u9EC4\u8C46\u4E00\u822C\u5927\u3002\u716E\u51FA\u6765\u7684\u6CE1\u998D\u624D\u8F6F\u70C2\u5438\u6C41\u3001\u5507\u9F7F\u7559\u9999\u3002",
            tipEn: "Tear your pita bread manually into soy-bean size pieces for the kitchen to boil with savory, long-simmered bone broth.",
            coordinates: [34.2638, 108.9402]
          },
          {
            id: "xa-p3",
            name: "\u7891\u6797\u535A\u7269\u9986 & \u4E66\u9662\u95E8\u8857",
            nameEn: "Beilin Museum & Shuyuanmen",
            type: "attraction",
            time: "15:00",
            duration: "2.5h",
            cost: 50,
            bestTime: "\u65E5\u843D\u843D\u971E\u7167\u5728\u53E4\u7891\u77F3\u523B\u4E0A\uFF0C\u5E7D\u6DF1\u96C5\u81F4",
            crowdTimes: "\u6E38\u5BA2\u9002\u4E2D\uFF0C\u591A\u4E3A\u4E66\u6CD5\u91D1\u77F3\u7231\u597D\u8005",
            tip: "\u4E2D\u56FD\u6700\u5927\u7684\u77F3\u7891\u5386\u53F2\u85CF\u9986\uFF0C\u5386\u4EE3\u4E66\u6CD5\u5DE8\u5320\uFF08\u989C\u771F\u537F\u3001\u67F3\u516C\u6743\u3001\u738B\u7FB2\u4E4B\uFF09\u7684\u771F\u5B9E\u5B57\u5E16\u9057\u8FF9\u90FD\u5728\u8FD9\u91CC\uFF0C\u9707\u64BC\u4EBA\u5FC3\u3002",
            tipEn: "The Forest of Stone Steles. It houses the finest ancient collections of China\u2019s calligraphy masters.",
            coordinates: [34.2562, 108.949]
          },
          {
            id: "xa-p4",
            name: "\u897F\u5B89\u53E4\u57CE\u5899\uFF08\u9A91\u884C\u65E5\u843D\uFF09",
            nameEn: "Xi'an Ancient City Wall (Sunset Ride)",
            type: "attraction",
            time: "18:00",
            duration: "2h",
            cost: 54,
            bestTime: "\u508D\u665A\u91D1\u9EC4\u65E5\u843D\u6D12\u6EE1\u53E4\u8001\u7BAD\u697C\u7684\u65F6\u523B",
            crowdTimes: "\u6C38\u5B81\u95E8\u5165\u53E3\u508D\u665A\u6392\u961F\u6781\u5176\u5BC6\u96C6",
            tip: "\u5EFA\u8BAE\u4ECE\u5357\u95E8\uFF08\u6C38\u5B81\u95E8\uFF09\u767B\u5899\uFF0C\u5E76\u5728\u5899\u4E0A\u79DF\u4E00\u8F86\u53CC\u4EBA\u6216\u5355\u4EBA\u81EA\u884C\u8F66\uFF0C\u8E29\u884C\u5728\u5343\u5E74\u53E4\u7816\u4E0A\uFF0C\u665A\u98CE\u62C2\u9762\u3002",
            tipEn: "Climb via the South Gate. Rent a bicycle to ride on the historic wide brick ramparts under lovely twilight.",
            coordinates: [34.2555, 108.9461]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "xa-p5",
            name: "\u9655\u897F\u5386\u53F2\u535A\u7269\u9986",
            nameEn: "Shaanxi History Museum",
            type: "attraction",
            time: "09:00",
            duration: "3.5h",
            cost: 0,
            bestTime: "\u9700\u8981\u63D0\u524D3\u5929\u5728\u516C\u4F17\u53F7\u62A2\u514D\u8D39\u95E8\u7968\uFF0C\u63A8\u8350\u770B\u5927\u5510\u7389\u5668\u5C55",
            crowdTimes: "\u4EFB\u4F55\u65F6\u95F4\u90FD\u6781\u5176\u706B\u7206",
            tip: "\u53E4\u90FD\u7470\u5B9D\uFF0C\u73CD\u85CF\u6709\u5404\u79CD\u6D41\u5149\u6EA2\u5F69\u7684\u5510\u4E09\u5F69\u3001\u6781\u5176\u7CBE\u7EC6\u7684\u938F\u91D1\u821E\u9A6C\u8854\u676F\u7EB9\u94F6\u58F6\uFF0C\u7EDD\u5BF9\u8BA9\u4F60\u53F9\u4E3A\u89C2\u6B62\u3002",
            tipEn: "Prehistoric and dynastic museum. Golden beasts, terracotta figurines and Tang ceramics of unrivaled quality.",
            coordinates: [34.2255, 108.9554]
          },
          {
            id: "xa-p6",
            name: "\u5927\u96C1\u5854 & \u5927\u6148\u6069\u5BFA\u516C\u56ED",
            nameEn: "Giant Wild Goose Pagoda",
            type: "attraction",
            time: "14:00",
            duration: "2.5h",
            cost: 40,
            bestTime: "\u9633\u5149\u6D12\u6EE1\u767D\u5854\u8EAB\uFF0C\u5728\u55B7\u6CC9\u6C60\u65C1\u7559\u5F71\u6700\u4F73",
            crowdTimes: "\u5317\u5E7F\u573A\u5927\u55B7\u6CC9\u6F14\u51FA\u73B0\u573A\u4EBA\u5934\u6512\u52A8",
            tip: "\u5510\u7384\u5958\u897F\u884C\u53D6\u7ECF\u5F52\u6765\u85CF\u7ECF\u7684\u4F5B\u5854\u3002\u5317\u5E7F\u573A\u6709\u6C14\u52BF\u78C5\u7934\u7684\u5927\u578B\u77E9\u9635\u5F0F\u97F3\u4E50\u6C34\u5E55\uFF0C\u975E\u5E38\u751F\u52A8\u3002",
            tipEn: "The sacred Buddhist sanctuary built for housing Sanskrit sutras fetched by monk Xuanzang from India.",
            coordinates: [34.2201, 108.9592]
          },
          {
            id: "xa-p7",
            name: "\u5927\u5510\u4E0D\u591C\u57CE\uFF08\u68A6\u56DE\u76DB\u5510\uFF09",
            nameEn: "Great Tang All Day Mall",
            type: "attraction",
            time: "18:30",
            duration: "3h",
            cost: 0,
            bestTime: "\u591C\u8272\u8F89\u714C\uFF0C\u534E\u706F\u7EDA\u70C2\uFF0C\u5168\u8857\u5316\u4E3A\u4E0D\u591C\u4E7E\u5764",
            crowdTimes: "20:00 \u540E\u4E3B\u8857\u9053\u5BF8\u6B65\u96BE\u884C",
            tip: "\u5F3A\u70C8\u5EFA\u8BAE\u79DF\u4E00\u8EAB\u56FD\u98CE\u6C49\u670D\u3001\u642D\u914D\u7EDD\u7F8E\u7684\u76DB\u5510\u5BB9\u5986\uFF0C\u6F2B\u6B65\u5728\u5927\u8857\u4E0A\uFF0C\u4E00\u79D2\u6C89\u6D78\u5F0F\u7A7F\u56DE\u5927\u5510\u6781\u4E50\u76DB\u5BB4\u3002",
            tipEn: "The absolute high-light. Dress deep in traditional Hanfu robes and walk the brilliant historic neon avenues.",
            coordinates: [34.2155, 108.9615]
          }
        ]
      }
    ]
  },
  chengdu: {
    cityId: "chengdu",
    cityName: "\u6210\u90FD",
    cityNameEn: "Chengdu",
    daysCount: 2,
    bestSeason: "3\u6708-6\u6708\uFF08\u6E29\u548C\u82B1\u9999\uFF09\uFF0C9\u6708-11\u6708\uFF08\u7EA2\u53F6\u79CB\u666F\uFF09",
    bestSeasonEn: "Mar - Jun (Spring Blossom), Sep - Nov (Stunning Red Forest & Autumn Breeze)",
    localExpense: { tickets: 110, food: 220, hotel: 340, transit: 40 },
    veteranTips: [
      "\u53BB\u770B\u5927\u718A\u732B\u57FA\u5730\u8D8A\u65E9\u8D8A\u597D\uFF01\u65E9\u66687:30\u5F00\u56ED\uFF0C\u5927\u718A\u732B\u6700\u6D3B\u6CFC\u597D\u52A8\u5E76\u8FDB\u884C\u5582\u98DF\uFF0C\u592A\u665A\u53BB\u718A\u732B\u5C31\u5728\u68A6\u4E61\u91CC\u8EBA\u5E73\u4E86\u3002",
      "\u592A\u53E4\u91CC\u9644\u8FD1\u7684\u9AD8\u6863\u5DDD\u83DC\u591A\u6709\u6539\u826F\uFF08\u8FA3\u5EA6\u6E29\u548C\uFF09\uFF0C\u5730\u9053\u7684\u82CD\u8747\u5C0F\u9986\u9690\u85CF\u5728\u4E5D\u773C\u6865\u548C\u5EFA\u8BBE\u8DEF\u540E\u5DF7\u4E2D\u3002",
      "\u5728\u4EBA\u6C11\u516C\u56ED\u559D\u76D6\u7897\u8336\u9700\u8981\u81EA\u5DF1\u52A8\u624B\u62A2\u4F4D\u7F6E\uFF0C\u63A8\u8350\u62DB\u724C\u9E64\u9E23\u8336\u793E\u3002"
    ],
    veteranTipsEn: [
      "The earlier to the Panda Base, the better! Playful baby pandas eat and roll around early; they sleep all PM.",
      "Upscale fusion spots adapt dishes for tourists; for fiery authentic taste, head to neighborhood side alleyways.",
      "Grabbing wicker chairs at Heming Teahouse requires patience and quick feet. Perfect tea spot."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "cd-p1",
            name: "\u6210\u90FD\u5927\u718A\u732B\u7E41\u80B2\u7814\u7A76\u57FA\u5730",
            nameEn: "Giant Panda Breeding Base",
            type: "attraction",
            time: "07:30",
            duration: "4h",
            cost: 55,
            bestTime: "\u6E05\u666808:00\u5927\u718A\u732B\u96C6\u4E2D\u5543\u98DF\u7AF9\u5B50\u3001\u5B09\u620F\u722C\u6811",
            crowdTimes: "09:30\u540E\u592A\u9633\u5347\u8D77\uFF0C\u6E38\u5BA2\u957F\u961F\u51E0\u767E\u7C73\uFF0C\u718A\u732B\u56DE\u820D\u907F\u6691\u4E86",
            tip: "\u4E70\u5357\u95E8\u8FDB\u3001\u897F\u95E8\u51FA\u7684\u5355\u5411\u7968\u7968\u6700\u4E3A\u7701\u52B2\uFF0C\u9996\u51B2\u718A\u732B\u5E7C\u513F\u522B\u5885\uFF0C\u53EF\u4EE5\u8FD1\u8DDD\u79BB\u770B\u5230\u8D85\u840C\u7684\u718A\u732B\u5E7C\u4ED4\u3002",
            tipEn: "Enter through the South Gate and exit West to save energy. Sprint to the baby villas immediately.",
            coordinates: [30.7335, 104.1444]
          },
          {
            id: "cd-p2",
            name: "\u5BBD\u7A84\u5DF7\u5B50 & \u7EDD\u6D3B\u5DDD\u5267\u53D8\u8138",
            nameEn: "Kuanzhai Alley & Sichuan Opera",
            type: "attraction",
            time: "13:00",
            duration: "2.5h",
            cost: 40,
            bestTime: "\u5348\u540E\u5728\u53E4\u6734\u5DDD\u5F0F\u5B85\u9662\u5185\u6B47\u811A\u7EB3\u51C9",
            crowdTimes: "\u7A84\u5DF7\u5B50\u4E2D\u6BB5\u6781\u5176\u903C\u4EC4\u62E5\u5835",
            tip: "\u6E05\u4EE3\u6EE1\u57CE\u9057\u5B58\uFF0C\u5F88\u6709\u5DF4\u8700\u97F5\u5473\u3002\u5DF7\u5B50\u91CC\u7684\u8336\u9986\u968F\u5904\u6709\u638F\u8033\u6735\uFF08\u8212\u8033\u4F53\u9A8C\uFF09\uFF0C\u627E\u4E00\u5BB6\u5C0F\u620F\u53F0\u559D\u8336\u770B\u7EDD\u6280\u53D8\u8138\u3001\u55B7\u706B\u8868\u6F14\u3002",
            tipEn: "The historic streets preserve Qing dynasty compounds. Visit a teatheater to watch face-changing acts.",
            coordinates: [30.6651, 104.0532]
          },
          {
            id: "cd-p3",
            name: "\u5927\u9F99\u71DA\u706B\u9505\uFF08\u6625\u7199\u8DEF\u7ECF\u5178\u9EBB\u8FA3\uFF09",
            nameEn: "Da Long Yi Hot Pot (Chunxi Road)",
            type: "food",
            time: "18:00",
            duration: "2h",
            cost: 130,
            bestTime: "17:00 \u524D\u5F80\u62FF\u53F7\u6216\u7F51\u4E0A\u9884\u7EA6",
            crowdTimes: "18:30-20:30 \u4EBA\u6F6E\u6D8C\u52A8",
            tip: "\u6B63\u5B97\u91CD\u725B\u6CB9\u4E5D\u5BAB\u683C\uFF0C\u9C9C\u6BDB\u809A\u3001\u751F\u62A0\u9E45\u80A0\u3001\u6302\u9762\u9E2D\u80A0\u70EB\u7EA2\u9505\uFF0C\u9999\u6C14\u6251\u9F3B\u3002\u6015\u8FA3\u53EF\u914D\u6CB9\u789F\uFF08\u9999\u6CB9+\u5927\u849C\uFF09\u3002",
            tipEn: "The heavy aromatic beef-fat hotpot experience. Dip in custom garlic-sesame oil to curb the wild fire spice.",
            coordinates: [30.6542, 104.0798]
          },
          {
            id: "cd-p4",
            name: "\u9526\u91CC\u53E4\u8857\uFF08\u591C\u6E38\u770B\u5927\u7EA2\u706F\u7B3C\uFF09",
            nameEn: "Jinli Ancient Street \u591C\u9611\u4EBA\u9759",
            type: "attraction",
            time: "20:30",
            duration: "1.5h",
            cost: 0,
            bestTime: "21:00 \u5168\u8857\u5927\u7EA2\u706F\u7B3C\u9AD8\u6302\uFF0C\u7480\u74A8\u8FF7\u4EBA",
            crowdTimes: "\u591C\u5E02\u671F\u95F4\u4EBA\u6328\u7740\u4EBA\uFF0C\u70ED\u95F9\u975E\u51E1",
            tip: "\u4E34\u8FD1\u6B66\u4FAF\u7960\uFF0C\u4F20\u8BF4\u4E2D\u897F\u8700\u6700\u53E4\u8001\u7684\u4E00\u6761\u8857\u3002\u591C\u91CC\u7EA2\u7EA2\u706B\u706B\u7684\u706F\u7B3C\u4EAE\u8D77\uFF0C\u4EFF\u82E5\u8EAB\u5904\u5343\u4E0E\u5343\u5BFB\u795E\u660E\u5C0F\u9547\uFF0C\u5F88\u6709\u6C1B\u56F4\u3002",
            tipEn: "Adjacent to Wuhou Shrine. The lovely golden and red lanterns illuminated at night generate cozy cinematic vibes.",
            coordinates: [30.6481, 104.0494]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "cd-p5",
            name: "\u6B66\u4FAF\u7960\uFF08\u4E09\u56FD\u5723\u5730\u4E0E\u7EA2\u5899\uFF09",
            nameEn: "Wuhou Shrine (Red Wall Bamboo)",
            type: "attraction",
            time: "09:00",
            duration: "2.5h",
            cost: 50,
            bestTime: "\u4E0A\u5348\u6668\u5149\u6591\u9A73\u6253\u5728\u5939\u9053\u7EA2\u5899\u4E0A\uFF0C\u62CD\u7167\u5B9B\u5982\u53E4\u753B",
            crowdTimes: "11:00\u8D77\uFF0C\u7EA2\u5899\u7167\u76F8\u6253\u5361\u70B9\u9700\u8981\u6392\u961F",
            tip: "\u5168\u56FD\u552F\u4E00\u7684\u541B\u81E3\u5408\u7940\u7960\u5E99\uFF0C\u5218\u5907\u4E0E\u8BF8\u845B\u4EAE\u5728\u6B64\u3002\u897F\u4FA7\u7684\u7EA2\u5899\u5939\u9053\u3001\u6E05\u5E7D\u7FE0\u7AF9\u662F\u8457\u540D\u7684\u7F51\u7EA2\u51FA\u7247\u673A\u4F4D\uFF0C\u6781\u5BCC\u4F20\u7EDF\u7985\u610F\u3002",
            tipEn: "Dedicated to Zhuge Liang and Liu Bei. The red walls framed by deep green bamboo forest are visual perfection.",
            coordinates: [30.6475, 104.0485]
          },
          {
            id: "cd-p6",
            name: "\u9E64\u9E23\u8336\u793E\u4E0E\u4EBA\u6C11\u516C\u56ED\uFF08\u4F53\u9A8C\u5B89\u9038\u751F\u6D3B\uFF09",
            nameEn: "Heming Teahouse (People\u2019s Park Mini)",
            type: "attraction",
            time: "13:30",
            duration: "3h",
            cost: 30,
            bestTime: "\u6E05\u95F2\u4E0B\u5348\uFF0C\u5FAE\u98CE\u5212\u8FC7\u6E56\u9762\u6700\u4E3A\u60A0\u7136",
            crowdTimes: "\u5468\u672B\u4E0B\u5348\u4E00\u4F4D\u96BE\u6C42",
            tip: "\u70B9\u4E00\u5BA2\u62DB\u724C\u76D6\u7897\u7EFF\u8336\uFF08\u7AF9\u53F6\u9752\u6216\u78A7\u6F6D\u98D8\u96EA\uFF09\uFF0C\u8EBA\u5728\u560E\u5431\u4F5C\u54CD\u7684\u7AF9\u7F16\u85E4\u6905\u4E0A\uFF0C\u770B\u8001\u6210\u90FD\u4E0B\u68CB\u95F2\u804A\uFF0C\u53EF\u4EE5\u5F85\u4E0A\u4E00\u6574\u4E2A\u4E0B\u5348\u3002",
            tipEn: "Rent a traditional bamboo chair, sip premium green tea, listen to cicadas, and experience Chengdu\u2019s slow pace.",
            coordinates: [30.6558, 104.0601]
          },
          {
            id: "cd-p7",
            name: "\u90FD\u6C5F\u5830\u6C34\u5229\u5DE5\u7A0B",
            nameEn: "Dujiangyan Irrigation System",
            type: "attraction",
            time: "17:00",
            duration: "3h",
            cost: 80,
            bestTime: "19:30 \u84DD\u8C03\u65F6\u523B\u770B\u5357\u6865\u8457\u540D\u7684\u201C\u84DD\u773C\u6CEA\u201D\u7480\u74A8\u4EAE\u706F",
            crowdTimes: "19:00 \u5357\u6865\u89C2\u666F\u5E73\u53F0\u4E0A\u6324\u6EE1\u4E86\u7B49\u706F\u7684\u6E38\u5BA2",
            tip: "\u4E24\u5343\u591A\u5E74\u524D\u6CBF\u7528\u81F3\u4ECA\u7684\u751F\u6001\u65E0\u575D\u6392\u6C99\u6C34\u5229\u5947\u8FF9\u3002\u508D\u665A\u5357\u6865\u6C5F\u6C34\u6ED4\u6ED4\u5728\u83B9\u84DD\u706F\u5149\u6620\u5C04\u4E0B\u7480\u74A8\u5982\u68A6\uFF0C\u5373\u201C\u84DD\u773C\u6CEA\u201D\u5947\u89C2\u3002",
            tipEn: "The miraculous ancient delta that harnesses wild rivers. After dusk, the illuminated river under South Bridge glows blue.",
            coordinates: [30.9984, 103.6268]
          }
        ]
      }
    ]
  },
  kyoto: {
    cityId: "kyoto",
    cityName: "\u4EAC\u90FD",
    cityNameEn: "Kyoto",
    daysCount: 2,
    bestSeason: "11\u6708\u4E2D\u4E0B\uFF08\u6DF1\u79CB\u7EA2\u53F6\u6781\u76DB\uFF09\uFF0C4\u6708\u4E0A\u65EC\uFF08\u9633\u6625\u67D3\u4E95\u5409\u91CE\u6A31\u76DB\u653E\uFF09",
    bestSeasonEn: "Late Nov (Peak maple autumn red), Early Apr (Spectacular Sakura cherry blossoms)",
    localExpense: { tickets: 50, food: 180, hotel: 480, transit: 30 },
    veteranTips: [
      "\u6E05\u6C34\u5BFA\u6E05\u66686:00\u5373\u5F00\u95E8\uFF01\u5F3A\u70C8\u5EFA\u8BAE\u6E05\u65E98\u70B9\u524D\u62B5\u8FBE\uFF0C\u6B64\u65F6\u80FD\u62CD\u5230\u65E0\u4EBA\u7684\u6E05\u6C34\u821E\u53F0\u548C\u6E05\u6C34\u53E4\u8857\u3002",
      "\u4EAC\u90FD\u5DF4\u58EB\u4E00\u65E5\u5238\u4F7F\u7528\u6781\u5176\u4FBF\u5229\u3002\u4E0D\u5EFA\u8BAE\u505A\u8BA1\u7A0B\u8F66\uFF0C\u8D39\u7528\u6781\u8D35\u4E14\u65E9\u665A\u5728\u6CB3\u539F\u753A\u5835\u8F66\u4E25\u91CD\u3002",
      "\u6E05\u6C34\u5BFA\u81F3\u4E09\u5E74\u5742\u4E8C\u5E74\u5742\u591A\u6709\u77F3\u7EA7\uFF0C\u9700\u7A7F\u8212\u9002\u5E03\u978B\u3002"
    ],
    veteranTipsEn: [
      "Kiyomizu-dera opens at 06:00 AM! Highly recommend visiting before 08:30 for a pristine crowds-free garden stage.",
      " Kyobus unlimited travel pass is a stellar deal. Taxi fees are astronomical and clog near main hubs.",
      "Sannenzaka and Ninenzaka have steep stone tiles; wear comfy athletic sneakers."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "ky-p1",
            name: "\u4F0F\u89C1\u7A3B\u8377\u5927\u793E\uFF08\u5343\u672C\u9E1F\u5C45\uFF09",
            nameEn: "Fushimi Inari-taisha Sanctuary",
            type: "attraction",
            time: "08:00",
            duration: "2.5h",
            cost: 0,
            bestTime: "\u4E0A\u5348\u9633\u5149\u659C\u5C04\u900F\u8FDB\u7EA2\u8272\u724C\u574A\u67F1\u5ECA\u6700\u4F73",
            crowdTimes: "10:00-15:00 \u5BC6\u5BC6\u9EBB\u9EBB\u5168\u662F\u4EBA",
            tip: "\u4F9D\u5C71\u800C\u5EFA\u7684\u6210\u5343\u4E0A\u4E07\u5EA7\u6731\u7EA2\u8272\u9E1F\u5C45\u901A\u9053\u3002\u5982\u679C\u60F3\u907F\u5F00\u4EBA\u7FA4\uFF0C\u8BF7\u5F80\u5C71\u4E0A\u591A\u6500\u767B20\u5206\u949F\uFF0C\u4EBA\u70DF\u4F1A\u9AA4\u964D\uFF0C\u6781\u7F8E\u3002",
            tipEn: "The legendary serpentine red tunnels of torii arches. Walk 20 minutes higher up the mountain for zero tourists.",
            coordinates: [34.9671, 135.7727]
          },
          {
            id: "ky-p2",
            name: "\u6E05\u6C34\u5BFA & \u4E09\u5E74\u5742\u4E8C\u5E74\u5742",
            nameEn: "Kiyomizu-dera & Ancient Sannenzaka Lanes",
            type: "attraction",
            time: "13:00",
            duration: "3.5h",
            cost: 4,
            bestTime: "\u5348\u540E\u95F2\u901B\uFF0C\u6E05\u6C34\u5BFA\u821E\u53F0\u4FEF\u77B0\u5168\u666F\u6700\u4F73",
            crowdTimes: "\u5168\u5929\u6E38\u5BA2\u7206\u68DA\uFF0C\u5C24\u5176\u662F\u4E8C\u5E74\u5742\u62D0\u5F2F\u8457\u540D\u7684\u5854\u673A\u4F4D",
            tip: "\u6E05\u6C34\u5BFA\u60AC\u7A7A\u6728\u821E\u53F0\u662F\u4E2D\u56FD\u548C\u65E5\u672C\u5510\u4EE3\u5927\u6728\u4F5C\u98CE\u683C\u7EE7\u627F\u3002\u987A\u6B65\u6E38\u73A9\u5177\u6709\u6D53\u70C8\u5927\u6B63\u662D\u548C\u6C11\u623F\u6C1B\u56F4\u7684\u4E8C\u5E74\u5742\u3001\u4E09\u5E74\u5742\u53E4\u8857\u3002",
            tipEn: "The floating cantilevered wooden deck. Walk Ninhonzaka / Sannenzaka lanes with traditional wooden matcha tea stores.",
            coordinates: [34.9948, 135.785]
          },
          {
            id: "ky-p3",
            name: "\u8879\u56ED\xB7\u82B1\u89C1\u5C0F\u8DEF\u98CE\u98CE\u706B\u706B",
            nameEn: "Gion Hanami-koji Street",
            type: "attraction",
            time: "18:00",
            duration: "2h",
            cost: 0,
            bestTime: "\u8584\u66AE\u9EC4\u660F\uFF0C\u753A\u5C4B\u6728\u683C\u7A97\u900F\u51FA\u6A58\u7EA2\u706F\u5149",
            crowdTimes: "19:00-21:00 \u6E38\u4EBA\u6781\u591A",
            tip: "\u4EAC\u90FD\u6700\u7ECF\u5178\u7684\u827A\u4F0E\u8857\u3002\u4E24\u65C1\u662F\u5962\u534E\u53E4\u5178\u7684\u4EAC\u90FD\u6599\u4EAD\u753A\u5C4B\u3002\u5076\u9047\u5306\u5306\u8DEF\u8FC7\u7684\u771F\u5B9E\u548C\u670D\u827A\u4F0E\u827A\u4EBA\uFF0C\u4E0D\u53EF\u5F3A\u884C\u5408\u7167\u3001\u89E6\u78B0\u3002",
            tipEn: "The traditional lantern-lined district of ochaya (teahouses). Respect geishas and local rules strictly; no stalking.",
            coordinates: [35.0024, 135.7738]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "ky-p4",
            name: "\u91D1\u9601\u5BFA\uFF08\u9E7F\u82D1\u5BFA\u820D\u5229\u6BBF\uFF09",
            nameEn: "Kinkaku-ji (The Golden Pavilion)",
            type: "attraction",
            time: "09:00",
            duration: "2h",
            cost: 8,
            bestTime: "\u65E9\u666810:00\u524D\u9633\u5149\u76F4\u5C04\u6574\u680B\u8986\u76D6\u91D1\u7B94\u7684\u9601\u697C\u6700\u4E3A\u8000\u773C\u593A\u76EE",
            crowdTimes: "11:00-13:00 \u8D70\u9053\u9650\u5236\u5355\u5411\u901A\u884C",
            tip: "\u6574\u680B\u9601\u697C\u5728\u955C\u6E56\u6C60\u4E2D\u5012\u5F71\u5982\u753B\u3002\u91D1\u9601\u5BFA\u95E8\u7968\u662F\u4E00\u5F20\u5199\u7740\u201C\u5BB6\u5185\u5B89\u5168\u5F00\u8FD0\u62DB\u798F\u201D\u7684\u5FA1\u5B88\u62A4\u7EB8\uFF0C\u522B\u5177\u6536\u85CF\u610F\u4E49\u3002",
            tipEn: "Plated in pure gold leaf reflecting flawlessly on Kyoto Mirror Lake garden. The ticket is a personal talisman.",
            coordinates: [35.0394, 135.7292]
          },
          {
            id: "ky-p5",
            name: "\u5C9A\u5C71\u7AF9\u6797\u5C0F\u5F84 & \u6E21\u6708\u6865",
            nameEn: "Arashiyama Bamboo Grove & Togetsukyo Bridge",
            type: "attraction",
            time: "13:00",
            duration: "3h",
            cost: 0,
            bestTime: "\u5348\u540E\u6709\u6E05\u5E7D\u7A7F\u6797\u5FAE\u98CE\uFF0C\u6E21\u6708\u6865\u4E0A\u89C6\u91CE\u5F00\u9614",
            crowdTimes: "\u5C0F\u5F84\u6838\u5FC3\u7AF9\u6797\u6BB5\u62CD\u7167\u6E38\u5BA2\u5F88\u591A",
            tip: "\u53EF\u4EE5\u642D\u4E58\u7ECF\u5178\u7684\u5D6F\u5CE8\u91CE\u590D\u53E4\u89C2\u5149\u5C0F\u706B\u8F66\uFF0C\u6216\u662F\u5728\u6E21\u6708\u6865\u65C1\u7684\u6842\u5DDD\u7554\u9759\u5750\u770B\u5C71\u5149\u6C34\u8272\u3002\u5C0F\u5F84\u7AF9\u5B50\u9AD8\u8038\u906E\u5929\uFF0C\u9759\u8C27\u3002",
            tipEn: "Walk the majestic shade beneath soaring emerald green hollow stalks. Majestic river and wood scenes wait.",
            coordinates: [35.0156, 135.6715]
          }
        ]
      }
    ]
  },
  paris: {
    cityId: "paris",
    cityName: "\u5DF4\u9ECE",
    cityNameEn: "Paris",
    daysCount: 3,
    bestSeason: "5\u6708-10\u6708\uFF08\u9633\u5149\u6674\u6717\u5E38\u4F34\uFF0C\u6781\u5176\u9002\u5408\u9732\u5929\u585E\u7EB3\u6CB3\u6563\u5FC3\uFF09",
    bestSeasonEn: "May - Oct (Amiable mild breeze, sunny daylight, magnificent for caf\xE9 hopping & Seine cruise)",
    localExpense: { tickets: 120, food: 320, hotel: 750, transit: 65 },
    veteranTips: [
      "\u5362\u6D6E\u5BAB\u3001\u5965\u8D5B\u7F8E\u672F\u9986\u6BCF\u9022\u5468\u4E8C\u6216\u5468\u4E00\u9650\u671F\u95ED\u9986\uFF0C\u5FC5\u987B\u9884\u4E70\u5B9A\u65F6\u7968\uFF0C\u5E26\u4E0APDF\u5B58\u624B\u673A\u5907\u67E5\u3002",
      "\u5DF4\u9ECE\u5730\u94C1\u6CBB\u5B89\u582A\u5FE7\uFF0C\u5409\u666E\u8D5B\u5C0F\u5077\u5E38\u57281\u53F7\u7EBF\u548C\u5FEB\u8F68\u4E0A\u62A2\u593A\u624B\u673A\u94B1\u5305\uFF0C\u5207\u52FF\u62FF\u8D35\u91CD\u7269\u54C1\u9732\u5BBF\u3002",
      "\u53BB\u51EF\u65CB\u95E8\u62CD\u7167\u4E0D\u4E00\u5B9A\u767B\u9876\uFF0C\u4E0B\u7A7F\u4EBA\u884C\u901A\u9053\u5728\u6B63\u4E0B\u65B9\u7684\u91D1\u5B57\u5854\u5F62\u62F1\u95E8\u524D\u6253\u5361\u6700\u4E3A\u9707\u64BC\u3002"
    ],
    veteranTipsEn: [
      "Louvre closed on Tuesdays, Orsay on Mondays! Secure timed web vouchers. Carry digital files.",
      "Metro safety requires caution! Don\u2019t put high-value gadgets in outer backpacks or open jacket pockets.",
      "No need to climb the Arc de Triomphe for a stellar picture; standing directly underneath gives maximum raw size perspective."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "pa-p1",
            name: "\u5362\u6D6E\u5BAB\u535A\u7269\u9986\uFF08\u770B\u201C\u8499\u5A1C\u4E3D\u838E\u201D\uFF09",
            nameEn: "Louvre Museum Art Haven",
            type: "attraction",
            time: "09:00",
            duration: "4h",
            cost: 22,
            bestTime: "\u63D0\u524D\u9884\u7EA6 09:00 \u7B2C\u4E00\u573A\u6B21\u5B89\u68C0\u8FDB\u5165",
            crowdTimes: "10:00-14:00 \u9547\u9986\u4E09\u5B9D\u95E8\u524D\u5168\u662F\u56F4\u89C2\u5927\u961F",
            tip: "\u53E4\u5178\u827A\u672F\u5723\u6BBF\u3002\u9996\u51B2\u65AD\u81C2\u7EF4\u7EB3\u65AF\u3001\u80DC\u5229\u5973\u795E\u548C\u8499\u5A1C\u4E3D\u838E\u3002\u8D1D\u807F\u94ED\u8BBE\u8BA1\u7684\u73BB\u7483\u91D1\u5B57\u5854\u662F\u6781\u597D\u7684\u73B0\u4EE3\u4E2D\u5EAD\u3002",
            tipEn: "The golden cradle of Western visual art. See Da Vinci\u2019s masterpiece and classical Greek sculptures.",
            coordinates: [48.8606, 2.3376]
          },
          {
            id: "pa-p2",
            name: "\u585E\u7EB3\u6CB3\u5DE6\u5CB8\u7ECF\u5178\u82B1\u795E\u5496\u5561\u9986",
            nameEn: "Caf\xE9 de Flore (Left Bank Landmark)",
            type: "food",
            time: "14:00",
            duration: "1.5h",
            cost: 35,
            bestTime: "\u627E\u4E34\u8857\u7684\u85E4\u6905\u9732\u5929\u96C5\u5EA7\u6652\u592A\u9633\u6696\u548C",
            crowdTimes: "\u4E0B\u5348\u8336\u65F6\u5206\u6392\u957F\u961F",
            tip: "\u5DF4\u9ECE\u5DE6\u5CB8\u4EBA\u6587\u601D\u6F6E\u7684\u6447\u7BEE\uFF0C\u6BD5\u52A0\u7D22\u3001\u8428\u7279\u66FE\u5728\u6B64\u8FA9\u8BBA\u3002\u70B9\u4E00\u676F\u7ECF\u5178\u7684\u70ED\u5DE7\u514B\u529B\uFF08L\u2019Chocolat Chaud\uFF09\u548C\u7F8A\u89D2\u5305\u3002",
            tipEn: "The historical sanctuary of philosophy, writers and art. Perfect to watch the stylish Parisians walk by.",
            coordinates: [48.8542, 2.3299]
          },
          {
            id: "pa-p3",
            name: "\u57C3\u83F2\u5C14\u94C1\u5854\u4E0E\u6218\u795E\u5E7F\u573A\u843D\u971E",
            nameEn: "Eiffel Tower & Champ de Mars",
            type: "attraction",
            time: "16:30",
            duration: "2.5h",
            cost: 0,
            bestTime: "\u843D\u65E5\u91D1\u5149\u6D12\u6EE1\u94C1\u5854\u94A2\u9AA8\u548C\u508D\u665A\u6574\u70B9\u94C1\u5854\u95EA\u706F\u65F6\u523B",
            crowdTimes: "\u65E5\u843D\u65F6\u523B\u8349\u576A\u4E0A\u6E38\u4EBA\u5BC6\u5E03",
            tip: "\u5728\u590F\u7EA6\u5BAB\u89C2\u666F\u53F0\uFF08Trocad\xE9ro\uFF09\u62CD\u6444\u94C1\u5854\u5168\u8C8C\u65E0\u906E\u6321\u3002\u6BCF\u9022\u5165\u591C\u540E\u6574\u70B9\uFF0C\u4F1A\u67095\u5206\u949F\u7EDA\u70C2\u7684\u91D1\u8272\u661F\u5149\u706F\u95EA\u70C1\u3002",
            tipEn: "Unrivaled views are shot from Trocad\xE9ro terrace across the river. The glittering golden dots spark every hour.",
            coordinates: [48.8584, 2.2945]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "pa-p4",
            name: "\u5DF4\u9ECE\u5723\u6BCD\u9662\u5916\u8C8C\uFF08\u897F\u5824\u5C9B\u6F2B\u6B65\uFF09",
            nameEn: "Cath\xE9drale Notre-Dame (\xCEle de la Cit\xE9)",
            type: "attraction",
            time: "10:00",
            duration: "2h",
            cost: 0,
            bestTime: "\u585E\u7EB3\u6CB3\u6668\u96FE\u6563\u53BB\uFF0C\u5723\u6BCD\u9662\u98DE\u6276\u58C1\u5DCD\u5CE8\u53EF\u89C1",
            crowdTimes: "\u5468\u8FB9\u6B65\u884C\u6865\u4E0A\u62CD\u7167\u8005\u4F17\u591A",
            tip: "\u54E5\u7279\u5F0F\u5927\u5EFA\u7B51\u7684\u5DC5\u5CF0\u4E4B\u4F5C\u3002\u987A\u8DEF\u5728\u65C1\u8FB9\u7684\u838E\u58EB\u6BD4\u4E9A\u4E66\u5E97\uFF08Shakespeare & Company\uFF09\u9009\u8D2D\u4E00\u672C\u76D6\u6709\u72EC\u7279\u90AE\u6233\u7684\u4E2D\u4E16\u7EAA\u56FE\u4E66\u3002",
            tipEn: "The apex of French gothic. Grab a souvenir book from the famous Shakespeare & Co. across the lane.",
            coordinates: [48.853, 2.3499]
          },
          {
            id: "pa-p5",
            name: "\u5965\u8D5B\u535A\u7269\u9986",
            nameEn: "Mus\xE9e d\u2019Orsay Impressionism",
            type: "attraction",
            time: "13:30",
            duration: "3h",
            cost: 16,
            bestTime: "\u4E0B\u5348\u5728\u5DE8\u5927\u7684\u65E7\u706B\u8F66\u7AD9\u73BB\u7483\u7A79\u9876\u4E0B\u770B\u753B\u6700\u60EC\u610F",
            crowdTimes: "14:30 \u9EC4\u91D1\u4EBA\u6D41\u9AD8\u5CF0",
            tip: "\u7531\u706B\u8F66\u7AD9\u6539\u5EFA\u7684\u7CBE\u7F8E\u535A\u7269\u9986\u3002\u6536\u85CF\u4E86\u4E16\u754C\u6700\u9876\u5C16\u7684\u5370\u8C61\u6D3E\u548C\u540E\u5370\u8C61\u6D3E\u5927\u5E08\u6770\u4F5C\uFF08\u68B5\u9AD8\u3001\u83AB\u5948\u3001\u96F7\u8BFA\u963F\u3001\u585E\u5C1A\uFF09\u3002",
            tipEn: "A restored Beaux-Arts railway terminal containing legendary paintings by Van Gogh, Monet, and Renoir.",
            coordinates: [48.8599, 2.3265]
          },
          {
            id: "pa-p6",
            name: "\u585E\u7EB3\u6CB3\u65E5\u843D\u8C6A\u534E\u6E38\u8239\u5546\u52A1\u4F53\u9A8C",
            nameEn: "Seine River Cruise (Bateaux Parisiens)",
            type: "attraction",
            time: "18:00",
            duration: "1.5h",
            cost: 18,
            bestTime: "\u91D1\u7EA2\u665A\u971E\u67D3\u7EA2\u4E24\u5CB8\u5DF4\u9ECE\u7687\u5BB6\u884C\u5BAB\u548C\u53E4\u6865\u7684\u77AC\u95F4",
            crowdTimes: "\u6BCF\u73ED\u5B9A\u70B9\u6E38\u8239\u5EA7\u4F4D\u6EE1\u6EE1",
            tip: "\u767B\u8239\u5F90\u884C\u7A7F\u8FC7\u65B0\u6865\u3001\u4E9A\u5386\u5C71\u5927\u4E09\u4E16\u6865\u3002\u4E24\u5CB8\u5362\u6D6E\u5BAB\u3001\u534F\u548C\u5E7F\u573A\u5728\u91D1\u8F89\u4F59\u6656\u4E2D\u5012\u5F71\u6D41\u6DCC\uFF0C\u7F8E\u4E0D\u80DC\u6536\u3002",
            tipEn: "Cruise under historic stone bridges which light up like floating embers in the shimmering twilight water.",
            coordinates: [48.8615, 2.3235]
          }
        ]
      },
      {
        day: 3,
        pois: [
          {
            id: "pa-p7",
            name: "\u9999\u69AD\u4E3D\u820D\u5927\u8857 & \u5DF4\u9ECE\u51EF\u65CB\u95E8",
            nameEn: "Champs-\xC9lys\xE9es & Arc de Triomphe",
            type: "attraction",
            time: "09:30",
            duration: "2.5h",
            cost: 13,
            bestTime: "\u4E0A\u5348\u8F66\u8F86\u548C\u884C\u4EBA\u7A00\u5C11\uFF0C\u4E3B\u5E72\u9053\u89C6\u5ECA\u6781\u4F73",
            crowdTimes: "\u5348\u540E\u4E70\u5962\u4F88\u54C1\u7684\u6392\u961F\u957F\u9F99\u5E03\u6EE1\u4EBA\u884C\u9053",
            tip: "\u53EF\u4EE5\u4E70\u7968\u767B\u4E0A\u51EF\u65CB\u95E8\u9876\u7AEF\u5E73\u53F0\uFF0C\u7B14\u76F4\u671D\u4E0B\u768412\u6761\u5B8F\u5927\u6797\u836B\u5927\u9053\u50CF\u5149\u8292\u822C\u6563\u5F00\uFF0C\u4FEF\u77B0\u6781\u81F4\u51E0\u4F55\u9707\u64BC\u3002",
            tipEn: "A monumental stone arch built for victory. Stand on top to gaze at the twelve geometric stellar avenues.",
            coordinates: [48.8738, 2.295]
          },
          {
            id: "pa-p8",
            name: "\u8499\u9A6C\u7279\u9AD8\u5730 & \u5723\u5FC3\u5927\u6559\u5802\uFF08\u5199\u751F\u753B\u5BB6\uFF09",
            nameEn: "Montmartre & Sacr\xE9-C\u0153ur Basilica",
            type: "attraction",
            time: "13:30",
            duration: "3h",
            cost: 0,
            bestTime: "\u770B\u753B\u5BB6\u5728\u5C0F\u4E18\u5E7F\u573A\u52FE\u52D2\u8096\u50CF\uFF0C\u5728\u5723\u5FC3\u5802\u53F0\u9636\u542C\u6D41\u6D6A\u6B4C\u624B\u5531\u6B4C",
            crowdTimes: "\u53F0\u9636\u548C\u5468\u56F4\u7A84\u5DF7\u5E38\u6709\u9632\u4E0D\u80DC\u9632\u7684\u7EA2\u7EF3\u5957\u624B\u63A8\u9500",
            tip: "\u4FEF\u77B0\u5168\u5DF4\u9ECE\u65E5\u843D\u4E0E\u5929\u9645\u7EBF\u7684\u6700\u9AD8\u843D\u811A\u5904\u3002\u5C0F\u5FC3\u5728\u6B64\u7EA0\u7F20\u6E38\u5BA2\u786C\u5957\u7EA2\u7EF3\u7684\u4EBA\uFF0C\u5FAE\u7B11\u5E76\u5FEB\u901F\u63A8\u624B\u8D70\u5F00\u5373\u53EF\u3002",
            tipEn: "The bohemian home of artists. Gaze at Paris rooftop lines from the steep stairs of the giant white chapel.",
            coordinates: [48.8867, 2.3431]
          }
        ]
      }
    ]
  },
  sanya: {
    cityId: "sanya",
    cityName: "\u4E09\u4E9A",
    cityNameEn: "Sanya",
    daysCount: 2,
    bestSeason: "10\u6708-\u6B21\u5E744\u6708\uFF08\u907F\u5F00\u9AD8\u70ED\u66B4\u96E8\u548C\u53F0\u98CE\u5B63\uFF0C\u5929\u84DD\u6E29\u6DA6\uFF0C\u907F\u5BD2\u5929\u5802\uFF09",
    bestSeasonEn: "Oct - Apr (Dry breeze, escaping cold winter, prime beach sun leisure)",
    localExpense: { tickets: 160, food: 180, hotel: 680, transit: 80 },
    veteranTips: [
      "\u8708\u652F\u6D32\u5C9B\u8239\u7968\u542B\u5728\u95E8\u7968\u5185\uFF0C\u6781\u529B\u63A8\u8350\u5750\u65E9\u73ED8:00\u7B2C\u4E00\u73ED\u6E21\u8F6E\u767B\u5C9B\uFF0C\u6D77\u6C34\u80FD\u89C1\u5EA6\u6781\u9AD8\uFF0C\u6C99\u6EE9\u6700\u5E72\u51C0\uFF01",
      "\u4E09\u4E9A\u672C\u5730\u6D77\u9C9C\u5BB0\u5BA2\u73B0\u8C61\u65F6\u6709\u53D1\u751F\uFF0C\u63A8\u8350\u53BB\u706B\u8F66\u5934\u4E07\u4EBA\u6D77\u9C9C\u5E7F\u573A\u6216\u4E9A\u9F99\u6E7E\u6B63\u89C4\u9910\u996E\u4E2D\u5FC3\u56E2\u8D2D\uFF0C\u7B97\u597D\u4EF7\u683C\u518D\u5F00\u5355\u3002",
      "\u70ED\u5E26\u5929\u5802\u68EE\u6797\u516C\u56ED\u91CC\u7684\u8FC7\u6C5F\u9F99\u7D22\u6865\u662F\u62CD\u6444\u7535\u5F71\u975E\u8BDA\u52FF\u6270\u540C\u6B3E\u7F51\u7EA2\u6253\u5361\u70B9\uFF0C\u5468\u672B\u6392\u961F\u81F3\u5C1140\u5206\u949F\u8D77\u3002"
    ],
    veteranTipsEn: [
      "Wuzhizhou island ferries are included in tickets. Take the first 08:00 AM ride for premium clear water.",
      "To prevent seafood pricing tricks, stick to government-certified seafood centers and verify scales first.",
      "Tropical Paradise forest bridge was made famous in cinema. Avoid peak noon queues if possible."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "sy-p1",
            name: "\u4E9A\u9F99\u6E7E\u56FD\u5BB6\u65C5\u6E38\u5EA6\u5047\u533A\uFF08\u6930\u98CE\u6D77\u6EE9\uFF09",
            nameEn: "Yalong Bay Golden Coastline",
            type: "attraction",
            time: "09:00",
            duration: "3h",
            cost: 0,
            bestTime: "\u4E0A\u5348\u9633\u5149\u7480\u74A8\uFF0C\u6C99\u6EE9\u6700\u663E\u767D\u7EC6\uFF0C\u6D77\u6D6A\u6E29\u548C",
            crowdTimes: "\u4E0B\u5348\u5927\u6279\u9152\u5E97\u6CF3\u5BA2\u6F2B\u6B65\u6D77\u8FB9",
            tip: "\u4EAB\u6709\u201C\u5929\u4E0B\u7B2C\u4E00\u6E7E\u201D\u4E4B\u7F8E\u8A89\u3002\u6C99\u6EE9\u6D01\u767D\u5982\u94F6\uFF0C\u6D77\u6C34\u6E05\u6F88\u851A\u84DD\u3002\u8FD9\u91CC\u975E\u5E38\u9002\u5408\u6E38\u6CF3\u3001\u4F53\u9A8C\u9999\u8549\u8239\u7B49\u6D77\u4E0A\u6E38\u4E50\u3002",
            tipEn: "Renowned as the crown beach. Ultra-fine white sand and turquoise surf. Perfect for diving or light coastal reading.",
            coordinates: [18.2238, 109.6582]
          },
          {
            id: "sy-p2",
            name: "\u6797\u59D0\u6930\u5B50\u9E21\uFF08\u4E9A\u9F99\u6E7E\u5E97\uFF09",
            nameEn: "Sister Lin Coconut Chicken (Yalong)",
            type: "food",
            time: "12:30",
            duration: "1.5h",
            cost: 110,
            bestTime: "\u5927\u5FEB\u6735\u9890\u6930\u6C41\u716E\u6587\u660C\u9E21\u7684\u9999\u6C14\uFF0C\u9002\u5408\u4E2D\u5348\u6E05\u6DA6\u5F00\u80C3",
            crowdTimes: "12:00-13:00 \u5E97\u5185\u51E0\u4E4E\u5750\u6EE1",
            tip: "\u4E09\u4E9A\u5FC5\u5403\u540D\u83DC\u3002\u7528\u4E09\u4E2A\u65B0\u9C9C\u6930\u5B50\u73B0\u5F00\u5012\u6C64\u4F5C\u4E3A\u9505\u5E95\uFF0C\u4E0D\u6DFB\u52A0\u4E00\u6EF4\u6C34\u3002\u52A0\u5165\u6D77\u5357\u6563\u517B\u6587\u660C\u9E21\uFF0C\u6C64\u5E95\u6E05\u751C\u3001\u9E21\u8089\u7D27\u5B9E\u5F39\u7259\u3002",
            tipEn: "Vibrant local classic. Fresh raw coconut water boiled with organic, tender Wenchang chicken segments.",
            coordinates: [18.2301, 109.645]
          },
          {
            id: "sy-p3",
            name: "\u4E9A\u9F99\u6E7E\u70ED\u5E26\u5929\u5802\u68EE\u6797\u516C\u56ED",
            nameEn: "Yalong Bay Tropical Forest Park",
            type: "attraction",
            time: "14:30",
            duration: "4h",
            cost: 140,
            bestTime: "\u4E0B\u534816:00\u5728\u6CA7\u6D77\u697C\u4FEF\u77B0\u6574\u4E2A\u5F27\u5F62\u4E9A\u9F99\u6E7E\uFF0C\u5927\u5F00\u773C\u754C",
            crowdTimes: "\u7D22\u9053\u548C\u89C2\u5149\u7535\u8F66\u4E2D\u8F6C\u5904\u5E38\u6392\u957F\u961F",
            tip: "\u5750\u6781\u901F\u8FC7\u5C71\u8F66\u822C\u7684\u4E1B\u6797\u6E38\u89C8\u8F66\uFF0C\u8D8A\u8FC7\u9AD8\u5927\u70ED\u5E26\u96E8\u6797\u3002\u7AD9\u5728\u7D22\u6865\u4E0A\uFF0C\u88AB\u6EE1\u76EE\u7FE0\u7EFF\u5305\u56F4\uFF0C\u4EFF\u4F5B\u6F2B\u6B65\u5728\u7CBE\u7075\u68EE\u6797\u4E4B\u4E2D\u3002",
            tipEn: "Ride fast open-air mountain shuttles. Standing on the high bridge over the deep valley offers supreme photography.",
            coordinates: [18.2392, 109.6385]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "sy-p4",
            name: "\u8708\u652F\u6D32\u5C9B\u5EA6\u5047\u533A\uFF08\u4E09\u4E9A\u73BB\u7483\u6C34\u5929\u5802\uFF09",
            nameEn: "Wuzhizhou Coral Island Marine",
            type: "attraction",
            time: "08:00",
            duration: "5.5h",
            cost: 136,
            bestTime: "\u4E0A\u5348\u6D77\u6C34\u6781\u5EA6\u6E05\u6F88\uFF0C\u592A\u9633\u7167\u5C04\u4E0B\u73B0\u51FA\u68A6\u5E7B\u84DD\u7EFF\u8272\u5206\u5C42",
            crowdTimes: "10:00\u540E\u7801\u5934\u7B49\u8239\u533A\u4F1A\u6709\u5927\u578B\u65C5\u6E38\u56E2\u805A\u96C6\u6392\u957F\u961F",
            tip: "\u88AB\u79F0\u4E3A\u4E2D\u56FD\u9A6C\u5C14\u4EE3\u592B\u3002\u5982\u679C\u9884\u7B97\u5145\u88D5\uFF0C\u5F3A\u70C8\u8D2D\u4E70\u89C2\u5149\u8F66\u73AF\u5C9B\u6E38\uFF08\u7535\u74F6\u8F66\uFF09\uFF0C\u80FD\u5728\u8F66\u4E0A\u9971\u89C8\u4E0D\u5F00\u653E\u7684\u58EE\u4E3D\u602A\u77F3\u548C\u73BB\u7483\u6D77\u3002",
            tipEn: "Commonly described as China\u2019s Maldives. Getting a buggy-car ticket lets you inspect secret volcanic rocks and private lagoons.",
            coordinates: [18.3142, 109.7612]
          },
          {
            id: "sy-p5",
            name: "\u7B2C\u4E00\u5E02\u573A\u6D77\u9C9C\u52A0\u5DE5\u5927\u9910",
            nameEn: "First Market Fresh Seafood Haven",
            type: "food",
            time: "18:30",
            duration: "2.5h",
            cost: 160,
            bestTime: "\u508D\u665A\u5927\u7EA2\u5E02\u573A\u521A\u8FDB\u6D77\u9C9C\u65F6\u98DF\u6750\u6700\u65B0\u9C9C\u751F\u732A\u597D\u8089",
            crowdTimes: "19:00-21:00 \u6781\u5176\u55A7\u56A3\u62E5\u6324",
            tip: "\u5EFA\u8BAE\u81EA\u5DF1\u53BB\u6C34\u4EA7\u644A\u6311\u751F\u731B\u9752\u87F9\u3001\u76AE\u76AE\u867E\u3001\u8292\u679C\u87BA\uFF0C\u5207\u8BB0\u7B97\u51C6\u65A4\u4E24\uFF0C\u5E76\u9001\u5230\u53E3\u7891\u6781\u597D\u7684\u8001\u724C\u5E97\u8FDB\u884C\u52A0\u5DE5\uFF0C\u8FA3\u7092\u4E0E\u6912\u76D0\u662F\u6700\u68D2\u7684\u53E3\u5473\u3002",
            tipEn: "Pick fresh giant crabs, mantis shrimp and clams from vendors, choose spicy stir-fry or garlic-butter in trusted stores.",
            coordinates: [18.2492, 109.5101]
          }
        ]
      }
    ]
  },
  tokyo: {
    cityId: "tokyo",
    cityName: "\u4E1C\u4EAC",
    cityNameEn: "Tokyo",
    daysCount: 3,
    bestSeason: "10\u6708-11\u6708\uFF08\u7EA2\u53F6\u4E0E\u94F6\u674F\u53F6\u6F2B\u5929\uFF09\uFF0C3\u6708-4\u6708\uFF08\u843D\u6A31\u7C89\u767D\u7F24\u7EB7\uFF09",
    bestSeasonEn: "Oct - Nov (Autumn golden ginkgo & deep maple reds), Mar - Apr (Sakura cherry season)",
    localExpense: { tickets: 80, food: 220, hotel: 650, transit: 50 },
    veteranTips: [
      "SHIBUYA SKY\uFF08\u6DA9\u8C37\u5929\u7A7A\uFF09\u9732\u5929\u89C2\u5149\u53F0\u95E8\u7968\u6781\u62A2\u624B\uFF0C\u901A\u5E38\u5728\u63D0\u524D4\u5468\u552E\u7968\u5F53\u5929\u6570\u5206\u949F\u5185\u5C06\u65E5\u843D\u9EC4\u91D1\u6863\u552E\u7A7A\uFF0C\u8BF7\u63D0\u65E9\u4E0B\u624B\u3002",
      "\u4E1C\u4EAC\u5730\u94C1\u6781\u5176\u5BC6\u5982\u86DB\u7F51\uFF0C\u5355\u72EC\u4E70\u5355\u6B21\u7968\u65E2\u8D39\u5FC3\u53C8\u591A\u82B1\u94B1\uFF0C\u4E00\u5B9A\u8981\u4E70 24h / 48h / 72h \u5730\u94C1\u65E0\u9650\u6B21\u901A\u7968\u3002",
      "\u7B51\u5730\u573A\u5916\u5E02\u573A\u5C0F\u5403\u4F17\u591A\uFF0C\u591A\u6570\u5E97\u94FA13:00\u540E\u9646\u7EED\u6536\u5E02\uFF0C\u5EFA\u8BAE\u6E05\u7A7A\u80C3\u53E3\u65E9\u4E0A9:00\u524D\u5F80\u3002"
    ],
    veteranTipsEn: [
      "SHIBUYA SKY open sunset tickets sell out within minutes of release! Reserve exactly 4 weeks early online.",
      "Tokyo subways are legendary labyrinth-like webs. Buy the 24/48/72 hours Tokyo Subway Ticket to save cost & stress.",
      "Tsukiji Outer Market has amazing fresh fish. Shuts down near 13:00; head early for ultimate brunch spoils."
    ],
    isAiEnhanced: false,
    days: [
      {
        day: 1,
        pois: [
          {
            id: "tk-p1",
            name: "\u6D45\u8349\u5BFA\u4E0E\u4EF2\u89C1\u4E16\u901A",
            nameEn: "Senso-ji Temple & Nakamise Shopping",
            type: "attraction",
            time: "08:30",
            duration: "2.5h",
            cost: 0,
            bestTime: "\u6E05\u6668\u7EA2\u6F06\u96F7\u95E8\u548C\u4E3B\u9662\u65E0\u5927\u6279\u62E5\u6324\u6E38\u5BA2\u7684\u6700\u4F73\u62CD\u7167\u89D2\u5EA6",
            crowdTimes: "10:00 \u4E4B\u540E\u4E3B\u8857\u9053\u88AB\u4EBA\u7FA4\u5F7B\u5E95\u541E\u6CA1",
            tip: "\u4E1C\u4EAC\u6700\u60A0\u4E45\u7684\u4F5B\u5BFA\uFF0C\u6781\u5DE8\u5927\u7684\u201C\u96F7\u95E8\u201D\u7EA2\u8272\u63D0\u706F\u6781\u5177\u9707\u6151\u529B\u3002\u5728\u5927\u6BBF\u53EF\u4EE5\u82B1100\u65E5\u5143\u62CD\u624B\u62BD\u4E00\u5F20\u7B7E\uFF0C\u62BD\u5230\u51F6\u7CFB\u6302\u5728\u67B6\u5B50\u4E0A\u6D88\u707E\u3002",
            tipEn: "The oldest, iconic temple of Tokyo. Draw an omikuji (fortune slip); tie any bad luck results onto the iron racks.",
            coordinates: [35.7148, 139.7967]
          },
          {
            id: "tk-p2",
            name: "\u7B51\u5730\u573A\u5916\u5E02\u573A\uFF08\u4EAB\u5BFF\u53F8\u3001\u751F\u869D\u5927\u9910\uFF09",
            nameEn: "Tsukiji Outer Market Seafood Feast",
            type: "food",
            time: "11:30",
            duration: "2h",
            cost: 90,
            bestTime: "\u8D81\u7740\u65B0\u9C9C\u8D27\u6EE1\u8F7D\u65F6\u5927\u9971\u53E3\u798F",
            crowdTimes: "11:00-12:30 \u6240\u6709\u62DB\u724C\u6D77\u9C9C\u4E3C\u957F\u961F\u5BC6\u5E03",
            tip: "\u751F\u732A\u8089\u3001\u7389\u5B50\u70E7\u3001\u73B0\u5F00\u751F\u869D\u6781\u591A\u3002\u53EF\u4EE5\u5C1D\u8BD5\u9999\u751C\u591A\u6C41\u7684\u70AD\u70E4\u548C\u725B\u8089\u4E32\u548C\u6B63\u5B97\u7684\u541E\u62FF\u9C7C\u5BFF\u53F8\uFF0C\u98DF\u6750\u6781\u4F73\u3002",
            tipEn: "Enjoy ultra-fresh tuna bowls, grilled wagyu skewers, sweet tamagoyaki egg blocks and massive sea oysters.",
            coordinates: [35.6655, 139.7702]
          },
          {
            id: "tk-p3",
            name: "\u79CB\u53F6\u539F\u7535\u5668\u8857\u53CA\u52A8\u6F2B\u4E8C\u6B21\u5143\u5723\u5FC3",
            nameEn: "Akihabara Electric Town",
            type: "attraction",
            time: "14:00",
            duration: "3.5h",
            cost: 0,
            bestTime: "\u5348\u540E\u6DD8\u8D27\u65F6\u5149\uFF0C\u9AD8\u8FBE\u73A9\u5177\u3001\u7EDD\u7248\u624B\u529E\u7433\u7405\u6EE1\u76EE",
            crowdTimes: "\u5468\u672B\u6B65\u884C\u8857\u5F00\u653E\uFF0C\u5BA2\u6D41\u5230\u8FBE\u9876\u5CF0",
            tip: "\u5168\u7403\u786C\u6838\u6F2B\u8FF7\u7684\u671D\u5723\u9996\u9009\u5730\u3002\u5927\u540D\u9F0E\u9F0E\u7684Mandarake\uFF08\u624B\u529E\u5E97\uFF09\u548CRadio Kaikan\uFF08\u7535\u6CE2\u4F1A\u9986\uFF09\u975E\u5E38\u8010\u770B\uFF0C\u85CF\u54C1\u65E0\u6570\u3002",
            tipEn: "The ultimate anime and gaming capital. Towering stores are packed full of retro game boxes and collectible figurines.",
            coordinates: [35.6997, 139.7714]
          },
          {
            id: "tk-p4",
            name: "\u4E1C\u4EAC\u5854\u773A\u671B\uFF08\u516D\u672C\u6728\u4E4B\u4E18\u770B\u5854\u6700\u4F73\uFF09",
            nameEn: "Tokyo Tower View (Roppongi Hills)",
            type: "attraction",
            time: "18:30",
            duration: "2.5h",
            cost: 15,
            bestTime: "\u7EA2\u767D\u4E1C\u4EAC\u5854\u5728\u6F2B\u5929\u9713\u8679\u4E2D\u4EAE\u8D77\u6E29\u99A8\u6A59\u5149\u7684\u4E00\u523B",
            crowdTimes: "\u5C55\u671B\u53F0\u770B\u5854\u843D\u5730\u73BB\u7483\u7A97\u524D\u6781\u53D7\u6B22\u8FCE",
            tip: "\u4E0E\u5176\u767B\u5854\uFF0C\u4E0D\u5982\u5728\u516D\u672C\u6728\u4E4B\u4E18\uFF08Roppongi Hills\uFF09\u89C2\u5149\u5C42\u8FDC\u671B\u4E1C\u4EAC\u5854\u3002\u6696\u91D1\u660E\u8273\u7684\u5DE8\u5854\u5728\u7480\u74A8\u4E1C\u4EAC\u591C\u8272\u80CC\u666F\u4E2D\u5982\u4E00\u9897\u8000\u773C\u73E0\u5B9D\u3002",
            tipEn: "Viewing the tower from Roppongi Hills is infinitely more gorgeous than climbing it, framing it perfectly beside neon roads.",
            coordinates: [35.6586, 139.7454]
          }
        ]
      },
      {
        day: 2,
        pois: [
          {
            id: "tk-p5",
            name: "\u660E\u6CBB\u795E\u5BAB\uFF08\u95F9\u5E02\u91CC\u7684\u68EE\u6797\u7EFF\u80BA\uFF09",
            nameEn: "Meiji Jingu Shrine & Forest",
            type: "attraction",
            time: "09:00",
            duration: "2h",
            cost: 0,
            bestTime: "\u6E05\u6668\u8584\u96FE\u4E2D\uFF0C\u53C2\u5929\u5927\u6811\u548C\u9E1F\u9E23\u5E26\u6765\u6781\u5EA6\u5B81\u9759\u5B89\u7965",
            crowdTimes: "\u5468\u672B\u6709\u6781\u5927\u6982\u7387\u76EE\u7779\u4F20\u7EDF\u795E\u9053\u5A5A\u793C\uFF08\u795E\u524D\u7ED3\u5A5A\u5F0F\uFF09",
            tip: "\u6B65\u5165\u5DE8\u5927\u5B8F\u4F1F\u7684\u6728\u5236\u201C\u5927\u9E1F\u5C45\u201D\uFF0C\u7A7F\u8D8A\u53C2\u5929\u5DE8\u6728\u6784\u7B51\u4E4B\u6797\u836B\u5E7D\u5F84\uFF0C\u53EF\u4EE5\u8D2D\u4E70\u4E00\u4EFD\u5FC3\u613F\u6728\u7ED8\uFF08\u7ED8\u9A6C\uFF09\u5199\u4E0A\u7948\u613F\u3002",
            tipEn: "Pass the colossal wooden Torii arch built of 1500-year-old cedar. Walking the gravel path naturally calms the mind.",
            coordinates: [35.6764, 139.6993]
          },
          {
            id: "tk-p6",
            name: "\u8868\u53C2\u9053 & \u539F\u5BBF\u7AF9\u4E0B\u901A\u8857\u5934\u65F6\u5C1A",
            nameEn: "Omotesando & Harajuku Fashion Stroll",
            type: "attraction",
            time: "11:30",
            duration: "3h",
            cost: 0,
            bestTime: "\u5348\u540E\u6563\u5FC3\uFF0C\u770B\u602A\u4E2D\u602A\u5947\u7684\u670B\u514B\u670B\u514B\u548C\u6D1B\u4E3D\u5854\u6253\u626E",
            crowdTimes: "\u7AF9\u4E0B\u901A\u5761\u9053\u4E0A\u5168\u662F\u4E1C\u4EAC\u5E74\u8F7B\u4EBA",
            tip: "\u4E00\u8857\u4E4B\u9694\uFF0C\u4E24\u4E2A\u4E16\u754C\uFF1A\u7AF9\u4E0B\u901A\u805A\u96C6\u7740\u8272\u5F69\u6591\u6593\u3001\u5403\u7740\u5F69\u8679\u53EF\u4E3D\u997C\u7684\u539F\u5BBF\u4E8C\u6B21\u5143\u5C11\u5E74\uFF1B\u8868\u53C2\u9053\u6797\u7ACB\u9876\u5C16\u7684\u51E0\u4F55\u5B89\u85E4\u5FE0\u96C4\u7B49\u540D\u5E08\u5927\u5E08\u7EA7\u5EFA\u7B51\u3002",
            tipEn: "Two worlds: Harajuku pops with colorful cosplay and giant cr\xEApes; Omotesando layout features sleek master architecture galleries.",
            coordinates: [35.6686, 139.7094]
          },
          {
            id: "tk-p7",
            name: "\u6DA9\u8C37\u5341\u5B57\u8DEF\u53E3\u4E0E\u6DA9\u8C37SKY\u9AD8\u7A7A\u843D\u65E5",
            nameEn: "Shibuya Crossing & SHIBUYA SKY",
            type: "attraction",
            time: "15:30",
            duration: "3h",
            cost: 16,
            bestTime: "\u65E5\u843D\u524D\u534A\u5C0F\u65F6\u81F3\u534E\u706F\u7480\u74A8\u7684\u9EC4\u91D12\u5C0F\u65F6\u8FC7\u6E21",
            crowdTimes: "17:00-19:00 \u65E5\u843D\u65F6\u6BB5\u4E00\u4F4D\u96BE\u6C42\uFF0C\u5FC5\u987B\u63D0\u524D1\u4E2A\u6708\u9884\u7EA6",
            tip: "\u767B\u4E0A47\u5C42\u9732\u5929\u5929\u7A7A\u77AD\u671B\u53F0\uFF0C\u770B\u8457\u540D\u7684\u201C\u6DA9\u8C37\u5BF9\u89D2\u9A6C\u8DEF\u201D\u884C\u4EBA\u7FA4\u6D41\u5982\u8681\uFF0C\u5E76\u5728\u9AD8\u7A7A\u4E2D\u4FEF\u77B0\uFF0C\u5929\u6C14\u6674\u6717\u80FD\u76F4\u63A5\u773A\u671B\u5BCC\u58EB\u5C71\uFF01",
            tipEn: "Rise to the open-air roof of Shibuya Sky. Gaze down on the busiest crossing in the world. Clear days offer views of Mount Fuji.",
            coordinates: [35.6585, 139.7018]
          }
        ]
      },
      {
        day: 3,
        pois: [
          {
            id: "tk-p8",
            name: "\u65B0\u5BBF\u5FA1\u82D1",
            nameEn: "Shinjuku Gyoen Garden",
            type: "attraction",
            time: "09:30",
            duration: "2.5h",
            cost: 4,
            bestTime: "\u4E0A\u5348\u5FAE\u98CE\u5439\u8D77\u5927\u8349\u576A\u6811\u68A2\uFF0C\u91CE\u9910\u4F53\u9A8C\u7EDD\u4F73",
            crowdTimes: "\u6A31\u82B1\u5B63\u6781\u5176\u62E5\u6324\uFF0C\u591A\u4E3A\u91CE\u9910\u8D4F\u6A31\u5BA2",
            tip: "\u65B0\u6D77\u8BDA\u300A\u8A00\u53F6\u4E4B\u5EAD\u300B\u52A8\u753B\u7684\u6838\u5FC3\u539F\u578B\u5730\u3002\u65E5\u5F0F\u6C60\u6CC9\u56DE\u6E38\u56ED\u6797\u3001\u82F1\u5F0F\u5927\u6E29\u5BA4\u4E0E\u6CD5\u5F0F\u523A\u7EE3\u753B\u9662\u76F8\u7ED3\u5408\uFF0C\u7F8E\u4E0D\u80DC\u6536\u3002",
            tipEn: 'The central garden featured in anime "The Garden of Words". Walk the masterfully curated Japanese, French and English zones.',
            coordinates: [35.6852, 139.7101]
          }
        ]
      }
    ]
  }
};
function generateLocalPlan(cityId, daysRequested) {
  const cachedPlan = CITIES_DETAIL[cityId];
  const cityIdx = ALL_CITIES_INDEX.find((c) => c.id === cityId);
  const name = cityIdx ? cityIdx.name : cityId;
  const nameEn = cityIdx ? cityIdx.nameEn : cityId;
  const lat = cityIdx ? cityIdx.coordinates[0] : 39.9042;
  const lng = cityIdx ? cityIdx.coordinates[1] : 116.4074;
  if (cachedPlan) {
    const result = JSON.parse(JSON.stringify(cachedPlan));
    result.daysCount = daysRequested;
    if (daysRequested <= cachedPlan.days.length) {
      result.days = result.days.slice(0, daysRequested);
    } else {
      while (result.days.length < daysRequested) {
        const nextDayNum = result.days.length + 1;
        const originalDayTemplate = cachedPlan.days[(nextDayNum - 1) % cachedPlan.days.length];
        const deepCopyDay = JSON.parse(JSON.stringify(originalDayTemplate));
        deepCopyDay.day = nextDayNum;
        deepCopyDay.pois.forEach((poi, idx) => {
          poi.id = `${cityId}-p-d${nextDayNum}-${idx}`;
        });
        result.days.push(deepCopyDay);
      }
    }
    const ratio = daysRequested / cachedPlan.daysCount;
    result.localExpense = {
      tickets: Math.round(cachedPlan.localExpense.tickets * ratio),
      food: Math.round(cachedPlan.localExpense.food * ratio),
      hotel: Math.round(cachedPlan.localExpense.hotel * ratio),
      transit: Math.round(cachedPlan.localExpense.transit * ratio)
    };
    return result;
  }
  const days = [];
  for (let d = 1; d <= daysRequested; d++) {
    days.push({
      day: d,
      pois: [
        {
          id: `${cityId}-programmatic-d${d}-p1`,
          name: `${name}\u6838\u5FC3\u540D\u80DC\u6F2B\u6B65 (D${d}-01)`,
          nameEn: `${nameEn} Landmark Excursion (Day ${d} - AM)`,
          type: "attraction",
          time: "09:00",
          duration: "3h",
          cost: 60,
          bestTime: "09:00 - 11:30",
          crowdTimes: "10:30-12:00",
          tip: "\u8BE5\u57CE\u5E02\u7684\u4EE3\u8868\u6027\u5730\u6807\u3002\u6587\u5316\u6C14\u52BF\u6062\u5B8F\uFF0C\u4EBA\u6587\u5E95\u8574\u6781\u4E3A\u6DF1\u539A\uFF0C\u5EFA\u8BAE\u8BF7\u5BFC\u89C8\u6216\u8005\u914D\u5408\u5B98\u65B9\u8033\u673A\u89E3\u8BFB\u4EAB\u53D7\u53E4\u5178\u666F\u89C2\u3002",
          tipEn: "The definitive local point of high interest. Beautiful architecture and scenery. Early stroll is delightful.",
          coordinates: [lat + 5e-3 * d, lng - 8e-3 * d]
        },
        {
          id: `${cityId}-programmatic-d${d}-p2`,
          name: `${name}\u7279\u8272\u8001\u5B57\u53F7\u9955\u992E\u5927\u9910 (D${d}-02)`,
          nameEn: `${nameEn} Gourmet Legacy (Day ${d} - Lunch)`,
          type: "food",
          time: "12:30",
          duration: "1.5h",
          cost: 75,
          bestTime: "12:00 - 13:00",
          crowdTimes: "12:30 \u7206\u6EE1",
          tip: "\u8BE5\u5730\u533A\u4E45\u8D1F\u76DB\u540D\u7684\u4F20\u7EDF\u6392\u961F\u8001\u94FA\u3002\u62DB\u724C\u7279\u8272\u98CE\u5473\u8BA9\u4EBA\u6D41\u8FDE\u5FD8\u8FD4\uFF0C\u98CE\u5473\u7EDD\u4F73\uFF01\u914D\u4E0A\u4E00\u7897\u9C9C\u6C64\u7B80\u76F4\u7EDD\u4F26\u3002",
          tipEn: "Voted high by local critiques. Savory dishes prepared using raw, organic local methods.",
          coordinates: [lat - 3e-3 * d, lng + 2e-3 * d]
        },
        {
          id: `${cityId}-programmatic-d${d}-p3`,
          name: `${name}\u73B0\u4EE3\u4EBA\u6587\u8857\u533A\u4E0E\u5348\u540E\u6E38\u8D4F (D${d}-03)`,
          nameEn: `${nameEn} Cultural Neighborhood (Day ${d} - PM)`,
          type: "attraction",
          time: "14:30",
          duration: "3.5h",
          cost: 25,
          bestTime: "15:00",
          crowdTimes: "\u5468\u672B\u6216\u8282\u5047\u65E5\u9053\u8DEF\u5BC6\u5E03\u70ED\u95F9",
          tip: "\u6781\u5177\u6D6A\u6F2B\u6216\u5F53\u5730\u70DF\u706B\u6C14\u7684\u5E02\u4E95\u5546\u4E1A\u8001\u8857\u3002\u6797\u7ACB\u7740\u72EC\u7ACB\u5496\u5561\u9986\u3001\u9676\u827A\u9986\u4E0E\u624B\u63A8\u753B\u644A\uFF0C\u975E\u5E38\u6587\u827A\u51FA\u5708\u3002",
          tipEn: "A fascinating walking lane loaded with street vendors, local handicrafts and unique photo opportunities.",
          coordinates: [lat - 8e-3 * d, lng - 3e-3 * d]
        }
      ]
    });
  }
  return {
    cityId,
    cityName: name,
    cityNameEn: nameEn,
    daysCount: daysRequested,
    bestSeason: "\u9002\u5B9C\u56DB\u5B63\u884C\u6E38\uFF08\u6625\u79CB\u6700\u76DB\uFF09",
    bestSeasonEn: "All seasons amiable (Spring & Autumn are perfect)",
    localExpense: {
      tickets: 80 * daysRequested,
      food: 120 * daysRequested,
      hotel: 280 * daysRequested,
      transit: 30 * daysRequested
    },
    veteranTips: [
      `\u6E38\u73A9 ${name} \u65F6\uFF0C\u5EFA\u8BAE\u51C6\u5907\u8F7B\u4FBF\u968F\u8EAB\u884C\u56CA\u4E0E\u81EA\u9002\u5E94\u978B\u5C65\u3002`,
      "\u63D0\u524D\u67E5\u770B\u5F53\u5730\u8F68\u9053\u6216\u8005\u5BA2\u8FD0\u901A\u884C\u8BC1\uFF0C\u4E0D\u4EC5\u4FBF\u6377\u8FD8\u80FD\u4EAB\u53D7\u5DE8\u989D\u6298\u60E0\u3002",
      "\u907F\u5F00\u9AD8\u5CF0\u666F\u533A\u7684\u6D41\u52A8\u63A8\u9500\u98DF\u54C1\uFF0C\u591A\u9009\u62E9\u8001\u8857\u5F04\u91CC\u7684\u6DF1\u8015\u8001\u5B57\u53F7\u3002"
    ],
    veteranTipsEn: [
      `When traveling through ${nameEn}, pack light and carry responsive footwear.`,
      "Inter-district transportation combined passes frequently slash prices by half.",
      "To curb dynamic gourmet pricing traps, look deep into residential old avenues."
    ],
    isAiEnhanced: false,
    days
  };
}

// server.ts
var import_firestore = require("@google-cloud/firestore");
var import_fs = __toESM(require("fs"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
function cleanJsonString(text) {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(json)?\s*/i, "");
    clean = clean.replace(/\s*```$/, "");
  }
  return clean.trim();
}
async function callOpenAiCompatible(baseUrl, apiKey, model, prompt, systemInstruction, isJson = false) {
  const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${cleanUrl}/chat/completions`;
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });
  const body = {
    model: model || "deepseek-chat",
    messages
  };
  if (isJson) {
    body.response_format = { type: "json_object" };
  }
  body.temperature = 0.2;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upstream API failed (${response.status}): ${errText}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM response message content was empty.");
  }
  return content;
}
app.post("/api/plan/test-ai", async (req, res) => {
  const { customLlm } = req.body;
  if (!customLlm || !customLlm.baseUrl) {
    return res.status(400).json({ success: false, error: "Missing Base URL configuration." });
  }
  const effectiveApiKey = customLlm.apiKey || (customLlm.provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : "") || "";
  if (!effectiveApiKey) {
    return res.status(400).json({ success: false, error: "Missing API key configuration." });
  }
  try {
    const rawText = await callOpenAiCompatible(
      customLlm.baseUrl,
      effectiveApiKey,
      customLlm.model || "deepseek-chat",
      "Please greet the user warmly and confirm that their custom API key connection is fully operational in exactly 20 characters or less."
    );
    res.json({ success: true, message: rawText.trim() });
  } catch (err) {
    console.error("Test Custom AI Connection failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/plan/test-amap", async (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, error: "Missing Amap SDK API Key configuration." });
  }
  try {
    const response = await fetch(`https://webapi.amap.com/maps?v=2.0&key=${key}`);
    if (!response.ok) {
      throw new Error(`Upstream Amap JS Server failed with HTTP Status: ${response.status}`);
    }
    const body = await response.text();
    const lowerBody = body.toLowerCase();
    if (lowerBody.includes("invalid_user_key") || lowerBody.includes("key\u683C\u5F0F") || lowerBody.includes("key\u683C\u5F0F\u9519\u8BEF") || lowerBody.includes("key\u5DF2\u9650\u5236") || lowerBody.includes("key\u5DF2\u5931\u6548") || lowerBody.includes("key\u65E0\u6548") || lowerBody.includes("key\u4E0D\u6B63\u786E") || lowerBody.includes("user_key_recv_fail") || lowerBody.includes("invalid user key") || lowerBody.includes("err_key") || body.includes("alert(") && !body.includes("AMap")) {
      let errorDetail = "Invalid Amap Web JS API Key. Please check characters, billing, and domain referrers.";
      if (lowerBody.includes("invalid_user_key")) {
        errorDetail = "Amap Error: INVALID_USER_KEY (Key is invalid or does not exist).";
      } else if (lowerBody.includes("key\u683C\u5F0F")) {
        errorDetail = "Amap Error: Key format is incorrect (key\u683C\u5F0F\u4E0D\u6B63\u786E/\u4E0D\u5339\u914D).";
      } else if (lowerBody.includes("user_key_recv_fail")) {
        errorDetail = "Amap Error: USER_KEY_RECV_FAIL (Please verify if the Key is of Web\u7AEF (JS API) type).";
      }
      res.json({ success: false, error: errorDetail });
    } else if (body.includes("AMap") || body.includes("amap") || response.status === 200) {
      res.json({
        success: true,
        message: "Success! Web JS (Web\u7AEF) JS SDK script loaded and verified cleanly. Ready to paint interactive Map routes."
      });
    } else {
      res.json({ success: false, error: "Failed to verify. Script content returned is unrecognized." });
    }
  } catch (err) {
    console.error("Test Amap Connection failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/plan/parse-receipt", async (req, res) => {
  const { fileData, fileName, mimeType } = req.body;
  if (!fileData) {
    return res.status(400).json({ success: false, error: "Missing base64 file data." });
  }
  try {
    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: fileData
      }
    };
    const targetPrompt = `Analyze the provided invoice, receipt, passport booking, flight detail, or ticket confirmation document. Extract key travel/itinerary attributes.
Important rules:
1. Identify the 'receiptType' strictly as one of: 'flight', 'train', 'hotel', 'attraction', 'dining', 'other'.
2. Identify departure location as 'fromCity' and arrival/hotel/attraction location as 'toCity'. If not applicable, set them to null.
3. Identify the Gregorian calendar Date as 'date' in 'YYYY-MM-DD' format. If no year is explicitly referenced but month/day is, default to the year 2026. If no date is found, use null.
4. Identify Time as 'time' in 'HH:MM' format, or null.
5. Identify the numeric transaction cost/amount as 'amount' and currency as 'currency' (e.g. 'CNY', 'USD', etc.).
6. Fill 'description' with clear labels, e.g. "Beijing Air flight CA1504", "Shanghai Hotel check-in", "Disneyland Entrance pass". Keep it readable and in the user's apparent preference language (Chinese/Bilingual).
7. Summarize any other important findings as 'notes' (e.g. seat class, room type, checkout policy, gates, etc.).

Return a single JSON object matching this schema structure:
{
  "receiptType": "flight" | "train" | "hotel" | "attraction" | "dining" | "other",
  "fromCity": string | null,
  "toCity": string | null,
  "date": string | null,
  "time": string | null,
  "amount": number | null,
  "currency": string | null,
  "description": string | null,
  "notes": string | null
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, targetPrompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            receiptType: { type: import_genai.Type.STRING },
            fromCity: { type: import_genai.Type.STRING },
            toCity: { type: import_genai.Type.STRING },
            date: { type: import_genai.Type.STRING },
            time: { type: import_genai.Type.STRING },
            amount: { type: import_genai.Type.NUMBER },
            currency: { type: import_genai.Type.STRING },
            description: { type: import_genai.Type.STRING },
            notes: { type: import_genai.Type.STRING }
          },
          required: ["receiptType"]
        }
      }
    });
    const outputText = response.text ? response.text.trim() : "{}";
    const cleanedText = cleanJsonString(outputText);
    const parsed = JSON.parse(cleanedText);
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Invoice parsing failed via Gemini:", err.message);
    const lowerName = (fileName || "").toLowerCase();
    let computedType = "other";
    let mockDesc = `Parsed document (${fileName || "Untitled Ticket"})`;
    let mockAmount = 350;
    if (lowerName.includes("flight") || lowerName.includes("ticket") || lowerName.includes("\u673A\u7968") || lowerName.includes("ca")) {
      computedType = "flight";
      mockDesc = "Guangzhou to Shanghai Flight CA1835 (Auto fallback extraction)";
      mockAmount = 820;
    } else if (lowerName.includes("train") || lowerName.includes("g") || lowerName.includes("d") || lowerName.includes("\u706B\u8F66") || lowerName.includes("\u9AD8\u94C1")) {
      computedType = "train";
      mockDesc = "Beijing to Nanjing Highspeed Rail G103 (Auto fallback extraction)";
      mockAmount = 440;
    } else if (lowerName.includes("hotel") || lowerName.includes("inn") || lowerName.includes("\u9152\u5E97")) {
      computedType = "hotel";
      mockDesc = "Westin Bund Residence 2-Nights Stay (Auto fallback extraction)";
      mockAmount = 1200;
    } else if (lowerName.includes("park") || lowerName.includes("ticket") || lowerName.includes("\u666F\u70B9") || lowerName.includes("\u95E8\u7968")) {
      computedType = "attraction";
      mockDesc = "Theme Park One-Day Entry Pass (Auto fallback extraction)";
      mockAmount = 180;
    }
    res.json({
      success: true,
      isFallback: true,
      data: {
        receiptType: computedType,
        fromCity: computedType === "flight" ? "\u5E7F\u5DDE" : computedType === "train" ? "\u5317\u4EAC" : null,
        toCity: computedType === "flight" ? "\u4E0A\u6D77" : computedType === "train" ? "\u5357\u4EAC" : computedType === "hotel" ? "\u4E0A\u6D77" : "\u5317\u4EAC",
        date: "2026-05-24",
        time: "14:30",
        amount: mockAmount,
        currency: "CNY",
        description: mockDesc,
        notes: `Extracted via filename smart heuristic (Local Fallback Mode). Detail: ${err.message}`
      }
    });
  }
});
var dynamicCustomCities = [];
var dynamicCustomCityPlans = {};
app.post("/api/cities/generate-write", async (req, res) => {
  const { query, customLlm } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required for custom city generation." });
  }
  const queryClean = query.trim();
  try {
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== "gemini";
    const effectiveApiKey = customLlm?.apiKey || (customLlm?.provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : "") || "";
    const systemInstruction = `You are an expert travel database orchestrator. Given a search query for a city name, analyze it and generate:
1. cityIndex: The metadata node for indexing this city.
2. cityDetail: A gorgeous, highly detailed travel schedule of exactly 3 days for this city containing real popular POIs, coordinates, cost estimations (in CNY), and helpful travel tips.

IMPORTANT: You must response with a single valid JSON object containing "cityIndex" and "cityDetail". Ensure there are no markdown backticks, no trailing comments, and the formatting matches the schemas below:
{
  "cityIndex": {
    "id": "lowercase_english_id_no_spaces",
    "name": "Chinese City Name (e.g. \u4E09\u660E)",
    "nameEn": "English City Name (e.g. Sanming)",
    "pinyin": "pinyin_lowercase_no_spaces (e.g. sanming)",
    "region": "Province/State Name in Chinese (e.g. \u798F\u5EFA)",
    "regionEn": "Province/State Name in English (e.g. Fujian)",
    "isInternational": false,
    "coordinates": [latitude_float, longitude_float]
  },
  "cityDetail": {
    "cityId": "lowercase_english_id_no_spaces (must match the id in cityIndex)",
    "cityName": "Chinese City Name",
    "cityNameEn": "English City Name",
    "daysCount": 3,
    "bestSeason": "Best season description in Chinese",
    "bestSeasonEn": "Best season description in English",
    "localExpense": {
      "tickets": average_cny_tickets_sum_for_3_days,
      "food": average_cny_food_sum_for_3_days,
      "hotel": average_cny_hotel_sum_for_3_days,
      "transit": average_cny_local_transit_sum_for_3_days
    },
    "veteranTips": ["Tip 1 in Chinese", "Tip 2 in Chinese", "Tip 3 in Chinese"],
    "veteranTipsEn": ["Tip 1 in English", "Tip 2 in English", "Tip 3 in English"],
    "days": [
      {
        "day": 1,
        "pois": [
          {
            "id": "unique_id_string_1",
            "name": "Attraction Name in Chinese",
            "nameEn": "Name in English",
            "type": "attraction",
            "time": "09:00",
            "duration": "3h",
            "cost": 50,
            "bestTime": "Golden hour advice in Chinese",
            "crowdTimes": "Crowd hour advice in Chinese",
            "tip": "Insider tip in Chinese",
            "tipEn": "Insider tip in English",
            "coordinates": [latitude_float, longitude_float]
          }
        ]
      }
    ]
  }
}`;
    const mainPrompt = `Generate cityIndex and cityDetail for the query city: "${queryClean}". Try to make the coordinates, POI suggestions, local costs, and coordinates highly realistic and localized. Give up to 3 characteristic activities/POIs across each of the 3 days.`;
    let responseJsonText = "";
    if (hasCustomLlm && customLlm.baseUrl && effectiveApiKey) {
      responseJsonText = await callOpenAiCompatible(
        customLlm.baseUrl,
        effectiveApiKey,
        customLlm.model || "deepseek-chat",
        mainPrompt,
        systemInstruction,
        true
      );
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${systemInstruction}

User query:
${mainPrompt}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              cityIndex: {
                type: import_genai.Type.OBJECT,
                properties: {
                  id: { type: import_genai.Type.STRING },
                  name: { type: import_genai.Type.STRING },
                  nameEn: { type: import_genai.Type.STRING },
                  pinyin: { type: import_genai.Type.STRING },
                  region: { type: import_genai.Type.STRING },
                  regionEn: { type: import_genai.Type.STRING },
                  isInternational: { type: import_genai.Type.BOOLEAN },
                  coordinates: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.NUMBER }
                  }
                },
                required: ["id", "name", "nameEn", "pinyin", "region", "regionEn", "isInternational", "coordinates"]
              },
              cityDetail: {
                type: import_genai.Type.OBJECT,
                properties: {
                  cityId: { type: import_genai.Type.STRING },
                  cityName: { type: import_genai.Type.STRING },
                  cityNameEn: { type: import_genai.Type.STRING },
                  daysCount: { type: import_genai.Type.INTEGER },
                  bestSeason: { type: import_genai.Type.STRING },
                  bestSeasonEn: { type: import_genai.Type.STRING },
                  localExpense: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      tickets: { type: import_genai.Type.INTEGER },
                      food: { type: import_genai.Type.INTEGER },
                      hotel: { type: import_genai.Type.INTEGER },
                      transit: { type: import_genai.Type.INTEGER }
                    },
                    required: ["tickets", "food", "hotel", "transit"]
                  },
                  veteranTips: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  veteranTipsEn: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  days: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        day: { type: import_genai.Type.INTEGER },
                        pois: {
                          type: import_genai.Type.ARRAY,
                          items: {
                            type: import_genai.Type.OBJECT,
                            properties: {
                              id: { type: import_genai.Type.STRING },
                              name: { type: import_genai.Type.STRING },
                              nameEn: { type: import_genai.Type.STRING },
                              type: { type: import_genai.Type.STRING },
                              time: { type: import_genai.Type.STRING },
                              duration: { type: import_genai.Type.STRING },
                              cost: { type: import_genai.Type.INTEGER },
                              bestTime: { type: import_genai.Type.STRING },
                              crowdTimes: { type: import_genai.Type.STRING },
                              tip: { type: import_genai.Type.STRING },
                              tipEn: { type: import_genai.Type.STRING },
                              coordinates: {
                                type: import_genai.Type.ARRAY,
                                items: { type: import_genai.Type.NUMBER }
                              }
                            },
                            required: ["id", "name", "nameEn", "type", "time", "duration", "cost", "bestTime", "crowdTimes", "tip", "tipEn", "coordinates"]
                          }
                        }
                      },
                      required: ["day", "pois"]
                    }
                  }
                },
                required: ["cityId", "cityName", "cityNameEn", "daysCount", "bestSeason", "bestSeasonEn", "localExpense", "veteranTips", "veteranTipsEn", "days"]
              }
            },
            required: ["cityIndex", "cityDetail"]
          }
        }
      });
      responseJsonText = response.text ? response.text.trim() : "{}";
    }
    const cleanedText = cleanJsonString(responseJsonText);
    const parsed = JSON.parse(cleanedText);
    if (parsed.cityIndex && parsed.cityDetail) {
      const targetId = parsed.cityIndex.id.toLowerCase().replace(/\s+/g, "");
      parsed.cityIndex.id = targetId;
      parsed.cityDetail.cityId = targetId;
      if (typeof parsed.cityIndex.isInternational !== "boolean") {
        parsed.cityIndex.isInternational = false;
      }
      const existingIdx = dynamicCustomCities.findIndex((c) => c.id === targetId);
      if (existingIdx !== -1) {
        dynamicCustomCities[existingIdx] = parsed.cityIndex;
      } else {
        dynamicCustomCities.push(parsed.cityIndex);
      }
      dynamicCustomCityPlans[targetId] = parsed.cityDetail;
      console.log(`Successfully generated and wrote custom city data via LLM: ${targetId} (${parsed.cityIndex.name})`);
      return res.json({
        success: true,
        cityIndex: parsed.cityIndex,
        cityDetail: parsed.cityDetail
      });
    } else {
      throw new Error("LLM structural response did not contain cityIndex or cityDetail keys.");
    }
  } catch (err) {
    console.error("Failed to generate and write custom city data:", err.message);
    res.status(500).json({ error: `AI City Generation and Writing failed: ${err.message}` });
  }
});
app.get("/api/cities/search", async (req, res) => {
  const query = req.query.query ? String(req.query.query).trim() : "";
  if (!query) {
    return res.json([]);
  }
  const allAvailable = [...ALL_CITIES_INDEX, ...dynamicCustomCities];
  const localMatch = allAvailable.filter(
    (c) => c.name.includes(query) || c.nameEn.toLowerCase().includes(query.toLowerCase()) || c.pinyin.toLowerCase().includes(query.toLowerCase())
  );
  if (localMatch.length > 0) {
    return res.json(localMatch.slice(0, 8));
  }
  try {
    const ai = getGeminiClient();
    const prompt = `Provide the details of city or tourist location matching query "${query}". Return a JSON list with up to 3 most relevant cities in the world. Use this schema:
    [{
      "id": "lowercase_string_id",
      "name": "Chinese Name (or English name if no Chinese name)",
      "nameEn": "English Name",
      "pinyin": "pinyin_no_spaces",
      "region": "Continent, e.g. \u4E9A\u6D32, \u6B27\u6D32, \u5317\u7F8E etc.",
      "regionEn": "English Continent Name, e.g. Asia, Europe, North America",
      "isInternational": true,
      "coordinates": [latitude_float, longitude_float]
    }]`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.STRING },
              name: { type: import_genai.Type.STRING },
              nameEn: { type: import_genai.Type.STRING },
              pinyin: { type: import_genai.Type.STRING },
              region: { type: import_genai.Type.STRING },
              regionEn: { type: import_genai.Type.STRING },
              isInternational: { type: import_genai.Type.BOOLEAN },
              coordinates: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.NUMBER }
              }
            },
            required: ["id", "name", "nameEn", "pinyin", "region", "regionEn", "isInternational", "coordinates"]
          }
        }
      }
    });
    const bodyText = response.text ? response.text.trim() : "[]";
    const parsed = JSON.parse(bodyText);
    res.json(parsed);
  } catch (err) {
    console.error("Gemini City Search Fallback failed:", err.message);
    res.json([]);
  }
});
app.post("/api/plan/generate", async (req, res) => {
  const { destinations, isAiEnhanced, lang, customLlm } = req.body;
  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return res.status(400).json({ error: "Missing destinations specification" });
  }
  if (!isAiEnhanced) {
    const plans = destinations.map((d) => {
      if (dynamicCustomCityPlans[d.cityId]) {
        const cachedPlan = dynamicCustomCityPlans[d.cityId];
        const result = JSON.parse(JSON.stringify(cachedPlan));
        result.daysCount = d.days;
        if (d.days <= cachedPlan.days.length) {
          result.days = result.days.slice(0, d.days);
        } else {
          while (result.days.length < d.days) {
            const nextDayNum = result.days.length + 1;
            const originalDayTemplate = cachedPlan.days[(nextDayNum - 1) % cachedPlan.days.length];
            const deepCopyDay = JSON.parse(JSON.stringify(originalDayTemplate));
            deepCopyDay.day = nextDayNum;
            deepCopyDay.pois.forEach((poi, idx) => {
              poi.id = `${d.cityId}-dynamic-p-d${nextDayNum}-${idx}`;
            });
            result.days.push(deepCopyDay);
          }
        }
        const ratio = d.days / cachedPlan.daysCount;
        result.localExpense = {
          tickets: Math.round(cachedPlan.localExpense.tickets * ratio),
          food: Math.round(cachedPlan.localExpense.food * ratio),
          hotel: Math.round(cachedPlan.localExpense.hotel * ratio),
          transit: Math.round(cachedPlan.localExpense.transit * ratio)
        };
        return result;
      }
      return generateLocalPlan(d.cityId, d.days);
    });
    return res.json({ plans });
  }
  try {
    const targetPrompt = `Generate a highly detailed travel itinerary/plan for the following multi-stop journey: ${JSON.stringify(destinations)}.
    Current language response style preference: ${lang === "en" ? "English priority" : "Chinese priority"}.
    Important: Output a JSON list where each object maps EXACTLY to this schema structure:
    [{
      "cityId": "string matching requested cityId, e.g. beijing",
      "cityName": "Chinese Name",
      "cityNameEn": "English Name",
      "daysCount": integer,
      "bestSeason": "Detailed season advice in Chinese",
      "bestSeasonEn": "Detailed season advice in English",
      "localExpense": {
        "tickets": estimated_cny_tickets_budget_sum,
        "food": estimated_cny_food_budget_sum,
        "hotel": estimated_cny_hotel_budget_sum,
        "transit": estimated_cny_local_transit_budget_sum
      },
      "veteranTips": ["Tip 1 in Chinese", "Tip 2 in Chinese"],
      "veteranTipsEn": ["Tip 1 in English", "Tip 2 in English"],
      "days": [{
        "day": integer_1_based,
        "pois": [{
          "id": "unique-poi-uuid-string",
          "name": "Attraction/Eatery Name in Chinese",
          "nameEn": "Name in English",
          "type": "Must be one of: 'attraction', 'food', 'hotel', 'transit'",
          "time": "HH:MM format",
          "duration": "Duration e.g. '3h' or '1.5h'",
          "cost": estimated_cost_cny,
          "bestTime": "Recommended hour block",
          "crowdTimes": "Peak crowded warning segment",
          "tip": "Short visitor insider tip in Chinese",
          "tipEn": "Short visitor insider tip in English",
          "coordinates": [latitude_float, longitude_float]
        }]
      }]
    }]`;
    let rawText = "";
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== "gemini";
    if (hasCustomLlm) {
      console.log(`Routing through Custom LLM Provider: ${customLlm.provider} (${customLlm.model})`);
      const effectiveApiKey = customLlm.apiKey || (customLlm.provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : "") || "";
      rawText = await callOpenAiCompatible(
        customLlm.baseUrl,
        effectiveApiKey,
        customLlm.model,
        targetPrompt,
        "You are an expert global travel router. You must output a valid JSON array strictly aligning with the instructions. Do not write any prelude or trailing conversational text. Wrap the response in raw JSON format.",
        true
      );
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: targetPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                cityId: { type: import_genai.Type.STRING },
                cityName: { type: import_genai.Type.STRING },
                cityNameEn: { type: import_genai.Type.STRING },
                daysCount: { type: import_genai.Type.INTEGER },
                bestSeason: { type: import_genai.Type.STRING },
                bestSeasonEn: { type: import_genai.Type.STRING },
                localExpense: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    tickets: { type: import_genai.Type.INTEGER },
                    food: { type: import_genai.Type.INTEGER },
                    hotel: { type: import_genai.Type.INTEGER },
                    transit: { type: import_genai.Type.INTEGER }
                  },
                  required: ["tickets", "food", "hotel", "transit"]
                },
                veteranTips: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                veteranTipsEn: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                days: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      day: { type: import_genai.Type.INTEGER },
                      pois: {
                        type: import_genai.Type.ARRAY,
                        items: {
                          type: import_genai.Type.OBJECT,
                          properties: {
                            id: { type: import_genai.Type.STRING },
                            name: { type: import_genai.Type.STRING },
                            nameEn: { type: import_genai.Type.STRING },
                            type: { type: import_genai.Type.STRING },
                            time: { type: import_genai.Type.STRING },
                            duration: { type: import_genai.Type.STRING },
                            cost: { type: import_genai.Type.INTEGER },
                            bestTime: { type: import_genai.Type.STRING },
                            crowdTimes: { type: import_genai.Type.STRING },
                            tip: { type: import_genai.Type.STRING },
                            tipEn: { type: import_genai.Type.STRING },
                            coordinates: {
                              type: import_genai.Type.ARRAY,
                              items: { type: import_genai.Type.NUMBER }
                            }
                          },
                          required: [
                            "id",
                            "name",
                            "nameEn",
                            "type",
                            "time",
                            "duration",
                            "cost",
                            "bestTime",
                            "crowdTimes",
                            "tip",
                            "tipEn",
                            "coordinates"
                          ]
                        }
                      }
                    },
                    required: ["day", "pois"]
                  }
                }
              },
              required: [
                "cityId",
                "cityName",
                "cityNameEn",
                "daysCount",
                "bestSeason",
                "bestSeasonEn",
                "localExpense",
                "veteranTips",
                "veteranTipsEn",
                "days"
              ]
            }
          }
        }
      });
      rawText = response.text || "[]";
    }
    const cleanedText = cleanJsonString(rawText);
    const parsedPlans = JSON.parse(cleanedText || "[]");
    parsedPlans.forEach((plan) => {
      plan.isAiEnhanced = true;
    });
    res.json({ plans: parsedPlans });
  } catch (err) {
    console.error("Plan generation failed! Falling back to client-safe templates. Error:", err.message);
    const plans = destinations.map((d) => generateLocalPlan(d.cityId, d.days));
    res.json({ plans, isFallback: true, fallbackReason: err.message });
  }
});
app.post("/api/plan/enhance-city", async (req, res) => {
  const { cityId, daysCount, cityName, lang, customLlm } = req.body;
  if (!cityId || !daysCount) {
    return res.status(400).json({ error: "Missing parameters for single city upgrade" });
  }
  try {
    const promptText = `Directly generate a single, highly detailed ${daysCount}-day itinerary for the city "${cityName || cityId}".
    Output a single JSON object (NOT in an array) mapping EXACTLY to this schema structure:
    {
      "cityId": "${cityId}",
      "cityName": "Chinese Name",
      "cityNameEn": "English Name",
      "daysCount": ${daysCount},
      "bestSeason": "Best months to view in Chinese",
      "bestSeasonEn": "Best months to view in English",
      "localExpense": {
        "tickets": ticket_cost_sum,
        "food": food_cost_sum,
        "hotel": lodging_cost_sum,
        "transit": subway_cab_cost_sum
      },
      "veteranTips": ["Insides in Chinese (at least 2)"],
      "veteranTipsEn": ["Insides in English (at least 2)"],
      "days": [{
        "day": 1_based_index,
        "pois": [{
          "id": "poi-uuid-string",
          "name": "Chinese Name",
          "nameEn": "English Name",
          "type": "attraction or food or hotel or transit",
          "time": "HH:MM",
          "duration": "Duration e.g. 3h",
          "cost": estimated_cost_cny_number,
          "bestTime": "Fine hour block",
          "crowdTimes": "Peak crowd warnings",
          "tip": "Insider secret and description",
          "tipEn": "Insider secret and description in English",
          "coordinates": [latitude, longitude]
        }]
      }]
    }`;
    let rawText = "";
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== "gemini";
    if (hasCustomLlm) {
      console.log(`Routing enhance-city through Custom LLM Provider: ${customLlm.provider} (${customLlm.model})`);
      rawText = await callOpenAiCompatible(
        customLlm.baseUrl,
        customLlm.apiKey,
        customLlm.model,
        promptText,
        "You are an expert global travel router. You must output a valid single JSON object strictly aligning with the instructions. Do not write any prelude or trailing conversational text. Wrap the response in raw JSON format.",
        true
      );
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              cityId: { type: import_genai.Type.STRING },
              cityName: { type: import_genai.Type.STRING },
              cityNameEn: { type: import_genai.Type.STRING },
              daysCount: { type: import_genai.Type.INTEGER },
              bestSeason: { type: import_genai.Type.STRING },
              bestSeasonEn: { type: import_genai.Type.STRING },
              localExpense: {
                type: import_genai.Type.OBJECT,
                properties: {
                  tickets: { type: import_genai.Type.INTEGER },
                  food: { type: import_genai.Type.INTEGER },
                  hotel: { type: import_genai.Type.INTEGER },
                  transit: { type: import_genai.Type.INTEGER }
                },
                required: ["tickets", "food", "hotel", "transit"]
              },
              veteranTips: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              veteranTipsEn: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              days: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    day: { type: import_genai.Type.INTEGER },
                    pois: {
                      type: import_genai.Type.ARRAY,
                      items: {
                        type: import_genai.Type.OBJECT,
                        properties: {
                          id: { type: import_genai.Type.STRING },
                          name: { type: import_genai.Type.STRING },
                          nameEn: { type: import_genai.Type.STRING },
                          type: { type: import_genai.Type.STRING },
                          time: { type: import_genai.Type.STRING },
                          duration: { type: import_genai.Type.STRING },
                          cost: { type: import_genai.Type.INTEGER },
                          bestTime: { type: import_genai.Type.STRING },
                          crowdTimes: { type: import_genai.Type.STRING },
                          tip: { type: import_genai.Type.STRING },
                          tipEn: { type: import_genai.Type.STRING },
                          coordinates: {
                            type: import_genai.Type.ARRAY,
                            items: { type: import_genai.Type.NUMBER }
                          }
                        },
                        required: [
                          "id",
                          "name",
                          "nameEn",
                          "type",
                          "time",
                          "duration",
                          "cost",
                          "bestTime",
                          "crowdTimes",
                          "tip",
                          "tipEn",
                          "coordinates"
                        ]
                      }
                    }
                  },
                  required: ["day", "pois"]
                }
              }
            },
            required: [
              "cityId",
              "cityName",
              "cityNameEn",
              "daysCount",
              "bestSeason",
              "bestSeasonEn",
              "localExpense",
              "veteranTips",
              "veteranTipsEn",
              "days"
            ]
          }
        }
      });
      rawText = response.text || "{}";
    }
    const cleanedText = cleanJsonString(rawText);
    const parsedPlan = JSON.parse(cleanedText || "{}");
    parsedPlan.isAiEnhanced = true;
    res.json(parsedPlan);
  } catch (err) {
    console.error("Enhance single city failed! Falling back to local template. Error:", err.message);
    const plan = generateLocalPlan(cityId, daysCount);
    res.json(plan);
  }
});
app.post("/api/poi/intel-realtime", async (req, res) => {
  const { poiName, poiType, lang, customLlm } = req.body;
  if (!poiName) {
    return res.status(400).json({ error: "Missing poiName parameter." });
  }
  const isZh = lang === "zh";
  const effectiveLang = lang || "zh";
  try {
    const promptText = `Generate real-time local intelligence analysis for the point of interest (POI): "${poiName}" (Type: "${poiType || "attraction"}").
Please return exactly one JSON object complying with this exact schema:
{
  "weather": {
    "temp": "Temp description e.g. '18\xB0C' or '24\xB0C'",
    "condition": "Weather icon and text in ${effectiveLang === "zh" ? "Chinese" : "English"} (e.g. '\u26C5 \u591A\u4E91\u8F6C\u6674' or '\u26C5 Partly Sunny')",
    "humidity": "Humidity e.g. '45%'",
    "uvIndex": "UV scale explanation e.g. '\u4E2D\u7B49 (3\u7EA7)' or 'Moderate (3)'",
    "wind": "Wind speed e.g. '\u4E1C\u5357\u98CE 2\u7EA7' or 'SE Wind 2'"
  },
  "traffic": {
    "status": "good" status or "slow" or "heavy",
    "badge": "Short badge text in ${effectiveLang === "zh" ? "Chinese" : "English"} (e.g. '\u{1F7E2} \u7545\u884C\u987A\u610F' or '\u{1F7E2} Traffic Smooth')",
    "badgeColor": "Recommended tailwind class string: use 'text-emerald-700 bg-emerald-50 border-emerald-250' for good, 'text-amber-700 bg-amber-50 border-amber-250' for slow, or 'text-rose-700 bg-rose-50 border-rose-250' for heavy",
    "speed": "Avg speed around POI e.g. '\u672C\u533A\u5747\u901F 42km/h' or 'Local Avg 42km/h'",
    "tip": "Short, helpful localized navigation or transit bypass tips in ${effectiveLang === "zh" ? "Chinese" : "English"} (e.g., 'Take line 2' or 'Parking is limited')"
  },
  "gourmet": "A stellar, delicious culinary recommendation near this POI in ${effectiveLang === "zh" ? "Chinese" : "English"} (1-2 sentences, include specific local specialties)",
  "strategy": "A clever sightseeing strategy, entrance tip, or queueing advice in ${effectiveLang === "zh" ? "Chinese" : "English"} tailored to this POI (1-2 sentences)"
}

Keep all texts concise, highly localized, authentic, and direct. Deliver purely the raw JSON.`;
    let rawText = "";
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== "gemini";
    if (hasCustomLlm) {
      rawText = await callOpenAiCompatible(
        customLlm.baseUrl,
        customLlm.apiKey,
        customLlm.model,
        promptText,
        "You are an expert local guide and real-time transit intelligence engine. You must output a valid single JSON object aligning with instructions. Raw JSON only.",
        true
      );
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              weather: {
                type: import_genai.Type.OBJECT,
                properties: {
                  temp: { type: import_genai.Type.STRING },
                  condition: { type: import_genai.Type.STRING },
                  humidity: { type: import_genai.Type.STRING },
                  uvIndex: { type: import_genai.Type.STRING },
                  wind: { type: import_genai.Type.STRING }
                },
                required: ["temp", "condition", "humidity", "uvIndex", "wind"]
              },
              traffic: {
                type: import_genai.Type.OBJECT,
                properties: {
                  status: { type: import_genai.Type.STRING },
                  badge: { type: import_genai.Type.STRING },
                  badgeColor: { type: import_genai.Type.STRING },
                  speed: { type: import_genai.Type.STRING },
                  tip: { type: import_genai.Type.STRING }
                },
                required: ["status", "badge", "badgeColor", "speed", "tip"]
              },
              gourmet: { type: import_genai.Type.STRING },
              strategy: { type: import_genai.Type.STRING }
            },
            required: ["weather", "traffic", "gourmet", "strategy"]
          }
        }
      });
      rawText = response.text || "{}";
    }
    const cleanedText = cleanJsonString(rawText);
    const parsedIntel = JSON.parse(cleanedText || "{}");
    res.json(parsedIntel);
  } catch (err) {
    console.error("Realtime POI Intel lookup failed, falling back to static package:", err.message);
    res.status(500).json({ error: err.message });
  }
});
var FORUM_FILE_PATH = "/tmp/trip_ai_forum_posts.json";
var INITIAL_FORUM_POSTS = [
  {
    id: "post-seed-kyoto",
    title: "\u4EAC\u90FD\u79CB\u65E5\u67AB\u53F6\u5B63\u5C0F\u4F17\u79C1\u85CF\u8DEF\u7EBF \u{1F341} \u6781\u7B80\u6CBB\u6108\u6162\u884C",
    description: "\u907F\u5F00\u4EBA\u6324\u4EBA\u7684\u6E05\u6C34\u5BFA\uFF0C\u5206\u4EAB\u4E00\u6761\u79C1\u85CF\u7684\u79CB\u65E5\u8D4F\u67AB\u6781\u7B80\u9759\u5FC3\u8DEF\u7EBF\u3002\u4ECE\u5357\u7985\u5BFA\u6B65\u884C\u81F3\u6CD5\u7136\u9662\uFF0C\u6CBF\u9014\u53EF\u4EE5\u611F\u53D7\u5730\u9053\u7684\u5B87\u6CBB\u62B9\u8336\uFF0C\u6700\u540E\u5728\u7409\u7483\u5149\u9662\u89C2\u8D4F\u7EA2\u53F6\u5012\u5F71\u3002\u672C\u65B9\u6848\u5305\u542B\u7279\u8272\u6C64\u8C46\u8150\u7F8E\u98DF\u63A8\u8350\u548C\u6E05\u6668\u4EBA\u5C11\u65F6\u7684\u62CD\u7167\u79D8\u7C4D\u3002",
    tags: ["\u8D4F\u67AB", "\u6162\u65C5\u884C", "\u7279\u8272\u7F8E\u98DF", "\u65E5\u672C"],
    author: "\u79CB\u539F\u5C0F\u5F84 \u{1F98A}",
    upvotes: 42,
    createdAt: new Date(Date.now() - 36e5 * 24 * 3).toISOString(),
    // 3 days ago
    comments: [
      { id: "c1", author: "\u65C5\u884C\u8005\u963F\u661F", text: "\u611F\u8C22\u697C\u4E3B\uFF01\u8FD9\u6761\u4EAC\u90FD\u8DEF\u7EBF\u592A\u68D2\u4E86\uFF0C\u5C24\u5176\u662F\u65E0\u4EBA\u7684\u7409\u7483\u5149\u9662\u62CD\u7167\u89D2\u5EA6\u3002\u5DF2\u6536\u85CF\uFF01", createdAt: new Date(Date.now() - 36e5 * 48).toISOString() },
      { id: "c2", author: "\u62B9\u8336\u63A7101", text: "\u6CBF\u9014\u90A3\u5BB6\u62B9\u8336\u5E97\u7684\u540D\u5B57\u662F\u4EC0\u4E48\u5440\uFF1F\u60F3\u8981\u53BB\u6253\u5361\uFF01", createdAt: new Date(Date.now() - 36e5 * 20).toISOString() }
    ],
    tripPlan: {
      id: "plan-seed-kyoto",
      title: "\u4EAC\u90FD\u79CB\u65E5\u8D4F\u67AB\u6CBB\u6108\u4E4B\u65C5",
      departureCity: "tokyo",
      selectedDestinations: [
        { cityId: "kyoto", days: 2 }
      ],
      totalBudget: 450,
      totalDays: 2,
      cityPlans: [
        {
          cityId: "kyoto",
          cityName: "\u4EAC\u90FD",
          cityNameEn: "Kyoto",
          daysCount: 2,
          bestSeason: "11\u6708-12\u6708 (\u7EA2\u53F6\u5B63)",
          bestSeasonEn: "Nov-Dec (Autumn foliage)",
          localExpense: { tickets: 50, food: 150, hotel: 200, transit: 50 },
          veteranTips: ["\u6E05\u66687:30\u524D\u5230\u8FBE\u5357\u7985\u5BFA\u53EF\u907F\u5F00\u5927\u6279\u65C5\u884C\u56E2", "\u7409\u7483\u5149\u9662\u9700\u8981\u63D0\u524D\u9884\u7EA6"],
          veteranTipsEn: ["Reach Nanzenji before 7:30 AM to avoid crowds", "Ruriko-in requires prior booking"],
          isAiEnhanced: true,
          days: [
            {
              day: 1,
              pois: [
                {
                  id: "poi-k1",
                  name: "\u5357\u7985\u5BFA",
                  nameEn: "Nanzenji Temple",
                  type: "attraction",
                  time: "08:00",
                  duration: "2h",
                  cost: 10,
                  bestTime: "08:00-10:00",
                  crowdTimes: "11:00-15:00",
                  tip: "\u987A\u7740\u7EA2\u7816\u7684\u6C34\u6E20(\u6C34\u8DEF\u9601)\u62CD\u7167\u6781\u5177\u660E\u6CBB\u7EF4\u65B0\u65F6\u671F\u7684\u53E4\u5178\u7F8E\u611F\u3002",
                  tipEn: "The brick aqueduct (Suirokaku) creates a beautiful historical backdrop.",
                  coordinates: [35.0112, 135.7938]
                },
                {
                  id: "poi-k2",
                  name: "\u5965\u4E39\u6C64\u8C46\u8150 (\u5357\u7985\u5BFA\u5E97)",
                  nameEn: "Okudan Yudofu",
                  type: "food",
                  time: "11:30",
                  duration: "1.5h",
                  cost: 35,
                  bestTime: "11:30",
                  crowdTimes: "12:00-13:30",
                  tip: "\u62E5\u6709\u51E0\u767E\u5E74\u5386\u53F2\u7684\u53E4\u8001\u5EAD\u9662\uFF0C\u4E13\u6CE8\u4E8E\u4F20\u7EDF\u7684\u6E29\u6DA6\u70ED\u8C46\u8150\u591A\u9053\u5F0F\u81B3\u98DF\u3002",
                  tipEn: "Centuries old garden serving exquisite yudofu (tofu hotpot) course meals.",
                  coordinates: [35.0102, 135.7925]
                }
              ]
            }
          ]
        }
      ],
      transits: {}
    }
  },
  {
    id: "post-seed-iceland",
    title: "\u51B0\u5C9B\u51AC\u5B63\u6781\u81F4\u8FFD\u5149\u4E0E\u9ED1\u6C99\u6EE9\u63A2\u9669 \u{1F30C} (\u9644\u81EA\u9A7E\u6307\u5357)",
    description: "\u51B0\u5C9B\u662F\u4E00\u751F\u4E00\u5B9A\u8981\u53BB\u4E00\u6B21\u7684\u795E\u79D8\u56FD\u5EA6\u3002\u672C\u65B9\u6848\u4E13\u6CE8\u4E8E\u51AC\u5B63\u6781\u5149\u8FFD\u9010\uFF0C\u5305\u542B\u7EF4\u514B\u9547\u9ED1\u6C99\u6EE9\u3001\u585E\u91CC\u96C5\u5170\u7011\u5E03\uFF0C\u4EE5\u53CA\u672C\u5730\u975E\u5E38\u5C0F\u4F17\u4E14\u65E0\u9700\u6392\u961F\u7684\u51B0\u6D1E\u63A2\u9669\u3002\u603B\u7ED3\u4E86\u98CE\u66B4\u5929\u6C14\u4E0B\u7684\u81EA\u9A7E\u907F\u9669\u6280\u5DE7\uFF01",
    tags: ["\u6781\u5149", "\u6DF1\u5EA6\u81EA\u9A7E", "\u5C0F\u4F17\u63A2\u9669", "\u81EA\u7136\u98CE\u5149"],
    author: "\u6781\u5730\u5411\u5BFC Thor \u2744\uFE0F",
    upvotes: 68,
    createdAt: new Date(Date.now() - 36e5 * 24 * 5).toISOString(),
    // 5 days ago
    comments: [
      { id: "c3", author: "\u7B49\u4E00\u4E2A\u6781\u5149", text: "\u51AC\u5B63\u81EA\u9A7E\u771F\u7684\u9700\u8981\u597D\u6280\u672F\uFF01\u697C\u4E3B\u7684\u907F\u9669\u6280\u5DE7\u592A\u5B9E\u7528\u4E86\uFF01", createdAt: new Date(Date.now() - 36e5 * 72).toISOString() },
      { id: "c4", author: "AeroTrip", text: "\u6536\u85CF\u4E86\uFF0C\u660E\u5E741\u6708\u4EFD\u6309\u7167\u8FD9\u4E2A\u8DEF\u7EBF\u51FA\u53D1\uFF01", createdAt: new Date(Date.now() - 36e5 * 12).toISOString() }
    ],
    tripPlan: {
      id: "plan-seed-iceland",
      title: "\u51B0\u5C9B\u6781\u5149\u4E0E\u51B0\u6C99\u6EE9\u6DF1\u5EA6\u63A2\u79D8",
      departureCity: "reykjavik",
      selectedDestinations: [
        { cityId: "vik", days: 2 }
      ],
      totalBudget: 1200,
      totalDays: 2,
      cityPlans: [
        {
          cityId: "vik",
          cityName: "\u7EF4\u514B",
          cityNameEn: "Vik",
          daysCount: 2,
          bestSeason: "10\u6708-\u6B21\u5E743\u6708 (\u6781\u5149\u671F)",
          bestSeasonEn: "Oct-Mar (Aurora Season)",
          localExpense: { tickets: 100, food: 300, hotel: 600, transit: 200 },
          veteranTips: ["\u51AC\u5B63\u9ED1\u6C99\u6EE9\u98CE\u6D6A\u6781\u5176\u5371\u9669\uFF0C\u5207\u52FF\u9760\u8FD1\u6C34\u7EBF\uFF01", "\u6BCF\u5929\u4E0B\u53485\u70B9\u5728Vedur\u7F51\u67E5\u770B\u6781\u5149\u6307\u6570"],
          veteranTipsEn: ["Keep safe distance from water line at Black Sand Beach", "Check Vedur website daily for aurora reports"],
          isAiEnhanced: true,
          days: [
            {
              day: 1,
              pois: [
                {
                  id: "poi-i1",
                  name: "\u96F7\u5C3C\u65AF\u6CD5\u5C14\u9ED1\u6C99\u6EE9",
                  nameEn: "Reynisfjara Black Sand Beach",
                  type: "attraction",
                  time: "10:00",
                  duration: "2.5h",
                  cost: 0,
                  bestTime: "10:30-13:00",
                  crowdTimes: "13:30-15:00",
                  tip: "\u58EE\u4E3D\u7684\u7384\u6B66\u5CA9\u77F3\u67F1\u4E0E\u6F06\u9ED1\u7684\u6D77\u5CB8\u7EBF\u76F8\u5F97\u76CA\u5F70\uFF0C\u72B9\u5982\u5916\u661F\u4E16\u754C\u3002\u6CE8\u610F\u6D77\u6D6A\u8BE1\u79D8\uFF01",
                  tipEn: "Stunning basalt columns and jet-black shores. Exercise extreme caution near the sea.",
                  coordinates: [63.4025, -19.0188]
                },
                {
                  id: "poi-i2",
                  name: "Sudur Vik \u666F\u89C2\u9910\u5385",
                  nameEn: "Sudur Vik Restaurant",
                  type: "food",
                  time: "18:00",
                  duration: "1.5h",
                  cost: 45,
                  bestTime: "18:00",
                  crowdTimes: "19:00-20:30",
                  tip: "\u5750\u843D\u4E8E\u7EF4\u514B\u9547\u5C0F\u5C71\u4E18\u9876\uFF0C\u7F8A\u6392\u548C\u62AB\u8428\u6781\u5176\u7F8E\u5473\uFF0C\u80FD\u591F\u9E1F\u77B0\u8FDC\u5904\u6D77\u6D0B\u3002",
                  tipEn: "Cozy venue on the hill top. Outstanding roasted lamb chops and premium stone-baked pizzas.",
                  coordinates: [63.4201, -19.009]
                }
              ]
            }
          ]
        }
      ],
      transits: {}
    }
  }
];
function loadForumPosts() {
  try {
    if (import_fs.default.existsSync(FORUM_FILE_PATH)) {
      const content = import_fs.default.readFileSync(FORUM_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to load forum posts:", err);
  }
  saveForumPosts(INITIAL_FORUM_POSTS);
  return INITIAL_FORUM_POSTS;
}
function saveForumPosts(posts) {
  try {
    import_fs.default.writeFileSync(FORUM_FILE_PATH, JSON.stringify(posts, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save forum posts:", err);
  }
}
app.get("/api/forum/posts", (req, res) => {
  const posts = loadForumPosts();
  res.json({ success: true, posts });
});
app.post("/api/forum/posts", async (req, res) => {
  const { title, description, tags, author, tripPlan } = req.body;
  if (!tripPlan) {
    return res.status(400).json({ success: false, error: "Missing trip plan." });
  }
  const posts = loadForumPosts();
  let finalTitle = (title || "").trim();
  let finalDesc = (description || "").trim();
  if (!finalDesc || finalDesc.length < 10) {
    try {
      const cities = tripPlan.cityPlans ? tripPlan.cityPlans.map((c) => c.cityName).join(" and ") : "marvelous sights";
      const spots = tripPlan.cityPlans && tripPlan.cityPlans[0] && tripPlan.cityPlans[0].days ? tripPlan.cityPlans[0].days[0].pois.map((p) => p.name).slice(0, 3).join(", ") : "";
      const promptText = `A user is sharing their travel plan called "${tripPlan.title || "My itinerary"}" traveling through ${cities}. 
The plan includes top spots like: ${spots}.
Write a captivating, warm, and highly inspirational travel community platform caption (2-3 sentences max) recommending this trip. Keep the tone friendly, adventurous, and authentic. Write it in Chinese.`;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText
      });
      if (response && response.text) {
        finalDesc = response.text.trim();
      }
    } catch (e) {
      console.warn("AI caption enhancement failed, using standard fallback", e.message);
      finalDesc = finalDesc || `\u5206\u4EAB\u6211\u521A\u521A\u89C4\u5212\u7684\u4F18\u8D28\u884C\u7A0B\uFF1A\u300C${tripPlan.title || "\u5B8C\u7F8E\u65C5\u884C"}\u300D\uFF01\u6CBF\u9014\u98CE\u5149\u65E0\u9650\uFF0C\u5FEB\u6765\u514B\u9686\u4F53\u9A8C\u3002`;
    }
  }
  if (!finalTitle) {
    finalTitle = `\u63A2\u7D22${tripPlan.cityPlans?.[0]?.cityName || "\u4E16\u754C"}\u7684\u5947\u5999\u4E16\u754C \u2728 ${tripPlan.title || ""}`;
  }
  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: finalTitle,
    description: finalDesc,
    tags: tags && tags.length ? tags : ["\u65C5\u884C\u8DEF\u7EBF", "\u5206\u4EAB\u793E\u533A", "\u5B9A\u5236\u65B9\u6848"],
    author: author || "\u795E\u79D8\u65C5\u884C\u5BB6 \u{1F5FA}\uFE0F",
    upvotes: 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    comments: [],
    tripPlan
  };
  posts.unshift(newPost);
  saveForumPosts(posts);
  res.json({ success: true, post: newPost });
});
app.post("/api/forum/posts/:id/upvote", (req, res) => {
  const { id } = req.params;
  const posts = loadForumPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts[index].upvotes = (posts[index].upvotes || 0) + 1;
    saveForumPosts(posts);
    return res.json({ success: true, upvotes: posts[index].upvotes });
  }
  res.status(404).json({ success: false, error: "Post not found." });
});
app.post("/api/forum/posts/:id/comment", (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: "Comment text cannot be empty." });
  }
  const posts = loadForumPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
      author: (author || "").trim() || "\u70ED\u5FC3\u65C5\u4F34 \u{1F392}",
      text: text.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    posts[index].comments = posts[index].comments || [];
    posts[index].comments.push(newComment);
    saveForumPosts(posts);
    return res.json({ success: true, comments: posts[index].comments });
  }
  res.status(404).json({ success: false, error: "Post not found." });
});
var firestoreDb = null;
try {
  firestoreDb = new import_firestore.Firestore({
    // Standard Application Default Credentials handles authentication automatically
    // on GCP Cloud Run. But we can explicitly provide projectId to prevent lookup delays.
    projectId: "ais-asia-southeast1-43b85cf3a8"
  });
  console.log("Firebase Firestore initialized successfully server-side.");
} catch (e) {
  console.error("Failed to initialize server-side Firestore:", e.message);
}
var FALLBACK_FILE_PATH = "/tmp/trip_ai_sync_fallback.json";
function saveToFallbackFile(code, record) {
  try {
    let data = {};
    if (import_fs.default.existsSync(FALLBACK_FILE_PATH)) {
      const fileContent = import_fs.default.readFileSync(FALLBACK_FILE_PATH, "utf-8");
      data = JSON.parse(fileContent);
    }
    data[code.toUpperCase()] = record;
    import_fs.default.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local JSON fallback write failed:", err.message);
  }
}
function loadFromFallbackFile(code) {
  try {
    if (import_fs.default.existsSync(FALLBACK_FILE_PATH)) {
      const fileContent = import_fs.default.readFileSync(FALLBACK_FILE_PATH, "utf-8");
      const data = JSON.parse(fileContent);
      return data[code.toUpperCase()] || null;
    }
  } catch (err) {
    console.error("Local JSON fallback read failed:", err.message);
  }
  return null;
}
function generateSyncCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
app.post("/api/sync/save", async (req, res) => {
  const { tripPlan, device } = req.body;
  if (!tripPlan) {
    return res.status(400).json({ success: false, error: "Missing trip plan payload." });
  }
  const code = generateSyncCode();
  const nowStr = (/* @__PURE__ */ new Date()).toISOString();
  const initialPeers = {};
  if (device && device.id) {
    initialPeers[device.id] = {
      name: device.name || "Unknown Device",
      lastSeen: nowStr
    };
  }
  const record = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code,
    tripPlan,
    notes: [],
    // Collaborative notes list
    peers: initialPeers,
    // Connected active sessions tracker
    history: [],
    // Historical snapshot versions
    createdAt: nowStr,
    updatedAt: nowStr
  };
  let firestoreSuccess = false;
  let firestoreErrorDetails = "";
  if (firestoreDb) {
    try {
      await firestoreDb.collection("sync_plans").doc(code).set(record);
      firestoreSuccess = true;
      console.log(`Saved plan to Firestore successfully with code: ${code}`);
    } catch (e) {
      firestoreErrorDetails = e.message;
      console.error(`Firestore save failed for code ${code}:`, e.message);
    }
  }
  saveToFallbackFile(code, record);
  res.json({
    success: true,
    code,
    tripPlan,
    notes: record.notes,
    peers: record.peers,
    history: record.history,
    firestoreSynced: firestoreSuccess,
    firestoreError: firestoreErrorDetails || null,
    updatedAt: nowStr
  });
});
app.get("/api/sync/load/:code", async (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  const deviceId = (req.query.deviceId || "").trim();
  const deviceName = (req.query.deviceName || "").trim();
  if (code.length !== 6) {
    return res.status(400).json({ success: false, error: "\u8BF7\u8F93\u5165\u6709\u6548\u76846\u4F4D\u8054\u673A\u540C\u6B65\u7801 / Invalid 6-character code." });
  }
  let dbRecord = null;
  let loadedFromFirestore = false;
  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection("sync_plans").doc(code).get();
      if (doc.exists) {
        dbRecord = doc.data();
        loadedFromFirestore = true;
      }
    } catch (e) {
      console.error(`Firestore load failed for code ${code}:`, e.message);
    }
  }
  if (!dbRecord) {
    dbRecord = loadFromFallbackFile(code);
    if (dbRecord) {
      console.log(`Plan loaded from local JSON fallback store for code: ${code}`);
    }
  }
  if (!dbRecord) {
    return res.status(404).json({
      success: false,
      error: "\u672A\u627E\u5230\u5339\u914D\u6B64\u540C\u6B65\u7801\u7684\u65B9\u6848\uFF0C\u8BF7\u786E\u8BA4\u8F93\u5165\u662F\u5426\u6B63\u786E / Travel plan not found matching this sync code."
    });
  }
  const now = /* @__PURE__ */ new Date();
  const nowStr = now.toISOString();
  let updatedPeers = { ...dbRecord.peers || {} };
  if (deviceId) {
    updatedPeers[deviceId] = {
      name: deviceName || "Explorer Device",
      lastSeen: nowStr
    };
  }
  Object.keys(updatedPeers).forEach((id) => {
    const peer = updatedPeers[id];
    if (peer && peer.lastSeen) {
      const timeDiffMs = now.getTime() - new Date(peer.lastSeen).getTime();
      if (timeDiffMs > 35e3) {
        delete updatedPeers[id];
      }
    }
  });
  dbRecord.peers = updatedPeers;
  dbRecord.notes = dbRecord.notes || [];
  dbRecord.history = dbRecord.history || [];
  if (loadedFromFirestore && firestoreDb) {
    firestoreDb.collection("sync_plans").doc(code).update({ peers: updatedPeers }).catch((err) => {
      console.error("Failed to update peers list in Firestore:", err.message);
    });
  }
  saveToFallbackFile(code, dbRecord);
  res.json({
    success: true,
    tripPlan: dbRecord.tripPlan,
    notes: dbRecord.notes,
    peers: dbRecord.peers,
    history: dbRecord.history,
    updatedAt: dbRecord.updatedAt,
    loadedFromFirestore
  });
});
app.post("/api/sync/update/:code", async (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  const { tripPlan, notes, device } = req.body;
  if (code.length !== 6) {
    return res.status(400).json({ success: false, error: "Parameters invalid." });
  }
  let existingRecord = null;
  let loadedFromFirestore = false;
  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection("sync_plans").doc(code).get();
      if (doc.exists) {
        existingRecord = doc.data();
        loadedFromFirestore = true;
      }
    } catch (e) {
      console.error(`Firestore fetch on update failed for code ${code}:`, e.message);
    }
  }
  if (!existingRecord) {
    existingRecord = loadFromFallbackFile(code) || {};
  }
  const nowStr = (/* @__PURE__ */ new Date()).toISOString();
  let updatedHistory = [...existingRecord.history || []];
  if (tripPlan && existingRecord.tripPlan) {
    const tripChanged = JSON.stringify(tripPlan) !== JSON.stringify(existingRecord.tripPlan);
    if (tripChanged) {
      const deviceLabel = device ? device.name || "Co-Explorer" : "Cloud device";
      const changeSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: nowStr,
        author: deviceLabel,
        totalDays: existingRecord.tripPlan.totalDays || 0,
        totalBudget: existingRecord.tripPlan.totalBudget || 0,
        tripPlan: existingRecord.tripPlan
      };
      updatedHistory.unshift(changeSnapshot);
      if (updatedHistory.length > 5) {
        updatedHistory = updatedHistory.slice(0, 5);
      }
    }
  }
  const finalTripPlan = tripPlan || existingRecord.tripPlan;
  const finalNotes = notes !== void 0 ? notes : existingRecord.notes || [];
  const updatedPeers = { ...existingRecord.peers || {} };
  if (device && device.id) {
    updatedPeers[device.id] = {
      name: device.name || "Explorer Device",
      lastSeen: nowStr
    };
  }
  const record = {
    id: existingRecord.id || `sync-update-${Date.now()}`,
    code,
    tripPlan: finalTripPlan,
    notes: finalNotes,
    peers: updatedPeers,
    history: updatedHistory,
    createdAt: existingRecord.createdAt || nowStr,
    updatedAt: nowStr
  };
  let firestoreSuccess = false;
  let firestoreErrorDetails = "";
  if (firestoreDb) {
    try {
      await firestoreDb.collection("sync_plans").doc(code).set(record);
      firestoreSuccess = true;
      console.log(`Updated plan in Firestore successfully with code: ${code}`);
    } catch (e) {
      firestoreErrorDetails = e.message;
      console.error(`Firestore update failed for code ${code}:`, e.message);
    }
  }
  saveToFallbackFile(code, record);
  res.json({
    success: true,
    notes: record.notes,
    peers: record.peers,
    history: record.history,
    firestoreSynced: firestoreSuccess,
    firestoreError: firestoreErrorDetails || null,
    updatedAt: nowStr
  });
});
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully at http://localhost:${PORT}`);
  });
}
setupFrontend();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
