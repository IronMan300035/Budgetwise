
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Cloud, CloudRain, Sunset, Sun, CloudFog, CloudLightning, CloudSnow, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
  }[];
  name: string;
  sys: {
    country: string;
  };
}

export function LiveWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lon: longitude });
          },
          (err) => {
            console.error('Error getting location:', err);
            setError('Unable to get your location. Weather data may not be accurate.');
            // Use a default location (New Delhi)
            setLocation({ lat: 28.6139, lon: 77.2090 });
            toast.error('Could not get your location. Using default location.');
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        // Use a default location (New Delhi)
        setLocation({ lat: 28.6139, lon: 77.2090 });
        toast.error('Location services not available. Using default location.');
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const API_KEY = '1635890035cbba097fd5c26c8ea672a1'; // OpenWeatherMap API key
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeather(data);
        
        // Log weather data to database
        if (user) {
          await logWeatherData(data, location);
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Failed to fetch weather data');
        toast.error('Could not fetch weather information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location, user]);

  const logWeatherData = async (weatherData: WeatherData, location: { lat: number; lon: number }) => {
    if (!user) return;
    
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'weather',
        description: `Weather data: ${weatherData.main.temp}°C, ${weatherData.weather[0].main} in ${weatherData.name}`
      });
    } catch (error) {
      console.error('Error logging weather data:', error);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-6 w-6 text-gray-400" />;
    
    const weatherCode = weather.weather[0].id;
    
    if (weatherCode >= 200 && weatherCode < 300) {
      return <CloudLightning className="h-6 w-6 text-yellow-400" />;
    } else if (weatherCode >= 300 && weatherCode < 600) {
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    } else if (weatherCode >= 600 && weatherCode < 700) {
      return <CloudSnow className="h-6 w-6 text-blue-200" />;
    } else if (weatherCode >= 700 && weatherCode < 800) {
      return <CloudFog className="h-6 w-6 text-gray-400" />;
    } else if (weatherCode === 800) {
      return <Sun className="h-6 w-6 text-yellow-400" />;
    } else {
      return <Cloud className="h-6 w-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
        <span className="text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm">
        <p>{error || 'Failed to load weather'}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-sm">
      {getWeatherIcon()}
      <div>
        <p className="text-sm font-medium">{weather.name}, {weather.sys.country}</p>
        <p className="text-lg font-bold">{Math.round(weather.main.temp)}°C</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {weather.weather[0].description}
        </p>
      </div>
    </div>
  );
}
