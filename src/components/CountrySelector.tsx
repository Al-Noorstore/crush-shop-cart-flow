import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Country } from "./CountryManager";

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onCountrySelect: (countryCode: string) => void;
  detectedCountry?: string | null;
  className?: string;
}

export const CountrySelector = ({ 
  countries, 
  selectedCountry, 
  onCountrySelect, 
  detectedCountry,
  className = ""
}: CountrySelectorProps) => {
  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="country" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Country *
        </Label>
        {detectedCountry && (
          <Badge variant="outline" className="text-xs">
            Auto-detected
          </Badge>
        )}
      </div>
      
      <Select value={selectedCountry} onValueChange={onCountrySelect}>
        <SelectTrigger id="country" className="form-input">
          <SelectValue>
            {selectedCountryData && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountryData.flag}</span>
                <span>{selectedCountryData.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {selectedCountryData.currencySymbol}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2 w-full">
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="secondary" className="text-xs">
                    {country.currency}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {country.deliveryDays}d delivery
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCountryData && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>Currency: {selectedCountryData.currency}</span>
          <span>•</span>
          <span>Delivery: {selectedCountryData.deliveryDays} days</span>
          <span>•</span>
          <span>
            Shipping: {selectedCountryData.deliveryCharges === 0 
              ? 'Free' 
              : `${selectedCountryData.currencySymbol}${selectedCountryData.deliveryCharges}`
            }
          </span>
        </div>
      )}
    </div>
  );
};