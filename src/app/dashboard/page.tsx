"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import { UserService, ProjectService } from "@/services";
import { User, Project, TicketType, TicketPriority, TicketStatus } from "@/interfaces";
import { AdminOnly, SupportOnly, StaffOnly, ClientOnly } from "@/components/RoleBased";
import { Ticket, Users, Folder, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";

const userService = new UserService();
const projectService = new ProjectService();

export default function DashboardPage() {
  const { user, getUserFullName, isAdmin, isSupport, isClient } = useAuth();
  const { getTicketTypes, getTicketPriorities, getTicketStatuses } = useTickets();

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketPriorities, setTicketPriorities] = useState<TicketPriority[]>([]);
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const staggerItemYPositive: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        getTicketTypes(),
        getTicketPriorities(),
        getTicketStatuses(),
      ];

      if (isAdmin() || isSupport()) {
        promises.push(
          userService.getUsers(),
          projectService.getProjects()
        );
      }

      const results = await Promise.all(promises);

      setTicketTypes(results[0]);
      setTicketPriorities(results[1]);
      setTicketStatuses(results[2]);

      if (results.length > 3) {
        setUsers(results[3] || []);
        setProjects(results[4] || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas de usuarios por rol
  const getUsersByRole = (roleName: string) => {
    return users.filter((u) => u.role?.role === roleName).length;
  };

  const adminCount = getUsersByRole("Administrador");
  const supportCount = getUsersByRole("Soporte");
  const clientCount = getUsersByRole("Cliente");

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Bienvenida */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ¡Bienvenido, {getUserFullName()}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Este es tu panel de control. Aquí puedes ver un resumen de todas
              tus actividades.
            </p>
          </div>

          {/* Estadísticas - Vista según rol */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Estadística para todos los roles */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tipos de Ticket
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {ticketTypes.length}
                  </p>
                </div>
                <Ticket className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Prioridades
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {ticketPriorities.length}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-orange-500" />
              </div>
            </div>

            <div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {ticketStatuses.length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            {/* Solo para Admin y Soporte */}
            <StaffOnly>
              <div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Usuarios
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {users.length}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </StaffOnly>
          </div>

          {/* Contenido específico por rol */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel para Administradores */}
            <AdminOnly>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Gestión de Usuarios
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Como administrador, tienes acceso completo al sistema.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Usuarios</span>
                    <span className="text-lg font-bold text-purple-600">
                      {users.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Administradores</span>
                    <span className="text-lg font-bold text-purple-600">
                      {adminCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Soporte</span>
                    <span className="text-lg font-bold text-blue-600">
                      {supportCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Clientes</span>
                    <span className="text-lg font-bold text-green-600">
                      {clientCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Proyectos
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {projects.length}
                    </span>
                  </div>
                </div>
              </div>
            </AdminOnly>

            {/* Panel para Soporte */}
            <SupportOnly>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                  Panel de Soporte
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Como miembro del equipo de soporte, puedes gestionar tickets
                  y proyectos.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Proyectos</span>
                    <span className="text-lg font-bold text-blue-600">
                      {projects.length}
                    </span>
                  </div>
                </div>
              </div>
            </SupportOnly>

            {/* Panel para Clientes */}
            <ClientOnly>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <Clock className="w-5 h-5 mr-2 text-green-600" />
                  Mis Tickets
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Aquí puedes ver y gestionar tus tickets.
                </p>
                <a
                  href="/tickets"
                  className="block w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-center"
                >
                  Ver Mis Tickets
                </a>
              </div>
            </ClientOnly>

            {/* Accesos Rápidos */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Accesos Rápidos</h2>
              <div className="space-y-3">
                <a
                  href="/tickets/create"
                  className="block w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition text-center font-medium"
                >
                  Crear Nuevo Ticket
                </a>

                <StaffOnly>
                  <a
                    href="/projects"
                    className="block w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition text-center font-medium"
                  >
                    Ver Proyectos
                  </a>
                </StaffOnly>

                <AdminOnly>
                  <a
                    href="/users"
                    className="block w-full bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition text-center font-medium"
                  >
                    Gestionar Usuarios
                  </a>
                </AdminOnly>
              </div>
            </div>
          </div>

          {/* Lista de Proyectos - Solo para Staff */}
          <StaffOnly>
            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                <Folder className="w-5 h-5 mr-2 text-orange-600" />
                Proyectos Recientes
              </h2>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.slice(0, 6).map((project) => (
                    <div
                      key={project.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.description || "Sin descripción"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No hay proyectos disponibles
                </p>
              )}
            </div>
          </StaffOnly>
        </main>
      </div>
    </ProtectedRoute>
  );
}
