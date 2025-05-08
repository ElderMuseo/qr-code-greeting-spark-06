
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

// This is a mock implementation that would be replaced with real backend integration
export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    // Try to load from localStorage for persistence between refreshes
    const savedQuestions = localStorage.getItem('questions');
    return savedQuestions ? JSON.parse(savedQuestions) : [
      {
        id: '1',
        name: 'Ana García',
        question: '¿Cómo empezaste tu carrera en tecnología?',
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Miguel Rodríguez',
        question: '¿Qué consejo le darías a alguien que recién comienza en este campo?',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Laura Martínez',
        question: '¿Cuál ha sido el mayor desafío en tu carrera?',
        status: 'pending',
        timestamp: new Date().toISOString(),
      }
    ];
  });

  // Save to localStorage whenever questions change
  useEffect(() => {
    localStorage.setItem('questions', JSON.stringify(questions));
  }, [questions]);

  const addQuestion = async (name: string, question: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
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
        getAllQuestions
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
