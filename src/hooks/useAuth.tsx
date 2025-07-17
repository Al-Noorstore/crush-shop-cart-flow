import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { CustomerUser } from "@/components/CustomerAuth";

interface AuthContextType {
  // Admin auth
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (value: boolean) => void;
  adminLogout: () => void;
  
  // Customer auth
  currentCustomer: CustomerUser | null;
  setCurrentCustomer: (user: CustomerUser | null) => void;
  customerLogout: () => void;
  isCustomerLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(null);

  useEffect(() => {
    // Check admin login status
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    if (adminLoggedIn && adminLoginTime) {
      // Check if admin session is still valid (24 hours)
      const loginTime = new Date(adminLoginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAdminLoggedIn(true);
      } else {
        // Session expired
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
      }
    }
    
    // Check customer login status
    const customerData = localStorage.getItem('currentCustomer');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        setCurrentCustomer(customer);
      } catch (error) {
        localStorage.removeItem('currentCustomer');
      }
    }
  }, []);

  const adminLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    setIsAdminLoggedIn(false);
  };

  const customerLogout = () => {
    localStorage.removeItem('currentCustomer');
    setCurrentCustomer(null);
  };

  const value = {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    adminLogout,
    currentCustomer,
    setCurrentCustomer,
    customerLogout,
    isCustomerLoggedIn: !!currentCustomer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};