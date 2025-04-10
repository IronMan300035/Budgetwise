
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Moon, 
  Trash2, 
  CircleDollarSign,
  Globe,
  Languages,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfiles();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    budgetAlerts: true,
    marketUpdates: false,
    tips: true
  });

  const [privacy, setPrivacy] = useState({
    shareData: false,
    analytics: true
  });

  // Check authentication
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  const handleSavePrivacy = () => {
    toast.success("Privacy settings saved");
  };

  const handleResetData = () => {
    // This would typically show a confirmation dialog
    toast.error("This action cannot be undone", {
      description: "Please contact support if you need to reset your account data",
      duration: 5000,
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">Settings</h1>
          
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security & Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" /> Theme & Display
                  </CardTitle>
                  <CardDescription>Customize how BudgetWise looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Dark Mode</h4>
                        <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          System Default
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Currency Display</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Set your preferred currency</p>
                        </div>
                        <CurrencyToggle />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Language</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                        </div>
                        <Button variant="outline" size="sm">English (US)</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> Data Display Preferences
                  </CardTitle>
                  <CardDescription>Control how your data is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Running Balance</h4>
                      <p className="text-sm text-muted-foreground">Display running balance in transaction history</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Default Dashboard View</h4>
                      <p className="text-sm text-muted-foreground">Choose your default dashboard view</p>
                    </div>
                    <Button variant="outline" size="sm">Monthly Overview</Button>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Default Date Range</h4>
                      <p className="text-sm text-muted-foreground">Set the default date range for reports</p>
                    </div>
                    <Button variant="outline" size="sm">Last 30 Days</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Notification Settings
                  </CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={notifications.email} 
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications in the browser</p>
                    </div>
                    <Switch 
                      checked={notifications.push} 
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Budget Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified when you're close to exceeding budget limits</p>
                    </div>
                    <Switch 
                      checked={notifications.budgetAlerts} 
                      onCheckedChange={(checked) => setNotifications({...notifications, budgetAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Market Updates</h4>
                      <p className="text-sm text-muted-foreground">Receive updates on market changes for your investments</p>
                    </div>
                    <Switch 
                      checked={notifications.marketUpdates} 
                      onCheckedChange={(checked) => setNotifications({...notifications, marketUpdates: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Tips & Recommendations</h4>
                      <p className="text-sm text-muted-foreground">Get personalized financial tips</p>
                    </div>
                    <Switch 
                      checked={notifications.tips} 
                      onCheckedChange={(checked) => setNotifications({...notifications, tips: checked})}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveNotifications}>Save Notification Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure</p>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button className="w-full md:w-auto">Update Password</Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Set Up 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Privacy Settings
                  </CardTitle>
                  <CardDescription>Control your data privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-muted-foreground">Allow anonymous data sharing for service improvement</p>
                    </div>
                    <Switch 
                      checked={privacy.shareData} 
                      onCheckedChange={(checked) => setPrivacy({...privacy, shareData: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h4 className="font-medium">Analytics Cookies</h4>
                      <p className="text-sm text-muted-foreground">Allow usage analytics to improve user experience</p>
                    </div>
                    <Switch 
                      checked={privacy.analytics} 
                      onCheckedChange={(checked) => setPrivacy({...privacy, analytics: checked})}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 dark:border-red-900 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-red-600 dark:text-red-400">
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" /> Account Data
                  </CardTitle>
                  <CardDescription className="text-red-500/70 dark:text-red-400/70">Danger zone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Reset Account Data</h4>
                      <p className="text-sm text-muted-foreground">Delete all your transactions, budgets, and investments</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleResetData}
                    >
                      Reset Data
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-red-200/30 dark:border-red-900/30 pt-4">
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
