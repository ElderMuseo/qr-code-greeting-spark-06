
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuestions, Question, QuestionStatus } from "@/contexts/QuestionsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check, X, RefreshCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AdminQuestionListProps {
  questions: Question[];
  emptyMessage: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const AdminQuestionList = ({ 
  questions, 
  emptyMessage, 
  isLoading = false, 
  error = null,
  onRefresh 
}: AdminQuestionListProps) => {
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

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error}</p>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              className="self-start flex items-center gap-1"
              onClick={onRefresh}
            >
              <RefreshCcw className="h-4 w-4 mr-1" /> Intentar nuevamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

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
