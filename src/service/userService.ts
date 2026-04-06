// src/services/userService.ts
import api from './api';
import type { Patient, Psychologist } from '../types/user';

export type Modality = "VideoConferencia" | "Presencial" | "Chat";

export type PsychScheduleSlot = {
  time: string;
  status: "AVAILABLE" | "BOOKED" | "DISABLED";
  modality: Modality;
};

export type PsychScheduleDay = {
  dayOfWeek: string;
  enabled: boolean;
  breakStart: string;
  breakEnd: string;
  slots: PsychScheduleSlot[];
};

export type PsychologistSchedule = {
  timeZone: string;
  sessionDurationMinutes: number;
  days: PsychScheduleDay[];
};

export const userService = {
  // ========================
  // Pacientes
  // ========================
  getPatients: async (): Promise<Patient[]> => {
    const response = await api.get('/user/patients');
    return response.data;
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/user/patients/${id}`);
    return response.data;
  },

  // PUT: actualización completa (todos los campos requeridos)
  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const response = await api.put(`/user/patients/${id}`, data);
    return response.data;
  },

  // PATCH: actualización parcial (solo los campos enviados)
  patchPatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const response = await api.patch(`/user/patients/${id}`, data);
    return response.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await api.delete(`/user/patients/${id}`);
  },

  // ========================
  // Psicólogos
  // ========================
  getPsychologists: async (): Promise<Psychologist[]> => {
    const response = await api.get('/user/psychologists');
    return response.data;
  },

  getPsychologistById: async (id: string): Promise<Psychologist> => {
    const response = await api.get(`/user/psychologists/${id}`);
    return response.data;
  },

  // PUT: actualización completa
  updatePsychologist: async (id: string, data: Partial<Psychologist>): Promise<Psychologist> => {
    const response = await api.put(`/user/psychologists/${id}`, data);
    return response.data;
  },

  // PATCH: actualización parcial
  patchPsychologist: async (id: string, data: Partial<Psychologist>): Promise<Psychologist> => {
    const response = await api.patch(`/user/psychologists/${id}`, data);
    return response.data;
  },

  deletePsychologist: async (id: string): Promise<void> => {
    await api.delete(`/user/psychologists/${id}`);
  },

  // ========================
  // Perfil del usuario autenticado (usando /auth/me)
  // ========================
  getMyProfile: async (): Promise<Patient | Psychologist> => {
    const response = await api.get('/user/auth/me');
    return response.data;
  },

  // Este método ya no es necesario si usas patch, pero lo dejamos por si acaso
  // Se recomienda usar patchPatient o patchPsychologist directamente.
  updateMyProfile: async (
    userId: string,
    role: string,
    data: Partial<Patient | Psychologist>
  ): Promise<Patient | Psychologist> => {
    if (role === 'PATIENT') {
      const response = await api.put(`/user/patients/${userId}`, data);
      return response.data;
    } else if (role === 'PSYCHOLOGIST') {
      const response = await api.put(`/user/psychologists/${userId}`, data);
      return response.data;
    } else {
      throw new Error('Rol no soportado para actualización');
    }
  },

  // ========================
  // Horarios de Psicólogos
  // ========================
  getPsychologistSchedule: async (id: string): Promise<PsychologistSchedule> => {
    const response = await api.get(`/user/psychologists/${id}/schedule`);
    return response.data;
  },

  updatePsychologistSchedule: async (
    id: string,
    scheduleData: PsychologistSchedule
  ): Promise<PsychologistSchedule> => {
    const response = await api.put(`/user/psychologists/${id}/schedule`, scheduleData);
    return response.data;
  },
};