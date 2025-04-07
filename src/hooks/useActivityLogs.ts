
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
        .eq('user_id', user.id)
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

  // Add an activity log
  const addActivityLog = async (activityType: string, description: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: activityType,
        description: description
      }).select();

      if (error) throw error;

      // Update local state immediately for a responsive UI
      if (data && data.length > 0) {
        setLogs(prevLogs => [data[0] as ActivityLog, ...prevLogs]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding activity log:', error);
      return false;
    }
  };

  // Setup real-time subscription for activity logs
  useEffect(() => {
    if (!user) return;
    
    const logsChannel = supabase
      .channel('public:activity_logs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activity_logs',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('Activity log change received:', payload);
        
        if (payload.eventType === 'INSERT') {
          setLogs(prev => [payload.new as ActivityLog, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(logsChannel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  return {
    logs,
    loading,
    fetchLogs,
    addActivityLog
  };
};
