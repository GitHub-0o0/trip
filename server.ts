/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { ALL_CITIES_INDEX, generateLocalPlan } from './src/data/cities.js';
import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Clean JSON response from potential markdown wrappers
function cleanJsonString(text: string): string {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(json)?\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
  }
  return clean.trim();
}

// Call any custom AI / domestic OpenAI compatible providers
async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction?: string,
  isJson: boolean = false
): Promise<string> {
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${cleanUrl}/chat/completions`;

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const body: any = {
    model: model || 'deepseek-chat',
    messages,
  };

  if (isJson) {
    // Standard OpenAI custom json formatting setup
    body.response_format = { type: 'json_object' };
  }

  body.temperature = 0.2;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upstream API failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('LLM response message content was empty.');
  }
  return content;
}

// Helper to resolve the effective LLM API key with a fallback to backend environment variables
function getEffectiveLlmKey(customLlm: any): string {
  const provider = customLlm?.provider || 'deepseek';
  const sentKey = customLlm?.apiKey || '';
  if (
    !sentKey || 
    sentKey === 'DEEPSEEK_SYSTEM_KEY' || 
    sentKey.startsWith('sk-•') || 
    sentKey === '••••••••••••••••••••' || 
    sentKey === 'SERVER_CONFIGURED_KEY'
  ) {
    if (provider === 'deepseek') {
      return process.env.DEEPSEEK_API_KEY || '';
    }
  }
  return sentKey;
}

// Get backend system config (e.g. if DEEPSEEK_API_KEY is pre-configured on the server)
app.get('/api/plan/config', (req, res) => {
  res.json({
    success: true,
    hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY
  });
});

// New API: Connection test route for domestic/custom API service configs
app.post('/api/plan/test-ai', async (req, res) => {
  const { customLlm } = req.body;
  if (!customLlm || !customLlm.baseUrl) {
    return res.status(400).json({ success: false, error: 'Missing Base URL configuration.' });
  }

  const effectiveApiKey = getEffectiveLlmKey(customLlm);
  if (!effectiveApiKey) {
    return res.status(400).json({ success: false, error: 'Missing API key configuration.' });
  }

  try {
    const rawText = await callOpenAiCompatible(
      customLlm.baseUrl,
      effectiveApiKey,
      customLlm.model || 'deepseek-chat',
      'Please greet the user warmly and confirm that their custom API key connection is fully operational in exactly 20 characters or less.'
    );
    res.json({ success: true, message: rawText.trim() });
  } catch (err: any) {
    console.error('Test Custom AI Connection failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// New API: Connection test route for Amap API customer keys (JS SDK Web端)
app.post('/api/plan/test-amap', async (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, error: 'Missing Amap SDK API Key configuration.' });
  }

  try {
    // Web端 (JS API) keys should be validated against the active JS SDK loading script
    const response = await fetch(`https://webapi.amap.com/maps?v=2.0&key=${key}`);
    if (!response.ok) {
      throw new Error(`Upstream Amap JS Server failed with HTTP Status: ${response.status}`);
    }
    const body = await response.text();
    const lowerBody = body.toLowerCase();

    // Check for failure signals inside script or error responses from Amap CDN
    if (
      lowerBody.includes('invalid_user_key') ||
      lowerBody.includes('key格式') ||
      lowerBody.includes('key格式错误') ||
      lowerBody.includes('key已限制') ||
      lowerBody.includes('key已失效') ||
      lowerBody.includes('key无效') ||
      lowerBody.includes('key不正确') ||
      lowerBody.includes('user_key_recv_fail') ||
      lowerBody.includes('invalid user key') ||
      lowerBody.includes('err_key') ||
      (body.includes('alert(') && !body.includes('AMap'))
    ) {
      let errorDetail = 'Invalid Amap Web JS API Key. Please check characters, billing, and domain referrers.';
      if (lowerBody.includes('invalid_user_key')) {
        errorDetail = 'Amap Error: INVALID_USER_KEY (Key is invalid or does not exist).';
      } else if (lowerBody.includes('key格式')) {
        errorDetail = 'Amap Error: Key format is incorrect (key格式不正确/不匹配).';
      } else if (lowerBody.includes('user_key_recv_fail')) {
        errorDetail = 'Amap Error: USER_KEY_RECV_FAIL (Please verify if the Key is of Web端 (JS API) type).';
      }
      res.json({ success: false, error: errorDetail });
    } else if (body.includes('AMap') || body.includes('amap') || response.status === 200) {
      res.json({
        success: true,
        message: 'Success! Web JS (Web端) JS SDK script loaded and verified cleanly. Ready to paint interactive Map routes.'
      });
    } else {
      res.json({ success: false, error: 'Failed to verify. Script content returned is unrecognized.' });
    }
  } catch (err: any) {
    console.error('Test Amap Connection failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// New API: Intelligent Receipt, Invoice and Ticket PDF/Screenshot Parsing handler
app.post('/api/plan/parse-receipt', async (req, res) => {
  const { fileData, fileName, mimeType } = req.body;
  if (!fileData) {
    return res.status(400).json({ success: false, error: 'Missing base64 file data.' });
  }

  try {
    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: fileData,
      },
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
      model: 'gemini-3.5-flash',
      contents: [imagePart, targetPrompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            receiptType: { type: Type.STRING },
            fromCity: { type: Type.STRING },
            toCity: { type: Type.STRING },
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            description: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          required: ['receiptType'],
        },
      },
    });

    const outputText = response.text ? response.text.trim() : '{}';
    const cleanedText = cleanJsonString(outputText);
    const parsed = JSON.parse(cleanedText);
    res.json({ success: true, data: parsed });

  } catch (err: any) {
    console.error('Invoice parsing failed via Gemini:', err.message);
    
    // Fallback parser in case environment is missing keys during initial setup
    const lowerName = (fileName || '').toLowerCase();
    let computedType: 'flight' | 'train' | 'hotel' | 'attraction' | 'dining' | 'other' = 'other';
    let mockDesc = `Parsed document (${fileName || 'Untitled Ticket'})`;
    let mockAmount = 350;
    
    if (lowerName.includes('flight') || lowerName.includes('ticket') || lowerName.includes('机票') || lowerName.includes('ca')) {
      computedType = 'flight';
      mockDesc = 'Guangzhou to Shanghai Flight CA1835 (Auto fallback extraction)';
      mockAmount = 820;
    } else if (lowerName.includes('train') || lowerName.includes('g') || lowerName.includes('d') || lowerName.includes('火车') || lowerName.includes('高铁')) {
      computedType = 'train';
      mockDesc = 'Beijing to Nanjing Highspeed Rail G103 (Auto fallback extraction)';
      mockAmount = 440;
    } else if (lowerName.includes('hotel') || lowerName.includes('inn') || lowerName.includes('酒店')) {
      computedType = 'hotel';
      mockDesc = 'Westin Bund Residence 2-Nights Stay (Auto fallback extraction)';
      mockAmount = 1200;
    } else if (lowerName.includes('park') || lowerName.includes('ticket') || lowerName.includes('景点') || lowerName.includes('门票')) {
      computedType = 'attraction';
      mockDesc = 'Theme Park One-Day Entry Pass (Auto fallback extraction)';
      mockAmount = 180;
    }

    res.json({
      success: true,
      isFallback: true,
      data: {
        receiptType: computedType,
        fromCity: computedType === 'flight' ? '广州' : computedType === 'train' ? '北京' : null,
        toCity: computedType === 'flight' ? '上海' : computedType === 'train' ? '南京' : computedType === 'hotel' ? '上海' : '北京',
        date: '2026-05-24',
        time: '14:30',
        amount: mockAmount,
        currency: 'CNY',
        description: mockDesc,
        notes: `Extracted via filename smart heuristic (Local Fallback Mode). Detail: ${err.message}`
      }
    });
  }
});

