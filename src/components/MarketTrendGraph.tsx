
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

// Sample historical data for market indices
const generateHistoricalData = () => {
  const data = [];
  const startDate = new Date(2023, 11, 1); // Dec 1, 2023
  const endDate = new Date(); // Current date
  
  // Get start values
  const niftyStart = 21000 + Math.random() * 500;
  const sensexStart = 70000 + Math.random() * 1000;
  const niftyBankStart = 47000 + Math.random() * 800;
  
  let niftyCurrent = niftyStart;
  let sensexCurrent = sensexStart;
  let niftyBankCurrent = niftyBankStart;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 3)) {
    // Small random changes for each step (between -1% and +1%)
    const niftyChange = niftyCurrent * (Math.random() * 0.02 - 0.01);
    const sensexChange = sensexCurrent * (Math.random() * 0.02 - 0.01);
    const niftyBankChange = niftyBankCurrent * (Math.random() * 0.025 - 0.0125);
    
    niftyCurrent += niftyChange;
    sensexCurrent += sensexChange;
    niftyBankCurrent += niftyBankChange;
    
    data.push({
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      nifty: Math.round(niftyCurrent),
      sensex: Math.round(sensexCurrent),
      niftyBank: Math.round(niftyBankCurrent)
    });
  }
  
  // Make sure last values match approximately the current market values
  const lastEntry = data[data.length - 1];
  lastEntry.nifty = 22651;
  lastEntry.sensex = 74501;
  lastEntry.niftyBank = 48325;
  
  return data;
};

export function MarketTrendGraph() {
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());
  const [isLoading, setIsLoading] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState({
    nifty: true,
    sensex: true,
    niftyBank: true
  });
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHistoricalData(generateHistoricalData());
      setIsLoading(false);
      toast.success("Market data refreshed");
    }, 1000);
  };
  
  const toggleIndex = (index) => {
    setVisibleIndices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <div>
          <CardTitle>Market Trends</CardTitle>
          <CardDescription>Historical performance of major Indian indices</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          <Button 
            size="sm" 
            variant={visibleIndices.nifty ? "default" : "outline"}
            className={visibleIndices.nifty ? "bg-indigo-600" : ""}
            onClick={() => toggleIndex('nifty')}
          >
            NIFTY 50
          </Button>
          <Button 
            size="sm" 
            variant={visibleIndices.sensex ? "default" : "outline"}
            className={visibleIndices.sensex ? "bg-blue-600" : ""}
            onClick={() => toggleIndex('sensex')}
          >
            SENSEX
          </Button>
          <Button 
            size="sm" 
            variant={visibleIndices.niftyBank ? "default" : "outline"}
            className={visibleIndices.niftyBank ? "bg-green-600" : ""}
            onClick={() => toggleIndex('niftyBank')}
          >
            NIFTY BANK
          </Button>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="niftyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="sensexGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="niftyBankGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
              <Legend />
              
              {visibleIndices.nifty && (
                <Area 
                  type="monotone" 
                  dataKey="nifty" 
                  name="NIFTY 50" 
                  stroke="#4f46e5"
                  fillOpacity={1} 
                  fill="url(#niftyGradient)" 
                />
              )}
              
              {visibleIndices.sensex && (
                <Area 
                  type="monotone" 
                  dataKey="sensex" 
                  name="SENSEX" 
                  stroke="#0891b2"
                  fillOpacity={1} 
                  fill="url(#sensexGradient)" 
                />
              )}
              
              {visibleIndices.niftyBank && (
                <Area 
                  type="monotone" 
                  dataKey="niftyBank" 
                  name="NIFTY BANK" 
                  stroke="#10b981"
                  fillOpacity={1} 
                  fill="url(#niftyBankGradient)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
