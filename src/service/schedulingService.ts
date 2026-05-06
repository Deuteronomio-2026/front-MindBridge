import api from "./api";
import type { Appointment, Patient, Psychologist } from "../types/user";
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
  patientEmail?: string;
  patientPhone?: string;
  patientAddress?: string;
}

type StoredAppointmentPrice = {
  price: number;
  psychologistId?: string;
  date?: string;
  time?: string;
};

const APPOINTMENT_PRICE_CACHE_KEY = "mindbridge.appointmentPrices";

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

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
};

const isPresent = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;

  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "undefined" && normalized !== "null";
};

const firstPresent = (...values: unknown[]): unknown => {
  return values.find(isPresent);
};

const toFiniteNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getStoredAppointmentPrices = (): Record<string, StoredAppointmentPrice> => {
  try {
    return JSON.parse(localStorage.getItem(APPOINTMENT_PRICE_CACHE_KEY) || "{}") as Record<string, StoredAppointmentPrice>;
  } catch {
    return {};
  }
};

const appointmentCompositeKey = (appointment: {
  psychologistId?: unknown;
  date?: unknown;
  time?: unknown;
}): string | undefined => {
  const psychologistId = firstPresent(appointment.psychologistId);
  const date = firstPresent(appointment.date);
  const time = firstPresent(appointment.time);

  if (!psychologistId || !date || !time) return undefined;
  return `${psychologistId}|${toIsoDate(date)}|${toHourMinute(time)}`;
};

const rememberAppointmentPrice = (appointment: {
  id?: unknown;
  psychologistId?: unknown;
  date?: unknown;
  time?: unknown;
  price?: unknown;
}) => {
  const price = toFiniteNumber(appointment.price);
  if (!price || price <= 0) return;

  const id = firstPresent(appointment.id);
  const compositeKey = appointmentCompositeKey(appointment);
  const cache = getStoredAppointmentPrices();
  const value: StoredAppointmentPrice = {
    price,
    psychologistId: appointment.psychologistId ? String(appointment.psychologistId) : undefined,
    date: appointment.date ? toIsoDate(appointment.date) : undefined,
    time: appointment.time ? toHourMinute(appointment.time) : undefined,
  };

  if (id) cache[String(id)] = value;
  if (compositeKey) cache[compositeKey] = value;

  try {
    localStorage.setItem(APPOINTMENT_PRICE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // If storage is unavailable, the backend/profile price fallback still keeps the UI usable.
  }
};

const getCachedAppointmentPrice = (raw: Record<string, unknown>): number | undefined => {
  const cache = getStoredAppointmentPrices();
  const id = firstPresent(raw.id, raw.appointmentId, raw.sessionId);
  const byId = id ? cache[String(id)]?.price : undefined;
  if (byId && byId > 0) return byId;

  const compositeKey = appointmentCompositeKey({
    psychologistId: firstPresent(raw.psychologistId, raw.psychologist_id),
    date: firstPresent(raw.date, raw.appointmentDate, raw.startDate, raw.startAt),
    time: firstPresent(raw.time, raw.appointmentTime, raw.startTime, raw.startAt),
  });

  const byCompositeKey = compositeKey ? cache[compositeKey]?.price : undefined;
  return byCompositeKey && byCompositeKey > 0 ? byCompositeKey : undefined;
};

const fullName = (person: Record<string, unknown>): string => {
  const directName = firstPresent(person.fullName, person.displayName);
  if (directName) return String(directName);

  return [firstPresent(person.name, person.firstName), person.lastName]
    .filter(isPresent)
    .join(" ");
};

const getProfilePhoto = (person: Record<string, unknown>): string => {
  return String(
    firstPresent(
      person.photo,
      person.profilePhoto,
      person.profilePicture,
      person.avatar,
      person.image,
      person.imageUrl,
      person.photoUrl,
      "https://via.placeholder.com/120"
    )
  );
};

const getSpecialty = (psychologist: Record<string, unknown>): string => {
  return String(
    firstPresent(
      psychologist.specialty,
      psychologist.specialization,
      psychologist.title,
      psychologist.professionalTitle,
      "General"
    )
  );
};

const getAppointmentPrice = (raw: Record<string, unknown>, psychologist: Record<string, unknown>): number => {
  const payment = asRecord(raw.payment);
  const cachedPrice = getCachedAppointmentPrice(raw);
  if (cachedPrice) return cachedPrice;

  const rawPrice = toFiniteNumber(
    firstPresent(
      raw.price,
      raw.amount,
      raw.totalPrice,
      raw.sessionPrice,
      raw.cost,
      payment.amount,
      payment.price,
      raw.consultationFee
    )
  );
  if (rawPrice && rawPrice > 0) return rawPrice;

  const prices = asRecord(psychologist.prices);
  const modality = normalizeModality(firstPresent(raw.modality, raw.type));
  const modalityPrice = toFiniteNumber(prices[modality]);
  if (modalityPrice && modalityPrice > 0) return modalityPrice;

  const baseFee = toFiniteNumber(
    firstPresent(
      psychologist.consultationFee,
      psychologist.consultation_fee,
      psychologist.sessionPrice,
      psychologist.session_price,
      psychologist.price,
      psychologist.fee
    )
  );
  if (!baseFee || baseFee <= 0) return 0;

  if (modality === "presencial") return baseFee + 50;
  if (modality === "chat") return Math.max(0, baseFee - 30);
  return baseFee;
};

const getContactValue = (person: Record<string, unknown>, ...keys: string[]): string | undefined => {
  const value = firstPresent(...keys.map((key) => person[key]));
  return value ? String(value) : undefined;
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

const mapAppointment = (
  raw: Record<string, unknown>,
  related?: { psychologist?: Psychologist; patient?: Patient }
): SchedulingAppointment => {
  const psychologist = {
    ...asRecord(raw.psychologist),
    ...asRecord(related?.psychologist),
  };
  const patient = {
    ...asRecord(raw.patient),
    ...asRecord(related?.patient),
  };

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
    psychologistId: String(firstPresent(raw.psychologistId, raw.psychologist_id, psychologist.id, "")),
    psychologistName: String(firstPresent(raw.psychologistName, fullName(psychologist), "Psicólogo")),
    psychologistPhoto: String(firstPresent(raw.psychologistPhoto, getProfilePhoto(psychologist))),
    specialty: String(firstPresent(raw.specialty, getSpecialty(psychologist))),
    sessionType: normalizeSessionType(firstPresent(raw.sessionType, raw.attentionType)),
    modality: normalizeModality(firstPresent(raw.modality, raw.type)),
    date: toIsoDate(appointmentDate),
    time: toHourMinute(appointmentTime),
    price: getAppointmentPrice(raw, psychologist),
    status: normalizeStatus(raw.status),
    patientId: patient.id ? String(patient.id) : undefined,
    patientName: String(firstPresent(raw.patientName, fullName(patient), "")) || undefined,
    patientPhoto: String(firstPresent(raw.patientPhoto, getProfilePhoto(patient), "")) || undefined,
    patientEmail: getContactValue(patient, "email", "mail"),
    patientPhone: getContactValue(patient, "phoneNumber", "phone", "telephone", "mobile"),
    patientAddress: getContactValue(patient, "address", "homeAddress"),
  };
};

const getPsychologistsById = async (psychologistIds: string[]): Promise<Map<string, Psychologist>> => {
  const uniqueIds = [...new Set(psychologistIds.filter(Boolean))];
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const psychologist = await userService.getPsychologistById(id);
        return [id, psychologist] as const;
      } catch {
        return null;
      }
    })
  );

  return new Map(entries.filter((entry): entry is readonly [string, Psychologist] => entry !== null));
};

