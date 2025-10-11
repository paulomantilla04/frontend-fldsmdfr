"use client";

import { useState, useEffect } from "react";
import { TicketService, ProjectService } from "@/services";
import { TicketType, TicketPriority, TicketStatus, Project } from "@/interfaces";

const ticketService = new TicketService();
const projectService = new ProjectService();

export const useTicketCatalogs = () => {
  const [types, setTypes] = useState<TicketType[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [typesData, prioritiesData, statusesData, projectsData] = await Promise.all([
        ticketService.getTicketTypes(),
        ticketService.getTicketPriorities(),
        ticketService.getTicketStatuses(),
        projectService.getProjects(),
      ]);

      setTypes(typesData);
      setPriorities(prioritiesData);
      setStatuses(statusesData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar catálogos");
      console.error("Error cargando catálogos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  return {
    types,
    priorities,
    statuses,
    projects,
    loading,
    error,
    reload: loadCatalogs,
  };
};
