
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg dark:prose-invert">
            <p>Last Updated: April 3, 2023</p>
            
            <h2>Introduction</h2>
            <p>
              At BudgetWise, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            
            <h2>Information We Collect</h2>
            <p>We may collect information about you in a variety of ways:</p>
            <ul>
              <li><strong>Personal Data:</strong> Voluntarily provided information which may include your name, email address, and phone number.</li>
              <li><strong>Financial Information:</strong> Information related to your financial accounts, transactions, and spending habits.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access our platform, such as your IP address and browser type.</li>
            </ul>
            
            <h2>Use of Your Information</h2>
            <p>We may use the information we collect about you to:</p>
            <ul>
              <li>Provide, operate, and maintain our services</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our services</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you for customer service, updates, and marketing purposes</li>
              <li>Process transactions and send related information</li>
              <li>Prevent fraudulent transactions and monitor against theft</li>
            </ul>
            
            <h2>Disclosure of Your Information</h2>
            <p>We may share information we have collected about you in certain situations:</p>
            <ul>
              <li><strong>Compliance with Laws:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong>Business Transfers:</strong> In connection with, or during negotiations of, any merger or acquisition.</li>
              <li><strong>Third-Party Service Providers:</strong> With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
            </ul>
            
            <h2>Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at support@budgetwise.com.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
