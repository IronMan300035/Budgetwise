
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  purchase_price: number;  // Match database column
  shares: number;         // Match database column
  current_price?: number; // Match database column
  purchase_date: string;
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
      // First, create an expense transaction for this investment
      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'expense',
        amount: newInvestment.purchase_price * newInvestment.shares,
        category: 'Investment',
        description: `Investment in ${newInvestment.name}`,
        date: newInvestment.purchase_date
      });

      if (transactionError) throw transactionError;

      // Then create the investment record
      const { data, error } = await supabase.from('investments').insert({
        ...newInvestment,
        user_id: user.id,
      }).select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'investment',
        description: `Added new investment: ₹${newInvestment.purchase_price * newInvestment.shares} - ${newInvestment.name}`
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
      // Get the original investment data
      const { data: originalData, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // If investment value changed, create an adjustment transaction
      const originalValue = originalData.purchase_price * originalData.shares;
      const newValue = (updates.purchase_price || originalData.purchase_price) * (updates.shares || originalData.shares);
      
      if (newValue !== originalValue) {
        const valueDifference = newValue - originalValue;
        
        if (valueDifference !== 0) {
          // If value increased, add an expense transaction for the additional investment
          // If value decreased, add an income transaction for the reduction in investment
          const { error: transactionError } = await supabase.from('transactions').insert({
            user_id: user.id,
            type: valueDifference > 0 ? 'expense' : 'income',
            amount: Math.abs(valueDifference),
            category: 'Investment Adjustment',
            description: `Adjustment for ${originalData.name}`,
            date: updates.purchase_date || originalData.purchase_date
          });
          
          if (transactionError) throw transactionError;
        }
      }
      
      // Update the investment
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
        description: `Updated investment: ${updates.name || ''}`
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
      // Get the investment data before deleting
      const { data: investment, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Add an income transaction to offset the investment (representing liquidation)
      const investmentValue = investment.purchase_price * investment.shares;
      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'income',
        amount: investmentValue,
        category: 'Investment Liquidation',
        description: `Liquidated ${investment.name}`,
        date: new Date().toISOString().split('T')[0]
      });
      
      if (transactionError) throw transactionError;

      // Delete the investment
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'investment',
        description: `Deleted investment: ${investment.name}`
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
    return investments.reduce((sum, inv) => sum + (Number(inv.purchase_price) * Number(inv.shares)), 0);
  };

  const getInvestmentsBySymbol = () => {
    return investments.reduce((acc, inv) => {
      const symbol = inv.symbol;
      if (!acc[symbol]) acc[symbol] = 0;
      acc[symbol] += Number(inv.purchase_price) * Number(inv.shares);
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
    getInvestmentsBySymbol
  };
};
