
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, LineChart, ArrowUpRight, PiggyBank } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useInvestments } from "@/hooks/useInvestments";

interface SIPRecommendation {
  id: string;
  name: string;
  amc: string;
  category: string;
  riskLevel: "Low" | "Medium" | "High";
  minInvestment: number;
  returnPotential: string;
  nav: number;
  recommendation: string;
  performanceData: {
    month: string;
    return: number;
  }[];
}

// SIP recommendations based on different budget ranges
const sipRecommendationsByBudget: Record<string, SIPRecommendation[]> = {
  "lowBudget": [
    { 
      id: "icici-prudential-bluechip",
      name: "ICICI Prudential Bluechip Fund",
      amc: "ICICI Prudential",
      category: "Large Cap",
      riskLevel: "Low",
      minInvestment: 100,
      returnPotential: "10-12%",
      nav: 65.8,
      recommendation: "Stable fund focused on blue-chip companies with good track record.",
      performanceData: [
        { month: "Jan", return: 1.2 },
        { month: "Feb", return: 0.8 },
        { month: "Mar", return: -0.5 },
        { month: "Apr", return: 1.5 },
        { month: "May", return: 2.1 },
        { month: "Jun", return: 0.9 },
        { month: "Jul", return: 1.8 },
        { month: "Aug", return: 1.3 },
        { month: "Sep", return: 0.4 },
        { month: "Oct", return: 1.2 },
        { month: "Nov", return: 1.7 },
        { month: "Dec", return: 1.1 }
      ]
    },
    { 
      id: "sbi-small-cap",
      name: "SBI Small Cap Fund",
      amc: "SBI Mutual Fund",
      category: "Small Cap",
      riskLevel: "High",
      minInvestment: 500,
      returnPotential: "15-18%",
      nav: 125.75,
      recommendation: "High growth potential with focus on emerging small companies.",
      performanceData: [
        { month: "Jan", return: 2.4 },
        { month: "Feb", return: -1.8 },
        { month: "Mar", return: -2.5 },
        { month: "Apr", return: 3.5 },
        { month: "May", return: 4.1 },
        { month: "Jun", return: 0.9 },
        { month: "Jul", return: 2.8 },
        { month: "Aug", return: 3.3 },
        { month: "Sep", return: -1.4 },
        { month: "Oct", return: 3.2 },
        { month: "Nov", return: 2.7 },
        { month: "Dec", return: 1.9 }
      ]
    },
    { 
      id: "axis-long-term-equity",
      name: "Axis Long Term Equity Fund",
      amc: "Axis Mutual Fund",
      category: "ELSS",
      riskLevel: "Medium",
      minInvestment: 500,
      returnPotential: "12-14%",
      nav: 78.45,
      recommendation: "Tax-saving fund with good long-term performance.",
      performanceData: [
        { month: "Jan", return: 1.6 },
        { month: "Feb", return: 1.2 },
        { month: "Mar", return: -1.0 },
        { month: "Apr", return: 2.1 },
        { month: "May", return: 2.8 },
        { month: "Jun", return: 0.7 },
        { month: "Jul", return: 2.2 },
        { month: "Aug", return: 1.9 },
        { month: "Sep", return: 0.2 },
        { month: "Oct", return: 2.0 },
        { month: "Nov", return: 1.5 },
        { month: "Dec", return: 1.3 }
      ]
    }
  ],
  "mediumBudget": [
    { 
      id: "parag-parikh-flexi",
      name: "Parag Parikh Flexi Cap Fund",
      amc: "PPFAS Mutual Fund",
      category: "Flexi Cap",
      riskLevel: "Medium",
      minInvestment: 1000,
      returnPotential: "13-15%",
      nav: 58.75,
      recommendation: "Globally diversified portfolio with value investing approach.",
      performanceData: [
        { month: "Jan", return: 1.8 },
        { month: "Feb", return: 1.4 },
        { month: "Mar", return: -0.8 },
        { month: "Apr", return: 2.3 },
        { month: "May", return: 3.0 },
        { month: "Jun", return: 1.2 },
        { month: "Jul", return: 2.4 },
        { month: "Aug", return: 2.1 },
        { month: "Sep", return: 0.6 },
        { month: "Oct", return: 1.9 },
        { month: "Nov", return: 2.2 },
        { month: "Dec", return: 1.7 }
      ]
    },
    { 
      id: "mirae-asset-bluechip",
      name: "Mirae Asset Emerging Bluechip",
      amc: "Mirae Asset",
      category: "Large & Mid Cap",
      riskLevel: "Medium",
      minInvestment: 1000,
      returnPotential: "14-16%",
      nav: 103.45,
      recommendation: "Balanced exposure to established and growing companies.",
      performanceData: [
        { month: "Jan", return: 2.1 },
        { month: "Feb", return: 1.6 },
        { month: "Mar", return: -1.2 },
        { month: "Apr", return: 2.5 },
        { month: "May", return: 3.2 },
        { month: "Jun", return: 1.0 },
        { month: "Jul", return: 2.6 },
        { month: "Aug", return: 2.3 },
        { month: "Sep", return: 0.5 },
        { month: "Oct", return: 2.2 },
        { month: "Nov", return: 2.4 },
        { month: "Dec", return: 1.9 }
      ]
    },
    { 
      id: "kotak-emerging-equity",
      name: "Kotak Emerging Equity Fund",
      amc: "Kotak Mahindra",
      category: "Mid Cap",
      riskLevel: "High",
      minInvestment: 1000,
      returnPotential: "15-17%",
      nav: 87.92,
      recommendation: "Focus on emerging mid-sized companies with growth potential.",
      performanceData: [
        { month: "Jan", return: 2.5 },
        { month: "Feb", return: -1.0 },
        { month: "Mar", return: -1.8 },
        { month: "Apr", return: 3.0 },
        { month: "May", return: 3.5 },
        { month: "Jun", return: 1.4 },
        { month: "Jul", return: 2.9 },
        { month: "Aug", return: 2.6 },
        { month: "Sep", return: -0.8 },
        { month: "Oct", return: 2.7 },
        { month: "Nov", return: 2.9 },
        { month: "Dec", return: 2.2 }
      ]
    }
  ],
  "highBudget": [
    { 
      id: "hdfc-midcap",
      name: "HDFC Mid-Cap Opportunities Fund",
      amc: "HDFC Mutual Fund",
      category: "Mid Cap",
      riskLevel: "High",
      minInvestment: 2500,
      returnPotential: "15-18%",
      nav: 112.65,
      recommendation: "Focus on quality mid-sized companies with strong fundamentals.",
      performanceData: [
        { month: "Jan", return: 2.7 },
        { month: "Feb", return: -0.8 },
        { month: "Mar", return: -1.5 },
        { month: "Apr", return: 3.2 },
        { month: "May", return: 3.8 },
        { month: "Jun", return: 1.6 },
        { month: "Jul", return: 3.1 },
        { month: "Aug", return: 2.8 },
        { month: "Sep", return: -0.5 },
        { month: "Oct", return: 2.9 },
        { month: "Nov", return: 3.1 },
        { month: "Dec", return: 2.4 }
      ]
    },
    { 
      id: "dsp-small-cap",
      name: "DSP Small Cap Fund",
      amc: "DSP Investment Managers",
      category: "Small Cap",
      riskLevel: "High",
      minInvestment: 5000,
      returnPotential: "16-20%",
      nav: 98.45,
      recommendation: "Invests in small companies with high growth potential.",
      performanceData: [
        { month: "Jan", return: 3.0 },
        { month: "Feb", return: -1.5 },
        { month: "Mar", return: -2.0 },
        { month: "Apr", return: 3.5 },
        { month: "May", return: 4.2 },
        { month: "Jun", return: 1.8 },
        { month: "Jul", return: 3.4 },
        { month: "Aug", return: 3.1 },
        { month: "Sep", return: -1.0 },
        { month: "Oct", return: 3.3 },
        { month: "Nov", return: 3.5 },
        { month: "Dec", return: 2.7 }
      ]
    },
    { 
      id: "nippon-multi-cap",
      name: "Nippon India Multi Cap Fund",
      amc: "Nippon India",
      category: "Multi Cap",
      riskLevel: "Medium",
      minInvestment: 5000,
      returnPotential: "14-16%",
      nav: 145.75,
      recommendation: "Diversified portfolio across market capitalizations.",
      performanceData: [
        { month: "Jan", return: 2.3 },
        { month: "Feb", return: 1.2 },
        { month: "Mar", return: -1.0 },
        { month: "Apr", return: 2.7 },
        { month: "May", return: 3.4 },
        { month: "Jun", return: 1.4 },
        { month: "Jul", return: 2.8 },
        { month: "Aug", return: 2.5 },
        { month: "Sep", return: 0.3 },
        { month: "Oct", return: 2.5 },
        { month: "Nov", return: 2.8 },
        { month: "Dec", return: 2.1 }
      ]
    }
  ]
};

