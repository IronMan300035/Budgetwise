
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowUp, Delete, CornerDownLeft, Globe } from 'lucide-react';

interface VirtualKeyboardProps {
  onClose: () => void;
  onKeyPress: (key: string) => void;
}

export function VirtualKeyboard({ onClose, onKeyPress }: VirtualKeyboardProps) {
  const [shift, setShift] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'en' | 'symbols'>('en');
  
  const englishLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.']
  ];
  
  const symbolsLayout = [
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '=', '+', '[', ']', '{', '}', '\\', '|'],
    [';', ':', "'", '"', '<', '>', '/', '?'],
    ['~', '`', '€', '£', '¥', '₹', '©', '®', '™']
  ];
  
  const getCurrentLayout = () => {
    const layout = currentLayout === 'en' ? englishLayout : symbolsLayout;
    
    if (shift && currentLayout === 'en') {
      return layout.map(row => row.map(key => {
        if (key.length === 1 && key.match(/[a-z]/i)) {
          return key.toUpperCase();
        }
        return key;
      }));
    }
    
    return layout;
  };
  
  const handleKeyClick = (key: string) => {
    onKeyPress(key);
    
    if (shift) {
      setShift(false);
    }
  };
  
  const handleShift = () => {
    setShift(!shift);
  };
  
  const handleBackspace = () => {
    onKeyPress('Backspace');
  };
  
  const handleEnter = () => {
    onKeyPress('Enter');
  };
  
  const handleSpace = () => {
    onKeyPress(' ');
  };
  
  const toggleLayout = () => {
    setCurrentLayout(currentLayout === 'en' ? 'symbols' : 'en');
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg p-2 z-50 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" size="sm" onClick={toggleLayout}>
          <Globe className="h-4 w-4 mr-1" />
          {currentLayout === 'en' ? 'ABC' : '!@#'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="keyboard-container">
        {getCurrentLayout().map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 mb-1">
            {row.map((key, keyIndex) => (
              <Button
                key={`${rowIndex}-${keyIndex}`}
                variant="outline"
                className="w-10 h-10 text-center flex items-center justify-center"
                onClick={() => handleKeyClick(key)}
              >
                {key}
              </Button>
            ))}
          </div>
        ))}
        
        <div className="flex justify-center gap-1">
          <Button 
            variant="outline" 
            className="px-3"
            onClick={handleShift}
          >
            <ArrowUp className={`h-4 w-4 ${shift ? 'text-primary' : ''}`} />
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleSpace}
          >
            Space
          </Button>
          
          <Button 
            variant="outline" 
            className="px-3"
            onClick={handleBackspace}
          >
            <Delete className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="px-3"
            onClick={handleEnter}
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
