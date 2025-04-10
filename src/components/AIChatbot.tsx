
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, Mic, MicOff, User, Loader2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hello! I\'m your BudgetWise AI assistant. How can I help you with your finances today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("");
          
          setInput(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          toast.error("Speech recognition error. Please try again.");
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (isReadingAloud && currentSpeech) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Sample financial Q&A data
  const financialQA = {
    'budget': 'Budgeting is allocating money for expenses. The 50/30/20 rule suggests using 50% of income for needs, 30% for wants, and 20% for savings.',
    'investment': 'Investment options include stocks, bonds, mutual funds, ETFs, and real estate. For beginners, I recommend starting with index funds.',
    'save': 'To save money, try the 24-hour rule before purchases, automate savings, use cashback apps, and track your expenses regularly.',
    'debt': 'To pay off debt, use either the avalanche method (highest interest first) or the snowball method (smallest balance first).',
    'retirement': 'For retirement planning, contribute to employer-matched accounts first, then consider tax-advantaged accounts like IRAs.',
    'credit score': 'Improve your credit score by paying bills on time, keeping credit utilization below 30%, and not closing old accounts.',
    'emergency fund': 'An emergency fund should cover 3-6 months of expenses and be kept in a high-yield savings account for easy access.',
    'tax': 'Tax-saving strategies include maximizing retirement contributions, using HSAs, claiming all eligible deductions, and tax-loss harvesting.',
    'loan': 'When comparing loans, look at the APR, not just the interest rate. Also consider terms, fees, and prepayment penalties.',
    'stocks': 'Stock investing basics: diversify your portfolio, invest for the long term, and consider your risk tolerance before investing.',
    'house': 'Before buying a house, save for a 20% down payment to avoid PMI, check your credit score, and get pre-approved for a mortgage.',
    'insurance': 'Essential insurance types include health, auto, home/renters, life, and disability insurance to protect against financial disasters.',
    'expenses': 'To cut expenses, review subscriptions, negotiate bills, meal plan to reduce food costs, and use public transportation when possible.',
    'income': 'To increase income, consider asking for a raise, starting a side hustle, freelancing, selling unused items, or enhancing your skills for better job opportunities.',
    'sip': 'SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds, benefiting from rupee-cost averaging and compounding.',
    'mutual fund': 'Mutual funds pool money from many investors to buy diversified securities, managed by professionals. They come in various types like equity, debt, or hybrid funds.',
    'cryptocurrency': 'Cryptocurrency is a volatile investment. Only invest what you can afford to lose, do thorough research, and consider it as a small portion of your portfolio.',
    'gold': 'Gold can be a hedge against inflation and economic uncertainty. Consider investing in gold ETFs, sovereign gold bonds, or digital gold for better liquidity and lower costs.',
    'fixed deposit': 'Fixed deposits offer guaranteed returns but may not beat inflation. They are good for conservative investors prioritizing capital preservation over growth.',
    'ppf': 'Public Provident Fund (PPF) offers tax-free returns with a 15-year lock-in period. It is a government-backed scheme ideal for long-term wealth creation and tax savings.'
  };
  
  const generateBotResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Check if the message contains any of our keywords
    const matchedKey = Object.keys(financialQA).find(key => 
      lowerCaseMessage.includes(key)
    );
    
    if (matchedKey) {
      return financialQA[matchedKey as keyof typeof financialQA];
    }
    
    // Default responses if no keyword match
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! How can I help with your financial questions today?";
    }
    
    if (lowerCaseMessage.includes('thank')) {
      return "You're welcome! Feel free to ask if you have any other financial questions.";
    }
    
    if (lowerCaseMessage.includes('help')) {
      return "I can help with questions about budgeting, investing, saving money, debt management, retirement planning, and other financial topics. What would you like to know?";
    }
    
    if (lowerCaseMessage.includes('bye')) {
      return "Goodbye! Remember to check your budget regularly and save for your future goals. Come back if you have more questions!";
    }
    
    // Generic fallback response
    return "I'm not sure I understand that financial question. Try asking about budgeting, investing, saving, debt, retirement, credit scores, or emergency funds.";
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: generateBotResponse(userMessage.text),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };
  
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported by your browser");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setInput('');
      toast.success("Listening... Speak now");
    }
  };
  
  const readAloud = (text: string) => {
    if (isReadingAloud && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      setCurrentSpeech(null);
      return;
    }
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
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
  
  return (
    <>
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          className={`h-12 w-12 rounded-full shadow-lg ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
      </div>
      
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-30 w-80 sm:w-96 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-5 w-5" /> BudgetWise AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] px-4 py-2">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-5' 
                      : 'bg-muted ml-0 mr-5'
                  }`}>
                    {message.type === 'bot' && (
                      <div className="absolute -left-5 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-background">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    {message.type === 'user' && (
                      <div className="absolute -right-5 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {message.type === 'bot' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background opacity-70 hover:opacity-100"
                        onClick={() => readAloud(message.text)}
                      >
                        {isReadingAloud && currentSpeech?.text === message.text ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="relative max-w-[80%] rounded-lg p-3 bg-muted ml-0 mr-5">
                    <div className="absolute -left-5 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-background">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t p-3">
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your financial question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={toggleListening}
                className={isListening ? "text-red-500 border-red-500" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
