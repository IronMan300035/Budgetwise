import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          toast.error("Email verification failed");
          navigate("/login");
          return;
        }

        if (data?.session) {
          toast.success("Email verified successfully! Welcome to BudgetWise.");
          navigate("/dashboard");
        } else {
          toast.success("Email verified! Please log in to continue.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Something went wrong during verification");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}