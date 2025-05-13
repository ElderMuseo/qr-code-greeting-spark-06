import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time # Importar la librería time para pausas si es necesario

# --- Configuración ---
# Inicializa Firebase Admin SDK.
# Asegúrate de tener un archivo de clave de servicio (clave.json)
# descargado desde la configuración de tu proyecto Firebase
# en la pestaña "Cuentas de servicio".
# Guarda el archivo clave.json en el mismo directorio que tu script Python,
# o proporciona la ruta completa.
try:
    cred = credentials.Certificate('src/cred.json') # <--- Reemplaza con la ruta correcta a tu archivo .json
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK inicializado correctamente.")
except FileNotFoundError:
    print("Error: No se encontró el archivo de clave de servicio. Asegúrate de que la ruta sea correcta.")
    print("Descarga el archivo desde Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada.")
    exit()
except ValueError as e:
     print(f"Error al inicializar Firebase Admin SDK: {e}. Si ya ha sido inicializado en otro lugar, puedes omitir initialize_app.")


db = firestore.client()
collection_ref = db.collection('questions')

# --- Función para borrar todos los documentos ---
def delete_collection(coll_ref, batch_size=10):
    """
    Borra todos los documentos de una colección en lotes.
    Eliminar en lotes es más eficiente y reduce el riesgo de agotar la memoria.
    """
    deletes_count = 0
    print(f"Iniciando borrado de la colección: {coll_ref.id}")

    while True:
        # Obtiene un lote de documentos
        docs = coll_ref.limit(batch_size).stream()

        # Verifica si hay documentos para borrar
        deleted = 0
        batch = db.batch()
        for doc in docs:
            print(f'Borrando documento {doc.id}')
            batch.delete(doc.reference)
            deleted += 1
            deletes_count += 1

        if deleted == 0:
            # No hay más documentos para borrar
            break

        # Confirma el lote de borrado
        batch.commit()
        print(f"Lote de {deleted} documentos borrado.")

        # Es una buena práctica hacer una pequeña pausa entre lotes grandes
        # time.sleep(0.1)

    print(f"Borrado completado. Total de documentos borrados: {deletes_count}.")


# --- Lógica principal para borrar cada hora ---


if __name__ == "__main__":
    while True:
        print("Iniciando ciclo de borrado horario...")
        delete_collection(collection_ref)
        print("Esperando 1 hora para el próximo ciclo...")
        time.sleep(3600) # Espera 3600 segundos (1 hora)

