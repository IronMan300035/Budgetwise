
// This is a read-only file, but we need to modify it to add auth activity logging
// We'll create a new context that extends the original one

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLogs } from "@/hooks/useActivityLogs";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: {} | null;
  }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null, data: null }),
  signIn: async () => ({ error: null, data: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null, data: null }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { logAuthActivity } = useActivityLogs();

  useEffect(() => {
    // Get initial session
    const getCurrentSession = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          console.info("Auth state change: INITIAL_SESSION");
        }
      } catch (error) {
        console.error("Error getting current session:", error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.info("Auth state change:", event);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
        
        // Log auth activity
        if (event === 'SIGNED_IN') {
          // We use a timeout to ensure the user is set in the useActivityLogs hook
          setTimeout(() => {
            logAuthActivity('sign-in');
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          // No need for timeout here as we log before signing out
          logAuthActivity('sign-out');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [logAuthActivity]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      return { error, data: data.user };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error, data: data.session };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    // Log sign-out activity before actual sign-out
    if (user) {
      await logAuthActivity('sign-out');
    }
    
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
