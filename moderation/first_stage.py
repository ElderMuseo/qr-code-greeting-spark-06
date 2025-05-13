import re
import unicodedata

# ------------------ PREPROCESSING ------------------

def normalize_text(text: str) -> str:
    """
    Normaliza el texto:
      1. Unicode NFKC
      2. Elimina caracteres invisibles y de control
      3. Minúsculas
      4. Quita acentos
      5. Recorta espacios
    """
    text = unicodedata.normalize('NFKC', text)
    text = ''.join(ch for ch in text if unicodedata.category(ch) not in ('Cf', 'Cc'))
    text = text.lower()
    text = ''.join(ch for ch in unicodedata.normalize('NFD', text) if unicodedata.category(ch) != 'Mn')
    return text.strip()

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
RE_SYMBOLS = re.compile(r"[a-zA-Z](?:[^a-zA-Z0-9\s]){1,}[a-zA-Z]")

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

# ------------------ PIPELINE DE FILTRADO ------------------

def is_clean(text: str) -> (bool, list):
    """
    Comprueba si el texto pasa todos los filtros básicos.
    Retorna (True, []) si está limpio, o (False, [motivos]).
    """
    motivos = []
    # Normalización
    norm = normalize_text(text)

    # 1. Blacklist
    if contains_blacklisted_word(norm):
        motivos.append('Contiene palabra o expresión prohibida')

    # 2. Repeticiones abusivas
    if RE_REPEAT.search(norm):
        motivos.append('Repetición excesiva de caracteres')

    # 3. Símbolos en palabras
    if RE_SYMBOLS.search(text):
        motivos.append('Uso de símbolos intercalados en palabras')

    # 4. URLs y etiquetas HTML/JS
    if RE_SCRIPT_TAG.search(text) or RE_JS_SCHEME.search(text) or RE_URL.search(text):
        motivos.append('Posible URL o código malicioso')

    # 5. Longitud
    if not validate_length(text):
        motivos.append('Longitud fuera de los límites permitidos')

    return (len(motivos) == 0, motivos)

# ------------------ DEMO ------------------

if __name__ == '__main__':
    ejemplos = [
        'Hola, ¿cómo estás?',
        '¡¡¡¡¡¡holaaaaaaa!!!!!!',
        'Visita http://malicioso.com <script>alert(1)</script>',
        'Eres un p0t0 de mierda',
        'OK'
    ]
    for e in ejemplos:
        limpio, razones = is_clean(e)
        estado = 'LIMPIO' if limpio else 'NO LIMPIO'
        print(f"{estado}: '{e}'", '=>', razones)
