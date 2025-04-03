
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Investment {
  id: string;
  user_id: string;
  type: 'sip' | 'stock' | 'mutual_fund' | 'crypto' | 'other';
  name: string;
  amount: number;
  quantity?: number;
  purchase_date: string;
  symbol?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInvestments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      // Cast the data to ensure it matches the Investment interface
      setInvestments((data || []) as Investment[]);
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to load investments', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (newInvestment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('investments').insert({
        ...newInvestment,
        user_id: user.id,
      }).select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'investment',
        description: `Added new ${newInvestment.type} investment: ₹${newInvestment.amount} - ${newInvestment.name}`
      });

      setInvestments(prev => [data[0] as Investment, ...prev]);
      
      toast.success('Investment added successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return data[0] as Investment;
    } catch (error: any) {
      console.error('Error adding investment:', error);
      toast.error('Failed to add investment', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return null;
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'investment',
        description: `Updated ${updates.type || 'investment'}: ${updates.name || ''}`
      });

      setInvestments(prev =>
        prev.map(investment => (investment.id === id ? (data[0] as Investment) : investment))
      );
      
      toast.success('Investment updated successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return data[0] as Investment;
    } catch (error: any) {
      console.error('Error updating investment:', error);
      toast.error('Failed to update investment', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return null;
    }
  };

  const deleteInvestment = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'investment',
        description: `Deleted investment`
      });

      setInvestments(prev => prev.filter(investment => investment.id !== id));
      
      toast.success('Investment deleted successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      toast.error('Failed to delete investment', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return false;
    }
  };

  const getInvestmentTotal = () => {
    return investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  };

  const getInvestmentsByType = () => {
    return investments.reduce((acc, inv) => {
      const type = inv.type;
      if (!acc[type]) acc[type] = 0;
      acc[type] += Number(inv.amount);
      return acc;
    }, {} as Record<string, number>);
  };

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  return {
    investments,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    fetchInvestments,
    getInvestmentTotal,
    getInvestmentsByType
  };
};
