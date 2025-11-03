
// ==================== User Interfaces ====================
export interface Login {
  username: string;
  password: string;
}

export type RoleType = "Cliente" | "Administrador" | "Soporte";

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface RoleEntity {
  id: number;
  role: RoleType;
  permissions?: Permission[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role?: RoleEntity;
}

export interface CreateUser {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  role?: RoleType;
}

export interface UpdateUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==================== Ticket Interfaces ====================
export type TicketTypeName = 'new_requirement' | 'adjustment_request' | 'service_request' | 'failure_report' | 'other';
export type TicketPriorityName = 'high' | 'critical';
export type TicketStatusName = 'pending' | 'open' | 'in_progress' | 'closed_support' | 'closed_client' | 'not_accepted' | 'corrected';

export interface TicketType {
  id: number;
  name: TicketTypeName;
}

export interface CreateTicketType {
  name: TicketTypeName;
}

export interface TicketPriority {
  id: number;
  name: TicketPriorityName;
}

export interface CreateTicketPriority {
  name: TicketPriorityName;
}

export interface TicketStatus {
  id: number;
  name: TicketStatusName;
}

export interface CreateTicketStatus {
  name: TicketStatusName;
}

export interface TicketComment {
  id: number;
  ticket?: Ticket;
  user?: User;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFile {
  id: number;
  ticket?: Ticket;
  fileName: string;
  mimeType: string;
  fileSize: number;
  tag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  project?: Project;
  type?: TicketType;
  priority?: TicketPriority;
  status?: TicketStatus;
  createdBy?: User;
  assignedTo?: User;
  startDate?: string;
  endDate?: string;
  raisedDate?: string;
  description?: string;
  comments?: TicketComment[];
  files?: TicketFile[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicket {
  projectId?: number;
  typeId: number;
  priorityId: number;
  statusId: number;
  description: string;
  startDate?: string;
  endDate?: string;
  raisedDate?: string;
}

export interface UpdateTicket {
  projectId?: number;
  typeId?: number;
  priorityId?: number;
  statusId?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  raisedDate?: string;
}

export interface CreateTicketComment {
  ticketId: number;
  userId: number;
  comment: string;
}

export interface CreateTicketFile {
  ticketId: number;
  file: File;
  tag?: string;
}

// Interfaces de traducción para el frontend
export const TicketTypeLabels: Record<TicketTypeName, string> = {
  new_requirement: 'Nuevo Requerimiento',
  adjustment_request: 'Solicitud de Ajuste',
  service_request: 'Solicitud de Servicio',
  failure_report: 'Reporte de Falla',
  other: 'Otro',
};

export const TicketPriorityLabels: Record<TicketPriorityName, string> = {
  high: 'Alta',
  critical: 'Crítica',
};

export const TicketStatusLabels: Record<TicketStatusName, string> = {
  pending: 'Pendiente',
  open: 'Abierto',
  in_progress: 'En Progreso',
  closed_support: 'Cerrado por Soporte',
  closed_client: 'Cerrado por Cliente',
  not_accepted: 'No Aceptado',
  corrected: 'Corregido',
};

export interface Project {
  id: number;
  name: string;
  launchDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProject {
  name: string;
  launchDate: string;
  description?: string;
}

export interface UpdateProject {
  name?: string;
  launchDate?: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRole {
  name: string;
  description?: string;
}
