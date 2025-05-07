
import { useState } from "react";
import { Card } from "@/components/ui/card";
import QuestionForm from "@/components/QuestionForm";
import ThankYouMessage from "@/components/ThankYouMessage";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Questions = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  
  const handleSubmit = (name: string, question: string) => {
    console.log("Submitted data:", { name, question });
    
    // Simulate sending data
    setTimeout(() => {
      setIsSubmitted(true);
      setSubmittedName(name);
      toast({
        title: "Pregunta Enviada",
        description: "¡Gracias por tu pregunta!",
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
        <Link to="/" className="inline-flex items-center text-brand-purple mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            <span className="text-brand-purple">Preguntale</span> a Hedy
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Comparte tus preguntas y Hedy las responderá durante el show.
          </p>
        </motion.div>
        
        <div className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 shadow-lg bg-white/90 backdrop-blur-sm">
              {!isSubmitted ? (
                <QuestionForm onSubmit={handleSubmit} />
              ) : (
                <ThankYouMessage name={submittedName} onReset={handleReset} />
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
