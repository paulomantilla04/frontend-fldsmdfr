"use client";

import { useState } from "react";
import { TicketService } from "@/services";
import {
  CreateTicket,
  Ticket,
  UpdateTicket,
  TicketType,
  TicketPriority,
  TicketStatus,
  CreateTicketComment,
  TicketComment,
} from "@/interfaces";

const ticketService = new TicketService();

export const useTickets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = async (data: CreateTicket) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.createTicket(data);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al crear ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id: number, data: UpdateTicket) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.updateTicket(id, data);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al actualizar ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await ticketService.deleteTicket(id);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al eliminar ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTicketTypes = async (): Promise<TicketType[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getTicketTypes();
      return response;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Error al obtener tipos de tickets"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTicketPriorities = async (): Promise<TicketPriority[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getTicketPriorities();
      return response;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Error al obtener prioridades"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTicketStatuses = async (): Promise<TicketStatus[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getTicketStatuses();
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al obtener estados");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (data: CreateTicketComment) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.addTicketComment(data);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al agregar comentario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getComments = async (ticketId: number): Promise<TicketComment[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getTicketComments(ticketId);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al obtener comentarios");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketTypes,
    getTicketPriorities,
    getTicketStatuses,
    addComment,
    getComments,
    loading,
    error,
  };
};
