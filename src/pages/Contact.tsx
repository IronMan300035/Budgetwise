
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Your message has been sent! We'll get back to you soon.");
    
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
              <p className="text-lg mb-8">
                Have questions about BudgetWise? Want to know more about our features or pricing? We'd love to hear from you. Fill out the form, and our team will get back to you as soon as possible.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">support@budgetwise.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+91 8527278310</p>
                    <p className="text-muted-foreground">+91 8447379189</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <p className="text-muted-foreground">
                      Delhi, India - 110034<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What's this regarding?"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you?"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Is my financial data secure?</h3>
                <p className="text-muted-foreground">
                  Yes, we use bank-level encryption and security measures to ensure your data remains private and protected. We never store your bank credentials.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-muted-foreground">
                  Absolutely! You can cancel your subscription at any time from your account settings. There are no cancellation fees or hidden charges.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Does BudgetWise support all banks?</h3>
                <p className="text-muted-foreground">
                  We support over 10,000 financial institutions across the US, Canada, and Europe. If yours isn't listed, contact us and we'll work to add it.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I get help with using BudgetWise?</h3>
                <p className="text-muted-foreground">
                  We offer live chat support, detailed help documentation, and video tutorials. You can also contact us via this page for personalized assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
