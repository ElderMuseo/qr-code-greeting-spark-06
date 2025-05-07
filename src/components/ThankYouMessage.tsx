
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ThankYouMessageProps {
  name: string;
  onReset: () => void;
}

const ThankYouMessage = ({ name, onReset }: ThankYouMessageProps) => {
  const [counter, setCounter] = useState(10);

  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => {
      if (timer) clearInterval(timer);
      if (counter === 0) onReset();
    };
  }, [counter, onReset]);

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
      
      <h2 className="text-2xl font-bold text-gray-800">
        ¡Gracias, {name}!
      </h2>
      
      <p className="text-gray-600">
        Tu pregunta ha sido recibida. ¡Hedy la responderá pronto!
      </p>
      
      <div className="pt-4">
        <Button
          onClick={onReset}
          className="bg-brand-purple hover:bg-brand-dark-purple text-white py-6 px-8"
        >
          Hacer Otra Pregunta ({counter})
        </Button>
      </div>
    </motion.div>
  );
};

export default ThankYouMessage;
