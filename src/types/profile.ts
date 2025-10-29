export type TravelFrequencyPerYear = 'rarely' | 'sometimes' | 'often' | 'frequent';
export type TravelTripDurationDays = 'short' | 'medium' | 'long' | 'extended';
export type SustainabilityWeightPriority = 'comfort_first' | 'balanced' | 'lightweight' | 'ultralight';
export type BudgetLevel = 'low' | 'medium' | 'high' | 'luxury';

export interface Profile {
  user_id: string;
  user_firstname: string | null;
  user_lastname: string | null;
  email: string | null;
  core_country_of_residence?: string | null;
  core_languages?: string[] | null;
  travel_frequency_per_year?: TravelFrequencyPerYear | null;
  travel_avg_trip_duration_days?: TravelTripDurationDays | null;
  travel_countries_visited_count?: number | null;
  travel_regions_often_visited?: string[] | null;
  travel_usual_travel_styles?: string[] | null;
  travel_seasonality_preference?: string[] | null;
  transport_usual_transport_modes?: string[] | null;
  transport_preferred_luggage_types?: string[] | null;
  accommodation_common_types?: string[] | null;
  accommodation_laundry_access_expectation?: string | null;
  accommodation_workspace_needed?: string | null;
  activity_sports_outdoor?: string[] | null;
  activity_adventure_activities?: string[] | null;
  activity_cultural_activities?: string[] | null;
  sustainability_focus?: string[] | null;
  sustainability_weight_priority?: SustainabilityWeightPriority | null;
  budget_level?: BudgetLevel | null;
  budget_buy_at_destination_preference?: string | null;
  budget_souvenir_space_preference?: string | null;
  created_at?: string;
  updated_at?: string;
}
