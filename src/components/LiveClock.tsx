
import { useState, useEffect } from 'react';

export function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  const formattedDate = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-2 shadow-sm">
      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{formattedDate}</p>
      <p className="text-lg font-bold text-blue-700 dark:text-blue-200">{formattedTime}</p>
    </div>
  );
}
