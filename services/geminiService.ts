
import { GoogleGenAI, Type } from "@google/genai";
import { YouTubeContent } from "../types";

// Mengambil API_KEY dari variabel global yang diinjeksikan di index.html
const API_KEY = (window as any).GEMINI_API_KEY || '';

// Category IDs based on Google Trends (Arts: 3, Music: 35)
const CATEGORY_MAP: Record<string, string> = {
  'Seni dan Hiburan': '3',
  'Musik': '35'
};

export const generateYouTubeContent = async (topic: string, countryCode: string, category: string): Promise<YouTubeContent> => {
  if (!API_KEY) {
    throw new Error("API Key tidak ditemukan. Pastikan sudah diatur di Netlify.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const catId = CATEGORY_MAP[category] || '3';
  
  const prompt = `
    TUGAS UTAMA: Analisis Tren YouTube Real-time (24 Jam Terakhir).
    Lokasi: "${countryCode}"
    Kategori: "${category}" (Google Trends Category ID: ${catId})
    Topik Pengguna: "${topic}"
    
    INSTRUKSI DATA (WAJIB):
    1. Gunakan Google Search untuk menganalisis data dari URL ini: https://trends.google.com/trends/explore?cat=${catId}&date=now%201-d&geo=${countryCode}&gprop=youtube
    2. Identifikasi "Rising Queries" dan "Top Queries" yang berkaitan dengan topik "${topic}" dalam kategori ${category}.
    3. Pantau juga platform DeepSeek, TikTok, dan Snack Video untuk memvalidasi apakah tren YouTube tersebut juga sedang viral di sana.
    
    INSTRUKSI KONTEN:
    - Buat 3 JUDUL viral (90-100 karakter). Kombinasikan keyword puitis ala Yulia dengan keyword trending dari Google Trends.
    - Berikan estimasi skor minat (0-100) untuk masing-masing platform: youtube, deepseek, google, duckduckgo, tiktok, snackvideo.
    - Deskripsi: 2500-3000 karakter, SEO tinggi, puitis, mention channel Yulia.
    - Tag Platform: 900-1000 karakter (Hashtag viral).
    - Tag Metadata: 400-490 karakter (pisah koma).

    Gunakan gaya bahasa: Romantis, Estetik, Profesional, dan Viral.
    Output harus dalam JSON yang valid.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          titlePercentages: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          description: { type: Type.STRING },
          platformTags: { type: Type.STRING },
          metadataTags: { type: Type.STRING },
          platformScores: {
            type: Type.OBJECT,
            properties: {
              youtube: { type: Type.NUMBER },
              deepseek: { type: Type.NUMBER },
              google: { type: Type.NUMBER },
              duckduckgo: { type: Type.NUMBER },
              tiktok: { type: Type.NUMBER },
              snackvideo: { type: Type.NUMBER }
            },
            required: ["youtube", "deepseek", "google", "duckduckgo", "tiktok", "snackvideo"]
          }
        },
        required: ["titles", "titlePercentages", "description", "platformTags", "metadataTags", "platformScores"]
      }
    }
  });

  // Untuk debugging, log respons mentah sebelum parse
  // console.log("Raw API Response Text:", response.text);

  try {
    const content = JSON.parse(response.text || '{}');
    return content as YouTubeContent;
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    console.error("Problematic response text:", response.text);
    throw new Error("Gagal mengurai respons dari Gemini API. Format data tidak valid.");
  }
};