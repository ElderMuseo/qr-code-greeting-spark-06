
// src/pages/Admin.tsx

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import AdminQuestionList from "@/components/AdminQuestionList";
import AdminHeader from "@/components/AdminHeader";
import { RefreshCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();

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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </Button>
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
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="pending"
              value={activeTab}
              onValueChange={setActiveTab}
            >
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
