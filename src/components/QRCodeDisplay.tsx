
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

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
            dark: '#9b87f5',
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
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-center text-gray-800">
        Escanea para preguntar
      </h3>
      
      <div className="flex justify-center py-4">
        <div className="p-4 border-4 border-brand-light-purple rounded-lg bg-white">
          <canvas ref={canvasRef} className="h-48 w-48" />
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p>Escanea este código para enviar</p>
        <p>tus preguntas a Hedy</p>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full border-2 border-brand-light-purple hover:border-brand-purple hover:bg-brand-light-purple/30"
        onClick={() => window.location.href = questionsUrl}
      >
        <QrCode className="mr-2 h-4 w-4" />
        Ir a Preguntas
      </Button>
    </div>
  );
};

export default QRCodeDisplay;
