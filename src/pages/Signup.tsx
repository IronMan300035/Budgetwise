
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp, loading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Pass metadata with name as an object, not directly as string
    await signUp(email, password, { metadata: { name } });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient p-4">
      <Card className="w-full max-w-md animate-fade-in glass-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CircleDollarSign className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started with BudgetWise
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign up
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
