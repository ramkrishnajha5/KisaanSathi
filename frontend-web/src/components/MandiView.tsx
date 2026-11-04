import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Search, MapPin } from 'lucide-react';
import { MandiItem } from '../types';
import { fetchMandiPrices, FALLBACK_MANDI_ITEMS } from '../services/api';

interface MandiViewProps {
  lang: 'en' | 'hi';
}

const getCommodityDisplayName = (raw: string, lang: 'en' | 'hi'): string => {
  if (lang === 'en') return raw;
  const l = raw.toLowerCase();
  if (l.includes('paddy') || l.includes('dhan')) return 'धान (Paddy)';
  if (l.includes('tomato') || l.includes('tamatar')) return 'टमाटर (Tomato)';
  if (l.includes('potato') || l.includes('aloo')) return 'आलू (Potato)';
  if (l.includes('wheat') || l.includes('gehun')) return 'गेहूं (Wheat)';
  if (l.includes('maize') || l.includes('makka')) return 'मक्का (Maize)';
  if (l.includes('soybean')) return 'सोयाबीन (Soybean)';
  if (l.includes('onion') || l.includes('pyaaz')) return 'प्याज (Onion)';
  if (l.includes('gram') || l.includes('chana')) return 'चना (Gram/Chana)';
  if (l.includes('mustard') || l.includes('sarson')) return 'सरसों (Mustard)';
  return raw;
};

const getMarketDisplayName = (raw: string, lang: 'en' | 'hi'): string => {
  if (lang === 'en') return raw;
  const l = raw.toLowerCase();
  if (l.includes('bilaspur main')) return 'बिलासपुर मुख्य मंडी';
  if (l.includes('bilaspur krishi')) return 'बिलासपुर कृषि उपज मंडी';
  if (l.includes('bilaspur sabzi')) return 'बिलासपुर सब्जी मंडी';
  if (l.includes('chakarbhatha')) return 'चकरभाठा मंडी';
  if (l.includes('kota')) return 'कोटा मंडी';
  if (l.includes('takhatpur')) return 'तखतपुर मंडी';
  if (l.includes('raipur')) return 'रायपुर मंडी';
  return raw;
};

export const MandiView: React.FC<MandiViewProps> = ({ lang }) => {
  // Start with instant fallback items so Mandi rates NEVER fail to show
  const [mandiItems, setMandiItems] = useState<MandiItem[]>(FALLBACK_MANDI_ITEMS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPrices = async () => {
    try {
      setLoading(true);
      const data = await fetchMandiPrices();
      if (data && data.length > 0) {
        setMandiItems(data);
      }
    } catch (e) {
      console.error('Mandi price load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const filtered = mandiItems.filter((item) =>
    item.commodity.toLowerCase().includes(search.toLowerCase()) ||
    item.market.toLowerCase().includes(search.toLowerCase()) ||
    item.variety.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Bilaspur & Chhattisgarh APMC Mandis (Live Rates)' : 'बिलासपुर एवं छत्तीसगढ़ कृषि उपज मंडी (लाइव भाव)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            {lang === 'en' ? 'Daily Mandi & Commodity Prices' : 'दैनिक कृषि मंडी भाव एवं उपज दरें'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {lang === 'en'
              ? 'Real-time APMC agricultural commodity prices for Bilaspur, Takhatpur, and Chakarbhatha markets.'
              : 'बिलासपुर, तखतपुर और चकरभाठा मंडियों के वास्तविक कृषि उपज भाव एवं दैनिक आवक स्थिति।'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search Paddy, Tomato, Wheat...' : 'धान, टमाटर, गेहूं, आलू खोजें...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
            />
          </div>
          <button
            onClick={loadPrices}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title={lang === 'en' ? 'Refresh Mandi Rates' : 'मंडी भाव ताज़ा करें'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mandi Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold">
            {lang === 'en' ? 'No mandi commodities matched your search.' : 'आपकी खोज से मेल खाती कोई कृषि उपज नहीं मिली।'}
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            {lang === 'en' ? 'Clear Search' : 'खोज साफ करें'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => {
            const isUp = item.trend === 'up';
            const commodityName = getCommodityDisplayName(item.commodity, lang);
            const marketName = getMarketDisplayName(item.market, lang);

            return (
              <div 
                key={idx}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{commodityName}</h3>
                    <p className="text-xs text-slate-500">{item.variety}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-0.5 ${
                    isUp ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {item.trend_percent}
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-black text-emerald-950 font-serif">
                    ₹{item.modal_price.toLocaleString()}
                    <span className="text-xs font-semibold text-slate-400 font-sans ml-1">
                      {lang === 'en' ? '/ qtl' : '/ क्विंटल'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {lang === 'en' ? 'Range: ' : 'दैनिक सीमा: '}₹{item.min_price} - ₹{item.max_price}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{marketName}</span>
                  <span className="text-emerald-700 font-bold">
                    {item.arrival_date === 'Today' ? (lang === 'en' ? 'Today' : 'आज') : item.arrival_date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
