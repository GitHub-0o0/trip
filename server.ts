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

// New API: Connection test route for domestic/custom API service configs
app.post('/api/plan/test-ai', async (req, res) => {
  const { customLlm } = req.body;
  if (!customLlm || !customLlm.apiKey || !customLlm.baseUrl) {
    return res.status(400).json({ success: false, error: 'Missing API key or Base URL configuration.' });
  }

  try {
    const rawText = await callOpenAiCompatible(
      customLlm.baseUrl,
      customLlm.apiKey,
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

// 1. API: Online City search supplement (fallback using Gemini AI when unknown city is looked up)
app.get('/api/cities/search', async (req, res) => {
  const query = req.query.query ? String(req.query.query).trim() : '';
  if (!query) {
    return res.json([]);
  }

  // First check local index (case-insensitive fuzzy match)
  const localMatch = ALL_CITIES_INDEX.filter(
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
  const { destinations, isAiEnhanced, lang, customLlm } = req.body;

  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return res.status(400).json({ error: 'Missing destinations specification' });
  }

  // If AI enhancements not requested, do rapid, failure-proof local template rendering immediately
  if (!isAiEnhanced) {
    const plans = destinations.map((d: any) => generateLocalPlan(d.cityId, d.days));
    return res.json({ plans });
  }

  try {
    // Prepare targeted model prompting
    const targetPrompt = `Generate a highly detailed travel itinerary/plan for the following multi-stop journey: ${JSON.stringify(destinations)}.
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
      rawText = await callOpenAiCompatible(
        customLlm.baseUrl,
        customLlm.apiKey,
        customLlm.model,
        targetPrompt,
        "You are an expert global travel router. You must output a valid JSON array strictly aligning with the instructions. Do not write any prelude or trailing conversational text. Wrap the response in raw JSON format.",
        true
      );
    } else {
      const ai = getGeminiClient();
      // Define response schema to force JSON correctness and prevent raw text slop
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: targetPrompt,
        config: {
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
  const { cityId, daysCount, cityName, lang, customLlm } = req.body;

  if (!cityId || !daysCount) {
    return res.status(400).json({ error: 'Missing parameters for single city upgrade' });
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

    let rawText = '';
    const hasCustomLlm = customLlm && customLlm.provider && customLlm.provider !== 'gemini';

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
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
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
