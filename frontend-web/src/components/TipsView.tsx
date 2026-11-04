import React, { useState } from 'react';
import { 
  Sprout, 
  CloudSun, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar,
  Filter
} from 'lucide-react';
import { FarmingTip } from '../types';

interface TipsViewProps {
  lang: 'en' | 'hi';
}

const BILINGUAL_TIPS: FarmingTip[] = [
  // 1. Paddy / Rice Seed Planting
  {
    id: 1,
    category: 'Seed Sowing & Varieties',
    category_hi: 'बीज बुवाई एवं उन्नत किस्में',
    title: 'Monsoon Paddy (Dhan) High-Yield Seed Selection & Treatment',
    title_hi: 'मानसून धान की अधिक उपज देने वाली किस्में एवं बीजोपचार',
    season: 'Kharif (June - July)',
    season_hi: 'खरीफ (जून - जुलाई)',
    weather_condition: 'Onset of Monsoon rains, Soil temp 25-32°C, High relative humidity (>80%)',
    weather_condition_hi: 'मानसून की पहली बारिश, मिट्टी का तापमान 25-32°C, उच्च आर्द्रता (>80%)',
    recommended_seeds: 'Swarna (MTU 7029), IR-64, MTU 1010, Mahamaya, Sambha Mahsuri',
    recommended_seeds_hi: 'स्वर्णा (एमटीयू 7029), आईआर-64, एमटीयू 1010, महामाया, साम्भा महसूरी',
    seed_treatment: 'Soak seeds in 17% brine solution to discard floating light seeds. Treat with Carbendazim (2g/kg) or Trichoderma viride (10g/kg) to eliminate seed-borne Blast and Brown Spot fungi.',
    seed_treatment_hi: 'बीजों को 17% नमक के घोल में डालकर हल्के बीज अलग करें। इसके बाद कार्बेन्डाजिम (2 ग्राम/किग्रा) या ट्राइकोडर्मा विरिडी (10 ग्राम/किग्रा) से उपचारित करें ताकि शीथ ब्लास्ट और भूरे धब्बे रोग से बचाव हो सके।',
    content: 'Optimal transplanting age is 21-25 days. Maintain 2-3 seedlings per hill with 20×15 cm spacing. Sowing at the right soil saturation level ensures maximum tillering and root anchorage.',
    content_hi: 'पौध रोपाई के लिए 21-25 दिन की पौध सर्वोत्तम है। प्रति थान 2-3 पौधे लगाएं और 20×15 सेमी की दूरी रखें। उचित नमी में रोपाई से अधिक कल्ले फूटते हैं।'
  },

  // 2. Potato Planting
  {
    id: 2,
    category: 'Seed Sowing & Varieties',
    category_hi: 'बीज बुवाई एवं उन्नत किस्में',
    title: 'Winter Potato (Aloo) Certified Tuber Selection & Blight Defense',
    title_hi: 'शीतकालीन आलू बुवाई: प्रमाणित कंद चयन एवं झुलसा रोग से सुरक्षा',
    season: 'Rabi (October - November)',
    season_hi: 'रबी (अक्टूबर - नवंबर)',
    weather_condition: 'Day temp 24-28°C, Night temp 14-18°C, Well-drained sandy loam soil',
    weather_condition_hi: 'दिन का तापमान 24-28°C, रात का 14-18°C, उचित जल निकास वाली बलुई दोमट मिट्टी',
    recommended_seeds: 'Kufri Jyoti, Kufri Pukhraj, Kufri Sindhuri, Kufri Bahar',
    recommended_seeds_hi: 'कुफरी ज्योति, कुफरी पुखराज, कुफरी सिंदूरी, कुफरी बहार',
    seed_treatment: 'Cut certified seed tubers having 2-3 active sprouts (eyes). Dip cut pieces in Mancozeb 75% WP (2.5g per liter of water) for 10 minutes and dry in shade before planting to stop Late Blight fungal spores.',
    seed_treatment_hi: 'कम से कम 2-3 आंख वाले प्रमाणित कंद काटें। कटाई के बाद मैन्कोजेब 75% WP (2.5 ग्राम प्रति लीटर पानी) के घोल में 10 मिनट डुबोकर छाया में सुखाएं ताकि अगेती व पछेती झुलसा का संक्रमण न फैले।',
    content: 'Plant at a depth of 7-8 cm on ridges spaced 60 cm apart with 20 cm plant-to-plant distance. Do not overwater; ridge soil should be crumbly and moist without waterlogging.',
    content_hi: 'मेड़ों पर 7-8 सेमी की गहराई पर 60 सेमी कतार से कतार और 20 सेमी पौधे से पौधे की दूरी पर लगाएं। अधिक पानी देने से बचें; जलभराव से कंद सड़न होती है।'
  },

  // 3. Wheat Sowing
  {
    id: 3,
    category: 'Seed Sowing & Varieties',
    category_hi: 'बीज बुवाई एवं उन्नत किस्में',
    title: 'Winter Wheat (Gehun) Sowing Window & Seed Inoculation',
    title_hi: 'गेहूं बुवाई: अनुकूल तापमान, उन्नत बीज एवं जीवाणु टीकाकरण',
    season: 'Rabi (November - Early December)',
    season_hi: 'रबी (नवंबर - दिसंबर प्रथम सप्ताह)',
    weather_condition: 'Moderate cool weather, Daily mean temp 20-22°C for rapid germination',
    weather_condition_hi: 'हल्की ठंड, अंकुरण हेतु दैनिक औसत तापमान 20-22°C',
    recommended_seeds: 'GW-322, Sharbati Lokwan, HD-2967, PBW-502, WH-1105',
    recommended_seeds_hi: 'जीडब्ल्यू-322, शरबती लोकवान, एचडी-2967, पीबीडब्ल्यू-502, डब्ल्यूएच-1105',
    seed_treatment: 'Inoculate seed with Azotobacter and Phosphate Solubilizing Bacteria (PSB) @ 20g/kg seed. Treat with Carboxin + Thiram (2g/kg) to prevent Loose Smut and Flag Smut.',
    seed_treatment_hi: 'बीजों को एजोटोबैक्टर और पीएसबी कल्चर (20 ग्राम/किग्रा) से उपचारित करें। कंडुआ (Loose Smut) रोग की रोकथाम के लिए कार्बोक्सिन + थीरम (2 ग्राम/किग्रा) से उपचार अवश्य करें।',
    content: 'Sow at 4-5 cm depth using seed-cum-fertilizer drill. Sowing later than December 15th drops yield by 35-40 kg/ha per day due to terminal heat stress during grain filling.',
    content_hi: 'सीड ड्रिल से 4-5 सेमी की गहराई पर बुवाई करें। 15 दिसंबर के बाद बुवाई करने पर दाना पकते समय पछुआ गर्म हवाओं के कारण पैदावार 35-40 किग्रा/हेक्टेयर प्रतिदिन घट जाती है।'
  },

  // 4. Tomato Nursery & Transplanting
  {
    id: 4,
    category: 'Seed Sowing & Varieties',
    category_hi: 'बीज बुवाई एवं उन्नत किस्में',
    title: 'Tomato (Tamatar) Hybrid Nursery & Bacterial Wilt Prevention',
    title_hi: 'टमाटर की नर्सरी: उन्नत संकर बीज एवं जीवाणु उकठा रोग से बचाव',
    season: 'All Seasons (Best: Aug - Nov / Jan - Feb)',
    season_hi: 'सभी मौसम (सर्वोत्तम: अगस्त - नवंबर / जनवरी - फरवरी)',
    weather_condition: 'Mild sunny days, 20-28°C canopy temperature, moderate humidity',
    weather_condition_hi: 'खुला धूप वाला मौसम, 20-28°C तापमान, मध्यम आर्द्रता',
    recommended_seeds: 'Pusa Ruby, Pusa Early Dwarf, Syngenta Abhinav, US-440, NS-501',
    recommended_seeds_hi: 'पूसा रूबी, पूसा अर्ली ड्वार्फ, सिंजेंटा अभिनव, यूएस-440, एनएस-501',
    seed_treatment: 'Treat hybrid seeds with Thiram (2.5g/kg) and bio-agent Pseudomonas fluorescens (10g/kg). Drench nursery bed with Trichoderma viride to prevent Damping-Off disease.',
    seed_treatment_hi: 'संकर बीजों को थीरम (2.5 ग्राम/किग्रा) और स्यूडोमोनास फ्लोरेसेंस (10 ग्राम/किग्रा) से उपचारित करें। नर्सरी की क्यारियों में आर्द्रगलन (डैम्पिंग-ऑफ) से बचाव हेतु ट्राइकोडर्मा का घोल डालें।',
    content: 'Prepare raised nursery beds 15 cm above ground level. Transplant 25-30 day old healthy seedlings with 60×45 cm spacing on ridges. Staking with bamboo sticks prevents soil-borne fruit rot.',
    content_hi: 'जमीन से 15 सेमी ऊंची उठी हुई नर्सरी क्यारियां बनाएं। 25-30 दिन पुराने स्वस्थ पौधों की रोपाई 60×45 सेमी की दूरी पर करें। बांस के सहारे बांधने से फल सड़न से बचते हैं।'
  },

  // 5. Soybean Sowing
  {
    id: 5,
    category: 'Seed Sowing & Varieties',
    category_hi: 'बीज बुवाई एवं उन्नत किस्में',
    title: 'Soybean Rainfed Sowing & Rhizobium Inoculation',
    title_hi: 'सोयाबीन बुवाई: वर्षा आधारित बुवाई एवं राइजोबियम कल्चर',
    season: 'Kharif (Late June - Early July)',
    season_hi: 'खरीफ (जून अंत - जुलाई प्रथम सप्ताह)',
    weather_condition: 'Accumulated rainfall of 75-100 mm, Soil moist up to 10 cm depth',
    weather_condition_hi: '75-100 मिमी वर्षा के बाद, मिट्टी में 10 सेमी गहराई तक पर्याप्त नमी',
    recommended_seeds: 'JS-335, JS-95-60, JS-20-29, NRC-37',
    recommended_seeds_hi: 'जेएस-335, जेएस-95-60, जेएस-20-29, एनआरसी-37',
    seed_treatment: 'Treat seeds sequentially with FIR protocol (Fungicide: Thiram + Carbendazim @ 2g/kg, Insecticide: Thiamethoxam 30FS @ 3ml/kg, Rhizobium japonicum culture @ 5g/kg).',
    seed_treatment_hi: 'एफआईआर (FIR) क्रम में उपचार करें: पहले कवकनाशी (थीरम + कार्बेन्डाजिम 2 ग्राम), फिर कीटनाशी (थियामेथोक्सम 3 मिली), और अंत में राइजोबियम कल्चर (5 ग्राम/किग्रा)।',
    content: 'Do not sow deeper than 3-4 cm as soybean cotyledons cannot emerge from hard crusted deep soil. Maintain 45 cm row spacing with 70-80 kg/ha seed rate.',
    content_hi: 'बीज को 3-4 सेमी से अधिक गहरा न बोएं अन्यथा अंकुरण बाधित होगा। 45 सेमी कतार दूरी तथा 70-80 किग्रा प्रति हेक्टेयर बीज दर रखें।'
  },

  // 6. Corn / Maize Sowing
  {
    id: 6,
    category: 'Seed Sowing & Varieties',
    category_hi: 'बीज बुवाई एवं उन्नत किस्में',
    title: 'Corn (Makka) Hybrid Sowing & Stem Borer / Rust Protection',
    title_hi: 'मक्का संकर बुवाई: तना छेदक कीट एवं रतुआ रोग से रोकथाम',
    season: 'Kharif & Rabi (June - July / Oct - Nov)',
    season_hi: 'खरीफ एवं रबी (जून - जुलाई / अक्टूबर - नवंबर)',
    weather_condition: 'Warm weather 22-30°C, Good drainage (Maize cannot tolerate waterlogging even for 12 hours)',
    weather_condition_hi: 'गर्म मौसम 22-30°C, उत्तम जल निकासी (मक्का 12 घंटे भी जलभराव सहन नहीं कर सकता)',
    recommended_seeds: 'Ganga 11, HQPM-1, Bio-9681, Pioneer P3396, DKC 9108',
    recommended_seeds_hi: 'गंगा 11, एचक्यूपीएम-1, बायो-9681, पायनियर पी3396, डीकेसी 9108',
    seed_treatment: 'Coat hybrid seeds with Imidacloprid 70WS (5g/kg) and Metalaxyl 35WS (2g/kg) to protect emerging shoots from shoot fly and downy mildew.',
    seed_treatment_hi: 'संकर बीजों को इमिडाक्लोप्रिड 70WS (5 ग्राम/किग्रा) और मेटालेक्सिल 35WS (2 ग्राम/किग्रा) से उपचारित करें ताकि तना मक्खी व तुलासिता रोग से सुरक्षा मिले।',
    content: 'Maintain 60 cm between rows and 20 cm between plants. Apply zinc sulphate (25 kg/ha) at field preparation to prevent white bud physiological disorder.',
    content_hi: 'कतार से कतार 60 सेमी और पौधे से पौधे 20 सेमी की दूरी रखें। खेत की तैयारी के समय जिंक सल्फेट (25 किग्रा/हेक्टेयर) अवश्य डालें ताकि सफेद कली रोग न हो।'
  },

  // 7. Blight Prevention Protocol
  {
    id: 7,
    category: 'Pathology & Blight Defense',
    category_hi: 'रोग निदान एवं झुलसा प्रबंधन',
    title: 'Drip Irrigation vs Overhead Sprinklers for Blight Spore Suppression',
    title_hi: 'ड्रिप सिंचाई बनाम फव्वारा सिंचाई: झुलसा कवक से बचाव',
    season: 'All Seasons',
    season_hi: 'सभी मौसम',
    weather_condition: 'High relative humidity (>75%), Cool mornings with heavy dew',
    weather_condition_hi: 'अधिक आर्द्रता (>75%), भारी ओस वाली ठंडी सुबह',
    recommended_seeds: 'Not Applicable (Water Management Protocol)',
    recommended_seeds_hi: 'लागू नहीं (सिंचाई प्रबंधन प्रोटोकॉल)',
    seed_treatment: 'Keep foliage lamina completely dry. Water only at the soil root-zone.',
    seed_treatment_hi: 'पत्तियों की सतह को सूखा रखें। पानी केवल पौधे की जड़ क्षेत्र में दें।',
    content: 'Fungal spores of Alternaria (Early Blight) and Phytophthora (Late Blight) require a film of free water on leaf surfaces for 4-6 hours to germinate. Drip irrigation keeps foliage completely dry, cutting fungal pathogen incidence by up to 60%.',
    content_hi: 'अगेती झुलसा (अल्टरनेरिया) और पछेती झुलसा (फाइटोफ्थोरा) के कवक बीजाणुओं को अंकुरित होने के लिए पत्ती पर 4-6 घंटे तक पानी की परत चाहिए होती है। ड्रिप सिंचाई से पत्तियां सूखी रहती हैं और संक्रमण 60% तक कम हो जाता है।'
  },

  // 8. Organic Neem Spray
  {
    id: 8,
    category: 'Organic Pest & Disease Control',
    category_hi: 'जैविक कीट एवं रोग नियंत्रण',
    title: 'Cold-Pressed Neem Oil Emulsion Formulation (1500 PPM)',
    title_hi: 'कोल्ड-प्रेस्ड नीम तेल इमल्शन (1500 PPM) बनाने की प्रामाणिक विधि',
    season: 'Vegetative & Flowering',
    season_hi: 'वानस्पतिक वृद्धि एवं फूल अवस्था',
    weather_condition: 'Calm morning (6:30 - 8:30 AM) or sunset (5:00 - 6:30 PM), Wind < 8 km/h',
    weather_condition_hi: 'शांत सुबह (6:30 - 8:30 बजे) या शाम ढलते समय (5:00 - 6:30 बजे), हवा < 8 किमी/घंटा',
    recommended_seeds: 'Natural Botanical Biopesticide',
    recommended_seeds_hi: 'प्राकृतिक वानस्पतिक जैव कीटनाशक',
    seed_treatment: 'Foliar Spray Solution for Leaves',
    seed_treatment_hi: 'पत्तियों पर छिड़काव हेतु जैव घोल',
    content: 'Mix 5ml pure cold-pressed neem oil (1500 ppm Azadirachtin) with 1ml liquid bio-soap in 1 liter of lukewarm water. Vigorously shake until a milky uniform emulsion forms. Spray undersides of leaves where aphids, whiteflies, and fungal spores colonize.',
    content_hi: '1 लीटर गुनगुने पानी में 5 मिली शुद्ध नीम का तेल (1500 ppm एजाडिराक्टिन) और 1 मिली तरल साबुन मिलाएं। अच्छी तरह हिलाकर दूधिया घोल बनाएं। पत्तियों के नीचे के हिस्से पर विशेष रूप से छिड़काव करें।'
  },

  // 9. Balanced NPK Fertigation
  {
    id: 9,
    category: 'Soil & Canopy Nutrition',
    category_hi: 'मृदा स्वास्थ्य एवं पोषण प्रबंधन',
    title: 'Balanced Potassium (K) to Thicken Cuticle vs Nitrogen Overuse',
    title_hi: 'पोटेशियम द्वारा पत्ती की त्वचा को मजबूत करना बनाम अत्यधिक यूरिया का खतरा',
    season: 'Vegetative Stage',
    season_hi: 'वृद्धि अवस्था',
    weather_condition: 'Cloudy overcast periods with high humidity',
    weather_condition_hi: 'बादल छाए रहने और अधिक नमी वाले दिन',
    recommended_seeds: 'Muriate of Potash (MOP / 0:0:60) & SOP (0:0:50)',
    recommended_seeds_hi: 'म्यूरेट ऑफ पोटाश (MOP) एवं सल्फेट ऑफ पोटाश (SOP)',
    seed_treatment: 'Soil application at basal / top dressing',
    seed_treatment_hi: 'बुवाई के समय आधारभूत या कल्ले फूटते समय उपयोग',
    content: 'Excessive urea/nitrogen fertilizer causes lush, tender vegetative foliage with thin cuticular wax that is easily pierced by fungal haustoria. Applying balanced Potassium (K) thickens epidermis cell walls, creating mechanical resistance against pathogen invasion.',
    content_hi: 'अत्यधिक यूरिया डालने से पत्तियां बहुत कोमल व रसीली हो जाती हैं, जिससे फफूंद के बीजाणु आसानी से छेद कर अंदर घुस जाते हैं। पोटाश (K) डालने से पत्तियों की बाहरी त्वचा मोटी व कठोर बनती है जो रोगों से प्राकृतिक कवच देती है।'
  }
];

