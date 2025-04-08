
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ChevronDown, X } from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { cn } from "@/lib/utils";

interface MarketData {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  percentChange: number;
  history: { time: string; value: number }[];
}

interface MarketTrendsAnalyticsProps {
  title: string;
  subtitle: string;
  type: "stock" | "sip" | "mutual_fund";
}

export function MarketTrendsAnalytics({ title, subtitle, type }: MarketTrendsAnalyticsProps) {
  const [open, setOpen] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1d");
  const [chartType, setChartType] = useState("line");
  
  // Generate realistic mock data based on type
  useEffect(() => {
    const generateMockData = () => {
      let mockData: MarketData[] = [];
      
      if (type === "stock") {
        mockData = [
          {
            name: "Reliance Industries",
            value: 2456.75,
            previousValue: 2420.30,
            change: 36.45,
            percentChange: 1.51,
            history: generateRandomHistory(2400, 2500)
          },
          {
            name: "HDFC Bank",
            value: 1678.20,
            previousValue: 1695.60,
            change: -17.40,
            percentChange: -1.03,
            history: generateRandomHistory(1650, 1700)
          },
          {
            name: "Infosys",
            value: 1567.85,
            previousValue: 1545.30,
            change: 22.55,
            percentChange: 1.46,
            history: generateRandomHistory(1530, 1580)
          },
          {
            name: "TCS",
            value: 3421.60,
            previousValue: 3390.75,
            change: 30.85,
            percentChange: 0.91,
            history: generateRandomHistory(3380, 3430)
          },
          {
            name: "ICICI Bank",
            value: 956.40,
            previousValue: 962.80,
            change: -6.40,
            percentChange: -0.67,
            history: generateRandomHistory(950, 970)
          }
        ];
      } else if (type === "sip") {
        mockData = [
          {
            name: "SBI Blue Chip Fund",
            value: 52.75,
            previousValue: 52.30,
            change: 0.45,
            percentChange: 0.86,
            history: generateRandomHistory(51, 53)
          },
          {
            name: "Axis Long Term Equity Fund",
            value: 69.20,
            previousValue: 68.60,
            change: 0.60,
            percentChange: 0.87,
            history: generateRandomHistory(68, 70)
          },
          {
            name: "HDFC Mid-Cap Opportunities",
            value: 84.85,
            previousValue: 83.30,
            change: 1.55,
            percentChange: 1.86,
            history: generateRandomHistory(83, 85)
          },
          {
            name: "Mirae Asset Emerging Bluechip",
            value: 90.60,
            previousValue: 89.75,
            change: 0.85,
            percentChange: 0.95,
            history: generateRandomHistory(89, 91)
          },
          {
            name: "Kotak Standard Multicap Fund",
            value: 44.40,
            previousValue: 44.80,
            change: -0.40,
            percentChange: -0.89,
            history: generateRandomHistory(44, 45)
          }
        ];
      } else if (type === "mutual_fund") {
        mockData = [
          {
            name: "Axis Midcap Fund",
            value: 76.85,
            previousValue: 76.30,
            change: 0.55,
            percentChange: 0.72,
            history: generateRandomHistory(76, 77)
          },
          {
            name: "ICICI Pru Bluechip Fund",
            value: 68.20,
            previousValue: 67.90,
            change: 0.30,
            percentChange: 0.44,
            history: generateRandomHistory(67, 69)
          },
          {
            name: "Parag Parikh Flexi Cap Fund",
            value: 55.85,
            previousValue: 54.75,
            change: 1.10,
            percentChange: 2.01,
            history: generateRandomHistory(54, 56)
          },
          {
            name: "Canara Robeco Bluechip",
            value: 42.60,
            previousValue: 41.95,
            change: 0.65,
            percentChange: 1.55,
            history: generateRandomHistory(41, 43)
          },
          {
            name: "SBI Small Cap Fund",
            value: 88.40,
            previousValue: 89.60,
            change: -1.20,
            percentChange: -1.34,
            history: generateRandomHistory(88, 90)
          }
        ];
      }
      
      return mockData;
    };
    
    setMarketData(generateMockData());
    
    // Set up interval to update data every 5 seconds
    const interval = setInterval(() => {
      const updatedData = marketData.map(item => {
        // Generate small random change
        const randomChange = (Math.random() * 2 - 1) * (item.value * 0.005);
        const newValue = item.value + randomChange;
        const newPercentChange = ((newValue - item.previousValue) / item.previousValue) * 100;
        
        return {
          ...item,
          value: parseFloat(newValue.toFixed(2)),
          change: parseFloat((newValue - item.previousValue).toFixed(2)),
          percentChange: parseFloat(newPercentChange.toFixed(2)),
          history: [...item.history.slice(1), { time: getCurrentTime(), value: newValue }]
        };
      });
      
      setMarketData(updatedData);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [type]);
  
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const generateRandomHistory = (min: number, max: number) => {
    const history = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 15 * 60000);
      const timeString = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
      const randomValue = min + Math.random() * (max - min);
      
      history.push({
        time: timeString,
        value: parseFloat(randomValue.toFixed(2))
      });
    }
    
    return history;
  };
  
  const getChartData = (item: MarketData) => {
    return item.history.map((h, index) => ({
      name: h.time,
      value: h.value,
      index
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Analytics</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{title} Analytics</DialogTitle>
              <DialogDescription>{subtitle}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-2">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <Tabs defaultValue="1d" value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList>
                <TabsTrigger value="1d">1D</TabsTrigger>
                <TabsTrigger value="1w">1W</TabsTrigger>
                <TabsTrigger value="1m">1M</TabsTrigger>
                <TabsTrigger value="3m">3M</TabsTrigger>
                <TabsTrigger value="1y">1Y</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="line" value={chartType} onValueChange={setChartType}>
              <TabsList>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {marketData.map((item, index) => (
              <Card key={index} className="overflow-hidden shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        <span className="text-2xl font-bold mr-2">
                          ₹{item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <div 
                          className={cn(
                            "flex items-center text-sm font-medium",
                            item.percentChange >= 0 ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {item.percentChange >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                          )}
                          <span>
                            {item.change >= 0 ? "+" : ""}{item.change.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                            ({item.percentChange >= 0 ? "+" : ""}{item.percentChange.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart data={getChartData(item)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10 }} 
                          interval={3}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `₹${value}`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Value']}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={item.percentChange >= 0 ? "#10b981" : "#ef4444"} 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    ) : chartType === "area" ? (
                      <AreaChart data={getChartData(item)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10 }} 
                          interval={3}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `₹${value}`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Value']}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={item.percentChange >= 0 ? "#10b981" : "#ef4444"} 
                          fill={item.percentChange >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={getChartData(item)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10 }} 
                          interval={3}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `₹${value}`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Value']}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Bar 
                          dataKey="value" 
                          fill={item.percentChange >= 0 ? "#10b981" : "#ef4444"} 
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Market Insights</h3>
            <p className="text-sm text-muted-foreground">
              {type === "stock" 
                ? "Stock prices are based on real-time market conditions and may fluctuate rapidly. Past performance is not indicative of future results."
                : type === "sip" 
                ? "SIP investments are subject to market risks. Systematic investments over time can help average out market volatility."
                : "Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
