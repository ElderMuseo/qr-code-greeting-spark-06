
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

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
  loading: boolean;
  error: string | null;
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

export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from Supabase
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load questions',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        // Transform Supabase data to match our Question interface
        const formattedQuestions = data.map(item => ({
          id: item.id,
          name: item.name,
          question: item.question,
          status: item.status as QuestionStatus,
          timestamp: new Date(item.timestamp),
        }));
        setQuestions(formattedQuestions);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load questions on initial render
  useEffect(() => {
    fetchQuestions();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:questions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'questions' 
        }, 
        () => {
          fetchQuestions();
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to real-time changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQuestions]);

  const addQuestion = async (name: string, question: string) => {
    const deviceId = getDeviceId();
    
    try {
      const { error } = await supabase
        .from('questions')
        .insert([
          {
            name,
            question,
            status: 'pending',
            device_id: deviceId,
          }
        ]);

      if (error) {
        console.error('Error adding question:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit your question',
          variant: 'destructive',
        });
        return;
      }

      // Refresh questions after adding
      fetchQuestions();
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const updateQuestionStatus = async (id: string, status: QuestionStatus) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating question status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update question status',
          variant: 'destructive',
        });
        return;
      }

      // Refresh questions after updating
      fetchQuestions();
      
      const statusMessage = {
        approved: 'Pregunta aprobada',
        rejected: 'Pregunta rechazada',
        pending: 'Pregunta marcada como pendiente'
      };
      
      toast({
        title: statusMessage[status],
        description: `La pregunta ha sido ${status === 'approved' ? 'aprobada' : status === 'rejected' ? 'rechazada' : 'marcada como pendiente'}.`
      });
      
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  // Function to refresh questions from Supabase
  const refreshQuestions = useCallback(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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
        refreshQuestions,
        loading,
        error
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
