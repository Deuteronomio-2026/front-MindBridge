import api from "./api";
import type { Appointment } from "../types/user";
import { userService, type Modality as ScheduleModality, type PsychologistSchedule } from "./userService";

export type SchedulingRole = "PATIENT" | "PSYCHOLOGIST";

export interface SlotStatus {
  time: string;
  available: boolean;
  modality: "video" | "presencial" | "chat";
}

export interface CreateAppointmentRequest {
  psychologistId: string;
  sessionType: "primera" | "seguimiento";
  modality: "video" | "presencial" | "chat";
  date: string;
  time: string;
  price: number;
}

interface BackendSession {
  id: string;
  patientId: string;
  psychologistId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  attentionType: string;
  status: string;
  createdAt?: string;
}

export interface SchedulingAppointment extends Appointment {
  patientId?: string;
  patientName?: string;
  patientPhoto?: string;
}

const toIsoDate = (value: unknown): string => {
  if (typeof value !== "string") {
    return new Date().toISOString().split("T")[0];
  }

  if (value.includes("T")) {
    return value.split("T")[0];
  }

  return value;
};

const toHourMinute = (value: unknown): string => {
  if (typeof value !== "string") {
    return "09:00";
  }

  if (value.includes("T")) {
    return value.split("T")[1]?.slice(0, 5) ?? "09:00";
  }

  const raw = value.slice(0, 5);
  const [hourText = "09", minuteText = "00"] = raw.split(":");
  return `${String(Number(hourText)).padStart(2, "0")}:${String(Number(minuteText)).padStart(2, "0")}`;
};

const normalizeModality = (value: unknown): Appointment["modality"] => {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized.includes("PRESENCIAL")) return "presencial";
  // Backend only exposes VIRTUAL/PRESENTIAL, so VIRTUAL is rendered as video in the UI.
  return "video";
};

const normalizeSessionType = (value: unknown): Appointment["sessionType"] => {
  const normalized = String(value ?? "").toUpperCase();
  return normalized.includes("SEGUIMIENTO") ? "seguimiento" : "primera";
};

const normalizeStatus = (value: unknown): Appointment["status"] => {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized.includes("CANCEL")) return "cancelled";
  if (normalized.includes("COMPLETE") || normalized.includes("DONE")) return "completed";
  // PENDING and CONFIRMED are both upcoming from the patient/psychologist perspective.
  return "upcoming";
};

const addOneHour = (time: string): string => {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText ?? "0");
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  next.setHours(next.getHours() + 1);
  return `${String(next.getHours()).padStart(2, "0")}:${String(next.getMinutes()).padStart(2, "0")}`;
};

const modalityToBackendType = (modality: Appointment["modality"]): string => {
  if (modality === "presencial") return "PRESENTIAL";
  // Front supports chat UX, but SchedulingService currently accepts only VIRTUAL/PRESENTIAL.
  // We map chat to VIRTUAL until backend adds explicit chat sessions.
  return "VIRTUAL";
};

const sessionTypeToBackend = (sessionType: Appointment["sessionType"]): string => {
  return sessionType === "primera" ? "PRIMERA_VEZ" : "SEGUIMIENTO";
};

const modalityToSchedule = (modality?: Appointment["modality"]): ScheduleModality | undefined => {
  if (!modality) return undefined;
  if (modality === "video") return "VideoConferencia";
  if (modality === "presencial") return "Presencial";
  return "Chat";
};

const scheduleToModality = (modality: ScheduleModality): Appointment["modality"] => {
  if (modality === "Presencial") return "presencial";
  if (modality === "Chat") return "chat";
  return "video";
};

const weekdayToScheduleDay = (date: string): string => {
  const jsDay = new Date(`${date}T00:00:00`).getDay();
  const map = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  return map[jsDay] ?? "";
};

const findScheduleDay = (schedule: PsychologistSchedule, date: string) => {
  const targetDay = weekdayToScheduleDay(date);
  return schedule.days.find((day) => String(day.dayOfWeek).toUpperCase() === targetDay);
};

const getCurrentUserId = async (): Promise<string> => {
  const response = await api.get("/user/auth/me");
  const user = response.data as { id?: string };
  if (!user.id) {
    throw new Error("No se pudo obtener el id del usuario autenticado");
  }
  return user.id;
};

