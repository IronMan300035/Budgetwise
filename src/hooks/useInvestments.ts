
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Investment {
  id: string;
  user_id: string;
  type: 'sip' | 'stock' | 'mutual_fund' | 'crypto' | 'fd' | 'rd' | 'other';
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
      // First, create an expense transaction for this investment
      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'expense',
        amount: newInvestment.amount,
        category: `Investment: ${newInvestment.type}`,
        description: `Investment in ${newInvestment.name}`,
        transaction_date: newInvestment.purchase_date
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
      // Get the original investment data
      const { data: originalData, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // If amount changed, create an adjustment transaction
      if (updates.amount && updates.amount !== originalData.amount) {
        const amountDifference = updates.amount - originalData.amount;
        
        if (amountDifference !== 0) {
          // If amount increased, add an expense transaction for the additional investment
          // If amount decreased, add an income transaction for the reduction in investment
          const { error: transactionError } = await supabase.from('transactions').insert({
            user_id: user.id,
            type: amountDifference > 0 ? 'expense' : 'income',
            amount: Math.abs(amountDifference),
            category: `Investment Adjustment: ${originalData.type}`,
            description: `Adjustment for ${originalData.name}`,
            transaction_date: updates.purchase_date || originalData.purchase_date
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
      // Get the investment data before deleting
      const { data: investment, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Add an income transaction to offset the investment (representing liquidation)
      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'income',
        amount: investment.amount,
        category: `Investment Liquidation: ${investment.type}`,
        description: `Liquidated ${investment.name}`,
        transaction_date: new Date().toISOString().split('T')[0]
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
