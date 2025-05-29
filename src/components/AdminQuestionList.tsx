
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuestions, Question, QuestionStatus } from "@/contexts/QuestionsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { QuestionListSkeleton, ButtonLoadingSpinner } from "@/components/LoadingStates";

interface AdminQuestionListProps {
  questions: Question[];
  emptyMessage: string;
  isLoading?: boolean;
}

// Helper para convertir Firestore Timestamp o Date a Date de JS
const getDate = (ts: unknown): Date => {
  if (ts instanceof Date) return ts;
  if (ts && typeof ts === "object" && "toDate" in ts && typeof (ts as any).toDate === "function") {
    return (ts as any).toDate();
  }
  return new Date(); // fallback
};

const AdminQuestionList = ({ questions, emptyMessage, isLoading = false }: AdminQuestionListProps) => {
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

  if (isLoading) {
    return <QuestionListSkeleton count={3} />;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {questions.length > 0 ? (
          questions.map((question) => {
            const date = getDate(question.timestamp);
            const ago = formatDistanceToNow(date, { addSuffix: true, locale: es });
            const isProcessing = processingId === question.id;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
                transition={{ duration: 0.2 }}
              >
                <Card className={`bg-white/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 ${isProcessing ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <motion.h3 
                          className="font-semibold text-gray-800"
                          animate={isProcessing ? { opacity: [1, 0.7, 1] } : {}}
                          transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
                        >
                          {question.name}
                        </motion.h3>
                        <p className="mt-2 text-gray-700">{question.question}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {ago}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2 border-t pt-4">
                    {question.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(question.id, "rejected")}
                        >
                          {isProcessing ? (
                            <ButtonLoadingSpinner />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" /> Rechazar
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(question.id, "approved")}
                        >
                          {isProcessing ? (
                            <ButtonLoadingSpinner />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Aprobar
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    {question.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-all duration-200"
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(question.id, "pending")}
                      >
                        {isProcessing ? (
                          <ButtonLoadingSpinner />
                        ) : (
                          "Marcar como pendiente"
                        )}
                      </Button>
                    )}

                    {question.status === "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-all duration-200"
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(question.id, "pending")}
                      >
                        {isProcessing ? (
                          <ButtonLoadingSpinner />
                        ) : (
                          "Reconsiderar"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })
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
