
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceCommandSystemProps {
  isOpen?: boolean;
}

export function VoiceCommandSystem({ isOpen = false }: VoiceCommandSystemProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("");
          
          setTranscript(transcript);
          processCommand(transcript.toLowerCase());
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          toast.error("Speech recognition error. Please try again.");
        };
        
        recognitionInstance.onend = () => {
          if (isListening) {
            recognitionInstance.start();
          }
        };
        
        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;
      } else {
        toast.error("Speech recognition is not supported by your browser");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setShowHint(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
      setShowHint(true);
      toast.success("Voice commands activated. Try saying 'go to dashboard'");
    }
  };

  const processCommand = (command: string) => {
    // Only process final commands
    if (!command.trim() || !isListening) return;
    
    console.log("Processing voice command:", command);
    
    // Navigation commands
    if (command.includes("go to dashboard") || command.includes("open dashboard")) {
      navigate("/dashboard");
      toast.success("Navigating to Dashboard");
    } else if (command.includes("go to budget") || command.includes("open budget")) {
      navigate("/budget");
      toast.success("Navigating to Budget");
    } else if (command.includes("go to transactions") || command.includes("open transactions")) {
      navigate("/transactions");
      toast.success("Navigating to Transactions");
    } else if (command.includes("go to investment") || command.includes("open investment")) {
      navigate("/investment");
      toast.success("Navigating to Investment");
    } else if (command.includes("go to settings") || command.includes("open settings")) {
      navigate("/settings");
      toast.success("Navigating to Settings");
    } else if (command.includes("go to feedback") || command.includes("open feedback")) {
      navigate("/feedback");
      toast.success("Navigating to Feedback");
    } else if (command.includes("go home") || command.includes("go to home")) {
      navigate("/");
      toast.success("Navigating to Home");
    } else if (command.includes("sign out") || command.includes("logout") || command.includes("log out")) {
      navigate("/logout");
      toast.success("Signing out...");
    }
    
    // Dashboard specific commands
    else if (command.includes("add income")) {
      if (window.location.pathname === "/dashboard") {
        // Trigger the add income dialog
        document.dispatchEvent(new CustomEvent('budgetwise:add-income'));
        toast.success("Opening Add Income dialog");
      } else {
        navigate("/dashboard");
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('budgetwise:add-income'));
        }, 500);
        toast.success("Navigating to Dashboard to add income");
      }
    } else if (command.includes("add expense")) {
      if (window.location.pathname === "/dashboard") {
        // Trigger the add expense dialog
        document.dispatchEvent(new CustomEvent('budgetwise:add-expense'));
        toast.success("Opening Add Expense dialog");
      } else {
        navigate("/dashboard");
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('budgetwise:add-expense'));
        }, 500);
        toast.success("Navigating to Dashboard to add expense");
      }
    } else if (command.includes("reset dashboard")) {
      if (window.location.pathname === "/dashboard") {
        // Trigger dashboard reset
        document.dispatchEvent(new CustomEvent('budgetwise:reset-dashboard'));
        toast.success("Resetting Dashboard");
      } else {
        toast.info("Please navigate to Dashboard first to reset it");
      }
    }
    
    // Help command
    else if (command.includes("help") || command.includes("what can i say")) {
      toast.info("Available commands: go to dashboard, go to budget, go to transactions, add income, add expense, reset dashboard, sign out, go to feedback");
    }
  };

  return (
    <div className={`fixed left-4 bottom-4 z-50 flex flex-col items-start space-y-2`}>
      <div className={`bg-background/80 backdrop-blur-sm shadow-lg rounded-full p-1 flex items-center justify-center transition-all duration-300`}>
        <Button
          onClick={toggleListening}
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full ${
            isListening ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600" : "hover:bg-gray-100"
          }`}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
      </div>
      
      {showHint && (
        <div className="bg-background/80 backdrop-blur-sm shadow-lg rounded-lg p-3 max-w-xs text-sm animate-fade-in">
          <p className="font-medium mb-1">Voice Commands Active</p>
          <p className="text-muted-foreground">Try saying: "go to dashboard", "add income", "help"</p>
          {transcript && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">I heard: {transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
