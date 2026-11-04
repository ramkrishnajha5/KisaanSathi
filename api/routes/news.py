"""Agriculture & Farmer News API Route with Real-time Live RSS Feed & Offline Fallback."""

import time
from typing import List, Optional, Dict, Any
import xml.etree.ElementTree as ET
import httpx
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/news", tags=["Farmer News"])


class NewsArticleItem(BaseModel):
    id: str
    category: str
    title: str
    summary: str
    details: str
    source: str
    date: str
    read_time: str
    tag: str
    url: Optional[str] = None
    is_live: bool = False


# In-memory cache for live news: key = 'en' or 'hi' -> (timestamp, list of items)
_LIVE_NEWS_CACHE: Dict[str, Dict[str, Any]] = {
    "en": {"timestamp": 0, "articles": []},
    "hi": {"timestamp": 0, "articles": []},
}
CACHE_TTL_SECONDS = 900  # 15 minutes


FALLBACK_NEWS_DATA = [
    {
        "id": "news-01",
        "category_en": "Government Scheme",
        "category_hi": "सरकारी योजना",
        "title_en": "PM-Kisan 19th Installment of ₹2,000 Transferred to 9.5 Crore Farmers",
        "title_hi": "पीएम किसान सम्मान निधि: 9.5 करोड़ किसानों के बैंक खातों में ₹2,000 की 19वीं किस्त जारी",
        "summary_en": "Direct Benefit Transfer (DBT) worth ₹20,000 crore credited directly into Aadhaar-linked bank accounts nationwide.",
        "summary_hi": "देश भर के सत्यापित पात्र किसान परिवारों के बैंक खातों में डीबीटी के जरिए ₹20,000 करोड़ की राशि सीधे स्थानांतरित।",
        "details_en": "The Ministry of Agriculture has confirmed the disbursement of the 19th instalment under PM-Kisan directly to verified farmers.",
        "details_hi": "कृषि एवं किसान कल्याण मंत्रालय ने पात्र किसानों के खातों में 19वीं किस्त की राशि जमा कर दी है।",
        "source_en": "Ministry of Agriculture",
        "source_hi": "कृषि एवं किसान कल्याण मंत्रालय",
        "date_en": "Today, 09:30 AM",
        "date_hi": "आज, सुबह 09:30",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "pm-kisan",
        "url": "https://pmkisan.gov.in"
    },
    {
        "id": "news-02",
        "category_en": "Mandi & MSP",
        "category_hi": "मंडी एवं एमएसपी",
        "title_en": "Cabinet Approves Higher MSP for Kharif Crops: Paddy at ₹2,300/qtl, Soybean at ₹4,892/qtl",
        "title_hi": "कैबिनेट ने खरीफ फसलों के समर्थन मूल्य में की वृद्धि: धान ₹2,300 और सोयाबीन ₹4,892 प्रति क्विंटल",
        "summary_en": "Cabinet Committee on Economic Affairs announced updated Minimum Support Prices offering up to 50% profit over cost.",
        "summary_hi": "आर्थिक मामलों की कैबिनेट समिति ने खरीफ फसलों के समर्थन मूल्य (MSP) में वृद्धि की घोषणा की।",
        "details_en": "MSP has been increased for 14 Kharif crops to ensure remunerative prices for farmers.",
        "details_hi": "किसानों को लागत का उचित मूल्य दिलाने के लिए धान, सोयाबीन और मक्का के समर्थन मूल्य बढ़ाए गए हैं।",
        "source_en": "Press Information Bureau (PIB)",
        "source_hi": "प्रेस सूचना ब्यूरो (पीआईबी)",
        "date_en": "Yesterday",
        "date_hi": "कल",
        "read_time_en": "3 min read",
        "read_time_hi": "3 मिनट पठन",
        "tag": "msp",
        "url": "https://pib.gov.in"
    },
    {
        "id": "news-03",
        "category_en": "Weather Alert",
        "category_hi": "मौसम चेतावनी",
        "title_en": "IMD Alert: Unseasonal Rain and Gusty Winds Predicted in Chhattisgarh & Central Plains",
        "title_hi": "मौसम विभाग का अलर्ट: छत्तीसगढ़ और मध्य भारत में बेमौसम बारिश व आंधी का अनुमान",
        "summary_en": "Western disturbance triggers isolated thunderstorm warnings for Bilaspur, Raipur, and Durg; protect harvested grains.",
        "summary_hi": "पश्चिमी विक्षोभ के चलते बिलासपुर और रायपुर संभाग में गरज-चमक के साथ बारिश की चेतावनी।",
        "details_en": "Farmers are advised to postpone foliar spray applications for 48 hours to avoid rain wash-off.",
        "details_hi": "किसानों को अगले 48 घंटे तक किसी भी प्रकार के कीटनाशक छिड़काव से बचने की सलाह दी गई है।",
        "source_en": "IMD Weather Service",
        "source_hi": "भारतीय मौसम विज्ञान विभाग (IMD)",
        "date_en": "3 hours ago",
        "date_hi": "3 घंटे पहले",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "weather",
        "url": "https://mausam.imd.gov.in"
    },
    {
        "id": "news-04",
        "category_en": "Seed Innovation",
        "category_hi": "उन्नत बीज",
        "title_en": "ICAR Releases 5 New Climate-Resilient & Disease-Resistant Wheat and Paddy Varieties",
        "title_hi": "भा.कृ.अनु.प. (ICAR) ने जारी की गेहूं और धान की 5 नई रोगरोधी किस्में",
        "summary_en": "New varieties offer genetic resistance to bacterial leaf blight and yellow rust with high temperature tolerance.",
        "summary_hi": "नई किस्में बैक्टीरियल ब्लाइट और रतुआ रोग के प्रति प्रतिरोधी हैं और गर्मी में भी दाने सिकुड़ने नहीं देतीं।",
        "details_en": "DBW-327 wheat and Pusa Basmati 1847 paddy reduce pesticide costs by 30%.",
        "details_hi": "डीबीडब्ल्यू-327 गेहूं और पूसा बासमती 1847 से दवाइयों का खर्च 30% घट जाता है।",
        "source_en": "ICAR Research Directorate",
        "source_hi": "भारतीय कृषि अनुसंधान परिषद (ICAR)",
        "date_en": "2 days ago",
        "date_hi": "2 दिन पहले",
        "read_time_en": "3 min read",
        "read_time_hi": "3 मिनट पठन",
        "tag": "seed",
        "url": "https://icar.org.in"
    },
    {
        "id": "news-05",
        "category_en": "Agri-Tech & Drones",
        "category_hi": "कृषि तकनीक",
        "title_en": "Up to 50% Subsidy Approved on Kisan Drones for Spraying and Canopy Scouting",
        "title_hi": "फसल छिड़काव और ड्रोन निगरानी हेतु किसान ड्रोन पर 50% तक सब्सिडी",
        "summary_en": "Sub-Mission on Agricultural Mechanization allocates funds for FPOs and rural cooperatives.",
        "summary_hi": "कृषि यंत्रीकरण योजना के तहत किसान उत्पादक संगठनों (FPO) को ड्रोन खरीद पर ₹5 लाख तक का अनुदान।",
        "details_en": "Drones spray an acre in 7 minutes with 90% less water, protecting farm operators from pesticide exposure.",
        "details_hi": "ड्रोन से 7 मिनट में एक एकड़ में छिड़काव हो जाता है और 90% पानी की बचत होती है।",
        "source_en": "Department of Agriculture",
        "source_hi": "कृषि विभाग एवं भारत सरकार",
        "date_en": "3 days ago",
        "date_hi": "3 दिन पहले",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "drone",
        "url": "https://agricoop.nic.in"
    },
    {
        "id": "news-06",
        "category_en": "State Agriculture",
        "category_hi": "राज्य कृषि समाचार",
        "title_en": "Chhattisgarh Registers Record 145 Lakh MT Paddy Procurement Across Mandis",
        "title_hi": "छत्तीसगढ़ में 145 लाख मीट्रिक टन धान की ऐतिहासिक खरीदी, किसानों को सीधा भुगतान",
        "summary_en": "Over 25 lakh farmers benefited from seamless electronic weighment and DBT credits under state procurement.",
        "summary_hi": "25 लाख से अधिक किसानों को इलेक्ट्रॉनिक तौल और बायोमेट्रिक सत्यापन से समर्थन मूल्य का लाभ दिया गया।",
        "details_en": "State agricultural credit societies operated without bottlenecks with automated grain moisture meters.",
        "details_hi": "बिलासपुर और अन्य मंडियों में ऑटोमैटिक नमी मापक यंत्रों से पारदर्शी तौल सुनिश्चित हुआ।",
        "source_en": "Chhattisgarh Mandi Board",
        "source_hi": "छत्तीसगढ़ राज्य कृषि विपणन बोर्ड",
        "date_en": "4 days ago",
        "date_hi": "4 दिन पहले",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "chhattisgarh",
        "url": "https://agriportal.cg.nic.in"
    },
    {
        "id": "news-07",
        "category_en": "Pest Advisory",
        "category_hi": "रोग व कीट चेतावनी",
        "title_en": "Agronomy Alert: Fall Armyworm in Maize and Late Blight Threat in Potato Lamina",
        "title_hi": "कृषि कीट अलर्ट: मक्का में फॉल आर्मीवर्म और आलू-टमाटर में पछेती झुलसा का खतरा",
        "summary_en": "Farmers advised to inspect leaf funnels and spray Neem-based Azadirachtin or Mancozeb before humidity rises.",
        "summary_hi": "मक्के की गोभ में नीम तेल और आलू में पछेती झुलसा से बचाव हेतु मैन्कोजेब 75% WP का छिड़काव करें।",
        "details_en": "Inspect lower canopy daily for water-soaked greasy lesions and apply bio-fungicide promptly.",
        "details_hi": "पत्तियों की निचली सतह पर चिकने भूरे धब्बे दिखने पर तुरंत कवकनाशी का छिड़काव करें।",
        "source_en": "Kisan Call Centre Advisory",
        "source_hi": "किसान कॉल सेंटर (KCC)",
        "date_en": "5 days ago",
        "date_hi": "5 दिन पहले",
        "read_time_en": "3 min read",
        "read_time_hi": "3 मिनट पठन",
        "tag": "pest-alert",
        "url": "https://dackvk.gov.in"
    },
    {
        "id": "news-08",
        "category_en": "Crop Insurance",
        "category_hi": "फसल बीमा",
        "title_en": "PMFBY DigiClaim Platform Speeds Up Hailstorm & Inundation Damage Claims",
        "title_hi": "प्रधानमंत्री फसल बीमा योजना: डिजी-क्लेम से ओलावृष्टि व नुकसान का त्वरित क्लेम",
        "summary_en": "Satellite-verified crop damage claims settled in under 14 days directly to Aadhaar-linked accounts.",
        "summary_hi": "उपग्रह आधारित सर्वे से बेमौसम बारिश और ओलावृष्टि का मुआवजा मात्र 14 दिनों में सीधे खाते में।",
        "details_en": "Upload geotagged leaf and field photos via Crop Insurance Mobile App within 72 hours of damage.",
        "details_hi": "फसल नुकसान होने के 72 घंटे के भीतर क्रॉप इंश्योरेंस ऐप पर फोटो अपलोड कर क्लेम दर्ज करवाएं।",
        "source_en": "PMFBY National Portal",
        "source_hi": "राष्ट्रीय फसल बीमा पोर्टल",
        "date_en": "5 days ago",
        "date_hi": "5 दिन पहले",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "pmfby",
        "url": "https://pmfby.gov.in"
    },
    {
        "id": "news-09",
        "category_en": "Organic Farming",
        "category_hi": "जैविक व प्राकृतिक खेती",
        "title_en": "National Natural Farming Mission: ₹15,000/Hectare Grant for Chemical-Free Fields",
        "title_hi": "राष्ट्रीय प्राकृतिक खेती मिशन: रसायन मुक्त खेती अपनाने पर ₹15,000/हेक्टेयर अनुदान",
        "summary_en": "Incentive support for establishing on-farm bio-input resource centers for Jeevamrit preparation.",
        "summary_hi": "देसी गाय आधारित जीवामृत और बीजामृत तैयार करने के लिए बायो-रिसोर्स केंद्र हेतु वित्तीय सहायता।",
        "details_en": "Includes free organic certification and soil organic carbon testing kits.",
        "details_hi": "किसानों को मुफ्त पीजीएस जैविक प्रमाणीकरण और मिट्टी स्वास्थ्य परीक्षण किट दी जा रही है।",
        "source_en": "Organic Farming Centre",
        "source_hi": "राष्ट्रीय जैविक खेती केंद्र",
        "date_en": "6 days ago",
        "date_hi": "6 दिन पहले",
        "read_time_en": "3 min read",
        "read_time_hi": "3 मिनट पठन",
        "tag": "organic",
        "url": "https://ncof.dacnet.nic.in"
    },
    {
        "id": "news-10",
        "category_en": "Irrigation & Subsidies",
        "category_hi": "सिंचाई एवं सब्सिडी",
        "title_en": "Per Drop More Crop: 55% Subsidy on Micro-Drip Irrigation for Vegetable Growers",
        "title_hi": "प्रति बूंद अधिक फसल: सब्जी उत्पादकों को ड्रिप और स्प्रिंकलर पर 55% तक सब्सिडी",
        "summary_en": "Special grants for small and marginal farmers growing tomatoes, chillies, and potatoes.",
        "summary_hi": "गर्मियों में पानी की किल्लत से निपटने के लिए ड्रिप सिंचाई लगाने पर लघु किसानों को 55% अनुदान।",
        "details_en": "Drip fertigation cuts fertilizer wastage by 40% and delivers nutrients directly to plant roots.",
        "details_hi": "ड्रिप से घुलनशील उर्वरक सीधे जड़ों तक पहुंचते हैं और पैदावार में 30% तक बढ़ोतरी होती है।",
        "source_en": "PMKSY Irrigation Cell",
        "source_hi": "पीएम कृषि सिंचाई योजना प्रकोष्ठ",
        "date_en": "1 week ago",
        "date_hi": "1 सप्ताह पहले",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "irrigation",
        "url": "https://pmksy.gov.in"
    },
    {
        "id": "news-11",
        "category_en": "Soil Health",
        "category_hi": "मृदा स्वास्थ्य",
        "title_en": "Soil Health Card 2.0: AI-Powered Fertilizer Dosage Recommendations Sent via SMS",
        "title_hi": "सॉयल हेल्थ कार्ड 2.0: एआई आधारित खाद अनुशंसा सीधे किसान के मोबाइल पर",
        "summary_en": "Algorithm tailors precise NPK and micronutrient dosage (Zinc, Boron) to prevent over-fertilization.",
        "summary_hi": "मिट्टी जांच के आधार पर मोबाइल पर संतुलित खाद सलाह, यूरिया की बचत और लागत में कमी।",
        "details_en": "Customized fertilizer blends recommended based on soil pH and target crop yields.",
        "details_hi": "फसल के अनुसार यूरिया, डीएपी और पोटाश की सही मात्रा की सिफारिश दी जाती है।",
        "source_en": "Soil Testing Lab Network",
        "source_hi": "राष्ट्रीय मृदा परीक्षण नेटवर्क",
        "date_en": "1 week ago",
        "date_hi": "1 सप्ताह पहले",
        "read_time_en": "2 min read",
        "read_time_hi": "2 मिनट पठन",
        "tag": "soil",
        "url": "https://soilhealth.dac.gov.in"
    },
    {
        "id": "news-12",
        "category_en": "Market Trends",
        "category_hi": "बाजार भाव एवं निर्यात",
        "title_en": "Record Agricultural Exports: Indian Basmati Rice & Fresh Horticulture Top Global Demand",
        "title_hi": "कृषि निर्यात में उछाल: भारतीय बासमती चावल और ताजे फलों की अंतरराष्ट्रीय बाजार में मांग",
        "summary_en": "APEDA reports strong growth in premium grain and horticulture shipments with high farmer price realization.",
        "summary_hi": "एपीडा के अनुसार खाड़ी देशों और यूरोप में भारतीय कृषि उत्पादों की रिकॉर्ड मांग से किसानों को अच्छे भाव मिले।",
        "details_en": "GI-tagged crops and residue-free organic crops commanded a 20% premium in local mandis.",
        "details_hi": "जीआई टैग प्राप्त फसलों और जैविक उत्पादों को स्थानीय मंडियों में 20% तक अधिक भाव प्राप्त हुए।",
        "source_en": "APEDA Ministry of Commerce",
        "source_hi": "एपीडा (APEDA) वाणिज्य मंत्रालय",
        "date_en": "10 days ago",
        "date_hi": "10 दिन पहले",
        "read_time_en": "3 min read",
        "read_time_hi": "3 मिनट पठन",
        "tag": "export",
        "url": "https://apeda.gov.in"
    }
]


