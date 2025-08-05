import { useState, useEffect } from 'react';
import { Country } from '@/components/CountryManager';

// Phone number prefixes for country detection
const PHONE_PREFIXES: Record<string, string> = {
  '+92': 'PK', // Pakistan
  '+1': 'US',   // United States/Canada
  '+44': 'GB',  // United Kingdom
  '+7': 'RU',   // Russia
  '+49': 'DE',  // Germany
  '+33': 'FR',  // France
  '+61': 'AU',  // Australia
};

interface UseCountryDetectionReturn {
  detectedCountry: string | null;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  detectCountryFromPhone: (phoneNumber: string) => string | null;
  getCountryData: () => Country | null;
  countries: Country[];
}

const DEFAULT_COUNTRIES: Country[] = [
  {
    code: 'PK',
    name: 'Pakistan',
    currency: 'PKR',
    currencySymbol: '₨',
    flag: '🇵🇰',
    isActive: true,
    deliveryDays: 3,
    deliveryCharges: 200
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    isActive: true,
    deliveryDays: 7,
    deliveryCharges: 15
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    isActive: true,
    deliveryDays: 5,
    deliveryCharges: 12
  },
  {
    code: 'RU',
    name: 'Russia',
    currency: 'RUB',
    currencySymbol: '₽',
    flag: '🇷🇺',
    isActive: false,
    deliveryDays: 10,
    deliveryCharges: 25
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇩🇪',
    isActive: true,
    deliveryDays: 4,
    deliveryCharges: 8
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇫🇷',
    isActive: true,
    deliveryDays: 4,
    deliveryCharges: 8
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    flag: '🇨🇦',
    isActive: true,
    deliveryDays: 6,
    deliveryCharges: 18
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
    isActive: true,
    deliveryDays: 8,
    deliveryCharges: 22
  }
];

export const useCountryDetection = (): UseCountryDetectionReturn => {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('PK'); // Default to Pakistan
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    // Load countries from localStorage or use defaults
    const savedCountries = localStorage.getItem('adminCountries');
    if (savedCountries) {
      setCountries(JSON.parse(savedCountries));
    } else {
      setCountries(DEFAULT_COUNTRIES);
      localStorage.setItem('adminCountries', JSON.stringify(DEFAULT_COUNTRIES));
    }
  }, []);

  const detectCountryFromPhone = (phoneNumber: string): string | null => {
    if (!phoneNumber) return null;

    // Clean the phone number
    const cleanPhone = phoneNumber.replace(/\s|-|\(|\)/g, '');
    
    // Find matching prefix
    for (const [prefix, countryCode] of Object.entries(PHONE_PREFIXES)) {
      if (cleanPhone.startsWith(prefix)) {
        setDetectedCountry(countryCode);
        setSelectedCountry(countryCode);
        return countryCode;
      }
    }
    
    return null;
  };

  const getCountryData = (): Country | null => {
    return countries.find(c => c.code === selectedCountry) || null;
  };

  return {
    detectedCountry,
    selectedCountry,
    setSelectedCountry,
    detectCountryFromPhone,
    getCountryData,
    countries: countries.filter(c => c.isActive)
  };
};