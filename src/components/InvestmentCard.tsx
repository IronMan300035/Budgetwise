
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface InvestmentCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  returns: string;
  risk: string;
  minInvestment: string;
  onClick: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  title,
  description,
  icon: IconComponent,
  color,
  returns,
  risk,
  minInvestment,
  onClick
}) => {
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
