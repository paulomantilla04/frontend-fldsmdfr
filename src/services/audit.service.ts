import axios from 'axios';
import { AuditLog, AuditLogFilters, AuditLogsResponse } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const auditService = {

  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogsResponse> {
    const response = await axios.get(`${API_URL}/audit/logs`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  async getEntityAuditLogs(entityType: string, entityId: number): Promise<AuditLog[]> {
    const response = await axios.get(`${API_URL}/audit/${entityType}/${entityId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async exportToCSV(filters?: AuditLogFilters): Promise<Blob> {
    const response = await axios.get(`${API_URL}/audit/export`, {
      headers: getAuthHeader(),
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadCSV(blob: Blob, filename: string = 'audit_logs.csv') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
