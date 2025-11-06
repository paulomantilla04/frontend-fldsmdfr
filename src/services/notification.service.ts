import axios from 'axios';
import { Notification } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const notificationService = {
  // Obtener notificaciones del usuario
  async getNotifications(limit: number = 20): Promise<Notification[]> {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeader(),
      params: { limit },
    });
    return response.data;
  },

  // Obtener contador de notificaciones no leídas
  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: getAuthHeader(),
    });
    return response.data.count;
  },

  // Marcar notificación como leída
  async markAsRead(notificationId: number): Promise<void> {
    await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers: getAuthHeader() }
    );
  },

  // Marcar todas como leídas
  async markAllAsRead(): Promise<void> {
    await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      { headers: getAuthHeader() }
    );
  },

  // Eliminar notificación
  async deleteNotification(notificationId: number): Promise<void> {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: getAuthHeader(),
    });
  },
};
