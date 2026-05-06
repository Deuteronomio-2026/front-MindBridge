import axios from 'axios';

// Asegura que la URL base incluya el prefijo /api (tu gateway lo necesita)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gateway-service.orangebay-0b927206.eastus.azurecontainerapps.io/api';

export interface GroupSession {
    id: string;
    title: string;
    description: string;
    psychologistId: string;
    scheduledAt: string;                     
    durationMinutes: number;
    maxParticipants: number;
    currentParticipants: number;
    status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';
}

// (Opcional) Interceptor para añadir el token JWT a todas las peticiones
// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export const groupSessionService = {
    // Obtener sesiones aprobadas (para pacientes)
    getApprovedSessions: async (): Promise<GroupSession[]> => {
        const response = await axios.get<GroupSession[]>(`${API_BASE_URL}/group-sessions/approved`);
        return response.data;
    },

    // Obtener todas las sesiones (para administrador)
    getAllGroupSessions: async (): Promise<GroupSession[]> => {
        const response = await axios.get<GroupSession[]>(`${API_BASE_URL}/group-sessions`);
        return response.data;
    },

    // Solicitar nueva sesión grupal (psicólogo)
    createGroupSession: async (sessionData: Omit<GroupSession, 'id' | 'currentParticipants' | 'status'>): Promise<GroupSession> => {
        const payload = { ...sessionData, scheduledAt: sessionData.scheduledAt };
        const response = await axios.post<GroupSession>(`${API_BASE_URL}/group-sessions`, payload);
        return response.data;
    },

    // Inscribir paciente en sesión grupal (paciente)
    enrollInGroupSession: async (sessionId: string, patientId: string): Promise<GroupSession> => {
        const response = await axios.post(`${API_BASE_URL}/group-sessions/${sessionId}/enroll`, { patientId });
        return response.data;
    },

    // Cancelar sesión (psicólogo/admin)
    cancelGroupSession: async (sessionId: string): Promise<GroupSession> => {
        const response = await axios.patch(`${API_BASE_URL}/group-sessions/${sessionId}/cancel`);
        return response.data;
    },

    // Aprobar sesión (admin)
    approveGroupSession: async (sessionId: string): Promise<GroupSession> => {
        const response = await axios.patch(`${API_BASE_URL}/group-sessions/${sessionId}/approve`);
        return response.data;
    },

    // Eliminar sesión (solo admin, no aprobadas)
    deleteGroupSession: async (sessionId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/group-sessions/${sessionId}`);
    },

    // Obtener sesiones de un psicólogo específico (psicólogo)
    getPsychologistSessions: async (psychologistId: string): Promise<GroupSession[]> => {
        const response = await axios.get(`${API_BASE_URL}/group-sessions/psychologist/${psychologistId}`);
        return response.data;
    },
};