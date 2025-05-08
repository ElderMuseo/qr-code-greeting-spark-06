
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AdminHeader = () => {
  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            <span className="text-brand-purple">Admin</span> Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las preguntas enviadas por la audiencia
          </p>
        </div>
        
        <Link 
          to="/"
          className="flex items-center gap-1 text-gray-600 hover:text-brand-purple transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la página principal</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default AdminHeader;
