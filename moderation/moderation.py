import re
import unicodedata
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from googleapiclient import discovery
import time

# ------------------ CONFIGURACIÓN ------------------

# API Key de Perspective API
PERSPECTIVE_API_KEY = 'AIzaSyDumzxx0TpLUEcQl1R5HZvi7iTAQVG0UsQ'

# Umbral de toxicidad para rechazar preguntas (0.0 a 1.0)
TOXICITY_THRESHOLD = 0.3

# Inicializar Firebase
# Ajusta la ruta a tu archivo de credenciales según sea necesario
cred = credentials.Certificate("src/cred.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ------------------ PREPROCESSING / NORMALIZACIÓN ------------------

def normalize_text(text: str) -> str:
    """
    Normaliza el texto:
      1. Unicode NFKC
      2. Elimina caracteres invisibles y de control
      3. Minúsculas
      4. Quita acentos (para comparación con blacklist)
      5. Recorta espacios
    """
    # Primero normalizar con NFKC para convertir caracteres compuestos y compatibles
    text = unicodedata.normalize('NFKC', text)
    # Eliminar caracteres de control e invisibles
    text = ''.join(ch for ch in text if unicodedata.category(ch) not in ('Cf', 'Cc'))
    # Convertir a minúsculas
    text = text.lower()
    # Quitar acentos para la comparación con blacklist y otros análisis
    # pero esto no se usa para la detección de símbolos intercalados
    normalized_for_comparison = ''.join(ch for ch in unicodedata.normalize('NFD', text) 
                              if unicodedata.category(ch) != 'Mn')
    return normalized_for_comparison.strip()

# ------------------ BLACKLIST / PALABROTAS ------------------

BLACKLIST = {
    # ejemplos básicos; ampliar según necesidades
    'puto', 'puta', 'mierda', 'joder', 'coño', 'hostia',
    'polla', 'pene', 'órgano', 'p0rn0', 'p0rno', 'porno', 'p0rn',
    'follar', 'f4ll4r', 'cojones', 'hijo de puta'
}

# Generar variantes l33t: sustituir números por letras
LEET_MAP = str.maketrans({'4': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '@': 'a', '$': 's', '¥': 'y'})

def contains_blacklisted_word(text: str) -> bool:
    """Detecta palabras de la BLACKLIST, incluidas variantes l33t."""
    # texto normalizado
    norm = normalize_text(text)
    # también versión l33t->normal
    deleet = norm.translate(LEET_MAP)
    # tokenizar palabras
    tokens = re.findall(r"\b\w+\b", deleet)
    return any(token in BLACKLIST for token in tokens)

# ------------------ PATRONES Y REGEX ------------------

# Repetición excesiva de caracteres (5 o más veces)
RE_REPEAT = re.compile(r"(.)\1{4,}")
# Palabras con símbolos intercalados: detectar secuencia letra, símbolo, letra
# Incluimos letras acentuadas y ñ para evitar falsos positivos en español
RE_SYMBOLS = re.compile(r"[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ](?:[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]){1,}[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]")

# HTML/JS y URLs sospechosas
RE_SCRIPT_TAG = re.compile(r"<\s*script\b", re.IGNORECASE)
RE_JS_SCHEME = re.compile(r"javascript:\s*", re.IGNORECASE)
RE_URL = re.compile(
    r"https?://[\w\-]+(?:\.[\w\-]+)+[/#?]?.*|www\.[\w\-]+(?:\.[\w\-]+)+[/#?]?.*",
    re.IGNORECASE
)

# ------------------ LONGITUD Y SPAM ------------------

MIN_LENGTH = 3    # mínimo de caracteres (sin espacios)
MAX_LENGTH = 500  # máximo razonable

def validate_length(text: str) -> bool:
    """Valida longitud mínima y máxima."""
    length = len(text.strip())
    return MIN_LENGTH <= length <= MAX_LENGTH

# ------------------ PIPELINE DE FILTRADO LOCAL ------------------

def is_clean(text: str) -> (bool, list):
    """
    Comprueba si el texto pasa todos los filtros básicos.
    Retorna (True, []) si está limpio, o (False, [motivos]).
    """
    motivos = []
    # Normalización para blacklist (sin acentos)
    norm = normalize_text(text)

    # 1. Blacklist
    if contains_blacklisted_word(norm):
        motivos.append('Contiene palabra o expresión prohibida')

    # 2. Repeticiones abusivas
    if RE_REPEAT.search(norm):
        motivos.append('Repetición excesiva de caracteres')

    # 3. Símbolos en palabras - usamos el texto original, no el normalizado
    # porque ya hemos incluido las letras acentuadas en el patrón RE_SYMBOLS
    if RE_SYMBOLS.search(text):
        motivos.append('Uso de símbolos intercalados en palabras')

    # 4. URLs y etiquetas HTML/JS
    if RE_SCRIPT_TAG.search(text) or RE_JS_SCHEME.search(text) or RE_URL.search(text):
        motivos.append('Posible URL o código malicioso')

    # 5. Longitud
    if not validate_length(text):
        motivos.append('Longitud fuera de los límites permitidos')

    return (len(motivos) == 0, motivos)

# ------------------ PERSPECTIVE API ------------------

def check_toxicity(text: str) -> (float, bool):
    """
    Analiza el texto con Perspective API para detectar toxicidad.
    Retorna (score, is_toxic)
    """
    try:
        client = discovery.build(
            "commentanalyzer",
            "v1alpha1",
            developerKey=PERSPECTIVE_API_KEY,
            discoveryServiceUrl="https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1",
            static_discovery=False,
        )

        analyze_request = {
            'comment': {'text': text},
            'requestedAttributes': {'TOXICITY': {}}
        }

        response = client.comments().analyze(body=analyze_request).execute()
        score = response["attributeScores"]["TOXICITY"]["summaryScore"]["value"]
        is_toxic = score >= TOXICITY_THRESHOLD
        
        return score, is_toxic
    except Exception as e:
        print(f"Error al analizar con Perspective API: {e}")
        # En caso de error, asumimos que no es tóxico para no rechazar contenido injustamente
        return 0.0, False

# ------------------ PROCESAMIENTO DE DOCUMENTOS ------------------

def process_pending_questions():
    """
    Procesa todas las preguntas pendientes y actualiza su estado
    """
    # Referencia a la colección de preguntas con estado "pending"
    pending_ref = db.collection("questions").where("status", "==", "pending")
    
    # Obtener todos los documentos pendientes
    pending_docs = pending_ref.stream()
    
    # Contador para el seguimiento
    total = 0
    approved = 0
    rejected = 0
    
    print("Comenzando el procesamiento de preguntas pendientes...")
    
    for doc in pending_docs:
        total += 1
        doc_data = doc.to_dict()
        question_text = doc_data.get("question", "")
        
        print(f"\nProcesando documento {doc.id}")
        print(f"Pregunta: '{question_text}'")
        
        # Paso 1: Filtrado local
        is_locally_clean, motivos = is_clean(question_text)
        
        if not is_locally_clean:
            print(f"Rechazada por filtrado local: {motivos}")
            # Actualizar documento a rechazado con razones
            doc.reference.update({
                'status': 'rejected',
                'rejection_reason': ', '.join(motivos),
                'processed_at': firestore.SERVER_TIMESTAMP
            })
            rejected += 1
            continue
        
        # Paso 2: Verificación con Perspective API
        toxicity_score, is_toxic = check_toxicity(question_text)
        print(f"Score de toxicidad: {toxicity_score:.4f} {'(TÓXICO)' if is_toxic else '(ACEPTABLE)'}")
        
        # Actualizar el documento en la base de datos
        if is_toxic:
            doc.reference.update({
                'status': 'rejected',
                'rejection_reason': f'Toxicidad detectada: {toxicity_score:.4f}',
                'toxicity_score': toxicity_score,
                'processed_at': firestore.SERVER_TIMESTAMP
            })
            rejected += 1
        else:
            doc.reference.update({
                'status': 'approved',
                'toxicity_score': toxicity_score,
                'processed_at': firestore.SERVER_TIMESTAMP
            })
            approved += 1
        
        # Pequeña pausa para no saturar la API
        time.sleep(0.5)
    
    # Resumen final
    print("\n--- RESUMEN DE MODERACIÓN ---")
    print(f"Total procesadas: {total}")
    print(f"Aprobadas: {approved}")
    print(f"Rechazadas: {rejected}")
    
    return total, approved, rejected

# ------------------ MAIN ------------------

if __name__ == '__main__':
    print("=== SISTEMA DE MODERACIÓN AUTOMÁTICA DE PREGUNTAS ===")
    
    # Verificar la configuración
    if PERSPECTIVE_API_KEY == 'TU_API_KEY_AQUÍ':
        print("ADVERTENCIA: Debes configurar tu API Key de Perspective API")
        print("Modifica la variable PERSPECTIVE_API_KEY con tu clave.")
        exit(1)
    
    # Ejecutar el proceso de moderación
    print(f"Umbral de toxicidad configurado: {TOXICITY_THRESHOLD}")
    print("Iniciando procesamiento...")
    
    try:
        total, approved, rejected = process_pending_questions()
        
        if total == 0:
            print("No se encontraron preguntas pendientes para moderar.")
        else:
            print("\nProceso completado con éxito.")
            print(f"Tasa de aprobación: {approved/total*100:.1f}%")
            print(f"Tasa de rechazo: {rejected/total*100:.1f}%")
    
    except Exception as e:
        print(f"Error durante la ejecución: {e}")
        import traceback
        traceback.print_exc()