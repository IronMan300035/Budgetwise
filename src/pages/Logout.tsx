
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Logout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      navigate("/");
    };
    
    performLogout();
  }, [signOut, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging you out...</h1>
        <p>You will be redirected shortly.</p>
      </div>
    </div>
  );
}
