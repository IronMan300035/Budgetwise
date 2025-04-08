
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);
  
  // Format time as HH:MM:SS
  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <Clock className="h-4 w-4" />
      <span>{formattedTime}</span>
    </div>
  );
}
