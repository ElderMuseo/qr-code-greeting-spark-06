
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuestions } from "@/contexts/QuestionsContext";
import AdminQuestionList from "@/components/AdminQuestionList";
import AdminHeader from "@/components/AdminHeader";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { 
    getPendingQuestions, 
    getApprovedQuestions, 
    getRejectedQuestions 
  } = useQuestions();

  const pendingQuestions = getPendingQuestions();
  const approvedQuestions = getApprovedQuestions();
  const rejectedQuestions = getRejectedQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light-purple/30 to-white p-4">
      <div className="container max-w-6xl mx-auto">
        <AdminHeader />
        
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Panel de Moderación</CardTitle>
            <CardDescription>
              Aquí puedes revisar, aprobar o rechazar preguntas para el show de Hedy
            </CardDescription>
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
                  emptyMessage="No hay preguntas pendientes."
                />
              </TabsContent>
              
              <TabsContent value="approved">
                <AdminQuestionList 
                  questions={approvedQuestions}
                  emptyMessage="No hay preguntas aprobadas."
                />
              </TabsContent>
              
              <TabsContent value="rejected">
                <AdminQuestionList 
                  questions={rejectedQuestions}
                  emptyMessage="No hay preguntas rechazadas."
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
