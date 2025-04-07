
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Investment } from '@/hooks/useInvestments';

interface InvestmentCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  returns: string;
  risk: string;
  minInvestment: string;
  onClick: () => void;
  investment?: Investment; // Add optional investment prop
}

export const InvestmentCard: React.FC<InvestmentCardProps | { investment: Investment }> = (props) => {
  // Check if we're receiving an investment object or regular props
  if ('investment' in props) {
    const { investment } = props;
    // This is a user's existing investment
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(investment.amount);
    
    return (
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
        <div className="flex p-6">
          <div className="mr-4">
            <div 
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#3366FF20', color: '#3366FF' }}
            >
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{investment.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {investment.notes || `${investment.type.toUpperCase()} investment`}
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium">{formattedAmount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium">{investment.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Date</div>
                <div className="font-medium">
                  {new Date(investment.purchase_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button 
              className="w-full flex justify-between"
              style={{ backgroundColor: '#3366FF' }}
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Regular investment option display (original code)
  const { title, description, icon: IconComponent, color, returns, risk, minInvestment, onClick } = props;
  
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
      <div className="flex p-6">
        <div className="mr-4">
          <div 
            className="h-12 w-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <div>
              <div className="text-muted-foreground">Returns</div>
              <div className="font-medium">{returns}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Risk</div>
              <div className="font-medium">{risk}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Min. Investment</div>
              <div className="font-medium">{minInvestment}</div>
            </div>
          </div>
          <Button 
            onClick={onClick}
            className="w-full flex justify-between"
            style={{ backgroundColor: color }}
          >
            <span>Invest Now</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
