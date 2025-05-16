import sys
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import subprocess, os

app = Flask(__name__)
CORS(app)

@app.route('/run-moderation', methods=['POST'])
@cross_origin()
def run_moderation():
    try:
        # sys.executable apunta al python con el que corres backend.py
        result = subprocess.run(
            [sys.executable, os.path.join('moderation','moderation.py')],
            capture_output=True, text=True, check=True
        )
        return jsonify({"output": result.stdout, "success": True})
    except subprocess.CalledProcessError as e:
        # debug en consola
        app.logger.error("ERROR en moderation.py:\n%s\n%s", e.stdout, e.stderr)
        # devolver siempre JSON, incluso en error
        return jsonify({
            "output": e.stdout + "\n" + e.stderr,
            "success": False
        }), 500

# idéntico para ollama-response…
@app.route('/run-ollama-response', methods=['POST'])
@cross_origin()
def run_ollama_response():
    try:
        result = subprocess.run(
            [sys.executable, os.path.join('response','ollama_response.py')],
            capture_output=True, text=True, check=True
        )
        return jsonify({"output": result.stdout, "success": True})
    except subprocess.CalledProcessError as e:
        return jsonify({"output": e.stdout + "\n" + e.stderr, "success": False}), 500

# Atrapar cualquier otra excepción y devolver JSON
@app.errorhandler(Exception)
def handle_exception(e):
    # opcionalmente: loguear e
    return jsonify({"output": str(e), "success": False}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
