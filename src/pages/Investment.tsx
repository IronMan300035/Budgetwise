
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LiveStockTracker } from '@/components/LiveStockTracker';
import { EnhancedSIPRecommendations } from '@/components/EnhancedSIPRecommendations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Investment() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading investment data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Investment Center</h1>
          <p className="text-muted-foreground">Discover and manage your investment opportunities</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock Tracker */}
          <LiveStockTracker />
          
          {/* SIP Recommendations */}
          <EnhancedSIPRecommendations />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