async def fetch_live_google_rss(is_hindi: bool = False) -> List[NewsArticleItem]:
    """Fetches real-time live agricultural news headlines via Google News RSS feed."""
    if is_hindi:
        rss_url = "https://news.google.com/rss/search?q=%E0%A4%95%E0%A5%83%E0%A4%B7%E0%A4%BF+%E0%A4%95%E0%A4%BF%E0%A4%B8%E0%A4%BE%E0%A4%A8+%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4&hl=hi&gl=IN&ceid=IN:hi"
    else:
        rss_url = "https://news.google.com/rss/search?q=agriculture+farmer+kisan+india&hl=en-IN&gl=IN&ceid=IN:en"

    items: List[NewsArticleItem] = []
    try:
        async with httpx.AsyncClient(timeout=4.0, follow_redirects=True) as client:
            resp = await client.get(rss_url, headers={"User-Agent": "Mozilla/5.0 (compatible; KisaanSathi/2.0)"})
            if resp.status_code == 200:
                root = ET.fromstring(resp.text)
                for idx, entry in enumerate(root.findall(".//item")[:12]):
                    raw_title = entry.findtext("title", "")
                    link = entry.findtext("link", "")
                    pub_date = entry.findtext("pubDate", "")
                    source_elem = entry.find("source")
                    source_name = source_elem.text if source_elem is not None else ("Google News" if not is_hindi else "गूगल कृषि समाचार")

                    # Clean title: Google News RSS titles end with ' - Publisher'
                    parts = raw_title.rsplit(" - ", 1)
                    clean_title = parts[0] if parts else raw_title
                    if len(parts) > 1 and not source_name:
                        source_name = parts[1]

                    # Clean date representation
                    display_date = "Just now" if not is_hindi else "अभी-अभी"
                    if pub_date:
                        date_parts = pub_date.split()
                        if len(date_parts) >= 4:
                            display_date = f"{date_parts[1]} {date_parts[2]} {date_parts[3]}"

                    category_label = "Live Agri News" if not is_hindi else "ताज़ा कृषि समाचार"
                    summary_text = (
                        f"Latest update via {source_name}: {clean_title}. Click to access full journalistic coverage."
                        if not is_hindi
                        else f"{source_name} से ताज़ा अपडेट: {clean_title}। विस्तृत रिपोर्ट पढ़ने के लिए लिंक पर क्लिक करें।"
                    )

                    items.append(
                        NewsArticleItem(
                            id=f"live-news-{idx+1}",
                            category=category_label,
                            title=clean_title,
                            summary=summary_text,
                            details=f"Live Dispatch: Reported by {source_name} on {pub_date}. Keep monitoring KisaanSathi for agronomic advisories.",
                            source=source_name,
                            date=display_date,
                            read_time="1 min read" if not is_hindi else "1 मिनट पठन",
                            tag="live-rss",
                            url=link,
                            is_live=True
                        )
                    )
    except Exception:
        # Network timeout or parser error: fallback immediately
        pass

    return items


