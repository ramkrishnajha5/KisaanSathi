import React, { useEffect, useState } from 'react';
import { 
  Droplets, 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  MapPin, 
  Navigation,
  Umbrella,
  Check
} from 'lucide-react';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/api';

interface WeatherViewProps {
  lang: 'en' | 'hi';
}

interface LocationPreset {
  name: string;
  nameHi: string;
  lat: number;
  lon: number;
  isDefault?: boolean;
}

const PRESET_LOCATIONS: LocationPreset[] = [
  { name: 'Bilaspur (College Base)', nameHi: 'बिलासपुर (कॉलेज बेस)', lat: 22.0797, lon: 82.1409, isDefault: true },
  { name: 'Raipur (Central Plains)', nameHi: 'रायपुर (मैदानी क्षेत्र)', lat: 21.2514, lon: 81.6296 },
  { name: 'Durg / Bhilai', nameHi: 'दुर्ग / भिलाई', lat: 21.1904, lon: 81.2849 },
  { name: 'Ambikapur (Northern Hills)', nameHi: 'अम्बिकापुर (उत्तरी पहाड़ी)', lat: 23.1189, lon: 83.1969 },
  { name: 'Jagdalpur (Bastar Plateau)', nameHi: 'जगदलपुर (बस्तर पठार)', lat: 19.0734, lon: 82.0232 },
  { name: 'New Delhi (NCR)', nameHi: 'नई दिल्ली (एनसीआर)', lat: 28.6139, lon: 77.2090 },
  { name: 'Ludhiana (Punjab)', nameHi: 'लुधियाना (पंजाब)', lat: 30.9010, lon: 75.8573 },
  { name: 'Nashik (Maharashtra)', nameHi: 'नासिक (महाराष्ट्र)', lat: 19.9975, lon: 73.7898 },
];

const CONDITION_MAP_HI: Record<string, string> = {
  'Sunny': 'साफ धूप',
  'Clear': 'साफ आसमान',
  'Partly Cloudy': 'आंशिक बादल',
  'Partly Sunny': 'हल्की धूप व बादल',
  'Cloudy': 'घने बादल',
  'Overcast': 'बादल छाए रहेंगे',
  'Rain': 'बारिश',
  'Light Rain': 'हल्की फुहारें',
  'Thunderstorm': 'गरज-चमक के साथ बौछारें',
  'Scattered Showers': 'रुक-रुक कर बारिश',
};

const DAY_MAP_HI: Record<string, string> = {
  'Mon': 'सोमवार',
  'Tue': 'मंगलवार',
  'Wed': 'बुधवार',
  'Thu': 'गुरुवार',
  'Fri': 'शुक्रवार',
  'Sat': 'शनिवार',
  'Sun': 'रविवार',
};

