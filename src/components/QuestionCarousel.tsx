
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Question = {
  id: string;
  question: string;
};

interface QuestionCarouselProps {
  questions: Question[];
}

const QuestionCarousel: React.FC<QuestionCarouselProps> = ({ questions }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [animate, setAnimate] = useState<"in" | "out-left" | "out-right">("in");

  // Maneja la animación y el cambio de pregunta
  const goTo = (idx: number) => {
    if (idx === currentIdx) return;
    setAnimate(idx > currentIdx ? "out-left" : "out-right");
    setTimeout(() => {
      setCurrentIdx(idx);
      setAnimate("in");
    }, 250); // tiempo de la animación out
  };

  if (!questions.length) {
    return (
      <div className="text-center text-secondary-foreground py-12">No hay preguntas todavía.</div>
    );
  }

  const showPrev = currentIdx > 0;
  const showNext = currentIdx < questions.length - 1;

  return (
    <div className="flex items-center justify-center gap-2 w-full select-none">
      <button
        onClick={() => goTo(currentIdx - 1)}
        disabled={!showPrev}
        className="transition-all p-2 rounded-full bg-background hover:bg-primary/10 text-primary disabled:text-gray-400 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Pregunta anterior"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex-1 flex justify-center min-w-0">
        {/* Animación de entrada/salida */}
        <div
          className={
            `w-full max-w-xl
            transition-all duration-300
            ${animate === "in"
              ? "animate-fade-in animate-scale-in"
              : animate === "out-left"
              ? "animate-fade-out translate-x-20 opacity-0 pointer-events-none"
              : "animate-fade-out -translate-x-20 opacity-0 pointer-events-none"
            }`
          }
          key={questions[currentIdx].id}
          style={{ minHeight: 120 }}
        >
          <Card className="w-full shadow-2xl animate-enter">
            <div className="px-8 py-8 flex items-start">
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 mr-4 text-sm font-semibold shrink-0">
                Pregunta
              </span>
              <span className="text-lg text-foreground">{questions[currentIdx].question}</span>
            </div>
          </Card>
        </div>
      </div>
      <button
        onClick={() => goTo(currentIdx + 1)}
        disabled={!showNext}
        className="transition-all p-2 rounded-full bg-background hover:bg-primary/10 text-primary disabled:text-gray-400 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Pregunta siguiente"
      >
        <ArrowRight size={24} />
      </button>
    </div>
  );
};

export default QuestionCarousel;
