
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface VoiceCommandSystemProps {
  isOpen?: boolean;
}

export function VoiceCommandSystem({ isOpen = false }: VoiceCommandSystemProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef<any>(null);
  const { user } = useAuth();

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
      
      // Log activity for stopping voice commands
      if (user) {
        logActivity('Voice command system deactivated');
      }
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
      setShowHint(true);
      toast.success("Voice commands activated. Try saying 'go to dashboard'");
      
      // Log activity for starting voice commands
      if (user) {
        logActivity('Voice command system activated');
      }
    }
  };

  const logActivity = async (description: string) => {
    if (!user) return;
    
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'voice',
        description
      });
    } catch (error) {
      console.error('Error logging voice activity:', error);
    }
  };

  const processCommand = (command: string) => {
    // Only process final commands
    if (!command.trim() || !isListening) return;
    
    console.log("Processing voice command:", command);
    
    // Navigation commands
    if (command.includes("go to dashboard") || command.includes("open dashboard") || command.includes("take me to dashboard")) {
      executeCommand(() => navigate("/dashboard"), "Navigating to Dashboard");
    } 
    else if (command.includes("go to budget") || command.includes("open budget") || command.includes("take me to budget")) {
      executeCommand(() => navigate("/budget"), "Navigating to Budget");
    } 
    else if (command.includes("go to transactions") || command.includes("open transactions") || command.includes("take me to transactions") || 
             command.includes("show transactions") || command.includes("view transactions")) {
      executeCommand(() => navigate("/transactions"), "Navigating to Transactions");
    } 
    else if (command.includes("go to investment") || command.includes("open investment") || 
             command.includes("go to investments") || command.includes("open investments") || 
             command.includes("take me to investment") || command.includes("take me to investments") ||
             command.includes("show investments") || command.includes("view investments")) {
      executeCommand(() => navigate("/investment"), "Navigating to Investment");
    } 
    else if (command.includes("go to settings") || command.includes("open settings") || command.includes("take me to settings")) {
      executeCommand(() => navigate("/settings"), "Navigating to Settings");
    } 
    else if (command.includes("go to feedback") || command.includes("open feedback") || command.includes("take me to feedback")) {
      executeCommand(() => navigate("/feedback"), "Navigating to Feedback");
    } 
    else if (command.includes("go to activity") || command.includes("open activity") || 
             command.includes("go to activity log") || command.includes("open activity log") ||
             command.includes("take me to activity") || command.includes("take me to activity log")) {
      executeCommand(() => navigate("/activity-log"), "Navigating to Activity Log");
    }
    else if (command.includes("go home") || command.includes("go to home") || command.includes("take me home")) {
      executeCommand(() => navigate("/"), "Navigating to Home");
    } 
    else if (command.includes("sign out") || command.includes("logout") || command.includes("log out")) {
      executeCommand(() => navigate("/logout"), "Signing out...");
    }
    
    // Dashboard specific commands - check if we're on the dashboard page
    else if ((location.pathname === "/dashboard" || command.includes("on dashboard")) && command.includes("add income")) {
      executeCommand(() => {
        document.dispatchEvent(new CustomEvent('budgetwise:add-income'));
      }, "Opening Add Income dialog");
    } 
    else if ((location.pathname === "/dashboard" || command.includes("on dashboard")) && command.includes("add expense")) {
      executeCommand(() => {
        document.dispatchEvent(new CustomEvent('budgetwise:add-expense'));
      }, "Opening Add Expense dialog");
    } 
    else if ((location.pathname === "/dashboard" || command.includes("on dashboard")) && command.includes("reset dashboard")) {
      executeCommand(() => {
        document.dispatchEvent(new CustomEvent('budgetwise:reset-dashboard'));
      }, "Resetting Dashboard");
    }
    // If not on dashboard, but command is for dashboard actions, navigate first
    else if (command.includes("add income")) {
      executeCommand(() => {
        navigate("/dashboard");
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('budgetwise:add-income'));
        }, 500);
      }, "Navigating to Dashboard to add income");
    } 
    else if (command.includes("add expense")) {
      executeCommand(() => {
        navigate("/dashboard");
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('budgetwise:add-expense'));
        }, 500);
      }, "Navigating to Dashboard to add expense");
    }
    
    // Help command
    else if (command.includes("help") || command.includes("what can i say")) {
      toast.info("Available commands: go to dashboard, go to budget, go to transactions, add income, add expense, reset dashboard, sign out, go to feedback");
    }
  };

  const executeCommand = (action: () => void, message: string) => {
    // Log the command execution
    if (user) {
      logActivity(`Voice command executed: ${message}`);
    }
    
    // Show toast notification
    toast.success(message);
    
    // Execute the action
    action();
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
