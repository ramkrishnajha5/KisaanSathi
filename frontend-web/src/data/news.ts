export interface AgriNewsArticle {
  id: string;
  category: {
    en: string;
    hi: string;
  };
  title: {
    en: string;
    hi: string;
  };
  summary: {
    en: string;
    hi: string;
  };
  details: {
    en: string;
    hi: string;
  };
  source: {
    en: string;
    hi: string;
  };
  date: {
    en: string;
    hi: string;
  };
  readTime: {
    en: string;
    hi: string;
  };
  badgeColor: string;
  iconType: 'scheme' | 'weather' | 'mandi' | 'pest' | 'tech' | 'seed';
}

export const AGRI_NEWS_ARTICLES: AgriNewsArticle[] = [
  {
    id: 'news-01',
    category: {
      en: 'Government Scheme',
      hi: 'सरकारी योजना'
    },
    title: {
      en: 'PM-Kisan 19th Installment of ₹2,000 Transferred to 9.5 Crore Farmers',
      hi: 'पीएम किसान सम्मान निधि: 9.5 करोड़ किसानों के बैंक खातों में ₹2,000 की 19वीं किस्त जारी'
    },
    summary: {
      en: 'Direct Benefit Transfer (DBT) worth ₹20,000 crore credited directly into Aadhaar-linked bank accounts of verified beneficiaries nationwide.',
      hi: 'देश भर के सत्यापित पात्र किसान परिवारों के बैंक खातों में डीबीटी के जरिए ₹20,000 करोड़ से अधिक की धनराशि सीधे स्थानांतरित की गई।'
    },
    details: {
      en: 'The Ministry of Agriculture has confirmed the disbursement of the 19th instalment under the Pradhan Mantri Kisan Samman Nidhi. Eligible farmers who have completed their e-KYC, land record verification, and bank Aadhaar-seeding received ₹2,000 directly. Farmers facing transaction issues can check their status on the PM-Kisan portal or visit their local CSC center.',
      hi: 'कृषि एवं किसान कल्याण मंत्रालय ने पीएम-किसान की 19वीं किस्त जारी कर दी है। जिन किसानों ने ई-केवाईसी और भूमि अभिलेख सत्यापन पूरा कर लिया है, उनके खातों में ₹2,000 जमा किए गए हैं। किसान भाई पीएम किसान पोर्टल पर "नो योर स्टेटस" विकल्प से अपनी किस्त की स्थिति जांच सकते हैं।'
    },
    source: {
      en: 'Ministry of Agriculture & Farmers Welfare',
      hi: 'कृषि एवं किसान कल्याण मंत्रालय'
    },
    date: {
      en: 'Today, 09:30 AM',
      hi: 'आज, सुबह 09:30'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconType: 'scheme'
  },
  {
    id: 'news-02',
    category: {
      en: 'Mandi & MSP',
      hi: 'मंडी एवं एमएसपी'
    },
    title: {
      en: 'Cabinet Approves Higher MSP for Kharif Crops: Paddy at ₹2,300/qtl, Soybean at ₹4,892/qtl',
      hi: 'कैबिनेट ने खरीफ फसलों के समर्थन मूल्य में की वृद्धि: धान ₹2,300 और सोयाबीन ₹4,892 प्रति क्विंटल'
    },
    summary: {
      en: 'The Cabinet Committee on Economic Affairs announced updated Minimum Support Prices offering up to 50% profit over cost of production.',
      hi: 'आर्थिक मामलों की कैबिनेट समिति ने खरीफ सत्र के लिए न्यूनतम समर्थन मूल्य (MSP) में वृद्धि की, जिससे किसानों को लागत पर 50% तक का लाभ मिलेगा।'
    },
    details: {
      en: 'To ensure remunerative prices for growers and encourage crop diversification, the central government has hiked the MSP for 14 Kharif crops. Paddy common grade will now be procured at ₹2,300 per quintal while Grade A paddy is fixed at ₹2,320. Oilseeds such as Soybean and pulses such as Arhar/Tur have also seen significant price enhancements.',
      hi: 'किसानों की आय बढ़ाने और दलहन-तिलहन की खेती को बढ़ावा देने के लिए 14 खरीफ फसलों के न्यूनतम समर्थन मूल्य में बढ़ोतरी की गई है। सामान्य धान ₹2,300/क्विंटल और ग्रेड-ए धान ₹2,320/क्विंटल के भाव से सरकारी मंडियों में खरीदा जाएगा। अरहर और उड़द के समर्थन मूल्य में भी विशेष इजाफा किया गया है।'
    },
    source: {
      en: 'Press Information Bureau (PIB)',
      hi: 'प्रेस सूचना ब्यूरो (पीआईबी)'
    },
    date: {
      en: 'Yesterday',
      hi: 'कल'
    },
    readTime: {
      en: '3 min read',
      hi: '3 मिनट पठन'
    },
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    iconType: 'mandi'
  },
  {
    id: 'news-03',
    category: {
      en: 'Weather Alert',
      hi: 'मौसम चेतावनी'
    },
    title: {
      en: 'IMD Alert: Unseasonal Rain and Gusty Winds Predicted in Chhattisgarh & Central Plains',
      hi: 'मौसम विभाग का अलर्ट: छत्तीसगढ़ और मध्य भारत के मैदानी भागों में बेमौसम बारिश व आंधी का अनुमान'
    },
    summary: {
      en: 'Western disturbance triggers isolated thunderstorm warnings for Bilaspur, Raipur, and Durg; farmers advised to cover open grain piles.',
      hi: 'पश्चिमी विक्षोभ के चलते बिलासपुर, रायपुर और दुर्ग संभाग में गरज-चमक के साथ बारिश का अलर्ट; कटी फसल और अनाज को तिरपाल से ढकने की सलाह।'
    },
    details: {
      en: 'The India Meteorological Department (IMD) has issued a yellow alert for Central India due to cyclonic circulation over east Madhya Pradesh and Chhattisgarh. Farmers engaged in vegetable harvesting (tomatoes, chillies, potatoes) are advised to pause chemical foliar spraying for the next 48 hours to avoid chemical wash-off and prevent fruit cracking.',
      hi: 'भारतीय मौसम विज्ञान विभाग (IMD) ने पूर्वी मध्य प्रदेश और छत्तीसगढ़ के ऊपर चक्रवाती परिसंचरण के कारण येलो अलर्ट जारी किया है। किसानों को सलाह दी गई है कि वे अगले 48 घंटों तक किसी भी प्रकार के कीटनाशक छिड़काव से बचें ताकि दवा पानी में बह न जाए, और खेतों में जल निकासी की उचित व्यवस्था रखें।'
    },
    source: {
      en: 'IMD Mausam Weather Service',
      hi: 'भारतीय मौसम विज्ञान विभाग (IMD)'
    },
    date: {
      en: '3 hours ago',
      hi: '3 घंटे पहले'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    iconType: 'weather'
  },
  {
    id: 'news-04',
    category: {
      en: 'Seed Innovation',
      hi: 'उन्नत बीज'
    },
    title: {
      en: 'ICAR Releases 5 New Climate-Resilient & Disease-Resistant Wheat and Paddy Varieties',
      hi: 'भा.कृ.अनु.प. (ICAR) ने जारी की गेहूं और धान की 5 नई जलवायु-सहनशील व रोगरोधी किस्में'
    },
    summary: {
      en: 'Breeding breakthroughs offer genetic resistance to bacterial leaf blight, yellow rust, and tolerance to terminal heat during grain filling.',
      hi: 'अनुसंधान केंद्र द्वारा विकसित नई किस्में जीवाणु झुलसा और पीला रतुआ रोग के प्रति प्रतिरोधी हैं और तेज धूप में भी दाने सिकुड़ने नहीं देतीं।'
    },
    details: {
      en: 'The Indian Council of Agricultural Research has notified high-yielding varieties including DBW-327 (Wheat) and Pusa Basmati 1847 (Paddy with dual resistance to blast and bacterial blight). These varieties reduce pesticide dependence by over 30% and ensure steady yields even during abrupt pre-harvest temperature spikes.',
      hi: 'भारतीय कृषि अनुसंधान संस्थान द्वारा डीबीडब्ल्यू-327 (गेहूं) और पूसा बासमती 1847 जैसी किस्में जारी की गई हैं। इन किस्मों में ब्लास्ट और बैक्टीरियल ब्लाइट से लड़ने की प्राकृतिक क्षमता है, जिससे किसानों का दवाइयों पर होने वाला खर्च लगभग 30% तक कम हो जाता है।'
    },
    source: {
      en: 'ICAR Research Directorate',
      hi: 'भारतीय कृषि अनुसंधान परिषद (ICAR)'
    },
    date: {
      en: '2 days ago',
      hi: '2 दिन पहले'
    },
    readTime: {
      en: '3 min read',
      hi: '3 मिनट पठन'
    },
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    iconType: 'seed'
  },
  {
    id: 'news-05',
    category: {
      en: 'Agri-Tech & Drones',
      hi: 'कृषि तकनीक'
    },
    title: {
      en: 'Up to 50% Subsidy Approved on Kisan Drones for Spraying and Canopy Scouting',
      hi: 'फसल छिड़काव और ड्रोन से निगरानी हेतु किसान ड्रोन पर 50% तक सरकारी सब्सिडी'
    },
    summary: {
      en: 'Sub-Mission on Agricultural Mechanization (SMAM) allocates funds for Farmer Producer Organizations (FPOs) and rural youth.',
      hi: 'कृषि यंत्रीकरण उप-मिशन के तहत किसान उत्पादक संगठनों (FPO) और ग्रामीण युवाओं को ड्रोन खरीद पर ₹5 लाख तक का वित्तीय अनुदान।'
    },
    details: {
      en: 'Under the Drone Shakti mission, certified agricultural spraying drones equipped with ultra-low volume (ULV) nozzles are being subsidized. Drones can spray one acre of paddy or potato field in just 7 minutes using 90% less water than traditional knapsack sprayers, protecting farm labor from hazardous pesticide exposure.',
      hi: 'ड्रोन शक्ति पहल के तहत 10 लीटर क्षमता वाले कृषि ड्रोन को बढ़ावा दिया जा रहा है। ड्रोन की सहायता से मात्र 7 मिनट में एक एकड़ खेत में कीटनाशक व सूक्ष्म पोषक तत्वों का छिड़काव हो जाता है। इससे पानी की 90% बचत होती है और किसान रासायनिक विषैलेपन के जोखिम से सुरक्षित रहते हैं।'
    },
    source: {
      en: 'Department of Agriculture & Farmers Welfare',
      hi: 'कृषि विभाग एवं भारत सरकार'
    },
    date: {
      en: '3 days ago',
      hi: '3 दिन पहले'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    iconType: 'tech'
  },
  {
    id: 'news-06',
    category: {
      en: 'State Agriculture',
      hi: 'राज्य कृषि समाचार'
    },
    title: {
      en: 'Chhattisgarh Registers Record 145 Lakh MT Paddy Procurement Across Mandis',
      hi: 'छत्तीसगढ़ में 145 लाख मीट्रिक टन धान की ऐतिहासिक खरीदी, किसानों को सीधा भुगतान'
    },
    summary: {
      en: 'Over 25 lakh farmers benefited from seamless electronic weighment and DBT credits under state agrarian procurement centers.',
      hi: '25 लाख से अधिक पंजीकृत किसानों को इलेक्ट्रॉनिक तौल और बायोमेट्रिक सत्यापन के माध्यम से समर्थन मूल्य का समयबद्ध लाभ दिया गया।'
    },
    details: {
      en: 'Food and Civil Supplies departments in Chhattisgarh reported historic procurement figures with primary agricultural credit societies (PACS) operating without manual bottlenecks. Farmers also praised the automated grain moisture testing meters introduced at Bilaspur and Raipur mandis for fair valuation.',
      hi: 'खाद्य एवं नागरिक आपूर्ति विभाग के अनुसार राज्य के उपार्जन केंद्रों पर इस वर्ष धान खरीदी के सारे रिकॉर्ड टूट गए हैं। बिलासपुर, मुंगेली और जांजगीर-चांपा के किसानों के खातों में तय समयसीमा के भीतर राशि अंतरित की गई। मंडियों में ऑटोमैटिक नमी मापक यंत्रों से पारदर्शी मूल्यांकन सुनिश्चित हुआ।'
    },
    source: {
      en: 'Chhattisgarh State Mandi Board',
      hi: 'छत्तीसगढ़ राज्य कृषि विपणन बोर्ड'
    },
    date: {
      en: '4 days ago',
      hi: '4 दिन पहले'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    iconType: 'mandi'
  },
  {
    id: 'news-07',
    category: {
      en: 'Pest Advisory',
      hi: 'रोग व कीट चेतावनी'
    },
    title: {
      en: 'Agronomy Alert: Fall Armyworm in Maize and Late Blight Threat in Potato Lamina',
      hi: 'कृषि कीट अलर्ट: मक्का में फॉल आर्मीवर्म और आलू-टमाटर में पछेती झुलसा का खतरा'
    },
    summary: {
      en: 'Farmers advised to inspect leaf funnels for sawdust-like frass and monitor undersides for water-soaked greasy lesions.',
      hi: 'मक्के की पत्तियों के बीच भूसे जैसे अवशेष और आलू के पत्तों पर चिकने भूरे धब्बे दिखने पर तुरंत संस्तुत कवकनाशी व कीटनाशी का प्रयोग करें।'
    },
    details: {
      en: 'State agriculture extension officers have urged potato and maize farmers to remain vigilant. For Fall Armyworm in maize, apply Neem-based Azadirachtin (1500 ppm) or bio-fungus Metarhizium anisopliae in the central whorl. For potato late blight, apply preventive Mancozeb 75% WP @ 2.5g/L before morning humidity spikes.',
      hi: 'कृषि विशेषज्ञों ने मक्का और आलू उत्पादकों को सतर्क रहने को कहा है। मक्के में फॉल आर्मीवर्म की रोकथाम के लिए गोभ में नीम का तेल (1500 ppm) या मेटाराइजियम का घोल डालें। आलू में पछेती झुलसा (Late Blight) से बचाव के लिए मैन्कोजेब 75% WP 2.5 ग्राम प्रति लीटर पानी में मिलाकर साफ मौसम में छिड़काव करें।'
    },
    source: {
      en: 'Kisan Call Centre (KCC) Advisory',
      hi: 'किसान कॉल सेंटर (केसीसी) कृषि परामर्श'
    },
    date: {
      en: '5 days ago',
      hi: '5 दिन पहले'
    },
    readTime: {
      en: '3 min read',
      hi: '3 मिनट पठन'
    },
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    iconType: 'pest'
  },
  {
    id: 'news-08',
    category: {
      en: 'Crop Insurance',
      hi: 'फसल बीमा'
    },
    title: {
      en: 'PMFBY DigiClaim Platform Speeds Up Hailstorm & Inundation Damage Claims',
      hi: 'प्रधानमंत्री फसल बीमा योजना: डिजी-क्लेम से ओलावृष्टि व जलभराव नुकसान का त्वरित क्लेम'
    },
    summary: {
      en: 'Satellite-verified crop damage claims settled in under 14 days directly to Aadhaar-linked accounts without paperwork.',
      hi: 'उपग्रह आधारित सर्वेक्षण से बेमौसम बारिश और ओलावृष्टि से नष्ट हुई फसलों का मुआवजा मात्र 14 दिनों के भीतर सीधे खाते में।'
    },
    details: {
      en: 'The DigiClaim module under Pradhan Mantri Fasal Bima Yojana integrates satellite remote sensing with state revenue records. Farmers whose standing crops suffered lodging or submergence can submit claim requests with geotagged leaf photos via the Crop Insurance Mobile App within 72 hours of weather calamity.',
      hi: 'प्रधानमंत्री फसल बीमा योजना के डिजी-क्लेम मॉड्यूल ने क्लेम प्रक्रिया को बेहद आसान बना दिया है। यदि किसी किसान की फसल ओलावृष्टि या भारी बारिश से खराब होती है, तो वे घटना के 72 घंटे के भीतर "क्रॉप इंश्योरेंस ऐप" पर खेत और पत्तियों की फोटो अपलोड करके क्लेम दर्ज करवा सकते हैं।'
    },
    source: {
      en: 'PMFBY National Portal',
      hi: 'राष्ट्रीय फसल बीमा पोर्टल'
    },
    date: {
      en: '5 days ago',
      hi: '5 दिन पहले'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    iconType: 'scheme'
  },
  {
    id: 'news-09',
    category: {
      en: 'Organic Farming',
      hi: 'जैविक व प्राकृतिक खेती'
    },
    title: {
      en: 'National Natural Farming Mission: ₹15,000/Hectare Grant for Chemical-Free Fields',
      hi: 'राष्ट्रीय प्राकृतिक खेती मिशन: रसायन मुक्त खेती अपनाने वाले किसानों को ₹15,000/हेक्टेयर अनुदान'
    },
    summary: {
      en: 'Incentive support for establishing on-farm bio-input resource centers (BRCs) for Jeevamrit and Ghana-Jeevamrit production.',
      hi: 'देसी गाय आधारित जीवामृत, बीजामृत और घनजीवामृत तैयार करने के लिए बायो-रिसोर्स केंद्र स्थापित करने हेतु वित्तीय सहायता।'
    },
    details: {
      en: 'The Ministry of Agriculture has stepped up financial assistance for clusters transitioning to non-chemical farming. Beneficiaries receive ₹15,000 per hectare over 3 years, along with free organic certification and soil microbial health testing kits to monitor soil organic carbon (SOC) replenishment.',
      hi: 'प्राकृतिक खेती को जन-आंदोलन बनाने के लिए सरकार प्रति हेक्टेयर ₹15,000 की वित्तीय सहायता 3 वर्षों की अवधि में प्रदान कर रही है। इसमें किसानों को मुफ्त पीजीएस (PGS) जैविक प्रमाणीकरण और मिट्टी में जैविक कार्बन बढ़ाने के लिए आवश्यक प्रशिक्षण दिया जाता है।'
    },
    source: {
      en: 'National Centre for Organic and Natural Farming',
      hi: 'राष्ट्रीय जैविक एवं प्राकृतिक खेती केंद्र'
    },
    date: {
      en: '6 days ago',
      hi: '6 दिन पहले'
    },
    readTime: {
      en: '3 min read',
      hi: '3 मिनट पठन'
    },
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconType: 'tech'
  },
  {
    id: 'news-10',
    category: {
      en: 'Irrigation & Subsidies',
      hi: 'सिंचाई एवं सब्सिडी'
    },
    title: {
      en: 'Per Drop More Crop: 55% Subsidy on Micro-Drip Irrigation for Vegetable Growers',
      hi: 'प्रति बूंद अधिक फसल: सब्जी उत्पादकों को ड्रिप और स्प्रिंकलर सिंचाई पर 55% तक सब्सिडी'
    },
    summary: {
      en: 'Special grants for small and marginal farmers growing tomatoes, bell peppers, and potatoes to tackle summer water scarcity.',
      hi: 'गर्मियों में पानी की किल्लत से निपटने के लिए टमाटर, शिमला मिर्च और आलू की खेती करने वाले लघु किसानों को विशेष अनुदान।'
    },
    details: {
      en: 'Under the Pradhan Mantri Krishi Sinchayee Yojana (PMKSY), small and marginal farmers can avail up to 55% subsidy on micro-drip irrigation setups. Drip fertigation allows liquid water-soluble fertilizers (19:19:19 NPK) to be delivered directly to the root zone, cutting fertilizer wastage by 40% and boosting fruit sizing.',
      hi: 'प्रधानमंत्री कृषि सिंचाई योजना के अंतर्गत ड्रिप और मिनी स्प्रिंकलर लगाने पर सामान्य किसानों को 45% और लघु-सीमांत किसानों को 55% की सब्सिडी दी जा रही है। ड्रिप से पानी सीधे जड़ों तक पहुंचता है और घुलनशील खादों का उपयोग करने से उपज में 30 से 40 प्रतिशत तक की वृद्धि होती है।'
    },
    source: {
      en: 'PMKSY State Irrigation Cell',
      hi: 'पीएम कृषि सिंचाई योजना प्रकोष्ठ'
    },
    date: {
      en: '1 week ago',
      hi: '1 सप्ताह पहले'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    iconType: 'tech'
  },
  {
    id: 'news-11',
    category: {
      en: 'Soil Health',
      hi: 'मृदा स्वास्थ्य'
    },
    title: {
      en: 'Soil Health Card 2.0: AI-Powered Fertilizer Dosage Recommendations Sent via SMS',
      hi: 'सॉयल हेल्थ कार्ड 2.0: कृत्रिम बुद्धिमत्ता (AI) आधारित खाद अनुशंसा सीधे किसान के मोबाइल पर'
    },
    summary: {
      en: 'Algorithm tailors precise NPK and micronutrient dosage (Zinc, Boron) based on geotagged laboratory soil test reports.',
      hi: 'मिट्टी की जांच रिपोर्ट के आधार पर एआई एल्गोरिद्म यूरिया, डीएपी और पोटाश की सटीक मात्रा तय कर मोबाइल पर एसएमएस भेजता है।'
    },
    details: {
      en: 'To prevent imbalanced urea overuse that degrades soil pH, the updated Soil Health Card system utilizes machine learning models to suggest customized fertilizer blends for target yield outputs. Over 4 crore updated cards have been issued in the current financial year.',
      hi: 'यूरिया के अत्यधिक इस्तेमाल से मिट्टी की उर्वरा शक्ति को होने वाले नुकसान से बचाने के लिए नई प्रणाली शुरू की गई है। इसमें किसान जिस फसल को बोना चाहते हैं, उसके अनुसार नाइट्रोजन, फास्फोरस, पोटाश और जिंक की सटीक मात्रा की सिफारिश दी जाती है, जिससे लागत में ₹3,000 प्रति एकड़ की बचत होती है।'
    },
    source: {
      en: 'Soil Testing & Agronomy Lab Network',
      hi: 'राष्ट्रीय मृदा परीक्षण एवं अनुसंधान नेटवर्क'
    },
    date: {
      en: '1 week ago',
      hi: '1 सप्ताह पहले'
    },
    readTime: {
      en: '2 min read',
      hi: '2 मिनट पठन'
    },
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconType: 'tech'
  },
  {
    id: 'news-12',
    category: {
      en: 'Market Trends',
      hi: 'बाजार भाव एवं निर्यात'
    },
    title: {
      en: 'Record Agricultural Exports: Indian Basmati Rice, Spices & Fresh Fruits Top Global Demand',
      hi: 'कृषि निर्यात में उछाल: भारतीय बासमती चावल, मसाले और ताजे फलों की अंतरराष्ट्रीय बाजार में भारी मांग'
    },
    summary: {
      en: 'APEDA reports strong growth in premium grain and horticulture shipments to Middle East and European markets.',
      hi: 'कृषि एवं प्रसंस्कृत खाद्य उत्पाद निर्यात विकास प्राधिकरण (एपीडा) के अनुसार खाड़ी देशों और यूरोप में भारतीय उत्पादों की मांग बढ़ी।'
    },
    details: {
      en: 'The Agricultural and Processed Food Products Export Development Authority (APEDA) reported that pesticide-residue compliant agricultural consignments crossed record export milestones. Farmers cultivating certified GI-tagged varieties are reaping premium market prices in domestic mandis.',
      hi: 'एपीडा के अनुसार गुणवत्तापूर्ण और कीटनाशक मुक्त कृषि उत्पादों के निर्यात में उल्लेखनीय वृद्धि हुई है। जीआई टैग प्राप्त फसलों और जैविक बासमती की खेती करने वाले किसानों को स्थानीय कृषि उपज मंडियों में सामान्य से 20% तक अधिक भाव मिल रहे हैं।'
    },
    source: {
      en: 'APEDA Ministry of Commerce',
      hi: 'एपीडा (APEDA) वाणिज्य एवं उद्योग मंत्रालय'
    },
    date: {
      en: '10 days ago',
      hi: '10 दिन पहले'
    },
    readTime: {
      en: '3 min read',
      hi: '3 मिनट पठन'
    },
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    iconType: 'mandi'
  }
];

