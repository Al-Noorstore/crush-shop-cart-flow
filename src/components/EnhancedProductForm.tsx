import { useState, useEffect, useMemo } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
interface EnhancedProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  categories?: string[];
}

export const EnhancedProductForm = ({ product, onSave, onCancel, categories }: EnhancedProductFormProps) => {
  const { toast } = useToast();
  const { countries } = useCountryDetection();
  
  // Prefer admin-managed countries list if present; fallback to active countries from hook
  const allCountries = useMemo(() => {
    try {
      const saved = localStorage.getItem('adminCountries');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : countries;
    } catch {
      return countries;
    }
  }, [countries]);
  
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    newCategory: "",
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
        newCategory: "",
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
      console.log('Updated country pricing for', countryCode, field, ':', value, 'Result:', updated);
      return updated;
    });
  };

  const addCountry = () => {
    // Add the first country that's not already in the pricing list
    const unused = allCountries.filter(c => !countryPricing.some(cp => cp.countryCode === c.code));
    if (unused.length === 0) {
      toast({
        title: "All countries added",
        description: "You have already added all available countries.",
      });
      return;
    }
    const next = unused[0];
    setCountryPricing([
      ...countryPricing,
      {
        countryCode: next.code,
        isActive: true,
        originalPrice: 0,
        price: 0,
        shippingCharges: next.deliveryCharges || 0,
        isFreeShipping: false,
      },
    ]);
  };

  const handleSave = () => {
    const finalCategory = productForm.category === "__new__" ? productForm.newCategory.trim() : productForm.category.trim();
    if (!productForm.name.trim() || !finalCategory) {
      toast({
        title: "Error",
        description: "Please fill in product name and category.",
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
      name: productForm.name.trim(),
      price: primaryPricing.price,
      originalPrice: primaryPricing.originalPrice > 0 ? primaryPricing.originalPrice : undefined,
      image: primaryImage,
      category: finalCategory,
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
    const country = allCountries.find((c: any) => c.code === countryCode);
    return country ? `${country.flag} ${country.name}` : countryCode;
  };

  const getCurrencySymbol = (countryCode: string) => {
    const country = allCountries.find((c: any) => c.code === countryCode);
    return country?.currencySymbol || '$';
  };
  return (
    <div className="bg-background border border-border rounded-lg p-6 max-w-4xl mx-auto">
      <div className="border-b border-border pb-4 mb-6">
        <h2 className="text-xl font-bold text-center">Add/Edit Product</h2>
      </div>
      
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Product Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Product Name:</Label>
            <Input
              value={productForm.name}
              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
              placeholder="Enter product name"
              className="w-full"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Product Images:</Label>
          {media.slice(0, 4).map((img, index) => (
            <div key={img.id} className="flex gap-2 items-center">
              <Input
                value={img.url}
                onChange={(e) => updateMedia(img.id, e.target.value, 'image')}
                placeholder={`Image URL ${index + 1}`}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeMedia(img.id, 'image')}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => addMedia('image')} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            Add More Images
          </Button>
        </div>

        {/* Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category:</Label>
            <Select
              value={productForm.category}
              onValueChange={(value) => setProductForm({ ...productForm, category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Dropdown for existing categories" />
              </SelectTrigger>
              <SelectContent>
                {(categories || []).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="__new__">Add New Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">If New Category:</Label>
            <Input
              value={productForm.newCategory}
              onChange={(e) => setProductForm({ ...productForm, newCategory: e.target.value })}
              placeholder="Enter new category name"
              className="w-full"
              disabled={productForm.category !== "__new__"}
            />
          </div>
        </div>

        {/* Product Videos */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Product Videos:</Label>
          {videos.slice(0, 2).map((video, index) => (
            <div key={video.id} className="flex gap-2 items-center">
              <Input
                value={video.url}
                onChange={(e) => updateMedia(video.id, e.target.value, 'video')}
                placeholder={`Video URL ${index + 1}`}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeMedia(video.id, 'video')}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => addMedia('video')} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            Add More Videos
          </Button>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Product Description:</Label>
          <Textarea
            value={productForm.description}
            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
            placeholder="Enter detailed product description"
            className="w-full min-h-[100px]"
          />
        </div>

        {/* Product Features */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Product Features:</Label>
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-sm font-medium">-</span>
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="flex-1"
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
          <Button variant="outline" onClick={addFeature} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            Add More Features
          </Button>
        </div>

        {/* Countries and Pricing */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Countries:</Label>
          <div className="space-y-2">
            {countryPricing.map((pricing) => (
              <div key={pricing.countryCode} className="border border-border rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={pricing.isActive}
                      onCheckedChange={(checked) => {
                        updateCountryPricing(pricing.countryCode, 'isActive', checked === true);
                      }}
                    />
                    <span className="font-medium">{getCountryName(pricing.countryCode)}</span>
                  </div>
                  <Badge variant={pricing.isActive ? "default" : "secondary"}>
                    {pricing.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                {pricing.isActive && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Original Price:</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(pricing.countryCode)}</span>
                        <Input
                          type="number"
                          value={pricing.originalPrice || 0}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            updateCountryPricing(pricing.countryCode, 'originalPrice', value || 0);
                          }}
                          className="text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Price:</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(pricing.countryCode)}</span>
                        <Input
                          type="number"
                          value={pricing.price || 0}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            updateCountryPricing(pricing.countryCode, 'price', value || 0);
                          }}
                          className="text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={pricing.isFreeShipping}
                          onCheckedChange={(checked) => {
                            updateCountryPricing(pricing.countryCode, 'isFreeShipping', checked === true);
                            if (checked) {
                              updateCountryPricing(pricing.countryCode, 'shippingCharges', 0);
                            }
                          }}
                        />
                        <Label className="text-xs">Free Shipping</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Shipping Charges:</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(pricing.countryCode)}</span>
                        <Input
                          type="number"
                          value={pricing.shippingCharges || 0}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            if (value > 0) {
                              updateCountryPricing(pricing.countryCode, 'isFreeShipping', false);
                            }
                            updateCountryPricing(pricing.countryCode, 'shippingCharges', value || 0);
                          }}
                          className="text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          disabled={pricing.isFreeShipping}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addCountry} className="w-fit">
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </div>
        </div>

        {/* Product Rating and Reviews */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating:</Label>
            <Input
              type="number"
              value={productForm.rating}
              onChange={(e) => setProductForm({...productForm, rating: e.target.value})}
              min="0"
              max="5"
              step="0.1"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reviews Count:</Label>
            <Input
              type="number"
              value={productForm.reviews}
              onChange={(e) => setProductForm({...productForm, reviews: e.target.value})}
              min="0"
              className="w-full"
            />
          </div>
        </div>

        {/* Product Flags */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={productForm.isOnSale}
              onCheckedChange={(checked) => setProductForm({...productForm, isOnSale: !!checked})}
            />
            <Label className="text-sm font-medium">On Sale:</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={productForm.isBestSeller}
              onCheckedChange={(checked) => setProductForm({...productForm, isBestSeller: !!checked})}
            />
            <Label className="text-sm font-medium">Best Seller:</Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-border">
          <Button onClick={handleSave} className="flex-1" variant="default">
            {product ? "Save" : "Add Product"}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};