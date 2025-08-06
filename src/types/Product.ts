export interface CountryPricing {
  countryCode: string;
  isActive: boolean;
  originalPrice: number;
  price: number;
  shippingCharges: number;
  isFreeShipping: boolean;
}

export interface ProductMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isOnSale?: boolean;
  isBestSeller?: boolean;
  
  // Enhanced fields for country-specific management
  description?: string;
  features?: string[];
  media?: ProductMedia[];
  countryPricing?: CountryPricing[];
}