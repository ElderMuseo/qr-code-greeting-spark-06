import os
import re
import time
import json
import random
import logging
import requests
import firebase_admin
from firebase_admin import credentials, firestore
from google.api_core.retry import Retry
from google.api_core.exceptions import DeadlineExceeded
import traspaso

# ——— Configuración de logging ———
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# ——— Inicialización de Firebase (una vez) ———

def _inicializar_firebase():
    """
    Inicializa el SDK de Firebase Admin si no está ya inicializado.
    """
    if firebase_admin._apps:
        return

    project_id = 'qr-questions-hedy'
    cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'src/cred.json')

    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'projectId': project_id})
        logging.info("Firebase Admin SDK inicializado usando credenciales explícitas.")
    except Exception as e:
        logging.warning(f"Error con credenciales explícitas: {e}")
        logging.info("Intentando inicializar con credenciales por defecto de entorno Google Cloud.")
        try:
            firebase_admin.initialize_app(options={'projectId': project_id})
            logging.info("Firebase Admin SDK inicializado con credenciales por defecto.")
        except Exception as e2:
            logging.error("Fallo al inicializar Firebase Admin SDK con credenciales por defecto.")
            raise RuntimeError(
                "Fallo al inicializar Firebase Admin SDK. "
                "Asegúrate de tener GOOGLE_APPLICATION_CREDENTIALS configurado "
                "o de ejecutar en un entorno de Google Cloud con credenciales válidas."
            )

_inicializar_firebase()
db = firestore.client()

# ——— Lectura de preguntas aprobadas con timeout ———

def obtener_preguntas_aprobadas(timeout: float = 30.0) -> dict:
    """
    Lee todos los documentos de la colección 'questions' en Firestore
    y devuelve un dict { name: question } solo para aquellos
    cuyo campo 'status' sea 'approved'.
    Aplica un deadline explícito al streaming.
    """
    preguntas_ref = db.collection('questions')
    retry = Retry(deadline=timeout)

    start = time.time()
    try:
        docs = preguntas_ref.stream(retry=retry)
    except DeadlineExceeded:
        raise RuntimeError(f"Timeout de {timeout}s excedido al leer preguntas de Firestore.")
    elapsed = time.time() - start
    logging.info(f"Lectura de preguntas completada en {elapsed:.2f}s")

    aprobadas = {}
    for doc in docs:
        data = doc.to_dict() or {}
        if data.get('status') == 'approved':
            nombre = data.get('name')
            pregunta = data.get('question')
            if nombre and pregunta:
                aprobadas[nombre] = pregunta

    logging.info(f"Preguntas aprobadas encontradas: {len(aprobadas)}")
    return aprobadas

# ——— Función para preguntar a Ollama ———

def answer_question_from_doc(doc_path: str, question: str) -> str:
    """
    Envía el documento y la pregunta a Ollama y devuelve la respuesta limpia.
    """
    with open(doc_path, encoding="utf-8") as f:
        doc = f.read()

    system_prompt = (
        "Eres una asistente que responde preguntas SÓLO basándote en el siguiente documento. "
        "Aunque la respuesta sea corta, no seas muy directa. "
        "Si la respuesta no puedes obtenerla del texto, di ‘No está en el documento’. "
        "Asegúrate de no inventarte preguntas, solo responder las que se te dan. "
        "Además, como solo vamos a usar el texto que generes, no hace falta que lo formatees. "
        "También, si hay algún número (100, 12, 34...) lo escribiras foneticamente (cien, doce, trenta y cuatro)"
        "Las preguntas tienen el formato de Nombre : Pregunta. "
        "Si la respuesta sí puedes obtenerla del texto, darás la respuesta haciendo alusión a quien la preguntó, "
        "por ejemplo: 'Nombre ha preguntado, ¿cuántos metros cuadrados tiene el salón de actos? Pues este cuenta con doscientos metros cuadrados de superficie.' "
        "Pero recuerda, si no la puedes sacar del documento, tu respuesta debe ser solamente 'No está en el documento' y nada más."
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

    resp = requests.post(url, headers=headers, json=payload, timeout=600)
    resp.raise_for_status()
    data = resp.json()

    content = data["message"]["content"]
    clean = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
    return clean

# ——— Función para filtrar y seleccionar respuestas ———

def generar_resultados_final(input_path: str, output_path: str, muestras: int = 2):
    """
    Lee un archivo con resultados (formato nombre;pregunta; respuesta) y genera
    un archivo final con solo respuestas válidas, seleccionando aleatoriamente muestras.
    """
    with open(input_path, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]

    respondidas = [
        l for l in lines
        if not l.lower().startswith("no está en el documento")
    ]

    if not respondidas:
        logging.warning("No hay preguntas respondidas para incluir en resultados_final.txt.")
        return

    seleccion = random.sample(respondidas, min(muestras, len(respondidas)))

    with open(output_path, "w", encoding="utf-8") as f:
        for linea in seleccion:
            f.write(f"{linea}\n")

    logging.info(f"resultados_final.txt generado con {len(seleccion)} entradas: {output_path}")

# ——— Script principal ———

def main():
    doc_path    = os.path.join("response", "document.txt")
    out_path    = os.path.join("response", "resultados.txt")
    final_path  = os.path.join("response", "resultados_final.txt")

    preguntas_aprobadas = obtener_preguntas_aprobadas(timeout=30.0)
    if not preguntas_aprobadas:
        logging.info("No se encontraron preguntas con status 'approved'.")
        return

    # Generar resultados.txt
    with open(out_path, "w", encoding="utf-8") as out_file:
        for nombre, pregunta in preguntas_aprobadas.items():
            logging.info(f"Procesando pregunta de {nombre!r}...")
            respuesta = answer_question_from_doc(doc_path, f"{nombre} : {pregunta}")

            if respuesta.lower().startswith("no está en el documento"):
                out_file.write(f"{nombre};{pregunta}; {respuesta}\n")
            else:
                texto_resp = respuesta.rstrip(".")
                out_file.write(f"{texto_resp}.\n")

    logging.info(f"Proceso completado. Resultados guardados en: {out_path}")

    # Generar resultados_final.txt con 2 respuestas aleatorias
    generar_resultados_final(out_path, final_path, muestras=2)

    # Envío de archivo
    traspaso.send_and_run(
        ip_destino="172.16.2.251",
        archivo_origen="response/resultados_final.txt",
        usuario="HASSSIO",
        clave="99779977",
        destino_archivo="C:/Users/HASSSIO/Desktop/Asistente/ShowIA/resultados_final.txt",
        ruta_script_remoto="C:/Users/HASSSIO/Desktop/Asistente/respuestaIA.py",
        interpreter="python"  
    )

if __name__ == "__main__":
    main()