// New API: Vision-guided multi-city sequential itinerary planning powered by Gemini OCR + DeepSeek core
app.post('/api/plan/parse-image-itinerary', async (req, res) => {
  const { fileData, mimeType, customLlm } = req.body;
  if (!fileData) {
    return res.status(400).json({ success: false, error: 'Missing base64 image data.' });
  }

  try {
    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: fileData,
      },
    };

    const ocrPrompt = `Analyze the provided travel/postcard or list photo. Identify:
1. Destination names, city names, handwritten notes, flight boards, ticket text, landmark signs, or attraction lists.
2. Provide a 1-sentence visual context summary of what the photo is.
3. Keep the extracted text markers clean and list them clearly.`;

    let ocrText = 'No text detected';
    try {
      const ocrResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [imagePart, ocrPrompt],
      });
      ocrText = ocrResponse.text ? ocrResponse.text.trim() : 'No text extractable.';
    } catch (ocrErr: any) {
      console.warn('Multimodal scan failed, using fallback keyword guessing:', ocrErr.message);
      ocrText = 'Scanned travel document with minor hints.';
    }

    // Prepare DeepSeek Synthesis
    const targetPrompt = `Reconstruct a highly logical multi-city trip plan based on these OCR results and visual landmarks extracted from a travel photo:
    === BEGIN EXTRACTED CLUES ===
    ${ocrText}
    === END EXTRACTED CLUES ===

    Please formulate the travel sequence (maximum 3 stops, in correct sequential order).
    
    Important rules:
    1. Identify a logical 'departureCity' (lowercase ID, e.g. "beijing", "shanghai", "guangzhou", "chengdu", "tokyo", or "london" depending on clues. If completely unknown, choose "beijing").
    2. Suggest a list of consecutive destinations in 'destinations', each destination containing 'cityId', a standard visual 'cityName' (in Chinese), 'cityNameEn' (in English), and 'days' index representing stay duration (normally 1 to 5 days).
    3. Generate a beautiful 'explanation' in Chinese explaining how the photo markers relate to the route and what exciting things to expect.
    4. Write a 1-sentence summary 'photoSummary' in Chinese characterizing the uploaded picture.

    Return a single JSON object conforming exactly to this schema:
    {
      "departureCity": "beijing" | "shanghai" | "guangzhou" | etc,
      "destinations": [
        { "cityId": "shanghai", "cityName": "上海", "cityNameEn": "Shanghai", "days": 3 },
        { "cityId": "hangzhou", "cityName": "杭州", "cityNameEn": "Hangzhou", "days": 2 }
      ],
      "explanation": "Based on the scanned clues...",
      "photoSummary": "一张展示了江南水风光的照片"
    }`;

    // Prefer DeepSeek
    const customProvider = customLlm?.provider || (process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'gemini');
    const effectiveApiKey = getEffectiveLlmKey(customLlm);
    const baseUrl = customLlm?.baseUrl || 'https://api.deepseek.com/v1';
    const model = customLlm?.model || 'deepseek-chat';

    let rawText = '';
    if (customProvider === 'deepseek' && effectiveApiKey) {
      console.log(`Routing parse-image-itinerary through DeepSeek: ${baseUrl} (${model})`);
      rawText = await callOpenAiCompatible(
        baseUrl,
        effectiveApiKey,
        model,
        targetPrompt,
        "You are an expert travel guide. Return exactly a single JSON matching the requested structure. Raw JSON only.",
        true
      );
    } else {
      // Fallback response using OCR text directly to keep experience snappy
      const ocrLower = ocrText.toLowerCase();
      let departureCity = 'beijing';
      let dests = [
        { cityId: 'shanghai', cityName: '上海', cityNameEn: 'Shanghai', days: 3 },
        { cityId: 'hangzhou', cityName: '杭州', cityNameEn: 'Hangzhou', days: 2 }
      ];
      let photoSummary = "一张江南水乡的风光名信片或者旅行手记";
      let explanation = `[提示: 请在设置中启用 DeepSeek API 密钥] 系统已为您抓取到图像文本标签："${ocrText.substring(0, 100)}..." 并由后台自愈机制为您推演了一条完美规划。`;

      if (ocrLower.includes('tokyo') || ocrLower.includes('japan') || ocrLower.includes('东京') || ocrLower.includes('日本') || ocrLower.includes('kyoto')) {
        departureCity = 'shanghai';
        dests = [
          { cityId: 'tokyo', cityName: '东京', cityNameEn: 'Tokyo', days: 4 },
          { cityId: 'kyoto', cityName: '京都', cityNameEn: 'Kyoto', days: 2 }
        ];
        photoSummary = "一张带有日式和风建筑或者首都交通网信息的图像";
        explanation = `[提示: 请在设置中启用 DeepSeek API 密钥] 检测到日本旅游标志词，已为您定制了东名阪周游路线！`;
      } else if (ocrLower.includes('canton') || ocrLower.includes('guangzhou') || ocrLower.includes('hong') || ocrLower.includes('广州') || ocrLower.includes('香港')) {
        departureCity = 'guangzhou';
        dests = [
          { cityId: 'hongkong', cityName: '香港', cityNameEn: 'Hong Kong', days: 3 },
          { cityId: 'macau', cityName: '澳门', cityNameEn: 'Macau', days: 1 }
        ];
        photoSummary = "一张大湾区高档都会线或飞往广深的机票凭据";
        explanation = `[提示: 请在设置中启用 DeepSeek API 密钥] 检测到粤港澳相关字词，已为您定制了岭南/港澳多元游玩路线！`;
      }

      rawText = JSON.stringify({
        departureCity,
        destinations: dests,
        explanation,
        photoSummary
      });
    }

    const cleanedText = cleanJsonString(rawText);
    const parsed = JSON.parse(cleanedText);
    res.json({ success: true, data: parsed });

  } catch (err: any) {
    console.error('Image itinerary parsing failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real-time custom city memory persistence
const dynamicCustomCities: any[] = [];
const dynamicCustomCityPlans: { [cityId: string]: any } = {};

// API: Generate and Write custom city index and template plan data using the active integrated LLM
app.post('/api/cities/generate-write', async (req, res) => {
  const { query, customLlm } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required for custom city generation.' });
  }

  const queryClean = query.trim();

  try {
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== 'gemini';
    const effectiveApiKey = getEffectiveLlmKey(customLlm);

    const systemInstruction = `You are an expert travel database orchestrator. Given a search query for a city name, analyze it and generate:
1. cityIndex: The metadata node for indexing this city.
2. cityDetail: A gorgeous, highly detailed travel schedule of exactly 3 days for this city containing real popular POIs, coordinates, cost estimations (in CNY), and helpful travel tips.

IMPORTANT: You must response with a single valid JSON object containing "cityIndex" and "cityDetail". Ensure there are no markdown backticks, no trailing comments, and the formatting matches the schemas below:
{
  "cityIndex": {
    "id": "lowercase_english_id_no_spaces",
    "name": "Chinese City Name (e.g. 三明)",
    "nameEn": "English City Name (e.g. Sanming)",
    "pinyin": "pinyin_lowercase_no_spaces (e.g. sanming)",
    "region": "Province/State Name in Chinese (e.g. 福建)",
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

    let responseJsonText = '';

    if (hasCustomLlm && customLlm.baseUrl && effectiveApiKey) {
      responseJsonText = await callOpenAiCompatible(
        customLlm.baseUrl,
        effectiveApiKey,
        customLlm.model || 'deepseek-chat',
        mainPrompt,
        systemInstruction,
        true
      );
    } else {
      // Use default Gemini API
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `${systemInstruction}\n\nUser query:\n${mainPrompt}`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cityIndex: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  nameEn: { type: Type.STRING },
                  pinyin: { type: Type.STRING },
                  region: { type: Type.STRING },
                  regionEn: { type: Type.STRING },
                  isInternational: { type: Type.BOOLEAN },
                  coordinates: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  }
                },
                required: ['id', 'name', 'nameEn', 'pinyin', 'region', 'regionEn', 'isInternational', 'coordinates']
              },
              cityDetail: {
                type: Type.OBJECT,
                properties: {
                  cityId: { type: Type.STRING },
                  cityName: { type: Type.STRING },
                  cityNameEn: { type: Type.STRING },
                  daysCount: { type: Type.INTEGER },
                  bestSeason: { type: Type.STRING },
                  bestSeasonEn: { type: Type.STRING },
                  localExpense: {
                    type: Type.OBJECT,
                    properties: {
                      tickets: { type: Type.INTEGER },
                      food: { type: Type.INTEGER },
                      hotel: { type: Type.INTEGER },
                      transit: { type: Type.INTEGER }
                    },
                    required: ['tickets', 'food', 'hotel', 'transit']
                  },
                  veteranTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  veteranTipsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.INTEGER },
                        pois: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              nameEn: { type: Type.STRING },
                              type: { type: Type.STRING },
                              time: { type: Type.STRING },
                              duration: { type: Type.STRING },
                              cost: { type: Type.INTEGER },
                              bestTime: { type: Type.STRING },
                              crowdTimes: { type: Type.STRING },
                              tip: { type: Type.STRING },
                              tipEn: { type: Type.STRING },
                              coordinates: {
                                type: Type.ARRAY,
                                items: { type: Type.NUMBER }
                              }
                            },
                            required: ['id', 'name', 'nameEn', 'type', 'time', 'duration', 'cost', 'bestTime', 'crowdTimes', 'tip', 'tipEn', 'coordinates']
                          }
                        }
                      },
                      required: ['day', 'pois']
                    }
                  }
                },
                required: ['cityId', 'cityName', 'cityNameEn', 'daysCount', 'bestSeason', 'bestSeasonEn', 'localExpense', 'veteranTips', 'veteranTipsEn', 'days']
              }
            },
            required: ['cityIndex', 'cityDetail']
          }
        }
      });
      responseJsonText = response.text ? response.text.trim() : '{}';
    }

    const cleanedText = cleanJsonString(responseJsonText);
    const parsed = JSON.parse(cleanedText);

    if (parsed.cityIndex && parsed.cityDetail) {
      const targetId = parsed.cityIndex.id.toLowerCase().replace(/\s+/g, '');
      parsed.cityIndex.id = targetId;
      parsed.cityDetail.cityId = targetId;

      if (typeof parsed.cityIndex.isInternational !== 'boolean') {
        parsed.cityIndex.isInternational = false;
      }

      const existingIdx = dynamicCustomCities.findIndex(c => c.id === targetId);
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
      throw new Error('LLM structural response did not contain cityIndex or cityDetail keys.');
    }
  } catch (err: any) {
    console.error('Failed to generate and write custom city data:', err.message);
    res.status(500).json({ error: `AI City Generation and Writing failed: ${err.message}` });
  }
});

// 1. API: Online City search supplement (fallback using Gemini AI when unknown city is looked up)
app.get('/api/cities/search', async (req, res) => {
  const query = req.query.query ? String(req.query.query).trim() : '';
  if (!query) {
    return res.json([]);
  }

  // First check local index (case-insensitive fuzzy match) + custom dynamized cities list
  const allAvailable = [...ALL_CITIES_INDEX, ...dynamicCustomCities];
  const localMatch = allAvailable.filter(
    (c) =>
      c.name.includes(query) ||
      c.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      c.pinyin.toLowerCase().includes(query.toLowerCase())
  );

  // If we have some local matches, return them immediately
  if (localMatch.length > 0) {
    return res.json(localMatch.slice(0, 8));
  }

  // If local list did not match, handle via fallback lookup to Gemini to find global details
  try {
    const ai = getGeminiClient();
    const prompt = `Provide the details of city or tourist location matching query "${query}". Return a JSON list with up to 3 most relevant cities in the world. Use this schema:
    [{
      "id": "lowercase_string_id",
      "name": "Chinese Name (or English name if no Chinese name)",
      "nameEn": "English Name",
      "pinyin": "pinyin_no_spaces",
      "region": "Continent, e.g. 亚洲, 欧洲, 北美 etc.",
      "regionEn": "English Continent Name, e.g. Asia, Europe, North America",
      "isInternational": true,
      "coordinates": [latitude_float, longitude_float]
    }]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              nameEn: { type: Type.STRING },
              pinyin: { type: Type.STRING },
              region: { type: Type.STRING },
              regionEn: { type: Type.STRING },
              isInternational: { type: Type.BOOLEAN },
              coordinates: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
            },
            required: ['id', 'name', 'nameEn', 'pinyin', 'region', 'regionEn', 'isInternational', 'coordinates'],
          },
        },
      },
    });

    const bodyText = response.text ? response.text.trim() : '[]';
    const parsed = JSON.parse(bodyText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini City Search Fallback failed:', err.message);
    res.json([]);
  }
});

