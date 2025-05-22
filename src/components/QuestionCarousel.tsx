
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
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = (idx: number, dir: "left" | "right") => {
    if (isAnimating || idx === currentIdx) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsAnimating(false);
    }, 400); // duración de la animación
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
        onClick={() => handleChange(currentIdx - 1, "left")}
        disabled={!showPrev || isAnimating}
        className="transition-all p-2 rounded-full bg-background hover:bg-primary/10 text-primary disabled:text-gray-400 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Pregunta anterior"
      >
        <ArrowLeft size={28} />
      </button>
      <div className="flex-1 flex justify-center min-w-0 h-[180px] sm:h-[200px] md:h-[220px] items-center">
        <div
          className={`w-full max-w-xl
            transition-all duration-400
            ${
              isAnimating
                ? direction === "right"
                  ? "animate-slide-out-left opacity-0"
                  : "animate-slide-out-right opacity-0"
                : "animate-slide-in opacity-100"
            }
          `}
          key={questions[currentIdx].id}
          style={{ minHeight: 120, display: "flex" }}
        >
          <Card className="w-full shadow-2xl flex items-center justify-center min-h-[100px] h-full">
            <span className="rounded-full bg-primary/10 text-primary px-4 py-2 mr-5 text-md font-semibold shrink-0 hidden sm:inline">
              Pregunta
            </span>
            <span className="text-2xl lg:text-4xl xl:text-5xl text-foreground font-semibold leading-snug break-words">
              {questions[currentIdx].question}
            </span>
          </Card>
        </div>
      </div>
      <button
        onClick={() => handleChange(currentIdx + 1, "right")}
        disabled={!showNext || isAnimating}
        className="transition-all p-2 rounded-full bg-background hover:bg-primary/10 text-primary disabled:text-gray-400 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Pregunta siguiente"
      >
        <ArrowRight size={28} />
      </button>
      <style>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slide-out-left {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.97);
          }
        }
        @keyframes slide-out-right {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(40px) scale(0.97);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.45s cubic-bezier(.56,1.74,.63,.97);
        }
        .animate-slide-out-left {
          animation: slide-out-left 0.45s cubic-bezier(.56,1.74,.63,.97);
        }
        .animate-slide-out-right {
          animation: slide-out-right 0.45s cubic-bezier(.56,1.74,.63,.97);
        }
      `}</style>
    </div>
  );
};

export default QuestionCarousel;
