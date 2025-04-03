
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (dateRange.start) {
        query = query.gte('transaction_date', dateRange.start.toISOString().split('T')[0]);
      }

      if (dateRange.end) {
        query = query.lte('transaction_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('transactions').insert({
        ...newTransaction,
        user_id: user.id,
      }).select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'transaction',
        description: `Added new ${newTransaction.type}: ₹${newTransaction.amount} - ${newTransaction.category}`
      });

      setTransactions(prev => [data[0] as Transaction, ...prev]);
      
      toast.success(`${newTransaction.type === 'income' ? 'Income' : 'Expense'} added successfully`, {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return data[0] as Transaction;
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'transaction',
        description: `Updated ${updates.type || 'transaction'}: ₹${updates.amount || ''}`
      });

      setTransactions(prev =>
        prev.map(transaction => (transaction.id === id ? (data[0] as Transaction) : transaction))
      );
      
      toast.success('Transaction updated successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return data[0] as Transaction;
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return null;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'transaction',
        description: `Deleted transaction`
      });

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      toast.success('Transaction deleted successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction', {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      return false;
    }
  };

  const getTransactionSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
    fetchTransactions,
    setDateRange,
    dateRange
  };
};
