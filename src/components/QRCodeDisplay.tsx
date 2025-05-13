
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

const QRCodeDisplay = () => {
  const baseUrl = window.location.origin;
  const questionsUrl = `${baseUrl}/preguntas`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        questionsUrl,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#055695', // Actualizado al nuevo color azul
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [questionsUrl]);
  
  return (
    <div className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-center text-foreground">
        Escanea para preguntar
      </h3>
      
      <div className="flex justify-center py-4">
        <div className="p-4 border-4 border-brand-light-purple rounded-lg bg-white">
          <canvas ref={canvasRef} className="h-48 w-48" />
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Escanea este código para enviar</p>
        <p>tus preguntas a Hedy</p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
