
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export interface Question {
  id: string;
  name: string;
  question: string;
  status: QuestionStatus;
  timestamp: Date;
}

interface QuestionsContextType {
  questions: Question[];
  addQuestion: (name: string, question: string) => Promise<void>;
  updateQuestionStatus: (id: string, status: QuestionStatus) => Promise<void>;
  getPendingQuestions: () => Question[];
  getApprovedQuestions: () => Question[];
  getRejectedQuestions: () => Question[];
  getAllQuestions: () => Question[];
  refreshQuestions: () => void;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

// Generate a unique device ID to identify submissions from different devices
const getDeviceId = () => {
  let deviceId = sessionStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// This is a mock implementation that would be replaced with real backend integration
export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const savedQuestions = localStorage.getItem('questions');
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  });
  

  // Save to localStorage whenever questions change
  useEffect(() => {
    localStorage.setItem('questions', JSON.stringify(questions));
  }, [questions]);

  const addQuestion = async (name: string, question: string) => {
    const deviceId = getDeviceId();
    const newQuestion: Question = {
      id: `${deviceId}_${Date.now().toString()}`,
      name,
      question,
      status: 'pending',
      timestamp: new Date(),
    };
    
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    console.log('Question added:', newQuestion);
    return Promise.resolve();
  };

  const updateQuestionStatus = async (id: string, status: QuestionStatus) => {
    setQuestions((prevQuestions) => 
      prevQuestions.map((q) => 
        q.id === id ? { ...q, status } : q
      )
    );
    
    const statusMessage = {
      approved: 'Pregunta aprobada',
      rejected: 'Pregunta rechazada',
      pending: 'Pregunta marcada como pendiente'
    };
    
    toast({
      title: statusMessage[status],
      description: `La pregunta ha sido ${status === 'approved' ? 'aprobada' : status === 'rejected' ? 'rechazada' : 'marcada como pendiente'}.`
    });
    
    return Promise.resolve();
  };

  // Function to refresh questions from localStorage
  const refreshQuestions = useCallback(() => {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  const getPendingQuestions = () => questions.filter((q) => q.status === 'pending');
  const getApprovedQuestions = () => questions.filter((q) => q.status === 'approved');
  const getRejectedQuestions = () => questions.filter((q) => q.status === 'rejected');
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
        refreshQuestions
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
};
