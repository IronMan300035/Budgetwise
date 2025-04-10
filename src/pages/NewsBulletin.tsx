
import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  VolumeX,
  Volume2 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { NewsCard } from "@/components/NewsCard";

// Sample news data for different categories with 2025 dates
const generateNewsData = () => {
  const categories = [
    { name: "all", label: "All News" },
    { name: "stocks", label: "Stocks" },
    { name: "mutual_funds", label: "Mutual Funds" },
    { name: "crypto", label: "Cryptocurrency" },
    { name: "economy", label: "Economy" },
    { name: "markets", label: "Markets" }
  ];
  
  const currentDate = new Date();
  // Set to 2025
  currentDate.setFullYear(2025);
  
  const getRandomDate = () => {
    const date = new Date(currentDate);
    // Random number of days before (0-7)
    const daysAgo = Math.floor(Math.random() * 7);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };
  
  const getTimeAgo = (date) => {
    const now = new Date(currentDate);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return minutes <= 0 ? "Just now" : `${minutes} minutes ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };
  
  const stockNews = [
    {
      id: "stock1",
      title: "Reliance Industries reports 15% increase in quarterly profit",
      summary: "The oil-to-telecom conglomerate posted impressive results driven by robust performance in retail and digital services.",
      source: "Economic Times",
      time: getTimeAgo(getRandomDate()),
      url: "https://economictimes.indiatimes.com/markets/stocks/news",
      category: "stocks",
      impact: "positive",
      imageUrl: "https://img.etimg.com/thumb/width-640,height-480,imgsize-76812,resizemode-75,msid-96286741/markets/stocks/news/hot-stocks-buy-or-sell-tata-power-ril-sbi-among-others.jpg"
    },
    {
      id: "stock2",
      title: "HDFC Bank completes merger with parent HDFC Ltd",
      summary: "The merger creates a banking behemoth with a combined balance sheet of over ₹18 trillion.",
      source: "Business Standard",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.business-standard.com/finance/banking",
      category: "stocks",
      impact: "neutral",
      imageUrl: "https://bsmedia.business-standard.com/_media/bs/img/article/2023-03/10/full/1678462292-1708.jpg"
    },
    {
      id: "stock3",
      title: "Tata Motors launches new EV model, stock surges 8%",
      summary: "The company unveiled its latest electric vehicle with advanced features and competitive pricing.",
      source: "Mint",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.livemint.com/market/stock-market-news",
      category: "stocks",
      impact: "positive",
      imageUrl: "https://images.livemint.com/img/2022/08/05/600x338/AFP_1W86SZ_1659710320544_1659710336348_1659710336348.jpg"
    },
    {
      id: "stock4",
      title: "IT stocks under pressure as global tech spending slows",
      summary: "Major IT companies facing headwinds as clients cut back on technology investments amid economic uncertainty.",
      source: "Financial Express",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.financialexpress.com/market/stock-market/",
      category: "stocks",
      impact: "negative",
      imageUrl: "https://www.financialexpress.com/wp-content/uploads/2022/12/IT-SECTOR.jpg"
    }
  ];
  
  const mfNews = [
    {
      id: "mf1",
      title: "SEBI introduces new regulations for mutual fund expense ratios",
      summary: "The market regulator has implemented new rules that could reduce costs for mutual fund investors.",
      source: "CNBC-TV18",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.cnbctv18.com/market/mutual-funds/",
      category: "mutual_funds",
      impact: "positive",
      imageUrl: "https://images.cnbctv18.com/wp-content/uploads/2023/03/SEBI-1-1019x573.jpg"
    },
    {
      id: "mf2",
      title: "Small cap funds deliver over 30% returns in the last year",
      summary: "Small cap mutual funds continue their impressive run despite market volatility.",
      source: "ET Markets",
      time: getTimeAgo(getRandomDate()),
      url: "https://economictimes.indiatimes.com/mutual-funds",
      category: "mutual_funds",
      impact: "positive",
      imageUrl: "https://img.etimg.com/thumb/width-640,height-480,imgsize-56132,resizemode-75,msid-98138170/mf/analysis/three-small-cap-funds-that-topped-the-returns-chart-in-the-last-one-year.jpg"
    },
    {
      id: "mf3",
      title: "New thematic mutual funds focus on AI and automation",
      summary: "Asset management companies launch specialized funds targeting artificial intelligence and automation sectors.",
      source: "Moneycontrol",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.moneycontrol.com/mutualfundindia/",
      category: "mutual_funds",
      impact: "neutral",
      imageUrl: "https://images.moneycontrol.com/static-mcnews/2022/07/markets-sensex-nifty-bull-bear-770x433.jpg"
    }
  ];
  
  const cryptoNews = [
    {
      id: "crypto1",
      title: "Bitcoin surpasses $176,000 as institutional adoption increases",
      summary: "The world's largest cryptocurrency reaches new highs amid growing acceptance by traditional financial institutions.",
      source: "CoinDesk",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.coindesk.com/markets/",
      category: "crypto",
      impact: "positive",
      imageUrl: "https://www.coindesk.com/resizer/EVIgC5UNHyxP-CxQxI5GkUgDmkU=/2048x0/filters:quality(80):format(webp)/cloudfront-us-east-1.images.arcpublishing.com/coindesk/I7KEV5M735ADLJYLPWLTRFYIWQ.jpg"
    },
    {
      id: "crypto2",
      title: "Ethereum completes major network upgrade",
      summary: "The upgrade promises to improve transaction speeds and reduce gas fees on the Ethereum network.",
      source: "Cointelegraph",
      time: getTimeAgo(getRandomDate()),
      url: "https://cointelegraph.com/tags/ethereum",
      category: "crypto",
      impact: "positive",
      imageUrl: "https://images.cointelegraph.com/images/1200_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS91cGxvYWRzLzIwMjItMDkvMThkOTk3NjQtZjEwYy00NmY1LTg4NzgtYzEyMDM3NWRkY2VjLmpwZw==.jpg"
    },
    {
      id: "crypto3",
      title: "Indian government considering new cryptocurrency regulations",
      summary: "The finance ministry is reportedly working on a framework for cryptocurrency taxation and regulation.",
      source: "Bloomberg Quint",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.bloombergquint.com/crypto",
      category: "crypto",
      impact: "neutral",
      imageUrl: "https://gumlet.assettype.com/bloombergquint/2022-12/eb42d750-e062-4c3c-9d70-e31adbd0da1e/cryptocurrency_Bitcoin_bloomberg.jpg"
    }
  ];
  
  const economyNews = [
    {
      id: "econ1",
      title: "RBI maintains repo rate, signals continued focus on inflation control",
      summary: "The central bank keeps key interest rates unchanged in its latest monetary policy meeting.",
      source: "Hindu Business Line",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.thehindubusinessline.com/money-and-banking/",
      category: "economy",
      impact: "neutral",
      imageUrl: "https://bl-i.thgim.com/public/incoming/r2heao/article66449395.ece/alternates/FREE_1200/IMG_TH09_RBI_2_1_D49P7NV9.jpg"
    },
    {
      id: "econ2",
      title: "India's GDP growth projected at 7.2% for current fiscal year",
      summary: "Economic survey highlights resilient growth despite global challenges.",
      source: "Financial Times",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.ft.com/world/asia-pacific/india",
      category: "economy",
      impact: "positive",
      imageUrl: "https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2Fb8671f4a-67fd-47ed-a55a-a74886da70ed.jpg"
    },
    {
      id: "econ3",
      title: "Inflation eases to 4.8% in March, lowest in 18 months",
      summary: "Consumer price inflation shows signs of moderation, raising hopes for potential rate cuts.",
      source: "Reuters",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.reuters.com/world/india/",
      category: "economy",
      impact: "positive",
      imageUrl: "https://www.reuters.com/resizer/FBdInRpGsOeKXdYv_P9YvFy9Nag=/1200x0/filters:quality(80)/cloudfront-us-east-2.images.arcpublishing.com/reuters/JIWXQXWSTZITXNRWZV3WAXNWLE.jpg"
    }
  ];
  
  const marketNews = [
    {
      id: "market1",
      title: "Global Markets: Asian shares rise on tech rally, US inflation data awaited",
      summary: "Asian shares rallied on Wednesday as tech stocks extended their recent run of gains, while investors awaited key U.S. inflation data.",
      source: "Reuters",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.reuters.com/markets/global-markets-wrapup-1-2023-07-12/",
      category: "markets",
      impact: "positive",
      imageUrl: "https://www.reuters.com/resizer/MFH2RhGY0CjuXcD4z7L97TF-AAY=/1200x0/filters:quality(80)/cloudfront-us-east-2.images.arcpublishing.com/reuters/WKNVLFSDSRJTPLJQZCB3KGMTMU.jpg"
    },
    {
      id: "market2",
      title: "Dollar weakens as traders bet on early Fed rate cuts",
      summary: "The dollar fell to a 16-month low against a basket of currencies on Wednesday as traders increased bets that the Federal Reserve will start cutting interest rates.",
      source: "Financial Times",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.ft.com/content/markets",
      category: "markets",
      impact: "neutral",
      imageUrl: "https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2Ff5b54e2d-4c30-4989-a85a-10ab5bc90843.jpg"
    },
    {
      id: "market3",
      title: "Gold prices hit new record high on geopolitical tensions",
      summary: "Gold prices surged to a new all-time high on Tuesday as investors sought safe-haven assets amid escalating geopolitical tensions.",
      source: "Bloomberg",
      time: getTimeAgo(getRandomDate()),
      url: "https://www.bloomberg.com/markets",
      category: "markets",
      impact: "positive",
      imageUrl: "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iyvfFY.wVgvs/v0/1200x800.jpg"
    }
  ];
  
  const allNews = [...stockNews, ...mfNews, ...cryptoNews, ...economyNews, ...marketNews];
  
  // Randomly change one news item each time to simulate updates
  const randomIndex = Math.floor(Math.random() * allNews.length);
  const headlines = [
    "Sensex hits all-time high, crosses 95,000 mark",
    "US Fed signals potential rate cuts later this year",
    "Oil prices surge amid Middle East tensions",
    "Gold reaches record high as investors seek safe haven",
    "Major merger announced between tech giants",
    "New government policies impact market sentiment",
    "Foreign investors increase holdings in Indian equities",
    "Banking sector shows strong recovery post-pandemic",
    "Global supply chain issues continue to affect markets",
    "New IPO oversubscribed 165 times on first day"
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
  const [isReading, setIsReading] = useState(false);
  const [currentlyReading, setCurrentlyReading] = useState<string | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    return () => {
      // Cancel any ongoing speech when component unmounts
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Update news every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsData(generateNewsData());
      setLastUpdated(new Date());
      toast.info("News updated", { duration: 2000 });
    }, 60000);
    
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
  
  const readArticle = (newsItem) => {
    if (!speechSynthesisRef.current) return;
    
    // If already reading something, stop it
    speechSynthesisRef.current.cancel();
    
    if (currentlyReading === newsItem.id) {
      // If clicking the same article, just stop
      setIsReading(false);
      setCurrentlyReading(null);
      return;
    }
    
    // Create new speech synthesis
    const text = `${newsItem.title}. ${newsItem.summary}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsReading(false);
      setCurrentlyReading(null);
    };
    
    speechSynthesisRef.current.speak(utterance);
    setIsReading(true);
    setCurrentlyReading(newsItem.id);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNews.map(newsItem => (
                  <Card key={newsItem.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={newsItem.imageUrl || "https://img.etimg.com/thumb/width-640,height-480,imgsize-76812,resizemode-75,msid-96286741/markets/stocks/news/hot-stocks-buy-or-sell-tata-power-ril-sbi-among-others.jpg"} 
                          alt={newsItem.title} 
                          className="w-full h-full object-cover"
                        />
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
                        <div className="flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => readArticle(newsItem)}
                            className={currentlyReading === newsItem.id ? "text-primary" : ""}
                          >
                            {currentlyReading === newsItem.id ? (
                              <>
                                <VolumeX className="h-3.5 w-3.5 mr-1" />
                                Stop Reading
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3.5 w-3.5 mr-1" />
                                Read Aloud
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => window.open(newsItem.url, '_blank', 'noopener,noreferrer')}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Read More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
