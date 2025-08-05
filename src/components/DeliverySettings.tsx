import { useState } from "react";
import { Truck, Clock, DollarSign, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Country } from "./CountryManager";

interface DeliverySettingsProps {
  countries: Country[];
  selectedCountry: string;
  onCountriesUpdate: (countries: Country[]) => void;
}

export const DeliverySettings = ({ countries, selectedCountry, onCountriesUpdate }: DeliverySettingsProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const currentCountry = countries.find(c => c.code === selectedCountry);
  const [tempSettings, setTempSettings] = useState({
    deliveryDays: currentCountry?.deliveryDays || 3,
    deliveryCharges: currentCountry?.deliveryCharges || 0,
    freeDeliveryEnabled: currentCountry ? currentCountry.deliveryCharges === 0 : false
  });

  const handleSaveSettings = () => {
    const updatedCountries = countries.map(country =>
      country.code === selectedCountry 
        ? { 
            ...country, 
            deliveryDays: tempSettings.deliveryDays,
            deliveryCharges: tempSettings.freeDeliveryEnabled ? 0 : tempSettings.deliveryCharges
          }
        : country
    );
    
    onCountriesUpdate(updatedCountries);
    setIsEditing(false);
    
    toast({
      title: "Delivery Settings Updated",
      description: `Settings updated for ${currentCountry?.name}.`,
    });
  };

  const handleResetToDefault = () => {
    if (currentCountry) {
      setTempSettings({
        deliveryDays: currentCountry.deliveryDays,
        deliveryCharges: currentCountry.deliveryCharges,
        freeDeliveryEnabled: currentCountry.deliveryCharges === 0
      });
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    if (currentCountry) {
      setTempSettings({
        deliveryDays: currentCountry.deliveryDays,
        deliveryCharges: currentCountry.deliveryCharges,
        freeDeliveryEnabled: currentCountry.deliveryCharges === 0
      });
      setIsEditing(true);
    }
  };

  if (!currentCountry) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Country Selected</h3>
          <p className="text-muted-foreground">
            Please select a country to manage delivery settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          Delivery Settings
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentCountry.flag}</span>
          <span className="font-medium">{currentCountry.name}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Delivery Configuration</span>
            {!isEditing && (
              <Button onClick={startEditing} variant="outline" size="sm">
                Edit Settings
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Settings Display */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{currentCountry.deliveryDays}</div>
                <div className="text-sm text-muted-foreground">Delivery Days</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {currentCountry.deliveryCharges === 0 
                    ? 'FREE' 
                    : `${currentCountry.currencySymbol}${currentCountry.deliveryCharges}`
                  }
                </div>
                <div className="text-sm text-muted-foreground">Delivery Charges</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Truck className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {currentCountry.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
                <div className="text-sm text-muted-foreground">Service Status</div>
              </div>
            </div>
          )}

          {/* Edit Settings Form */}
          {isEditing && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="delivery-days">Delivery Duration (Days)</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="delivery-days"
                      type="number"
                      min="1"
                      max="30"
                      value={tempSettings.deliveryDays}
                      onChange={(e) => setTempSettings({
                        ...tempSettings,
                        deliveryDays: parseInt(e.target.value) || 1
                      })}
                      className="form-input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard delivery time for {currentCountry.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-charges">Delivery Charges ({currentCountry.currency})</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="delivery-charges"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tempSettings.deliveryCharges}
                      onChange={(e) => setTempSettings({
                        ...tempSettings,
                        deliveryCharges: parseFloat(e.target.value) || 0
                      })}
                      disabled={tempSettings.freeDeliveryEnabled}
                      className="form-input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shipping cost in {currentCountry.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="free-delivery" className="text-base font-medium">
                    Free Delivery
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable free shipping for all orders to {currentCountry.name}
                  </p>
                </div>
                <Switch
                  id="free-delivery"
                  checked={tempSettings.freeDeliveryEnabled}
                  onCheckedChange={(checked) => setTempSettings({
                    ...tempSettings,
                    freeDeliveryEnabled: checked,
                    deliveryCharges: checked ? 0 : tempSettings.deliveryCharges
                  })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveSettings} className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleResetToDefault} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Info for All Countries */}
      <Card>
        <CardHeader>
          <CardTitle>All Countries Delivery Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {countries.map((country) => (
              <div 
                key={country.code} 
                className={`p-3 border rounded-lg ${country.isActive ? 'border-success/30 bg-success/5' : 'border-border'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <div>
                      <div className="font-medium">{country.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {country.isActive ? 'Active' : 'Inactive'} • {country.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{country.deliveryDays} days</div>
                    <div className="text-muted-foreground">
                      {country.deliveryCharges === 0 
                        ? 'Free delivery' 
                        : `${country.currencySymbol}${country.deliveryCharges} shipping`
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};