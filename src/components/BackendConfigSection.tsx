import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackendConfig } from '@/contexts/BackendConfigContext';
import { toast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

export const BackendConfigSection: React.FC = () => {
  const { backendUrl, setBackendUrl } = useBackendConfig();
  const [tempUrl, setTempUrl] = useState(backendUrl);

  const handleSave = () => {
    // Validate URL format
    try {
      new URL(tempUrl);
      setBackendUrl(tempUrl);
      toast({
        title: "Configuración guardada",
        description: "La dirección del backend se ha actualizado correctamente."
      });
    } catch (error) {
      toast({
        title: "URL inválida",
        description: "Por favor ingresa una URL válida (ej: http://192.168.1.100:5000)",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    const defaultUrl = 'http://localhost:5000';
    setTempUrl(defaultUrl);
    setBackendUrl(defaultUrl);
    toast({
      title: "Configuración restablecida",
      description: "Se ha restablecido la dirección por defecto."
    });
  };

  return (
    <Card className="mt-6 shadow-lg bg-[#263340] text-white border-[#055695]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración del Backend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="backend-url" className="text-white">
            Dirección IP del servidor Python
          </Label>
          <div className="flex gap-2">
            <Input
              id="backend-url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://192.168.1.100:5000"
              className="bg-[#344552] border-[#055695] text-white placeholder:text-gray-400"
            />
            <Button 
              onClick={handleSave}
              variant="outline"
              className="bg-[#055695] text-white border-[#055695] hover:bg-[#0779ca] whitespace-nowrap"
            >
              Guardar
            </Button>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="bg-[#263340] text-white border-[#055695] hover:bg-[#344552] whitespace-nowrap"
            >
              Reset
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            URL actual: <span className="text-[#055695] font-mono">{backendUrl}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};