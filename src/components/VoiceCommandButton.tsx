
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function VoiceCommandButton() {
  const { isListening, toggleListening } = useVoiceCommands();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={`rounded-full w-10 h-10 ${isListening ? 'bg-red-100 text-red-500 border-red-300 hover:bg-red-200 hover:text-red-600' : ''}`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Disable voice commands' : 'Enable voice commands'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
