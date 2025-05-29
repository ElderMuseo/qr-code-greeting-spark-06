import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import subprocess

# ----------------------------
# Configuración de rutas
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, os.pardir))

# ----------------------------
# Inicialización de Flask
# ----------------------------
app = Flask(__name__)
CORS(app)

# ----------------------------
# Endpoint: run-moderation
# ----------------------------
@app.route('/run-moderation', methods=['POST'])
@cross_origin()
def run_moderation():
    script_path = os.path.join(PROJECT_ROOT, 'moderation', 'moderation.py')
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True, text=True, check=True
        )
        return jsonify({"output": result.stdout, "success": True})
    except subprocess.CalledProcessError as e:
        app.logger.error("ERROR en moderation.py:\n%s\n%s", e.stdout, e.stderr)
        return jsonify({
            "output": e.stdout + "\n" + e.stderr,
            "success": False
        }), 500

# ----------------------------
# Endpoint: run-ollama-response
# ----------------------------
@app.route('/run-ollama-response', methods=['POST'])
@cross_origin()
def run_ollama_response():
    script_path = os.path.join(PROJECT_ROOT, 'response', 'ollama_response.py')
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True, text=True, check=True
        )
        return jsonify({"output": result.stdout, "success": True})
    except subprocess.CalledProcessError as e:
        app.logger.error("ERROR en ollama_response.py:\n%s\n%s", e.stdout, e.stderr)
        return jsonify({
            "output": e.stdout + "\n" + e.stderr,
            "success": False
        }), 500

# ----------------------------
# Manejador global de errores
# ----------------------------
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error("EXCEPCIÓN NO CONTROLADA: %s", str(e))
    return jsonify({"output": str(e), "success": False}), 500

# ----------------------------
# Arranque de la aplicación
# ----------------------------
if __name__ == '__main__':
    # forzar cwd a raíz del proyecto
    os.chdir(PROJECT_ROOT)
    # desactivar reloader para evitar errores de ruta al reiniciar
    app.run(port=5000, debug=True, use_reloader=False)
