
import { useQuestions } from "@/contexts/QuestionsContext";
import React from "react";

const Respuestas = () => {
  const { questions } = useQuestions();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-2 py-8">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-4 text-primary">
          Preguntas de la Exposición
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Aquí aparecen todas las preguntas recibidas. Se irán respondiendo una por una durante la exposición.
        </p>
        {questions.length === 0 ? (
          <div className="text-center text-secondary-foreground py-12">
            No hay preguntas todavía.
          </div>
        ) : (
          <div className="flex flex-col w-full gap-5">
            {questions.map((q) => (
              <div
                key={q.id}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-lg flex items-center"
                style={{
                  minHeight: 60,
                }}
              >
                <span className="text-base sm:text-lg md:text-xl font-medium text-foreground break-words">
                  {q.question}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Respuestas;

