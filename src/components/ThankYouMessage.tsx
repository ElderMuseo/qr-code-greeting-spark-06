
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ThankYouMessageProps {
  name: string;
  onReset: () => void;
  disableNewQuestion?: boolean;
}

const ThankYouMessage = ({ name, onReset, disableNewQuestion = false }: ThankYouMessageProps) => {
  const [counter, setCounter] = useState(10);

  useEffect(() => {
    // Only start the counter if we're not disabling new questions
    if (!disableNewQuestion) {
      const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      return () => {
        if (timer) clearInterval(timer);
        if (counter === 0) onReset();
      };
    }
  }, [counter, onReset, disableNewQuestion]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 w-full max-w-md"
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground">
        ¡Gracias, {name}!
      </h2>
      
      <p className="text-muted-foreground">
        Tu pregunta ha sido recibida. ¡Hedy la responderá pronto!
      </p>
      
      {!disableNewQuestion && (
        <div className="pt-4">
          <Button
            onClick={onReset}
            className="bg-primary hover:bg-brand-dark-purple text-white py-6 px-8"
          >
            Hacer Otra Pregunta ({counter})
          </Button>
        </div>
      )}

      {disableNewQuestion && (
        <div className="pt-4">
          <p className="text-sm text-muted-foreground italic">
            Solo se permite una pregunta por día. Vuelve mañana para hacer otra pregunta.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ThankYouMessage;
