
import { GoogleGenAI, Type } from "@google/genai";
import { YouTubeContent } from "../types";

// The API key must be obtained from `import.meta.env.VITE_API_KEY` for Vite frontend applications.
// It is assumed to be pre-configured, valid, and accessible.
// Do not generate any UI elements or code snippets for entering or managing the API key.
// The application must not ask the user for it under any circumstances.

// Category IDs based on Google Trends (Arts: 3, Music: 35)
const CATEGORY_MAP: Record<string, string> = {
  'Seni dan Hiburan': '3',
  'Musik': '35'
};

export const generateYouTubeContent = async (topic: string, countryCode: string, category: string): Promise<YouTubeContent> => {
  // Always use `const ai = new GoogleGenAI({apiKey: API_KEY});`.
  // The API key must be obtained exclusively from `process.env.API_KEY` as per guidelines.
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("API Key tidak ditemukan. Pastikan 'API_KEY' sudah diatur di Vercel atau di file .env lokal Anda.");
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
      // Use `googleSearch` tool for queries related to recent events, news, or trending information.
      // If `googleSearch` is used, you MUST ALWAYS extract the URLs from `groundingChunks` and list them.
      tools: [{ googleSearch: {} }],
      // The recommended way for JSON response is to configure a `responseSchema`.
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
              snackvideo: { type :Type.NUMBER }
            },
            required: ["youtube", "deepseek", "google", "duckduckgo", "tiktok", "snackvideo"]
          }
        },
        required: ["titles", "titlePercentages", "description", "platformTags", "metadataTags", "platformScores"]
      }
    }
  });

  // Untuk debugging, log respons mentah sebelum parse
  console.log("Raw API Response Object:", response);
  console.log("Raw API Response Text:", response.text);
  // Log grounding chunks if available
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    console.log("Grounding Chunks:", response.candidates[0].groundingMetadata.groundingChunks);
  }


  try {
    const content = JSON.parse(response.text || '{}');
    return content as YouTubeContent;
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    console.error("Problematic response text (from catch block):", response.text);
    // Propagate the original error about Google Trends if it exists, otherwise provide a generic JSON parse error.
    if (response.text && response.text.includes("Gagal menghubungkan ke Google Trends YouTube")) {
      throw new Error("Gagal menghubungkan ke Google Trends YouTube. Silakan coba lagi.");
    }
    throw new Error("Gagal mengurai respons dari Gemini API. Format data tidak valid. Periksa konsol untuk respons mentah.");
  }
};