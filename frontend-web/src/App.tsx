import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScannerView } from './components/ScannerView';
import { WeatherView } from './components/WeatherView';
import { MandiView } from './components/MandiView';
import { HistoryView } from './components/HistoryView';
import { TipsView } from './components/TipsView';
import { AboutView } from './components/AboutView';
import { Shield, Cpu, Code2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Container - Extended Width */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8">
        {activeTab === 'scanner' && <ScannerView lang={lang} onNavigateTab={setActiveTab} />}
        {activeTab === 'weather' && <WeatherView lang={lang} />}
        {activeTab === 'tips' && <TipsView lang={lang} />}
        {activeTab === 'mandi' && <MandiView lang={lang} />}
        {activeTab === 'history' && <HistoryView lang={lang} />}
        {activeTab === 'about' && <AboutView lang={lang} />}
      </main>

      {/* Modern Footer - Extended Width */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                🌱
              </div>
              <span className="font-bold text-slate-700">KisaanSathi • किसान साथी</span>
              <span>— {lang === 'en' ? 'AI Crop Pathology & Explainable Vision' : 'एआई पादप रोग निदान एवं व्याख्यात्मक दृष्टि'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                MobileNetV2 + Grad-CAM
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                FastAPI Backend
              </span>
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                React + TypeScript + Tailwind CSS
              </span>
            </div>

            <div className="text-slate-400">
              {lang === 'en' ? 'MCA Project • Bilaspur (Chhattisgarh)' : 'एमसीए प्रोजेक्ट • बिलासपुर (छत्तीसगढ़)'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
