import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCountryDetection } from "@/hooks/useCountryDetection";
import { Product, CountryPricing, ProductMedia } from "@/types/Product";
import { useToast } from "@/hooks/use-toast";

interface EnhancedProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export const EnhancedProductForm = ({ product, onSave, onCancel }: EnhancedProductFormProps) => {
  const { toast } = useToast();
  const { countries } = useCountryDetection();
  
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    description: "",
    rating: "4.5",
    reviews: "0",
    isOnSale: false,
    isBestSeller: false
  });

  const [features, setFeatures] = useState<string[]>([""]);
  const [media, setMedia] = useState<ProductMedia[]>([
    { id: "img1", url: "", type: "image" as const },
    { id: "img2", url: "", type: "image" as const },
    { id: "img3", url: "", type: "image" as const }
  ]);
  const [videos, setVideos] = useState<ProductMedia[]>([
    { id: "vid1", url: "", type: "video" as const },
    { id: "vid2", url: "", type: "video" as const }
  ]);
  
  const [countryPricing, setCountryPricing] = useState<CountryPricing[]>([]);

  useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name,
        category: product.category,
        description: product.description || "",
        rating: product.rating.toString(),
        reviews: product.reviews.toString(),
        isOnSale: product.isOnSale || false,
        isBestSeller: product.isBestSeller || false
      });
      
      setFeatures(product.features || [""]);
      
      if (product.media) {
        const images = product.media.filter(m => m.type === 'image');
        const vids = product.media.filter(m => m.type === 'video');
        setMedia(images.length > 0 ? images : [{ id: "img1", url: "", type: "image" }]);
        setVideos(vids.length > 0 ? vids : [{ id: "vid1", url: "", type: "video" }]);
      }
      
      if (product.countryPricing && product.countryPricing.length > 0) {
        setCountryPricing(product.countryPricing);
      } else {
        // If no country pricing exists yet, initialize with active countries
        const initialPricing = countries.map(country => ({
          countryCode: country.code,
          isActive: true,
          originalPrice: 0,
          price: 0,
          shippingCharges: country.deliveryCharges,
          isFreeShipping: false
        }));
        setCountryPricing(initialPricing);
      }
    } else {
      // Initialize with all active countries for new product
      const initialPricing = countries.map(country => ({
        countryCode: country.code,
        isActive: true,
        originalPrice: 0,
        price: 0,
        shippingCharges: country.deliveryCharges,
        isFreeShipping: false
      }));
      setCountryPricing(initialPricing);
    }
  }, [product, countries]);

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const addMedia = (type: 'image' | 'video') => {
    const newId = Date.now().toString();
    const newMediaItem = { id: newId, url: "", type };
    
    if (type === 'image') {
      setMedia([...media, newMediaItem]);
    } else {
      setVideos([...videos, newMediaItem]);
    }
  };

  const updateMedia = (id: string, url: string, type: 'image' | 'video') => {
    if (type === 'image') {
      setMedia(media.map(m => m.id === id ? { ...m, url } : m));
    } else {
      setVideos(videos.map(v => v.id === id ? { ...v, url } : v));
    }
  };

  const removeMedia = (id: string, type: 'image' | 'video') => {
    if (type === 'image') {
      if (media.length > 1) {
        setMedia(media.filter(m => m.id !== id));
      }
    } else {
      if (videos.length > 1) {
        setVideos(videos.filter(v => v.id !== id));
      }
    }
  };

  const updateCountryPricing = (countryCode: string, field: keyof CountryPricing, value: any) => {
    setCountryPricing(prev => {
      const updated = prev.map(pricing => 
        pricing.countryCode === countryCode 
          ? { ...pricing, [field]: value }
          : pricing
      );
      console.log('Updated country pricing for', countryCode, field, value, ':', updated);
      return updated;
    });
  };

  const addCountry = () => {
    // Add a new country slot (admin can select which country to add)
    const newCountryCode = 'NEW';
    setCountryPricing([...countryPricing, {
      countryCode: newCountryCode,
      isActive: false,
      originalPrice: 0,
      price: 0,
      shippingCharges: 0,
      isFreeShipping: false
    }]);
  };

  const handleSave = () => {
    if (!productForm.name || !productForm.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate that at least one country is active
    const activeCountries = countryPricing.filter(cp => cp.isActive);
    if (activeCountries.length === 0) {
      toast({
        title: "Error",
        description: "Please activate at least one country for this product.",
        variant: "destructive"
      });
      return;
    }

    // Get primary image for backward compatibility
    const primaryImage = media.find(m => m.url)?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop";
    
    // Get primary pricing (from first active country) for backward compatibility
    const primaryPricing = activeCountries[0];

    const newProduct: Product = {
      id: product?.id || Date.now(),
      name: productForm.name,
      price: primaryPricing.price,
      originalPrice: primaryPricing.originalPrice > 0 ? primaryPricing.originalPrice : undefined,
      image: primaryImage,
      category: productForm.category,
      rating: parseFloat(productForm.rating),
      reviews: parseInt(productForm.reviews),
      isOnSale: productForm.isOnSale,
      isBestSeller: productForm.isBestSeller,
      description: productForm.description,
      features: features.filter(f => f.trim()),
      media: [...media, ...videos].filter(m => m.url.trim()),
      countryPricing: countryPricing.filter(cp => cp.countryCode !== 'NEW')
    };

    onSave(newProduct);
  };

  const getCountryName = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? `${country.flag} ${country.name}` : countryCode;
  };

  const getCurrencySymbol = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    return country?.currencySymbol || '$';
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Product Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Enter product name"
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                placeholder="e.g., Electronics, Clothing"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Product Description</Label>
            <Textarea
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              placeholder="Detailed product description"
              className="form-input min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Media */}
      <Card>
        <CardHeader>
          <CardTitle>Product Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Product Images</Label>
            {media.map((img, index) => (
              <div key={img.id} className="flex gap-2 items-center">
                <Input
                  value={img.url}
                  onChange={(e) => updateMedia(img.id, e.target.value, 'image')}
                  placeholder={`Image URL ${index + 1}`}
                  className="form-input flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
                {media.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMedia(img.id, 'image')}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={() => addMedia('image')} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add More Images
            </Button>
          </div>

          {/* Videos */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Product Videos</Label>
            {videos.map((video, index) => (
              <div key={video.id} className="flex gap-2 items-center">
                <Input
                  value={video.url}
                  onChange={(e) => updateMedia(video.id, e.target.value, 'video')}
                  placeholder={`Video URL ${index + 1}`}
                  className="form-input flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
                {videos.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMedia(video.id, 'video')}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={() => addMedia('video')} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add More Videos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Features */}
      <Card>
        <CardHeader>
          <CardTitle>Product Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-sm font-medium">•</span>
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="form-input flex-1"
              />
              {features.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addFeature} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add More Features
          </Button>
        </CardContent>
      </Card>

      {/* Countries and Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Countries and Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Activate</th>
                  <th className="border border-border p-3 text-left">Country</th>
                  <th className="border border-border p-3 text-left">Original Price</th>
                  <th className="border border-border p-3 text-left">Price</th>
                  <th className="border border-border p-3 text-left">Shipping Charges</th>
                  <th className="border border-border p-3 text-left">Free Shipping</th>
                </tr>
              </thead>
              <tbody>
                {countryPricing.map((pricing) => (
                  <tr key={pricing.countryCode}>
                    <td className="border border-border p-3">
                      <Checkbox
                        checked={pricing.isActive}
                        onCheckedChange={(checked) => {
                          console.log('Checkbox changed for', pricing.countryCode, 'to:', checked);
                          updateCountryPricing(pricing.countryCode, 'isActive', checked === true);
                        }}
                      />
                    </td>
                    <td className="border border-border p-3">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {getCountryName(pricing.countryCode)}
                      </Badge>
                    </td>
                    <td className="border border-border p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(pricing.countryCode)}</span>
                        <Input
                          type="number"
                          value={pricing.originalPrice || 0}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            console.log('Original price changed for', pricing.countryCode, 'to:', value);
                            updateCountryPricing(pricing.countryCode, 'originalPrice', value || 0);
                          }}
                          className="w-20 text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="border border-border p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(pricing.countryCode)}</span>
                        <Input
                          type="number"
                          value={pricing.price || 0}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            console.log('Price changed for', pricing.countryCode, 'to:', value);
                            updateCountryPricing(pricing.countryCode, 'price', value || 0);
                          }}
                          className="w-20 text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="border border-border p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(pricing.countryCode)}</span>
                        <Input
                          type="number"
                          value={pricing.shippingCharges || 0}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            console.log('Shipping charges changed for', pricing.countryCode, 'to:', value);
                            // If user enters shipping charges, turn off free shipping
                            if (value > 0) {
                              updateCountryPricing(pricing.countryCode, 'isFreeShipping', false);
                            }
                            updateCountryPricing(pricing.countryCode, 'shippingCharges', value || 0);
                          }}
                          className="w-20 text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          disabled={pricing.isFreeShipping}
                        />
                      </div>
                    </td>
                    <td className="border border-border p-3">
                      <Checkbox
                        checked={pricing.isFreeShipping}
                        onCheckedChange={(checked) => {
                          console.log('Free shipping changed for', pricing.countryCode, 'to:', checked);
                          updateCountryPricing(pricing.countryCode, 'isFreeShipping', checked === true);
                          if (checked) {
                            updateCountryPricing(pricing.countryCode, 'shippingCharges', 0);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="border border-border p-3">
                    <Button variant="outline" onClick={addCountry} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add More Countries
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <Input
                type="number"
                value={productForm.rating}
                onChange={(e) => setProductForm({...productForm, rating: e.target.value})}
                min="0"
                max="5"
                step="0.1"
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Reviews Count</Label>
              <Input
                type="number"
                value={productForm.reviews}
                onChange={(e) => setProductForm({...productForm, reviews: e.target.value})}
                min="0"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={productForm.isOnSale}
                onCheckedChange={(checked) => setProductForm({...productForm, isOnSale: !!checked})}
              />
              <Label>On Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={productForm.isBestSeller}
                onCheckedChange={(checked) => setProductForm({...productForm, isBestSeller: !!checked})}
              />
              <Label>Best Seller</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button onClick={handleSave} className="btn-primary flex-1">
          {product ? "Update Product" : "Add Product"}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};