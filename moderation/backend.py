
from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/run-moderation', methods=['POST'])
def run_moderation():
    try:
        result = subprocess.run(['python3', 'moderation/moderation.py'], capture_output=True, text=True, check=True)
        return jsonify({"output": result.stdout, "success": True})
    except subprocess.CalledProcessError as e:
        return jsonify({"output": e.stdout + "\n" + e.stderr, "success": False}), 500

@app.route('/run-ollama-response', methods=['POST'])
def run_ollama_response():
    try:
        result = subprocess.run(['python3', 'response/ollama_response.py'], capture_output=True, text=True, check=True)
        return jsonify({"output": result.stdout, "success": True})
    except subprocess.CalledProcessError as e:
        return jsonify({"output": e.stdout + "\n" + e.stderr, "success": False}), 500

if __name__ == '__main__':
    app.run(port=5000)
