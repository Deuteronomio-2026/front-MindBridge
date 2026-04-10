import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { io } from "socket.io-client";
import type { GroupEventNotification } from "../types/groupEvent";
import { featureFlags } from "../config/featureFlags";

interface EventNotificationContextType {
  notifications: GroupEventNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
}

const EventNotificationContext = createContext<EventNotificationContextType | null>(null);

const VIDEO_BACKEND_URL =
  import.meta.env.VITE_VIDEOCHAT_BACKEND_URL ||
  (import.meta.env.VITE_API_URL || "https://gateway-service.orangebay-0b927206.eastus.azurecontainerapps.io/api").replace(/\/api\/?$/, "");

const createNotification = (payload: Partial<GroupEventNotification>): GroupEventNotification => {
  const now = new Date().toISOString();
  return {
    id: payload.id || `event-notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventId: payload.eventId || "",
    type: payload.type || "CREATED",
    title: payload.title || "Evento grupal",
    message: payload.message || "Tienes una nueva actualización de evento",
    createdAt: payload.createdAt || now,
    read: Boolean(payload.read),
  };
};

export function EventNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<GroupEventNotification[]>([]);

  useEffect(() => {
    if (!featureFlags.eventNotifications) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const socket = io(VIDEO_BACKEND_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    const onNotification = (raw: Record<string, unknown>) => {
      const mapped = createNotification({
        id: typeof raw.id === "string" ? raw.id : undefined,
        eventId: typeof raw.eventId === "string" ? raw.eventId : "",
        type: typeof raw.type === "string" ? (raw.type.toUpperCase() as GroupEventNotification["type"]) : "CREATED",
        title: typeof raw.title === "string" ? raw.title : "Evento grupal",
        message: typeof raw.message === "string" ? raw.message : "Hay una actualización de evento",
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
      });

      setNotifications((prev) => [mapped, ...prev].slice(0, 50));
    };

    socket.on("event:notification", onNotification);
    socket.on("notification:group-event-created", onNotification);
    socket.on("notification:group-event-live", onNotification);

    return () => {
      socket.off("event:notification", onNotification);
      socket.off("notification:group-event-created", onNotification);
      socket.off("notification:group-event-live", onNotification);
      socket.disconnect();
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <EventNotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
    </EventNotificationContext.Provider>
  );
}

export function useEventNotifications() {
  const ctx = useContext(EventNotificationContext);
  if (!ctx) {
    throw new Error("useEventNotifications must be used within EventNotificationProvider");
  }
  return ctx;
}
