import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRaffle } from "@/contexts/RaffleContext";
interface ThankYouMessageProps {
  name: string;
  onReset: () => void;
  disableNewQuestion?: boolean;
}
const ThankYouMessage = ({
  name,
  onReset,
  disableNewQuestion = false
}: ThankYouMessageProps) => {
  const [counter, setCounter] = useState(10);
  const navigate = useNavigate();
  const {
    isRaffleActive
  } = useRaffle();
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
  const handleCheckRaffle = () => {
    navigate("/sorteo");
  };
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
        ¡Gracias, {name}!
      </h2>
      
      <p className="text-muted-foreground">
        Tu pregunta ha sido recibida. ¡Hedy la responderá pronto!
      </p>
      
      <div className="space-y-3 pt-4">
        {!disableNewQuestion && <Button onClick={onReset} className="bg-primary hover:bg-brand-dark-purple text-white py-6 px-8 w-full">
            Hacer Otra Pregunta ({counter})
          </Button>}

        {disableNewQuestion && <Button onClick={handleCheckRaffle} className="bg-amber-600 hover:bg-amber-700 text-white py-6 px-8 w-full flex items-center justify-center gap-2">
            <Award className="h-5 w-5" />
            ¿Gané el sorteo?
          </Button>}

        {disableNewQuestion && <p className="text-sm text-muted-foreground italic">Solo se permite una pregunta por día.</p>}
      </div>
    </motion.div>;
};
export default ThankYouMessage;