
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, BarChart2, Landmark, LineChart, Lock, PiggyBank, Shield, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Budget Tracking",
    description: "Create and manage custom budgets for different categories. Track your spending in real-time and get alerts when you approach your limits.",
    icon: Wallet,
  },
  {
    title: "Financial Insights",
    description: "Visualize your spending patterns with interactive charts and analytics. Identify trends and opportunities to save.",
    icon: BarChart2,
  },
  {
    title: "Investment Tracking",
    description: "Monitor your investment portfolio across multiple platforms. Track growth, dividends, and performance over time.",
    icon: LineChart,
  },
  {
    title: "AI Financial Advisor",
    description: "Get personalized financial advice powered by artificial intelligence. Ask questions and get instant insights on your finances.",
    icon: PiggyBank,
  },
];

const testimonials = [
  {
    quote: "BudgetWise transformed how I manage my money. The insights and automation save me hours every month.",
    author: "Sarah J.",
    role: "Marketing Professional",
  },
  {
    quote: "The investment tracking features helped me optimize my portfolio and increased my returns by 12% this year.",
    author: "Michael T.",
    role: "Software Developer",
  },
  {
    quote: "I love how the AI assistant answers my financial questions instantly. It's like having a financial advisor 24/7.",
    author: "Priya K.",
    role: "Small Business Owner",
  },
];

export default function Index() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="container px-4 mx-auto relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 md:pr-10 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Take control of your
                <span className="text-gradient"> financial future</span>
              </h1>
              <p className="text-lg mb-8 text-foreground/80">
                Intelligent budget tracking, analysis, and investment insights in one powerful platform. Save more, spend wiser, and grow your wealth.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild size="lg" className="font-semibold">
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button onClick={scrollToFeatures} variant="outline" size="lg">
                  Explore Features
                </Button>
              </div>
              <div className="mt-8 flex items-center text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mr-2" />
                <span>Bank-level security. No credit card required.</span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="animate-float glass-card rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                    alt="Budget Dashboard Preview" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 animate-float" style={{ animationDelay: '0.5s' }}>
                  <Card className="w-64 glass-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Monthly Savings</div>
                        <div className="text-budget-green font-bold">+12%</div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-budget-blue to-budget-green rounded-full w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute -top-6 -right-6 animate-float" style={{ animationDelay: '1s' }}>
                  <Card className="w-64 glass-card">
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Investment Growth</div>
                      <div className="text-3xl font-bold text-budget-gold">+24.6%</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
              Everything you need to manage your finances in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="hover-scale glass-card">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
              Join thousands of people who have transformed their financial lives with BudgetWise.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div className="transition-all duration-500 ease-in-out flex">
                {testimonials.map((testimonial, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "min-w-full px-4 transition-opacity duration-500",
                      i === activeTestimonial ? "opacity-100" : "opacity-0 hidden"
                    )}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-8">
                        <div className="text-2xl mb-6">"{testimonial.quote}"</div>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold">{testimonial.author}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === activeTestimonial ? "bg-primary" : "bg-muted"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your finances?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are taking control of their financial future with BudgetWise.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/signup">Get Started Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
