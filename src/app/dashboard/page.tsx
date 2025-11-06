"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { TicketService, UserService, ProjectService } from "@/services";
import { Ticket, User, Project } from "@/interfaces";
import { 
  Ticket as TicketIcon, 
  Users, 
  Folder, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity,
  FileText,
  UserCheck,
  AlertTriangle,
  Zap,
  BarChart3
} from "lucide-react";
import Link from "next/link";

const ticketService = new TicketService();
const userService = new UserService();
const projectService = new ProjectService();

export default function DashboardPage() {
  const { user, getUserFullName } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Dashboard - Usuario:", user);
    if (user) {
      loadData();
    } else {
      // Si no hay usuario después de 2 segundos, intentar de todas formas
      const timeout = setTimeout(() => {
        if (!user) {
          console.log("No hay usuario después de 2s, intentando cargar datos...");
          loadDataWithoutUser();
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const loadDataWithoutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const ticketsData = await ticketService.getTickets();
      setTickets(ticketsData || []);
      console.log("Tickets cargados:", ticketsData?.length);
    } catch (error: any) {
      console.error("Error cargando tickets:", error);
      setError("Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!user) {
      console.log("loadData: No hay usuario");
      setLoading(false);
      return;
    }
    
    console.log("loadData: Iniciando carga para rol:", user.role?.role);
    setLoading(true);
    setError(null);
    
    try {
      const promises: Promise<any>[] = [
        ticketService.getTickets(),
      ];

      const userRole = user.role?.role;
      if (userRole === "Administrador" || userRole === "Soporte") {
        console.log("Cargando usuarios y proyectos para:", userRole);
        promises.push(
          userService.getUsers(),
          projectService.getProjects()
        );
      }

      const results = await Promise.all(promises);
      console.log("Resultados:", results.map(r => Array.isArray(r) ? r.length : r));

      setTickets(results[0] || []);
      if (results.length > 1) {
        setUsers(results[1] || []);
        setProjects(results[2] || []);
      }
    } catch (error: any) {
      console.error("Error cargando datos:", error);
      setError(error?.response?.data?.message || "Error al cargar los datos");
      
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const userRole = user?.role?.role;
  const pendingTickets = tickets.filter(t => t.status?.name === "pending").length;
  const inProgressTickets = tickets.filter(t => t.status?.name === "in_progress").length;
  const resolvedTickets = tickets.filter(t => 
    t.status?.name === "closed_support" || t.status?.name === "closed_client"
  ).length;
  const totalTickets = tickets.length;

  const myTickets = userRole === "Cliente" ? tickets.filter(t => t.createdBy?.id === user?.id) : [];
  const myPendingTickets = myTickets.filter(t => t.status?.name === "pending").length;
  const myInProgressTickets = myTickets.filter(t => t.status?.name === "in_progress").length;

  const adminCount = users.filter(u => u.role?.role === "Administrador").length;
  const supportCount = users.filter(u => u.role?.role === "Soporte").length;
  const clientCount = users.filter(u => u.role?.role === "Cliente").length;

  console.log("Renderizando dashboard:", { loading, userRole, totalTickets, error });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido, {getUserFullName() || "Usuario"}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Panel de control - Rol: {userRole || "Sin rol"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tickets - Admin/Soporte */}
          {(userRole === "Administrador" || userRole === "Soporte") && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Tickets
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalTickets}
                  </p>
                </div>
                <TicketIcon className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          )}

          {/* Mis Tickets - Cliente */}
          {userRole === "Cliente" && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Mis Tickets
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {myTickets.length}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          )}

          {/* Pendientes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {userRole === "Cliente" ? myPendingTickets : pendingTickets}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* En Progreso */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  En Progreso
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {userRole === "Cliente" ? myInProgressTickets : inProgressTickets}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Resueltos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resueltos
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {resolvedTickets}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Estadísticas del Sistema - Solo Admin/Soporte */}
        {(userRole === "Administrador" || userRole === "Soporte") && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">Administradores: {adminCount}</p>
                <p className="text-gray-600 dark:text-gray-400">Soporte: {supportCount}</p>
                <p className="text-gray-600 dark:text-gray-400">Clientes: {clientCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proyectos</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">Activo</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {totalTickets} tickets totales
              </p>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
