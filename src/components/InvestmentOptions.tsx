
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { useInvestments } from '@/hooks/useInvestments';
import { toast } from 'sonner';

// Mock data for charts
const generateMockData = (trend: 'up' | 'down' | 'volatile', days = 30) => {
  const data = [];
  let baseValue = trend === 'up' ? 100 : 120;
  
  for (let i = 0; i < days; i++) {
    let change;
    if (trend === 'up') {
      change = (Math.random() * 3) - 0.5; // Mostly positive
    } else if (trend === 'down') {
      change = (Math.random() * 3) - 2.5; // Mostly negative
    } else {
      change = (Math.random() * 6) - 3; // Volatile
    }
    
    baseValue = Math.max(50, baseValue + change);
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: baseValue.toFixed(2)
    });
  }
  
  return data;
}

const stockData = generateMockData('volatile', 30);
const mutualFundData = generateMockData('up', 30);
const cryptoData = generateMockData('volatile', 30);
const sipData = generateMockData('up', 30);
const fdData = generateMockData('up', 12);

// Mock investment options
const stockOptions = [
  { name: "Reliance Industries", code: "RELIANCE", trend: "+2.3%", details: "Blue-chip company with strong financials" },
  { name: "Tata Consultancy Services", code: "TCS", trend: "+1.8%", details: "Leading IT services company" },
  { name: "HDFC Bank", code: "HDFCBANK", trend: "-0.5%", details: "Top private sector bank" },
  { name: "Infosys", code: "INFY", trend: "+0.7%", details: "Global IT consulting company" },
  { name: "Bharti Airtel", code: "BHARTIARTL", trend: "+1.2%", details: "Telecommunications leader" }
];

const mutualFundOptions = [
  { name: "HDFC Mid-Cap Opportunities Fund", code: "HDFC-MCO", trend: "+15.7% (1Y)", details: "Focused on medium-sized companies with growth potential" },
  { name: "Axis Bluechip Fund", code: "AXIS-BLUE", trend: "+12.3% (1Y)", details: "Large-cap fund with stable performance" },
  { name: "Mirae Asset Emerging Bluechip", code: "MIRAE-EB", trend: "+18.2% (1Y)", details: "Blend of mid and large cap stocks" },
  { name: "SBI Small Cap Fund", code: "SBI-SMALL", trend: "+22.5% (1Y)", details: "Invests in small-cap companies with high growth" },
  { name: "Parag Parikh Flexi Cap Fund", code: "PPFCF", trend: "+14.1% (1Y)", details: "Diversified across market capitalizations" }
];

const cryptoOptions = [
  { name: "Bitcoin", code: "BTC", trend: "+5.3%", details: "The original cryptocurrency" },
  { name: "Ethereum", code: "ETH", trend: "+3.8%", details: "Blockchain platform for smart contracts" },
  { name: "Binance Coin", code: "BNB", trend: "-2.1%", details: "Native token of Binance exchange" },
  { name: "Solana", code: "SOL", trend: "+7.2%", details: "High-performance blockchain" },
  { name: "Cardano", code: "ADA", trend: "-1.5%", details: "Proof-of-stake blockchain platform" }
];

const fdOptions = [
  { name: "SBI Fixed Deposit", rate: "5.5% - 6.5%", details: "Term: 1-5 years" },
  { name: "HDFC Bank FD", rate: "5.75% - 7.0%", details: "Term: 1-10 years" },
  { name: "ICICI Bank FD", rate: "5.5% - 6.75%", details: "Term: 1-10 years" },
  { name: "Axis Bank FD", rate: "5.75% - 7.1%", details: "Term: 1-5 years" },
  { name: "Bank of Baroda FD", rate: "5.25% - 6.5%", details: "Term: 1-10 years" }
];

const sipOptions = [
  { name: "SBI Equity Hybrid Fund", minAmount: "₹500", details: "Conservative allocation with regular income" },
  { name: "HDFC Balanced Advantage", minAmount: "₹500", details: "Dynamic asset allocation based on market conditions" },
  { name: "Axis Long Term Equity Fund", minAmount: "₹500", details: "Tax-saving ELSS fund with 3-year lock-in" },
  { name: "Mirae Asset Tax Saver Fund", minAmount: "₹500", details: "ELSS fund focused on growth opportunities" },
  { name: "Kotak Standard Multicap Fund", minAmount: "₹1000", details: "Diversified portfolio across market caps" }
];