export const WeatherView: React.FC<WeatherViewProps> = ({ lang }) => {
  const [selectedLoc, setSelectedLoc] = useState<LocationPreset>(PRESET_LOCATIONS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const loadWeatherForLocation = async (lat: number, lon: number, name?: string) => {
    try {
      setLoading(true);
      const data = await fetchWeather(lat, lon, name);
      setWeather(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherForLocation(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);
  }, [selectedLoc]);

  // Browser Geolocation for real-world field use
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'आपके ब्राउज़र में जीपीएस लोकेशन समर्थित नहीं है।');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const custom: LocationPreset = {
          name: 'My Detected Location',
          nameHi: 'मेरा खोजा गया स्थान',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setSelectedLoc(custom);
        setLocating(false);
      },
      () => {
        alert(lang === 'en' ? 'Could not retrieve GPS location. Keeping current location.' : 'जीपीएस स्थान प्राप्त नहीं हो सका। वर्तमान स्थान रखा गया है।');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const weatherCond = weather?.condition || 'Partly Sunny';
  const displayCondition = lang === 'hi' ? (CONDITION_MAP_HI[weatherCond] || weatherCond) : weatherCond;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Location Selector Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'en' ? 'Select Agricultural Location' : 'कृषि क्षेत्र / स्थान का चयन करें'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'en' 
                ? 'Default is set to Bilaspur (College Base). Select or detect any region across India:' 
                : 'डिफ़ॉल्ट रूप से बिलासपुर सेट है। भारत के किसी भी स्थान का चयन करें या जीपीएस से खोजें:'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectLocation}
              disabled={locating}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{lang === 'en' ? 'Detect My Location' : 'मेरा स्थान खोजें'}</span>
            </button>
            <button
              onClick={() => loadWeatherForLocation(selectedLoc.lat, selectedLoc.lon, selectedLoc.name)}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title={lang === 'en' ? 'Refresh Forecast' : 'पूर्वानुमान ताज़ा करें'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Location Preset Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = selectedLoc.name === preset.name;
            const displayName = lang === 'hi' ? preset.nameHi : preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => setSelectedLoc(preset)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{displayName}</span>
                {preset.isDefault && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 font-bold'}`}>
                    {lang === 'en' ? 'Default' : 'डिफ़ॉल्ट'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Weather Hero Card */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 border border-white/10 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {lang === 'hi' ? selectedLoc.nameHi : (weather?.location || selectedLoc.name)} ({weather?.coordinates || `${selectedLoc.lat.toFixed(2)}° N, ${selectedLoc.lon.toFixed(2)}° E`})
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-400/20 rounded-full text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'en' ? 'Live Open-Meteo API Stream' : 'लाइव ओपन-मेटियो मौसम फीड'}</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            {weather ? `${weather.temperature_c}°C` : '29.2°C'}
          </h1>
          <p className="text-emerald-200 text-lg font-semibold mt-1">
            {displayCondition} • {lang === 'en' ? 'Feels like' : 'अनुभूत तापमान'} {weather?.feels_like_c || 31.0}°C
          </p>
          <p className="text-xs text-emerald-300/80 mt-1">
            {lang === 'en'
              ? 'Real-Time Meteorological Station & Fungal Sporulation Agro-Monitoring'
              : 'लाइव मौसम स्टेशन एवं कवक बीजाणु प्रसार निगरानी प्रणाली'}
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-right shrink-0">
          <span className="text-xs text-emerald-300 uppercase font-bold tracking-wider">
            {lang === 'en' ? 'Dew Point' : 'ओस बिंदु (ड्यू पॉइंट)'}
          </span>
          <div className="text-2xl font-black">{weather?.dew_point_c || 22.4}°C</div>
          <span className="text-[11px] text-emerald-200">
            {lang === 'en' ? 'Wind: ' : 'हवा: '}{weather?.wind_speed_kmh || 12} km/h {weather?.wind_direction || 'ENE'}
          </span>
        </div>
      </div>

      {/* Microclimate 4 Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Humidity */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Droplets className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Relative Humidity' : 'सापेक्षिक आर्द्रता'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {weather?.humidity_percent || 76.0}%
            </div>
            <span className="text-[10px] text-sky-700 font-semibold">
              {lang === 'en' ? 'Canopy moisture' : 'पत्तियों पर नमी'}
            </span>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Umbrella className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Rain Probability' : 'वर्षा की संभावना'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {weather?.rainfall_probability || 20}%
            </div>
            <span className="text-[10px] text-indigo-700 font-semibold">
              {weather?.rainfall_mm || 0.0} mm {lang === 'en' ? 'precip.' : 'वर्षा'}
            </span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Wind className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Wind Velocity' : 'पवन की गति'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {weather?.wind_speed_kmh || 12.0} km/h
            </div>
            <span className="text-[10px] text-teal-700 font-semibold">{weather?.wind_direction || 'ENE'}</span>
          </div>
        </div>

        {/* Fungal Sporulation Risk */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Pathogen Risk' : 'रोग संक्रमण जोखिम'}
            </span>
            <div className="text-lg sm:text-xl font-black text-rose-700">
              {lang === 'hi' 
                ? (weather?.fungal_risk_level === 'HIGH' ? 'उच्च (सावधान)' : weather?.fungal_risk_level === 'LOW' ? 'कम (सुरक्षित)' : 'मध्यम')
                : (weather?.fungal_risk_level || 'MODERATE')}
            </div>
            <span className="text-[10px] text-rose-600 font-semibold">
              {lang === 'en' ? 'Fungal germination' : 'कवक अंकुरण अनुकूलता'}
            </span>
          </div>
        </div>

      </div>

      {/* Regional Agronomic Advisory Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            🌾
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {lang === 'en' ? 'Agro-Meteorological Advisory' : 'कृषि मौसम परामर्श एवं कार्ययोजना'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? `Microclimate guidance for ${weather?.location || selectedLoc.name}`
                : `${lang === 'hi' ? selectedLoc.nameHi : (weather?.location || selectedLoc.name)} हेतु कृषि मौसम दिशा-निर्देश`}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed space-y-2">
          <b className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lang === 'en' ? 'Pathogen Spore Germination Window:' : 'कवक बीजाणु अंकुरण अनुकूलता:'}</span>
          </b>
          <p>
            {lang === 'hi'
              ? 'सुबह के समय सापेक्षिक आर्द्रता 75% से अधिक रहने पर कवक जनित रोगों (जैसे झुलसा) का खतरा बढ़ जाता है। पत्तियों की निचली सतह की नियमित जांच करें और दोपहर में तेज धूप के समय सिंचाई से बचें।'
              : (weather?.agri_advisory ||
                'Elevated morning relative humidity (>75%) accelerates fungal sporulation. Inspect leaf undersides for lesions and avoid overhead sprinkler watering.')}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs sm:text-sm leading-relaxed space-y-2">
          <b className="font-bold flex items-center gap-1.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lang === 'en' ? 'Foliar Spray Operational Recommendation:' : 'पर्णीय छिड़काव की सिफारिश:'}</span>
          </b>
          <p>
            {lang === 'hi'
              ? 'कीटनाशक या कवकनाशी का छिड़काव सुबह 6:00 से 8:30 बजे के बीच या शाम 4:30 बजे के बाद ही करें। तेज धूप और भारी हवा में दवा वाष्पीकृत होकर निष्प्रभावी हो जाती है।'
              : (weather?.spray_recommendation ||
                'Spray early morning (6:00 - 8:30 AM) or late evening to prevent photodegradation and droplet wash-off.')}
          </p>
        </div>

        {/* 5-Day Forecast Grid */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-3">
            {lang === 'en' ? '5-Day Meteorological Progression' : '5-दिवसीय मौसम पूर्वानुमान'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(weather?.forecast || []).map((f, i) => {
              const dayLabel = lang === 'hi' ? (DAY_MAP_HI[f.day] || f.day) : f.day;
              const condLabel = lang === 'hi' ? (CONDITION_MAP_HI[f.condition] || f.condition) : f.condition;
              return (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-600">{dayLabel}</span>
                  <div className="text-sm font-extrabold text-slate-900">{condLabel}</div>
                  <div className="text-xs font-mono text-emerald-800 font-bold">
                    {f.temp_max}° / {f.temp_min}°
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {f.rain_probability}% {lang === 'en' ? 'Rain' : 'वर्षा'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
