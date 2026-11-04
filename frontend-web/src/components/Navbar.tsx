import React from 'react';
import { 
  Home,
  CloudSun,
  TrendingUp, 
  History, 
  BookOpen, 
  Cpu,
  Sprout
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  lang, 
  setLang
}) => {
  const navItems = [
    { id: 'scanner', label: lang === 'en' ? 'Home' : 'होम', icon: Home },
    { id: 'weather', label: lang === 'en' ? 'Weather' : 'मौसम', icon: CloudSun },
    { id: 'tips', label: lang === 'en' ? 'Agri Tips & Sowing' : 'कृषि सलाह एवं बुवाई', icon: BookOpen },
    { id: 'mandi', label: lang === 'en' ? 'Mandi Rates' : 'मंडी भाव', icon: TrendingUp },
    { id: 'history', label: lang === 'en' ? 'Scan History' : 'स्कैन इतिहास', icon: History },
    { id: 'about', label: lang === 'en' ? 'About Project' : 'प्रोजेक्ट विवरण', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs transition-all">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <button 
            type="button"
            onClick={() => setActiveTab('scanner')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0 text-left bg-transparent border-0 p-0 focus:outline-hidden"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-emerald-950 tracking-tight font-serif">
                  Kisaan<span className="text-emerald-600">Sathi</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-emerald-700">
                {lang === 'en' ? 'AI Agricultural Assistant' : 'किसान साथी • एआई कृषि सहायक'}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links - Extended Width & Fluid Spacing */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 xl:px-4 xl:py-2.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200 border border-emerald-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 shadow-inner">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lang === 'hi'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};


