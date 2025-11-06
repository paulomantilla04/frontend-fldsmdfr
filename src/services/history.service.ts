import axios from 'axios';
import { TicketHistory, ResolutionTime, AverageResponseTime } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const historyService = {

  async getTicketHistory(ticketId: number): Promise<TicketHistory[]> {
    const response = await axios.get(`${API_URL}/tickets/${ticketId}/history`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getResolutionTime(ticketId: number): Promise<ResolutionTime> {
    const response = await axios.get(`${API_URL}/tickets/${ticketId}/resolution-time`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getAverageResponseTime(userId: number): Promise<AverageResponseTime> {
    const response = await axios.get(`${API_URL}/users/${userId}/avg-response-time`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
