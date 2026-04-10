import api from "./api";
import type { CreateGroupEventRequest, GroupEvent } from "../types/groupEvent";

const EVENTS_BASE_PATH = "/events";

const normalizeEvent = (raw: Record<string, unknown>): GroupEvent => {
  return {
    id: String(raw.id ?? raw.eventId ?? crypto.randomUUID()),
    title: String(raw.title ?? "Evento grupal"),
    description: String(raw.description ?? ""),
    psychologistId: String(raw.psychologistId ?? ""),
    psychologistName: typeof raw.psychologistName === "string" ? raw.psychologistName : undefined,
    scheduledStart: String(raw.scheduledStart ?? raw.startAt ?? new Date().toISOString()),
    scheduledEnd: String(raw.scheduledEnd ?? raw.endAt ?? new Date().toISOString()),
    status: String(raw.status ?? "SCHEDULED").toUpperCase() as GroupEvent["status"],
    capacity: Number(raw.capacity ?? 50),
    enrolledCount: Number(raw.enrolledCount ?? raw.currentParticipants ?? 0),
    roomId: typeof raw.roomId === "string" ? raw.roomId : undefined,
    audience: "ALL_PATIENTS",
  };
};

const mapList = (payload: unknown): GroupEvent[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => normalizeEvent(item as Record<string, unknown>));
};

export const eventService = {
  async listEvents(): Promise<GroupEvent[]> {
    const response = await api.get(EVENTS_BASE_PATH);
    return mapList(response.data);
  },

  async listPsychologistAgenda(): Promise<GroupEvent[]> {
    const response = await api.get(`${EVENTS_BASE_PATH}/psychologist/agenda`);
    return mapList(response.data);
  },

  async listPatientOffers(): Promise<GroupEvent[]> {
    const response = await api.get(`${EVENTS_BASE_PATH}/patient/offers`);
    return mapList(response.data);
  },

  async createEvent(payload: CreateGroupEventRequest): Promise<GroupEvent> {
    const response = await api.post(EVENTS_BASE_PATH, {
      ...payload,
      audience: payload.audience ?? "ALL_PATIENTS",
    });
    return normalizeEvent(response.data as Record<string, unknown>);
  },

  async startEvent(eventId: string): Promise<GroupEvent> {
    const response = await api.post(`${EVENTS_BASE_PATH}/${eventId}/start`);
    return normalizeEvent(response.data as Record<string, unknown>);
  },

  async finishEvent(eventId: string): Promise<GroupEvent> {
    const response = await api.post(`${EVENTS_BASE_PATH}/${eventId}/finish`);
    return normalizeEvent(response.data as Record<string, unknown>);
  },

  async cancelEvent(eventId: string): Promise<GroupEvent> {
    const response = await api.post(`${EVENTS_BASE_PATH}/${eventId}/cancel`);
    return normalizeEvent(response.data as Record<string, unknown>);
  },

  async enrollInEvent(eventId: string): Promise<void> {
    await api.post(`${EVENTS_BASE_PATH}/${eventId}/enroll`);
  },

  async leaveEvent(eventId: string): Promise<void> {
    await api.delete(`${EVENTS_BASE_PATH}/${eventId}/enrollments/me`);
  },
};
