import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Product } from "./ProductCard";
import { useCountryDetection } from "@/hooks/useCountryDetection";
import { usePricing } from "@/hooks/usePricing";

export interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
}

export const Cart = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) => {
  const { getCountryData } = useCountryDetection();
  const countryData = getCountryData();
  const { formatPrice, getShippingCost, formatShippingCost } = usePricing(countryData);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = getShippingCost();
  const total = subtotal + (shippingCost / (countryData ? (
    countryData.currency === 'USD' ? 1 : 
    countryData.currency === 'PKR' ? 280 :
    countryData.currency === 'GBP' ? 0.79 :
    countryData.currency === 'EUR' ? 0.85 :
    countryData.currency === 'RUB' ? 75 :
    countryData.currency === 'CAD' ? 1.25 :
    countryData.currency === 'AUD' ? 1.35 : 1
  ) : 1));

  const handleQuantityChange = (id: number, change: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      onUpdateQuantity(id, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart!
            </p>
            <Button onClick={onClose} className="btn-primary">
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Shopping Cart
            </div>
            <Badge variant="secondary">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                   <div className="text-right">
                     <span className="font-semibold">
                       {formatPrice(item.price * item.quantity)}
                     </span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span className={getShippingCost() === 0 ? "text-success" : ""}>
                {formatShippingCost()}
              </span>
            </div>
            {countryData && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>To {countryData.name}:</span>
                <span>{countryData.deliveryDays} days delivery</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          
          <Button
            onClick={onCheckout}
            className="w-full btn-success"
            size="lg"
          >
            Proceed to Checkout
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};