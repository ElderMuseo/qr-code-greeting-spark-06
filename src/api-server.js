
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Endpoint para eliminar preguntas
app.post('/api/delete-questions', (req, res) => {
  console.log('Ejecutando script de eliminación...');
  
  // Ruta absoluta al script de Python
  const scriptPath = path.resolve(__dirname, 'deletion.py');
  
  // Ejecutar el script de Python
  const pythonProcess = spawn('python', [scriptPath]);
  
  let scriptOutput = '';
  let scriptError = '';
  
  // Recoger la salida del script
  pythonProcess.stdout.on('data', (data) => {
    scriptOutput += data.toString();
    console.log(`Salida del script: ${data}`);
  });
  
  // Recoger errores
  pythonProcess.stderr.on('data', (data) => {
    scriptError += data.toString();
    console.error(`Error del script: ${data}`);
  });
  
  // Cuando el script termina
  pythonProcess.on('close', (code) => {
    console.log(`Script terminado con código: ${code}`);
    
    if (code !== 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error al ejecutar el script de eliminación',
        error: scriptError 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Preguntas eliminadas exitosamente',
      output: scriptOutput 
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
