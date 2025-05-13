
import { motion } from "framer-motion";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const Index = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 flex flex-col items-center justify-center">
      <div className="container max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-primary">Preguntale</span> a Hedy
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Escanea el código QR para hacer tus preguntas.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <QRCodeDisplay />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
