
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  date: string;
  category: string;
  url: string;
}

export function NewsCard({ title, summary, imageUrl, source, date, category, url }: NewsCardProps) {
  const handleReadMore = () => {
    // Open the news article in a new tab
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className="font-normal">
            {category}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {date} • {source}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{summary}</p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center"
          onClick={handleReadMore}
        >
          Read More <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
