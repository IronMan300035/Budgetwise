
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Canara Bank',
  'Union Bank of India',
  'YES Bank',
  'IndusInd Bank',
  'IDBI Bank',
  'Bank of India',
  'Central Bank of India',
  'Indian Bank',
  'Federal Bank',
  'IDFC First Bank',
  'Bandhan Bank',
  'Other'
];

export function BankAccountLink() {
  const [open, setOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const { user } = useAuth();

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to link a bank account");
      return;
    }
    
    if (!bankName || !accountNumber || !ifscCode) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Validate IFSC code format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      toast.error("Invalid IFSC code format. Example: HDFC0000123");
      return;
    }
    
    // Validate account number (typically between 9-18 digits for Indian banks)
    const accountRegex = /^\d{9,18}$/;
    if (!accountRegex.test(accountNumber)) {
      toast.error("Invalid account number. Must be 9-18 digits");
      return;
    }
    
    setIsLinking(true);
    
    try {
      // In a real app, this would integrate with a bank verification API
      // For now, we'll simulate the process with a timeout
      
      // Log the attempt
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'bank',
        description: `Attempted to link ${bankName} account ending in ${accountNumber.slice(-4)}`
      });
      
      // Simulate API call
      setTimeout(() => {
        // Success!
        toast.success(`Successfully linked your ${bankName} account`);
        setOpen(false);
        setIsLinking(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error linking bank account:', error);
      toast.error("Failed to link bank account. Please try again later.");
      setIsLinking(false);
    }
  };
  
  const resetForm = () => {
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Link Bank Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Bank Account</DialogTitle>
          <DialogDescription>
            Connect your bank account to enable automatic transaction tracking and budget management.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLinkAccount}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank" className="text-right">
                Bank
              </Label>
              <Select
                value={bankName}
                onValueChange={setBankName}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Account No.
              </Label>
              <Input
                id="account"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="col-span-3"
                required
                placeholder="Enter your account number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ifsc" className="text-right">
                IFSC Code
              </Label>
              <Input
                id="ifsc"
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="col-span-3"
                required
                placeholder="e.g., HDFC0000123"
              />
            </div>
            <div className="col-span-4 text-xs text-muted-foreground">
              <p>By linking your account, you authorize BudgetWise to access your transaction data only. We cannot perform any transactions on your behalf.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLinking}>
              {isLinking ? 'Linking...' : 'Link Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
