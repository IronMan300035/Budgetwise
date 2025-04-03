
import React, { useState, useRef, useEffect } from 'react';
import { CircleDollarSign, Send, Mic, X, Paperclip, Info, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I\'m your BudgetWise assistant. How can I help you manage your finances today?',
    sender: 'bot',
    timestamp: new Date(),
  },
];

const predefinedResponses: Record<string, string> = {
  'hello': 'Hi there! How can I help with your finances today?',
  'hi': 'Hello! What financial questions can I answer for you?',
  'help': 'I can help you with budget planning, investment advice, expense tracking, and financial tips. What do you need?',
  'budget': 'Creating a budget is essential. Try the 50/30/20 rule: 50% on needs, 30% on wants, and 20% on savings.',
  'investment': 'For investments, consider diversifying your portfolio with stocks, bonds, mutual funds, and SIPs based on your risk tolerance.',
  'expenses': 'To track expenses, categorize them and review regularly. Our dashboard can help you visualize your spending patterns.',
  'save money': 'To save money, try automating your savings, cutting unnecessary subscriptions, and using the envelope budgeting method.',
  'stocks': 'When investing in stocks, research companies thoroughly and consider long-term growth potential rather than short-term gains.',
  'mutual funds': 'Mutual funds pool money from multiple investors to invest in diversified securities, managed by professionals.',
  'sip': 'SIPs (Systematic Investment Plans) allow you to invest a fixed amount regularly in mutual funds, benefiting from rupee-cost averaging.',
  'cryptocurrency': 'Cryptocurrencies are highly volatile. Only invest what you can afford to lose and do thorough research before investing.',
  'retirement': 'For retirement planning, consider tax-advantaged accounts and aim to save at least 15% of your income for retirement.',
  'debt': 'To manage debt, prioritize high-interest debt first while making minimum payments on others. Consider the debt avalanche or snowball method.',
  'credit score': 'Improve your credit score by paying bills on time, keeping credit utilization low, and checking your credit report regularly for errors.',
  'emergency fund': 'Aim for 3-6 months of expenses in your emergency fund, kept in a liquid and accessible account.',
  'tax': 'Maximize tax benefits through tax-saving investments like ELSS funds, NPS, PPF, and tax-deductible insurance premiums.',
};

export default function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate thinking
    setTimeout(() => {
      const botResponse = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check for predefined responses
    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        return response;
      }
    }
    
    // Default responses
    const defaultResponses = [
      "I understand your concern about finances. Would you like some personalized advice?",
      "That's an interesting financial question. Let me help you understand the options.",
      "I can help you analyze your financial situation. Could you provide more details?",
      "Based on best financial practices, I'd recommend tracking your expenses regularly and setting specific saving goals.",
      "Financial planning is personal. Let's look at your specific financial goals to provide better guidance."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Check if browser supports SpeechRecognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        setIsRecording(true);
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
          toast.info("Listening...");
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecording(false);
          toast.success("Speech recognized!");
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event);
          setIsRecording(false);
          toast.error("Failed to recognize speech");
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } else {
        toast.error("Speech recognition is not supported in your browser");
      }
    } else {
      setIsRecording(false);
      toast.info("Stopped listening");
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[500px] mb-4 overflow-hidden shadow-xl border-primary/10 animate-slide-up">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-medium">BudgetWise Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-0 flex flex-col h-[calc(100%-64px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t bg-card">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask something about finance..."
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={toggleRecording} 
                  variant={isRecording ? "destructive" : "ghost"}
                  className="h-10 w-10"
                  title="Voice Input"
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim()}
                  className="h-10 w-10"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => setInputValue("How can I save money?")}>
                  Save money
                </Badge>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => setInputValue("Tell me about investments")}>
                  Investments
                </Badge>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => setInputValue("Budget tips")}>
                  Budget tips
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        className="h-14 w-14 rounded-full shadow-xl hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="h-6 w-6" /> : <CircleDollarSign className="h-6 w-6" />}
      </Button>
    </div>
  );
}

// Extending the Window interface to include the SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
