
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type CommandAction = () => void;

interface VoiceCommands {
  [key: string]: CommandAction;
}

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const navigate = useNavigate();

  // Setup available commands
  const setupCommands = (): VoiceCommands => {
    return {
      'go to dashboard': () => navigate('/dashboard'),
      'go home': () => navigate('/'),
      'go to home': () => navigate('/'),
      'dashboard': () => navigate('/dashboard'),
      'go to budget': () => navigate('/budget'),
      'budget': () => navigate('/budget'),
      'go to investments': () => navigate('/investment'),
      'investments': () => navigate('/investment'),
      'go to transactions': () => navigate('/transactions'),
      'transactions': () => navigate('/transactions'),
      'go to profile': () => navigate('/profile'),
      'profile': () => navigate('/profile'),
      'go to settings': () => navigate('/settings'),
      'settings': () => navigate('/settings'),
      'logout': () => navigate('/logout'),
      'log out': () => navigate('/logout'),
      'help': () => showHelp(),
      'what can i say': () => showHelp(),
      'stop listening': () => stopListening(),
    };
  };

  const showHelp = () => {
    toast.info(
      <div className="space-y-2">
        <h3 className="font-medium">Voice Commands</h3>
        <ul className="text-sm list-disc pl-4 space-y-1">
          <li>Go to dashboard</li>
          <li>Go to budget</li>
          <li>Go to investments</li>
          <li>Go to transactions</li>
          <li>Go to profile</li>
          <li>Go to settings</li>
          <li>Logout</li>
          <li>Help / What can I say</li>
          <li>Stop listening</li>
        </ul>
      </div>,
      {
        duration: 10000,
      }
    );
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      toast.success('Voice commands disabled');
    }
  };

  // Process voice input against available commands
  const processCommand = (input: string) => {
    const commands = setupCommands();
    const normalizedInput = input.toLowerCase().trim();
    
    // Try to match the command exactly first
    if (commands[normalizedInput]) {
      commands[normalizedInput]();
      return true;
    }
    
    // Try to find commands within the longer speech
    for (const cmd in commands) {
      if (normalizedInput.includes(cmd)) {
        commands[cmd]();
        return true;
      }
    }
    
    return false;
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const currentTranscript = event.results[i][0].transcript;
              setTranscript(currentTranscript);
              
              // Process the command
              const commandExecuted = processCommand(currentTranscript);
              if (commandExecuted) {
                toast.success(`Command executed: ${currentTranscript}`);
              } else {
                toast.error(`Sorry, I didn't understand: "${currentTranscript}"`, {
                  description: "Try saying 'Help' to see available commands."
                });
              }
            }
          }
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied', {
              description: 'Please enable microphone access in your browser settings'
            });
          }
        };
        
        setRecognition(recognitionInstance);
      } else {
        toast.error('Speech recognition is not supported in your browser');
      }
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      toast.info('Voice commands disabled');
    } else {
      recognition.start();
      toast.success('Voice commands enabled', {
        description: "Try saying 'Help' to see available commands"
      });
    }
    
    setIsListening(!isListening);
  };

  return {
    isListening,
    toggleListening,
    transcript
  };
}
