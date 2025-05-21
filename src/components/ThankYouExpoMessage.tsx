import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
interface ThankYouExpoMessageProps {
  onReset: () => void;
  disableNewQuestion?: boolean;
}
const ThankYouExpoMessage = ({
  onReset,
  disableNewQuestion = false
}: ThankYouExpoMessageProps) => {
  const [counter, setCounter] = useState(10);
  useEffect(() => {
    if (!disableNewQuestion) {
      const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      return () => {
        if (timer) clearInterval(timer);
        if (counter === 0) onReset();
      };
    }
  }, [counter, onReset, disableNewQuestion]);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="text-center space-y-6 w-full max-w-md">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground">
        ¡Gracias por tu pregunta!
      </h2>
      
      <p className="text-muted-foreground">
        Tu pregunta ha sido recibida. ¡Hedy la responderá durante la exposición!
      </p>
      
      <div className="space-y-3 pt-4">
        {!disableNewQuestion && <Button onClick={onReset} className="bg-primary hover:bg-brand-dark-purple text-white py-6 px-8 w-full">
            Hacer Otra Pregunta ({counter})
          </Button>}

        {disableNewQuestion && <p className="text-sm text-muted-foreground italic">Solo se permite una pregunta por persona.</p>}
      </div>
    </motion.div>;
};
export default ThankYouExpoMessage;