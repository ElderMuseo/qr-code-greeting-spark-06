
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface QuestionFormProps {
  onSubmit: (name: string, question: string) => void;
}

const QuestionForm = ({ onSubmit }: QuestionFormProps) => {
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
          Your Name
        </label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError(false);
          }}
          className={`bg-white/70 backdrop-blur-sm border-2 ${nameError ? 'border-red-400' : 'border-brand-light-purple'} focus:border-brand-purple transition-colors`}
        />
        {nameError && (
          <p className="text-red-500 text-xs">Please enter your name</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label 
          htmlFor="question" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Your Question
        </label>
        <Textarea
          id="question"
          placeholder="What would you like to ask?"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (e.target.value.trim()) setQuestionError(false);
          }}
          className={`min-h-28 bg-white/70 backdrop-blur-sm resize-none border-2 ${questionError ? 'border-red-400' : 'border-brand-light-purple'} focus:border-brand-purple transition-colors`}
        />
        {questionError && (
          <p className="text-red-500 text-xs">Please enter your question</p>
        )}
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-brand-purple hover:bg-brand-dark-purple text-white flex items-center justify-center gap-2 py-6 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <Send className="h-5 w-5" />
        <span>Submit Question</span>
      </Button>
    </form>
  );
};

export default QuestionForm;
