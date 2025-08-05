import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, Truck, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface CustomerOrder {
  id: string;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  productName: string;
  productPrice: number;
  quantity: number;
  currency: string;
  currencySymbol: string;
  countryCode: string;
  deliveryStatus: 'pending' | 'delivered';
  orderDate: string;
  deliveredDate?: string;
  deliveryCharges: number;
}

interface OrderManagerProps {
  selectedCountry: string;
  countryCurrency: string;
  currencySymbol: string;
}

// Sample orders data
const SAMPLE_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-001',
    customerName: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+92-300-1234567',
    address: 'House 123, Block A, Gulberg III, Lahore, Punjab',
    productName: 'Premium Wireless Headphones',
    productPrice: 12500,
    quantity: 1,
    currency: 'PKR',
    currencySymbol: '₨',
    countryCode: 'PK',
    deliveryStatus: 'pending',
    orderDate: '2024-01-15T10:30:00Z',
    deliveryCharges: 200
  },
  {
    id: 'ORD-002',
    customerName: 'Fatima Ali',
    phone: '+92-301-9876543',
    address: 'Flat 45, Shaheed Millat Road, Karachi, Sindh',
    productName: 'Stylish Leather Backpack',
    productPrice: 22000,
    quantity: 1,
    currency: 'PKR',
    currencySymbol: '₨',
    countryCode: 'PK',
    deliveryStatus: 'delivered',
    orderDate: '2024-01-10T14:20:00Z',
    deliveredDate: '2024-01-13T16:45:00Z',
    deliveryCharges: 200
  },
  {
    id: 'ORD-003',
    customerName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    address: '123 Main Street, New York, NY 10001',
    productName: 'Smart Fitness Watch',
    productPrice: 249.99,
    quantity: 1,
    currency: 'USD',
    currencySymbol: '$',
    countryCode: 'US',
    deliveryStatus: 'pending',
    orderDate: '2024-01-14T09:15:00Z',
    deliveryCharges: 15
  }
];

export const OrderManager = ({ selectedCountry, countryCurrency, currencySymbol }: OrderManagerProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem('customerOrders');
    return saved ? JSON.parse(saved) : SAMPLE_ORDERS;
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered'>('all');

  const updateOrders = (newOrders: CustomerOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('customerOrders', JSON.stringify(newOrders));
  };

  const countryOrders = orders.filter(order => order.countryCode === selectedCountry);
  
  const filteredOrders = countryOrders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.deliveryStatus === filterStatus;
  });

  const pendingOrders = countryOrders.filter(order => order.deliveryStatus === 'pending');
  const deliveredOrders = countryOrders.filter(order => order.deliveryStatus === 'delivered');
  const totalRevenue = countryOrders.reduce((sum, order) => sum + (order.productPrice * order.quantity), 0);

  const markAsDelivered = (orderId: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId 
        ? { ...order, deliveryStatus: 'delivered' as const, deliveredDate: new Date().toISOString() }
        : order
    );
    updateOrders(updatedOrders);
    
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Order Delivered",
      description: `Order ${orderId} for ${order?.customerName} marked as delivered.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Order Management
        </h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter">Filter:</Label>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{countryOrders.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">{pendingOrders.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{deliveredOrders.length}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {currencySymbol}{totalRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                {selectedCountry === 'PK' 
                  ? 'No orders from Pakistan yet. Your customers will start appearing here.'
                  : `No orders from ${selectedCountry} yet. Activate this country to start receiving orders.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {order.customerName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        order.deliveryStatus === 'delivered' 
                          ? "bg-success text-success-foreground" 
                          : "bg-warning text-warning-foreground"
                      }
                    >
                      {order.deliveryStatus === 'delivered' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Delivered</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" />Pending</>
                      )}
                    </Badge>
                    <Badge variant="outline">#{order.id}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{order.phone}</span>
                    </div>
                    {order.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{order.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>{order.address}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{order.productName}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-bold text-primary">
                        {order.currencySymbol}{order.productPrice.toFixed(2)} × {order.quantity}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Delivery: </span>
                      <span className="font-medium">
                        {order.currencySymbol}{order.deliveryCharges}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Ordered: {formatDate(order.orderDate)}
                    </div>
                    {order.deliveredDate && (
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        Delivered: {formatDate(order.deliveredDate)}
                      </div>
                    )}
                  </div>
                  {order.deliveryStatus === 'pending' && (
                    <Button 
                      onClick={() => markAsDelivered(order.id)}
                      className="btn-primary"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};