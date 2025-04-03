
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";

// Exchange rates with USD as base currency
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.69,
  INR: 83.48,
  AUD: 1.52,
  CAD: 1.37,
  CHF: 0.90,
  CNY: 7.24,
  SGD: 1.34,
};

// Common currencies
const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

export function CurrencyToggle() {
  const [currency, setCurrency] = useState({ code: "USD", symbol: "$" });
  const [mounted, setMounted] = useState(false);
  const [currencies, setCurrencies] = useState(COMMON_CURRENCIES);

  useEffect(() => {
    setMounted(true);
    // Store the selected currency in localStorage
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency));
    }
    
    // In a real app, we would fetch the latest exchange rates from an API
    // fetchExchangeRates();
  }, []);

  const handleCurrencyChange = (newCurrency: { code: string; symbol: string }) => {
    const oldCurrency = currency;
    setCurrency(newCurrency);
    localStorage.setItem("currency", JSON.stringify(newCurrency));
    
    // Trigger an event that other components can listen to
    window.dispatchEvent(
      new CustomEvent("currency-change", { 
        detail: {
          ...newCurrency,
          // Include conversion rate from old to new currency
          conversionRate: EXCHANGE_RATES[newCurrency.code as keyof typeof EXCHANGE_RATES] / 
                          EXCHANGE_RATES[oldCurrency.code as keyof typeof EXCHANGE_RATES]
        }
      })
    );
  };

  // Helper function to convert amount between currencies
  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
    const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  };

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0"></Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2">
          <span className="mr-1">{currency.symbol}</span>
          <span>{currency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => handleCurrencyChange({ code: curr.code, symbol: curr.symbol })}
          >
            <span className="mr-2">{curr.symbol}</span>
            <span>{curr.name}</span>
            <span className="ml-1 text-muted-foreground">({curr.code})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export utility functions for other components to use
export const CurrencyUtils = {
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string): number => {
    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
    const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  },
  
  formatAmount: (amount: number, currencySymbol: string): string => {
    return `${currencySymbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
};
