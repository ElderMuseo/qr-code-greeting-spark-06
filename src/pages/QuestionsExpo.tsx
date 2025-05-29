
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import QuestionFormExpo from "@/components/QuestionFormExpo";
import ThankYouExpoMessage from "@/components/ThankYouExpoMessage";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useQuestions } from "@/contexts/QuestionsContext";
import { v4 as uuidv4 } from "uuid";

const QuestionsExpo = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addQuestion } = useQuestions();

  useEffect(() => {
    const deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      localStorage.setItem("device_id", uuidv4());
    }

    const lastSubmissionDate = localStorage.getItem("last_submission_date_expo");
    const today = new Date().toISOString().split('T')[0];

    if (lastSubmissionDate === today) {
      setIsSubmitted(true);
      setHasSubmittedToday(true);
    } else {
      setIsSubmitted(false);
      setHasSubmittedToday(false);
    }
  }, []);

  const handleSubmit = async (question: string) => {
    setIsSubmitting(true);
    
    try {
      await addQuestion("Anónimo", question);

      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem("last_submission_date_expo", today);

      setIsSubmitted(true);
      setHasSubmittedToday(true);

      toast({
        title: "Pregunta enviada",
        description: "¡Gracias por tu pregunta!",
      });
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu pregunta. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-primary">Pregunta</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {hasSubmittedToday 
              ? "Ya has enviado tu pregunta hoy."
              : "Envía tu pregunta para la exposición, es completamente anónima."}
          </p>
        </motion.div>
        
        <div className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 shadow-lg bg-card">
              {!isSubmitted ? (
                <QuestionFormExpo 
                  onSubmit={handleSubmit} 
                  isSubmitting={isSubmitting}
                />
              ) : (
                <ThankYouExpoMessage onReset={handleReset} disableNewQuestion={hasSubmittedToday} />
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsExpo;
