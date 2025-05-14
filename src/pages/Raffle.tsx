
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowLeft } from "lucide-react";
import { useRaffle } from "@/contexts/RaffleContext";
import { toast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const Raffle = () => {
  const navigate = useNavigate();
  const { checkIfWinner, isRaffleActive } = useRaffle();
  const { isAuthenticated } = useAdminAuth();
  const [isWinner, setIsWinner] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // When component mounts, check if the current user is a winner
  useEffect(() => {
    const checkWinnerStatus = async () => {
      try {
        // Get device ID from localStorage
        const deviceId = localStorage.getItem("device_id");
        
        // If no device ID, they're not eligible unless they're an admin
        if (!deviceId && !isAuthenticated) {
          navigate("/");
          return;
        }

        // Admin can always see this page
        if (isAuthenticated) {
          setIsWinner(true);
          setIsChecking(false);
          return;
        }

        // Check if the user is a winner
        const winner = await checkIfWinner(deviceId || "");
        if (winner) {
          setIsWinner(true);
          toast({
            title: "¡Felicidades!",
            description: "Has ganado el sorteo.",
          });
        } else {
          // Not a winner, show raffle not started or not a winner
          setIsWinner(false);
        }
      } catch (error) {
        console.error("Error checking winner status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWinnerStatus();
  }, [checkIfWinner, navigate, isAuthenticated]);

  // If checking, show loading
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Resultado del <span className="text-primary">Sorteo</span>
          </h1>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 shadow-lg bg-card text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="h-12 w-12 text-primary" />
                </div>
              </div>

              {!isRaffleActive ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Sorteo no iniciado
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    El sorteo aún no ha sido iniciado. Vuelve más tarde para ver si has ganado.
                  </p>
                </>
              ) : isWinner ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    ¡Felicidades!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Has ganado el sorteo. Acércate al mostrador para reclamar tu premio.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Lo sentimos
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    No has ganado el sorteo esta vez. ¡Gracias por participar!
                  </p>
                </>
              )}

              {isAuthenticated && (
                <div className="p-4 bg-muted rounded-md mb-6 text-left">
                  <h3 className="font-medium mb-2">Panel de administrador</h3>
                  <p className="text-sm text-muted-foreground">
                    Los participantes pueden acceder a esta página a través del botón 
                    "¿Gané el sorteo?" después de enviar una pregunta.
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => navigate("/preguntas")}
              >
                Volver al inicio
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Raffle;
