import { useState } from "react";
import type { ReactNode } from "react";
import { UserContext } from "./UserContext";
import type { Appointment, UserProfile, UserContextType } from "../types/user";

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
    psychologistPhoto:
      "https://images.unsplash.com/photo-1666113604293-d34734339acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    specialty: "Terapia Cognitivo-Conductual",
    sessionType: "primera",
    modality: "video",
    date: new Date(Date.now() + 3 * 86400000)
      .toISOString()
      .split("T")[0],
    time: "10:00",
    price: 55,
    status: "upcoming",
  },
  {
    id: "apt-2",
    psychologistId: "1",
    psychologistName: "Dra. Sofía Ramírez",
    psychologistPhoto:
      "https://images.unsplash.com/photo-1733685318562-c726472bc1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    specialty: "Ansiedad y Depresión",
    sessionType: "seguimiento",
    modality: "presencial",
    date: new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split("T")[0],
    time: "14:00",
    price: 70,
    status: "completed",
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [appointments, setAppointments] =
    useState<Appointment[]>(defaultAppointments);

  const updateProfile: UserContextType["updateProfile"] = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addAppointment: UserContextType["addAppointment"] = (appointment) => {
    setAppointments((prev) => [appointment, ...prev]);
  };

  const cancelAppointment: UserContextType["cancelAppointment"] = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "cancelled" } : a
      )
    );
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        appointments,
        updateProfile,
        addAppointment,
        cancelAppointment,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}