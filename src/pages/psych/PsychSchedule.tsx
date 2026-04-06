import { useState, useEffect, useCallback } from "react";
import { Check, Clock, Save, AlertCircle, Video, User, MessageSquare } from "lucide-react";
import { userService, type PsychologistSchedule, type PsychScheduleDay, type PsychScheduleSlot, type Modality } from "../../service/userService";
import type { Patient, Psychologist } from "../../types/user";

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

type SlotWithModality = {
  time: string;
  modality: "VideoConferencia" | "Presencial" | "Chat";
};

type DaySchedule = {
  enabled: boolean;
  slots: SlotWithModality[];
  breakStart: string;
  breakEnd: string;
};

const defaultSchedule: Record<string, DaySchedule> = {
  monday: {
    enabled: true,
    slots: [
      { time: "09:00", modality: "VideoConferencia" },
      { time: "10:00", modality: "Presencial" },
      { time: "11:00", modality: "Chat" },
      { time: "14:00", modality: "VideoConferencia" },
      { time: "15:00", modality: "Presencial" },
      { time: "16:00", modality: "Chat" },
    ],
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  tuesday: { enabled: true, slots: [{ time: "09:00", modality: "VideoConferencia" }, { time: "10:00", modality: "Presencial" }, { time: "11:00", modality: "Chat" }, { time: "12:00", modality: "VideoConferencia" }], breakStart: "12:00", breakEnd: "14:00" },
  wednesday: { enabled: true, slots: [{ time: "09:00", modality: "VideoConferencia" }, { time: "10:00", modality: "Presencial" }, { time: "14:00", modality: "Chat" }, { time: "15:00", modality: "VideoConferencia" }, { time: "16:00", modality: "Presencial" }, { time: "17:00", modality: "Chat" }], breakStart: "12:00", breakEnd: "14:00" },
  thursday: { enabled: true, slots: [{ time: "09:00", modality: "VideoConferencia" }, { time: "10:00", modality: "Presencial" }, { time: "11:00", modality: "Chat" }, { time: "12:00", modality: "VideoConferencia" }, { time: "14:00", modality: "Presencial" }], breakStart: "12:00", breakEnd: "14:00" },
  friday: { enabled: true, slots: [{ time: "09:00", modality: "VideoConferencia" }, { time: "10:00", modality: "Presencial" }, { time: "11:00", modality: "Chat" }], breakStart: "12:00", breakEnd: "14:00" },
  saturday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
  sunday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
};

export default function PsychSchedule() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(defaultSchedule);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [saved, setSaved] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [maxPerDay, setMaxPerDay] = useState(6);
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeZone] = useState("America/Bogota");
  const [selectedModality, setSelectedModality] = useState<Modality>("VideoConferencia");

  const dayOfWeekToKey = (dayOfWeek: string): string => {
    const map: Record<string, string> = {
      LUNES: "monday",
      MARTES: "tuesday",
      MIERCOLES: "wednesday",
      JUEVES: "thursday",
      VIERNES: "friday",
      SABADO: "saturday",
      DOMINGO: "sunday",
    };
    return map[dayOfWeek] || dayOfWeek.toLowerCase();
  };

  // Load psychologist profile on mount
  const loadScheduleFromApi = useCallback((apiSchedule: PsychologistSchedule) => {
    const newSchedule: Record<string, DaySchedule> = {
      monday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
      tuesday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
      wednesday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
      thursday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
      friday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
      saturday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
      sunday: { enabled: false, slots: [], breakStart: "12:00", breakEnd: "14:00" },
    };

    if (apiSchedule.days && Array.isArray(apiSchedule.days)) {
      apiSchedule.days.forEach((day: PsychScheduleDay) => {
        const dayKey = dayOfWeekToKey(day.dayOfWeek);
        newSchedule[dayKey] = {
          enabled: day.enabled,
          slots: day.slots.map((s: PsychScheduleSlot) => ({
            time: s.time,
            modality: s.modality,
          })),
          breakStart: day.breakStart ?? "12:00",
          breakEnd: day.breakEnd ?? "14:00",
        };
      });
    }

    setSessionDuration(apiSchedule.sessionDurationMinutes ?? 60);
    setSchedule(newSchedule);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getMyProfile();
        const typedProfile = profile as (Patient | Psychologist) & { id?: string };
        if (typedProfile.id) {
          setPsychologistId(typedProfile.id);
          try {
            const scheduleData = await userService.getPsychologistSchedule(typedProfile.id);
            loadScheduleFromApi(scheduleData);
          } catch {
            console.log("No hay agenda guardada, usando valores por defecto");
          }
        }
      } catch {
        console.error("Error loading psychologist profile");
      }
    };
    loadProfile();
  }, [loadScheduleFromApi]);

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

  const toggleDayEnabled = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const toggleSlot = (day: string, slot: string) => {
    setSchedule((prev) => {
      const dayData = prev[day];
      const existingSlot = dayData.slots.find((s) => s.time === slot);

      // Validar que el slot no esté dentro del horario de descanso
      const isInBreak = slot >= dayData.breakStart && slot < dayData.breakEnd;
      if (isInBreak && !existingSlot) {
        setError("No puedes agregar slots dentro del horario de descanso");
        setTimeout(() => setError(null), 3000);
        return prev;
      }

      if (existingSlot) {
        // Remover slot
        return {
          ...prev,
          [day]: { ...dayData, slots: dayData.slots.filter((s) => s.time !== slot) },
        };
      } else {
        // Agregar slot con modalidad seleccionada
        const newSlots = [...dayData.slots, { time: slot, modality: selectedModality }].sort(
          (a, b) => a.time.localeCompare(b.time)
        );
        return { ...prev, [day]: { ...dayData, slots: newSlots } };
      }
    });
  };

  const updateSlotModality = (day: string, time: string, modality: "VideoConferencia" | "Presencial" | "Chat") => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((s) => (s.time === time ? { ...s, modality } : s)),
      },
    }));
  };

  const dayKeyToDayOfWeek = (day: string): string => {
    const map: Record<string, string> = {
      monday: "LUNES",
      tuesday: "MARTES",
      wednesday: "MIERCOLES",
      thursday: "JUEVES",
      friday: "VIERNES",
      saturday: "SABADO",
      sunday: "DOMINGO",
    };
    return map[day] || day;
  };

  const transformScheduleToApi = (): PsychologistSchedule => {
    const days: PsychScheduleDay[] = Object.entries(schedule)
      .filter(([, dayData]) => dayData.enabled)
      .map(([dayKey, dayData]) => ({
        dayOfWeek: dayKeyToDayOfWeek(dayKey),
        enabled: true,
        breakStart: dayData.breakStart,
        breakEnd: dayData.breakEnd,
        slots: dayData.slots.map((slot): PsychScheduleSlot => ({
          time: slot.time,
          status: "AVAILABLE" as const,
          modality: slot.modality,
        })),
      }));

    return {
      timeZone,
      sessionDurationMinutes: sessionDuration,
      days,
    };
  };

  const handleSave = async () => {
    if (!psychologistId) {
      setError("No se pudo obtener el ID del psicólogo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduleData = transformScheduleToApi();
      console.log("Enviando schedule:", JSON.stringify(scheduleData, null, 2));
      await userService.updatePsychologistSchedule(psychologistId, scheduleData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar la agenda";
      setError(errorMessage);
      console.error("Error saving schedule:", err);
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
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
                  <div className="mb-4">
                    <label className="text-slate-600 mb-2 block" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Selecciona modalidad para agregar slots:
                    </label>
                    <div className="flex gap-3">
                      {(["VideoConferencia", "Presencial", "Chat"] as const).map((mod) => (
                        <button
                          key={mod}
                          onClick={() => setSelectedModality(mod)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
                          style={{
                            background: selectedModality === mod ? TEAL : "white",
                            borderColor: selectedModality === mod ? TEAL : "rgba(26,74,92,0.2)",
                            color: selectedModality === mod ? "white" : "#4a6572",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          {getModalityIcon(mod)}
                          {mod}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-500 mb-4" style={{ fontSize: "0.82rem" }}>
                    Haz clic en un horario para activarlo o desactivarlo como slot disponible
                  </p>

                  {/* Slot grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-6">
                    {timeSlots.map((slot) => {
                      const slotData = currentDay.slots.find((s) => s.time === slot);
                      const isSelected = !!slotData;
                      const isBreak = slot >= currentDay.breakStart && slot < currentDay.breakEnd;
                      return (
                        <div key={slot} className="relative group">
                          <button
                            onClick={() => !isBreak && toggleSlot(selectedDay, slot)}
                            disabled={isBreak}
                            className="w-full py-2 rounded-xl border text-center transition-all group-hover:shadow-md"
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
                            <div className="flex flex-col items-center gap-0.5">
                              <span>{slot}</span>
                              {slotData && <div className="text-xs">{getModalityIcon(slotData.modality)}</div>}
                              {isBreak && <span className="text-xs">Descanso</span>}
                            </div>
                          </button>

                          {isSelected && !isBreak && (
                            <div className="absolute left-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border z-50 p-2 hidden group-hover:block" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                              <p className="text-xs text-slate-600 font-semibold mb-2">Cambiar modalidad:</p>
                              <div className="flex flex-col gap-1">
                                {(["VideoConferencia", "Presencial", "Chat"] as const).map((mod) => (
                                  <button
                                    key={mod}
                                    onClick={() => updateSlotModality(selectedDay, slot, mod)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-slate-100 transition-colors"
                                    style={{ color: slotData?.modality === mod ? TEAL : "#4a6572" }}
                                  >
                                    {getModalityIcon(mod)}
                                    {mod}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
                disabled={loading}
              >
                Limpiar todo
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !psychologistId}
                className="flex-1 py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: saved ? SAGE : loading ? "#94a3b8" : CORAL, fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : saved ? (
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