// 2. API: Generate full multi-city trip plan using AI (Gemini 3.5 Flash or Domestic / Custom Provider)
app.post('/api/plan/generate', async (req, res) => {
  const { destinations, isAiEnhanced, lang, customLlm, departureDate, departureTime, returnDate, returnTime, travelMode, travelerCount } = req.body;
  const count = Number(travelerCount) || 1;

  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return res.status(400).json({ error: 'Missing destinations specification' });
  }

  // If AI enhancements not requested, do rapid, failure-proof local template rendering immediately
  if (!isAiEnhanced) {
    const plans = destinations.map((d: any) => {
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
            deepCopyDay.pois.forEach((poi: any, idx: number) => {
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
          transit: Math.round(cachedPlan.localExpense.transit * ratio),
        };
        return result;
      }
      return generateLocalPlan(d.cityId, d.days);
    });
    return res.json({ plans });
  }

  try {
    // Prepare targeted model prompting with Google Search grounding guidance
    const targetPrompt = `You must actively utilize your Google Search grounding tool to look up real-time live travel facts, local attraction statuses, peak holiday events, ticket prices, hotel rates, and weather trends on the internet for the specific travel period.
    Generate a highly detailed travel itinerary/plan for the following multi-stop journey based on the newest researched information: ${JSON.stringify(destinations)}.
    Departure Date: ${departureDate || '2026-05-28'}, Starting/Arrival Clock Time: ${departureTime || '09:00'}.
    Return Date: ${returnDate || '2026-06-05'}, Return Clock Time: ${returnTime || '18:00'}.
    Preferred Travel/Transit Mode: ${travelMode || 'all'} (You must consult web search results to recommend real flight details or schedules, train connections, high-speed rail, or optimal driving routes favoring this option). Provide accurate, researched transit transfer steps.
    
    CRITICAL BUDGETING PARAMETERS FOR TRAVELERS:
    There are exactly ${count} traveler(s) on this trip. You MUST utilize your Google Search grounding to find real prices and calculate the total combined budgets for EXACTLY ${count} people:
    - "tickets": estimated_cny_tickets_budget_sum (The sum of all attraction tickets/entry gate fees for ${count} people combined).
    - "food": estimated_cny_food_budget_sum (The total food/meals budget for all ${count} people combined).
    - "hotel": estimated_cny_hotel_budget_sum (The total accommodation lodging budget for all ${count} people combined, assuming optimized room sharing, e.g., standard room fits 2 people, or separate rooms as needed).
    - "transit": estimated_cny_local_transit_budget_sum (The total intra-city transport budget (metro, taxi, etc.) for all ${count} people combined, factoring in that taxis/cabs can be shared by up to 4 people).
    The resulting "localExpense" numbers must reflect the COMBINED total cost for all ${count} travelers, NOT per person.
    The "cost" property in each POI item must also be the calculated total cost for all ${count} travelers combined.

    Please optimize the plan and adjust all panel numbers dynamically based on actual search results for these dates:
    1. Adapt to Grounded seasonality context: For each city, search current real-world activities suitable for the departure month and adapt the recommended list.
    2. Adjust realistic budgets: Adjust panel values (lodging, ticket fees, food, and local transit) to reflect realistic, real-world prices updated for the current season based on ${count} travelers.
    Current language response style preference: ${lang === 'en' ? 'English priority' : 'Chinese priority'}.
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

     let rawText = '';
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== 'gemini';

    if (hasCustomLlm) {
      console.log(`Routing through Custom LLM Provider: ${customLlm.provider} (${customLlm.model})`);
      const effectiveApiKey = getEffectiveLlmKey(customLlm);
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
      // Define response schema to force JSON correctness and prevent raw text slop, with googleSearch grounding enabled
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: targetPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cityId: { type: Type.STRING },
                cityName: { type: Type.STRING },
                cityNameEn: { type: Type.STRING },
                daysCount: { type: Type.INTEGER },
                bestSeason: { type: Type.STRING },
                bestSeasonEn: { type: Type.STRING },
                localExpense: {
                  type: Type.OBJECT,
                  properties: {
                    tickets: { type: Type.INTEGER },
                    food: { type: Type.INTEGER },
                    hotel: { type: Type.INTEGER },
                    transit: { type: Type.INTEGER },
                  },
                  required: ['tickets', 'food', 'hotel', 'transit'],
                },
                veteranTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                veteranTipsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.INTEGER },
                      pois: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            nameEn: { type: Type.STRING },
                            type: { type: Type.STRING },
                            time: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            cost: { type: Type.INTEGER },
                            bestTime: { type: Type.STRING },
                            crowdTimes: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            tipEn: { type: Type.STRING },
                            coordinates: {
                              type: Type.ARRAY,
                              items: { type: Type.NUMBER },
                            },
                          },
                          required: [
                            'id',
                            'name',
                            'nameEn',
                            'type',
                            'time',
                            'duration',
                            'cost',
                            'bestTime',
                            'crowdTimes',
                            'tip',
                            'tipEn',
                            'coordinates',
                          ],
                        },
                      },
                    },
                    required: ['day', 'pois'],
                  },
                },
              },
              required: [
                'cityId',
                'cityName',
                'cityNameEn',
                'daysCount',
                'bestSeason',
                'bestSeasonEn',
                'localExpense',
                'veteranTips',
                'veteranTipsEn',
                'days',
              ],
            },
          },
        },
      });
      rawText = response.text || '[]';
    }

    const cleanedText = cleanJsonString(rawText);
    const parsedPlans = JSON.parse(cleanedText || '[]');
    // Add enhanced status
    parsedPlans.forEach((plan: any) => {
      plan.isAiEnhanced = true;
    });

    res.json({ plans: parsedPlans });
  } catch (err: any) {
    console.error('Plan generation failed! Falling back to client-safe templates. Error:', err.message);
    // Graceful fallback to local plan templates on error
    const plans = destinations.map((d: any) => generateLocalPlan(d.cityId, d.days));
    res.json({ plans, isFallback: true, fallbackReason: err.message });
  }
});

// 3. API: Enhance a single city itinerary using AI post-generation
app.post('/api/plan/enhance-city', async (req, res) => {
  const { cityId, daysCount, cityName, lang, customLlm, travelerCount } = req.body;
  const count = Number(travelerCount) || 1;

  if (!cityId || !daysCount) {
    return res.status(400).json({ error: 'Missing parameters for single city upgrade' });
  }

  try {
    const promptText = `You must actively utilize your Google Search grounding tool to research real-time travel details, live local attraction updates, current ticket fees, lodging rates, and coordinates on the internet for "${cityName || cityId}".
    Directly generate a single, highly detailed ${daysCount}-day itinerary for the city "${cityName || cityId}" incorporating these newly researched facts.
    
    CRITICAL BUDGETING PARAMETERS FOR TRAVELERS:
    There are exactly ${count} traveler(s) on this trip. You MUST utilize your Google Search grounding to find real prices and calculate the total combined budgets for EXACTLY ${count} people:
    - "tickets": The sum of all attraction tickets/entry gate fees for ${count} people combined.
    - "food": The total food/meals budget for all ${count} people combined.
    - "hotel": The total accommodation lodging budget for all ${count} people combined, assuming optimized room sharing, e.g., standard room fits 2 people, or separate rooms as needed.
    - "transit": The total intra-city transport budget (metro, taxi, etc.) for all ${count} people combined, factoring in that taxis/cabs can be shared by up to 4 people.
    The resulting "localExpense" numbers must reflect the COMBINED total cost for all ${count} travelers, NOT per person.
    The "cost" property in each POI item must also be the calculated total cost for all ${count} travelers combined.

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

    let rawText = '';
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== 'gemini';

    if (hasCustomLlm) {
      console.log(`Routing enhance-city through Custom LLM Provider: ${customLlm.provider} (${customLlm.model})`);
      const effectiveApiKey = getEffectiveLlmKey(customLlm);
      rawText = await callOpenAiCompatible(
        customLlm.baseUrl,
        effectiveApiKey,
        customLlm.model,
        promptText,
        "You are an expert global travel router. You must output a valid single JSON object strictly aligning with the instructions. Do not write any prelude or trailing conversational text. Wrap the response in raw JSON format.",
        true
      );
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cityId: { type: Type.STRING },
              cityName: { type: Type.STRING },
              cityNameEn: { type: Type.STRING },
              daysCount: { type: Type.INTEGER },
              bestSeason: { type: Type.STRING },
              bestSeasonEn: { type: Type.STRING },
              localExpense: {
                type: Type.OBJECT,
                properties: {
                  tickets: { type: Type.INTEGER },
                  food: { type: Type.INTEGER },
                  hotel: { type: Type.INTEGER },
                  transit: { type: Type.INTEGER },
                },
                required: ['tickets', 'food', 'hotel', 'transit'],
              },
              veteranTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              veteranTipsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    pois: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          nameEn: { type: Type.STRING },
                          type: { type: Type.STRING },
                          time: { type: Type.STRING },
                          duration: { type: Type.STRING },
                          cost: { type: Type.INTEGER },
                          bestTime: { type: Type.STRING },
                          crowdTimes: { type: Type.STRING },
                          tip: { type: Type.STRING },
                          tipEn: { type: Type.STRING },
                          coordinates: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                          },
                        },
                        required: [
                          'id',
                          'name',
                          'nameEn',
                          'type',
                          'time',
                          'duration',
                          'cost',
                          'bestTime',
                          'crowdTimes',
                          'tip',
                          'tipEn',
                          'coordinates',
                        ],
                      },
                    },
                  },
                  required: ['day', 'pois'],
                },
              },
            },
            required: [
              'cityId',
              'cityName',
              'cityNameEn',
              'daysCount',
              'bestSeason',
              'bestSeasonEn',
              'localExpense',
              'veteranTips',
              'veteranTipsEn',
              'days',
            ],
          },
        },
      });
      rawText = response.text || '{}';
    }

    const cleanedText = cleanJsonString(rawText);
    const parsedPlan = JSON.parse(cleanedText || '{}');
    parsedPlan.isAiEnhanced = true;
    res.json(parsedPlan);
  } catch (err: any) {
    console.error('Enhance single city failed! Falling back to local template. Error:', err.message);
    const plan = generateLocalPlan(cityId, daysCount);
    res.json(plan);
  }
});

