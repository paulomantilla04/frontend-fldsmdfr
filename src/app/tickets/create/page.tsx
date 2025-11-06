"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { useTicketCatalogs } from "@/hooks/useTicketCatalogs";
import { TicketService } from "@/services";
import { Ticket, ArrowLeft, Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { TicketTypeLabels, TicketPriorityLabels, TicketStatusLabels } from "@/interfaces";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ticketService = new TicketService();

export default function CreateTicketPage() {
  const router = useRouter();
  const { createTicket, loading: ticketLoading } = useTickets();
  const { types, priorities, statuses, projects, loading: catalogsLoading } = useTicketCatalogs();

  const [formData, setFormData] = useState({
    description: "",
    typeId: 0,
    priorityId: 0,
    projectId: 0,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validaciones
    if (!formData.description.trim()) {
      setFormError("La descripción es requerida");
      return;
    }

    if (formData.projectId === 0) {
      setFormError("Selecciona un proyecto");
      return;
    }

    if (formData.typeId === 0) {
      setFormError("Selecciona un tipo de ticket");
      return;
    }

    if (formData.priorityId === 0) {
      setFormError("Selecciona una prioridad");
      return;
    }

    // Buscar automáticamente el estado "Abierto" (open)
    console.log("Estados disponibles:", statuses);
    const openStatus = statuses.find(s => s.name === 'open');
    console.log("Estado 'open' encontrado:", openStatus);
    
    if (!openStatus) {
      setFormError(
        `Error: No se encontró el estado 'Abierto' en la base de datos. ` +
        `Estados disponibles: ${statuses.map(s => s.name).join(", ") || "ninguno"}. ` +
        `Por favor ejecuta los scripts SQL (ver SEED_README.md en backend).`
      );
      return;
    }

    try {
      const ticketData = {
        ...formData,
        statusId: openStatus.id
      };
      
      console.log("Enviando ticket:", ticketData);
 
      const createdTicket = await createTicket(ticketData);
      if (files.length > 0 && createdTicket?.id) {
        try {
          await ticketService.uploadTicketFiles(createdTicket.id, files);
          setSuccessMessage("¡Ticket creado exitosamente con archivos adjuntos!");
        } catch (fileError) {
          console.error("Error al subir archivos:", fileError);
          setSuccessMessage("Ticket creado, pero hubo un error al subir algunos archivos.");
        }
      } else {
        setSuccessMessage("¡Ticket creado exitosamente! El estado inicial es 'Abierto'.");
      }

      setTimeout(() => {
        router.push("/tickets");
      }, 2000);
    } catch (err: any) {
      console.error("Error al crear ticket:", err);
      console.error("Respuesta del servidor:", err?.response?.data);
      
      const errorMessage = err?.response?.data?.message || err?.message || "Error desconocido al crear el ticket";
      setFormError(`Error del servidor: ${errorMessage}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validar tamaño de archivos
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      setFormError(`Los siguientes archivos exceden el límite de 10MB: ${oversizedFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    setFormError("");
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (catalogsLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando catálogos...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Volver
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center flex-wrap">
              <Ticket className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600 hrink-0" />
              <span>Crear Nuevo Ticket</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Completa el formulario para crear un nuevo ticket
            </p>
          </div>

          {/* Mensajes */}
          {formError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start text-sm sm:text-base">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 shrink-0" />
              <span className="wrap-break-words">{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-start text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 hrink-0" />
              <span className="wrap-break-words">{successMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proyecto *
                </label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: parseInt(e.target.value) })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Seleccione un proyecto...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {projects.length === 0 && (
                  <p className="mt-1 text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                    No hay proyectos disponibles. Contacta al administrador.
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describa el problema o solicitud en detalle"
                />
              </div>

              {/* Selectores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.typeId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        typeId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seleccione...</option>
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
                    Prioridad *
                  </label>
                  <select
                    required
                    value={formData.priorityId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priorityId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seleccione...</option>
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {TicketPriorityLabels[priority.name]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado Automático */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado Inicial
                  </label>
                  <div className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span>Abierto (automático)</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    El ticket se creará con estado "Abierto"
                  </p>
                </div>
              </div>

              {/* Adjuntar archivos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adjuntar archivos (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium">
                      Haz clic para seleccionar archivos
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="*/*"
                    />
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                    Tamaño máximo por archivo: 10MB
                  </p>
                </div>

                {/* Lista de archivos seleccionados */}
                {files.length > 0 && (
                  <div className="mt-3 sm:mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="shrink-0 text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {ticketLoading ? "Creando..." : "Crear Ticket"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}