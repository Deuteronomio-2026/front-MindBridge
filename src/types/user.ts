// src/types/user.ts

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

// Nuevos tipos para pacientes y psicólogos
export interface Patient {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  patientStatus: string;
  registrationDate: string;
  lastModified: string;
  // otros campos opcionales según tu backend
  birthDate?: string;
  medicalHistory?: string[];
  allergies?: string[];
}

export interface Psychologist {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  professionalLicense: string;
  specialization: string;
  yearsOfExperience: number;
  languages: string[];
  biography: string;
  officeLocation: string;
  consultationFee: number;
  consultationDuration: number;
  availabilityStatus: string;
  verificationStatus: string;
  psychologistStatus: string;
  registrationDate: string;
  lastModified: string;
  // opcional: rating, photo, etc.
}