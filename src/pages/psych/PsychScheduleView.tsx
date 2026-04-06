import { useState, useEffect } from "react";
import { Clock, AlertCircle, Loader, Edit, Video, User, MessageSquare } from "lucide-react";
import { userService } from "../../service/userService";
import { useNavigate } from "react-router";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const getModalityIcon = (modality: string) => {
  switch (modality) {
    case "VideoConferencia":
      return <Video size={14} />;
    case "Presencial":
      return <User size={14} />;
    case "Chat":
      return <MessageSquare size={14} />;
    default:
      return <Video size={14} />;
  }
};

const getModalityColor = (modality: string) => {
  switch (modality) {
    case "VideoConferencia":
      return "#3B82F6"; // Azul
    case "Presencial":
      return "#10B981"; // Verde
    case "Chat":
      return "#8B5CF6"; // Morado
    default:
      return "#1A4A5C";
  }
};

export default function PsychScheduleView() {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const profile = await userService.getMyProfile() as any;
        if (profile.id) {
          const scheduleData = await userService.getPsychologistSchedule(profile.id);
          setSchedule(scheduleData);
        }
      } catch (err) {
        setError("No hay agenda configurada aún");
        console.error("Error loading schedule:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Mi Agenda</h1>
            <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>
              Vista de tu horario actual y disponibilidad
            </p>
          </div>
          <button
            onClick={() => navigate("/panel-psicologo/agenda/editar")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: "#E8856A", fontWeight: 600 }}
          >
            <Edit size={18} />
            Editar Agenda
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size={32} className="text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500">Cargando agenda...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <div>
              <p className="font-semibold text-red-900">No hay agenda</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {schedule && !loading && (
          <div className="space-y-6">
            {/* Configuration Summary */}
            <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <h2 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Configuración General</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-slate-600 mb-1" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Duración de sesión</p>
                  <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                    {schedule.sessionDurationMinutes} min
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Zona horaria</p>
                  <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                    {schedule.timeZone}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Días disponibles</p>
                  <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                    {schedule.days?.length || 0} días
                  </p>
                </div>
              </div>
            </div>

            {/* Days Schedule */}
            <div>
              <h2 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Horarios por Día</h2>
              <div className="space-y-3">
                {schedule.days && schedule.days.map((day: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border p-5" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>
                          {day.dayOfWeek}
                        </h3>
                        <p className="text-slate-500 mt-1" style={{ fontSize: "0.85rem" }}>
                          {day.enabled ? "Disponible" : "No disponible"}
                        </p>
                      </div>
                      {day.enabled && (
                        <span className="px-3 py-1 rounded-full text-white text-sm" style={{ background: SAGE, fontWeight: 600 }}>
                          {day.slots?.length || 0} slots
                        </span>
                      )}
                    </div>

                    {day.enabled && day.slots && day.slots.length > 0 && (
                      <div className="mt-4">
                        <p className="text-slate-600 mb-3" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Horarios disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {day.slots.map((slot: any, slotIdx: number) => (
                            <div
                              key={slotIdx}
                              className="px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2"
                              style={{ background: getModalityColor(slot.modality), fontWeight: 600 }}
                            >
                              <span>{slot.time}</span>
                              <div className="flex items-center gap-1 ml-1">
                                {getModalityIcon(slot.modality)}
                              </div>
                              <span className="text-xs opacity-90">({slot.modality})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!day.enabled && (
                      <div className="mt-3 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>Este día no está disponible</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
