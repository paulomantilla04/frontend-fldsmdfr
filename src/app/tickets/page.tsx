"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Pagination from "@/components/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TicketService, PaginatedTicketsResponse } from "@/services/ticket.service";
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
  Loader2,
  Calendar,
  Folder,
  Tag,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

const ticketService = new TicketService();

export default function TicketsPage() {
  const router = useRouter();
  const { isClient, isSupport, isAdmin, user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [itemsPerPage] = useState(50);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Estado para diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    ticketId: null as number | null,
    ticketNumber: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [currentPage, searchTerm, filterStatus, filterPriority, filterProject]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {
        search: searchTerm,
        status: filterStatus,
        priority: filterPriority,
        project: filterProject,
      };

      const response = await ticketService.getTicketsPaginated(
        currentPage,
        itemsPerPage,
        filters
      );

      let filteredData = response.tickets;

      // Filtrar por usuario si es cliente
      if (isClient() && user) {
        filteredData = filteredData.filter((t) => t.createdBy?.id === user.id);
      }

      setTickets(filteredData);
      setTotalPages(response.totalPages);
      setTotalTickets(response.total);
    } catch (err: any) {
      console.error("Error cargando tickets:", err);
      setError(err?.response?.data?.message || "Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); 
    switch (filterType) {
      case 'status':
        setFilterStatus(value);
        break;
      case 'priority':
        setFilterPriority(value);
        break;
      case 'project':
        setFilterProject(value);
        break;
    }
  };

  const handleDelete = async (ticketId: number) => {
    if (!isAdmin()) {
      setError("No tienes permisos para eliminar tickets");
      return;
    }

    try {
      setIsDeleting(true);
      await ticketService.deleteTicket(ticketId);
      setDeleteDialog({ isOpen: false, ticketId: null, ticketNumber: "" });
      await loadTickets();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al eliminar el ticket");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "open":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case "closed_support":
      case "closed_client":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "not_accepted":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "corrected":
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "critical":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "closed_support":
      case "closed_client":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "not_accepted":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "corrected":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <TicketIcon className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
              Tickets
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona y consulta todos los tickets del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/tickets/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Ticket
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {(filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all') && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[filterStatus !== 'all', filterPriority !== 'all', filterProject !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Botón de refrescar */}
            <button
              onClick={() => loadTickets()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro de estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="open">Abierto</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="closed_support">Cerrado Soporte</option>
                    <option value="closed_client">Cerrado Cliente</option>
                    <option value="not_accepted">No Aceptado</option>
                    <option value="corrected">Corregido</option>
                  </select>
                </div>

                {/* Filtro de prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                {/* Botón para limpiar filtros */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterProject('all');
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loader */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando tickets...</p>
            </div>
          </div>
        )}

        {/* Tabla de tickets */}
        {!loading && tickets.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      #ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          {TicketTypeLabels[ticket.type?.name as keyof typeof TicketTypeLabels] || ticket.type?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-gray-400" />
                          {ticket.project?.name || "Sin proyecto"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status?.name || "")}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(ticket.status?.name || "")}`}>
                            {TicketStatusLabels[ticket.status?.name as keyof typeof TicketStatusLabels] || ticket.status?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(ticket.priority?.name || "")}`}>
                          {TicketPriorityLabels[ticket.priority?.name as keyof typeof TicketPriorityLabels] || "Normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/tickets/${ticket.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {isAdmin() && (
                            <button
                              onClick={() => setDeleteDialog({
                                isOpen: true,
                                ticketId: ticket.id,
                                ticketNumber: `#${ticket.id}`,
                              })}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Eliminar ticket"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalTickets}
              itemsPerPage={itemsPerPage}
              loading={loading}
            />
          </div>
        )}

        {/* Sin resultados */}
        {!loading && tickets.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron tickets
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer ticket'}
            </p>
            <button
              onClick={() => router.push("/tickets/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Crear Ticket
            </button>
          </div>
        )}

        {/* Diálogo de confirmación de eliminación */}
        <ConfirmDialog
          open={deleteDialog.isOpen}
          title="Eliminar Ticket"
          message={`¿Estás seguro de que deseas eliminar el ticket ${deleteDialog.ticketNumber}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => deleteDialog.ticketId && handleDelete(deleteDialog.ticketId)}
          onClose={() => setDeleteDialog({ isOpen: false, ticketId: null, ticketNumber: "" })}
          loading={isDeleting}
          type="danger"
        />
      </main>
    </ProtectedRoute>
  );
}
