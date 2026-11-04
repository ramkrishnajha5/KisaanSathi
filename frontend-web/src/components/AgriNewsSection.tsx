import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Clock, 
  ExternalLink, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Radio, 
  Search,
  RefreshCw
} from 'lucide-react';
import { AGRI_NEWS_ARTICLES } from '../data/news';
import { fetchAgriNews } from '../services/api';

interface AgriNewsSectionProps {
  lang: 'en' | 'hi';
}

interface DisplayArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  details: string;
  source: string;
  date: string;
  readTime: string;
  badgeColor: string;
  url?: string;
  isLive?: boolean;
}

export const AgriNewsSection: React.FC<AgriNewsSectionProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<DisplayArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  const categories = [
    { id: 'all', en: 'All News', hi: 'सभी समाचार' },
    { id: 'scheme', en: 'Govt Schemes', hi: 'सरकारी योजनाएं' },
    { id: 'weather', en: 'Weather & Alerts', hi: 'मौसम व चेतावनी' },
    { id: 'mandi', en: 'Mandi & MSP', hi: 'मंडी व समर्थन मूल्य' },
    { id: 'seed', en: 'Seeds & Innov.', hi: 'उन्नत बीज' },
    { id: 'tech', en: 'Agri-Tech', hi: 'कृषि तकनीक' },
  ];

  const formatLocalArticles = (): DisplayArticle[] => {
    return AGRI_NEWS_ARTICLES.map((a) => ({
      id: a.id,
      category: a.category[lang],
      title: a.title[lang],
      summary: a.summary[lang],
      details: a.details[lang],
      source: a.source[lang],
      date: a.date[lang],
      readTime: a.readTime[lang],
      badgeColor: a.badgeColor,
      isLive: false,
    }));
  };

  const loadLiveNews = async () => {
    try {
      setLoading(true);
      const apiData = await fetchAgriNews(lang, 12);
      if (apiData && apiData.length >= 4) {
        const mapped: DisplayArticle[] = apiData.map((item: any, idx: number) => ({
          id: item.id || `live-${idx}`,
          category: item.category || (lang === 'en' ? 'Live Agri News' : 'ताज़ा कृषि समाचार'),
          title: item.title,
          summary: item.summary,
          details: item.details || item.summary,
          source: item.source || 'Agri News Bureau',
          date: item.date || (lang === 'en' ? 'Live' : 'लाइव'),
          readTime: item.read_time || (lang === 'en' ? '2 min read' : '2 मिनट पठन'),
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          url: item.url,
          isLive: item.is_live ?? true,
        }));
        setArticles(mapped);
        setIsLiveActive(Boolean(mapped[0]?.isLive));
      } else {
        setArticles(formatLocalArticles());
        setIsLiveActive(false);
      }
    } catch {
      setArticles(formatLocalArticles());
      setIsLiveActive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveNews();
  }, [lang]);

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'scheme' && article.category.toLowerCase().includes('scheme') || article.category.includes('योजना')) ||
      (selectedCategory === 'weather' && article.category.toLowerCase().includes('weather') || article.category.includes('मौसम')) ||
      (selectedCategory === 'mandi' && article.category.toLowerCase().includes('mandi') || article.category.includes('मंडी')) ||
      (selectedCategory === 'seed' && article.category.toLowerCase().includes('seed') || article.category.includes('बीज')) ||
      (selectedCategory === 'tech' && article.category.toLowerCase().includes('tech') || article.category.includes('तकनीक'));

    const titleText = article.title.toLowerCase();
    const summaryText = article.summary.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || titleText.includes(q) || summaryText.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Header Banner - Updated Title: "Agriculture News" / "कृषि समाचार" */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3" />
              {isLiveActive 
                ? (lang === 'en' ? 'Live Online Feed (Google News RSS)' : 'लाइव ऑनलाइन समाचार (गूगल न्यूज RSS)')
                : (lang === 'en' ? 'Verified Agri Bulletin' : 'सत्यापित कृषि समाचार बुलेटिन')}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              • {articles.length} {lang === 'en' ? 'Bulletins Loaded' : 'समाचार उपलब्ध'}
            </span>
          </div>

          {/* Exact Title Requested: "Agriculture News" / "कृषि समाचार" */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-emerald-700 shrink-0" />
            <span>{lang === 'en' ? 'Agriculture News' : 'कृषि समाचार'}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'en'
              ? 'Real-time agriculture dispatches, government scheme alerts, MSP rates, weather warnings, and ICAR seed notifications'
              : 'दैनिक कृषि समाचार, सरकारी योजनाएं, समर्थन मूल्य (MSP), मौसम चेतावनी और उन्नत बीज अनुसंधान की ताजा खबरें'}
          </p>
        </div>

        {/* Action Controls: Live Refresh & Search */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search news, MSP, seeds...' : 'समाचार, एमएसपी, बीज खोजें...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50/70"
            />
          </div>

          <button
            onClick={loadLiveNews}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors shrink-0"
            title={lang === 'en' ? 'Fetch latest live news updates' : 'ताज़ा लाइव समाचार प्राप्त करें'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {lang === 'en' ? 'Live Refresh' : 'लाइव ताज़ा करें'}
            </span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {cat[lang]}
          </button>
        ))}
      </div>

      {/* News Grid: At least 10 cards displayed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.slice(0, 12).map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                  {item.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.date}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h4>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-500 truncate max-w-[170px]">
                {item.source}
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                {lang === 'en' ? 'Read More' : 'विस्तार'}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${selectedArticle.badgeColor}`}>
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedArticle.date} • {selectedArticle.readTime}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 font-serif leading-snug">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
              <b>{lang === 'en' ? 'Summary Highlight:' : 'मुख्य बिंदु:'} </b>
              {selectedArticle.summary}
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Official Agronomic Report & Farmer Advisory:' : 'विस्तृत विवरण एवं किसान परामर्श:'}
              </h4>
              <p>{selectedArticle.details}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span><b>{lang === 'en' ? 'Source:' : 'स्रोत:'}</b> {selectedArticle.source}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedArticle.url && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>{lang === 'en' ? 'Open Original News' : 'मूल समाचार देखें'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  {lang === 'en' ? 'Close' : 'बंद करें'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