// Dynamic POI static intelligence fallback generator
function getStaticPoiIntelFallback(poiName: string, poiType: string, lang: string): any {
  const isZh = lang === 'zh';
  const typeStr = poiType || 'attraction';

  let temp = '22°C';
  let condition = isZh ? '⛅ 多云转晴' : '⛅ Partly Sunny';
  let humidity = '55%';
  let uvIndex = isZh ? '中等 (3级)' : 'Moderate (3)';
  let wind = isZh ? '微风 东南风2级' : 'Gentle SE Wind 2';

  let status = 'good';
  let badge = isZh ? '🟢 畅行顺意' : '🟢 Traffic Smooth';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-250';
  let speed = isZh ? '本区均速 42km/h' : 'Local Avg 42km/h';
  let tip = isZh ? '周边公共交通通畅，推荐采用共享骑行或地铁快线绕过普通红绿灯。' : 'Excellent traffic conditions around the area. Take rapid public transit to bypass surface lights.';

  let gourmet = '';
  let strategy = '';

  if (typeStr === 'food' || typeStr === 'dining') {
    gourmet = isZh 
      ? `"${poiName}" 周边聚集了极富当地特色风味的餐厅与食肆。主打的手工招牌面食、清淡爽口的精致素斋以及本地时令菜肴口碑极佳，等位时间一般只需 5-10 分钟。`
      : `Outstanding dining venues and food stalls close to "${poiName}". Hand-crafted local noodles, delicately seasoned vegetarian dishes, and fresh seasonal ingredients are highly recommended with very short queues.`;
    strategy = isZh
      ? `食客建议：黄金就餐时段（中午12:00或晚上18:30）可能稍有拥挤，推荐提前 15 分钟或推迟半小时到店，通常会有额外的店长特色小菜赠送。`
      : `Gourmet Tip: Peak dining hours (12:00 PM or 6:30 PM) are often crowded. Standard arrival 15 minutes before or half an hour after guarantees instant seating.`;
  } else if (typeStr === 'hotel') {
    gourmet = isZh
      ? `入住 "${poiName}" 精品酒店，必尝其特设景观餐厅的私房午茶。其秘制的龙井茶香酥排骨以及传统广式/苏式点心，精致可口，令人流连忘返。`
      : `While staying near "${poiName}", explore the exclusive private afternoon tea at the premium terrace dining lounge. Highly recommended are the signature Longjing tea-glazed spare ribs.`;
    strategy = isZh
      ? `住客贴士：由于高阶景观房和特色庭院套间极其抢手，提前通过本程序在线预约并在线测试路况，可享受早鸟升级与赠送迎宾饮品。`
      : `Lodging Tip: Due to extreme popularity of landscape suites, secure your check-in dates in advance online via this terminal to enjoy early-bird room tier upgrades.`;
  } else if (typeStr === 'service' || typeStr === 'station') {
    gourmet = isZh
      ? `在 "${poiName}" 枢纽，别忘了顺道打卡网红手工饼家和地方特产面馆，其特制香脆肉酥饼和热气腾腾的排骨汤面是一绝。`
      : `At "${poiName}", check out the popular hand-crafted pastries and regional soup noodle parlors offering hot local dishes with dynamic grab-and-go packaging.`;
    strategy = isZh
      ? `接驳攻略：紧邻城际交汇处，推荐提前核对车票与本系统为您提供的候车网关。客流高峰时，建议跟随绿色箭头避峰指引即插即行。`
      : `Transit Strategy: Close to the rapid transit corridors. Keep your digital tickets on hand, follow the directional signage green arrows to skip standard bottlenecks.`;
  } else {
    gourmet = isZh
      ? `参观完 "${poiName}" 后，不妨步行至偏街小巷内的传统老字号，品尝现做桂花拉糕与手工酒酿小圆子。口味纯正，清甜不腻。`
      : `After exploring "${poiName}", step into the nearby ancient alleyways to taste hand-crafted sweet osmanthus rice pudding and traditional sticky rice ball soups, sweet and extremely soothing.`;
    strategy = isZh
      ? `打卡建议：最佳拍照和游览时刻在清晨 8:00 或日落黄昏。不仅游人稀疏，柔和的自然光线也非常适合捕捉绝美的国风意境大片！`
      : `Sightseeing Tip: Optimal timing is around 8:00 AM or near golden hour sunset. In addition to fewer crowds, the soft natural light provides picture-perfect composition.`;
  }

  return {
    weather: { temp, condition, humidity, uvIndex, wind },
    traffic: { status, badge, badgeColor, speed, tip },
    gourmet,
    strategy
  };
}

