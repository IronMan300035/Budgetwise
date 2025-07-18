
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Newspaper, 
  Search, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock,
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Sample news data for different categories
const generateNewsData = () => {
  const categories = [
    { name: "all", label: "All News" },
    { name: "stocks", label: "Stocks" },
    { name: "mutual_funds", label: "Mutual Funds" },
    { name: "crypto", label: "Cryptocurrency" },
    { name: "economy", label: "Economy" }
  ];
  
  const stockNews = [
    {
      id: "stock1",
      title: "Reliance Industries reports 15% increase in quarterly profit",
      summary: "The oil-to-telecom conglomerate posted impressive results driven by robust performance in retail and digital services.",
      source: "Economic Times",
      time: "10 minutes ago",
      url: "https://economictimes.indiatimes.com/industry/energy/oil-gas/reliance-industries-q2-results-net-profit-jumps-to-rs-16000-crore/articleshow/115471234.cms",
      imageUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=400&auto=format&fit=crop",
      category: "stocks",
      impact: "positive"
    },
    {
      id: "stock2",
      title: "HDFC Bank completes merger with parent HDFC Ltd",
      summary: "The merger creates a banking behemoth with a combined balance sheet of over ₹18 trillion.",
      source: "Business Standard",
      time: "35 minutes ago",
      url: "https://www.business-standard.com/companies/news/hdfc-twins-merger-officially-completed-now-world-s-4th-largest-bank-123070101008_1.html",
      imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?q=80&w=400&auto=format&fit=crop",
      category: "stocks",
      impact: "neutral"
    },
    {
      id: "stock3",
      title: "Tata Motors launches new EV model, stock surges 8%",
      summary: "The company unveiled its latest electric vehicle with advanced features and competitive pricing.",
      source: "Mint",
      time: "1 hour ago",
      url: "https://www.livemint.com/companies/news/tata-motors-stock-rally-continues-shares-hit-fresh-52-week-high-11693292764634.html",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400&auto=format&fit=crop",
      category: "stocks",
      impact: "positive"
    },
    {
      id: "stock4",
      title: "IT stocks under pressure as global tech spending slows",
      summary: "Major IT companies facing headwinds as clients cut back on technology investments amid economic uncertainty.",
      source: "Financial Express",
      time: "2 hours ago",
      url: "#",
      category: "stocks",
      impact: "negative"
    }
  ];
  
  const mfNews = [
    {
      id: "mf1",
      title: "SEBI introduces new regulations for mutual fund expense ratios",
      summary: "The market regulator has implemented new rules that could reduce costs for mutual fund investors.",
      source: "CNBC-TV18",
      time: "45 minutes ago",
      url: "#",
      category: "mutual_funds",
      impact: "positive"
    },
    {
      id: "mf2",
      title: "Small cap funds deliver over 30% returns in the last year",
      summary: "Small cap mutual funds continue their impressive run despite market volatility.",
      source: "ET Markets",
      time: "1.5 hours ago",
      url: "#",
      category: "mutual_funds",
      impact: "positive"
    },
    {
      id: "mf3",
      title: "New thematic mutual funds focus on AI and automation",
      summary: "Asset management companies launch specialized funds targeting artificial intelligence and automation sectors.",
      source: "Moneycontrol",
      time: "3 hours ago",
      url: "#",
      category: "mutual_funds",
      impact: "neutral"
    }
  ];
  
  const cryptoNews = [
    {
      id: "crypto1",
      title: "Bitcoin surpasses $76,000 as institutional adoption increases",
      summary: "The world's largest cryptocurrency reaches new highs amid growing acceptance by traditional financial institutions.",
      source: "CoinDesk",
      time: "15 minutes ago",
      url: "#",
      category: "crypto",
      impact: "positive"
    },
    {
      id: "crypto2",
      title: "Ethereum completes major network upgrade",
      summary: "The upgrade promises to improve transaction speeds and reduce gas fees on the Ethereum network.",
      source: "Cointelegraph",
      time: "50 minutes ago",
      url: "#",
      category: "crypto",
      impact: "positive"
    },
    {
      id: "crypto3",
      title: "Indian government considering new cryptocurrency regulations",
      summary: "The finance ministry is reportedly working on a framework for cryptocurrency taxation and regulation.",
      source: "Bloomberg Quint",
      time: "2 hours ago",
      url: "#",
      category: "crypto",
      impact: "neutral"
    }
  ];
  
  const economyNews = [
    {
      id: "econ1",
      title: "RBI maintains repo rate, signals continued focus on inflation control",
      summary: "The central bank keeps key interest rates unchanged in its latest monetary policy meeting.",
      source: "Hindu Business Line",
      time: "1 hour ago",
      url: "#",
      category: "economy",
      impact: "neutral"
    },
    {
      id: "econ2",
      title: "India's GDP growth projected at 7.2% for current fiscal year",
      summary: "Economic survey highlights resilient growth despite global challenges.",
      source: "Financial Times",
      time: "3 hours ago",
      url: "#",
      category: "economy",
      impact: "positive"
    },
    {
      id: "econ3",
      title: "Inflation eases to 4.8% in March, lowest in 18 months",
      summary: "Consumer price inflation shows signs of moderation, raising hopes for potential rate cuts.",
      source: "Reuters",
      time: "4 hours ago",
      url: "#",
      category: "economy",
      impact: "positive"
    }
  ];
  
  const allNews = [...stockNews, ...mfNews, ...cryptoNews, ...economyNews];
  
  // Randomly change one news item each time to simulate updates
  const randomIndex = Math.floor(Math.random() * allNews.length);
  const headlines = [
    "Sensex hits all-time high, crosses 75,000 mark",
    "US Fed signals potential rate cuts later this year",
    "Oil prices surge amid Middle East tensions",
    "Gold reaches record high as investors seek safe haven",
    "Major merger announced between tech giants",
    "New government policies impact market sentiment",
    "Foreign investors increase holdings in Indian equities",
    "Banking sector shows strong recovery post-pandemic",
    "Global supply chain issues continue to affect markets",
    "New IPO oversubscribed 65 times on first day"
  ];
  
  const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
  allNews[randomIndex].title = randomHeadline;
  allNews[randomIndex].time = "Just now";
  
  return { categories, news: allNews };
};

