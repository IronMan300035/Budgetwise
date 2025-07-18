
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [currency, setCurrency] = useState({ code: "USD", symbol: "$" });

  useEffect(() => {
    // Listen for currency changes
    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail);
    };

    window.addEventListener('currency-change', handleCurrencyChange);
    
    // Get initial currency from localStorage
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency));
    }
    
    return () => {
      window.removeEventListener('currency-change', handleCurrencyChange);
    };
  }, []);

  const fetchBudgets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('category');

      if (error) throw error;
      // Cast the data to ensure it matches the Budget interface
      setBudgets((data || []) as Budget[]);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (newBudget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('budgets').insert({
        ...newBudget,
        name: newBudget.category, // Use category as name for backward compatibility
        user_id: user.id,
      }).select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'budget',
        description: `Created budget for ${newBudget.category}: ${currency.symbol}${newBudget.amount}`
      });

      setBudgets(prev => [...prev, data[0] as Budget]);
      
      toast.success('Budget added successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return data[0] as Budget;
    } catch (error: any) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return null;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'budget',
        description: `Updated budget for ${updates.category || 'category'}: ${currency.symbol}${updates.amount || ''}`
      });

      setBudgets(prev =>
        prev.map(budget => (budget.id === id ? (data[0] as Budget) : budget))
      );
      
      toast.success('Budget updated successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return data[0] as Budget;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return null;
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'budget',
        description: `Deleted budget`
      });

      setBudgets(prev => prev.filter(budget => budget.id !== id));
      
      toast.success('Budget deleted successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  return {
    budgets,
    loading,
    currency,
    addBudget,
    updateBudget,
    deleteBudget,
    fetchBudgets
  };
};
