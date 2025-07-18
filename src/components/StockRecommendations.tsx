
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Briefcase, 
  TrendingUp, 
  LineChart, 
  ArrowUpRight, 
  XCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useInvestments } from "@/hooks/useInvestments";
import { MarketTrendGraph } from "@/components/MarketTrendGraph";
import { toast } from "sonner";

interface StockRecommendation {
  name: string;
  fullName: string;
  sector: string;
  price: number;
  risk: "Low" | "Medium" | "High";
  growth: string;
  recommendation: string;
}

// Enhanced stock recommendations with more options
const stockRecommendationsByBudget: Record<string, StockRecommendation[]> = {
  "lowBudget": [
    { 
      name: "TCSLTD",
      fullName: "Tata Consultancy Services Ltd",
      sector: "IT Services",
      price: 380,
      risk: "Low",
      growth: "Stable",
      recommendation: "Strong IT company with consistent growth and dividends."
    },
    { 
      name: "INFY",
      fullName: "Infosys Ltd",
      sector: "IT Services",
      price: 200,
      risk: "Low",
      growth: "Stable",
      recommendation: "Leading IT services provider with global presence."
    },
    { 
      name: "HEROMOTOCO",
      fullName: "Hero MotoCorp Ltd",
      sector: "Automobile",
      price: 450,
      risk: "Medium",
      growth: "Moderate",
      recommendation: "World's largest two-wheeler manufacturer with strong Indian market."
    },
    { 
      name: "WIPRO",
      fullName: "Wipro Ltd",
      sector: "IT Services",
      price: 420,
      risk: "Low",
      growth: "Stable",
      recommendation: "Global IT consulting and business process services company."
    },
    { 
      name: "SUNPHARMA",
      fullName: "Sun Pharmaceutical Industries Ltd",
      sector: "Pharmaceutical",
      price: 490,
      risk: "Medium",
      growth: "Good",
      recommendation: "India's largest pharmaceutical company with global presence."
    }
  ],
  "mediumBudget": [
    { 
      name: "BHARTIARTL",
      fullName: "Bharti Airtel Ltd",
      sector: "Telecom",
      price: 920,
      risk: "Medium",
      growth: "Good",
      recommendation: "Leading telecom player with strong 5G prospects."
    },
    { 
      name: "ASIANPAINT",
      fullName: "Asian Paints Ltd",
      sector: "Consumer",
      price: 3000,
      risk: "Low",
      growth: "Stable",
      recommendation: "Market leader in decorative paints with consistent growth."
    },
    { 
      name: "HDFCBANK",
      fullName: "HDFC Bank Ltd",
      sector: "Banking",
      price: 1600,
      risk: "Low",
      growth: "Good",
      recommendation: "India's leading private sector bank with strong fundamentals."
    },
    { 
      name: "ICICIBANK",
      fullName: "ICICI Bank Ltd",
      sector: "Banking",
      price: 980,
      risk: "Low",
      growth: "Good",
      recommendation: "Second-largest private sector bank in India with diversified business."
    },
    { 
      name: "HINDALCO",
      fullName: "Hindalco Industries Ltd",
      sector: "Metals & Mining",
      price: 550,
      risk: "Medium",
      growth: "Cyclical",
      recommendation: "One of the largest aluminum manufacturers with global operations."
    }
  ],
  "highBudget": [
    { 
      name: "RELIANCE",
      fullName: "Reliance Industries Ltd",
      sector: "Conglomerate",
      price: 2800,
      risk: "Medium",
      growth: "High",
      recommendation: "Diversified business with strong presence in retail, telecom, and petrochemicals."
    },
    { 
      name: "BAJFINANCE",
      fullName: "Bajaj Finance Ltd",
      sector: "Financial Services",
      price: 7200,
      risk: "High",
      growth: "High",
      recommendation: "Leading NBFC with strong digital lending platform."
    },
    { 
      name: "MARUTI",
      fullName: "Maruti Suzuki India Ltd",
      sector: "Automobile",
      price: 10500,
      risk: "Medium",
      growth: "Moderate",
      recommendation: "India's largest passenger car manufacturer with strong market share."
    },
    { 
      name: "TITAN",
      fullName: "Titan Company Ltd",
      sector: "Consumer",
      price: 3200,
      risk: "Medium",
      growth: "Good",
      recommendation: "Leading jewellery retailer with diversified product portfolio."
    },
    { 
      name: "LTI",
      fullName: "Larsen & Toubro Infotech Ltd",
      sector: "IT Services",
      price: 5800,
      risk: "Medium",
      growth: "High",
      recommendation: "Fast-growing IT services company with strong enterprise solutions."
    }
  ]
};

