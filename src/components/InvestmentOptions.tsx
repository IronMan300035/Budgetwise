
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestmentCard } from "@/components/InvestmentCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  TrendingUp, 
  BarChart4, 
  Landmark, 
  BadgeDollarSign, 
  GoldCoin, 
  CoinsIcon, 
  CircleDollarSign,
  Wallet,
  Building
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { useActivityLogs } from "@/hooks/useActivityLogs";

interface InvestmentOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  returns: string;
  risk: string;
  minInvestment: string;
  category: 'sip' | 'stock' | 'mutual_fund' | 'fd' | 'rd' | 'crypto';
}

export const InvestmentOptions = () => {
  const { user } = useAuth();
  const { addInvestment } = useInvestments();
  const { addActivityLog } = useActivityLogs();
  
  const investmentOptions: InvestmentOption[] = [
    // SIPs
    {
      id: 'sip-1',
      title: 'Equity SIP',
      description: 'Systematic Investment Plan for equity-oriented mutual funds',
      icon: TrendingUp,
      color: '#8B5CF6',
      returns: '12-15% p.a.',
      risk: 'Moderate',
      minInvestment: '₹500/month',
      category: 'sip'
    },
    {
      id: 'sip-2',
      title: 'Balanced SIP',
      description: 'Mix of equity and debt for stable returns',
      icon: BarChart4,
      color: '#0EA5E9',
      returns: '9-12% p.a.',
      risk: 'Moderate',
      minInvestment: '₹1,000/month',
      category: 'sip'
    },
    
    // Stocks
    {
      id: 'stock-1',
      title: 'Blue Chip Stocks',
      description: 'Large-cap established companies with stable returns',
      icon: Building,
      color: '#F97316',
      returns: '10-12% p.a.',
      risk: 'Moderate',
      minInvestment: '₹5,000',
      category: 'stock'
    },
    {
      id: 'stock-2',
      title: 'Growth Stocks',
      description: 'Mid-cap companies with high growth potential',
      icon: TrendingUp,
      color: '#ea384c',
      returns: '15-20% p.a.',
      risk: 'High',
      minInvestment: '₹10,000',
      category: 'stock'
    },
    
    // Mutual Funds
    {
      id: 'mf-1',
      title: 'Large Cap Fund',
      description: 'Fund investing in established large companies',
      icon: Wallet,
      color: '#0EA5E9',
      returns: '12-14% p.a.',
      risk: 'Moderate',
      minInvestment: '₹5,000',
      category: 'mutual_fund'
    },
    {
      id: 'mf-2',
      title: 'Index Fund',
      description: 'Passive fund tracking market indices like Nifty 50',
      icon: BarChart4,
      color: '#8B5CF6',
      returns: '10-12% p.a.',
      risk: 'Moderate',
      minInvestment: '₹1,000',
      category: 'mutual_fund'
    },
    
    // Fixed Deposits
    {
      id: 'fd-1',
      title: 'Bank FD',
      description: 'Fixed deposit with guaranteed returns',
      icon: Landmark,
      color: '#1EAEDB',
      returns: '5-6.5% p.a.',
      risk: 'Low',
      minInvestment: '₹10,000',
      category: 'fd'
    },
    {
      id: 'fd-2',
      title: 'Corporate FD',
      description: 'Fixed deposit with companies for higher returns',
      icon: Building,
      color: '#6E59A5',
      returns: '7-8.5% p.a.',
      risk: 'Low-Moderate',
      minInvestment: '₹25,000',
      category: 'fd'
    },
    
    // Recurring Deposits
    {
      id: 'rd-1',
      title: 'Bank RD',
      description: 'Recurring deposit with monthly instalments',
      icon: CircleDollarSign,
      color: '#33C3F0',
      returns: '5-6% p.a.',
      risk: 'Low',
      minInvestment: '₹1,000/month',
      category: 'rd'
    },
    
    // Crypto
    {
      id: 'crypto-1',
      title: 'Bitcoin',
      description: 'Leading cryptocurrency with high volatility',
      icon: CoinsIcon,
      color: '#F97316',
      returns: 'Variable',
      risk: 'Very High',
      minInvestment: '₹1,000',
      category: 'crypto'
    },
    {
      id: 'crypto-2',
      title: 'Ethereum',
      description: 'Programmable blockchain with smart contract functionality',
      icon: GoldCoin,
      color: '#8B5CF6',
      returns: 'Variable',
      risk: 'Very High',
      minInvestment: '₹1,000',
      category: 'crypto'
    },
  ];
  
  const handleInvestClick = async (option: InvestmentOption) => {
    if (!user) {
      toast.error("Please log in to invest");
      return;
    }
    
    try {
      // For demo purposes, we'll create a simulated investment
      const amount = parseFloat(option.minInvestment.replace(/[^\d.]/g, ''));
      const result = await addInvestment({
        type: option.category,
        name: option.title,
        amount: amount,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: `Investment in ${option.title}`,
      });
      
      if (result) {
        await addActivityLog(
          'investment', 
          `Started new investment in ${option.title} (${option.category})`
        );
        toast.success(`Investment in ${option.title} added successfully!`);
      }
    } catch (error) {
      console.error("Error adding investment:", error);
      toast.error("Failed to add investment. Please try again.");
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Investment Options</CardTitle>
        <CardDescription>Explore different investment opportunities tailored for you</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sip" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="sip">SIPs</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
            <TabsTrigger value="fd">FDs</TabsTrigger>
            <TabsTrigger value="rd">RDs</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sip" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentOptions
                .filter(option => option.category === 'sip')
                .map(option => (
                  <InvestmentCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestClick(option)}
                  />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="stocks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentOptions
                .filter(option => option.category === 'stock')
                .map(option => (
                  <InvestmentCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestClick(option)}
                  />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="mutual-funds" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentOptions
                .filter(option => option.category === 'mutual_fund')
                .map(option => (
                  <InvestmentCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestClick(option)}
                  />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="fd" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentOptions
                .filter(option => option.category === 'fd')
                .map(option => (
                  <InvestmentCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestClick(option)}
                  />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="rd" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentOptions
                .filter(option => option.category === 'rd')
                .map(option => (
                  <InvestmentCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestClick(option)}
                  />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentOptions
                .filter(option => option.category === 'crypto')
                .map(option => (
                  <InvestmentCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestClick(option)}
                  />
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