const getCurrentRole = (): SchedulingRole => {
  const token = localStorage.getItem("accessToken");
  if (!token) return "PATIENT";

  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { role?: string };
    const role = String(payload.role ?? "PATIENT").toUpperCase();
    return role === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "PATIENT";
  } catch {
    return "PATIENT";
  }
};

const mapAppointment = (raw: Record<string, unknown>): SchedulingAppointment => {
  const psychologist = (raw.psychologist as Record<string, unknown> | undefined) ?? {};
  const patient = (raw.patient as Record<string, unknown> | undefined) ?? {};
  const psychologistFullName = [psychologist.firstName, psychologist.lastName].filter(Boolean).join(" ");
  const patientFullName = [patient.firstName, patient.lastName].filter(Boolean).join(" ");

  const appointmentDate =
    raw.date ??
    raw.appointmentDate ??
    raw.startDate ??
    raw.startAt;

  const appointmentTime =
    raw.time ??
    raw.appointmentTime ??
    raw.startTime ??
    raw.startAt;

  return {
    id: String(raw.id ?? raw.appointmentId ?? crypto.randomUUID()),
    psychologistId: String(raw.psychologistId ?? psychologist.id ?? ""),
    psychologistName: String((raw.psychologistName ?? psychologist.name ?? psychologistFullName) || "Psicólogo"),
    psychologistPhoto: String(raw.psychologistPhoto ?? psychologist.photo ?? ""),
    specialty: String(raw.specialty ?? psychologist.specialty ?? psychologist.specialization ?? "General"),
    sessionType: normalizeSessionType(raw.sessionType),
    modality: normalizeModality(raw.modality),
    date: toIsoDate(appointmentDate),
    time: toHourMinute(appointmentTime),
    price: Number(raw.price ?? raw.amount ?? 0),
    status: normalizeStatus(raw.status),
    patientId: patient.id ? String(patient.id) : undefined,
    patientName: String((raw.patientName ?? patient.name ?? patientFullName) || "") || undefined,
    patientPhoto: String(raw.patientPhoto ?? patient.photo ?? "") || undefined,
  };
};

export const schedulingService = {
  async getAvailability(
    psychologistId: string,
    date: string,
    modality?: Appointment["modality"],
    //_sessionType?: Appointment["sessionType"]
  ): Promise<SlotStatus[]> {
    const [sessionsResponse, schedule] = await Promise.all([
      api.get("/sessions"),
      userService.getPsychologistSchedule(psychologistId),
    ]);

    const sessions = (sessionsResponse.data as BackendSession[]).filter(
      (s) => s.psychologistId === psychologistId && toIsoDate(s.date) === date && !String(s.status).toUpperCase().includes("CANCEL")
    );

    const bookedByTime = new Set(sessions.map((s) => toHourMinute(s.startTime)));
    const day = findScheduleDay(schedule, date);
    const requestedModality = modalityToSchedule(modality);

    if (!day || !day.enabled) {
      return [];
    }

    return day.slots
      .filter((slot) => slot.status !== "DISABLED")
      .filter((slot) => (requestedModality ? slot.modality === requestedModality : true))
      .map((slot) => {
        const normalizedTime = toHourMinute(slot.time);
        const isSelectable = slot.status === "AVAILABLE" && !bookedByTime.has(normalizedTime);
        return {
          time: normalizedTime,
          available: isSelectable,
          modality: scheduleToModality(slot.modality),
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  async createAppointment(payload: CreateAppointmentRequest): Promise<SchedulingAppointment> {
    const patientId = await getCurrentUserId();
    const response = await api.post("/sessions", {
      patientId,
      psychologistId: payload.psychologistId,
      date: payload.date,
      startTime: payload.time,
      endTime: addOneHour(payload.time),
      type: modalityToBackendType(payload.modality),
      attentionType: sessionTypeToBackend(payload.sessionType),
    });
    return mapAppointment(response.data as Record<string, unknown>);
  },

  async getMyAppointments(role: SchedulingRole): Promise<SchedulingAppointment[]> {
    const effectiveRole = role ?? getCurrentRole();
    const currentUserId = await getCurrentUserId();
    const response = await api.get("/sessions");
    const list = response.data as BackendSession[];

    const filtered = list.filter((session) => {
      if (effectiveRole === "PSYCHOLOGIST") {
        return session.psychologistId === currentUserId;
      }
      return session.patientId === currentUserId;
    });

    return filtered.map((a) => mapAppointment(a as unknown as Record<string, unknown>));
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await api.delete(`/sessions/${appointmentId}`);
  },
};
