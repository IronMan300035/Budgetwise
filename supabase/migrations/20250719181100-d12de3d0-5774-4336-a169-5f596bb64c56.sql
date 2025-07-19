-- Create news table for storing financial news
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT NOT NULL,
  url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  impact TEXT DEFAULT 'neutral',
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read news
CREATE POLICY "Anyone can view news" 
ON public.news 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample news data
INSERT INTO public.news (title, summary, source, url, category, impact, image_url) VALUES
('Reliance Industries reports 15% increase in quarterly profit', 'The oil-to-telecom conglomerate posted impressive results driven by robust performance in retail and digital services.', 'Economic Times', 'https://economictimes.indiatimes.com/industry/energy/oil-gas/reliance-industries-q2-results-net-profit-jumps-to-rs-16000-crore/articleshow/115471234.cms', 'stocks', 'positive', 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=400&auto=format&fit=crop'),
('HDFC Bank completes merger with parent HDFC Ltd', 'The merger creates a banking behemoth with a combined balance sheet of over ₹18 trillion.', 'Business Standard', 'https://www.business-standard.com/companies/news/hdfc-twins-merger-officially-completed-now-world-s-4th-largest-bank-123070101008_1.html', 'stocks', 'neutral', 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?q=80&w=400&auto=format&fit=crop'),
('Bitcoin surpasses $76,000 as institutional adoption increases', 'The world''s largest cryptocurrency reaches new highs amid growing acceptance by traditional financial institutions.', 'CoinDesk', '#', 'crypto', 'positive', null),
('RBI maintains repo rate, signals continued focus on inflation control', 'The central bank keeps key interest rates unchanged in its latest monetary policy meeting.', 'Hindu Business Line', '#', 'economy', 'neutral', null),
('SEBI introduces new regulations for mutual fund expense ratios', 'The market regulator has implemented new rules that could reduce costs for mutual fund investors.', 'CNBC-TV18', '#', 'mutual_funds', 'positive', null);