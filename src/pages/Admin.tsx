// src/pages/Admin.tsx

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import AdminQuestionList from "@/components/AdminQuestionList";
import AdminHeader from "@/components/AdminHeader";
import { RefreshCcw, LogOut, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRaffle } from "@/contexts/RaffleContext";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

// Importamos la función de eliminación
import { executeDeleteScript } from "@/utils/scriptExecutor";

// Importamos las funciones para ejecutar scripts
import { runModerationScript, runOllamaResponseScript } from "@/utils/scriptRunner";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();
  const { startRaffle, isRaffleActive, isLoading: isRaffleLoading } = useRaffle();
  const navigate = useNavigate();

  // Estados locales para cada pestaña
  const [pendingQuestions, setPending] = useState<any[]>([]);
  const [approvedQuestions, setApproved] = useState<any[]>([]);
  const [rejectedQuestions, setRejected] = useState<any[]>([]);

  // Listener en tiempo real de Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const col = collection(db, "questions");

    const qPending = query(
      col,
      where("status", "==", "pending"),
      orderBy("timestamp", "desc")
    );
    const qApproved = query(
      col,
      where("status", "==", "approved"),
      orderBy("timestamp", "desc")
    );
    const qRejected = query(
      col,
      where("status", "==", "rejected"),
      orderBy("timestamp", "desc")
    );

    const unsubPending = onSnapshot(qPending, (snap) =>
      setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubApproved = onSnapshot(qApproved, (snap) =>
      setApproved(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubRejected = onSnapshot(qRejected, (snap) =>
      setRejected(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubPending();
      unsubApproved();
      unsubRejected();
    };
  }, [isAuthenticated]);

  const handleManualRefresh = () => {
    toast({
      title: "Actualizado",
      description: "Las preguntas se refrescaron automáticamente.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  const handleStartRaffle = async () => {
    try {
      await startRaffle();
      // Navigate to raffle page to see the result
      navigate("/sorteo");
    } catch (error) {
      console.error("Error starting raffle:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el sorteo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllQuestions = async () => {
    setIsDeleting(true);
    setDeleteStatus("Iniciando proceso de borrado...");
    try {
      // Ejecutar la función de borrado
      const result = await executeDeleteScript();
      
      if (result.success) {
        setDeleteStatus(null);
        toast({
          title: "Eliminación exitosa",
          description: `Se han eliminado ${result.deleted || 0} preguntas.`,
        });
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al eliminar preguntas:', error);
      setDeleteStatus(null);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar las preguntas: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModerate = async () => {
    setIsModerating(true);
    try {
      const result = await runModerationScript();
      toast({
        title: result.success ? "Moderación completada" : "Error en la moderación",
        description: result.output?.slice(0, 600) + (result.output?.length > 600 ? "..." : ""),
        variant: result.success ? "default" : "destructive",
      });
    } catch (e: any) {
      toast({
        title: "Error al ejecutar moderación.py",
        description: e?.message || String(e),
        variant: "destructive",
      });
    }
    setIsModerating(false);
  };

  const handleResponder = async () => {
    setIsResponding(true);
    try {
      const result = await runOllamaResponseScript();
      toast({
        title: result.success ? "Respuestas generadas" : "Error al generar respuestas",
        description: result.output?.slice(0, 600) + (result.output?.length > 600 ? "..." : ""),
        variant: result.success ? "default" : "destructive",
      });
    } catch (e: any) {
      toast({
        title: "Error al ejecutar ollama_response.py",
        description: e?.message || String(e),
        variant: "destructive",
      });
    }
    setIsResponding(false);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#344552] p-4">
      <div className="container max-w-6xl mx-auto">
        <AdminHeader />

        <Card className="mt-6 shadow-lg bg-[#263340] text-white border-[#055695] relative">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            {/* IZQUIERDA: TÍTULO + DESCRIPCIÓN + (Actualizar/Sorteo) */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold">
                Panel de Moderación
              </CardTitle>
              <CardDescription className="text-gray-300 mb-4">
                Aquí puedes revisar, aprobar o rechazar preguntas para el show de Hedy
              </CardDescription>
              {/* --- Actualizar y Sorteo debajo del título/descripción --- */}
              <div className="flex gap-2 flex-wrap mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-[#263340] text-white border-[#055695] hover:bg-[#055695]"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-[#263340] text-white border-[#055695] hover:bg-[#055695]"
                  onClick={handleStartRaffle}
                  disabled={isRaffleLoading || approvedQuestions.length === 0}
                >
                  <Award className="h-4 w-4" />
                  <span>Iniciar Sorteo</span>
                </Button>
              </div>
            </div>
            {/* DERECHA: Moderar y Responder (se quedan como están) */}
            <div className="flex flex-col gap-3 items-end min-w-[220px]">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleModerate}
                  disabled={isModerating}
                  variant="outline"
                  className="bg-blue-800 text-white border-[#055695] hover:bg-[#055695] whitespace-nowrap"
                >
                  {isModerating ? "Moderando..." : "Moderar"}
                </Button>
                <Button
                  onClick={handleResponder}
                  disabled={isResponding}
                  variant="outline"
                  className="bg-green-800 text-white border-[#055695] hover:bg-[#055695] whitespace-nowrap"
                >
                  {isResponding ? "Respondiendo..." : "Responder"}
                </Button>
              </div>
              {deleteStatus && (
                <div className="text-sm text-yellow-300 animate-pulse text-right">
                  {deleteStatus}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 min-w-0">
                {/* Pestañas y preguntas al centro */}
                <Tabs
                  defaultValue="pending"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md bg-[#263340]">
                    <TabsTrigger value="pending" className="relative data-[state=active]:bg-[#055695] text-white">
                      Pendientes
                      {pendingQuestions.length > 0 && (
                        <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#055695] text-[10px] text-white">
                          {pendingQuestions.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-[#055695] text-white">Aprobadas</TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-[#055695] text-white">Rechazadas</TabsTrigger>
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
              </div>
              {/* INFERIOR IZQUIERDA: Borrar todo y Cerrar sesión (debajo de las preguntas) */}
              {/* Esto es "sticky" si la vista es larga. Usamos min-w para layout. */}
            </div>
            <div className="flex flex-row mt-8">
              <div className="flex flex-col gap-2 min-w-[220px]">
                <Separator className="bg-[#055695]/30 mb-2" />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{isDeleting ? "Borrando..." : "Borrar todo"}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#263340] text-white border-[#055695]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Esta acción eliminará permanentemente todas las preguntas de la base de datos.
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#263340] text-white border-[#055695] hover:bg-[#344552]">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAllQuestions} 
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar todo"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
