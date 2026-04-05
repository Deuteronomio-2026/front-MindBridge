export interface Appointment {
  id: string;
  psychologistId: string;
  psychologistName: string;
  psychologistPhoto: string;
  specialty: string;
  sessionType: "primera" | "seguimiento";
  modality: "video" | "presencial" | "chat";
  date: string;
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

export interface UserContextType {
  profile: UserProfile;
  appointments: Appointment[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
}