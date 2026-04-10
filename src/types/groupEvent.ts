export type GroupEventStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED";

export type GroupEventAudience = "ALL_PATIENTS";

export interface GroupEvent {
  id: string;
  title: string;
  description: string;
  psychologistId: string;
  psychologistName?: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: GroupEventStatus;
  capacity: number;
  enrolledCount: number;
  roomId?: string;
  audience: GroupEventAudience;
}

export interface CreateGroupEventRequest {
  title: string;
  description: string;
  psychologistId: string;
  scheduledStart: string;
  scheduledEnd: string;
  capacity: number;
  audience?: GroupEventAudience;
}

export interface GroupEventNotification {
  id: string;
  eventId: string;
  type: "CREATED" | "STARTING" | "LIVE" | "CANCELLED";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
