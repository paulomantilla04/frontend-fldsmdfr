"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TicketService } from "@/services";
import { 
  Ticket, 
  TicketTypeLabels, 
  TicketPriorityLabels, 
  TicketStatusLabels 
} from "@/interfaces";
import {
  Ticket as TicketIcon,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Calendar,
  Folder,
  Tag,
  AlertTriangle
} from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";

const ticketService = new TicketService();

export default function TicketsPage() {
  const router = useRouter();
  const { isClient, isSupport, isAdmin, user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");

  // Estado para diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    ticketId: null as number | null,
    ticketNumber: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

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
    loadTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchTerm, filterStatus, filterPriority, filterProject]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ticketService.getTickets();

      let filteredData = data;
      if (isClient()) {
        filteredData = data;
      }
      
      setTickets(filteredData);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar tickets");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setDeleteDialog({
      isOpen: true,
      ticketId: ticket.id,
      ticketNumber: `#${ticket.id}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.ticketId) return;

    try {
      setIsDeleting(true);
      await ticketService.deleteTicket(deleteDialog.ticketId);
      
      // Actualizar la lista de tickets
      setTickets(tickets.filter((t) => t.id !== deleteDialog.ticketId));
      
      setDeleteDialog({ isOpen: false, ticketId: null, ticketNumber: "" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al eliminar ticket");
      console.error("Error al eliminar ticket:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, ticketId: null, ticketNumber: "" });
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id?.toString().includes(searchTerm) ||
          ticket.project?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filterStatus !== "all") {
      filtered = filtered.filter((ticket) => ticket.status?.name === filterStatus);
    }

    // Filtro por prioridad
    if (filterPriority !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority?.name === filterPriority);
    }

    // Filtro por proyecto
    if (filterProject !== "all") {
      filtered = filtered.filter((ticket) => ticket.project?.id?.toString() === filterProject);
    }

    setFilteredTickets(filtered);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "closed_support":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "closed_client":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "not_accepted":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "corrected":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    if (priority === "critical") {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Tag className="w-4 h-4 text-orange-500" />;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "open":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Loader className="w-4 h-4 animate-spin" />;
      case "closed_support":
      case "closed_client":
        return <CheckCircle className="w-4 h-4" />;
      case "not_accepted":
        return <XCircle className="w-4 h-4" />;
      case "corrected":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const uniqueProjects = Array.from(
    new Set(tickets.map((t) => t.project?.id).filter(Boolean))
  ).map((id) => tickets.find((t) => t.project?.id === id)?.project);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <TicketIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                  <span>Mis Tickets</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {isClient() && "Gestiona y da seguimiento a tus tickets"}
                  {isSupport() && "Atiende y gestiona los tickets de soporte"}
                  {isAdmin() && "Administra todos los tickets del sistema"}
                </p>
              </div>

              <button
                onClick={() => router.push("/tickets/create")}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Nuevo Ticket
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por #ID, descripción o proyecto..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="open">Abierto</option>
                  <option value="in_progress">En Proceso</option>
                  <option value="closed_support">Cerrado Soporte</option>
                  <option value="closed_client">Cerrado</option>
                  <option value="not_accepted">No Aceptado</option>
                  <option value="corrected">Corregido</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{tickets.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter((t) => t.status?.name === "open").length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Abiertos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {tickets.filter((t) => t.status?.name === "in_progress").length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">En Proceso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {tickets.filter((t) => 
                    t.status?.name === "closed_client" || t.status?.name === "closed_support"
                  ).length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cerrados</p>
              </div>
            </div>
          </div>

          {/* Lista de Tickets */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tickets...</p>
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <TicketIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay tickets
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                  ? "No se encontraron tickets con los filtros aplicados"
                  : "Comienza creando tu primer ticket"}
              </p>
              {!searchTerm && filterStatus === "all" && filterPriority === "all" && (
                <button
                  onClick={() => router.push("/tickets/create")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Crear Primer Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="shrink-0">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <TicketIcon className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Ticket #{ticket.id}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                                  ticket.status?.name
                                )}`}
                              >
                                {getStatusIcon(ticket.status?.name)}
                                {TicketStatusLabels[ticket.status?.name || "pending"]}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>
                        </div>

                        {/* Metadatos */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Folder className="w-4 h-4" />
                            <span>{ticket.project?.name || "Sin proyecto"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            <span>{TicketTypeLabels[ticket.type?.name || "other"]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(ticket.priority?.name)}
                            <span>{TicketPriorityLabels[ticket.priority?.name || "high"]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(ticket.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                          className="flex-1 sm:flex-none px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sm:hidden">Ver</span>
                        </button>
                        
                        {(isAdmin() || isSupport()) && (
                          <>
                            <button
                              onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
                              className="flex-1 sm:flex-none px-4 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="sm:hidden">Editar</span>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteClick(ticket)}
                              className="flex-1 sm:flex-none px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sm:hidden">Eliminar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        open={deleteDialog.isOpen}
        title="Eliminar Ticket"
        message={`¿Estás seguro de que deseas eliminar el ticket ${deleteDialog.ticketNumber}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        loading={isDeleting}
      />
    </ProtectedRoute>
  );
}