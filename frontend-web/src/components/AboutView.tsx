import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Layers, 
  Activity, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Maximize2,
  X,
  Download
} from 'lucide-react';

interface AboutViewProps {
  lang: 'en' | 'hi';
}

interface PlantSpec {
  name: string;
  nameHi: string;
  icon: string;
  conditions: string;
  conditionsHi: string;
  classCount: number;
}

const PLANT_SPECIES_SPEC: PlantSpec[] = [
  { name: 'Apple', nameHi: 'सेब', icon: '🍎', conditions: '3 diseases + Healthy', conditionsHi: '3 रोग (पपड़ी, काला सड़न, रतुआ) + स्वस्थ', classCount: 4 },
  { name: 'Blueberry', nameHi: 'ब्लूबेरी', icon: '🫐', conditions: 'Healthy', conditionsHi: 'स्वस्थ पत्ती', classCount: 1 },
  { name: 'Cherry', nameHi: 'चेरी', icon: '🍒', conditions: 'Powdery Mildew + Healthy', conditionsHi: 'चूर्णिल आसिता (पाउडरी मिल्ड्यू) + स्वस्थ', classCount: 2 },
  { name: 'Corn', nameHi: 'मक्का', icon: '🌽', conditions: '3 diseases + Healthy', conditionsHi: '3 रोग (रतुआ, झुलसा, लीफ स्पॉट) + स्वस्थ', classCount: 4 },
  { name: 'Grape', nameHi: 'अंगूर', icon: '🍇', conditions: '3 diseases + Healthy', conditionsHi: '3 रोग (काला सड़न, एस्का, लीफ ब्लाइट) + स्वस्थ', classCount: 4 },
  { name: 'Orange', nameHi: 'संतरा', icon: '🍊', conditions: 'Citrus Greening', conditionsHi: 'सिट्रस ग्रीनिंग (हौंगलोंगबिंग जीवाणु रोग)', classCount: 1 },
  { name: 'Peach', nameHi: 'आड़ू', icon: '🍑', conditions: 'Bacterial Spot + Healthy', conditionsHi: 'जीवाणु धब्बा (बैक्टीरियल स्पॉट) + स्वस्थ', classCount: 2 },
  { name: 'Bell Pepper', nameHi: 'शिमला मिर्च', icon: '🫑', conditions: 'Bacterial Spot + Healthy', conditionsHi: 'जीवाणु धब्बा (बैक्टीरियल स्पॉट) + स्वस्थ', classCount: 2 },
  { name: 'Potato', nameHi: 'आलू', icon: '🥔', conditions: 'Early Blight, Late Blight + Healthy', conditionsHi: 'अगेती झुलसा, पछेती झुलसा + स्वस्थ', classCount: 3 },
  { name: 'Raspberry', nameHi: 'रसभरी', icon: '🫐', conditions: 'Healthy', conditionsHi: 'स्वस्थ पत्ती', classCount: 1 },
  { name: 'Soybean', nameHi: 'सोयाबीन', icon: '🌱', conditions: 'Healthy', conditionsHi: 'स्वस्थ पत्ती', classCount: 1 },
  { name: 'Squash', nameHi: 'कद्दू', icon: '🎃', conditions: 'Powdery Mildew', conditionsHi: 'चूर्णिल आसिता (पाउडरी मिल्ड्यू)', classCount: 1 },
  { name: 'Strawberry', nameHi: 'स्ट्रॉबेरी', icon: '🍓', conditions: 'Leaf Scorch + Healthy', conditionsHi: 'पत्ती झुलसन (लीफ स्कॉर्च) + स्वस्थ', classCount: 2 },
  { name: 'Tomato', nameHi: 'टमाटर', icon: '🍅', conditions: '9 diseases + Healthy', conditionsHi: '9 रोग (झुलसा, मोल्ड, वायरस आदि) + स्वस्थ', classCount: 10 },
];

