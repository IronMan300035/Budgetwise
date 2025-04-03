
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function AIChatbot() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      content: "Hi! I'm your AI financial assistant. How can I help you today? You can ask me about budgeting, investments, financial planning, or anything related to your finances.",
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        
        setInput(transcript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        setInput("");
        recognition.start();
      }
      setIsListening(!isListening);
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI response
    // In a real app, this would be a call to your AI backend or API
    setTimeout(() => {
      const generateAIResponse = (message: string) => {
        // Very basic mock responses - in a real app this would be an actual AI model
        const budgetKeywords = ["budget", "spending", "save", "saving", "expense"];
        const investKeywords = ["invest", "stock", "bond", "fund", "portfolio"];
        
        if (budgetKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
          return "Based on your spending patterns, I recommend allocating 50% of your income to necessities, 30% to wants, and 20% to savings and investments. This can help you build a sustainable budget.";
        } else if (investKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
          return "For beginners, I recommend starting with a diversified portfolio of ETFs. Consider a mix of stocks and bonds appropriate for your age and risk tolerance. Remember, the key to successful investing is consistency and time in the market.";
        } else {
          return "Thanks for your message. To give you the best financial advice, could you provide more details about your specific financial goals or concerns?";
        }
      };
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        content: generateAIResponse(userMessage.content),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full h-full max-h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Financial AI Assistant</CardTitle>
        <CardDescription>Get personalized financial advice and answers to your questions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 min-h-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === "ai" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {message.sender === "ai" ? "AI Assistant" : "You"}
                    </span>
                  </div>
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 text-right mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={isListening ? "bg-red-100 text-red-500" : ""}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isListening}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
