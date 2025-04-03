
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// This will be replaced with Supabase Auth when connected
interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  verifyPhone: (otp: string) => Promise<void>;
  requestEmailVerification: () => Promise<void>;
  requestPhoneVerification: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage (will be replaced with Supabase session)
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Mock functions to be replaced with Supabase
  const signUp = async (email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        phone,
        verified: false
      };
      
      // Store in localStorage
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      localStorage.setItem("auth_token", "mock-token-" + newUser.id);
      setUser(newUser);
      
      toast.success("Account created successfully! Please verify your email.");
      navigate("/verify-email");
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app we'd validate credentials against the backend
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        verified: true
      };
      
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      localStorage.setItem("auth_token", "mock-token-" + mockUser.id);
      setUser(mockUser);
      
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Invalid email or password.");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      setUser(null);
      toast.info("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  
  const requestEmailVerification = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };
  
  const requestPhoneVerification = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Verification code sent to your phone!");
    } catch (error) {
      toast.error("Failed to send verification SMS");
    }
  };
  
  const verifyEmail = async (otp: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (otp === "123456") { // Mock verification
        const updatedUser = { ...user, verified: true } as User;
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success("Email verified successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error) {
      toast.error("Email verification failed");
    }
  };
  
  const verifyPhone = async (otp: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (otp === "123456") { // Mock verification
        toast.success("Phone number verified successfully!");
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error) {
      toast.error("Phone verification failed");
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    verifyPhone,
    requestEmailVerification,
    requestPhoneVerification
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
