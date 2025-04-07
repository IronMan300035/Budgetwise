
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Landmark, Shield, Lock } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";

export const BankAccountLink = () => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const { addActivityLog } = useActivityLogs();
  
  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName || !accountNumber || !ifscCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLinking(true);
    
    try {
      // Simulate API call for bank account linking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the activity
      await addActivityLog(
        "bank_account", 
        `Linked bank account: ${bankName} (${accountNumber.slice(-4)})`
      );
      
      toast.success("Bank account linked successfully!");
      setBankName("");
      setAccountNumber("");
      setIfscCode("");
    } catch (error) {
      console.error("Error linking bank account:", error);
      toast.error("Failed to link bank account. Please try again.");
    } finally {
      setIsLinking(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <CardTitle>Link Bank Account</CardTitle>
        </div>
        <CardDescription>Connect your bank account for real-time transaction tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md mb-4">
          <Shield className="h-5 w-5 text-green-500" />
          <p className="text-sm text-muted-foreground">Your banking information is encrypted and secure</p>
        </div>
        
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <form onSubmit={handleLinkAccount} className="space-y-4">
              <div>
                <label htmlFor="bankName" className="text-sm font-medium">Bank Name</label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., HDFC Bank, ICICI Bank"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="accountNumber" className="text-sm font-medium">Account Number</label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Your account number"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="ifscCode" className="text-sm font-medium">IFSC Code</label>
                <Input
                  id="ifscCode"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="e.g., HDFC0001234"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLinking}>
                {isLinking ? "Linking..." : "Link Account"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="netbanking">
            <div className="text-center py-8">
              <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">Net Banking Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">Securely connect through your bank's online portal</p>
              <Button onClick={() => toast.info("This feature will be available soon!")}>
                Continue to Net Banking
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col text-xs text-muted-foreground">
        <p className="text-center">Your bank details are encrypted and secure. We use industry-standard security protocols to protect your data.</p>
      </CardFooter>
    </Card>
  );
};
