import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { ScanHistoryItem } from '../types';
import { fetchScanHistory } from '../services/api';

interface HistoryViewProps {
  lang: 'en' | 'hi';
}

const cleanHistoryDiseaseName = (rawName: string): string => {
  if (!rawName) return 'Leaf Pathology Analysis';
  const cropRegex = /^(Tomato|Potato|Apple|Corn|Grape|Orange|Peach|Bell Pepper|Pepper|Cherry|Blueberry|Raspberry|Soybean|Squash|Strawberry|Plant|Crop)[\s_:-]*/i;
  let cleaned = rawName.replace(cropRegex, '').trim();
  if (!cleaned || cleaned.toLowerCase() === 'healthy') {
    return 'Healthy Leaf Tissue';
  }
  return cleaned;
};

export const HistoryView: React.FC<HistoryViewProps> = ({ lang }) => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchScanHistory(40);
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            {lang === 'en' ? 'Diagnosis History Log' : 'पादप रोग निदान इतिहास लॉग'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {lang === 'en'
              ? 'Persisted scans in local SQLite database with diagnosis, confidence percentage, and notes.'
              : 'स्थानीय SQLite डेटाबेस में सुरक्षित रखे गए स्कैन, रोग निदान, विश्वास प्रतिशत और फील्ड नोट्स।'}
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{lang === 'en' ? 'Refresh History' : 'इतिहास ताज़ा करें'}</span>
        </button>
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold">
            {lang === 'en' ? 'No scan history recorded yet.' : 'अभी तक कोई स्कैन इतिहास रिकॉर्ड नहीं हुआ है।'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en'
              ? 'Run a diagnosis scan in the Disease Scanner tab to see records here.'
              : 'यहाँ रिकॉर्ड देखने के लिए "रोग स्कैनर" में जाकर किसी पत्ती का परीक्षण करें।'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((scan) => (
            <div
              key={scan.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">#{scan.id}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {scan.timestamp}
                  </span>
                </div>
                {/* Clean Disease Name - No crop prefix */}
                <h3 className="text-lg font-bold text-slate-900">
                  {cleanHistoryDiseaseName(scan.disease_name)}
                </h3>
                {scan.notes && (
                  <p className="text-xs text-slate-500 italic">
                    {lang === 'en' ? 'Notes: ' : 'टिप्पणी: '}"{scan.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-800 font-mono">
                    {(scan.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {lang === 'en' ? 'Confidence' : 'विश्वास स्तर'}
                  </div>
                </div>

                {scan.is_healthy ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Healthy Tissue' : 'स्वस्थ पत्ता'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Pathogen Detected' : 'रोग ग्रसित'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
