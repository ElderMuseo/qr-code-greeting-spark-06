
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

interface RaffleContextType {
  startRaffle: () => Promise<void>;
  checkIfWinner: (deviceId: string) => Promise<boolean>;
  winner: string | null;
  isRaffleActive: boolean;
  isLoading: boolean;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export const RaffleProvider = ({ children }: { children: ReactNode }) => {
  const [winner, setWinner] = useState<string | null>(null);
  const [isRaffleActive, setIsRaffleActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if there's an active raffle when the component mounts
  useEffect(() => {
    const checkRaffleStatus = async () => {
      try {
        const raffleDoc = await getDoc(doc(db, "raffles", "current"));
        if (raffleDoc.exists()) {
          const data = raffleDoc.data();
          setWinner(data.winner || null);
          setIsRaffleActive(data.active || false);
        } else {
          // Create the document if it doesn't exist
          await setDoc(doc(db, "raffles", "current"), {
            active: false,
            winner: null,
            timestamp: Timestamp.now(),
          });
          setIsRaffleActive(false);
          setWinner(null);
        }
      } catch (error) {
        console.error("Error checking raffle status:", error);
        toast({
          title: "Error",
          description: "No se pudo verificar el estado del sorteo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkRaffleStatus();
  }, []);

  // Start a new raffle
  const startRaffle = async () => {
    setIsLoading(true);
    try {
      // Get all approved questions
      const q = query(
        collection(db, "questions"),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "No hay preguntas aprobadas",
          description: "No hay participantes para el sorteo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Extract all device IDs from approved questions
      const approvedQuestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        deviceId: doc.data().device_id,
      }));

      // Filter out questions without device IDs and get unique device IDs
      const deviceIds = [
        ...new Set(
          approvedQuestions
            .filter((q) => q.deviceId)
            .map((q) => q.deviceId)
        ),
      ];

      if (deviceIds.length === 0) {
        toast({
          title: "No hay participantes válidos",
          description: "No hay dispositivos registrados para el sorteo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Select a random winner
      const randomIndex = Math.floor(Math.random() * deviceIds.length);
      const winnerDeviceId = deviceIds[randomIndex];

      // Update the raffle document
      await updateDoc(doc(db, "raffles", "current"), {
        active: true,
        winner: winnerDeviceId,
        timestamp: Timestamp.now(),
      });

      setWinner(winnerDeviceId);
      setIsRaffleActive(true);

      toast({
        title: "¡Sorteo iniciado!",
        description: `Se ha seleccionado un ganador entre ${deviceIds.length} participantes.`,
      });
    } catch (error) {
      console.error("Error starting raffle:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el sorteo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a user is the winner
  const checkIfWinner = async (deviceId: string): Promise<boolean> => {
    if (!deviceId) return false;
    
    try {
      const raffleDoc = await getDoc(doc(db, "raffles", "current"));
      if (raffleDoc.exists()) {
        const data = raffleDoc.data();
        return data.active && data.winner === deviceId;
      }
      return false;
    } catch (error) {
      console.error("Error checking winner status:", error);
      return false;
    }
  };

  return (
    <RaffleContext.Provider
      value={{
        startRaffle,
        checkIfWinner,
        winner,
        isRaffleActive,
        isLoading,
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

export const useRaffle = () => {
  const context = useContext(RaffleContext);
  if (!context) {
    throw new Error("useRaffle must be used within a RaffleProvider");
  }
  return context;
};
