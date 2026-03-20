export interface TripRequest {
  budget: number;
  startDate: string;
  endDate: string;
  startPlace: string;
  tripType: 'domestic' | 'international' | 'both';
  page: number;
  pageSize: number;
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface DayActivity {
  time: string;
  activity: string;
  description: string;
  estimatedCost: number;
  icon: string;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: DayActivity[];
  dailyBudget: number;
}

export interface ItineraryPlan {
  id: string;
  destination: string;
  country: string;
  countryCode: string;
  isDomestic: boolean;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  visaType: string;
  visaInfo: string;
  duration: number;
  totalCost: number;
  savingsFromBudget: number;
  budgetBreakdown: BudgetBreakdown;
  highlights: string[];
  topAttractions: string[];
  dailyPlans: DayPlan[];
  weather: string;
  bestTimeToVisit: string;
  currency: string;
  language: string;
  rating: number;
  travelTip: string;
  flightDuration: string;
  recommendedStay: string;
  currencySymbol: string;
  exchangeRateFromUSD: number;
  exchangeRateNote: string;
}

export interface TripResponse {
  success: boolean;
  message: string;
  plans: ItineraryPlan[];
  tripDuration: number;
  budget: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
