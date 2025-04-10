
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Budget from "@/pages/Budget";
import FinancialActivities from "@/pages/FinancialActivities";
import Transactions from "@/pages/Transactions";
import Investment from "@/pages/Investment";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/ForgotPassword";
import Settings from "@/pages/Settings";
import ActivityLog from "@/pages/ActivityLog";
import BankAccounts from "@/pages/BankAccounts";
import Logout from "@/pages/Logout";
import VerifyEmail from "@/pages/VerifyEmail";
import VerifyPhone from "@/pages/VerifyPhone";
import Feedback from "@/pages/Feedback";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Assistant from "@/pages/Assistant";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NewsBulletin from "@/pages/NewsBulletin";
import Splitwise from "@/pages/Splitwise";
import { VoiceCommandSystem } from "@/components/VoiceCommandSystem";
import { AIChatbot } from "@/components/AIChatbot";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/financial-activities" element={<FinancialActivities />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/bank-accounts" element={<BankAccounts />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-phone" element={<VerifyPhone />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/news-bulletin" element={<NewsBulletin />} />
            <Route path="/splitwise" element={<Splitwise />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="bottom-right" />
          <VoiceCommandSystem />
          <AIChatbot />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
