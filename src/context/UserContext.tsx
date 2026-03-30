import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface Appointment {
  id: string;
  psychologistId: string;
  psychologistName: string;
  psychologistPhoto: string;
  specialty: string;
  sessionType: "primera" | "seguimiento";
  modality: "video" | "presencial" | "chat";
  date: string; // ISO date string
  time: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  photo: string | null;
}

interface UserContextType {
  profile: UserProfile;
  appointments: Appointment[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  name: "Ana García",
  email: "ana.garcia@email.com",
  bio: "Busco apoyo para mejorar mi bienestar emocional y mental.",
  photo: null,
};

const defaultAppointments: Appointment[] = [
  {
    id: "apt-1",
    psychologistId: "2",
    psychologistName: "Dr. Carlos Mendez",
    psychologistPhoto: "https://images.unsplash.com/photo-1666113604293-d34734339acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    specialty: "Terapia Cognitivo-Conductual",
    sessionType: "primera",
    modality: "video",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "10:00",
    price: 55,
    status: "upcoming",
  },
  {
    id: "apt-2",
    psychologistId: "1",
    psychologistName: "Dra. Sofía Ramírez",
    psychologistPhoto: "https://images.unsplash.com/photo-1733685318562-c726472bc1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    specialty: "Ansiedad y Depresión",
    sessionType: "seguimiento",
    modality: "presencial",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "14:00",
    price: 70,
    status: "completed",
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [appointment, ...prev]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a))
    );
  };

  return (
    <UserContext.Provider value={{ profile, appointments, updateProfile, addAppointment, cancelAppointment }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
