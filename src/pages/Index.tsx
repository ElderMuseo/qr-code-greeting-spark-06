
import { useState } from "react";
import { Card } from "@/components/ui/card";
import QuestionForm from "@/components/QuestionForm";
import ThankYouMessage from "@/components/ThankYouMessage";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  
  const handleSubmit = (name: string, question: string) => {
    console.log("Submitted data:", { name, question });
    
    // Simulate sending data
    setTimeout(() => {
      setIsSubmitted(true);
      setSubmittedName(name);
      toast({
        title: "Question Submitted",
        description: "Thank you for your question!",
      });
    }, 1000);
  };
  
  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedName("");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light-purple/50 to-white px-4 py-10 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            <span className="text-brand-purple">Ask</span> Us Anything
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Share your questions and we'll get back to you as soon as possible.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Card className="p-6 shadow-lg bg-white/90 backdrop-blur-sm w-full">
              {!isSubmitted ? (
                <QuestionForm onSubmit={handleSubmit} />
              ) : (
                <ThankYouMessage name={submittedName} onReset={handleReset} />
              )}
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center md:justify-start items-start"
          >
            <QRCodeDisplay />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
