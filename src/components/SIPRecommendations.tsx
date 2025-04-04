
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, LineChart, ArrowUpRight, PiggyBank } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SIPRecommendation {
  name: string;
  amc: string;
  category: string;
  riskLevel: "Low" | "Medium" | "High";
  minInvestment: number;
  returnPotential: string;
  nav: number;
  recommendation: string;
}

// SIP recommendations based on different budget ranges
const sipRecommendationsByBudget: Record<string, SIPRecommendation[]> = {
  "lowBudget": [
    { 
      name: "ICICI Prudential Bluechip Fund",
      amc: "ICICI Prudential",
      category: "Large Cap",
      riskLevel: "Low",
      minInvestment: 100,
      returnPotential: "10-12%",
      nav: 65.8,
      recommendation: "Stable fund focused on blue-chip companies with good track record."
    },
    { 
      name: "SBI Small Cap Fund",
      amc: "SBI Mutual Fund",
      category: "Small Cap",
      riskLevel: "High",
      minInvestment: 500,
      returnPotential: "15-18%",
      nav: 125.75,
      recommendation: "High growth potential with focus on emerging small companies."
    },
    { 
      name: "Axis Long Term Equity Fund",
      amc: "Axis Mutual Fund",
      category: "ELSS",
      riskLevel: "Medium",
      minInvestment: 500,
      returnPotential: "12-14%",
      nav: 78.45,
      recommendation: "Tax-saving fund with good long-term performance."
    }
  ],
  "mediumBudget": [
    { 
      name: "Parag Parikh Flexi Cap Fund",
      amc: "PPFAS Mutual Fund",
      category: "Flexi Cap",
      riskLevel: "Medium",
      minInvestment: 1000,
      returnPotential: "13-15%",
      nav: 58.75,
      recommendation: "Globally diversified portfolio with value investing approach."
    },
    { 
      name: "Mirae Asset Emerging Bluechip",
      amc: "Mirae Asset",
      category: "Large & Mid Cap",
      riskLevel: "Medium",
      minInvestment: 1000,
      returnPotential: "14-16%",
      nav: 103.45,
      recommendation: "Balanced exposure to established and growing companies."
    },
    { 
      name: "Kotak Emerging Equity Fund",
      amc: "Kotak Mahindra",
      category: "Mid Cap",
      riskLevel: "High",
      minInvestment: 1000,
      returnPotential: "15-17%",
      nav: 87.92,
      recommendation: "Focus on emerging mid-sized companies with growth potential."
    }
  ],
  "highBudget": [
    { 
      name: "HDFC Mid-Cap Opportunities Fund",
      amc: "HDFC Mutual Fund",
      category: "Mid Cap",
      riskLevel: "High",
      minInvestment: 2500,
      returnPotential: "15-18%",
      nav: 112.65,
      recommendation: "Focus on quality mid-sized companies with strong fundamentals."
    },
    { 
      name: "DSP Small Cap Fund",
      amc: "DSP Investment Managers",
      category: "Small Cap",
      riskLevel: "High",
      minInvestment: 5000,
      returnPotential: "16-20%",
      nav: 98.45,
      recommendation: "Invests in small companies with high growth potential."
    },
    { 
      name: "Nippon India Multi Cap Fund",
      amc: "Nippon India",
      category: "Multi Cap",
      riskLevel: "Medium",
      minInvestment: 5000,
      returnPotential: "14-16%",
      nav: 145.75,
      recommendation: "Diversified portfolio across market capitalizations."
    }
  ]
};

const riskColors = {
  "Low": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Medium": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "High": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

export function SIPRecommendations() {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [frequency, setFrequency] = useState("monthly");
  const [recommendationSet, setRecommendationSet] = useState<SIPRecommendation[]>(
    sipRecommendationsByBudget.mediumBudget
  );

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

  return (
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

        <div className="space-y-4">
          {recommendationSet.map((sip, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{sip.name}</h3>
                  <p className="text-sm text-muted-foreground">{sip.amc}</p>
                </div>
                <Badge className={`${riskColors[sip.riskLevel]}`}>{sip.riskLevel} Risk</Badge>
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
              <p className="text-sm mt-2">{sip.recommendation}</p>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" className="text-indigo-600">
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  View Performance
                </Button>
                <Button size="sm" className="ml-2 bg-indigo-600 hover:bg-indigo-700">
                  <PiggyBank className="h-3.5 w-3.5 mr-1" />
                  Start SIP
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
