import { useState } from "react";
import { Plus, Edit, Trash2, Package, Users, BarChart3, Settings, X, Upload, Key, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Product } from "./ProductCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

type AdminTab = "products" | "orders" | "analytics" | "settings";

export const AdminPanel = ({ isOpen, onClose, products, onUpdateProducts }: AdminPanelProps) => {
  const { toast } = useToast();
  const { adminLogout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "",
    rating: "4.5",
    reviews: "0",
    isOnSale: false,
    isBestSeller: false
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      originalPrice: "",
      image: "",
      category: "",
      rating: "4.5",
      reviews: "0",
      isOnSale: false,
      isBestSeller: false
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      image: product.image,
      category: product.category,
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      isOnSale: product.isOnSale || false,
      isBestSeller: product.isBestSeller || false
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    onUpdateProducts(updatedProducts);
    toast({
      title: "Product Deleted",
      description: "Product has been removed from the catalog.",
    });
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || Date.now(),
      name: productForm.name,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
      image: productForm.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      category: productForm.category,
      rating: parseFloat(productForm.rating),
      reviews: parseInt(productForm.reviews),
      isOnSale: productForm.isOnSale,
      isBestSeller: productForm.isBestSeller
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? newProduct : p);
    } else {
      updatedProducts = [...products, newProduct];
    }

    onUpdateProducts(updatedProducts);
    setIsProductModalOpen(false);
    
    toast({
      title: editingProduct ? "Product Updated" : "Product Added",
      description: `${newProduct.name} has been ${editingProduct ? "updated" : "added to"} the catalog.`,
    });
  };

  const handlePasswordChange = () => {
    const currentAdminPassword = localStorage.getItem('adminPassword') || '548413';
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.currentPassword !== currentAdminPassword) {
      toast({
        title: "Incorrect Password",
        description: "Current password is incorrect.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('adminPassword', passwordForm.newPassword);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsPasswordChangeOpen(false);
    
    toast({
      title: "Password Updated",
      description: "Admin password has been changed successfully.",
    });
  };

  const handleLogout = () => {
    adminLogout();
    onClose();
    toast({
      title: "Logged Out",
      description: "You have been logged out of admin panel.",
    });
  };

  const TabButton = ({ tab, icon: Icon, label }: { tab: AdminTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`admin-nav ${activeTab === tab ? 'active' : ''}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              MR Crush Shop - Admin Panel
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-full">
          {/* Sidebar */}
          <div className="w-64 border-r pr-6">
            <nav className="space-y-2">
              <TabButton tab="products" icon={Package} label="Products" />
              <TabButton tab="orders" icon={BarChart3} label="Orders" />
              <TabButton tab="analytics" icon={BarChart3} label="Analytics" />
              <TabButton tab="settings" icon={Settings} label="Settings" />
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Product Management</h2>
                  <Button onClick={handleAddProduct} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{product.name}</h3>
                              {product.isBestSeller && (
                                <Badge className="bg-warning text-warning-foreground">Best Seller</Badge>
                              )}
                              {product.isOnSale && (
                                <Badge className="sale-badge">On Sale</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Order Management</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                      <p className="text-muted-foreground">
                        Orders will appear here once customers start placing them.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{products.length}</div>
                        <div className="text-sm text-muted-foreground">Total Products</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success">0</div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-warning">$0</div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                
                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => setIsPasswordChangeOpen(true)}
                      className="btn-primary"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Admin Password
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Change your admin panel access password for enhanced security.
                    </p>
                  </CardContent>
                </Card>

                {/* Store Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Store Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Store Name</Label>
                        <Input value="MR Crush Shop" className="form-input" />
                      </div>
                      <div className="space-y-2">
                        <Label>Store Email</Label>
                        <Input value="Info.mrcrushshop@gmail.com" className="form-input" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Store Description</Label>
                      <Textarea 
                        value="Worldwide e-commerce store with premium products and fast shipping."
                        className="form-input"
                      />
                    </div>
                    <Button className="btn-primary">Save Settings</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Product Modal */}
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (if on sale)</Label>
                  <Input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={productForm.rating}
                    onChange={(e) => setProductForm({...productForm, rating: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reviews Count</Label>
                  <Input
                    type="number"
                    value={productForm.reviews}
                    onChange={(e) => setProductForm({...productForm, reviews: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isOnSale}
                    onChange={(e) => setProductForm({...productForm, isOnSale: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span>On Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({...productForm, isBestSeller: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span>Best Seller</span>
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveProduct} className="btn-primary">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button onClick={() => setIsProductModalOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Change Modal */}
        <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Change Admin Password
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                    className="form-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    className="form-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    className="form-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handlePasswordChange} className="btn-primary">
                  Update Password
                </Button>
                <Button 
                  onClick={() => {
                    setIsPasswordChangeOpen(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};