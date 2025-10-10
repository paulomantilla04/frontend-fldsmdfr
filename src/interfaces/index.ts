
export interface Login {
  email: string;
  password: string;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  roleId?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
}

export interface CreateTicket {
  title: string;
  description: string;
  typeId: number;
  priorityId: number;
  statusId: number;
  projectId?: number;
  assignedTo?: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  typeId: number;
  priorityId: number;
  statusId: number;
  projectId?: number;
  createdBy: number;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTicket {
  title?: string;
  description?: string;
  typeId?: number;
  priorityId?: number;
  statusId?: number;
  assignedTo?: number;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  comment: string;
  createdAt: string;
}

export interface CreateTicketComment {
  ticketId: number;
  userId: number;
  comment: string;
}

export interface TicketFile {
  id: number;
  ticketId: number;
  fileName: string;
  filePath: string;
  uploadedBy: number;
  createdAt: string;
}

export interface CreateTicketFile {
  ticketId: number;
  fileName: string;
  filePath: string;
  uploadedBy: number;
}

export interface TicketType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketType {
  name: string;
  description?: string;
}

export interface TicketPriority {
  id: number;
  name: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPriority {
  name: string;
  level: number;
}

export interface TicketStatus {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketStatus {
  name: string;
  description?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProject {
  name: string;
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
