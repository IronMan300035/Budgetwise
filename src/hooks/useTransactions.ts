
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CurrencyUtils } from '@/components/CurrencyToggle';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
  displayAmount?: number;  // For currency conversion display
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const { user } = useAuth();
  const [currentCurrency, setCurrentCurrency] = useState<{ code: string; symbol: string }>({ code: "USD", symbol: "$" });
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger

  // Force a refresh of transactions
  const refreshTransactions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Use memoized calculations for financial totals to improve performance
  const financialSummary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = income - expenses;
    
    return {
      income,
      expenses,
      balance,
      formattedIncome: `${currentCurrency.symbol}${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      formattedExpenses: `${currentCurrency.symbol}${expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      formattedBalance: `${currentCurrency.symbol}${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
  }, [transactions, currentCurrency]);

  useEffect(() => {
    // Load the saved currency from localStorage
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrentCurrency(JSON.parse(savedCurrency));
    }

    // Listen for currency changes
    const handleCurrencyChange = (e: CustomEvent) => {
      const { code, symbol, conversionRate } = e.detail;
      setCurrentCurrency({ code, symbol });
      
      // Update transaction amounts in UI without refetching (for display only)
      setTransactions(prevTx => 
        prevTx.map(tx => ({
          ...tx,
          displayAmount: Number(tx.amount) * conversionRate
        })) as Transaction[]
      );
    };

    window.addEventListener('currency-change', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currency-change', handleCurrencyChange as EventListener);
    };
  }, []);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)  // Make sure we only get this user's transactions
        .order('transaction_date', { ascending: false });

      if (dateRange.start) {
        query = query.gte('transaction_date', dateRange.start.toISOString().split('T')[0]);
      }

      if (dateRange.end) {
        query = query.lte('transaction_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Apply currency conversion for display (actual DB values remain in original currency)
      const processedData = (data || []).map(tx => ({
        ...tx,
        displayAmount: tx.amount // Start with original amount, will be converted if needed
      }));
      
      setTransactions(processedData as Transaction[]);
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

      // Add displayAmount property for UI 
      const newTx = {
        ...data[0],
        displayAmount: data[0].amount // Start with original amount
      } as Transaction;

      // Update transactions state directly for immediate UI update
      setTransactions(prev => [newTx, ...prev]);
      
      toast.success(`${newTransaction.type === 'income' ? 'Income' : 'Expense'} added successfully`, {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return newTx;
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

      // Update local state with displayAmount
      const updatedTx = {
        ...data[0],
        displayAmount: data[0].amount
      } as Transaction;

      setTransactions(prev =>
        prev.map(transaction => (transaction.id === id ? updatedTx : transaction))
      );
      
      toast.success('Transaction updated successfully', {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      
      return updatedTx;
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

      // Update local state immediately
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
    return financialSummary;
  };

  // Setup real-time subscription for transactions
  useEffect(() => {
    if (!user) return;
    
    const transactionChannel = supabase
      .channel('public:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('Transaction change received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          const newTransaction = {
            ...payload.new,
            displayAmount: payload.new.amount
          } as Transaction;
          
          setTransactions(prev => [newTransaction, ...prev.filter(t => t.id !== newTransaction.id)]);
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedTransaction = {
            ...payload.new,
            displayAmount: payload.new.amount
          } as Transaction;
          
          setTransactions(prev => 
            prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
          );
        } 
        else if (payload.eventType === 'DELETE') {
          setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(transactionChannel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange, refreshTrigger]); 

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
    fetchTransactions,
    refreshTransactions,
    setDateRange,
    dateRange,
    currentCurrency,
    // Export the memoized summary directly for faster access
    financialSummary
  };
};