export function InvestmentOptions() {
  const [activeTab, setActiveTab] = useState("stocks");
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<{
    type: string;
    name: string;
    code?: string;
    details?: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const { user } = useAuth();
  const { addInvestment } = useInvestments();

  const handleInvestClick = (type: string, item: any) => {
    setSelectedInvestment({
      type,
      name: item.name,
      code: item.code,
      details: item.details
    });
    setInvestDialogOpen(true);
  };

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }
    
    if (!selectedInvestment || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // Convert type to expected investment type
      let investmentType: 'sip' | 'stock' | 'mutual_fund' | 'crypto' | 'other';
      
      switch (selectedInvestment.type) {
        case 'stocks':
          investmentType = 'stock';
          break;
        case 'mutual_funds':
          investmentType = 'mutual_fund';
          break;
        case 'crypto':
          investmentType = 'crypto';
          break;
        case 'sip':
          investmentType = 'sip';
          break;
        default:
          investmentType = 'other';
      }
      
      const result = await addInvestment({
        type: investmentType,
        name: selectedInvestment.name,
        amount: parseFloat(amount),
        purchase_date: new Date().toISOString().split('T')[0],
        symbol: selectedInvestment.code,
        notes: `${selectedInvestment.details || ''} ${duration ? `Duration: ${duration}` : ''}`
      });
      
      if (result) {
        toast.success(`Successfully invested in ${selectedInvestment.name}`);
        setInvestDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error making investment:', error);
      toast.error("Failed to process investment. Please try again.");
    }
  };
  
  const resetForm = () => {
    setAmount("");
    setDuration("");
    setSelectedInvestment(null);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="stocks" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="mutual_funds">Mutual Funds</TabsTrigger>
          <TabsTrigger value="sip">SIPs</TabsTrigger>
          <TabsTrigger value="fixed_deposits">FDs & RDs</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Market Trends</CardTitle>
              <CardDescription>Recent stock performance and investment opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3498db" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Top Stock Picks</h3>
                {stockOptions.map((stock) => (
                  <Card key={stock.code} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{stock.name}</h4>
                        <p className="text-xs text-muted-foreground">{stock.code} · {stock.details}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-medium ${stock.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.trend}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => handleInvestClick('stocks', stock)}
                        >
                          Invest
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mutual_funds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mutual Fund Performance</CardTitle>
              <CardDescription>Trending mutual funds with strong historical returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mutualFundData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#9b59b6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Recommended Mutual Funds</h3>
                {mutualFundOptions.map((fund) => (
                  <Card key={fund.code} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{fund.name}</h4>
                        <p className="text-xs text-muted-foreground">{fund.details}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-green-600">
                          {fund.trend}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => handleInvestClick('mutual_funds', fund)}
                        >
                          Invest
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Systematic Investment Plans</CardTitle>
              <CardDescription>Build wealth through regular investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sipData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#2ecc71" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Popular SIP Options</h3>
                {sipOptions.map((sip, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{sip.name}</h4>
                        <p className="text-xs text-muted-foreground">Min: {sip.minAmount} · {sip.details}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInvestClick('sip', sip)}
                      >
                        Start SIP
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fixed_deposits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fixed & Recurring Deposits</CardTitle>
              <CardDescription>Secure investment options with guaranteed returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fdData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#f1c40f" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Best FD Rates</h3>
                {fdOptions.map((fd, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{fd.name}</h4>
                        <p className="text-xs text-muted-foreground">{fd.details}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-blue-600">
                          {fd.rate}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => handleInvestClick('fixed_deposits', fd)}
                        >
                          Invest
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Markets</CardTitle>
              <CardDescription>Digital assets with high volatility and potential returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cryptoData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#e74c3c" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Top Cryptocurrencies</h3>
                {cryptoOptions.map((crypto) => (
                  <Card key={crypto.code} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{crypto.name}</h4>
                        <p className="text-xs text-muted-foreground">{crypto.code} · {crypto.details}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-medium ${crypto.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.trend}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => handleInvestClick('crypto', crypto)}
                        >
                          Invest
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Investment Dialog */}
      <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invest in {selectedInvestment?.name}</DialogTitle>
            <DialogDescription>
              {selectedInvestment?.type === 'sip' 
                ? 'Set up a regular investment plan'
                : 'Enter the amount you want to invest'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvestSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                  required
                  placeholder={selectedInvestment?.type === 'sip' ? "Monthly investment amount" : "Investment amount"}
                />
              </div>
              
              {selectedInvestment?.type === 'sip' || selectedInvestment?.type === 'fixed_deposits' ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Select
                    value={duration}
                    onValueChange={setDuration}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedInvestment?.type === 'sip' ? (
                        <>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">1 year</SelectItem>
                          <SelectItem value="24">2 years</SelectItem>
                          <SelectItem value="36">3 years</SelectItem>
                          <SelectItem value="60">5 years</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">1 year</SelectItem>
                          <SelectItem value="24">2 years</SelectItem>
                          <SelectItem value="36">3 years</SelectItem>
                          <SelectItem value="60">5 years</SelectItem>
                          <SelectItem value="120">10 years</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              
              <div className="col-span-4 space-y-1">
                <div className="text-sm text-muted-foreground rounded-md bg-muted/50 p-3">
                  <h4 className="font-medium text-foreground mb-1">Investment Details</h4>
                  <p className="mb-1">
                    <span className="font-medium">Type:</span> {selectedInvestment?.type === 'stocks' ? 'Stock' : 
                      selectedInvestment?.type === 'mutual_funds' ? 'Mutual Fund' : 
                      selectedInvestment?.type === 'sip' ? 'SIP' : 
                      selectedInvestment?.type === 'fixed_deposits' ? 'Fixed Deposit' : 'Cryptocurrency'}
                  </p>
                  {selectedInvestment?.code && (
                    <p className="mb-1">
                      <span className="font-medium">Code:</span> {selectedInvestment.code}
                    </p>
                  )}
                  {selectedInvestment?.details && (
                    <p className="text-xs">
                      {selectedInvestment.details}
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Note: This is a simulation. No actual investment will be made.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInvestDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedInvestment?.type === 'sip' ? 'Start SIP' : 'Invest Now'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
