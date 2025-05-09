
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuestions } from "@/contexts/QuestionsContext";
import AdminQuestionList from "@/components/AdminQuestionList";
import AdminHeader from "@/components/AdminHeader";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    getPendingQuestions, 
    getApprovedQuestions, 
    getRejectedQuestions,
    refreshQuestions,
    loading,
    error
  } = useQuestions();

  const pendingQuestions = getPendingQuestions();
  const approvedQuestions = getApprovedQuestions();
  const rejectedQuestions = getRejectedQuestions();

  // Auto refresh questions every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshQuestions();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [refreshQuestions]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshQuestions();
    toast({
      title: "Actualizado",
      description: "Las preguntas han sido actualizadas."
    });
    setTimeout(() => setIsRefreshing(false), 600);
  };

  let emptyMessage = "No hay preguntas pendientes.";
  if (error) {
    emptyMessage = "No se pudieron cargar las preguntas. Por favor, inténtalo de nuevo más tarde.";
  } else if (loading) {
    emptyMessage = "Cargando preguntas...";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light-purple/30 to-white p-4">
      <div className="container max-w-6xl mx-auto">
        <AdminHeader />
        
        <Card className="mt-6 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Panel de Moderación</CardTitle>
              <CardDescription>
                Aquí puedes revisar, aprobar o rechazar preguntas para el show de Hedy
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleManualRefresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="pending" className="relative">
                  Pendientes
                  {pendingQuestions.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-[10px] text-white">
                      {pendingQuestions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Aprobadas</TabsTrigger>
                <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                <AdminQuestionList 
                  questions={pendingQuestions}
                  emptyMessage={emptyMessage}
                  isLoading={loading}
                  error={error}
                  onRefresh={handleManualRefresh}
                />
              </TabsContent>
              
              <TabsContent value="approved">
                <AdminQuestionList 
                  questions={approvedQuestions}
                  emptyMessage={error ? emptyMessage : "No hay preguntas aprobadas."}
                  isLoading={loading}
                  error={error}
                  onRefresh={handleManualRefresh}
                />
              </TabsContent>
              
              <TabsContent value="rejected">
                <AdminQuestionList 
                  questions={rejectedQuestions}
                  emptyMessage={error ? emptyMessage : "No hay preguntas rechazadas."}
                  isLoading={loading}
                  error={error}
                  onRefresh={handleManualRefresh}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
