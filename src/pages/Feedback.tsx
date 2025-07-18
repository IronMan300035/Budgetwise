import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Star, StarHalf } from "lucide-react";
import { toast } from "sonner";

export default function Feedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleStarHover = (hoveredStar: number) => {
    setHoveredRating(hoveredStar);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating before submitting");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Note: Feedback functionality requires a feedback table in the database
      // For now, we'll just show a success message and log the activity
      
      toast.success("Thank you for your feedback!");
      setRating(0);
      setReview("");
      
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          activity_type: 'feedback',
          description: `Submitted feedback with rating: ${rating}/5`
        });
      }
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`focus:outline-none transition-transform ${
            i <= displayRating 
              ? "text-yellow-400 transform scale-110" 
              : "text-gray-300 dark:text-gray-600"
          }`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          aria-label={`Rate ${i} out of 5 stars`}
        >
          <Star className="h-8 w-8 md:h-10 md:w-10 fill-current" />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gradient bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                We Value Your Feedback
              </CardTitle>
              <CardDescription className="text-lg">
                Help us improve by sharing your experience with BudgetWise
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-lg font-medium text-center">
                    How would you rate your experience?
                  </label>
                  <p className="text-center text-sm text-muted-foreground">
                    1 star is for lowest and 5 stars is for highest
                  </p>
                  
                  <div className="flex justify-center space-x-2">
                    {renderStars()}
                  </div>
                  
                  {rating > 0 && (
                    <p className="text-center text-sm font-medium mt-2">
                      You selected: {rating} star{rating !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="review" className="block font-medium">
                    Share your thoughts (optional)
                  </label>
                  <Textarea
                    id="review"
                    placeholder="Tell us what you liked or how we can improve..."
                    rows={5}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full resize-none"
                  />
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    disabled={submitting || rating === 0}
                    className="px-8 py-2 font-medium"
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