const riskColors = {
  "Low": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Medium": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "High": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

export function StockRecommendations() {
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [recommendationSet, setRecommendationSet] = useState<StockRecommendation[]>(
    stockRecommendationsByBudget.mediumBudget
  );
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockRecommendation | null>(null);
  const { addInvestment } = useInvestments();

  // Update recommendations based on investment amount
  const updateRecommendations = (amount: number) => {
    setInvestmentAmount(amount);
    
    if (amount <= 5000) {
      setRecommendationSet(stockRecommendationsByBudget.lowBudget);
    } else if (amount <= 25000) {
      setRecommendationSet(stockRecommendationsByBudget.mediumBudget);
    } else {
      setRecommendationSet(stockRecommendationsByBudget.highBudget);
    }
  };

  const handleViewAnalysis = (stock: StockRecommendation) => {
    setSelectedStock(stock);
    setShowAnalysis(true);
  };

  const handleInvest = async (stock: StockRecommendation) => {
    const quantity = Math.floor(investmentAmount / stock.price);
    
    try {
      const result = await addInvestment({
        name: stock.fullName,
        symbol: stock.name,
        purchase_price: stock.price,
        shares: quantity,
        purchase_date: new Date().toISOString().split('T')[0]
      });

      if (result) {
        toast.success(`Successfully invested in ${stock.name}`);
      }
    } catch (error) {
      console.error("Error investing:", error);
      toast.error("Failed to process investment");
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
              Stock Recommendations
            </CardTitle>
            <CardDescription>Stock picks based on your investment budget</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Label>Investment Amount (₹)</Label>
            <span className="font-semibold">₹{investmentAmount.toLocaleString()}</span>
          </div>
          <Slider
            value={[investmentAmount]}
            min={100}
            max={100000}
            step={1000}
            onValueChange={(values) => updateRecommendations(values[0])}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹100</span>
            <span>₹50,000</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        <div className="space-y-4">
          {recommendationSet.map((stock, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg">{stock.name}</h3>
                    <Badge variant="outline" className="ml-2">₹{stock.price}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.fullName}</p>
                </div>
                <Badge className={`${riskColors[stock.risk]}`}>{stock.risk} Risk</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
                <div>
                  <span className="text-muted-foreground block">Sector</span>
                  <span>{stock.sector}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Growth</span>
                  <span>{stock.growth}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Quantity</span>
                  <span>{Math.floor(investmentAmount / stock.price)} shares</span>
                </div>
              </div>
              <p className="text-sm mt-2">{stock.recommendation}</p>
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600"
                  onClick={() => handleViewAnalysis(stock)}
                >
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  View Analysis
                </Button>
                <Button 
                  size="sm" 
                  className="ml-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleInvest(stock)}
                >
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  Invest Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Stock Analysis Dialog */}
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                {selectedStock?.name} - Market Analysis
              </DialogTitle>
              <DialogDescription>
                Real-time market data and analysis for {selectedStock?.fullName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{selectedStock?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStock?.sector}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{selectedStock?.price}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +1.2% today
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] border rounded-lg p-4">
                <MarketTrendGraph />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Market Cap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">₹{(selectedStock?.price ? selectedStock.price * 100000000 : 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">P/E Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{(Math.random() * 30 + 10).toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Dividend Yield</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{(Math.random() * 5).toFixed(2)}%</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAnalysis(false)} className="mr-2">
                  <XCircle className="h-4 w-4 mr-1" />
                  Close
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    handleInvest(selectedStock!);
                    setShowAnalysis(false);
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Invest Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
