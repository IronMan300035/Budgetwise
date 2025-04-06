
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CircleDollarSign, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceCommandButton } from '@/components/VoiceCommandButton';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-2 font-bold">
          <CircleDollarSign className="h-6 w-6 text-primary" />
          <span>BudgetWise</span>
        </Link>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-6">
              <div className="flex flex-col space-y-4">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/budget">Budget</Link>
                <Link to="/investment">Investments</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/settings">Settings</Link>
                <Button variant="outline" onClick={signOut}>
                  Log Out
                </Button>
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/budget">Budget</Link>
            <Link to="/investment">Investments</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/settings">Settings</Link>
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              <>
                <VoiceCommandButton />
                <Button variant="outline" onClick={signOut}>
                  Log Out
                </Button>
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
