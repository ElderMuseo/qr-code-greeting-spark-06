import firebase_admin
from firebase_admin import credentials, firestore
import os

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
            print(f"¡Error fatal! No se pudo inicializar Firebase Admin SDK: {e2}")
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

    Retorna:
        dict: claves = name, valores = question de preguntas aprobadas.
              Diccionario vacío si no hay aprobadas.
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
            # Solo añadimos si ambos campos existen
            if nombre is not None and pregunta is not None:
                aprobadas[nombre] = pregunta

    return aprobadas

if __name__ == "__main__":
    # Ejemplo de uso al ejecutar el script directamente
    preguntas = obtener_preguntas_aprobadas()
    if preguntas:
        print("Preguntas aprobadas:")
        for nombre, texto in preguntas.items():
            print(f"  {nombre}: {texto}")
    else:
        print("No se encontraron preguntas con status 'approved'.")
