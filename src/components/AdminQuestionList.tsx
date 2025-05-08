
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuestions, Question, QuestionStatus } from "@/contexts/QuestionsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface AdminQuestionListProps {
  questions: Question[];
  emptyMessage: string;
}

const AdminQuestionList = ({ questions, emptyMessage }: AdminQuestionListProps) => {
  const { updateQuestionStatus } = useQuestions();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: QuestionStatus) => {
    setProcessingId(id);
    try {
      await updateQuestionStatus(id, status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {questions.length > 0 ? (
          questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              layout
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {question.name}
                      </h3>
                      <p className="mt-2 text-gray-700">{question.question}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(question.timestamp), { 
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  {question.status === "pending" && (
                    <>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={processingId === question.id}
                        onClick={() => handleStatusChange(question.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" /> Rechazar
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                        disabled={processingId === question.id}
                        onClick={() => handleStatusChange(question.id, "approved")}
                      >
                        <Check className="h-4 w-4 mr-1" /> Aprobar
                      </Button>
                    </>
                  )}
                  
                  {question.status === "approved" && (
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled={processingId === question.id}
                      onClick={() => handleStatusChange(question.id, "pending")}
                    >
                      Marcar como pendiente
                    </Button>
                  )}
                  
                  {question.status === "rejected" && (
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled={processingId === question.id}
                      onClick={() => handleStatusChange(question.id, "pending")}
                    >
                      Reconsiderar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500"
          >
            {emptyMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminQuestionList;