export const TipsView: React.FC<TipsViewProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = lang === 'en' 
    ? ['All', 'Seed Sowing & Varieties', 'Pathology & Blight Defense', 'Organic Pest & Disease Control', 'Soil & Canopy Nutrition']
    : ['सभी', 'बीज बुवाई एवं उन्नत किस्में', 'रोग निदान एवं झुलसा प्रबंधन', 'जैविक कीट एवं रोग नियंत्रण', 'मृदा स्वास्थ्य एवं पोषण प्रबंधन'];

  const filteredTips = BILINGUAL_TIPS.filter((tip) => {
    const catMatch = selectedCategory === 'All' || selectedCategory === 'सभी' 
      ? true 
      : (tip.category === selectedCategory || tip.category_hi === selectedCategory);
    
    const query = search.toLowerCase();
    const textMatch = 
      tip.title.toLowerCase().includes(query) ||
      (tip.title_hi && tip.title_hi.includes(query)) ||
      tip.content.toLowerCase().includes(query) ||
      (tip.content_hi && tip.content_hi.includes(query)) ||
      (tip.recommended_seeds && tip.recommended_seeds.toLowerCase().includes(query));

    return catMatch && textMatch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 mb-3 border border-white/10">
            <Sprout className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Weather-Guided Agronomic Wisdom' : 'मौसम आधारित वैज्ञानिक कृषि परामर्श'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight">
            {lang === 'en' ? 'Crop Sowing & Agricultural Advisory' : 'फसल बुवाई, बीज चयन एवं रोग रोकथाम निर्देशिका'}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 leading-relaxed">
            {lang === 'en'
              ? 'Weather-driven seed selection, certified variety guides, fungicidal seed treatments, and holistic organic disease suppression protocols.'
              : 'मौसम के अनुसार कौन सा बीज खेत में लगाएं, प्रमाणित किस्में, बुवाई से पहले बीजोपचार और जैविक रोग रोकथाम के वैज्ञानिक तरीके।'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center shrink-0">
          <div>
            <div className="text-2xl font-black text-emerald-300">9+</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
              {lang === 'en' ? 'Agronomic Guides' : 'कृषि मार्गदर्शिका'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'en' ? 'Filter by Topic:' : 'श्रेणी अनुसार देखें:'}</span>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search crop, seed, or disease...' : 'फसल, बीज या रोग खोजें...'}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Badge Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {lang === 'en' ? tip.category : (tip.category_hi || tip.category)}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {lang === 'en' ? tip.season : (tip.season_hi || tip.season)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                {lang === 'en' ? tip.title : (tip.title_hi || tip.title)}
              </h3>

              {/* Weather & Soil Conditions Required */}
              {tip.weather_condition && (
                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-950 space-y-1">
                  <b className="font-bold flex items-center gap-1.5 text-sky-900">
                    <CloudSun className="w-3.5 h-3.5 text-sky-700" />
                    <span>{lang === 'en' ? 'Ideal Weather & Soil Moisture Condition:' : 'अनुकूल मौसम एवं मृदा नमी स्थिति:'}</span>
                  </b>
                  <p>{lang === 'en' ? tip.weather_condition : (tip.weather_condition_hi || tip.weather_condition)}</p>
                </div>
              )}

              {/* Certified Seed Varieties (for Seed Tips) */}
              {tip.recommended_seeds && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                  <b className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'en' ? 'Recommended Certified Varieties / Seeds:' : 'अनुशंसित उन्नत बीज एवं किस्में:'}</span>
                  </b>
                  <p className="font-semibold text-emerald-800">
                    {lang === 'en' ? tip.recommended_seeds : (tip.recommended_seeds_hi || tip.recommended_seeds)}
                  </p>
                </div>
              )}

              {/* Seed Treatment Protocol */}
              {tip.seed_treatment && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100 text-xs text-amber-950 space-y-1">
                  <b className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>{lang === 'en' ? 'Seed Treatment Before Sowing (Biocontrol & Fungicide):' : 'बुवाई पूर्व बीजोपचार विधि:'}</span>
                  </b>
                  <p>{lang === 'en' ? tip.seed_treatment : (tip.seed_treatment_hi || tip.seed_treatment)}</p>
                </div>
              )}

              {/* Main Content Body */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {lang === 'en' ? tip.content : (tip.content_hi || tip.content)}
              </p>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {lang === 'en' ? 'ICAR / Agronomic Certified' : 'प्रमाणित कृषि वैज्ञानिक अनुशंसा'}
              </span>
              <span>ID: #{tip.id}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