const getPatientsById = async (patientIds: string[]): Promise<Map<string, Patient>> => {
  const uniqueIds = [...new Set(patientIds.filter(Boolean))];
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const patient = await userService.getPatientById(id);
        return [id, patient] as const;
      } catch {
        return null;
      }
    })
  );

  return new Map(entries.filter((entry): entry is readonly [string, Patient] => entry !== null));
};

export const schedulingService = {
  async getAvailability(
    psychologistId: string,
    date: string,
    modality?: Appointment["modality"],
    _sessionType?: Appointment["sessionType"]
  ): Promise<SlotStatus[]> {
    void _sessionType;

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
      price: payload.price,
      amount: payload.price,
    });
    const raw = {
      ...(response.data as Record<string, unknown>),
      psychologistId: payload.psychologistId,
      date: payload.date,
      time: payload.time,
      modality: payload.modality,
      sessionType: payload.sessionType,
      price: payload.price,
    };
    rememberAppointmentPrice(raw);
    return mapAppointment(raw);
  },

  async getMyAppointments(role: SchedulingRole): Promise<SchedulingAppointment[]> {
    const effectiveRole = role ?? getCurrentRole();
    const currentUserId = await getCurrentUserId();
    const response = await api.get("/sessions");
    const list = response.data as BackendSession[];

    const filtered = list.filter((session) => {
      const raw = asRecord(session);
      if (effectiveRole === "PSYCHOLOGIST") {
        return firstPresent(raw.psychologistId, raw.psychologist_id) === currentUserId;
      }
      return firstPresent(raw.patientId, raw.patient_id) === currentUserId;
    });

    const psychologistsById =
      effectiveRole === "PATIENT"
        ? await getPsychologistsById(
            filtered.map((session) => String(firstPresent(asRecord(session).psychologistId, asRecord(session).psychologist_id, "")))
          )
        : new Map<string, Psychologist>();
    const patientsById =
      effectiveRole === "PSYCHOLOGIST"
        ? await getPatientsById(
            filtered.map((session) => String(firstPresent(asRecord(session).patientId, asRecord(session).patient_id, "")))
          )
        : new Map<string, Patient>();

    return filtered.map((a) => {
      const raw = a as unknown as Record<string, unknown>;
      const psychologistId = String(firstPresent(raw.psychologistId, raw.psychologist_id, ""));
      const patientId = String(firstPresent(raw.patientId, raw.patient_id, ""));
      return mapAppointment(raw, {
        psychologist: psychologistsById.get(psychologistId),
        patient: patientsById.get(patientId),
      });
    });
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await api.delete(`/sessions/${appointmentId}`);
  },
};
