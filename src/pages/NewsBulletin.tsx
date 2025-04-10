
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NewsCard } from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, Volume2, VolumeX } from 'lucide-react';
import { format } from 'date-fns';

// Financial news mock data with 2025 dates
const FINANCIAL_NEWS = [
  {
    id: 1,
    title: 'Reserve Bank of India Announces New Digital Currency Regulations',
    summary: 'The RBI introduces comprehensive guidelines for cryptocurrency exchanges, focusing on consumer protection and anti-money laundering measures.',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80',
    source: 'Economic Times',
    date: '2025-04-10',
    category: 'Regulation',
    url: 'https://economictimes.indiatimes.com/markets/cryptocurrency/rbi-announces-new-digital-currency-regulations/articleshow/95642187.cms'
  },
  {
    id: 2,
    title: 'Tata Group Announces Major Investment in Renewable Energy',
    summary: 'Tata Power commits ₹75,000 crore to solar and wind projects across India, aiming to triple clean energy capacity by 2028.',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    source: 'LiveMint',
    date: '2025-04-09',
    category: 'Corporates',
    url: 'https://www.livemint.com/companies/news/tata-power-to-invest-rs-75-000-crore-in-renewable-energy-11649062400040.html'
  },
  {
    id: 3,
    title: 'Sensex Crosses 110,000 for First Time on Strong Economic Data',
    summary: 'Indian stock markets reach new milestone as Q1 GDP growth exceeds expectations at 7.9%, boosted by manufacturing and services sectors.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    source: 'MoneyControl',
    date: '2025-04-08',
    category: 'Markets',
    url: 'https://www.moneycontrol.com/news/business/markets/sensex-crosses-110000-mark-for-first-time-on-strong-gdp-data-2068335.html'
  },
  {
    id: 4,
    title: 'Government Announces New Tax Breaks for Startups in Budget 2025',
    summary: 'Finance Minister unveils comprehensive tax incentives for tech startups, aiming to boost innovation and attract foreign investment.',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    source: 'Financial Express',
    date: '2025-04-07',
    category: 'Policy',
    url: 'https://www.financialexpress.com/budget/budget-2025-govt-announces-tax-breaks-for-startups-11649062400040.html'
  },
  {
    id: 5,
    title: 'Inflation Drops to 3.5% in March, Lowest in 5 Years',
    summary: 'Consumer Price Index shows significant decline in inflation, raising expectations for RBI rate cuts in upcoming monetary policy meeting.',
    imageUrl: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    source: 'Business Standard',
    date: '2025-04-06',
    category: 'Economy',
    url: 'https://www.business-standard.com/economy-policy/news/inflation-drops-to-3-5-in-march-lowest-in-5-years-123041200067_1.html'
  },
  {
    id: 6,
    title: 'Reliance Industries Expands into AI with ₹15,000 Crore Investment',
    summary: 'Mukesh Ambani\'s Reliance Industries announces major AI research center in Bangalore, partnering with leading global tech companies.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    source: 'Economic Times',
    date: '2025-04-05',
    category: 'Technology',
    url: 'https://economictimes.indiatimes.com/tech/technology/reliance-industries-to-invest-rs-15000-crore-in-ai-research/articleshow/98765432.cms'
  },
  {
    id: 7,
    title: 'Rupee Strengthens to 72 Against Dollar on Strong FII Inflows',
    summary: 'Indian currency reaches 3-year high as foreign institutional investors pour in $5.2 billion in first week of April.',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    source: 'LiveMint',
    date: '2025-04-04',
    category: 'Forex',
    url: 'https://www.livemint.com/market/forex/rupee-strengthens-to-72-against-dollar-on-strong-fii-inflows-11617642335692.html'
  },
  {
    id: 8,
    title: 'SEBI Introduces New Regulations for Algorithmic Trading',
    summary: 'Market regulator implements stricter compliance requirements for algo trading to enhance market stability and investor protection.',
    imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
    source: 'MoneyControl',
    date: '2025-04-03',
    category: 'Regulation',
    url: 'https://www.moneycontrol.com/news/business/markets/sebi-introduces-new-regulations-for-algorithmic-trading-2076598.html'
  }
];

export default function NewsBulletin() {
  const [news, setNews] = useState(FINANCIAL_NEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Filter news based on search and category
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || item.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });
  
  // Simulate refreshing news
  const refreshNews = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Shuffle the news array to simulate new content
      const shuffled = [...FINANCIAL_NEWS].sort(() => 0.5 - Math.random());
      // Update dates to be more recent
      const updatedNews = shuffled.map((item, index) => {
        const today = new Date();
        const newsDate = new Date();
        newsDate.setDate(today.getDate() - index);
        return {
          ...item,
          date: format(newsDate, 'yyyy-MM-dd')
        };
      });
      setNews(updatedNews);
      setIsLoading(false);
    }, 1000);
  };
  
  // Read aloud functionality
  const readAloud = (title: string, summary: string) => {
    if (isReadingAloud && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      setCurrentSpeech(null);
      return;
    }
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = `${title}. ${summary}`;
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    
    // Try to use an Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(voice => 
      voice.lang.includes('en-IN') || voice.name.includes('Indian')
    );
    
    if (indianVoice) {
      speech.voice = indianVoice;
    }
    
    speech.onend = () => {
      setIsReadingAloud(false);
      setCurrentSpeech(null);
    };
    
    setCurrentSpeech(speech);
    setIsReadingAloud(true);
    window.speechSynthesis.speak(speech);
  };
  
  // Stop reading when component unmounts
  useEffect(() => {
    return () => {
      if (isReadingAloud) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isReadingAloud]);
  
  // Load available voices when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Financial News Bulletin</h1>
            <p className="text-muted-foreground">Stay updated with the latest financial market news</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={refreshNews} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search financial news..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setCategory}>
            <TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Markets">Markets</TabsTrigger>
              <TabsTrigger value="Economy">Economy</TabsTrigger>
              <TabsTrigger value="Corporates">Corporates</TabsTrigger>
              <TabsTrigger value="Policy">Policy</TabsTrigger>
              <TabsTrigger value="Technology">Tech</TabsTrigger>
              <TabsTrigger value="Regulation">Regulation</TabsTrigger>
              <TabsTrigger value="Forex">Forex</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNews.length > 0 ? (
            filteredNews.map(item => (
              <div key={item.id} className="relative group">
                <NewsCard
                  title={item.title}
                  summary={item.summary}
                  imageUrl={item.imageUrl}
                  source={item.source}
                  date={item.date}
                  category={item.category}
                  url={item.url}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                  onClick={() => readAloud(item.title, item.summary)}
                >
                  {isReadingAloud && currentSpeech?.text.includes(item.title) ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center py-16">
              <p className="text-muted-foreground">No news found matching your criteria</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
