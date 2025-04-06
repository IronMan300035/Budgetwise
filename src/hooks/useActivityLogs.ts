
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  // Add a function to log authentication activities
  const logAuthActivity = async (action: 'sign-in' | 'sign-out') => {
    if (!user) return;

    try {
      const description = action === 'sign-in' 
        ? `User signed in at ${new Date().toLocaleString()}`
        : `User signed out at ${new Date().toLocaleString()}`;
        
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'login',
        description
      });
      
      if (error) throw error;
      
      // Refresh the logs
      fetchLogs();
      
    } catch (error) {
      console.error(`Error logging ${action}:`, error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
      
      // Log sign-in event when component mounts with user
      logAuthActivity('sign-in');
      
      // Set up realtime subscription for activity logs
      const channel = supabase
        .channel('public:activity_logs')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`
        }, payload => {
          console.log('New activity log:', payload);
          const newLog = payload.new as ActivityLog;
          setLogs(prev => [newLog, ...prev]);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    logs,
    loading,
    fetchLogs,
    logAuthActivity
  };
};