export const AboutView: React.FC<AboutViewProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'training' | 'dataset' | 'architecture' | 'xai' | 'results'>('training');
  const [modalImage, setModalImage] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Academic Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' 
                ? 'Academic Technical Specification & Evaluation Report' 
                : 'तकनीकी विशिष्टता एवं मॉडल मूल्यांकन रिपोर्ट'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif mb-2 leading-tight">
            {lang === 'en' 
              ? 'KisaanSathi ML Architecture & 38-Class Training Specification' 
              : 'किसान साथी मशीन लर्निंग आर्किटेक्चर एवं 38-श्रेणी प्रशिक्षण विवरण'}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            {lang === 'en'
              ? 'Comprehensive technical documentation of the 14-plant 38-class crop pathology detection pipeline, Kaggle dual-GPU distributed training, MobileNetV2 transfer learning, and Grad-CAM visual explainability.'
              : '14 फसलों की 38 रोग श्रेणियों के डेटासेट, कैगल 2x T4 जीपीयू डिस्ट्रीब्यूटेड ट्रेनिंग, मोबाइलनेटवी2 ट्रांसफर लर्निंग और ग्रैड-कैम एक्सएआई का संपूर्ण तकनीकी विवरण।'}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5 text-[11px] font-bold">
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-emerald-300">
              Model: MobileNetV2 (3.4M Params)
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-teal-300">
              Hardware: 2x Tesla T4 GPUs (Kaggle)
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-green-300">
              Scope: 14 Plants • 38 Pathology Classes
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-amber-300">
              Accuracy: 97.4% Holdout Benchmark
            </span>
          </div>
        </div>
      </div>

      {/* Nav Tabs for Deep Technical Exploration */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'training'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{lang === 'en' ? 'Model Training Pipeline' : 'मॉडल प्रशिक्षण पाइपलाइन'}</span>
        </button>

        <button
          onClick={() => setActiveTab('dataset')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'dataset'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{lang === 'en' ? '14 Plants & 38 Classes' : '14 पौधे एवं 38 रोग श्रेणियां'}</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'architecture'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'en' ? 'MobileNetV2 Architecture' : 'मोबाइलनेटवी2 आर्किटेक्चर'}</span>
        </button>

        <button
          onClick={() => setActiveTab('xai')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'xai'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{lang === 'en' ? 'Explainable AI (Grad-CAM)' : 'ग्रैड-कैम व्याख्यात्मक एआई'}</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'results'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{lang === 'en' ? 'Evaluation Reports & Curves' : 'मूल्यांकन रिपोर्ट एवं कर्व्स'}</span>
        </button>
      </div>

      {/* Tab 1: Machine Learning & Model Training Tasks */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <span>Two-Stage Transfer Learning & Kaggle Training Pipeline</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The model was trained on **Kaggle Dual Tesla T4 GPUs** using TensorFlow 2.x and distributed synchronous data parallelism (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-800">tf.distribute.MirroredStrategy</code>).
            </p>

            {/* Two-Stage Card Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">Stage 1</span>
                  <span className="text-xs font-bold text-emerald-900">Feature Extraction Head</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Base Layers Frozen (`trainable = False`)</h3>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Adapts randomly initialized classification weights without corrupting pre-trained ImageNet low-level edge filters.</li>
                  <li><strong>Optimizer:</strong> Adam with learning rate η = 1e-3 (0.001).</li>
                  <li><strong>Epochs:</strong> 10 epochs with EarlyStopping monitoring validation loss.</li>
                  <li><strong>Batch Size:</strong> 64 distributed across 2 GPUs (32 images per device).</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-600 text-white">Stage 2</span>
                  <span className="text-xs font-bold text-teal-900">Fine-Tuning Deep Representations</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Top 30 Conv Layers Unfrozen</h3>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Unfreezes the top 30 convolutional layers of MobileNetV2 to capture plant-specific lesion rings and chlorosis margins.</li>
                  <li><strong>BatchNorm Frozen:</strong> All BatchNormalization layers remain frozen to prevent statistics degradation.</li>
                  <li><strong>Optimizer:</strong> Adam with reduced learning rate η = 1e-5 (0.00001) to eliminate catastrophic forgetting.</li>
                  <li><strong>Callbacks:</strong> ReduceLROnPlateau scales learning rate by 0.2 upon plateau.</li>
                </ul>
              </div>
            </div>

            {/* Normalization & Pipeline Safeguard */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <b className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Crucial Architectural Fix: Internal Rescaling Layer</span>
              </b>
              <p className="leading-relaxed">
                The Keras model architecture incorporates an internal <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-amber-900">layers.Rescaling(1.0/127.5, offset=-1.0)</code> layer. Preprocessing scripts pass raw <strong>[0.0, 255.0]</strong> float image arrays directly to the model. This design prevents the common "double normalization" bug where scaling to [-1, 1] twice collapses image tensors to near-zero values.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 14 Plants & 38 Classes (Exact Requested Specification Table) */}
      {activeTab === 'dataset' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
                <Database className="w-3.5 h-3.5" />
                <span>PlantVillage Dataset (54,306 Certified Images)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
                {lang === 'en'
                  ? 'Model Can Recognize These 14 Plant Species and Their 38 Classes'
                  : 'मॉडल इन 14 पौधों की प्रजातियों और उनकी 38 श्रेणियों की पहचान कर सकता है'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {lang === 'en'
                  ? 'The neural network is specifically calibrated on the following 14 agricultural plants and supported pathological conditions:'
                  : 'न्यूरल नेटवर्क विशेष रूप से इन 14 कृषि पौधों और उनकी समर्थित रोग स्थितियों पर प्रशिक्षित और कैलिब्रेटेड है:'}
              </p>
            </div>

            {/* Exact Requested Table: Plant | Supported conditions */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-emerald-50/80 border-b border-slate-200 text-slate-800 font-bold">
                    <th className="p-3.5 sm:px-4">{lang === 'en' ? 'Plant' : 'फसल / पौधा'}</th>
                    <th className="p-3.5 sm:px-4">{lang === 'en' ? 'Supported conditions' : 'समर्थित स्थितियां / रोग'}</th>
                    <th className="p-3.5 sm:px-4 text-right">{lang === 'en' ? 'Classes' : 'श्रेणियां'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {PLANT_SPECIES_SPEC.map((spec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 sm:px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-base">{spec.icon}</span>
                        <span>{lang === 'hi' ? `${spec.nameHi} (${spec.name})` : spec.name}</span>
                      </td>
                      <td className="p-3 sm:px-4 text-slate-600 font-medium">
                        {lang === 'hi' ? spec.conditionsHi : spec.conditions}
                      </td>
                      <td className="p-3 sm:px-4 text-right font-mono font-bold text-emerald-800">
                        {spec.classCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-100/70 font-extrabold text-slate-900 border-t border-slate-200">
                    <td className="p-3 sm:px-4">
                      {lang === 'en' ? 'Total: 14 Plant Species' : 'कुल: 14 फसल प्रजातियां'}
                    </td>
                    <td className="p-3 sm:px-4">
                      {lang === 'en' ? 'Complete Multi-Crop Foliage Pathology Coverage' : 'संपूर्ण बहु-फसलीय पादप रोग कवरेज'}
                    </td>
                    <td className="p-3 sm:px-4 text-right font-mono text-emerald-950 text-sm">
                      38 Classes
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xl font-black text-emerald-800">38,014</div>
                <div className="text-[11px] font-bold text-emerald-700 uppercase mt-0.5">Training Set (70%)</div>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <div className="text-xl font-black text-teal-800">8,146</div>
                <div className="text-[11px] font-bold text-teal-700 uppercase mt-0.5">Validation Set (15%)</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                <div className="text-xl font-black text-slate-800">8,146</div>
                <div className="text-[11px] font-bold text-slate-600 uppercase mt-0.5">Holdout Test Set (15%)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MobileNetV2 Architecture & Mathematical Rationale */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Why MobileNetV2 for Edge Agricultural AI?</span>
            </h2>

            {/* Academic Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-3 font-bold">Metric / Architecture</th>
                    <th className="p-3 font-bold text-emerald-700">MobileNetV2 (KisaanSathi)</th>
                    <th className="p-3 font-bold text-slate-500">ResNet-50</th>
                    <th className="p-3 font-bold text-slate-500">VGG-16</th>
                    <th className="p-3 font-bold">Academic Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Parameter Count</td>
                    <td className="p-3 font-bold text-emerald-700">~3.4 Million</td>
                    <td className="p-3">~25.6 Million</td>
                    <td className="p-3">~138 Million</td>
                    <td className="p-3">Minimal memory footprint for rural deployment</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Model File Size</td>
                    <td className="p-3 font-bold text-emerald-700">~14 MB</td>
                    <td className="p-3">~102 MB</td>
                    <td className="p-3">~528 MB</td>
                    <td className="p-3">Instant loading into FastAPI memory upon boot</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">CPU Inference Latency</td>
                    <td className="p-3 font-bold text-emerald-700">&lt; 45 ms</td>
                    <td className="p-3">&gt; 180 ms</td>
                    <td className="p-3">&gt; 400 ms</td>
                    <td className="p-3">Real-time diagnosis without expensive GPU servers</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Convolution Type</td>
                    <td className="p-3 font-bold text-emerald-700">Depthwise Separable</td>
                    <td className="p-3">Standard 2D Spatial</td>
                    <td className="p-3">Standard 2D Spatial</td>
                    <td className="p-3">Reduces MAC operations by ~8.5x</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Depthwise Separable Conv Rationale */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <b className="font-bold text-slate-900 block">Depthwise Separable Convolution Formulation:</b>
              <p className="leading-relaxed">
                Standard convolutions compute spatial filtering and channel cross-correlations simultaneously. MobileNetV2 factorizes this into a 3×3 <strong>Depthwise Convolution</strong> (per-channel spatial filtering) followed by a 1×1 <strong>Pointwise Convolution</strong> (channel linear combination). The theoretical computational reduction factor is:
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-center text-emerald-900 font-bold">
                Reduction Factor = 1 / N + 1 / Dk² ≈ 1 / 3² ≈ 1/9 (8.5× to 9× fewer computations)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Explainable AI (Grad-CAM) */}
      {activeTab === 'xai' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span>Explainable AI: Mathematical Formulation of Grad-CAM</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standard deep learning models act as "black boxes". Gradient-Weighted Class Activation Mapping (Grad-CAM) computes gradients of the target class score with respect to the final convolutional feature maps (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-800">Conv_1</code>) to visually verify that the model focused on diseased tissue rather than background soil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-emerald-800">1. Gradient Computation</span>
                <p className="text-slate-600">Calculates gradient of class score <i>y<sup>c</sup></i> with respect to feature activation map <i>A<sup>k</sup></i> using <code className="font-mono">tf.GradientTape()</code>.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-emerald-800">2. Global Average Pooling (GAP)</span>
                <p className="text-slate-600">Averages gradients over spatial dimensions (width & height) to generate neuron importance weights <i>α<sub>k</sub><sup>c</sup></i>.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-emerald-800">3. Weighted Combination & ReLU</span>
                <p className="text-slate-600">Linearly combines activation maps weighted by <i>α<sub>k</sub><sup>c</sup></i> and passes through ReLU to retain only positive features influencing the diagnosis.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-emerald-800">4. Bilinear Upsampling & Jet Colormap</span>
                <p className="text-slate-600">The 14×14 feature map is upsampled to original leaf resolution and blended using OpenCV JET colormap (Red = Maximum Attention).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Evaluation Reports, Confusion Matrix & Training Curves */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>{lang === 'en' ? 'Model Evaluation Reports & Visual Analytics' : 'मॉडल मूल्यांकन रिपोर्ट एवं विज़ुअल ग्राफ'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {lang === 'en' 
                    ? 'Official training curves and holdout test confusion matrix generated in /reports and /notebooks/reports'
                    : '/reports एवं /notebooks/reports से आधिकारिक प्रशिक्षण कर्व्स एवं 38x38 कन्फ्यूजन मैट्रिक्स'}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                97.4% Test Accuracy
              </span>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="text-3xl font-black text-emerald-800 font-mono">97.4%</div>
                <div className="text-xs font-bold text-emerald-900 uppercase">Test Set Accuracy</div>
                <p className="text-[11px] text-emerald-700">8,146 Holdout test images evaluated</p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-1">
                <div className="text-3xl font-black text-teal-800 font-mono">&lt; 40 ms</div>
                <div className="text-xs font-bold text-teal-900 uppercase">Inference Speed (CPU)</div>
                <p className="text-[11px] text-teal-700">MobileNetV2 single forward pass</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
                <div className="text-3xl font-black text-slate-800 font-mono">100%</div>
                <div className="text-xs font-bold text-slate-700 uppercase">Grad-CAM Coverage</div>
                <p className="text-[11px] text-slate-600">Real-time gradient-weighted activation</p>
              </div>
            </div>

            {/* Reports Images Gallery: Confusion Matrix & Training Curves */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Image 1: Training & Validation Curves */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {lang === 'en' ? 'Training & Validation Curves' : 'प्रशिक्षण एवं सत्यापन कर्व्स'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">/notebooks/reports/training_curves.png</p>
                  </div>
                  <button
                    onClick={() => setModalImage({
                      src: '/reports/training_curves.png',
                      title: 'Training & Validation Accuracy/Loss Progression',
                      subtitle: 'Loss minimization and categorical accuracy convergence over 10 epochs on Kaggle Dual Tesla T4 GPUs'
                    })}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Enlarge Image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setModalImage({
                    src: '/reports/training_curves.png',
                    title: 'Training & Validation Accuracy/Loss Progression',
                    subtitle: 'Loss minimization and categorical accuracy convergence over 10 epochs on Kaggle Dual Tesla T4 GPUs'
                  })}
                  className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer group relative aspect-video flex items-center justify-center shadow-inner text-left p-0 focus:outline-hidden"
                >
                  <img 
                    src="/reports/training_curves.png" 
                    alt="Training and Validation Curves" 
                    className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-bold transition-opacity">
                      Click to Enlarge
                    </span>
                  </div>
                </button>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'en'
                    ? 'Visualizes model convergence over epochs. The validation loss tracks training loss without divergent generalization gaps, proving strong resistance to overfitting.'
                    : 'प्रशिक्षण और सत्यापन हानि में लगातार गिरावट दर्शाती है कि मॉडल ओवरफिटिंग से सुरक्षित है और नए नमूनों पर भी सटीक परिणाम देता है।'}
                </p>
              </div>

              {/* Image 2: Multi-Class Confusion Matrix */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {lang === 'en' ? '38-Class Confusion Matrix' : '38-श्रेणी कन्फ्यूजन मैट्रिक्स'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">/notebooks/reports/confusion_matrix.png</p>
                  </div>
                  <button
                    onClick={() => setModalImage({
                      src: '/reports/confusion_matrix.png',
                      title: '38-Class Holdout Test Confusion Matrix',
                      subtitle: 'Per-class classification fidelity evaluated on 8,146 unseen test holdout foliage images'
                    })}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Enlarge Image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setModalImage({
                    src: '/reports/confusion_matrix.png',
                    title: '38-Class Holdout Test Confusion Matrix',
                    subtitle: 'Per-class classification fidelity evaluated on 8,146 unseen test holdout foliage images'
                  })}
                  className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer group relative aspect-video flex items-center justify-center shadow-inner text-left p-0 focus:outline-hidden"
                >
                  <img 
                    src="/reports/confusion_matrix.png" 
                    alt="Confusion Matrix" 
                    className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-bold transition-opacity">
                      Click to Enlarge
                    </span>
                  </div>
                </button>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'en'
                    ? 'Heatmap across 38 classes showing strong diagonal density. Minor off-diagonal misclassifications occur only between visually identical early-stage viral leaf symptoms.'
                    : '38x38 मैट्रिक्स में मजबूत विकर्ण (diagonal) दर्शाता है कि मॉडल प्रत्येक रोग श्रेणी को अत्यधिक उच्च सटीकता के साथ अलग-अलग पहचानता है।'}
                </p>
              </div>

            </div>

            {/* Artifacts Summary Table */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-slate-900 text-sm">Downloadable Training Artifacts (ml/models/)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-800 font-bold">crop_disease_model.keras</span>
                  <span className="text-slate-500">Trained Keras 3.x Weights (~14 MB)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-800 font-bold">class_names.json</span>
                  <span className="text-slate-500">38 Index-to-Pathology Map</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-800 font-bold">test_summary.json</span>
                  <span className="text-slate-500">Test Accuracy & Loss Metrics</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-800 font-bold">per_class_metrics.csv</span>
                  <span className="text-slate-500">Precision, Recall & F1 per Class</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Modal */}
      {modalImage && (
        <div 
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[95vh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  {modalImage.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{modalImage.subtitle}</p>
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl p-2 flex items-center justify-center border border-slate-200">
              <img 
                src={modalImage.src} 
                alt={modalImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <a
                href={modalImage.src}
                download
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Download Full Resolution Image' : 'फुल रिज़ॉल्यूशन फोटो डाउनलोड करें'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
