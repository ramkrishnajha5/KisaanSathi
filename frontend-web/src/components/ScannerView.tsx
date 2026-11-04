import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Eye, 
  RefreshCw,
  CloudSun,
  Sprout,
  Cpu,
  Zap,
  ArrowRight,
  Layers,
  SunMedium
} from 'lucide-react';
import { PredictionResponse, ShowcaseSample } from '../types';
import { SHOWCASE_SAMPLES } from '../data/samples';
import { predictLeaf, fetchSampleBlob } from '../services/api';
import { AgriNewsSection } from './AgriNewsSection';

interface ScannerViewProps {
  lang: 'en' | 'hi';
  onNavigateTab?: (tab: string) => void;
}

// Helpers to completely strip any crop identity from diagnosis labels
const cleanDiseaseName = (rawName: string): string => {
  if (!rawName) return 'Leaf Pathology Analysis';
  const cropRegex = /^(Tomato|Potato|Apple|Corn|Grape|Orange|Peach|Bell Pepper|Pepper|Cherry|Blueberry|Raspberry|Soybean|Squash|Strawberry|Plant|Crop)[\s_:-]*/i;
  let cleaned = rawName.replace(cropRegex, '').trim();
  if (!cleaned || cleaned.toLowerCase() === 'healthy') {
    return 'Healthy Leaf Tissue';
  }
  return cleaned;
};

const cleanHindiName = (rawHindi: string): string => {
  if (!rawHindi) return '';
  let cleaned = rawHindi
    .replace(/^(टमाटर|आलू|सेब|मक्का|अंगूर|संतरा|आड़ू|शिमला मिर्च|मिर्च|चेरी|ब्लूबेरी|रसभरी|सोयाबीन|कद्दू|स्ट्रॉबेरी|फसल)\s*(का|की|के)?\s*/gi, '')
    .trim();
  return cleaned;
};

