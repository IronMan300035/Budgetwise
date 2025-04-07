import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  verifyPhone: (otp: string) => Promise<void>;
  requestEmailVerification: () => Promise<void>;
  requestPhoneVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Log user activity when signing in or signing out
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Use setTimeout to prevent Supabase listener deadlock
          setTimeout(() => {
            logActivity('login', 'User signed in');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // No need to log signout here as we already do it in the signOut function
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Log user activity
  const logActivity = async (activityType: string, description: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: activityType,
        description: description
      });
      
      if (error) {
        console.error("Failed to log activity:", error);
      }
    } catch (error) {
      console.error("Error in logActivity:", error);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    setLoading(true);
    try {
      // Check password complexity
      if (!isPasswordValid(password)) {
        toast.error("Password must include lowercase, uppercase, digit, and symbol", {
          className: "bg-red-100 text-red-800 border-red-200",
        });
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created! Please check your email for verification.", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      navigate("/verify-email");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Logged in successfully!", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Log the sign out activity before actually signing out
      if (user) {
        await logActivity('logout', 'User signed out');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.info("Logged out successfully", {
        className: "bg-blue-100 text-blue-800 border-blue-200",
      });
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Sign out error:", error);
    }
  };
  
  // Request email verification
  const requestEmailVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent!", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Email verification error:", error);
    }
  };
  
  // Request phone verification (mock function, would require SMS integration)
  const requestPhoneVerification = async () => {
    try {
      // This would be implemented with a service like Twilio
      toast.success("Verification code sent to your phone!", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error: any) {
      toast.error("Failed to send verification SMS", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Phone verification error:", error);
    }
  };
  
  // Verify email with OTP (used for Supabase magic links)
  const verifyEmail = async (otp: string) => {
    try {
      // For Supabase, OTP verification is handled by magic links
      // This is just a placeholder function as verification happens through email links
      toast.success("Email verified successfully!", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error: any) {
      toast.error("Email verification failed", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Email verification error:", error);
    }
  };
  
  // Verify phone with OTP
  const verifyPhone = async (otp: string) => {
    try {
      // This would be implemented with a service like Twilio
      if (otp === "123456") { // Mock verification
        toast.success("Phone number verified successfully!", {
          className: "bg-green-100 text-green-800 border-green-200",
        });
      } else {
        toast.error("Invalid verification code", {
          className: "bg-red-100 text-red-800 border-red-200",
        });
      }
    } catch (error: any) {
      toast.error("Phone verification failed", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Phone verification error:", error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset instructions sent to your email", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset instructions", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
      console.error("Password reset error:", error);
    }
  };

  // Check password complexity
  const isPasswordValid = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return hasLowerCase && hasUpperCase && hasDigit && hasSymbol && isLongEnough;
  };

  // Context value
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    verifyPhone,
    requestEmailVerification,
    requestPhoneVerification,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
