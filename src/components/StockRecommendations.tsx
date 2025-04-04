
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Briefcase, TrendingUp, LineChart, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StockRecommendation {
  name: string;
  fullName: string;
  sector: string;
  price: number;
  risk: "Low" | "Medium" | "High";
  growth: string;
  recommendation: string;
}

// Stock recommendations based on different budget ranges
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
                <Button variant="outline" size="sm" className="text-blue-600">
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  View Analysis
                </Button>
                <Button size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700">
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  Invest Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
