// src/services/notificationService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'GROUP_SESSION' | 'OFFER' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(`${API_BASE_URL}/notifications/${userId}`);
    return response.data;
  },

  // Opcional: marcar como leída (si tu backend lo soporta)
  markAsRead: async (notificationId: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/notifications/${userId}/read-all`);
  }
};