
import React, { useState, useEffect } from 'react';
import { generateYouTubeContent } from './services/geminiService';
import { YouTubeContent, LoadingStatus } from './types';

const COUNTRIES = [
  { code: 'ID', name: 'Indonesia 🇮🇩' },
  { code: 'US', name: 'USA 🇺🇸' },
  { code: 'BR', name: 'Brazil 🇧🇷' },
  { code: 'JP', name: 'Japan 🇯🇵' },
];

const CATEGORIES = [
  { id: 'Seni dan Hiburan', name: 'Seni & Hiburan 🎭', catId: '3' },
  { id: 'Musik', name: 'Musik & Audio 🎵', catId: '35' },
];

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${copied ? 'bg-green-100 text-green-600 shadow-inner' : 'bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-sm active:scale-95'}`}>
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  );
};

const PlatformScoreBar: React.FC<{ name: string; score: number; color: string }> = ({ name, score, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
      <span>{name}</span>
      <span className="text-slate-600">{score}%</span>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }}></div>
    </div>
  </div>
);

const ResultCard: React.FC<{ title: string; content: string; helpText: string; colorClass: string }> = ({ title, content, helpText, colorClass }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl shadow-rose-100/20 border border-white overflow-hidden flex flex-col h-full transition-all hover:shadow-rose-200/40 group">
    <div className={`px-8 py-5 bg-gradient-to-r ${colorClass} border-b border-white/50 flex justify-between items-center`}>
      <h3 className="font-black text-slate-800 flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] text-rose-500">{title}</span>
        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{content.length} karakter</span>
      </h3>
      <CopyButton text={content} />
    </div>
    <div className="p-8">
      <p className="text-[10px] text-rose-400 mb-4 italic font-bold leading-tight opacity-80">🌸 {helpText}</p>
      <div className="w-full h-52 overflow-y-auto bg-white/40 rounded-2xl p-5 text-xs text-slate-600 font-medium leading-relaxed border border-rose-50/50 scrollbar-hide select-all">
        {content}
      </div>
    </div>
  </div>
);

export default function App() {
  const [topic, setTopic] = useState('');
  const [country, setCountry] = useState('ID');
  const [category, setCategory] = useState('Seni dan Hiburan');
  const [status, setStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [result, setResult] = useState<YouTubeContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setStatus(LoadingStatus.LOADING);
    setError(null);
    try {
      const data = await generateYouTubeContent(topic, country, category);
      setResult(data);
      setStatus(LoadingStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungkan ke Google Trends YouTube. Silakan coba lagi.');
      setStatus(LoadingStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen pb-24 selection:bg-rose-200 selection:text-rose-900">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-rose-100/50 sticky top-0 z-50 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-rose-200 rotate-2">Y</div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">ViralTube Pro</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Yulia Studio Analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-rose-50 rounded-full border border-rose-100 shadow-inner">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-ping"></div>
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">YouTube Trends Syncing</span>
          </div>
          <div className="text-[10px] font-mono font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {currentTime}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 mt-16">
        {/* Analytics Control Panel */}
        <div className="bg-white/95 p-12 rounded-[3.5rem] shadow-2xl shadow-rose-200/30 border border-white mb-16 max-w-3xl mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 space-y-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100/50 rounded-full border border-rose-200 mb-4">
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em]">24H YouTube Property Analyzer</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Optimasi Tren YouTube Anda ✨</h2>
              <p className="text-slate-400 text-sm font-medium italic mt-2 opacity-80">Gunakan kecanggihan AI untuk membaca algoritma visual & audio.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em] ml-2">Wilayah Tren</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all shadow-inner appearance-none">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em] ml-2">Kategori YouTube</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all shadow-inner appearance-none">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em] ml-2">Topik Judul / Keyword</label>
                <div className="relative">
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Misal: Review MV Paling Estetik..." className="w-full px-8 py-5 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-lg placeholder:text-slate-300 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none transition-all shadow-inner bg-slate-100" />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-200">🔍</div>
                </div>
              </div>

              <button disabled={status === LoadingStatus.LOADING} className="w-full py-6 rounded-[1.5rem] font-black text-white bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 shadow-xl shadow-rose-200/50 hover:scale-[1.01] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center justify-center gap-3 tracking-[0.2em]">
                  {status === LoadingStatus.LOADING ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      MENGANALISIS 24H TRENDS...
                    </>
                  ) : 'PROSES VIRAL ASSETS'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Error Feedback */}
        {status === LoadingStatus.ERROR && (
          <div className="max-w-2xl mx-auto mb-16 bg-rose-50 border border-rose-100 p-6 rounded-3xl text-rose-700 text-xs font-black flex items-center justify-center gap-4 shadow-sm animate-bounce">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        {/* Results Visualization */}
        {status === LoadingStatus.SUCCESS && result && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Forecast Panel */}
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-white/80 p-12 rounded-[3.5rem] shadow-2xl shadow-rose-100/30 border border-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Viral Title Forecasts</h3>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Berdasarkan data YouTube Trends kategori {category}</p>
                  </div>
                  <div className="px-5 py-2 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">Live Prediction Active</div>
                </div>

                <div className="space-y-10">
                  {result.titles.map((title, idx) => (
                    <div key={idx} className="group p-8 bg-gradient-to-br from-white to-rose-50/20 rounded-[2.5rem] border border-rose-100/50 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-100/40 transition-all">
                      <div className="flex justify-between items-start gap-6 mb-6">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">0{idx + 1}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title.length} Karakter</span>
                          </div>
                          <span className="text-slate-800 font-black text-xl leading-snug block group-hover:text-rose-600 transition-colors">{title}</span>
                        </div>
                        <CopyButton text={title} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-6 border-t border-rose-100/50">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Potential Score</span>
                          <span className="text-2xl font-black text-rose-500">{result.titlePercentages[idx]}%</span>
                        </div>
                        <div className="sm:col-span-3 grid grid-cols-2 gap-x-8 gap-y-3">
                          <PlatformScoreBar name="TikTok" score={result.platformScores.tiktok} color="bg-rose-400" />
                          <PlatformScoreBar name="YouTube" score={result.platformScores.youtube} color="bg-red-400" />
                          <PlatformScoreBar name="DeepSeek" score={result.platformScores.deepseek} color="bg-blue-400" />
                          <PlatformScoreBar name="SnackVideo" score={result.platformScores.snackvideo} color="bg-orange-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Stats Radar */}
              <div className="lg:col-span-4 flex flex-col gap-10">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group h-full flex flex-col justify-center items-center text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 border-t-4 border-rose-300 rounded-full animate-spin"></div>
                    <span className="text-xs font-black uppercase tracking-tighter">Radar</span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-[0.2em] mb-4">Traffic Hub</h4>
                  <p className="text-xs text-indigo-100 font-medium italic mb-10 opacity-70">Volume pencarian global lintas engine.</p>
                  <div className="w-full space-y-6">
                    <PlatformScoreBar name="Google Search" score={result.platformScores.google} color="bg-white" />
                    <PlatformScoreBar name="DuckDuckGo" score={result.platformScores.duckduckgo} color="bg-white/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Grid */}
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <ResultCard 
                  title="24H SEO Description" 
                  content={result.description} 
                  colorClass="from-rose-100/40 to-indigo-100/40" 
                  helpText={`Dioptimasi untuk trending YouTube ${country} (2500-3000 karakter).`} 
                />
              </div>
              <div className="flex flex-col gap-10">
                <ResultCard 
                  title="Viral Hashtags" 
                  content={result.platformTags} 
                  colorClass="from-purple-100/40 to-rose-100/40" 
                  helpText="Hashtag performa tinggi di TikTok & Shorts (900-1000 karakter)." 
                />
                <ResultCard 
                  title="Internal Metadata" 
                  content={result.metadataTags} 
                  colorClass="from-amber-100/40 to-rose-100/40" 
                  helpText="Keyword teknis pemisahan koma (400-490 karakter)." 
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 pb-20 text-center">
        <div className="inline-flex flex-col items-center gap-4 group">
          <div className="flex items-center gap-6 px-10 py-5 bg-white/40 backdrop-blur-md rounded-full border border-rose-100/50 shadow-sm transition-all hover:bg-white/60">
            <span className="text-rose-400 text-lg">📈</span>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
              YT Trend Engine <span className="text-rose-500 mx-4">●</span> Optimized for <span className="text-slate-800">Yulia Channel</span>
            </p>
            <span className="text-rose-400 text-lg">📈</span>
          </div>
          <p className="text-[9px] font-black text-rose-300 uppercase tracking-[0.8em] mt-4 opacity-50 group-hover:opacity-100 transition-opacity">Digital Content Technology 2024</p>
        </div>
      </footer>
    </div>
  );
}
