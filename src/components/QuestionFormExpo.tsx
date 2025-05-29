
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { ButtonLoadingSpinner } from "@/components/LoadingStates";

interface QuestionFormExpoProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

const QuestionFormExpo = ({ onSubmit, disabled = false, isSubmitting = false }: QuestionFormExpoProps) => {
  const [question, setQuestion] = useState("");
  const [questionError, setQuestionError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setQuestionError(true);
      return;
    }
    setQuestionError(false);
    onSubmit(question);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 w-full max-w-md"
      animate={isSubmitting ? { opacity: 0.7 } : { opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-2">
        <label 
          htmlFor="question" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Tu Pregunta
        </label>
        <Textarea
          id="question"
          placeholder="Escribe aquí tu pregunta"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (e.target.value.trim()) setQuestionError(false);
          }}
          className={`min-h-28 bg-secondary resize-none border-2 ${questionError ? 'border-red-400' : 'border-primary'} focus:border-primary transition-colors`}
          disabled={disabled || isSubmitting}
        />
        {questionError && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs"
          >
            Por favor, escribe tu pregunta
          </motion.p>
        )}
      </div>
      <Button 
        type="submit"
        className="w-full bg-primary hover:bg-brand-dark-purple text-white flex items-center justify-center gap-2 py-6 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <ButtonLoadingSpinner />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Enviar Pregunta</span>
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default QuestionFormExpo;
