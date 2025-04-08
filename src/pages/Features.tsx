
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  LineChart, 
  PieChart, 
  Wallet, 
  BellRing, 
  Shield, 
  TrendingUp, A
  rrowUpRight, 
  Landmark, 
  Smartphone, 
  Banknote, 
  Clock, 
  Calendar 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Budget Tracking",
      description: "Set budgets and track your spending across various categories to stay financially disciplined.",
      icon: <Wallet className="h-8 w-8 text-primary" />,
    },
    {
      title: "Transaction Management",
      description: "Record and categorize all your financial transactions for a complete overview of your finances.",
      icon: <Banknote className="h-8 w-8 text-primary" />,
    },
    {
      title: "Investment Portfolio",
      description: "Track and monitor your investments in stocks, SIPs, mutual funds, and more in real-time.",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
    },
    {
      title: "Expense Analytics",
      description: "Get detailed reports and visualizations to understand your spending patterns and habits.",
      icon: <LineChart className="h-8 w-8 text-primary" />,
    },
    {
      title: "Bank Integration",
      description: "Connect your bank accounts for automatic transaction tracking and reconciliation.",
      icon: <Landmark className="h-8 w-8 text-primary" />,
    },
    {
      title: "Goal Setting",
      description: "Create financial goals and track your progress towards achieving them over time.",
      icon: <ArrowUpRight className="h-8 w-8 text-primary" />,
    },
    {
      title: "Custom Categories",
      description: "Create personalized categories for your transactions to match your financial lifestyle.",
      icon: <PieChart className="h-8 w-8 text-primary" />,
    },
    {
      title: "Real-time Alerts",
      description: "Get notifications for budget exceeding, bill payments, and other important financial events.",
      icon: <BellRing className="h-8 w-8 text-primary" />,
    },
    {
      title: "Secure Data",
      description: "Your financial data is encrypted and protected with industry-standard security measures.",
      icon: <Shield className="h-8 w-8 text-primary" />,
    },
    {
      title: "Mobile App",
      description: "Access your financial data on the go with our mobile application for iOS and Android.",
      icon: <Smartphone className="h-8 w-8 text-primary" />,
    },
    {
      title: "Live Updates",
      description: "Get real-time updates for weather, time, and market trends to stay informed.",
      icon: <Clock className="h-8 w-8 text-primary" />,
    },
    {
      title: "Financial Calendar",
      description: "Plan your financial activities with a dedicated calendar view for upcoming transactions.",
      icon: <Calendar className="h-8 w-8 text-primary" />,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-4">
              Powerful Features for Your Financial Journey
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Discover all the tools and features BudgetWise offers to help you manage, track, and grow your finances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Features That Make Your Financial Life Easier</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4 bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to action */}
        <section className="py-16 px-4 bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Finances?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Start using BudgetWise today and transform how you manage your money with our powerful suite of financial tools.
            </p>
            <Button asChild size="lg">
              <Link to="/signup">Sign Up for Free</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
