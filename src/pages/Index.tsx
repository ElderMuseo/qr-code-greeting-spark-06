
import { motion } from "framer-motion";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const Index = () => {
  return (
    <div className="min-h-screen bg-black px-4 py-16 sm:px-6 flex flex-col items-center justify-center">
      <div className="container max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            <span className="text-primary">Pregúntale</span> a la Casa
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-2xl">
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
