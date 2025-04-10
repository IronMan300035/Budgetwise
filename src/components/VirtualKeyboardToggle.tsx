
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { toast } from 'sonner';

export function VirtualKeyboardToggle() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Load keyboard preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('virtual-keyboard-enabled');
    if (savedPreference) {
      setIsEnabled(savedPreference === 'true');
    }
  }, []);
  
  // Toggle keyboard enabled state
  const toggleKeyboardEnabled = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('virtual-keyboard-enabled', newState.toString());
    
    if (newState) {
      toast.success("Virtual keyboard enabled");
    } else {
      toast.info("Virtual keyboard disabled");
      setIsKeyboardOpen(false);
    }
  };
  
  // Handle keyboard key press
  const handleKeyPress = (key: string) => {
    const activeElement = document.activeElement as HTMLInputElement;
    
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    )) {
      if (key === 'Backspace') {
        // Handle backspace
        if (activeElement.value) {
          const startPos = activeElement.selectionStart || 0;
          const endPos = activeElement.selectionEnd || 0;
          
          if (startPos === endPos) {
            // No selection, delete character before cursor
            if (startPos > 0) {
              activeElement.value = activeElement.value.substring(0, startPos - 1) + 
                                   activeElement.value.substring(startPos);
              activeElement.selectionStart = startPos - 1;
              activeElement.selectionEnd = startPos - 1;
            }
          } else {
            // Delete selected text
            activeElement.value = activeElement.value.substring(0, startPos) + 
                                 activeElement.value.substring(endPos);
            activeElement.selectionStart = startPos;
            activeElement.selectionEnd = startPos;
          }
          
          // Trigger input event to update any bound data
          const event = new Event('input', { bubbles: true });
          activeElement.dispatchEvent(event);
        }
      } else if (key === 'Enter') {
        // Handle enter key
        activeElement.blur();
        
        // Try to find a submit button and click it
        const form = activeElement.closest('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton) {
            submitButton.click();
          }
        }
      } else {
        // Handle regular key press
        const startPos = activeElement.selectionStart || 0;
        const endPos = activeElement.selectionEnd || 0;
        
        activeElement.value = activeElement.value.substring(0, startPos) + 
                             key + 
                             activeElement.value.substring(endPos);
        
        // Move cursor after inserted text
        const newPos = startPos + key.length;
        activeElement.selectionStart = newPos;
        activeElement.selectionEnd = newPos;
        
        // Trigger input event to update any bound data
        const event = new Event('input', { bubbles: true });
        activeElement.dispatchEvent(event);
      }
    }
  };
  
  // Show/hide keyboard when clicking on inputs if enabled
  useEffect(() => {
    if (!isEnabled) return;
    
    const handleInputFocus = () => {
      setIsKeyboardOpen(true);
    };
    
    // Add focus event listener to inputs and textareas
    const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
    inputs.forEach(input => {
      input.addEventListener('focus', handleInputFocus);
    });
    
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleInputFocus);
      });
    };
  }, [isEnabled]);
  
  if (!isEnabled) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="gap-2"
        onClick={toggleKeyboardEnabled}
      >
        <Keyboard className="h-4 w-4" />
        Enable Virtual Keyboard
      </Button>
    );
  }
  
  return (
    <>
      <Button 
        variant={isKeyboardOpen ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => {
          if (isKeyboardOpen) {
            setIsKeyboardOpen(false);
          } else {
            toggleKeyboardEnabled();
          }
        }}
      >
        <Keyboard className="h-4 w-4" />
        {isKeyboardOpen ? "Hide" : "Disable"} Virtual Keyboard
      </Button>
      
      {isEnabled && isKeyboardOpen && (
        <VirtualKeyboard 
          onClose={() => setIsKeyboardOpen(false)}
          onKeyPress={handleKeyPress}
        />
      )}
    </>
  );
}
