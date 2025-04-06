
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvestmentCard } from "@/components/InvestmentCard";
import { SIPRecommendations } from "@/components/SIPRecommendations";
import { StockRecommendations } from "@/components/StockRecommendations";
import { LiveClock } from "@/components/LiveClock";
import { LiveWeather } from "@/components/LiveWeather";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentOptions } from "@/components/InvestmentOptions";
import { BankAccountLink } from "@/components/BankAccountLink";

export default function Investment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading, getInvestmentTotal, getInvestmentsByType } = useInvestments();
  const [activeView, setActiveView] = useState("overview");

  // Redirect to login if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate totals
  const totalInvestment = getInvestmentTotal();
  const investmentsByType = getInvestmentsByType();

  // Format numbers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">
                Investment Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your investments and explore new opportunities
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <LiveClock />
              <LiveWeather />
            </div>
          </div>

          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
              <TabsTrigger value="options">Investment Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Investment</CardTitle>
                    <CardDescription>Across all investment types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(totalInvestment)}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {investments.length} active investments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Monthly SIP</CardTitle>
                    <CardDescription>Total systematic investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatCurrency(investmentsByType.sip || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {investments.filter(i => i.type === 'sip').length} active SIPs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Portfolio Value</CardTitle>
                    <CardDescription>Estimated current value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatCurrency(totalInvestment * 1.05)} {/* Mock 5% growth */}
                    </div>
                    <p className="text-sm text-green-600 mt-1">+5% growth</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Breakdown</CardTitle>
                  <CardDescription>
                    View all your investments by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {investments.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          You don't have any investments yet.
                        </p>
                        <Button onClick={() => setActiveView("options")}>
                          Explore Investment Options
                        </Button>
                      </div>
                    ) : (
                      investments.map((investment) => (
                        <InvestmentCard key={investment.id} investment={investment} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended SIPs</CardTitle>
                    <CardDescription>
                      Systematic Investment Plans for long-term growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SIPRecommendations />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trending Stocks</CardTitle>
                    <CardDescription>
                      Market movers and investment opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StockRecommendations />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Link Bank Account</CardTitle>
                  <CardDescription>
                    Connect your bank account to streamline investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BankAccountLink />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="options">
              <InvestmentOptions />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
