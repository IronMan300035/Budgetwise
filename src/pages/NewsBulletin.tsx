
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
  Sparkles,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNews } from "@/hooks/useNews";

const categories = [
  { name: "all", label: "All News" },
  { name: "stocks", label: "Stocks" },
  { name: "mutual_funds", label: "Mutual Funds" },
  { name: "crypto", label: "Cryptocurrency" },
  { name: "economy", label: "Economy" }
];

export default function NewsBulletin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { news, loading, refetch } = useNews();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const handleReadMore = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleRefresh = async () => {
    setLastUpdated(new Date());
    await refetch();
    toast.success("News refreshed");
  };
  
  const filteredNews = news.filter(item => 
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
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
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
            {categories.map(category => (
              <TabsTrigger key={category.name} value={category.name}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No news found</p>
                  <p className="text-muted-foreground">Try changing your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredNews.map(newsItem => (
                <Card key={newsItem.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-background via-background to-accent/5" onClick={() => handleReadMore(newsItem.url)}>
                  <CardContent className="p-0">
                    <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10 relative">
                      {newsItem.image_url ? (
                        <img 
                          src={newsItem.image_url} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const fallback = target.nextElementSibling as HTMLDivElement;
                            target.style.display = 'none';
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: newsItem.image_url ? 'none' : 'flex' }}>
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                          <span className="text-muted-foreground text-sm font-medium">{newsItem.category.charAt(0).toUpperCase() + newsItem.category.slice(1)}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        {getImpactBadge(newsItem.impact)}
                      </div>
                    </div>
                    <div className="p-6 border-b bg-gradient-to-r from-accent/10 to-transparent">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{newsItem.title}</h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">{newsItem.source}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(newsItem.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{newsItem.summary}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {newsItem.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadMore(newsItem.url);
                          }}
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
