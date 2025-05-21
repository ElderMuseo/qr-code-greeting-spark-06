
import { useQuestions } from "@/contexts/QuestionsContext";
import { Card } from "@/components/ui/card";
import React from "react";

const Respuestas = () => {
  const { questions } = useQuestions();

  return (
    <div className="min-h-screen bg-background py-10 px-3">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Preguntas de la Exposición
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Aquí aparecen todas las preguntas recibidas. Se irán respondiendo una por una durante la exposición.
        </p>
        <div className="space-y-6">
          {questions.length === 0 && (
            <div className="text-center text-secondary-foreground py-12">No hay preguntas todavía.</div>
          )}
          {questions.map((q) => (
            <Card key={q.id} className="shadow-lg">
              <div className="px-6 py-4 flex items-start">
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 mr-4 text-sm font-semibold">
                  Pregunta
                </span>
                <span className="text-lg text-foreground">{q.question}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Respuestas;
