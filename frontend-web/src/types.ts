export interface Treatment {
  organic?: string;
  chemical?: string;
}

export interface PredictionResponse {
  scan_id?: number | null;
  crop?: string; // Kept in response for database compatibility, but NOT shown in UI
  disease_name: string;
  hindi_name?: string;
  is_healthy: boolean;
  confidence: number;
  low_confidence?: boolean;
  cause?: string;
  symptoms?: string;
  treatment: Treatment;
  prevention?: string;
  gradcam_image_base64?: string;
  mode: string;
  model?: string;
}

export interface ShowcaseSample {
  id: string;
  file: string;
  title: string;
  expected: string;
  category: 'Healthy' | 'Infected';
}

export interface DailyForecast {
  date: string;
  day: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  rain_probability: number;
}

export interface WeatherData {
  location: string;
  district: string;
  state: string;
  coordinates: string;
  temperature_c: number;
  feels_like_c: number;
  humidity_percent: number;
  condition: string;
  rainfall_mm: number;
  rainfall_probability: number;
  wind_speed_kmh: number;
  wind_direction: string;
  dew_point_c: number;
  uv_index: number;
  solar_radiation: string;
  fungal_risk_level: string;
  agri_advisory: string;
  spray_recommendation: string;
  forecast: DailyForecast[];
}

export interface MandiItem {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  trend: string;
  trend_percent: string;
  arrival_date: string;
}

export interface ScanHistoryItem {
  id: number;
  timestamp: string;
  crop_name: string;
  disease_name: string;
  confidence: number;
  is_healthy: boolean;
  notes?: string;
}

export interface FarmingTip {
  id: number;
  category: string;
  category_hi?: string;
  title: string;
  title_hi?: string;
  content: string;
  content_hi?: string;
  season?: string;
  season_hi?: string;
  recommended_seeds?: string;
  recommended_seeds_hi?: string;
  seed_treatment?: string;
  seed_treatment_hi?: string;
  weather_condition?: string;
  weather_condition_hi?: string;
}

