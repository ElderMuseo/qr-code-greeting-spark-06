
import { collection, getDocs, writeBatch, query, limit } from "firebase/firestore";
import { db } from "../firebase";

// La función que borrará todas las preguntas en lotes
export const executeDeleteScript = async (): Promise<{ success: boolean; deleted?: number; error?: string }> => {
  try {
    console.log("Iniciando proceso de borrado de preguntas...");
    let totalDeleted = 0;
    const batchSize = 500; // Tamaño de lote para borrar

    // Función para borrar en lotes
    const deleteQueryBatch = async (batchSize: number): Promise<number> => {
      // Obtener una referencia a la colección
      const questionsRef = collection(db, "questions");
      
      // Crear una consulta limitada al tamaño del lote
      const q = query(questionsRef, limit(batchSize));
      
      // Obtener los documentos
      const snapshot = await getDocs(q);
      
      // Si no hay documentos, terminamos
      if (snapshot.empty) {
        return 0;
      }
      
      // Crear un nuevo lote de escritura
      const batch = writeBatch(db);
      
      // Agregar cada documento al lote para borrado
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Confirmar el lote
      await batch.commit();
      
      return snapshot.size;
    };

    // Eliminar documentos en un bucle hasta que no queden más
    let deleted = -1;
    while (deleted !== 0) {
      deleted = await deleteQueryBatch(batchSize);
      totalDeleted += deleted;
      console.log(`Lote de ${deleted} documentos borrado. Total: ${totalDeleted}`);
    }

    console.log(`Proceso de borrado completado. Total de documentos eliminados: ${totalDeleted}`);
    
    return { 
      success: true, 
      deleted: totalDeleted 
    };
  } catch (error) {
    console.error("Error durante el proceso de borrado:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};
