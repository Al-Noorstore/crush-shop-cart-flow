import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/Product";
import { ProductModal } from "@/components/ProductModal";
import { Cart, CartItem } from "@/components/Cart";
import { CheckoutForm } from "@/components/CheckoutForm";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminLogin } from "@/components/AdminLogin";
import { CustomerAuth, CustomerUser } from "@/components/CustomerAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Filter, SortAsc, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCountryDetection } from "@/hooks/useCountryDetection";

const Index = () => {
  const { toast } = useToast();
  const { isAdminLoggedIn, setIsAdminLoggedIn, setCurrentCustomer } = useAuth();
  const { getCountryData } = useCountryDetection();
  
  // Sample product data
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 89.99,
      originalPrice: 129.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
      category: "Electronics",
      rating: 4.5,
      reviews: 234,
      isOnSale: true,
      isBestSeller: true
    },
    {
      id: 2,
      name: "Stylish Leather Backpack",
      price: 159.99,
      originalPrice: 199.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
      category: "Fashion",
      rating: 4.8,
      reviews: 187,
      isOnSale: true,
      isBestSeller: false
    },
    {
      id: 3,
      name: "Smart Fitness Watch",
      price: 249.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
      category: "Electronics",
      rating: 4.3,
      reviews: 156,
      isOnSale: false,
      isBestSeller: true
    },
    {
      id: 4,
      name: "Organic Coffee Beans",
      price: 24.99,
      originalPrice: 29.99,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
      category: "Food & Beverages",
      rating: 4.7,
      reviews: 89,
      isOnSale: true,
      isBestSeller: false
    },
    {
      id: 5,
      name: "Comfortable Running Shoes",
      price: 119.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop",
      category: "Fashion",
      rating: 4.4,
      reviews: 203,
      isOnSale: false,
      isBestSeller: true
    },
    {
      id: 6,
      name: "Vintage Desk Lamp",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
      category: "Home & Garden",
      rating: 4.2,
      reviews: 67,
      isOnSale: true,
      isBestSeller: false
    },
    {
      id: 7,
      name: "Wireless Bluetooth Speaker",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
      category: "Electronics",
      rating: 4.6,
      reviews: 145,
      isOnSale: false,
      isBestSeller: false
    },
    {
      id: 8,
      name: "Cozy Throw Blanket",
      price: 39.99,
      originalPrice: 59.99,
      image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=300&h=200&fit=crop",
      category: "Home & Garden",
      rating: 4.9,
      reviews: 178,
      isOnSale: true,
      isBestSeller: true
    }
  ]);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      
      // Country availability check
      const currentCountry = getCountryData();
      // If product has country pricing, check availability; otherwise show all products (legacy compatibility)
      const isAvailableInCountry = currentCountry && product.countryPricing?.length > 0
        ? product.countryPricing.some(cp => cp.countryCode === currentCountry.code && cp.isActive) 
        : true; // Show all products if no country detected or no country pricing configured
      
      return matchesSearch && matchesCategory && isAvailableInCountry;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Cart functions
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    });
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Product modal functions
  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handlePlaceOrder = (product: Product) => {
    // For direct order, create a temporary cart with just this product
    const tempCartItems = [{ ...product, quantity: 1 }];
    setCartItems(tempCartItems);
    setIsProductModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
  };

  const handleCustomerAuthSuccess = (user: CustomerUser) => {
    setCurrentCustomer(user);
    setIsCustomerAuthOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        cartItemCount={getTotalCartItems()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={handleAdminClick}
        onCustomerAuthClick={() => setIsCustomerAuthOpen(true)}
      />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to MR Crush Shop
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
            Discover amazing products with worldwide shipping
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
              Free Shipping Worldwide
            </Badge>
            <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
              30-Day Returns
            </Badge>
            <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
              24/7 Support
            </Badge>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "btn-primary" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "price" | "rating" | "name")}
                  className="form-input text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="w-8 h-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="w-8 h-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Search results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-4">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MR Crush Shop</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted partner for quality products worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Shipping Info</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Electronics</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Fashion</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Home & Garden</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Food & Beverages</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Track Order</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Size Guide</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MR Crush Shop. All rights reserved. Made with ❤️ for worldwide customers.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={addToCart}
        onPlaceOrder={handlePlaceOrder}
      />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        orderTotal={getCartTotal()}
      />

      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={setProducts}
      />

      <CustomerAuth
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onSuccess={handleCustomerAuthSuccess}
      />
    </div>
  );
};

export default Index;
