
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface QuestionFormProps {
  onSubmit: (name: string, question: string) => void;
  disabled?: boolean;
}

const QuestionForm = ({ onSubmit, disabled = false }: QuestionFormProps) => {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [nameError, setNameError] = useState(false);
  const [questionError, setQuestionError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    
    if (!question.trim()) {
      setQuestionError(true);
      return;
    }

    // Reset errors
    setNameError(false);
    setQuestionError(false);
    
    // Submit the form
    onSubmit(name, question);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <label 
          htmlFor="name" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Tu Nombre
        </label>
        <Input
          id="name"
          placeholder="Escribe tu nombre"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError(false);
          }}
          className={`bg-white/70 backdrop-blur-sm border-2 ${nameError ? 'border-red-400' : 'border-brand-light-purple'} focus:border-brand-purple transition-colors`}
          disabled={disabled}
        />
        {nameError && (
          <p className="text-red-500 text-xs">Por favor, escribe tu nombre</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label 
          htmlFor="question" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Tu Pregunta
        </label>
        <Textarea
          id="question"
          placeholder="¿Qué quieres preguntar a Hedy?"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (e.target.value.trim()) setQuestionError(false);
          }}
          className={`min-h-28 bg-white/70 backdrop-blur-sm resize-none border-2 ${questionError ? 'border-red-400' : 'border-brand-light-purple'} focus:border-brand-purple transition-colors`}
          disabled={disabled}
        />
        {questionError && (
          <p className="text-red-500 text-xs">Por favor, escribe tu pregunta</p>
        )}
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-brand-purple hover:bg-brand-dark-purple text-white flex items-center justify-center gap-2 py-6 transition-all duration-300 shadow-md hover:shadow-lg"
        disabled={disabled}
      >
        <Send className="h-5 w-5" />
        <span>Enviar Pregunta</span>
      </Button>
    </form>
  );
};

export default QuestionForm;