export const ScannerView: React.FC<ScannerViewProps> = ({ lang, onNavigateTab }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeBlob, setActiveBlob] = useState<Blob | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [treatmentTab, setTreatmentTab] = useState<'all' | 'organic' | 'chemical' | 'prevention' | 'cause'>('all');
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveBlob(file);
      setSelectedImage(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setActiveSampleId(null);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setActiveBlob(file);
      setSelectedImage(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setActiveSampleId(null);
    }
  };

  // 1-Click test with one of the 10 showcase leaves
  const handleSelectSample = async (sample: ShowcaseSample) => {
    try {
      setLoading(true);
      setError(null);
      setActiveSampleId(sample.id);

      const blob = await fetchSampleBlob(sample.file);
      setActiveBlob(blob);
      setSelectedImage(`/samples/${sample.file}`);

      // Run prediction immediately
      const res = await predictLeaf(blob, `Viva Showcase: ${sample.title}`);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze sample');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Diagnosis API
  const handleDiagnose = async () => {
    if (!activeBlob) return;
    try {
      setLoading(true);
      setError(null);
      const res = await predictLeaf(activeBlob, notes);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Diagnosis failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Live Camera Capture
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert(lang === 'en' ? 'Unable to access camera on this device.' : 'इस डिवाइस पर कैमरा एक्सेस करने में असमर्थ।');
      setCameraActive(false);
    }
  };

  const captureCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          setActiveBlob(blob);
          setSelectedImage(URL.createObjectURL(blob));
          setResult(null);
          setActiveSampleId(null);
        }
      }, 'image/jpeg');
    }
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Hero Banner with Real-Time Stats */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-emerald-950/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' 
                ? 'Deep Learning Convolutional Neural Network • Grad-CAM Enabled' 
                : 'डीप लर्निंग कनवल्शनल न्यूरल नेटवर्क • ग्रैड-कैम सक्षम'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif leading-tight">
            {lang === 'en' ? 'AI Crop Pathology & Health Scanner' : 'एआई फसल रोग निदान एवं स्वास्थ्य स्कैनर'}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
            {lang === 'en' 
              ? 'Instant foliage disease detection across 38 certified plant pathologies with explainable Grad-CAM heatmaps and certified curative spray protocols.' 
              : 'पत्तियों के रोगों की तुरंत पहचान करें। 38 प्रमाणित श्रेणियों में न्यूरल नेटवर्क ग्रैड-कैम एक्टिवेशन हीटमैप और संपूर्ण उपचार सलाह प्रदान करता है।'}
          </p>
        </div>

        {/* 4 Performance Metric Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-emerald-800/60">
          <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-200">97.4%</div>
              <div className="text-[10px] sm:text-xs text-emerald-100/70 font-medium">
                {lang === 'en' ? 'Test Accuracy' : 'परीक्षण सटीकता'}
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-200">&lt; 45ms</div>
              <div className="text-[10px] sm:text-xs text-emerald-100/70 font-medium">
                {lang === 'en' ? 'Inference Latency' : 'अनुमान समय'}
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-200">38 Classes</div>
              <div className="text-[10px] sm:text-xs text-emerald-100/70 font-medium">
                {lang === 'en' ? '14 Crops & Controls' : '14 फसलें व नियंत्रण'}
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-200">Grad-CAM</div>
              <div className="text-[10px] sm:text-xs text-emerald-100/70 font-medium">
                {lang === 'en' ? 'Explainable Vision' : 'व्याख्यात्मक विज़न'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 10 Showcase Samples Bar (1-Click Viva Demo) */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'en' ? '⚡ 10 Curated Test Leaves (1-Click Viva Showcase)' : '⚡ 10 क्यूरेटेड टेस्ट पत्तियां (1-क्लिक टेस्ट)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'en' 
                ? 'Click any leaf sample below to run instant neural network diagnosis without downloading files:' 
                : 'बिना फाइल डाउनलोड किए तुरंत निदान चलाने के लिए नीचे दिए गए किसी भी नमूने पर क्लिक करें:'}
            </p>
          </div>
          <span className="inline-flex self-start sm:self-auto px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            {lang === 'en' ? '1-Click Instant Evaluation' : '1-क्लिक त्वरित परीक्षण'}
          </span>
        </div>

        {/* 10 Interactive Leaf Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
          {SHOWCASE_SAMPLES.map((sample, idx) => {
            const isSelected = activeSampleId === sample.id;
            const isHealthy = sample.category === 'Healthy';
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                disabled={loading}
                className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all group relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400'
                    : 'border-slate-200 hover:border-emerald-300 bg-slate-50/70 hover:bg-emerald-50/40'
                }`}
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden mb-1.5 bg-slate-200 relative shadow-inner">
                  <img 
                    src={`/samples/${sample.file}`} 
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                  #{idx + 1} {sample.title}
                </span>
                <span className={`text-[10px] font-medium ${isHealthy ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isHealthy ? (lang === 'en' ? 'Healthy' : 'स्वस्थ') : (lang === 'en' ? 'Infected' : 'संक्रमित')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.5 Specifically Calibrated 14 Plants Specification Banner */}
      <div className="bg-emerald-50/70 rounded-3xl p-5 sm:p-6 border border-emerald-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {lang === 'en' 
                ? 'Model Scope: Specifically Trained on Leaves of 14 Plants (38 Conditions)' 
                : 'मॉडल का दायरा: विशेष रूप से इन 14 फसलों की पत्तियों पर प्रशिक्षित (38 श्रेणियां)'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-2xs self-start sm:self-auto">
            14 Crops • 38 Pathology Classes
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === 'en'
            ? 'The underlying MobileNetV2 neural network was trained on 54,300+ leaf images belonging specifically to the following 14 plant species. For highest diagnostic accuracy, please scan a leaf from one of these supported crops:'
            : 'यह न्यूरल नेटवर्क विशेष रूप से नीचे दी गई 14 फसलों की पत्तियों पर प्रशिक्षित है। सटीक परिणाम और सही प्रतिशत प्राप्त करने के लिए कृपया इन्हीं 14 पौधों में से किसी एक की पत्ती की फोटो अपलोड करें:'}
        </p>

        {/* 14 Plants Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-xs font-semibold">
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍎 {lang === 'en' ? 'Apple' : 'सेब (Apple)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🫐 {lang === 'en' ? 'Blueberry' : 'ब्लूबेरी'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍒 {lang === 'en' ? 'Cherry' : 'चेरी (Cherry)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🌽 {lang === 'en' ? 'Corn' : 'मक्का (Corn)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍇 {lang === 'en' ? 'Grape' : 'अंगूर (Grape)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍊 {lang === 'en' ? 'Orange' : 'संतरा (Orange)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍑 {lang === 'en' ? 'Peach' : 'आड़ू (Peach)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🫑 {lang === 'en' ? 'Bell Pepper' : 'शिमला मिर्च'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🥔 {lang === 'en' ? 'Potato' : 'आलू (Potato)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🫐 {lang === 'en' ? 'Raspberry' : 'रसभरी'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🌱 {lang === 'en' ? 'Soybean' : 'सोयाबीन'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🎃 {lang === 'en' ? 'Squash' : 'कद्दू (Squash)'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍓 {lang === 'en' ? 'Strawberry' : 'स्ट्रॉबेरी'}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            🍅 {lang === 'en' ? 'Tomato' : 'टमाटर (Tomato)'}
          </span>
        </div>
      </div>

      {/* 3. Main Scanner Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Input & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {lang === 'en' ? 'Provide Leaf Photograph' : 'पत्ते की फोटो प्रदान करें'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Upload' : 'अपलोड'}
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Camera' : 'कैमरा'}
                </button>
              </div>
            </div>

            {/* Hidden native input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
            />

            {/* Camera Viewport */}
            {cameraActive && (
              <div className="rounded-2xl overflow-hidden bg-black relative aspect-square flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 flex items-center gap-3">
                  <button
                    onClick={captureCamera}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {lang === 'en' ? 'Capture Photo' : 'फोटो खींचे'}
                  </button>
                  <button
                    onClick={() => {
                      const stream = videoRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach((t) => t.stop());
                      setCameraActive(false);
                    }}
                    className="px-4 py-2.5 bg-white/80 hover:bg-white text-slate-900 rounded-full font-bold text-xs"
                  >
                    {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>
                </div>
              </div>
            )}

            {/* Dropzone & Preview Box */}
            {!cameraActive && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !selectedImage && fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[260px] ${
                  selectedImage 
                    ? 'border-emerald-300 bg-slate-50/50 p-3' 
                    : 'border-slate-300 hover:border-emerald-400 bg-slate-50/80 hover:bg-emerald-50/30'
                }`}
              >
                {selectedImage ? (
                  <div className="w-full space-y-3">
                    <div className="relative rounded-xl overflow-hidden max-h-[320px] bg-black/5 flex items-center justify-center shadow-inner">
                      <img 
                        src={selectedImage} 
                        alt="Selected Leaf" 
                        className="max-h-[320px] w-auto object-contain rounded-xl"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>
                        {lang === 'en' ? '✓ Image loaded ready for diagnosis' : '✓ फोटो लोड हो गई, निदान के लिए तैयार'}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        {lang === 'en' ? 'Change photo' : 'फोटो बदलें'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-7 h-7 stroke-[2]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {lang === 'en' ? 'Click or Drag & Drop leaf photo here' : 'यहाँ फोटो खींचें या अपलोड करें'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {lang === 'en' 
                          ? 'Supports JPG, PNG, WEBP high-resolution foliage photos' 
                          : 'JPG, PNG, WEBP उच्च-रिज़ॉल्यूशन पत्ते की फोटो समर्थित'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Farmer Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Farmer Remarks / Field Notes (Optional)' : 'किसान टिप्पणी / फील्ड नोट्स (वैकल्पिक)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., Lower canopy wilting after rainfall' : 'उदा. बारिश के बाद पत्तियों पर धब्बे'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            {/* Diagnose Action Button */}
            <button
              onClick={handleDiagnose}
              disabled={!activeBlob || loading}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
                !activeBlob || loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>
                    {lang === 'en' ? 'Computing Neural Gradients & Grad-CAM...' : 'न्यूरल ग्रेडिएंट्स एवं ग्रैड-कैम की गणना जारी...'}
                  </span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>{lang === 'en' ? 'Diagnose Plant Pathology' : 'रोग की जांच करें'}</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <b className="font-bold">{lang === 'en' ? 'Diagnosis Error:' : 'निदान त्रुटि:'}</b>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Diagnosis, Confidence & Grad-CAM (NO CROP NAME EVER DISPLAYED!) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6 animate-in fade-in duration-300">
              
              {/* Top Diagnosis Header Card: Strictly Disease & Condition Only */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    {lang === 'en' ? 'Pathology Diagnosis' : 'रोग निदान'}
                  </div>
                  {/* Clean Disease Name - No Crop Label! */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                    {cleanDiseaseName(result.disease_name)}
                  </h2>
                  {result.hindi_name && (
                    <p className="text-base font-semibold text-amber-700 mt-0.5">
                      {cleanHindiName(result.hindi_name)}
                    </p>
                  )}
                </div>

                {/* Health Status Badge */}
                <div>
                  {result.is_healthy ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {lang === 'en' ? 'Healthy Leaf Tissue' : 'स्वस्थ पत्ता (कोई रोग नहीं)'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      {lang === 'en' ? 'Pathogen Infection Detected' : 'रोग संक्रमण पाया गया'}
                    </span>
                  )}
                </div>
              </div>

              {/* Confidence Score Bar & Value */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-2xl p-5 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {lang === 'en' ? 'Neural Network Confidence' : 'मॉडल का विश्वास स्तर'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* Visual Progress Meter */}
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(Math.max(result.confidence * 100, 10), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-emerald-200/70 mt-1.5">
                  <span>{lang === 'en' ? 'Inference Mode: ' : 'मॉडल मोड: '}{result.mode}</span>
                  <span>{lang === 'en' ? 'Softmax Probability' : 'सॉफ्टमैक्स संभाव्यता स्कोर'}</span>
                </div>
              </div>

              {/* Explainable AI: Grad-CAM Activation Overlay */}
              {result.gradcam_image_base64 && (
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {lang === 'en' ? 'Explainable AI: Grad-CAM Activation Heatmap' : 'व्याख्यात्मक एआई: ग्रैड-कैम एक्टिवेशन हीटमैप'}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      {lang === 'en' ? 'Red = High Saliency' : 'लाल रंग = उच्च ध्यान क्षेत्र'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Gradient-Weighted Class Activation Mapping visualizes the exact convolutional filters focused on diseased tissue.'
                      : 'ग्रैड-कैम दर्शाता है कि न्यूरल नेटवर्क ने किस हिस्से पर ध्यान केंद्रित करके यह निर्णय लिया।'}
                  </p>

                  {/* Side-by-Side Images */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-center">
                      <div className="rounded-xl overflow-hidden aspect-square bg-slate-200 border border-slate-300/70 shadow-xs">
                        <img 
                          src={selectedImage || ''} 
                          alt="Original" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {lang === 'en' ? 'Original Leaf' : 'मूल पत्ता'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-center">
                      <div className="rounded-xl overflow-hidden aspect-square bg-slate-200 border border-slate-300/70 shadow-xs">
                        <img 
                          src={`data:image/jpeg;base64,${result.gradcam_image_base64}`} 
                          alt="Grad-CAM Focus" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800">
                        {lang === 'en' ? 'Grad-CAM Attention Map' : 'ग्रैड-कैम हीटमैप'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Summary Banner linking to the wide treatment container below */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    🌿
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {lang === 'en' ? 'Agronomic Treatment Protocols Prescribed' : 'कृषि उपचार एवं रोकथाम रिपोर्ट तैयार'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {lang === 'en' 
                        ? 'See full Symptoms & Cause, Organic Remedies, Chemical Controls & Prevention below' 
                        : 'लक्षण व कारण, जैविक उपचार, रासायनिक दवाएं एवं रोकथाम नीचे विस्तृत बॉक्स में देखें'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('treatment-protocols-container');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>{lang === 'en' ? 'View Advisory Protocols ↓' : 'विस्तृत उपचार देखें ↓'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* Awaiting Scan Empty State */
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-emerald-100 text-center shadow-sm flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
                🌿
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-slate-800 font-serif">
                  {lang === 'en' ? 'Awaiting Leaf Sample' : 'पत्ते के नमूने की प्रतीक्षा है'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  {lang === 'en'
                    ? 'Select any of the 10 quick test leaves at the top or upload your own leaf photo. The neural network will diagnose pathology and calculate percentage.'
                    : 'ऊपर दिए गए 10 नमूनों में से किसी एक पर क्लिक करें या अपना फोटो अपलोड करें। न्यूरल नेटवर्क तुरंत निदान कर प्रतिशत बताएगा।'}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                <span>
                  {lang === 'en' ? '⚡ Tip: Try 1-Click Showcase above for instant viva demo' : '⚡ सलाह: तुरंत परीक्षण के लिए ऊपर दिए गए 1-क्लिक नमूनों का उपयोग करें'}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3.5. Dedicated Wide Full-Width Container: Agronomic Treatment Protocols */}
      {result && (
        <section 
          id="treatment-protocols-container" 
          className="w-full bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-200/90 shadow-md space-y-8 animate-in fade-in duration-300 scroll-mt-24"
        >
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-500 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-500/20 shrink-0">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span>
                    {lang === 'en' 
                      ? 'Certified Agronomic Advisory • Crop Pathology Protocol' 
                      : 'प्रमाणित कृषि सलाह • पादप रोग उपचार प्रोटोकॉल'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
                  {lang === 'en' ? 'Agronomic Treatment Protocols' : 'कृषि उपचार एवं प्रबंधन प्रोटोकॉल'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {lang === 'en'
                    ? `Evidence-based clinical advisory prescribed for ${cleanDiseaseName(result.disease_name)}. Review diagnostic symptoms, pathological etiology, eco-friendly bio-organic remedies, chemical controls, and long-term prevention.`
                    : `${cleanHindiName(result.hindi_name || result.disease_name)} के लिए विस्तृत रोग कारण, लक्षण, जैविक एवं रासायनिक उपचार तथा दीर्घकालिक रोकथाम निर्देश।`}
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {result.is_healthy ? (
                <span className="px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {lang === 'en' ? 'Foliage Status: Healthy' : 'स्थिति: स्वस्थ पत्ता'}
                </span>
              ) : (
                <span className="px-4 py-2 rounded-2xl bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {lang === 'en' ? 'Active Infection Detected' : 'सक्रिय संक्रमण पाया गया'}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Protocol Tabs Filter */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setTreatmentTab('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                treatmentTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{lang === 'en' ? '✨ All Protocols' : '✨ सभी सलाह'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTreatmentTab('cause')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                treatmentTab === 'cause'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>📋 {lang === 'en' ? 'Symptoms & Cause' : 'लक्षण व कारण'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTreatmentTab('organic')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                treatmentTab === 'organic'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🌿 {lang === 'en' ? 'Organic Remedies' : 'जैविक उपचार'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTreatmentTab('chemical')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                treatmentTab === 'chemical'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🧪 {lang === 'en' ? 'Chemical Controls' : 'रासायनिक नियंत्रण'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTreatmentTab('prevention')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                treatmentTab === 'prevention'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🛡️ {lang === 'en' ? 'Prevention' : 'रोकथाम'}</span>
            </button>
          </div>

          {/* Cards Grid: Extra Large, Wide & Spacious */}
          <div className={`grid grid-cols-1 ${treatmentTab === 'all' ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'} gap-6 pt-1`}>

            {/* Section 1: 📋 Symptoms & Cause */}
            {(treatmentTab === 'all' || treatmentTab === 'cause') && (
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border-2 border-slate-200/90 space-y-5 hover:border-slate-300 transition-all shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-lg">
                      📋
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {lang === 'en' ? 'Symptoms & Cause' : 'लक्षण व रोग कारक'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500">
                        {lang === 'en' ? 'Pathological Etiology & Visual Diagnostics' : 'सूक्ष्मजीव रोग कारण एवं दृश्य लक्षण'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200">
                    {lang === 'en' ? 'Etiology' : 'रोग कारक'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Pathological Cause */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{lang === 'en' ? 'Pathological Cause' : 'रोग का जैविक कारण'}:</span>
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {result.cause || (lang === 'en' ? 'Pathogenic fungal or bacterial spores active during high canopy moisture.' : 'उच्च नमी के दौरान सक्रिय कवक या जीवाणु बीजाणु।')}
                    </div>
                  </div>

                  {/* Diagnostic Symptoms */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{lang === 'en' ? 'Diagnostic Symptoms' : 'रोग के नैदानिक लक्षण'}:</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {result.symptoms || (lang === 'en' ? 'Discoloration, chlorosis, or necrotic spots observable on lamina surface.' : 'पत्ती की सतह पर धब्बे, पीलापन या ऊतक क्षय के लक्षण।')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: 🌿 Organic Remedies */}
            {(treatmentTab === 'all' || treatmentTab === 'organic') && (
              <div className="p-6 sm:p-7 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200/90 space-y-5 hover:border-emerald-300 transition-all shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      🌿
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-emerald-950">
                        {lang === 'en' ? 'Organic Remedies' : 'जैविक उपचार'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-emerald-700">
                        {lang === 'en' ? 'Eco-Friendly Bio-Pesticides & Bio-Controls' : 'पर्यावरण-अनुकूल जैव-कीटनाशक एवं कवकनाशी'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    {lang === 'en' ? '100% Eco-Safe' : 'पूर्णतः जैविक'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-2xs space-y-2.5">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span>{lang === 'en' ? 'Recommended Bio-Organic Formulation:' : 'अनुशंसित जैविक फॉर्मूलेशन:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {result.treatment?.organic ||
                      (lang === 'en' 
                        ? 'Maintain balanced compost and microbial bio-fertilizers. Spray neem seed kernel extract (NSKE 5%) or Trichoderma viride.'
                        : 'संतुलित जैविक खाद एवं सूक्ष्मजीव उर्वरक का उपयोग करें। नीम के बीज के अर्क (5%) या ट्राइकोडर्मा विरिडी का छिड़काव करें।')}
                  </p>
                  <div className="pt-2 border-t border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                    <span>🌱 {lang === 'en' ? 'Safe for soil microbes, pollinators & beneficial insects' : 'मिट्टी के सूक्ष्मजीवों और मधुमक्खियों के लिए पूर्णतः सुरक्षित'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: 🧪 Chemical Controls */}
            {(treatmentTab === 'all' || treatmentTab === 'chemical') && (
              <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/70 border-2 border-amber-200/90 space-y-5 hover:border-amber-300 transition-all shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      🧪
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-amber-950">
                        {lang === 'en' ? 'Chemical Controls' : 'रासायनिक नियंत्रण'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-amber-700">
                        {lang === 'en' ? 'Targeted Active Ingredients & Dosages' : 'सटीक रासायनिक कवकनाशी एवं छिड़काव मात्रा'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-white px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                    {lang === 'en' ? 'Certified Spray' : 'प्रमाणित दवा'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-2xs space-y-2.5">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span>{lang === 'en' ? 'Curative Chemical / Fungicidal Prescription:' : 'उपचारात्मक रासायनिक कवकनाशी:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {result.treatment?.chemical ||
                      (lang === 'en'
                        ? 'No chemical intervention required if leaf is healthy. For lesions, spray protective fungicide like Mancozeb 75% WP @ 2.5g/L.'
                        : 'यदि पत्ता स्वस्थ है तो रासायनिक दवा की आवश्यकता नहीं है। लक्षण दिखने पर मैन्कोजेब 75% WP 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।')}
                  </p>
                  <div className="pt-2 border-t border-amber-100 flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                    <span>⚠️ {lang === 'en' ? 'Wear mask/gloves; follow 10-14 day pre-harvest interval' : 'मास्क व दस्ताने पहनें; फसल कटाई से 10-14 दिन पूर्व छिड़काव बंद करें'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: 🛡️ Prevention */}
            {(treatmentTab === 'all' || treatmentTab === 'prevention') && (
              <div className="p-6 sm:p-7 rounded-3xl bg-teal-50/70 border-2 border-teal-200/90 space-y-5 hover:border-teal-300 transition-all shadow-xs">
                <div className="flex items-center justify-between border-b border-teal-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      🛡️
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-teal-950">
                        {lang === 'en' ? 'Prevention' : 'रोकथाम रणनीति'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-teal-700">
                        {lang === 'en' ? 'Cultural Practices & Long-Term Crop Security' : 'सस्य प्रबंधन एवं फसल चक्र सुरक्षा'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
                    {lang === 'en' ? 'Field Hygiene' : 'खेत स्वच्छता'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-2xs space-y-2.5">
                  <div className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <span>{lang === 'en' ? 'Long-Term Agronomic Prevention:' : 'दीर्घकालिक रोकथाम दिशा-निर्देश:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {result.prevention ||
                      (lang === 'en'
                        ? 'Ensure proper field spacing, avoid overhead sprinkler irrigation to keep foliage dry, and practice crop rotation.'
                        : 'खेत में पौधों के बीच उचित दूरी रखें, पत्तियों को सूखा रखने के लिए ऊपर से फव्वारा सिंचाई से बचें और फसल चक्र अपनाएं।')}
                  </p>
                  <div className="pt-2 border-t border-teal-100 flex items-center gap-2 text-[11px] text-teal-800 font-semibold">
                    <span>🛡️ {lang === 'en' ? 'Prevents disease recurrence and avoids spore persistence in soil' : 'रोग के दोबारा फैलने से रोकता है और मिट्टी में फफूंद पनपने नहीं देता'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* 4. Krishi Agri News Section (Placed BEFORE "How KisaanSathi AI Diagnoses Crops") */}
      <AgriNewsSection lang={lang} />

      {/* 5. Engaging Home Page Section: 3-Step Neural Pipeline Workflow */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
              {lang === 'en' ? '🔬 How KisaanSathi AI Diagnoses Crops' : '🔬 किसान साथी एआई कैसे कार्य करता है'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'en'
                ? 'End-to-end scientific pipeline from photographic tensor acquisition to Grad-CAM explainability'
                : 'पत्ते की फोटो से लेकर ग्रैड-कैम व्याख्या तक वैज्ञानिक प्रक्रिया'}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            MobileNetV2 Transfer Learning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {lang === 'en' ? 'Foliage Tensor Ingestion' : 'पत्ती फोटो इनपुट एवं प्रीप्रोसेसिंग'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'High-resolution leaf images are validated, resized to 224×224 tensors, and processed through internal MobileNetV2 channel rescaling.'
                : 'पत्ती की तस्वीर को 224x224 रिज़ॉल्यूशन में स्केल किया जाता है और मॉडल के लिए उपयुक्त बनाया जाता है।'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {lang === 'en' ? 'Inverted Residual Inference' : 'डीप कनवल्शनल न्यूरल एनालिसिस'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Depthwise separable convolutions extract microscopic lesion patterns across 38 distinct botanical pathology classes in <45ms.'
                : 'न्यूरल नेटवर्क 38 रोग श्रेणियों में सूक्ष्म लक्षणों की जांच करता है और रोग की संभावना निकालता है।'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {lang === 'en' ? 'Grad-CAM & Curative Advisory' : 'ग्रैड-कैम विज़ुअल साक्ष्य एवं उपचार'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Backpropagates class gradients to output a color heatmap highlighting infected tissue and prescribes bio-organic & chemical remedies.'
                : 'प्रभावित क्षेत्र पर हीटमैप बनाकर दिखाता है और जैविक व रासायनिक दवाओं का सही छिड़काव अनुपात बताता है।'}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Engaging Dual Quick-Action Cards: Weather & Seasonal Seed Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weather Quick Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {lang === 'en' ? 'Live Micro-Climate Station' : 'लाइव कृषि मौसम केंद्र'}
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif mt-1">
                {lang === 'en' ? 'Agro-Weather & Spraying Advisory' : 'मौसम आधारित छिड़काव सलाह'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Check temperature, humidity, and rainfall conditions for Bilaspur or any location in India before applying foliar fungicides.'
                : 'बिलासपुर एवं देश के किसी भी स्थान का सटीक मौसम, आर्द्रता और कीटनाशक छिड़काव के लिए उपयुक्त समय देखें।'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab?.('weather')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm group"
          >
            <span>{lang === 'en' ? 'Open Weather Page & Forecast' : 'मौसम पेज एवं पूर्वानुमान देखें'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Seasonal Seed Planting & Tips Quick Card */}
        <div className="bg-gradient-to-br from-amber-50 via-green-50/40 to-white rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {lang === 'en' ? 'Certified Variety Selection' : 'प्रमाणित बीज बुवाई मार्गदर्शिका'}
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif mt-1">
                {lang === 'en' ? 'Seasonal Crop Sowing & Seed Guide' : 'फसल अनुसार उन्नत बीज चयन'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Explore high-yielding disease-resistant seed varieties (Paddy, Potato, Wheat, Tomato, Soybean) with biological seed treatment protocols.'
                : 'धान, आलू, गेहूं, टमाटर एवं सोयाबीन के प्रमाणित रोग-रोधी बीज और बीजोपचार की संपूर्ण विधि जानें।'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab?.('tips')}
            className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm group"
          >
            <span>{lang === 'en' ? 'Open Seed Sowing & Agronomy Guide' : 'उन्नत बीज व बुवाई सलाह देखें'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* 7. Photography Best-Practices Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <SunMedium className="w-5 h-5 text-emerald-700" />
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            {lang === 'en' ? 'Field Photography Best-Practices (For 99% Diagnostic Accuracy)' : 'पत्ती फोटोग्राफी के 3 नियम (सटीक परिणाम के लिए)'}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-2">
          <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
            <span>{lang === 'en' ? 'Ensure a single leaf fills at least 70% of the camera frame.' : 'एक समय में केवल एक पत्ती को फ्रेम के 70% हिस्से में रखें।'}</span>
          </div>
          <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
            <span>{lang === 'en' ? 'Use natural daylight; avoid blurry flash glare or dark shadows.' : 'प्राकृतिक धूप में फोटो लें, अंधेरे या अत्यधिक चमक से बचें।'}</span>
          </div>
          <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
            <span>{lang === 'en' ? 'Hold leaf steady against neutral ground or plain palm.' : 'पत्ती को हिलाए बिना साफ बैकग्राउंड के साथ फोटो खींचें।'}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
