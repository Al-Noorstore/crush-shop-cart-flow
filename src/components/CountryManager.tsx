import { useState } from "react";
import { Globe, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  isActive: boolean;
  deliveryDays: number;
  deliveryCharges: number;
}

interface CountryManagerProps {
  selectedCountry: string;
  onCountrySelect: (countryCode: string) => void;
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
    isActive: false,
    deliveryDays: 7,
    deliveryCharges: 15
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    isActive: false,
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
    isActive: false,
    deliveryDays: 4,
    deliveryCharges: 8
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇫🇷',
    isActive: false,
    deliveryDays: 4,
    deliveryCharges: 8
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    flag: '🇨🇦',
    isActive: false,
    deliveryDays: 6,
    deliveryCharges: 18
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
    isActive: false,
    deliveryDays: 8,
    deliveryCharges: 22
  }
];

export const CountryManager = ({ selectedCountry, onCountrySelect }: CountryManagerProps) => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>(() => {
    const saved = localStorage.getItem('adminCountries');
    return saved ? JSON.parse(saved) : DEFAULT_COUNTRIES;
  });

  const updateCountries = (newCountries: Country[]) => {
    setCountries(newCountries);
    localStorage.setItem('adminCountries', JSON.stringify(newCountries));
  };

  const toggleCountryStatus = (countryCode: string) => {
    const updatedCountries = countries.map(country =>
      country.code === countryCode 
        ? { ...country, isActive: !country.isActive }
        : country
    );
    updateCountries(updatedCountries);
    
    const country = countries.find(c => c.code === countryCode);
    toast({
      title: `${country?.name} ${country?.isActive ? 'Deactivated' : 'Activated'}`,
      description: `${country?.name} operations ${country?.isActive ? 'stopped' : 'enabled'}.`,
    });
  };

  const updateDeliverySettings = (countryCode: string, field: 'deliveryDays' | 'deliveryCharges', value: number) => {
    const updatedCountries = countries.map(country =>
      country.code === countryCode 
        ? { ...country, [field]: value }
        : country
    );
    updateCountries(updatedCountries);
  };

  const getSelectedCountryData = () => {
    return countries.find(c => c.code === selectedCountry) || countries[0];
  };

  const activeCountries = countries.filter(c => c.isActive);
  const inactiveCountries = countries.filter(c => !c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Country Operations
        </h2>
        <Badge variant="outline" className="text-sm">
          {activeCountries.length} Active Countries
        </Badge>
      </div>

      {/* Selected Country Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{getSelectedCountryData().flag}</span>
            Currently Operating: {getSelectedCountryData().name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {getSelectedCountryData().currencySymbol}
              </div>
              <div className="text-sm text-muted-foreground">Currency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {getSelectedCountryData().deliveryDays}
              </div>
              <div className="text-sm text-muted-foreground">Delivery Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {getSelectedCountryData().currencySymbol}{getSelectedCountryData().deliveryCharges}
              </div>
              <div className="text-sm text-muted-foreground">Delivery Charges</div>
            </div>
            <div className="text-center">
              <Badge className={getSelectedCountryData().isActive ? "bg-success" : "bg-destructive"}>
                {getSelectedCountryData().isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            Active Countries ({activeCountries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {activeCountries.map((country) => (
              <div 
                key={country.code} 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCountry === country.code 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onCountrySelect(country.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <h3 className="font-semibold">{country.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {country.currency} • {country.deliveryDays} days delivery
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {country.currencySymbol}{country.deliveryCharges} shipping
                      </div>
                    </div>
                    <Switch
                      checked={country.isActive}
                      onCheckedChange={() => toggleCountryStatus(country.code)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Countries */}
      {inactiveCountries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-muted-foreground" />
              Available for Expansion ({inactiveCountries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {inactiveCountries.map((country) => (
                <div key={country.code} className="p-3 border rounded-lg border-dashed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl opacity-60">{country.flag}</span>
                      <div>
                        <h3 className="font-medium opacity-60">{country.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ready for activation • {country.currency}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCountryStatus(country.code)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};