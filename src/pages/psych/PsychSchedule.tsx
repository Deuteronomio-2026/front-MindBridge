import { useState } from "react";
import { Check, Clock, Save} from "lucide-react";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const daysOfWeek = [
  { key: "monday", label: "Lunes", short: "Lun" },
  { key: "tuesday", label: "Martes", short: "Mar" },
  { key: "wednesday", label: "Miércoles", short: "Mié" },
  { key: "thursday", label: "Jueves", short: "Jue" },
  { key: "friday", label: "Viernes", short: "Vie" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

const timeSlots = Array.from({ length: 22 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

type DaySchedule = {
  enabled: boolean;
  slots: string[];
  breakStart: string;
  breakEnd: string;
};

const defaultSchedule: Record<string, DaySchedule> = {
  monday: { enabled: true, slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], breakStart: "13:00", breakEnd: "14:00" },
  tuesday: { enabled: true, slots: ["09:00", "10:00", "11:00", "12:00"], breakStart: "12:00", breakEnd: "14:00" },
  wednesday: { enabled: true, slots: ["09:00", "10:00", "14:00", "15:00", "16:00", "17:00"], breakStart: "12:00", breakEnd: "14:00" },
  thursday: { enabled: true, slots: ["09:00", "10:00", "11:00", "12:00", "14:00"], breakStart: "12:00", breakEnd: "14:00" },
  friday: { enabled: true, slots: ["09:00", "10:00", "11:00"], breakStart: "12:00", breakEnd: "14:00" },
  saturday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
  sunday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
};

export default function PsychSchedule() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(defaultSchedule);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [saved, setSaved] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [maxPerDay, setMaxPerDay] = useState(6);

  const toggleDayEnabled = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const toggleSlot = (day: string, slot: string) => {
    setSchedule((prev) => {
      const dayData = prev[day];
      const newSlots = dayData.slots.includes(slot)
        ? dayData.slots.filter((s) => s !== slot)
        : [...dayData.slots, slot].sort();
      return { ...prev, [day]: { ...dayData, slots: newSlots } };
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalSlotsPerWeek = Object.values(schedule).reduce(
    (acc, d) => acc + (d.enabled ? d.slots.length : 0),
    0
  );

  const currentDay = schedule[selectedDay];

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Gestión de Agenda</h1>
          <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>
            Configura tus horarios de atención y disponibilidad
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Day selector + settings */}
          <div className="flex flex-col gap-4">
            {/* Day selector */}
            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="p-4 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Días de trabajo</h3>
              </div>
              <div className="p-2">
                {daysOfWeek.map((day) => {
                  const dayData = schedule[day.key];
                  return (
                    <div
                      key={day.key}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
                      style={{ background: selectedDay === day.key ? FOG : "transparent" }}
                      onClick={() => setSelectedDay(day.key)}
                    >
                      {/* Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleDayEnabled(day.key); }}
                        className="w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0"
                        style={{
                          background: dayData.enabled ? SAGE : "#e2e8f0",
                          width: 36, height: 20,
                        }}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                          style={{ transform: dayData.enabled ? "translateX(18px)" : "translateX(2px)" }}
                        />
                      </button>
                      <div className="flex-1">
                        <p style={{ color: selectedDay === day.key ? TEAL : "#2d4a5a", fontWeight: selectedDay === day.key ? 700 : 500, fontSize: "0.875rem" }}>
                          {day.label}
                        </p>
                        {dayData.enabled && (
                          <p style={{ color: SAGE, fontSize: "0.72rem" }}>{dayData.slots.length} slots</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global settings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <h3 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Configuración</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-slate-600 mb-2 block" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    Duración de sesión
                  </label>
                  <div className="flex gap-2">
                    {[30, 45, 60, 90].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSessionDuration(d)}
                        className="flex-1 py-2 rounded-lg border transition-colors"
                        style={{
                          background: sessionDuration === d ? TEAL : "white",
                          color: sessionDuration === d ? "white" : "#4a6572",
                          borderColor: sessionDuration === d ? TEAL : "rgba(26,74,92,0.2)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {d}min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 mb-2 flex items-center justify-between" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    Máx. sesiones/día
                    <span style={{ color: TEAL, fontWeight: 700 }}>{maxPerDay}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={maxPerDay}
                    onChange={(e) => setMaxPerDay(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: TEAL }}
                  />
                </div>

                <div className="pt-3 border-t" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                  <p className="text-slate-500" style={{ fontSize: "0.78rem" }}>
                    Total slots por semana:{" "}
                    <strong style={{ color: TEAL }}>{totalSlotsPerWeek}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Time slot grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
                <div>
                  <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {daysOfWeek.find((d) => d.key === selectedDay)?.label}
                  </h3>
                  {currentDay.enabled && (
                    <p style={{ color: SAGE, fontSize: "0.8rem" }}>
                      {currentDay.slots.length} slots configurados
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!currentDay.enabled && (
                    <button
                      onClick={() => toggleDayEnabled(selectedDay)}
                      className="px-3 py-1.5 rounded-lg text-white transition-colors"
                      style={{ background: SAGE, fontSize: "0.8rem", fontWeight: 600 }}
                    >
                      Activar día
                    </button>
                  )}
                </div>
              </div>

              {!currentDay.enabled ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: FOG }}>
                    <Clock size={28} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-2" style={{ fontWeight: 600 }}>Día inactivo</p>
                  <p className="text-slate-400 text-center mb-5" style={{ fontSize: "0.85rem" }}>
                    Este día no está disponible para citas.
                  </p>
                  <button
                    onClick={() => toggleDayEnabled(selectedDay)}
                    className="px-5 py-2.5 rounded-xl text-white transition-colors"
                    style={{ background: TEAL, fontWeight: 600 }}
                  >
                    Activar {daysOfWeek.find((d) => d.key === selectedDay)?.label}
                  </button>
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-slate-500 mb-4" style={{ fontSize: "0.82rem" }}>
                    Haz clic en un horario para activarlo o desactivarlo como slot disponible
                  </p>

                  {/* Slot grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-6">
                    {timeSlots.map((slot) => {
                      const isSelected = currentDay.slots.includes(slot);
                      const isBreak = slot >= currentDay.breakStart && slot < currentDay.breakEnd;
                      return (
                        <button
                          key={slot}
                          onClick={() => !isBreak && toggleSlot(selectedDay, slot)}
                          disabled={isBreak}
                          className="py-2 rounded-xl border text-center transition-all"
                          style={{
                            background: isBreak
                              ? "#FFF7ED"
                              : isSelected
                              ? TEAL
                              : "white",
                            borderColor: isBreak
                              ? "#FED7AA"
                              : isSelected
                              ? TEAL
                              : "rgba(26,74,92,0.15)",
                            color: isBreak ? "#F59E0B" : isSelected ? "white" : "#4a6572",
                            fontSize: "0.78rem",
                            fontWeight: isSelected ? 700 : 500,
                            cursor: isBreak ? "not-allowed" : "pointer",
                          }}
                        >
                          {slot}
                          {isBreak && <span className="block" style={{ fontSize: "0.6rem" }}>Descanso</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Break time config */}
                  <div className="p-4 rounded-xl border" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
                    <p className="mb-3" style={{ color: "#92400E", fontWeight: 600, fontSize: "0.85rem" }}>
                      ⏱ Horario de descanso
                    </p>
                    <div className="flex items-center gap-3">
                      <select
                        value={currentDay.breakStart}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [selectedDay]: { ...prev[selectedDay], breakStart: e.target.value },
                          }))
                        }
                        className="px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#FED7AA", fontSize: "0.85rem", background: "white" }}
                      >
                        {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span style={{ color: "#92400E" }}>—</span>
                      <select
                        value={currentDay.breakEnd}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [selectedDay]: { ...prev[selectedDay], breakEnd: e.target.value },
                          }))
                        }
                        className="px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#FED7AA", fontSize: "0.85rem", background: "white" }}
                      >
                        {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  Object.keys(schedule).forEach((day) => {
                    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], slots: [] } }));
                  });
                }}
                className="px-5 py-3.5 rounded-xl border transition-colors"
                style={{ borderColor: "rgba(26,74,92,0.2)", color: "#94a3b8", fontWeight: 600 }}
              >
                Limpiar todo
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: saved ? SAGE : CORAL, fontWeight: 700 }}
              >
                {saved ? (
                  <><Check size={18} /> ¡Agenda guardada!</>
                ) : (
                  <><Save size={18} /> Guardar cambios</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