const riskColors = {
  "Low": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Medium": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "High": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

export function EnhancedSIPRecommendations() {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [frequency, setFrequency] = useState("monthly");
  const [recommendationSet, setRecommendationSet] = useState<SIPRecommendation[]>(
    sipRecommendationsByBudget.mediumBudget
  );
  const [selectedSIP, setSelectedSIP] = useState<SIPRecommendation | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("");
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const { addInvestment } = useInvestments();

  // Update recommendations based on monthly SIP amount
  const updateRecommendations = (amount: number) => {
    setMonthlyAmount(amount);
    
    if (amount <= 1000) {
      setRecommendationSet(sipRecommendationsByBudget.lowBudget);
    } else if (amount <= 10000) {
      setRecommendationSet(sipRecommendationsByBudget.mediumBudget);
    } else {
      setRecommendationSet(sipRecommendationsByBudget.highBudget);
    }
  };

  // Calculate yearly investment based on frequency
  const calculateYearlyInvestment = () => {
    switch(frequency) {
      case "daily": return monthlyAmount * 30 * 12;
      case "weekly": return monthlyAmount * 4 * 12;
      case "monthly": return monthlyAmount * 12;
      case "quarterly": return monthlyAmount * 4;
      default: return monthlyAmount * 12;
    }
  };

  const handleStartSIP = (sip: SIPRecommendation) => {
    setSelectedSIP(sip);
    setInvestAmount(sip.minInvestment.toString());
    setIsInvestDialogOpen(true);
  };

  const handleInvestmentSubmit = async () => {
    if (!selectedSIP) return;
    
    try {
      const amount = parseFloat(investAmount);
      if (isNaN(amount) || amount < selectedSIP.minInvestment) {
        toast.error(`Minimum investment should be ₹${selectedSIP.minInvestment}`);
        return;
      }
      
      await addInvestment({
        type: 'sip',
        name: selectedSIP.name,
        amount: amount,
        purchase_date: new Date().toISOString(),
        notes: `${frequency} SIP in ${selectedSIP.name} (${selectedSIP.category}) - ${selectedSIP.amc}`,
      });
      
      toast.success(`SIP started successfully!`, {
        description: `₹${amount} ${frequency} investment in ${selectedSIP.name}`
      });
      
      setIsInvestDialogOpen(false);
    } catch (error) {
      console.error('Error starting SIP:', error);
      toast.error('Failed to start SIP');
    }
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                SIP Recommendations
              </CardTitle>
              <CardDescription>Systematic Investment Plans based on your monthly budget</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Monthly Amount (₹)</Label>
                <span className="font-semibold">₹{monthlyAmount.toLocaleString()}</span>
              </div>
              <Slider
                value={[monthlyAmount]}
                min={100}
                max={100000}
                step={500}
                onValueChange={(values) => updateRecommendations(values[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹100</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>
            <div>
              <Label className="block mb-2">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4">
                <p className="text-sm">
                  <span className="text-muted-foreground">Yearly Investment: </span>
                  <span className="font-semibold">₹{calculateYearlyInvestment().toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {recommendationSet.map((sip) => (
              <div key={sip.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{sip.name}</h3>
                    <p className="text-sm text-muted-foreground">{sip.amc}</p>
                  </div>
                  <Badge className={`${riskColors[sip.riskLevel]}`}>{sip.riskLevel} Risk</Badge>
                </div>
                
                <div className="h-36 my-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sip.performanceData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(tick) => `${tick}%`}
                        domain={[-3, 'auto']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, "Monthly Return"]}
                      />
                      <defs>
                        <linearGradient id={`gradientSIP-${sip.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="return" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill={`url(#gradientSIP-${sip.id})`} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Category</span>
                    <span>{sip.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Min Investment</span>
                    <span>₹{sip.minInvestment}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Expected Returns</span>
                    <span>{sip.returnPotential} p.a.</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">NAV</span>
                    <span>₹{sip.nav}</span>
                  </div>
                </div>
                <p className="text-sm mt-2 mb-3">{sip.recommendation}</p>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="text-indigo-600">
                    <LineChart className="h-3.5 w-3.5 mr-1" />
                    View Performance
                  </Button>
                  <Button 
                    size="sm" 
                    className="ml-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => handleStartSIP(sip)}
                  >
                    <PiggyBank className="h-3.5 w-3.5 mr-1" />
                    Start SIP
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start SIP Investment</DialogTitle>
            <DialogDescription>
              Enter the amount you want to invest in{" "}
              {selectedSIP?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sip-amount" className="text-right">
                Amount (₹)
              </Label>
              <Input
                id="sip-amount"
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder={`Min ₹${selectedSIP?.minInvestment}`}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Frequency</Label>
              <div className="col-span-3 font-medium">
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fund</Label>
              <div className="col-span-3">
                <div className="font-medium">{selectedSIP?.name}</div>
                <div className="text-sm text-muted-foreground">{selectedSIP?.amc}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsInvestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleInvestmentSubmit}>
              <PiggyBank className="h-4 w-4 mr-2" />
              Start SIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
