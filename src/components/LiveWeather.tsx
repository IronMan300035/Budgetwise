
import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: JSX.Element;
}

export function LiveWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    } else if (conditionLower.includes("snow")) {
      return <CloudSnow className="h-4 w-4 text-sky-300" />;
    } else if (conditionLower.includes("thunder") || conditionLower.includes("lightning")) {
      return <CloudLightning className="h-4 w-4 text-amber-500" />;
    } else if (conditionLower.includes("wind")) {
      return <Wind className="h-4 w-4 text-slate-500" />;
    } else {
      return <Cloud className="h-4 w-4 text-slate-400" />;
    }
  };
  
  const fetchWeather = async () => {
    setLoading(true);
    try {
      // First get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Simulate API call to weather service - in a real app, you would call a weather API
      // For demo purposes, we'll use random weather data
      const mockWeatherResponses = [
        { temp: 28, condition: "Sunny", location: "Mumbai" },
        { temp: 24, condition: "Partly Cloudy", location: "Delhi" },
        { temp: 30, condition: "Clear", location: "Chennai" },
        { temp: 22, condition: "Light Rain", location: "Bangalore" },
        { temp: 26, condition: "Cloudy", location: "Hyderabad" },
        { temp: 32, condition: "Hot", location: "Kolkata" }
      ];
      
      // Select random weather for demo
      const mockWeather = mockWeatherResponses[Math.floor(Math.random() * mockWeatherResponses.length)];
      
      setWeather({
        temperature: mockWeather.temp,
        condition: mockWeather.condition,
        location: mockWeather.location,
        icon: getWeatherIcon(mockWeather.condition)
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast.error("Could not fetch weather information", {
        description: "Please check your location settings and try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWeather();
    
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, []);
  
  if (loading && !weather) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading weather...</span>
      </div>
    );
  }
  
  if (!weather) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      {weather.icon}
      <span>{weather.temperature}°C</span>
      <span className="text-muted-foreground hidden sm:inline">
        {weather.condition}, {weather.location}
      </span>
    </div>
  );
}
