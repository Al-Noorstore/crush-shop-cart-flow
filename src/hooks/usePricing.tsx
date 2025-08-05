import { useMemo } from 'react';
import { Country } from '@/components/CountryManager';

// Base currency is USD - these are conversion rates
const CURRENCY_RATES: Record<string, number> = {
  'USD': 1,
  'PKR': 280,   // 1 USD = 280 PKR
  'GBP': 0.79,  // 1 USD = 0.79 GBP
  'EUR': 0.85,  // 1 USD = 0.85 EUR
  'RUB': 75,    // 1 USD = 75 RUB
  'CAD': 1.25,  // 1 USD = 1.25 CAD
  'AUD': 1.35,  // 1 USD = 1.35 AUD
};

interface UsePricingReturn {
  convertPrice: (usdPrice: number) => number;
  formatPrice: (price: number) => string;
  getShippingCost: () => number;
  formatShippingCost: () => string;
  getCurrency: () => string;
  getCurrencySymbol: () => string;
}

export const usePricing = (countryData: Country | null): UsePricingReturn => {
  const convertPrice = useMemo(() => {
    return (usdPrice: number): number => {
      if (!countryData) return usdPrice;
      const rate = CURRENCY_RATES[countryData.currency] || 1;
      return usdPrice * rate;
    };
  }, [countryData]);

  const formatPrice = useMemo(() => {
    return (price: number): string => {
      if (!countryData) return `$${price.toFixed(2)}`;
      const convertedPrice = convertPrice(price);
      return `${countryData.currencySymbol}${convertedPrice.toFixed(2)}`;
    };
  }, [countryData, convertPrice]);

  const getShippingCost = useMemo(() => {
    return (): number => {
      return countryData?.deliveryCharges || 0;
    };
  }, [countryData]);

  const formatShippingCost = useMemo(() => {
    return (): string => {
      const cost = getShippingCost();
      if (cost === 0) return 'Free';
      return `${countryData?.currencySymbol || '$'}${cost.toFixed(2)}`;
    };
  }, [countryData, getShippingCost]);

  const getCurrency = useMemo(() => {
    return (): string => {
      return countryData?.currency || 'USD';
    };
  }, [countryData]);

  const getCurrencySymbol = useMemo(() => {
    return (): string => {
      return countryData?.currencySymbol || '$';
    };
  }, [countryData]);

  return {
    convertPrice,
    formatPrice,
    getShippingCost,
    formatShippingCost,
    getCurrency,
    getCurrencySymbol
  };
};