
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import QuestionForm from "@/components/QuestionForm";
import ThankYouMessage from "@/components/ThankYouMessage";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useQuestions } from "@/contexts/QuestionsContext";
import { v4 as uuidv4 } from "uuid";

const Questions = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const { addQuestion } = useQuestions();
  
  // Generate a device ID if it doesn't exist
  useEffect(() => {
    const deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      localStorage.setItem("device_id", uuidv4());
    }
    
    // Check if this device has already submitted a question
    const hasSubmitted = localStorage.getItem("question_submitted") === "true";
    setHasSubmittedBefore(hasSubmitted);
    
    if (hasSubmitted) {
      const savedName = localStorage.getItem("submitted_name") || "";
      setSubmittedName(savedName);
      setIsSubmitted(true);
    }
  }, []);
  
  const handleSubmit = async (name: string, question: string) => {
    console.log("Submitted data:", { name, question });
    
    try {
      const deviceId = localStorage.getItem("device_id") || uuidv4();
      
      // Send data using the context function
      await addQuestion(name, question);
      
      // Mark this device as having submitted a question
      localStorage.setItem("question_submitted", "true");
      localStorage.setItem("submitted_name", name);
      
      setIsSubmitted(true);
      setSubmittedName(name);
      setHasSubmittedBefore(true);
      
      toast({
        title: "Pregunta Enviada",
        description: "¡Gracias por tu pregunta!",
      });
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu pregunta. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  const handleReset = () => {
    // We won't allow resetting for new questions since we're limiting to one question per device
    // This is just for UI navigation if needed
    setIsSubmitted(true);
    setHasSubmittedBefore(true);
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
            <span className="text-brand-purple">Preguntale</span> a Hedy
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {hasSubmittedBefore 
              ? "Ya has enviado tu pregunta. ¡Gracias por tu participación!" 
              : "Comparte tus preguntas y Hedy las responderá durante el show."}
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
                <ThankYouMessage 
                  name={submittedName} 
                  onReset={handleReset} 
                  disableNewQuestion={true}
                />
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
