
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { LiveCurrencyRates } from "@/components/ui/LiveCurrencyRates";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, Mail, Phone, Shield, LogOut, CreditCard } from "lucide-react";

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Set values from user data
  useEffect(() => {
    if (user) {
      // Use user_metadata or default values if not available
      const userMeta = user.user_metadata || {};
      setFirstName(userMeta.first_name || "");
      setLastName(userMeta.last_name || "");
      setEmail(user.email || "");
      setPhone(userMeta.phone || "+91 9876543210"); // Default or from metadata
    }
  }, [user]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  const saveProfileChanges = () => {
    // Here you would update the user profile in the database
    // This is mocked for now
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const changePassword = () => {
    // Here you would implement the change password flow
    // This is mocked for now
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for instructions to reset your password.",
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfileChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your password was last changed on May 12, 2023. We recommend changing your password regularly for better security.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={changePassword}>Change Password</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Sharing</p>
                    <p className="text-sm text-muted-foreground">Allow us to share anonymized usage data to improve our services</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="data-sharing" className="sr-only">Toggle data sharing</Label>
                    <input type="checkbox" id="data-sharing" className="toggle toggle-primary" defaultChecked />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive emails about new features and promotions</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="marketing-emails" className="sr-only">Toggle marketing emails</Label>
                    <input type="checkbox" id="marketing-emails" className="toggle toggle-primary" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Update Privacy Settings</Button>
              </CardFooter>
            </Card>
          </section>
          
          <section>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Currency Settings
                </CardTitle>
                <CardDescription>
                  Manage your preferred currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="currency" className="block mb-2">Display Currency</Label>
                  <CurrencyToggle />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  Theme Settings
                </CardTitle>
                <CardDescription>
                  Customize the app appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label className="block mb-2">Theme Mode</Label>
                    <ThemeToggle />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  Account Actions
                </CardTitle>
                <CardDescription>
                  Manage your account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
        
        <div className="mt-8">
          <LiveCurrencyRates />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
