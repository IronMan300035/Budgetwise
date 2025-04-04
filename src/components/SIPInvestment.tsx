
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, IndianRupee, ArrowRight, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { format } from "date-fns";
import { useInvestments } from "@/hooks/useInvestments";
import { toast } from "sonner";

// SIP plans data
const sipPlans = [
  {
    id: "equity",
    name: "Equity Growth Fund",
    description: "High growth potential with higher risk",
    returns: "12-15%",
    risk: "High",
    minAmount: 1000,
    recommendedDuration: "5+ years",
    category: "Equity"
  },
  {
    id: "balanced",
    name: "Balanced Advantage Fund",
    description: "Moderate growth with balanced risk",
    returns: "10-12%",
    risk: "Moderate",
    minAmount: 500,
    recommendedDuration: "3-5 years",
    category: "Hybrid"
  },
  {
    id: "debt",
    name: "Debt Income Fund",
    description: "Stable returns with lower risk",
    returns: "7-9%",
    risk: "Low",
    minAmount: 1000,
    recommendedDuration: "1-3 years",
    category: "Debt"
  },
  {
    id: "tax",
    name: "ELSS Tax Saver",
    description: "Tax benefits with equity returns (80C)",
    returns: "12-14%",
    risk: "High",
    minAmount: 500,
    recommendedDuration: "3+ years",
    category: "ELSS"
  }
];

// Generate projection data for SIP growth
const generateSipProjections = (monthly: number, years: number, expectedReturn: number) => {
  const data = [];
  let investedAmount = 0;
  let totalValue = 0;
  
  for (let year = 1; year <= years; year++) {
    investedAmount = monthly * 12 * year;
    // Compound Interest Formula for SIP
    // M × (((1 + r)^n - 1) / r) × (1 + r)
    // Where M is monthly investment, r is rate of return divided by 12, and n is number of months
    const r = expectedReturn / 100 / 12;
    const n = year * 12;
    totalValue = monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    
    data.push({
      year: `Year ${year}`,
      invested: Math.round(investedAmount),
      projected: Math.round(totalValue),
      returns: Math.round(totalValue - investedAmount)
    });
  }
  
  return data;
};

export function SIPInvestment() {
  const [selectedPlan, setSelectedPlan] = useState(sipPlans[0]);
  const [isSipDialogOpen, setIsSipDialogOpen] = useState(false);
  const [monthlyAmount, setMonthlyAmount] = useState("1000");
  const [duration, setDuration] = useState("5");
  const [frequency, setFrequency] = useState("monthly");
  
  const { addInvestment } = useInvestments();
  
  // Parse expected returns range to get average
  const getExpectedReturn = (returnRange: string) => {
    const matches = returnRange.match(/(\d+)-(\d+)/);
    if (matches && matches.length >= 3) {
      return (parseInt(matches[1]) + parseInt(matches[2])) / 2;
    }
    return 12; // Default to 12% if parsing fails
  };
  
  // Generate projection data for selected parameters
  const projectionData = generateSipProjections(
    parseInt(monthlyAmount) || 1000,
    parseInt(duration) || 5,
    getExpectedReturn(selectedPlan.returns)
  );
  
  const handlePlanSelect = (plan: typeof selectedPlan) => {
    setSelectedPlan(plan);
    setMonthlyAmount(plan.minAmount.toString());
  };
  
  const handleStartSIP = () => {
    setIsSipDialogOpen(true);
  };
  
  const handleConfirmSIP = async () => {
    const amount = parseFloat(monthlyAmount);
    if (isNaN(amount) || amount < selectedPlan.minAmount) {
      toast.error(`Minimum investment amount is ₹${selectedPlan.minAmount}`);
      return;
    }
    
    try {
      await addInvestment({
        type: "sip",
        name: `${selectedPlan.name} SIP`,
        amount,
        notes: `${frequency} SIP for ${duration} years | Expected returns: ${selectedPlan.returns}`,
        purchase_date: format(new Date(), "yyyy-MM-dd"),
      });
      
      setIsSipDialogOpen(false);
      
      toast.success(`Successfully started ${selectedPlan.name} SIP of ₹${amount} ${frequency}`);
    } catch (error) {
      toast.error("Failed to start SIP");
      console.error(error);
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          Systematic Investment Plans (SIPs)
        </CardTitle>
        <CardDescription>Create wealth with regular investments</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* SIP Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-5 rounded-lg border cursor-pointer transition-colors ${
                selectedPlan.id === plan.id 
                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" 
                  : "hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Expected Returns</div>
                      <div className="font-medium text-green-600">{plan.returns} p.a.</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Risk Level</div>
                      <div className="font-medium">{plan.risk}</div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-600">
                  {selectedPlan.id === plan.id && (
                    <div className="h-3 w-3 rounded-full bg-indigo-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* SIP Calculator */}
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="text-lg font-medium mb-4">SIP Calculator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="monthly-amount">Monthly Amount (₹)</Label>
              <Input
                id="monthly-amount"
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                className="mt-2"
                min={selectedPlan.minAmount}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min: ₹{selectedPlan.minAmount}
              </p>
            </div>
            
            <div>
              <Label htmlFor="investment-duration">Duration (Years)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="investment-duration" className="mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Year</SelectItem>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="5">5 Years</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                  <SelectItem value="15">15 Years</SelectItem>
                  <SelectItem value="20">20 Years</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: {selectedPlan.recommendedDuration}
              </p>
            </div>
            
            <div>
              <Label htmlFor="investment-frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="investment-frequency" className="mt-2">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* SIP Projection Chart */}
          <div className="h-80 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Bar name="Invested Amount" dataKey="invested" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar name="Expected Returns" dataKey="returns" stackId="a" fill="#4c1d95" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Projection Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-xl font-bold">
                ₹{parseInt(monthlyAmount || "0").toLocaleString()} × {duration} years
              </p>
              <p className="text-lg font-bold text-indigo-600">
                ₹{projectionData[projectionData.length - 1]?.invested.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-muted-foreground">Expected Returns</p>
              <p className="text-xl font-bold text-green-600">
                ₹{projectionData[projectionData.length - 1]?.returns.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{selectedPlan.returns} p.a.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold text-indigo-600">
                ₹{projectionData[projectionData.length - 1]?.projected.toLocaleString()}
              </p>
              <p className="text-sm text-indigo-600">After {duration} years</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            onClick={handleStartSIP}
          >
            Start SIP Now <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </CardContent>
      
      {/* SIP Confirmation Dialog */}
      <Dialog open={isSipDialogOpen} onOpenChange={setIsSipDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start {selectedPlan.name} SIP</DialogTitle>
            <DialogDescription>
              You're setting up a {frequency} SIP for {selectedPlan.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SIP Amount</p>
                  <p className="text-lg font-medium">₹{monthlyAmount} / {frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-medium">{duration} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Returns</p>
                  <p className="text-lg font-medium text-green-600">{selectedPlan.returns} p.a.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-lg font-medium">{selectedPlan.category}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                <span>Your SIP will start from today, {format(new Date(), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                <span>Next installment on {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "MMMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSipDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleConfirmSIP}
            >
              Confirm & Start SIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