export default function NewsBulletin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsData, setNewsData] = useState(generateNewsData());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const handleReadMore = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Update news every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsData(generateNewsData());
      setLastUpdated(new Date());
      toast.info("News updated", { duration: 2000 });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const filteredNews = newsData.news.filter(item => 
    (activeTab === "all" || item.category === activeTab) &&
    (searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getImpactBadge = (impact) => {
    switch(impact) {
      case "positive":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <TrendingUp className="h-3 w-3 mr-1" /> Bullish
        </Badge>;
      case "negative":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <TrendingDown className="h-3 w-3 mr-1" /> Bearish
        </Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Neutral
        </Badge>;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Newspaper className="mr-2 h-6 w-6" />
              Financial News Bulletin
            </h1>
            <p className="text-muted-foreground">
              Stay updated with the latest financial news and market trends
            </p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0 gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setNewsData(generateNewsData());
              setLastUpdated(new Date());
              toast.success("News refreshed");
            }}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            {newsData.categories.map(category => (
              <TabsTrigger key={category.name} value={category.name}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredNews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No news found</p>
                  <p className="text-muted-foreground">Try changing your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredNews.map(newsItem => (
                <Card key={newsItem.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleReadMore(newsItem.url)}>
                  <CardContent className="p-0">
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">News Image</span>
                      </div>
                    </div>
                    <div className="p-4 border-b bg-accent/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{newsItem.title}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="font-medium">{newsItem.source}</span>
                            <span className="mx-2">•</span>
                            <span>{newsItem.time}</span>
                            {newsItem.time === "Just now" && (
                              <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-1.5 text-[10px]">
                                <Sparkles className="h-2.5 w-2.5 mr-0.5" /> NEW
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          {getImpactBadge(newsItem.impact)}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm mb-4">{newsItem.summary}</p>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600"
                          onClick={() => handleReadMore(newsItem.url)}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Read More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
