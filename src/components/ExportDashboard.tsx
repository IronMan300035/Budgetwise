
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, FileText, Sheet, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExportDashboardProps {
  transactions: any[];
  financialSummary: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export function ExportDashboard({ transactions, financialSummary }: ExportDashboardProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [includeFilters, setIncludeFilters] = useState({
    summary: true,
    transactions: true,
    charts: true
  });
  const [dateRange, setDateRange] = useState<"all" | "current" | "last30" | "last90">("current");
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // In a real implementation, this would call backend APIs to generate the export
      // For this demo, we'll simulate a delay and then prepare a dummy file
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (exportFormat) {
        case "csv":
          exportCSV();
          break;
        case "excel":
          exportExcel();
          break;
        case "pdf":
          exportPDF();
          break;
      }
      
      toast.success(`Dashboard exported as ${exportFormat.toUpperCase()} successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export dashboard");
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "BudgetWise Dashboard Export - " + format(new Date(), "yyyy-MM-dd") + "\r\n\r\n";
    
    // Add financial summary if selected
    if (includeFilters.summary) {
      csvContent += "Financial Summary\r\n";
      csvContent += "Total Income,₹" + financialSummary.income + "\r\n";
      csvContent += "Total Expenses,₹" + financialSummary.expenses + "\r\n";
      csvContent += "Net Balance,₹" + financialSummary.balance + "\r\n\r\n";
    }
    
    // Add transactions if selected
    if (includeFilters.transactions && transactions.length > 0) {
      csvContent += "Transactions\r\n";
      csvContent += "Date,Type,Category,Description,Amount\r\n";
      
      transactions.forEach(transaction => {
        csvContent += `${transaction.transaction_date},`;
        csvContent += `${transaction.type},`;
        csvContent += `${transaction.category},`;
        csvContent += `${transaction.description || ""},`;
        csvContent += `₹${transaction.amount}\r\n`;
      });
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgetwise_export_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportExcel = () => {
    // In a real app, you would use a library like ExcelJS or SheetJS to create Excel files
    // For this demo, we'll just create a CSV and change the extension (not a real Excel file)
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "BudgetWise Dashboard Export - " + format(new Date(), "yyyy-MM-dd") + "\r\n\r\n";
    
    // Add financial summary if selected
    if (includeFilters.summary) {
      csvContent += "Financial Summary\r\n";
      csvContent += "Total Income,₹" + financialSummary.income + "\r\n";
      csvContent += "Total Expenses,₹" + financialSummary.expenses + "\r\n";
      csvContent += "Net Balance,₹" + financialSummary.balance + "\r\n\r\n";
    }
    
    // Add transactions if selected
    if (includeFilters.transactions && transactions.length > 0) {
      csvContent += "Transactions\r\n";
      csvContent += "Date,Type,Category,Description,Amount\r\n";
      
      transactions.forEach(transaction => {
        csvContent += `${transaction.transaction_date},`;
        csvContent += `${transaction.type},`;
        csvContent += `${transaction.category},`;
        csvContent += `${transaction.description || ""},`;
        csvContent += `₹${transaction.amount}\r\n`;
      });
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgetwise_export_${format(new Date(), "yyyyMMdd")}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportPDF = () => {
    // In a real app, you would use a library like jsPDF or call a backend PDF generation service
    // For this demo, we'll just show a toast message
    toast.info("PDF export would be implemented with a PDF generation library like jsPDF");
    
    // Simulate PDF download - in a real app, this would be real PDF data
    const pdfBlob = new Blob(["PDF export simulation"], { type: "application/pdf" });
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `budgetwise_export_${format(new Date(), "yyyyMMdd")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Dashboard</DialogTitle>
          <DialogDescription>
            Export your financial data in various formats for offline records
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup 
              defaultValue={exportFormat} 
              onValueChange={(value) => setExportFormat(value as "csv" | "excel" | "pdf")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-1 cursor-pointer">
                  <Sheet className="h-4 w-4" /> Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-1 cursor-pointer">
                  <FileText className="h-4 w-4" /> CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-1 cursor-pointer">
                  <FileDown className="h-4 w-4" /> PDF
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Include</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="summary" 
                  checked={includeFilters.summary}
                  onCheckedChange={(checked) => 
                    setIncludeFilters({...includeFilters, summary: checked as boolean})
                  }
                />
                <Label htmlFor="summary" className="cursor-pointer">Financial Summary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="transactions" 
                  checked={includeFilters.transactions}
                  onCheckedChange={(checked) => 
                    setIncludeFilters({...includeFilters, transactions: checked as boolean})
                  }
                />
                <Label htmlFor="transactions" className="cursor-pointer">Transactions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="charts" 
                  checked={includeFilters.charts}
                  onCheckedChange={(checked) => 
                    setIncludeFilters({...includeFilters, charts: checked as boolean})
                  }
                />
                <Label htmlFor="charts" className="cursor-pointer">Charts & Graphs</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Date Range</Label>
            <RadioGroup 
              defaultValue={dateRange} 
              onValueChange={(value) => setDateRange(value as "all" | "current" | "last30" | "last90")}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current" className="cursor-pointer">Current Month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">All Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last30" id="last30" />
                <Label htmlFor="last30" className="cursor-pointer">Last 30 Days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last90" id="last90" />
                <Label htmlFor="last90" className="cursor-pointer">Last 90 Days</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
