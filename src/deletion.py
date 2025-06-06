
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import sys

try:
    # Usa una credencial de servicio para autenticar si no estás en un entorno de Google Cloud
    # Si estás en un entorno como Cloud Functions o Compute Engine, Application Default Credentials
    # se manejarán automáticamente.
    # Si ejecutas esto localmente, necesitas descargar un archivo JSON de credenciales
    # desde la configuración de tu proyecto de Firebase/Google Cloud y apuntar a él:
    try:
        # Intenta inicializar la app, pero si ya está inicializada, captura la excepción
        cred = credentials.Certificate("src/cred.json")
        firebase_admin.initialize_app(cred)
    except ValueError:
        # La app ya está inicializada o hay otro problema
        pass

    # Obtén una referencia a la base de datos
    db = firestore.client()

    def delete_collection(coll_ref, batch_size):
        """
        Borra documentos en lotes de una colección dada.
        Recibe una referencia a la colección y el tamaño del lote.
        """
        # Lee un lote de documentos
        docs = coll_ref.limit(batch_size).stream()

        deleted = 0
        # Itera sobre los documentos en el lote
        for doc in docs:
            print(f"Borrando documento {doc.id}")
            # Borra el documento actual
            doc.reference.delete()
            deleted = deleted + 1

        # Si borramos tantos documentos como el tamaño del lote,
        # significa que probablemente hay más y llamamos a la función recursivamente.
        if deleted >= batch_size:
            print(f"Borrados {deleted} documentos en este lote. Buscando más...")
            return delete_collection(coll_ref, batch_size)
        else:
            print(f"Borrados {deleted} documentos en el último lote. Colección vacía o completamente borrada.")
            return deleted

    # --- Uso de la función para borrar la colección "questions" ---

    # Obtén una referencia a la colección "questions"
    questions_ref = db.collection("questions")

    # Define el tamaño del lote (ej. 100 o 500)
    batch_size = 10

    print(f"Iniciando borrado de la colección 'questions' en lotes de {batch_size}...")

    # Llama a la función para iniciar el borrado
    total_deleted = delete_collection(questions_ref, batch_size)

    print(f"Proceso de borrado de la colección 'questions' completado. Total de documentos eliminados: {total_deleted}")
    sys.exit(0)
    
except Exception as e:
    print(f"Error durante el proceso de borrado: {str(e)}", file=sys.stderr)
    sys.exit(1)

# Esta función permite ejecutar el script desde JavaScript
def run_deletion():
    try:
        # Obtén una referencia a la colección "questions"
        questions_ref = db.collection("questions")
        batch_size = 10
        total_deleted = delete_collection(questions_ref, batch_size)
        return {"success": True, "deleted": total_deleted}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Si este archivo se importa como un módulo, esta función estará disponible
if __name__ == "__main__":
    # Si se ejecuta directamente como script, el código ya se ha ejecutado arriba
    pass