// Dynamic POI real-time intelligence analytics endpoint
app.post('/api/poi/intel-realtime', async (req, res) => {
  const { poiName, poiType, lang, customLlm } = req.body;
  if (!poiName) {
    return res.status(400).json({ error: 'Missing poiName parameter.' });
  }

  const isZh = lang === 'zh';
  const effectiveLang = lang || 'zh';

  try {
    const promptText = `Generate real-time local intelligence analysis for the point of interest (POI): "${poiName}" (Type: "${poiType || 'attraction'}").
Please return exactly one JSON object complying with this exact schema:
{
  "weather": {
    "temp": "Temp description e.g. '18°C' or '24°C'",
    "condition": "Weather icon and text in ${effectiveLang === 'zh' ? 'Chinese' : 'English'} (e.g. '⛅ 多云转晴' or '⛅ Partly Sunny')",
    "humidity": "Humidity e.g. '45%'",
    "uvIndex": "UV scale explanation e.g. '中等 (3级)' or 'Moderate (3)'",
    "wind": "Wind speed e.g. '东南风 2级' or 'SE Wind 2'"
  },
  "traffic": {
    "status": "good" status or "slow" or "heavy",
    "badge": "Short badge text in ${effectiveLang === 'zh' ? 'Chinese' : 'English'} (e.g. '🟢 畅行顺意' or '🟢 Traffic Smooth')",
    "badgeColor": "Recommended tailwind class string: use 'text-emerald-700 bg-emerald-50 border-emerald-250' for good, 'text-amber-700 bg-amber-50 border-amber-250' for slow, or 'text-rose-700 bg-rose-50 border-rose-250' for heavy",
    "speed": "Avg speed around POI e.g. '本区均速 42km/h' or 'Local Avg 42km/h'",
    "tip": "Short, helpful localized navigation or transit bypass tips in ${effectiveLang === 'zh' ? 'Chinese' : 'English'} (e.g., 'Take line 2' or 'Parking is limited')"
  },
  "gourmet": "A stellar, delicious culinary recommendation near this POI in ${effectiveLang === 'zh' ? 'Chinese' : 'English'} (1-2 sentences, include specific local specialties)",
  "strategy": "A clever sightseeing strategy, entrance tip, or queueing advice in ${effectiveLang === 'zh' ? 'Chinese' : 'English'} tailored to this POI (1-2 sentences)"
}

Keep all texts concise, highly localized, authentic, and direct. Deliver purely the raw JSON.`;

    let rawText = '';
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== 'gemini';

    if (hasCustomLlm) {
      const effectiveApiKey = getEffectiveLlmKey(customLlm);
      rawText = await callOpenAiCompatible(
        customLlm.baseUrl,
        effectiveApiKey,
        customLlm.model,
        promptText,
        "You are an expert local guide and real-time transit intelligence engine. You must output a valid single JSON object aligning with instructions. Raw JSON only.",
        true
      );
    } else {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weather: {
                type: Type.OBJECT,
                properties: {
                  temp: { type: Type.STRING },
                  condition: { type: Type.STRING },
                  humidity: { type: Type.STRING },
                  uvIndex: { type: Type.STRING },
                  wind: { type: Type.STRING }
                },
                required: ['temp', 'condition', 'humidity', 'uvIndex', 'wind']
              },
              traffic: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  badge: { type: Type.STRING },
                  badgeColor: { type: Type.STRING },
                  speed: { type: Type.STRING },
                  tip: { type: Type.STRING }
                },
                required: ['status', 'badge', 'badgeColor', 'speed', 'tip']
              },
              gourmet: { type: Type.STRING },
              strategy: { type: Type.STRING }
            },
            required: ['weather', 'traffic', 'gourmet', 'strategy']
          }
        }
      });
      rawText = response.text || '{}';
    }

    const cleanedText = cleanJsonString(rawText);
    const parsedIntel = JSON.parse(cleanedText || '{}');
    res.json(parsedIntel);
  } catch (err: any) {
    console.warn('Realtime POI Intel lookup failed, falling back to static package:', err.message);
    const fallbackData = getStaticPoiIntelFallback(poiName, poiType, lang || 'zh');
    res.json(fallbackData);
  }
});

