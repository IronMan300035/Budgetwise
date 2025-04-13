
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="prose prose-lg dark:prose-invert">
            <p>Last Updated: April 3, 2025</p>
            
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the BudgetWise website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            
            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on BudgetWise's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained on BudgetWise's website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
            
            <h2>Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </p>
            
            <h2>Financial Information and Third-Party Services</h2>
            <p>
              Our service may allow you to connect your financial accounts. By doing so, you authorize BudgetWise to access and store your financial information. BudgetWise does not review this information for accuracy and is not responsible for the products and services offered by third-party financial institutions.
            </p>
            
            <h2>Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            
            <h2>Changes to Terms</h2>
            <p>
              BudgetWise reserves the right to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at support@budgetwise.com
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
