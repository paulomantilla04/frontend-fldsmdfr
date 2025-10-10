import { getApiWithToken } from "@/config/axios";
import {
  CreateTicket,
  Ticket,
  UpdateTicket,
  CreateTicketComment,
  TicketComment,
  CreateTicketFile,
  TicketFile,
  TicketType,
  CreateTicketType,
  TicketPriority,
  CreateTicketPriority,
  TicketStatus,
  CreateTicketStatus,
} from "@/interfaces";

export class TicketService {

  async createTicket(data: CreateTicket): Promise<Ticket> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/createTicket", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateTicket(id: number, data: UpdateTicket): Promise<Ticket> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.put(`/updateTicket/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteTicket(id: number): Promise<void> {
    try {
      const apiAxios = await getApiWithToken();
      await apiAxios.delete(`/deleteTicket/${id}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addTicketComment(data: CreateTicketComment): Promise<TicketComment> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/addTicketComment", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(`/tickets/${ticketId}/comments`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addTicketFile(data: CreateTicketFile): Promise<TicketFile> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/addTicketFile", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTicketFiles(ticketId: number): Promise<TicketFile[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(`/tickets/${ticketId}/files`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createTicketType(data: CreateTicketType): Promise<TicketType> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/ticket-types", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTicketTypes(): Promise<TicketType[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get("/ticket-types");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createTicketPriority(
    data: CreateTicketPriority
  ): Promise<TicketPriority> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/ticket-priorities", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTicketPriorities(): Promise<TicketPriority[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get("/ticket-priorities");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createTicketStatus(data: CreateTicketStatus): Promise<TicketStatus> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/ticket-status", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTicketStatuses(): Promise<TicketStatus[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get("/ticket-status");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
