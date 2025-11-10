"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TicketService, ProjectService } from "@/services";
import { useTicketCatalogs } from "@/hooks";
import {
  Ticket,
  UpdateTicket,
  TicketTypeLabels,
  TicketPriorityLabels,
  TicketStatusLabels,
  Project,
} from "@/interfaces";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Tag,
  Flag,
  Activity,
  Folder,
} from "lucide-react";

const ticketService = new TicketService();
const projectService = new ProjectService();

export default function EditTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const { types, priorities, statuses, loading: catalogsLoading } = useTicketCatalogs();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Diálogo de confirmación
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const [formData, setFormData] = useState<UpdateTicket>({
    projectId: undefined,
    typeId: undefined,
    priorityId: undefined,
    statusId: undefined,
    description: "",
    startDate: "",
    endDate: "",
    raisedDate: "",
  });

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, projectsData] = await Promise.all([
        ticketService.getTicketById(Number(ticketId)),
        projectService.getProjects(),
      ]);

      setTicket(ticketData);
      setProjects(projectsData);

      // Prellenar formulario
      setFormData({
        projectId: ticketData.project?.id,
        typeId: ticketData.type?.id,
        priorityId: ticketData.priority?.id,
        statusId: ticketData.status?.id,
        description: ticketData.description || "",
        startDate: ticketData.startDate ? ticketData.startDate.split("T")[0] : "",
        endDate: ticketData.endDate ? ticketData.endDate.split("T")[0] : "",
        raisedDate: ticketData.raisedDate ? ticketData.raisedDate.split("T")[0] : "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar el ticket");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    if (!formData.typeId || !formData.priorityId || !formData.statusId) {
      setError("Tipo, prioridad y estado son requeridos");
      setShowSaveDialog(false);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await ticketService.updateTicket(Number(ticketId), formData);
      setSuccessMessage("¡Ticket actualizado exitosamente!");
      
      setTimeout(() => {
        router.push("/tickets");
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al actualizar el ticket");
      setShowSaveDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || catalogsLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando ticket...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !ticket) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                Error al cargar el ticket
              </h2>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => router.push("/tickets")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Volver a Tickets
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/tickets")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Tickets
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Editar Ticket #{ticketId}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Modifica la información del ticket
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Folder className="w-4 h-4 inline mr-2" />
                  Proyecto
                </label>
                <select
                  value={formData.projectId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={submitting}
                >
                  <option value="">Sin proyecto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.typeId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, typeId: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecciona tipo</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {TicketTypeLabels[type.name]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Flag className="w-4 h-4 inline mr-2" />
                    Prioridad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priorityId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, priorityId: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecciona prioridad</option>
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {TicketPriorityLabels[priority.name]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Activity className="w-4 h-4 inline mr-2" />
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.statusId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, statusId: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecciona estado</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {TicketStatusLabels[status.name]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fecha de Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={submitting}
                  />
                </div>

                {/* Fecha de Fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={submitting}
                  />
                </div>

                {/* Fecha de Reporte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Reporte
                  </label>
                  <input
                    type="date"
                    value={formData.raisedDate || ""}
                    onChange={(e) => setFormData({ ...formData, raisedDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Describe el ticket en detalle..."
                  rows={6}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.push("/tickets")}
                  className="w-full sm:w-1/2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={submitting}
                >
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onConfirm={confirmSave}
        title="Guardar Cambios"
        message="¿Estás seguro de que deseas guardar los cambios en este ticket?"
        confirmText="Guardar"
        cancelText="Cancelar"
        type="info"
        loading={submitting}
      />
    </ProtectedRoute>
  );
}
