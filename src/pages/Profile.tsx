
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Loader2, User, Calendar, FileEdit } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfiles();
  const { logs, loading: logsLoading } = useActivityLogs();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Check authentication
  useState(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  });

  // Load profile data
  useState(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  });

  const handleProfileUpdate = async () => {
    await updateProfile({
      first_name: firstName,
      last_name: lastName
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      await uploadAvatar(file);
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">User Profile</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative">
                      <Avatar className="h-24 w-24 md:h-32 md:w-32">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {firstName ? firstName[0] : user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="absolute -bottom-2 -right-2">
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90">
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileEdit className="h-4 w-4" />
                            )}
                          </div>
                        </Label>
                        <Input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="first-name">First Name</Label>
                              <Input 
                                id="first-name" 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="last-name">Last Name</Label>
                              <Input 
                                id="last-name" 
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={handleProfileUpdate}>Save Changes</Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Full Name</div>
                            <div className="text-xl font-medium">
                              {firstName || lastName 
                                ? `${firstName} ${lastName}`.trim()
                                : "Not set"}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Email Address</div>
                            <div className="text-xl font-medium">{user?.email}</div>
                          </div>
                          
                          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Change Password</div>
                      <div className="text-sm text-muted-foreground">Update your password regularly for security</div>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Sign Out</div>
                      <div className="text-sm text-muted-foreground">Sign out of your account</div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={signOut}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Your recent activities on the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {logsLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                      <span>Loading activity logs...</span>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                      <Calendar className="h-16 w-16 mb-4" />
                      <p>No activity logs found</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start border-b pb-4 last:border-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            {log.activity_type === 'transaction' && <DollarSign className="h-4 w-4 text-primary" />}
                            {log.activity_type === 'auth' && <User className="h-4 w-4 text-primary" />}
                            {log.activity_type === 'profile' && <FileEdit className="h-4 w-4 text-primary" />}
                            {log.activity_type === 'budget' && <PieChart className="h-4 w-4 text-primary" />}
                            {log.activity_type === 'investment' && <TrendingUp className="h-4 w-4 text-primary" />}
                            {log.activity_type === 'reset' && <Trash2 className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{log.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), "MMMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18"></path>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );
}

function PieChart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  );
}
