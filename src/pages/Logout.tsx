
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useActivityLogs } from "@/hooks/useActivityLogs";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { addActivityLog } = useActivityLogs();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Log the logout activity before actually logging out
        await addActivityLog("logout", "User logged out");
        
        // Then perform the logout
        await logout();
        
        toast.success("Successfully logged out");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("An error occurred during logout");
      } finally {
        // Redirect to home regardless of success/failure
        navigate("/");
      }
    };

    performLogout();
  }, [logout, navigate, addActivityLog]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Logging out...</p>
      </div>
    </div>
  );
}
