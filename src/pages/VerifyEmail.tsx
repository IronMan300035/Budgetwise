
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyEmail, requestEmailVerification, user } = useAuth();
  
  useEffect(() => {
    // Start countdown for resending verification email
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);
  
  const handleResendCode = async () => {
    await requestEmailVerification();
    setCountdown(60);
    setCanResend(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(otp);
      // Redirect to login page after successful verification
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      console.error("Email verification error:", error);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient p-4">
      <Card className="w-full max-w-md animate-fade-in glass-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification code to {user?.email}. Enter the code below to verify your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">Verification Code</label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {canResend ? (
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={handleResendCode}
                  className="p-0 h-auto text-primary"
                >
                  Resend code
                </Button>
              ) : (
                <span>Resend code in {countdown} seconds</span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Verify Email
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
