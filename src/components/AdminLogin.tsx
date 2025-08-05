import { useState } from "react";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLogin = ({ isOpen, onClose, onSuccess }: AdminLoginProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const adminEmail = 'washalsocialmedia@gmail.com';
    const adminPassword = '746860';
    
    if (email === adminEmail && password === adminPassword) {
      // Track device login
      const deviceInfo = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ip: 'Local Device' // In production, you'd get actual IP
      };
      
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', new Date().toISOString());
      localStorage.setItem('adminEmail', email);
      
      // Store device login history
      const loginHistory = JSON.parse(localStorage.getItem('adminLoginHistory') || '[]');
      loginHistory.push(deviceInfo);
      localStorage.setItem('adminLoginHistory', JSON.stringify(loginHistory.slice(-10))); // Keep last 10 logins
      
      toast({
        title: "Admin Login Successful",
        description: "Welcome to MR Crush Shop Admin Panel!",
      });
      
      setEmail("");
      setPassword("");
      onSuccess();
      onClose();
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid email or password. Only authorized admin can access.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
            Admin Access Required
          </DialogTitle>
        </DialogHeader>
        
          <div className="space-y-6 py-4">
           <div className="text-center">
             <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
             <p className="text-sm text-muted-foreground">
               Secure admin access • Only authorized personnel
             </p>
           </div>
           
           <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="admin-email">Admin Email</Label>
               <Input
                 id="admin-email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 onKeyPress={handleKeyPress}
                 placeholder="Enter admin email"
                 className="form-input"
                 disabled={isLoading}
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="admin-password">Admin Password</Label>
               <div className="relative">
                 <Input
                   id="admin-password"
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   onKeyPress={handleKeyPress}
                   placeholder="Enter admin password"
                   className="form-input pr-10"
                   disabled={isLoading}
                 />
                 <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                   onClick={() => setShowPassword(!showPassword)}
                   disabled={isLoading}
                 >
                   {showPassword ? (
                     <EyeOff className="h-4 w-4 text-muted-foreground" />
                   ) : (
                     <Eye className="h-4 w-4 text-muted-foreground" />
                   )}
                 </Button>
               </div>
             </div>
           </div>
          
           <div className="flex gap-2">
             <Button 
               onClick={handleLogin} 
               className="btn-primary flex-1"
               disabled={!email || !password || isLoading}
             >
               {isLoading ? "Verifying..." : "Access Admin Panel"}
             </Button>
             <Button onClick={onClose} variant="outline">
               Cancel
             </Button>
           </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Secure admin access • MR Crush Shop
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};