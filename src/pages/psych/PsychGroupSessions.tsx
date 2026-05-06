import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Calendar, Clock, Users, Plus, X, Check, AlertCircle, Loader2, Video } from "lucide-react";
import { groupSessionService, type GroupSession } from "../../service/groupSessionService";
import { useRealUser } from "../../hooks/useRealUser";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

export default function PsychGroupSessions() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useRealUser();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: 60,
    maxParticipants: 10,
  });
  const [submitting, setSubmitting] = useState(false);

  const psychologistId = profile?.id;

  const loadSessions = async () => {
    if (!psychologistId) {
      setLoading(false);
      setError("No se pudo identificar al psicólogo. Asegúrate de haber iniciado sesión como psicólogo.");
      return;
    }
    try {
      setLoading(true);
      const response = await groupSessionService.getPsychologistSessions(psychologistId);
      setSessions(response);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las sesiones grupales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [psychologistId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psychologistId) return;
    setSubmitting(true);
    try {
      await groupSessionService.createGroupSession({
        title: formData.title,
        description: formData.description,
        psychologistId: psychologistId,
        scheduledAt: formData.scheduledAt,
        durationMinutes: formData.durationMinutes,
        maxParticipants: formData.maxParticipants,
      });
      setShowModal(false);
      resetForm();
      await loadSessions();
    } catch (err) {
      console.error(err);
      setError("Error al crear la sesión grupal.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduledAt: "",
      durationMinutes: 60,
      maxParticipants: 10,
    });
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  if (!psychologistId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="text-center text-red-500">
          <p>No se pudo identificar al psicólogo. Inicia sesión nuevamente.</p>
          <button onClick={() => navigate("/auth")} className="mt-4 px-4 py-2 rounded-lg text-white" style={{ background: TEAL }}>
            Ir a login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Sesiones Grupales</h1>
            <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>
              Solicita nuevas sesiones o gestiona las existentes
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white"
            style={{ background: CORAL, fontWeight: 600 }}
          >
            <Plus size={18} />
            Solicitar sesión grupal
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600">X</button>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
            <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No tienes sesiones grupales aún</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2 rounded-xl text-white"
              style={{ background: TEAL }}
            >
              Solicitar una
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-slate-900 font-bold text-lg">{session.title}</h3>
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                    style={{
                      background: session.status === "APPROVED" ? SAGE :
                        session.status === "PENDING" ? "#F59E0B" :
                          session.status === "CANCELLED" ? "#94A3B8" : CORAL,
                    }}
                  >
                    {session.status === "APPROVED" ? "Aprobada" :
                      session.status === "PENDING" ? "Pendiente" :
                        session.status === "CANCELLED" ? "Cancelada" : "Completada"}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mt-2 line-clamp-2">{session.description}</p>
                <div className="mt-3 space-y-1 text-slate-500 text-xs">
                  <div className="flex items-center gap-2"><Calendar size={14} />{new Date(session.scheduledAt).toLocaleString()}</div>
                  <div className="flex items-center gap-2"><Clock size={14} />{session.durationMinutes} min</div>
                  <div className="flex items-center gap-2"><Users size={14} />{session.maxParticipants} participantes máx.</div>
                </div>

                {/* Botones de acción según estado */}
                <div className="mt-4 flex gap-2">
                  {session.status === "PENDING" && (
                    <button
                      onClick={async () => {
                        if (window.confirm("¿Cancelar esta solicitud?")) {
                          try {
                            await groupSessionService.cancelGroupSession(session.id);
                            await loadSessions();
                          } catch {
                            setError("No se pudo cancelar la sesión.");
                          }
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 text-sm"
                    >
                      Cancelar solicitud
                    </button>
                  )}
                  {session.status === "APPROVED" && (
                    <button
                      onClick={() => alert("🔜 Próximamente: videollamada grupal disponible aquí")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-teal-600 hover:bg-teal-700 text-sm"
                    >
                      <Video size={16} />
                      Unirse a videollamada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal (sin cambios) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-900 font-bold text-xl">Solicitar sesión grupal</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Título" required
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border" />
              <textarea placeholder="Descripción" rows={3} required
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border" />
              <input type="datetime-local" required
                value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-slate-600">Duración (min)</label>
                  <input type="number" min="15" step="15" required
                    value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-600">Máx. participantes</label>
                  <input type="number" min="2" max="50" required
                    value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: Number(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2"
                style={{ background: TEAL, fontWeight: 600 }}
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {submitting ? "Creando..." : "Solicitar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}