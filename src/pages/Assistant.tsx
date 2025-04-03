
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";
import { MessageSquare, Mic } from "lucide-react";

export default function Assistant() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
          
          <div className="mb-8">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="chat" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat Assistant
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center">
                  <Mic className="h-4 w-4 mr-2" /> Voice Commands
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat">
                <div className="grid grid-cols-1 gap-6">
                  <AIChatbot />
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Sample Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded-md hover:bg-muted/80 cursor-pointer">
                        How can I create a budget?
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md hover:bg-muted/80 cursor-pointer">
                        What's the difference between stocks and bonds?
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md hover:bg-muted/80 cursor-pointer">
                        How much should I save for retirement?
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md hover:bg-muted/80 cursor-pointer">
                        What's a good savings rate?
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="voice">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="p-6 text-center">
                    <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Mic className="h-10 w-10" />
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">Voice Assistant</h3>
                    <p className="text-muted-foreground mb-6">
                      Click the microphone and speak your financial questions
                    </p>
                    
                    <div className="max-w-md mx-auto">
                      <h4 className="font-medium mb-2">Try saying:</h4>
                      <ul className="space-y-2 text-left">
                        <li className="bg-muted/50 p-2 rounded-md">"Show me my monthly spending"</li>
                        <li className="bg-muted/50 p-2 rounded-md">"How much did I spend on groceries this month?"</li>
                        <li className="bg-muted/50 p-2 rounded-md">"What's my savings rate?"</li>
                        <li className="bg-muted/50 p-2 rounded-md">"How are my investments performing?"</li>
                      </ul>
                    </div>
                  </Card>
                  
                  <AIChatbot />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
