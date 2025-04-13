
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Settings, Heart, Twitter, Github, Linkedin, Facebook } from "lucide-react";
import { Separator } from "@/components/ui/separator";
// import { LiveClock } from "./LiveClock";
// import { LiveWeather } from "./LiveWeather";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">BudgetWise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart financial management for a better future. Track, plan, and grow your wealth with ease.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </a>
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/budget" className="text-muted-foreground hover:text-foreground transition-colors">
                  Budget
                </Link>
              </li>
              <li>
                <Link to="/financial-activities" className="text-muted-foreground hover:text-foreground transition-colors">
                  Financial Activities
                </Link>
              </li>
              <li>
                <Link to="/investment" className="text-muted-foreground hover:text-foreground transition-colors">
                  Investments
                </Link>
              </li>
              <li>
                <Link to="/activity-log" className="text-muted-foreground hover:text-foreground transition-colors">
                  Activity Log
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            
            <div className="mt-6 space-y-3">
{/*               <LiveClock />
              <LiveWeather /> */}
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BudgetWise. All rights reserved.
          </p>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Made with</span>
            <Heart className="h-4 w-4 text-red-500 mx-1" />
            <span className="text-sm text-muted-foreground">in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
