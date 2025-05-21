
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const QR_PREF_KEY = "questionQRPref";

const QRCodeDisplay = () => {
  const baseUrl = window.location.origin;
  // Leer preferencia de qué QR mostrar
  const [qrUrl, setQrUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const pref = localStorage.getItem(QR_PREF_KEY);
      return pref === "expo" ? `${baseUrl}/preguntas-exposición` : `${baseUrl}/preguntas`;
    }
    return `${baseUrl}/preguntas`;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Escucha cambios de storage (si el admin cambia con el toggle)
  useEffect(() => {
    const updateQr = () => {
      const pref = localStorage.getItem(QR_PREF_KEY);
      setQrUrl(pref === "expo" ? `${baseUrl}/preguntas-exposición` : `${baseUrl}/preguntas`);
    };
    window.addEventListener("storage", updateQr);
    // Y escucha por si el Admin cambia sin refrescar:
    const checkPref = setInterval(updateQr, 1000);
    return () => {
      window.removeEventListener("storage", updateQr);
      clearInterval(checkPref);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrUrl,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#055695', // Color azul
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [qrUrl]);
  
  return (
    <div className="p-6 bg-card rounded-2xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-center text-foreground">
        Escanea para preguntar
      </h3>
      
      <div className="flex justify-center py-4">
        <div className="p-4 border-4 border-primary rounded-lg bg-white">
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
