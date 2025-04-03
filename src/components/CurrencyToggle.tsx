
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";

// Common currencies as a starting point
const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
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
    
    // In a real app, we would fetch the full list and rates from an API
    // fetchCurrencies();
  }, []);

  const handleCurrencyChange = (newCurrency: { code: string; symbol: string }) => {
    setCurrency(newCurrency);
    localStorage.setItem("currency", JSON.stringify(newCurrency));
    // Trigger an event that other components can listen to
    window.dispatchEvent(
      new CustomEvent("currency-change", { detail: newCurrency })
    );
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
