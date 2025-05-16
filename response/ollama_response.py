# archivo: procesar_y_responder.py

import os
import re
import time
import json
import requests
import firebase_admin
from firebase_admin import credentials, firestore

# ——— Inicialización de Firebase ———

def _inicializar_firebase():
    """
    Inicializa el SDK de Firebase Admin si no está ya inicializado.
    """
    if firebase_admin._apps:
        return

    project_id = 'qr-questions-hedy'
    cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'src/cred.json')

    try:
        # Intento con credenciales explícitas
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'projectId': project_id})
        print("Firebase Admin SDK inicializado usando credenciales explícitas.")
    except Exception as e:
        print(f"Error inicializando con credenciales explícitas: {e}")
        print("Intentando inicializar con credenciales por defecto de entorno Google Cloud.")
        try:
            firebase_admin.initialize_app(options={'projectId': project_id})
            print("Firebase Admin SDK inicializado con credenciales por defecto.")
        except Exception as e2:
            raise RuntimeError(
                "Fallo al inicializar Firebase Admin SDK. "
                "Asegúrate de tener GOOGLE_APPLICATION_CREDENTIALS configurado "
                "o de ejecutar en un entorno de Google Cloud con credenciales válidas."
            )

def obtener_preguntas_aprobadas() -> dict:
    """
    Lee todos los documentos de la colección 'questions' en Firestore
    y devuelve un diccionario { name: question } solo para aquellos
    cuyo campo 'status' sea 'approved'.
    """
    _inicializar_firebase()
    db = firestore.client()

    preguntas_ref = db.collection('questions')
    docs = preguntas_ref.stream()
    aprobadas = {}

    for doc in docs:
        data = doc.to_dict() or {}
        if data.get('status') == 'approved':
            nombre = data.get('name')
            pregunta = data.get('question')
            if nombre and pregunta:
                aprobadas[nombre] = pregunta

    return aprobadas

# ——— Función para preguntar a Ollama ———

def answer_question_from_doc(doc_path: str, question: str) -> str:
    """
    Envía el documento y la pregunta a Ollama y devuelve la respuesta limpia.
    """
    # Leemos el documento
    with open(doc_path, encoding="utf-8") as f:
        doc = f.read()

    system_prompt = (
        "Eres una asistente que responde preguntas SÓLO basándote en el siguiente documento. "
        "Aunque la respuesta sea corta, no seas muy directa. "
        "Si la respuesta no puedes obtenerla del texto, di ‘No está en el documento’. "
        "Asegurete de no inventarte preguntas tu, solo responder las que se te dan"
        "Además, como solo vamos a usar el texto que generes, no hace falta que lo formatees."
    )

    payload = {
        "model": "qwen3:32b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": f"DOCUMENTO:\n\n{doc}"},
            {"role": "user",   "content": f"Ahora, {question} \\no_think"}
        ],
        "stream": False
    }

    url = "http://localhost:11434/api/chat"
    headers = {"Content-Type": "application/json"}

    resp = requests.post(url, headers=headers, json=payload, timeout=1200)
    resp.raise_for_status()
    data = resp.json()

    content = data["message"]["content"]
    # Limpiamos cualquier bloque <think>...</think>
    clean = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
    return clean

# ——— Script principal ———

def main():
    # Ruta al documento que sirve de contexto para las respuestas
    doc_path = os.path.join("response", "document.txt")
    # Archivo de salida
    out_path = os.path.join("response", "resultados.txt")

    preguntas_aprobadas = obtener_preguntas_aprobadas()
    if not preguntas_aprobadas:
        print("No se encontraron preguntas con status 'approved'.")
        return

    with open(out_path, "w", encoding="utf-8") as out_file:
        for nombre, pregunta in preguntas_aprobadas.items():
            print(f"Procesando pregunta de {nombre!r}...")
            respuesta = answer_question_from_doc(doc_path, pregunta)

            out_file.write("--------------------\n")
            out_file.write(f"Nombre: {nombre}\n")
            out_file.write(f"Pregunta: {pregunta}\n")
            out_file.write(f"Respuesta: {respuesta}\n")
        out_file.write("--------------------\n")

    print(f"Proceso completado. Resultados guardados en: {out_path}")

if __name__ == "__main__":
    main()
