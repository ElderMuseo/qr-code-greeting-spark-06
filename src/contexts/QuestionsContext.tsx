
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "@/hooks/use-toast";

export type QuestionStatus = "pending" | "approved" | "rejected";

export interface Question {
  id: string;
  name: string;
  question: string;
  status: QuestionStatus;
  timestamp: Timestamp;
  device_id?: string;
}

interface QuestionsContextType {
  questions: Question[];
  addQuestion: (name: string, question: string) => Promise<void>;
  updateQuestionStatus: (id: string, status: QuestionStatus) => Promise<void>;
  getPendingQuestions: () => Question[];
  getApprovedQuestions: () => Question[];
  getRejectedQuestions: () => Question[];
  getAllQuestions: () => Question[];
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(
  undefined
);

export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  // Listener en tiempo real de toda la colección
  useEffect(() => {
    const col = collection(db, "questions");
    const q = query(col, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          question: data.question,
          status: data.status as QuestionStatus,
          timestamp: data.timestamp as Timestamp,
          device_id: data.device_id,
        };
      });
      setQuestions(docs);
    });

    return () => unsubscribe();
  }, []);

  // Añade una pregunta a Firestore
  const addQuestion = async (name: string, question: string) => {
    const col = collection(db, "questions");
    const deviceId = localStorage.getItem("device_id");
    
    await addDoc(col, {
      name,
      question,
      status: "pending",
      timestamp: serverTimestamp(),
      device_id: deviceId
    });
    
    toast({
      title: "Pregunta enviada",
      description: "Tu pregunta ha sido recibida. Gracias.",
    });
  };

  // Actualiza el campo `status` de un documento
  const updateQuestionStatus = async (id: string, status: QuestionStatus) => {
    const ref = doc(db, "questions", id);
    await updateDoc(ref, {
      status,
      processedAt: serverTimestamp(),
    });
    const statusMessage = {
      approved: "Pregunta aprobada",
      rejected: "Pregunta rechazada",
      pending: "Pregunta marcada como pendiente",
    } as const;
    toast({
      title: statusMessage[status],
      description:
        status === "approved"
          ? "La pregunta ha sido aprobada."
          : status === "rejected"
          ? "La pregunta ha sido rechazada."
          : "La pregunta ha vuelto a pendiente.",
    });
  };

  // Getters que filtran en cliente según status
  const getPendingQuestions = () =>
    questions.filter((q) => q.status === "pending");
  const getApprovedQuestions = () =>
    questions.filter((q) => q.status === "approved");
  const getRejectedQuestions = () =>
    questions.filter((q) => q.status === "rejected");
  const getAllQuestions = () => questions;

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        addQuestion,
        updateQuestionStatus,
        getPendingQuestions,
        getApprovedQuestions,
        getRejectedQuestions,
        getAllQuestions,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const ctx = useContext(QuestionsContext);
  if (!ctx) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return ctx;
};
