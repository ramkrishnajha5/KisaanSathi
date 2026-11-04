import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { SHOWCASE_SAMPLES } from '../data/samples';
import { ShowcaseSample, PredictionResponse } from '../types';
import { predictLeaf, fetchSampleBlob } from '../services/api';

interface ShowcaseGalleryProps {
  lang: 'en' | 'hi';
  onSelectAndDiagnose: (sample: ShowcaseSample) => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({ lang, onSelectAndDiagnose }) => {
  const [activeModalSample, setActiveModalSample] = useState<ShowcaseSample | null>(null);
  const [modalResult, setModalResult] = useState<PredictionResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const testSampleInModal = async (sample: ShowcaseSample) => {
    setActiveModalSample(sample);
    setModalLoading(true);
    setModalResult(null);
    try {
      const blob = await fetchSampleBlob(sample.file);
      const res = await predictLeaf(blob, `Showcase Test: ${sample.title}`);
      setModalResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Viva Demonstration Set</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            {lang === 'en' ? '10 Showcase Leaf Pathologies' : '10 प्रमुख पत्ती नमूने (प्रदर्शनी)'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            {lang === 'en'
              ? 'These 10 verified leaf samples represent diverse pathogen categories (Blights, Rusts, Mildew, Scabs, and Healthy foliage). Click any card to run live neural inference.'
              : 'यह 10 पत्ते विभिन्न प्रकार के रोगों और स्वस्थ पत्तियों का प्रतिनिधित्व करते हैं। किसी भी कार्ड पर क्लिक करके एआई जांच चलाएं।'}
          </p>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shrink-0">
          <div className="text-2xl font-black text-emerald-700">10 / 10</div>
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Showcase Classes</div>
        </div>
      </div>

      {/* 10 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {SHOWCASE_SAMPLES.map((sample, idx) => {
          const isHealthy = sample.category === 'Healthy';
          return (
            <div 
              key={sample.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  src={`/samples/${sample.file}`}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-black/60 text-white backdrop-blur-sm">
                  #{idx + 1}
                </div>
                <div className="absolute top-3 right-3">
                  {isHealthy ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Healthy
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Pathogen
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {sample.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    Expected: <span className="font-semibold text-slate-700">{sample.expected}</span>
                  </p>
                </div>

                {/* Quick Action Button */}
                <button
                  onClick={() => testSampleInModal(sample)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Run Live Diagnostic</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Quick Sample Diagnostic View */}
      {activeModalSample && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">Showcase Diagnostic</span>
                <h3 className="text-xl font-bold text-slate-900">{activeModalSample.title}</h3>
              </div>
              <button 
                onClick={() => setActiveModalSample(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Calculating inference & Grad-CAM...</p>
              </div>
            ) : modalResult ? (
              <div className="space-y-5">
                {/* Clean Result Card - NO CROP NAME */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800">Diagnosed Pathology</span>
                    <h4 className="text-xl font-black text-slate-900">{modalResult.disease_name}</h4>
                    {modalResult.hindi_name && (
                      <p className="text-xs font-bold text-amber-800">{modalResult.hindi_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-700">
                      {(modalResult.confidence * 100).toFixed(1)}%
                    </span>
                    <div className="text-[10px] font-bold text-slate-500">Confidence</div>
                  </div>
                </div>

                {/* Grad-CAM Preview */}
                {modalResult.gradcam_image_base64 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Grad-CAM Attention Overlay:</span>
                    <div className="rounded-xl overflow-hidden aspect-video bg-black/5 flex items-center justify-center">
                      <img 
                        src={`data:image/jpeg;base64,${modalResult.gradcam_image_base64}`} 
                        alt="Grad-CAM"
                        className="max-h-56 w-auto object-contain rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <b className="text-slate-800">Primary Treatment: </b>
                  <span>{modalResult.treatment?.organic || modalResult.treatment?.chemical}</span>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onSelectAndDiagnose(activeModalSample);
                  setActiveModalSample(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>Open in Full Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

