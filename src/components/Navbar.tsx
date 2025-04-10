
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { LiveClock } from "@/components/LiveClock";
import { LiveWeather } from "@/components/LiveWeather";
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
  MessageSquare,
  Newspaper,
  Bell,
  LayoutDashboard,
  Receipt,
  PieChart as PieChartIcon,
  TrendingUp,
  Newspaper as NewspaperIcon,
  Split,
  ListChecks,
  PiggyBank
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleMobileMenu = () => setIsOpen(!isOpen);
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", requiresAuth: true },
    { name: "Budgets", href: "/budget", requiresAuth: true },
    { name: "Financial Activities", href: "/financial-activities", requiresAuth: true },
    { name: "Investments", href: "/investment", requiresAuth: true },
    { name: "News Bulletin", href: "/news-bulletin", requiresAuth: false },
    { name: "Feedback", href: "/feedback", requiresAuth: false }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isInDashboard = location.pathname.includes("/dashboard") || 
                        location.pathname.includes("/budget") || 
                        location.pathname.includes("/financial-activities") || 
                        location.pathname.includes("/investment") || 
                        location.pathname.includes("/profile") || 
                        location.pathname.includes("/settings") || 
                        location.pathname.includes("/activity-log");

  const shouldShowAuthButtons = !isInDashboard && !user;
  
  const showCurrencyToggle = !isInDashboard;
  
  const pathname = location.pathname;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="mr-6 flex items-center">
            <PiggyBank className="h-6 w-6 text-primary mr-2" />
            <span className="hidden font-bold sm:inline-block">BudgetWise</span>
          </Link>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggleMobileMenu}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="hidden flex-1 md:flex">
            <ul className="flex items-center gap-6 text-sm">
              {user && (
                <>
                  <li>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/dashboard" ? "text-foreground font-medium" : "text-foreground/60"}`}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/transactions" 
                      className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/transactions" ? "text-foreground font-medium" : "text-foreground/60"}`}
                    >
                      <Receipt className="w-4 h-4 mr-1" />
                      Transactions
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/budget" 
                      className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/budget" ? "text-foreground font-medium" : "text-foreground/60"}`}
                    >
                      <PieChartIcon className="w-4 h-4 mr-1" />
                      Budget
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/investment" 
                      className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/investment" ? "text-foreground font-medium" : "text-foreground/60"}`}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Investments
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/news-bulletin" 
                      className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/news-bulletin" ? "text-foreground font-medium" : "text-foreground/60"}`}
                    >
                      <NewspaperIcon className="w-4 h-4 mr-1" />
                      News
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/splitwise" 
                      className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/splitwise" ? "text-foreground font-medium" : "text-foreground/60"}`}
                    >
                      <Split className="w-4 h-4 mr-1" />
                      Split Expenses
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link 
                  to="/features" 
                  className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/features" ? "text-foreground font-medium" : "text-foreground/60"}`}
                >
                  <ListChecks className="w-4 h-4 mr-1" />
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className={`flex items-center transition-colors hover:text-foreground/80 ${pathname === "/pricing" ? "text-foreground font-medium" : "text-foreground/60"}`}
                >
                  <CircleDollarSign className="w-4 h-4 mr-1" />
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center space-x-2">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Notification Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notify">Email Notifications</Label>
                        <Switch id="email-notify" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notify">Push Notifications</Label>
                        <Switch id="push-notify" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="budget-alerts">Budget Alerts</Label>
                        <Switch id="budget-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="market-updates">Market Updates</Label>
                        <Switch id="market-updates" defaultChecked />
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <h4 className="font-medium mb-2">Recent Notifications</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <div className="text-sm p-2 bg-secondary rounded">
                          <p className="font-medium">Budget Limit Alert</p>
                          <p className="text-muted-foreground">You've reached 80% of your monthly food budget</p>
                          <p className="text-xs text-muted-foreground mt-1">Just now</p>
                        </div>
                        <div className="text-sm p-2 bg-secondary rounded">
                          <p className="font-medium">New Feature Available</p>
                          <p className="text-muted-foreground">Try out our new AI-powered financial assistant</p>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
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
                    <Link to="/bank-accounts">Link Bank Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                        to="/bank-accounts"
                        onClick={toggleMenu}
                        className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                      >
                        Link Bank Account
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
      </header>
      
      <div className="container mx-auto px-4 py-2 flex flex-wrap justify-center md:justify-end items-center gap-2">
        <LiveWeather />
        <LiveClock />
      </div>
    </>
  );
}
