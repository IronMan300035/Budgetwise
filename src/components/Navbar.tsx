import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { 
  CircleDollarSign,
  ChevronDown,
  Menu,
  X,
  LineChart,
  PieChart,
  Wallet,
  Landmark,
  Settings,
  Activity,
  LogOut,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", requiresAuth: true },
    { name: "Budgets", href: "/budget", requiresAuth: true },
    { name: "Investments", href: "/investment", requiresAuth: true },
    { name: "Feedback", href: "/feedback", requiresAuth: false }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isInDashboard = location.pathname.includes("/dashboard") || 
                        location.pathname.includes("/budget") || 
                        location.pathname.includes("/transactions") || 
                        location.pathname.includes("/investment") || 
                        location.pathname.includes("/profile") || 
                        location.pathname.includes("/settings") || 
                        location.pathname.includes("/activity-log");

  // Only show auth buttons on non-dashboard pages AND when not authenticated
  const shouldShowAuthButtons = !isInDashboard && !user;
  
  // Only show currency toggle on non-dashboard pages
  const showCurrencyToggle = !isInDashboard;
  
  return (
    <nav className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <CircleDollarSign className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">BudgetWise</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Show navigation links only if authenticated */}
            <div className="flex space-x-1">
              {navigation.map((item) => (
                (!item.requiresAuth || (item.requiresAuth && user)) && (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            <div className="flex items-center space-x-2 border-l ml-2 pl-2">
              {showCurrencyToggle && <ThemeToggle />}
              {!showCurrencyToggle && <ThemeToggle />}
              
              {shouldShowAuthButtons ? (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/activity-log">Activity Log</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/logout" className="text-red-500 flex items-center">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {showCurrencyToggle && <ThemeToggle />}
            {!showCurrencyToggle && <ThemeToggle />}
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {shouldShowAuthButtons ? (
              <div className="flex flex-col space-y-2 p-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/login" onClick={toggleMenu}>Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup" onClick={toggleMenu}>Sign up</Link>
                </Button>
              </div>
            ) : (
              <>
                {navigation.map((item) => (
                  (!item.requiresAuth || (item.requiresAuth && user)) && (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={toggleMenu}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
                {user && (
                  <>
                    <div className="border-t my-2"></div>
                    <Link
                      to="/profile"
                      onClick={toggleMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/activity-log"
                      onClick={toggleMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                    >
                      Activity Log
                    </Link>
                    <Link
                      to="/settings"
                      onClick={toggleMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/logout"
                      onClick={toggleMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
