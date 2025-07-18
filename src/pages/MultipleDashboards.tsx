import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Download, 
  Trash2, 
  Edit, 
  Save, 
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
  data: {
    income: number;
    expenses: number;
    investments: number;
    categories: Record<string, number>;
  };
}

export default function MultipleDashboards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboards();
    }
  }, [user]);

  const fetchDashboards = async () => {
    if (!user) return;
    
    try {
      // For demo purposes, we'll create sample data since we don't have a dashboards table
      const sampleDashboards: Dashboard[] = [
        {
          id: '1',
          name: 'Personal Finances',
          description: 'My main financial dashboard',
          created_at: new Date().toISOString(),
          user_id: user.id,
          data: {
            income: 50000,
            expenses: 35000,
            investments: 15000,
            categories: {
              'Food': 8000,
              'Transportation': 5000,
              'Utilities': 3000,
              'Entertainment': 2000
            }
          }
        },
        {
          id: '2',
          name: 'Business Expenses',
          description: 'Track my business-related expenses',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user_id: user.id,
          data: {
            income: 25000,
            expenses: 18000,
            investments: 7000,
            categories: {
              'Office Supplies': 5000,
              'Marketing': 4000,
              'Travel': 3000,
              'Software': 2000
            }
          }
        }
      ];
      
      setDashboards(sampleDashboards);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = async () => {
    if (!newDashboard.name.trim() || !user) return;

    const dashboard: Dashboard = {
      id: Date.now().toString(),
      name: newDashboard.name,
      description: newDashboard.description,
      created_at: new Date().toISOString(),
      user_id: user.id,
      data: {
        income: 0,
        expenses: 0,
        investments: 0,
        categories: {}
      }
    };

    setDashboards([...dashboards, dashboard]);
    setNewDashboard({ name: '', description: '' });
    setShowCreateForm(false);
    toast.success('Dashboard created successfully!');
  };

  const deleteDashboard = async (id: string) => {
    setDashboards(dashboards.filter(d => d.id !== id));
    toast.success('Dashboard deleted successfully!');
  };

  const exportToPDF = (dashboard: Dashboard) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(dashboard.name, 20, 20);
    
    // Add description
    doc.setFontSize(12);
    doc.text(dashboard.description, 20, 35);
    
    // Add date
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Add financial summary
    doc.setFontSize(16);
    doc.text('Financial Summary:', 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Total Income: ₹${dashboard.data.income.toLocaleString()}`, 20, 80);
    doc.text(`Total Expenses: ₹${dashboard.data.expenses.toLocaleString()}`, 20, 90);
    doc.text(`Total Investments: ₹${dashboard.data.investments.toLocaleString()}`, 20, 100);
    doc.text(`Net Balance: ₹${(dashboard.data.income - dashboard.data.expenses).toLocaleString()}`, 20, 110);
    
    // Add expense categories
    if (Object.keys(dashboard.data.categories).length > 0) {
      doc.setFontSize(16);
      doc.text('Expense Categories:', 20, 130);
      
      const categoryData = Object.entries(dashboard.data.categories).map(([category, amount]) => [
        category,
        `₹${amount.toLocaleString()}`
      ]);
      
      (doc as any).autoTable({
        startY: 140,
        head: [['Category', 'Amount']],
        body: categoryData,
      });
    }
    
    doc.save(`${dashboard.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dashboard.pdf`);
    toast.success('PDF exported successfully!');
  };

  const exportToExcel = (dashboard: Dashboard) => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Metric', 'Amount'],
      ['Total Income', dashboard.data.income],
      ['Total Expenses', dashboard.data.expenses],
      ['Total Investments', dashboard.data.investments],
      ['Net Balance', dashboard.data.income - dashboard.data.expenses]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Categories sheet
    if (Object.keys(dashboard.data.categories).length > 0) {
      const categoryData = [
        ['Category', 'Amount'],
        ...Object.entries(dashboard.data.categories)
      ];
      
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');
    }
    
    XLSX.writeFile(workbook, `${dashboard.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dashboard.xlsx`);
    toast.success('Excel file exported successfully!');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8" />
              Multiple Dashboards
            </h1>
            <p className="text-muted-foreground">Create and manage multiple financial dashboards</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Dashboard</CardTitle>
              <CardDescription>Set up a new financial tracking dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Personal Finances, Business Expenses"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({...newDashboard, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this dashboard"
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({...newDashboard, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createDashboard}>
                  <Save className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map(dashboard => (
            <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {new Date(dashboard.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Income</p>
                    <p className="font-semibold text-green-600">₹{dashboard.data.income.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expenses</p>
                    <p className="font-semibold text-red-600">₹{dashboard.data.expenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Investments</p>
                    <p className="font-semibold text-blue-600">₹{dashboard.data.investments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className={`font-semibold ${dashboard.data.income - dashboard.data.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(dashboard.data.income - dashboard.data.expenses).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToPDF(dashboard)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToExcel(dashboard)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteDashboard(dashboard.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dashboards.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Dashboards Yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first dashboard to start tracking multiple sets of financial data
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}