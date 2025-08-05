import { useState, useEffect } from "react";
import { CreditCard, MapPin, User, Phone, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CartItem } from "./Cart";
import { CountrySelector } from "./CountrySelector";
import { useToast } from "@/hooks/use-toast";
import { useCountryDetection } from "@/hooks/useCountryDetection";
import { usePricing } from "@/hooks/usePricing";

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  orderTotal: number;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
}

export const CheckoutForm = ({ isOpen, onClose, cartItems, orderTotal }: CheckoutFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Country detection and pricing hooks
  const { 
    detectedCountry, 
    selectedCountry, 
    setSelectedCountry, 
    detectCountryFromPhone, 
    getCountryData,
    countries 
  } = useCountryDetection();
  
  const countryData = getCountryData();
  const { 
    convertPrice, 
    formatPrice, 
    getShippingCost, 
    formatShippingCost, 
    getCurrencySymbol 
  } = usePricing(countryData);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: selectedCountry,
    notes: ""
  });

  // Update country in shipping info when selected country changes
  useEffect(() => {
    setShippingInfo(prev => ({ ...prev, country: selectedCountry }));
  }, [selectedCountry]);

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    
    // Auto-detect country from phone number
    if (field === 'phone') {
      const detected = detectCountryFromPhone(value);
      if (detected) {
        setShippingInfo(prev => ({ ...prev, country: detected }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate total with shipping and currency conversion
      const convertedSubtotal = cartItems.reduce((sum, item) => 
        sum + convertPrice(item.price) * item.quantity, 0
      );
      const shippingCost = getShippingCost();
      const finalTotal = convertedSubtotal + shippingCost;

      // In a real app, you would send this data to your backend
      const orderData = {
        items: cartItems,
        shippingInfo: { ...shippingInfo, country: selectedCountry },
        subtotal: convertedSubtotal,
        shippingCost,
        total: finalTotal,
        currency: countryData?.currency || 'USD',
        countryCode: selectedCountry,
        orderDate: new Date().toISOString(),
        orderId: Math.random().toString(36).substr(2, 9).toUpperCase()
      };

      console.log("Order submitted:", orderData);
      
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderData.orderId} has been submitted. You'll receive a confirmation email shortly.`,
      });

      onClose();
      
      // Reset form
      setShippingInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        notes: ""
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = shippingInfo.firstName && 
    shippingInfo.lastName && 
    shippingInfo.email && 
    shippingInfo.phone && 
    shippingInfo.address && 
    shippingInfo.city && 
    shippingInfo.zipCode && 
    shippingInfo.country;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Checkout - MR Crush Shop
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="New York"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="NY"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="10001"
                        className="form-input"
                        required
                      />
                    </div>
                     <CountrySelector
                       countries={countries}
                       selectedCountry={selectedCountry}
                       onCountrySelect={setSelectedCountry}
                       detectedCountry={detectedCountry}
                     />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={shippingInfo.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any special delivery instructions..."
                      className="form-input"
                      rows={3}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                       <span className="font-semibold">
                         {formatPrice(item.price * item.quantity)}
                       </span>
                    </div>
                  ))}
                </div>

                 <div className="space-y-2 pt-4">
                   <div className="flex justify-between text-sm">
                     <span>Subtotal:</span>
                     <span>{formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Shipping:</span>
                     <span className={getShippingCost() === 0 ? "text-success" : ""}>
                       {formatShippingCost()}
                     </span>
                   </div>
                   {countryData && (
                     <div className="flex justify-between text-xs text-muted-foreground">
                       <span>Delivery time:</span>
                       <span>{countryData.deliveryDays} days</span>
                     </div>
                   )}
                   <div className="flex justify-between text-lg font-bold border-t pt-2">
                     <span>Total:</span>
                     <span>
                       {formatPrice(
                         cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                       )} + {formatShippingCost()}
                     </span>
                   </div>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span className="font-medium">Payment Method</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Payment will be processed securely after order confirmation.
                      We accept all major credit cards and PayPal.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Secure SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Worldwide Shipping</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full btn-success"
              size="lg"
            >
              {isSubmitting ? "Processing..." : `Place Order - ${formatPrice(
                cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 
                (getShippingCost() / (countryData ? (
                  countryData.currency === 'USD' ? 1 : 
                  countryData.currency === 'PKR' ? 280 :
                  countryData.currency === 'GBP' ? 0.79 :
                  countryData.currency === 'EUR' ? 0.85 :
                  countryData.currency === 'RUB' ? 75 :
                  countryData.currency === 'CAD' ? 1.25 :
                  countryData.currency === 'AUD' ? 1.35 : 1
                ) : 1))
              )}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};