import { useNavigate } from "react-router";
import { Brain, ArrowLeft } from "lucide-react";

const TEAL = "#1A4A5C";
const FOG = "#EEF4F7";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: FOG }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "#EAF2F5" }}>
          <Brain size={36} style={{ color: TEAL }} />
        </div>
        <h1 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "3rem" }}>404</h1>
        <h2 className="text-slate-700 mb-3" style={{ fontWeight: 700 }}>Página no encontrada</h2>
        <p className="text-slate-400 mb-8" style={{ fontSize: "0.9rem" }}>
          La página que buscas no existe o fue movida.
        </p>
        <button
          onClick={() => navigate("/paciente")}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors mx-auto hover:opacity-90"
          style={{ background: TEAL, fontWeight: 700 }}
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}