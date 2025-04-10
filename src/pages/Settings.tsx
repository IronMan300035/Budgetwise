import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/providers/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop, CircleDashed, User, Key, Bell, Layout, CircleDollarSign, MessageSquare, Settings as SettingsIcon, ListChecks, Newspaper, Split, TrendingUp, Receipt, PieChart } from "lucide-react";
import { VirtualKeyboardToggle } from "@/components/VirtualKeyboardToggle";
import { useProfiles } from "@/hooks/useProfiles";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { profile, loading: profileLoading } = useProfiles();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
      }
      setEmail(user.email || "");
    }
  }, [authLoading, user, navigate, profile]);
  
  const tabs = [
    { label: "General", value: "general", icon: <User className="h-4 w-4" /> },
    { label: "Security", value: "security", icon: <Key className="h-4 w-4" /> },
    { label: "Notifications", value: "notifications", icon: <Bell className="h-4 w-4" /> },
    { label: "Preferences", value: "preferences", icon: <Layout className="h-4 w-4" /> },
    { label: "Currency", value: "currency", icon: <CircleDollarSign className="h-4 w-4" /> },
    { label: "Feedback", value: "feedback", icon: <MessageSquare className="h-4 w-4" /> },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    alert("Settings saved!");
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordChanging(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsPasswordChanging(false);
    alert("Password changed!");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            <Card className="h-fit">
              <CardContent className="p-0">
                <Tabs defaultValue="general" orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col h-auto w-full items-start justify-start rounded-none border-r p-0">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="w-full justify-start rounded-none py-3 px-4 data-[state=active]:bg-muted"
                      >
                        {tab.icon}
                        <span className="ml-2">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <TabsContent value="general" className="border-0 p-0">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>
                          Update your profile information and manage your account settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            placeholder="Enter your first name" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            placeholder="Enter your email" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled
                          />
                        </div>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="security" className="border-0 p-0">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                          Manage your password and secure your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input 
                            id="currentPassword" 
                            placeholder="Enter your current password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            placeholder="Enter your new password" 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword" 
                            placeholder="Confirm your new password" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleChangePassword} disabled={isPasswordChanging}>
                          {isPasswordChanging ? "Changing..." : "Change Password"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="border-0 p-0">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>
                          Manage your notification preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <p>Notification settings will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="preferences" className="border-0 p-0">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>
                          Customize your app experience and visual preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="theme">Theme</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button 
                              variant={theme === 'light' ? 'default' : 'outline'} 
                              className="justify-start"
                              onClick={() => setTheme('light')}
                            >
                              <Sun className="mr-2 h-4 w-4" />
                              Light
                            </Button>
                            <Button 
                              variant={theme === 'dark' ? 'default' : 'outline'} 
                              className="justify-start"
                              onClick={() => setTheme('dark')}
                            >
                              <Moon className="mr-2 h-4 w-4" />
                              Dark
                            </Button>
                            <Button 
                              variant={theme === 'classic-dark' ? 'default' : 'outline'} 
                              className="justify-start"
                              onClick={() => setTheme('classic-dark')}
                            >
                              <CircleDashed className="mr-2 h-4 w-4" />
                              Classic Dark
                            </Button>
                            <Button 
                              variant={theme === 'system' ? 'default' : 'outline'} 
                              className="justify-start"
                              onClick={() => setTheme('system')}
                            >
                              <Laptop className="mr-2 h-4 w-4" />
                              System
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label>Virtual Keyboard</Label>
                          <VirtualKeyboardToggle />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select defaultValue="en-IN">
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en-IN">English (India)</SelectItem>
                              <SelectItem value="hi-IN">Hindi</SelectItem>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="en-GB">English (UK)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            This will change the language throughout the application
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="currency" className="border-0 p-0">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Currency Settings</CardTitle>
                        <CardDescription>
                          Manage your currency preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <p>Currency settings will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="feedback" className="border-0 p-0">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Feedback</CardTitle>
                        <CardDescription>
                          Share your feedback with us
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <p>Feedback form will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  View your profile information and manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${firstName || 'U'}`} alt={firstName || "User"} />
                    <AvatarFallback>{firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{firstName} {lastName}</div>
                    <div className="text-sm text-muted-foreground">{email}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Edit Profile
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>Activity Log</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Newspaper className="mr-2 h-4 w-4" />
                        <span>News Bulletin</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Split className="mr-2 h-4 w-4" />
                        <span>Split Expenses</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Investment</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Receipt className="mr-2 h-4 w-4" />
                        <span>Transactions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PieChart className="mr-2 h-4 w-4" />
                        <span>Budget</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
