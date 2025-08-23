import { useState } from "react";
import { X, Star, ShoppingCart, CreditCard, Heart, Share2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/Product";
import { useCountryDetection } from "@/hooks/useCountryDetection";
import { usePricing } from "@/hooks/usePricing";
import { ImageSlider } from "@/components/ImageSlider";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onPlaceOrder: (product: Product) => void;
}

export const ProductModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onPlaceOrder,
}: ProductModalProps) => {
  const [imageSliderOpen, setImageSliderOpen] = useState(false);
  
  if (!product) return null;

  const { getCountryData } = useCountryDetection();
  const countryData = getCountryData();
  const { formatPrice, formatShippingCost } = usePricing(countryData);

  // Get all product images from media array
  const productImages = product.media?.filter(m => m.type === 'image' && m.url) || [];
  // If no media images, use the main product image
  const allImages = productImages.length > 0 
    ? productImages 
    : [{ id: 'main', url: product.image, type: 'image' as const }];

  // Use per-country pricing if available and active
  const countryPricing = product.countryPricing?.find(
    (cp) => cp.countryCode === countryData?.code && cp.isActive
  );
  const currentPrice = countryPricing?.price ?? product.price;
  const currentOriginalPrice = countryPricing?.originalPrice ?? product.originalPrice;
  const isFreeShipping = countryPricing?.isFreeShipping ?? false;

  const discountPercentage = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart(product);
    // Show animation or toast here
  };

  const handlePlaceOrder = () => {
    onPlaceOrder(product);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <DialogHeader>
          <DialogTitle className="sr-only">Product Details</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative cursor-pointer" onClick={() => setImageSliderOpen(true)}>
              <img
                src={allImages[0]?.url || product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
              />
              {/* View All Images Button */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Images className="w-4 h-4" />
                  {allImages.length} Photos
                </div>
              )}
              {product.isOnSale && (
                <Badge className="absolute top-4 left-4 sale-badge">
                  -{discountPercentage}% OFF
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">
                  Best Seller
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-foreground">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {currentOriginalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(currentOriginalPrice)}
                  </span>
                )}
              </div>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <p className="text-success font-semibold">
                  You save {formatPrice(currentOriginalPrice - currentPrice)}!
                </p>
              )}
              {countryData && (
                <p className="text-sm text-muted-foreground">
                  Price in {countryData.name} ({countryData.currency})
                </p>
              )}
            </div>


            {/* Product Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                {product.features && product.features.length > 0 ? (
                  product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Premium Quality Materials
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Worldwide Shipping Available
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      30-Day Money Back Guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      24/7 Customer Support
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-cart animate-cart-add"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  className="flex-1 btn-primary"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Place Order
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping to {countryData?.name || 'your location'}:</span>
                  <span className="font-medium">
                    {countryPricing
                      ? (isFreeShipping
                          ? 'Free'
                          : `${countryData?.currencySymbol || '$'}${(countryPricing.shippingCharges || 0).toFixed(2)}`)
                      : formatShippingCost()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="font-medium">
                    {countryData?.deliveryDays || 3}-{(countryData?.deliveryDays || 3) + 4} business days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Returns:</span>
                  <span className="font-medium">30-day return policy</span>
                </div>
                {countryData && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{countryData.currency}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Slider Modal */}
        <ImageSlider
          isOpen={imageSliderOpen}
          onClose={() => setImageSliderOpen(false)}
          images={allImages}
          initialIndex={0}
        />
      </DialogContent>
    </Dialog>
  );
};