// --- REAL-TIME TRAVEL FORUM & COMMUNITY SYSTEM ---

const FORUM_FILE_PATH = '/tmp/trip_ai_forum_posts.json';

// Seed initial mockup high-quality community plans
const INITIAL_FORUM_POSTS = [
  {
    id: 'post-seed-kyoto',
    title: '京都秋日枫叶季小众私藏路线 🍁 极简治愈慢行',
    description: '避开人挤人的清水寺，分享一条私藏的秋日赏枫极简静心路线。从南禅寺步行至法然院，沿途可以感受地道的宇治抹茶，最后在琉璃光院观赏红叶倒影。本方案包含特色汤豆腐美食推荐和清晨人少时的拍照秘籍。',
    tags: ['赏枫', '慢旅行', '特色美食', '日本'],
    author: '秋原小径 🦊',
    upvotes: 42,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    comments: [
      { id: 'c1', author: '旅行者阿星', text: '感谢楼主！这条京都路线太棒了，尤其是无人的琉璃光院拍照角度。已收藏！', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
      { id: 'c2', author: '抹茶控101', text: '沿途那家抹茶店的名字是什么呀？想要去打卡！', createdAt: new Date(Date.now() - 3600000 * 20).toISOString() }
    ],
    tripPlan: {
      id: 'plan-seed-kyoto',
      title: '京都秋日赏枫治愈之旅',
      departureCity: 'tokyo',
      selectedDestinations: [
        { cityId: 'kyoto', days: 2 }
      ],
      totalBudget: 450,
      totalDays: 2,
      cityPlans: [
        {
          cityId: 'kyoto',
          cityName: '京都',
          cityNameEn: 'Kyoto',
          daysCount: 2,
          bestSeason: '11月-12月 (红叶季)',
          bestSeasonEn: 'Nov-Dec (Autumn foliage)',
          localExpense: { tickets: 50, food: 150, hotel: 200, transit: 50 },
          veteranTips: ['清晨7:30前到达南禅寺可避开大批旅行团', '琉璃光院需要提前预约'],
          veteranTipsEn: ['Reach Nanzenji before 7:30 AM to avoid crowds', 'Ruriko-in requires prior booking'],
          isAiEnhanced: true,
          days: [
            {
              day: 1,
              pois: [
                {
                  id: 'poi-k1',
                  name: '南禅寺',
                  nameEn: 'Nanzenji Temple',
                  type: 'attraction',
                  time: '08:00',
                  duration: '2h',
                  cost: 10,
                  bestTime: '08:00-10:00',
                  crowdTimes: '11:00-15:00',
                  tip: '顺着红砖的水渠(水路阁)拍照极具明治维新时期的古典美感。',
                  tipEn: 'The brick aqueduct (Suirokaku) creates a beautiful historical backdrop.',
                  coordinates: [35.0112, 135.7938]
                },
                {
                  id: 'poi-k2',
                  name: '奥丹汤豆腐 (南禅寺店)',
                  nameEn: 'Okudan Yudofu',
                  type: 'food',
                  time: '11:30',
                  duration: '1.5h',
                  cost: 35,
                  bestTime: '11:30',
                  crowdTimes: '12:00-13:30',
                  tip: '拥有几百年历史的古老庭院，专注于传统的温润热豆腐多道式膳食。',
                  tipEn: 'Centuries old garden serving exquisite yudofu (tofu hotpot) course meals.',
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
    id: 'post-seed-iceland',
    title: '冰岛冬季极致追光与黑沙滩探险 🌌 (附自驾指南)',
    description: '冰岛是一生一定要去一次的神秘国度。本方案专注于冬季极光追逐，包含维克镇黑沙滩、塞里雅兰瀑布，以及本地非常小众且无需排队的冰洞探险。总结了风暴天气下的自驾避险技巧！',
    tags: ['极光', '深度自驾', '小众探险', '自然风光'],
    author: '极地向导 Thor ❄️',
    upvotes: 68,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
    comments: [
      { id: 'c3', author: '等一个极光', text: '冬季自驾真的需要好技术！楼主的避险技巧太实用了！', createdAt: new Date(Date.now() - 3600000 * 72).toISOString() },
      { id: 'c4', author: 'AeroTrip', text: '收藏了，明年1月份按照这个路线出发！', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() }
    ],
    tripPlan: {
      id: 'plan-seed-iceland',
      title: '冰岛极光与冰沙滩深度探秘',
      departureCity: 'reykjavik',
      selectedDestinations: [
        { cityId: 'vik', days: 2 }
      ],
      totalBudget: 1200,
      totalDays: 2,
      cityPlans: [
        {
          cityId: 'vik',
          cityName: '维克',
          cityNameEn: 'Vik',
          daysCount: 2,
          bestSeason: '10月-次年3月 (极光期)',
          bestSeasonEn: 'Oct-Mar (Aurora Season)',
          localExpense: { tickets: 100, food: 300, hotel: 600, transit: 200 },
          veteranTips: ['冬季黑沙滩风浪极其危险，切勿靠近水线！', '每天下午5点在Vedur网查看极光指数'],
          veteranTipsEn: ['Keep safe distance from water line at Black Sand Beach', 'Check Vedur website daily for aurora reports'],
          isAiEnhanced: true,
          days: [
            {
              day: 1,
              pois: [
                {
                  id: 'poi-i1',
                  name: '雷尼斯法尔黑沙滩',
                  nameEn: 'Reynisfjara Black Sand Beach',
                  type: 'attraction',
                  time: '10:00',
                  duration: '2.5h',
                  cost: 0,
                  bestTime: '10:30-13:00',
                  crowdTimes: '13:30-15:00',
                  tip: '壮丽的玄武岩石柱与漆黑的海岸线相得益彰，犹如外星世界。注意海浪诡秘！',
                  tipEn: 'Stunning basalt columns and jet-black shores. Exercise extreme caution near the sea.',
                  coordinates: [63.4025, -19.0188]
                },
                {
                  id: 'poi-i2',
                  name: 'Sudur Vik 景观餐厅',
                  nameEn: 'Sudur Vik Restaurant',
                  type: 'food',
                  time: '18:00',
                  duration: '1.5h',
                  cost: 45,
                  bestTime: '18:00',
                  crowdTimes: '19:00-20:30',
                  tip: '坐落于维克镇小山丘顶，羊排和披萨极其美味，能够鸟瞰远处海洋。',
                  tipEn: 'Cozy venue on the hill top. Outstanding roasted lamb chops and premium stone-baked pizzas.',
                  coordinates: [63.4201, -19.0090]
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
    id: 'post-seed-guangzhou',
    title: '广州老西关与璀璨现代中轴线 2日深度探味游 🥢 (超下饭保姆级攻略)',
    description: '食在广州，名副其实。本指南带你深度寻味老广最地道的骑楼西关街巷，漫步陈家祠感受繁复高超的灰塑雕刻艺术，在荔湾湖畔体验经典水上红米肠早茶，黄昏时跨海心桥在落日璀璨下拍到完美的广州塔（小蛮腰）中轴机位。绝对是好吃、好看又好拍的完美行程！',
    tags: ['广式早茶', '老西关骑楼', '城市漫步', '美食之旅'],
    author: '老广吃货达人 🍤',
    upvotes: 56,
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
    comments: [
      { id: 'c5', author: '旅行少女Lynn', text: '泮溪酒家的红米肠真的太赞了！看完这篇攻略去买，完全没有排长队，太实用了！', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 'c6', author: '羊城小飞侠', text: '啫啫煲一定要点黄鳝的，揭盖那一瞬间的滋滋声真的太治愈了！', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    tripPlan: {
      id: 'plan-seed-guangzhou',
      title: '广州西关寻味与中轴绝景之旅',
      departureCity: 'beijing',
      selectedDestinations: [
        { cityId: 'guangzhou', days: 2 }
      ],
      totalBudget: 570,
      totalDays: 2,
      cityPlans: [
        {
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
          isAiEnhanced: true,
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
                  crowdTimes: '周末下午会有大批婚纱摄影 and 旅拍人士聚集',
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
        }
      ],
      transits: {}
    }
  }
];

function loadForumPosts(): any[] {
  try {
    if (fs.existsSync(FORUM_FILE_PATH)) {
      const content = fs.readFileSync(FORUM_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load forum posts:', err);
  }
  saveForumPosts(INITIAL_FORUM_POSTS);
  return INITIAL_FORUM_POSTS;
}

function saveForumPosts(posts: any[]) {
  try {
    fs.writeFileSync(FORUM_FILE_PATH, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save forum posts:', err);
  }
}

// 1. Get all forum posts
app.get('/api/forum/posts', (req, res) => {
  const posts = loadForumPosts();
  res.json({ success: true, posts });
});

// 2. Add new forum post with optional Gemini AI caption optimization
app.post('/api/forum/posts', async (req, res) => {
  const { title, description, tags, author, tripPlan } = req.body;
  if (!tripPlan) {
    return res.status(400).json({ success: false, error: 'Missing trip plan.' });
  }

  const posts = loadForumPosts();
  let finalTitle = (title || '').trim();
  let finalDesc = (description || '').trim();

  // Create an engaging teaser using Gemini AI if description is brief
  if (!finalDesc || finalDesc.length < 10) {
    try {
      const cities = tripPlan.cityPlans ? tripPlan.cityPlans.map((c: any) => c.cityName).join(' and ') : 'marvelous sights';
      const spots = tripPlan.cityPlans && tripPlan.cityPlans[0] && tripPlan.cityPlans[0].days 
        ? tripPlan.cityPlans[0].days[0].pois.map((p: any) => p.name).slice(0, 3).join(', ') 
        : '';

      const promptText = `A user is sharing their travel plan called "${tripPlan.title || 'My itinerary'}" traveling through ${cities}. 
The plan includes top spots like: ${spots}.
Write a captivating, warm, and highly inspirational travel community platform caption (2-3 sentences max) recommending this trip. Keep the tone friendly, adventurous, and authentic. Write it in Chinese.`;
      
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText
      });
      if (response && response.text) {
        finalDesc = response.text.trim();
      }
    } catch (e: any) {
      console.warn('AI caption enhancement failed, using standard fallback', e.message);
      finalDesc = finalDesc || `分享我刚刚规划的优质行程：「${tripPlan.title || '完美旅行'}」！沿途风光无限，快来克隆体验。`;
    }
  }

  if (!finalTitle) {
    finalTitle = `探索${tripPlan.cityPlans?.[0]?.cityName || '世界'}的奇妙世界 ✨ ${tripPlan.title || ''}`;
  }

  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: finalTitle,
    description: finalDesc,
    tags: tags && tags.length ? tags : ['旅行路线', '分享社区', '定制方案'],
    author: author || '神秘旅行家 🗺️',
    upvotes: 1,
    createdAt: new Date().toISOString(),
    comments: [],
    tripPlan
  };

  posts.unshift(newPost);
  saveForumPosts(posts);

  res.json({ success: true, post: newPost });
});

// 3. Upvote/Like forum post
app.post('/api/forum/posts/:id/upvote', (req, res) => {
  const { id } = req.params;
  const posts = loadForumPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index].upvotes = (posts[index].upvotes || 0) + 1;
    saveForumPosts(posts);
    return res.json({ success: true, upvotes: posts[index].upvotes });
  }
  res.status(404).json({ success: false, error: 'Post not found.' });
});

// 4. Add comment to forum post
app.post('/api/forum/posts/:id/comment', (req, res) => {
  const { id } = req.params;
  const { author, text, image } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Comment text cannot be empty.' });
  }

  const posts = loadForumPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
      author: (author || '').trim() || '热心旅伴 🎒',
      text: text.trim(),
      image: image || undefined,
      createdAt: new Date().toISOString()
    };
    posts[index].comments = posts[index].comments || [];
    posts[index].comments.push(newComment);
    saveForumPosts(posts);
    return res.json({ success: true, comments: posts[index].comments });
  }
  res.status(404).json({ success: false, error: 'Post not found.' });
});

// Initialize server-side Firestore
let firestoreDb: Firestore | null = null;
try {
  firestoreDb = new Firestore({
    // Standard Application Default Credentials handles authentication automatically
    // on GCP Cloud Run. But we can explicitly provide projectId to prevent lookup delays.
    projectId: 'ais-asia-southeast1-43b85cf3a8',
  });
  console.log('Firebase Firestore initialized successfully server-side.');
} catch (e: any) {
  console.error('Failed to initialize server-side Firestore:', e.message);
}

// Local fallback store definition for zero-failure resilience
const FALLBACK_FILE_PATH = '/tmp/trip_ai_sync_fallback.json';

function saveToFallbackFile(code: string, record: any) {
  try {
    let data: Record<string, any> = {};
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const fileContent = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
      data = JSON.parse(fileContent);
    }
    data[code.toUpperCase()] = record;
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('Local JSON fallback write failed:', err.message);
  }
}

function loadFromFallbackFile(code: string): any {
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const fileContent = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
      const data = JSON.parse(fileContent);
      return data[code.toUpperCase()] || null;
    }
  } catch (err: any) {
    console.error('Local JSON fallback read failed:', err.message);
  }
  return null;
}

// 6-digit invitation sync code generator
function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude confusing chars like I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Real-time Sync API: Save a new collaborative trip plan
app.post('/api/sync/save', async (req, res) => {
  const { tripPlan, device } = req.body;
  if (!tripPlan) {
    return res.status(400).json({ success: false, error: 'Missing trip plan payload.' });
  }

  const code = generateSyncCode();
  const nowStr = new Date().toISOString();
  
  const initialPeers: Record<string, any> = {};
  if (device && device.id) {
    initialPeers[device.id] = {
      name: device.name || 'Unknown Device',
      lastSeen: nowStr
    };
  }

  const record = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: code,
    tripPlan: tripPlan,
    notes: [], // Collaborative notes list
    peers: initialPeers, // Connected active sessions tracker
    history: [], // Historical snapshot versions
    createdAt: nowStr,
    updatedAt: nowStr
  };

  let firestoreSuccess = false;
  let firestoreErrorDetails = '';

  if (firestoreDb) {
    try {
      await firestoreDb.collection('sync_plans').doc(code).set(record);
      firestoreSuccess = true;
      console.log(`Saved plan to Firestore successfully with code: ${code}`);
    } catch (e: any) {
      firestoreErrorDetails = e.message;
      console.error(`Firestore save failed for code ${code}:`, e.message);
    }
  }

  // Always write to filesystem fallback so we have multi-tier data security
  saveToFallbackFile(code, record);

  res.json({
    success: true,
    code: code,
    tripPlan: tripPlan,
    notes: record.notes,
    peers: record.peers,
    history: record.history,
    firestoreSynced: firestoreSuccess,
    firestoreError: firestoreErrorDetails || null,
    updatedAt: nowStr
  });
});

// Real-time Sync API: Retrieve and check-in to an existing trip plan by sync code
app.get('/api/sync/load/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const deviceId = (req.query.deviceId as string || '').trim();
  const deviceName = (req.query.deviceName as string || '').trim();

  if (code.length !== 6) {
    return res.status(400).json({ success: false, error: '请输入有效的6位联机同步码 / Invalid 6-character code.' });
  }

  let dbRecord: any = null;
  let loadedFromFirestore = false;

  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection('sync_plans').doc(code).get();
      if (doc.exists) {
        dbRecord = doc.data();
        loadedFromFirestore = true;
      }
    } catch (e: any) {
      console.error(`Firestore load failed for code ${code}:`, e.message);
    }
  }

  // Fallback to local store if Firestore document wasn't retrieved
  if (!dbRecord) {
    dbRecord = loadFromFallbackFile(code);
    if (dbRecord) {
      console.log(`Plan loaded from local JSON fallback store for code: ${code}`);
    }
  }

  if (!dbRecord) {
    return res.status(404).json({
      success: false,
      error: '未找到匹配此同步码的方案，请确认输入是否正确 / Travel plan not found matching this sync code.'
    });
  }

  // Handle active session peer registers and prune stale connections (inactive for > 35s)
  const now = new Date();
  const nowStr = now.toISOString();
  let updatedPeers = { ...(dbRecord.peers || {}) };

  // 1. Add current device
  if (deviceId) {
    updatedPeers[deviceId] = {
      name: deviceName || 'Explorer Device',
      lastSeen: nowStr
    };
  }

  // 2. Prune peers older than 35s
  Object.keys(updatedPeers).forEach((id) => {
    const peer = updatedPeers[id];
    if (peer && peer.lastSeen) {
      const timeDiffMs = now.getTime() - new Date(peer.lastSeen).getTime();
      if (timeDiffMs > 35000) {
        delete updatedPeers[id];
      }
    }
  });

  dbRecord.peers = updatedPeers;
  dbRecord.notes = dbRecord.notes || [];
  dbRecord.history = dbRecord.history || [];

  // Write updated presence status back in background
  if (loadedFromFirestore && firestoreDb) {
    firestoreDb.collection('sync_plans').doc(code).update({ peers: updatedPeers }).catch(err => {
      console.error('Failed to update peers list in Firestore:', err.message);
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
    loadedFromFirestore: loadedFromFirestore
  });
});

// Real-time Sync API: Overwrite, update plan + notes, and manage automatic visual history timelines
app.post('/api/sync/update/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const { tripPlan, notes, device } = req.body;

  if (code.length !== 6) {
    return res.status(400).json({ success: false, error: 'Parameters invalid.' });
  }

  let existingRecord: any = null;
  let loadedFromFirestore = false;

  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection('sync_plans').doc(code).get();
      if (doc.exists) {
        existingRecord = doc.data();
        loadedFromFirestore = true;
      }
    } catch (e: any) {
      console.error(`Firestore fetch on update failed for code ${code}:`, e.message);
    }
  }

  if (!existingRecord) {
    existingRecord = loadFromFallbackFile(code) || {};
  }

  const nowStr = new Date().toISOString();
  
  // Create version rollback if tripPlan has key itinerary modifications
  let updatedHistory = [...(existingRecord.history || [])];
  
  if (tripPlan && existingRecord.tripPlan) {
    const tripChanged = JSON.stringify(tripPlan) !== JSON.stringify(existingRecord.tripPlan);
    if (tripChanged) {
      // Unshift a rollback snapshot containing info of the previous state
      const deviceLabel = device ? (device.name || 'Co-Explorer') : 'Cloud device';
      const changeSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: nowStr,
        author: deviceLabel,
        totalDays: existingRecord.tripPlan.totalDays || 0,
        totalBudget: existingRecord.tripPlan.totalBudget || 0,
        tripPlan: existingRecord.tripPlan
      };
      updatedHistory.unshift(changeSnapshot);
      // Cap at holding up to 5 history states for clean low-footprint performance
      if (updatedHistory.length > 5) {
        updatedHistory = updatedHistory.slice(0, 5);
      }
    }
  }

  // Construct updated record payload
  const finalTripPlan = tripPlan || existingRecord.tripPlan;
  const finalNotes = notes !== undefined ? notes : (existingRecord.notes || []);
  
  const updatedPeers = { ...(existingRecord.peers || {}) };
  if (device && device.id) {
    updatedPeers[device.id] = {
      name: device.name || 'Explorer Device',
      lastSeen: nowStr
    };
  }

  const record = {
    id: existingRecord.id || `sync-update-${Date.now()}`,
    code: code,
    tripPlan: finalTripPlan,
    notes: finalNotes,
    peers: updatedPeers,
    history: updatedHistory,
    createdAt: existingRecord.createdAt || nowStr,
    updatedAt: nowStr
  };

  let firestoreSuccess = false;
  let firestoreErrorDetails = '';

  if (firestoreDb) {
    try {
      await firestoreDb.collection('sync_plans').doc(code).set(record);
      firestoreSuccess = true;
      console.log(`Updated plan in Firestore successfully with code: ${code}`);
    } catch (e: any) {
      firestoreErrorDetails = e.message;
      console.error(`Firestore update failed for code ${code}:`, e.message);
    }
  }

  // Always write fallback file
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

// Serve frontend client package
async function setupFrontend() {
  if (process.env.NODE_ENV !== 'production') {
    // In development, dynamic compile on-demand via Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve bundled client code and assets directly
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched successfully at http://localhost:${PORT}`);
  });
}

setupFrontend();
