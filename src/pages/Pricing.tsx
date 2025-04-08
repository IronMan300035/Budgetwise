
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Check, X, HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  
  const features = [
    {
      name: "Transaction Tracking",
      description: "Monitor income and expenses",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Budget Creation",
      description: "Create and manage budgets",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Basic Reports",
      description: "Essential financial reports",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Transaction Categories",
      description: "Categorize your transactions",
      free: 5,
      plus: 15,
      pro: "Unlimited",
    },
    {
      name: "Bank Connections",
      description: "Link bank accounts",
      free: 1,
      plus: 5,
      pro: "Unlimited",
    },
    {
      name: "Investment Tracking",
      description: "Track investment portfolio",
      free: false,
      plus: true,
      pro: true,
    },
    {
      name: "Real-time Updates",
      description: "Live market and portfolio updates",
      free: false,
      plus: false,
      pro: true,
    },
    {
      name: "Financial Advisors",
      description: "Get expert financial advice",
      free: false,
      plus: false,
      pro: true,
    },
    {
      name: "API Access",
      description: "Integrate with other tools",
      free: false,
      plus: false,
      pro: true,
    },
    {
      name: "Premium Support",
      description: "Priority customer support",
      free: false,
      plus: true,
      pro: true,
    },
    {
      name: "Data Export",
      description: "Export your financial data",
      free: "Basic",
      plus: "Advanced",
      pro: "Advanced",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Header section */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Choose the plan that fits your financial management needs
            </p>
            
            <Tabs 
              defaultValue="monthly" 
              value={billingCycle}
              onValueChange={(value) => setBillingCycle(value as "monthly" | "annual")}
              className="max-w-md mx-auto mb-16"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">Annual <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">Save 20%</span></TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <Card className="shadow-lg relative overflow-hidden">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    ₹0<span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )
                        ) : (
                          <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                            {feature.free}
                          </span>
                        )}
                        <div>
                          <span className="text-sm font-medium">{feature.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="inline-block ml-1 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{feature.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Plus Plan */}
              <Card className="shadow-lg relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5" />
                <CardHeader>
                  <CardTitle>Plus</CardTitle>
                  <CardDescription>For individual financial management</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    {billingCycle === "monthly" ? "₹299" : "₹2,999"}
                    <span className="text-lg font-normal text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.slice(0, 9).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {typeof feature.plus === 'boolean' ? (
                          feature.plus ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )
                        ) : (
                          <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                            {feature.plus}
                          </span>
                        )}
                        <div>
                          <span className="text-sm font-medium">{feature.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="inline-block ml-1 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{feature.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Link to="/signup?plan=plus">Subscribe</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Pro Plan */}
              <Card className="shadow-lg relative overflow-hidden border-indigo-600 dark:border-indigo-400">
                <div className="absolute top-0 left-0 right-0 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center text-xs font-bold">
                  MOST POPULAR
                </div>
                <CardHeader className="pt-10">
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>Full featured for serious management</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    {billingCycle === "monthly" ? "₹599" : "₹5,999"}
                    <span className="text-lg font-normal text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )
                        ) : (
                          <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                            {feature.pro}
                          </span>
                        )}
                        <div>
                          <span className="text-sm font-medium">{feature.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="inline-block ml-1 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{feature.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Link to="/signup?plan=pro">Subscribe</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated amount for the remainder of your billing cycle. When you downgrade, the changes will take effect at the start of your next billing cycle.</p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-2">Is there a free trial for paid plans?</h3>
                <p className="text-muted-foreground">Yes, we offer a 14-day free trial for both Plus and Pro plans. No credit card is required to start your trial.</p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-2">How secure is my financial data?</h3>
                <p className="text-muted-foreground">We use bank-level 256-bit encryption to protect your data. We do not store your banking credentials on our servers. All connections to banks are made through secure, read-only connections.</p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-2">Can I get a refund if I'm not satisfied?</h3>
                <p className="text-muted-foreground">We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions can be canceled at any time, but we do not provide refunds for partial months.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to action */}
        <section className="py-16 px-4 bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Financial Life?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of users who have taken control of their finances with BudgetWise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/signup">Sign Up for Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
