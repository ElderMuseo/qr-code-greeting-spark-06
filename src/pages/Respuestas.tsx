
import { useQuestions } from "@/contexts/QuestionsContext";
import React from "react";
import QuestionCarousel from "@/components/QuestionCarousel";

const Respuestas = () => {
  const { questions } = useQuestions();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background py-10 px-3">
      <div className="w-full max-w-2xl flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Preguntas de la Exposición
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Aquí aparecen todas las preguntas recibidas. Se irán respondiendo una por una durante la exposición.
        </p>
        <QuestionCarousel questions={questions.map(q => ({ id: q.id, question: q.question }))} />
      </div>
    </div>
  );
};

export default Respuestas;
