
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Building2, 
  Landmark, 
  Wallet, 
  CheckCircle2, 
  Lock, 
  Shield, 
  KeyRound,
  ExternalLink
} from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";

export default function BankAccounts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [linkedBanks, setLinkedBanks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("netbanking");
  const { addActivityLog } = useActivityLogs();
  const [showManualForm, setShowManualForm] = useState(false);
  
  const form = useForm({
    defaultValues: {
      bank: "",
      accountNumber: "",
      username: "",
      password: "",
      ifsc: "",
      accountType: "",
      holderName: ""
    },
  });
  
  const manualForm = useForm({
    defaultValues: {
      bankName: "",
      accountNumber: "",
      ifsc: "",
      holderName: "",
      accountType: "Savings"
    }
  });
  
  const handleSubmit = async (data: any) => {
    setIsLinking(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to linked banks
      setLinkedBanks(prev => [...prev, data.bank]);
      
      // Log the activity
      if (user) {
        addActivityLog('banking', `Linked ${data.bank} bank account`);
      }
      
      toast.success("Bank account linked successfully!", {
        description: "Your bank account has been successfully linked to your profile.",
      });
      
      form.reset();
    } catch (error) {
      toast.error("Failed to link bank account", {
        description: "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleManualSubmit = async (data: any) => {
    setIsLinking(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to linked banks
      setLinkedBanks(prev => [...prev, data.bankName]);
      
      // Log the activity
      if (user) {
        addActivityLog('banking', `Manually added ${data.bankName} bank account`);
      }
      
      toast.success("Bank account added successfully!", {
        description: "Your bank account has been successfully added to your profile.",
      });
      
      manualForm.reset();
      setShowManualForm(false);
    } catch (error) {
      toast.error("Failed to add bank account", {
        description: "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsLinking(false);
    }
  };
  
  const banks = [
    { id: "hdfc", name: "HDFC Bank", website: "https://netbanking.hdfcbank.com/" },
    { id: "sbi", name: "State Bank of India", website: "https://retail.onlinesbi.sbi/retail/login.htm" },
    { id: "icici", name: "ICICI Bank", website: "https://infinity.icicibank.com/" },
    { id: "axis", name: "Axis Bank", website: "https://retail.axisbank.co.in/" },
    { id: "kotak", name: "Kotak Mahindra Bank", website: "https://netbanking.kotak.com/" },
    { id: "pnb", name: "Punjab National Bank", website: "https://netpnb.com/" },
    { id: "bob", name: "Bank of Baroda", website: "https://www.bobibanking.com/" },
    { id: "yes", name: "Yes Bank", website: "https://www.yesbank.in/personal-banking/yes-online" },
    { id: "federal", name: "Federal Bank", website: "https://www.fednetbank.com/" },
    { id: "idfc", name: "IDFC First Bank", website: "https://my.idfcfirstbank.com/" },
  ];
  
  const handleNetBankingLink = () => {
    const selectedBank = form.getValues("bank");
    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }
    
    const bank = banks.find(b => b.id === selectedBank);
    if (bank && bank.website) {
      // Open bank website in a new tab
      window.open(bank.website, "_blank");
      
      // Also add to linked banks
      setLinkedBanks(prev => [...prev, bank.name]);
      
      // Log the activity
      if (user) {
        addActivityLog('banking', `Initiated net banking with ${bank.name}`);
      }
      
      toast.success("Redirecting to bank website", {
        description: "Please complete authentication on your bank's website.",
      });
      
      form.reset();
    }
  };
  
  if (!user) {
    navigate("/login");
    return null;
  }
  
  const accountTypes = [
    { id: "savings", name: "Savings Account" },
    { id: "current", name: "Current Account" },
    { id: "salary", name: "Salary Account" },
    { id: "fixed", name: "Fixed Deposit" },
    { id: "recurring", name: "Recurring Deposit" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Link Your Bank Accounts
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Connect Your Bank</CardTitle>
                  <CardDescription>
                    Link your bank accounts to track your finances automatically and in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="netbanking" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
                      <TabsTrigger value="accountdetails">Account Details</TabsTrigger>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="netbanking" className="space-y-4 pt-4">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleNetBankingLink)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="bank"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select your bank</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your bank" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {banks.map((bank) => (
                                      <SelectItem key={bank.id} value={bank.id}>
                                        {bank.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose your bank to link via Net Banking
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Lock className="h-4 w-4 mr-1" />
                              <span>You will be redirected to your bank's website</span>
                            </div>
                            <Button type="submit" disabled={isLinking}>
                              {isLinking ? "Redirecting..." : "Connect to Bank"} <ExternalLink className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </form>
                      </Form>
                      
                      <div className="pt-4">
                        <Separator className="my-4" />
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-1" />
                            <span>Bank-level security</span>
                          </div>
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-1" />
                            <span>256-bit encryption</span>
                          </div>
                          <div className="flex items-center">
                            <KeyRound className="h-4 w-4 mr-1" />
                            <span>Private & secure</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="accountdetails" className="space-y-4 pt-4">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="bank"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select your bank</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your bank" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {banks.map((bank) => (
                                      <SelectItem key={bank.id} value={bank.id}>
                                        {bank.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your account number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username / Customer ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Enter password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Lock className="h-4 w-4 mr-1" />
                              <span>Your credentials are secure and encrypted</span>
                            </div>
                            <Button type="submit" disabled={isLinking}>
                              {isLinking ? "Linking..." : "Link Account"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="manual" className="space-y-4 pt-4">
                      <Form {...manualForm}>
                        <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
                          <FormField
                            control={manualForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter bank name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={manualForm.control}
                              name="accountNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter account number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={manualForm.control}
                              name="ifsc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>IFSC Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter IFSC code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={manualForm.control}
                              name="holderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Holder Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter account holder name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={manualForm.control}
                              name="accountType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {accountTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                          {type.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-end pt-4">
                            <Button type="submit" disabled={isLinking}>
                              {isLinking ? "Adding..." : "Add Account Manually"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Linked Accounts</CardTitle>
                  <CardDescription>
                    Manage your connected bank accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {linkedBanks.length > 0 ? (
                    <div className="space-y-4">
                      {linkedBanks.map((bank, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <div className="bg-primary/10 text-primary rounded-full p-2">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{bank}</div>
                            <div className="text-xs text-muted-foreground">••••••••{Math.floor(Math.random() * 9000) + 1000}</div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Landmark className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No linked banks</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Link your first bank account to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4 shadow-lg">
                <CardHeader>
                  <CardTitle>Why Link Your Bank?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Auto-track Expenses</h4>
                      <p className="text-sm text-muted-foreground">Automatically import and categorize transactions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Complete Financial Picture</h4>
                      <p className="text-sm text-muted-foreground">See all your accounts in one place</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