@router.get("/", response_model=List[NewsArticleItem])
async def get_agri_news(
    lang: str = Query("en", description="Language: 'en' or 'hi'"),
    live: bool = Query(True, description="Attempt live RSS fetch before falling back to local dataset"),
    limit: int = Query(12, description="Max news items to return")
):
    """Fetches real-time live agricultural news with automated caching & verified offline fallback."""
    is_hindi = lang.lower() == "hi"
    cache_key = "hi" if is_hindi else "en"
    now = time.time()

    # Check cache first
    cached = _LIVE_NEWS_CACHE[cache_key]
    if live and (now - cached["timestamp"] < CACHE_TTL_SECONDS) and cached["articles"]:
        return cached["articles"][:limit]

    # Attempt Live Fetch
    if live:
        live_articles = await fetch_live_google_rss(is_hindi=is_hindi)
        if live_articles and len(live_articles) >= 5:
            _LIVE_NEWS_CACHE[cache_key] = {"timestamp": now, "articles": live_articles}
            return live_articles[:limit]

    # Offline / Curated Fallback
    articles: List[NewsArticleItem] = []
    for item in FALLBACK_NEWS_DATA[:limit]:
        articles.append(
            NewsArticleItem(
                id=item["id"],
                category=item["category_hi"] if is_hindi else item["category_en"],
                title=item["title_hi"] if is_hindi else item["title_en"],
                summary=item["summary_hi"] if is_hindi else item["summary_en"],
                details=item["details_hi"] if is_hindi else item["details_en"],
                source=item["source_hi"] if is_hindi else item["source_en"],
                date=item["date_hi"] if is_hindi else item["date_en"],
                read_time=item["read_time_hi"] if is_hindi else item["read_time_en"],
                tag=item["tag"],
                url=item.get("url"),
                is_live=False
            )
        )

    return articles
