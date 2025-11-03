"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { TicketService } from "@/services";
import { 
  Ticket, 
  TicketTypeLabels, 
  TicketPriorityLabels, 
  TicketStatusLabels,
  TicketComment,
  CreateTicketComment
} from "@/interfaces";
import {
  ArrowLeft,
  Calendar,
  Folder,
  Tag,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  User as UserIcon,
  FileText,
  Activity,
  Loader,
  Paperclip,
  X,
  Download,
  File
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import AssignTicketModal from "@/components/AssignTicketModal";
import ChangeStatusModal from "@/components/ChangeStatusModal";

const ticketService = new TicketService();

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isClient, isSupport, isAdmin } = useAuth();
  
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado para comentarios
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  // Estado para diálogos
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  // Estados disponibles (se cargarán desde el backend)
  const [availableStatuses, setAvailableStatuses] = useState<any[]>([]);

  useEffect(() => {
    if (ticketId) {
      loadTicket();
      loadComments();
      loadStatuses();
    }
  }, [ticketId]);

  const loadStatuses = async () => {
    try {
      const statuses = await ticketService.getTicketStatuses();
      setAvailableStatuses(statuses);
    } catch (err) {
      console.error("Error al cargar estados:", err);
    }
  };

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar el ticket");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await ticketService.getTicketComments(ticketId);
      setComments(data);
    } catch (err: any) {
      console.error("Error al cargar comentarios:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newComment.trim() && attachedFiles.length === 0) || !user) return;

    try {
      setAddingComment(true);
      
      // Agregar comentario si hay texto
      if (newComment.trim()) {
        const commentData: CreateTicketComment = {
          ticketId: ticketId,
          userId: user.id,
          comment: newComment.trim()
        };
        await ticketService.addTicketComment(commentData);
      }

      // Subir archivos si hay
      if (attachedFiles.length > 0) {
        setUploadingFiles(true);
        await ticketService.uploadTicketFiles(ticketId, attachedFiles);
        setAttachedFiles([]);
      }

      setNewComment("");
      await loadComments();
      await loadTicket(); // Recargar ticket para actualizar la lista de archivos
    } catch (err: any) {
      console.error("Error al agregar comentario o archivos:", err);
      alert("Error al agregar comentario o archivos");
    } finally {
      setAddingComment(false);
      setUploadingFiles(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validar tamaño (máximo 10MB por archivo)
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} es muy grande. Máximo 10MB por archivo.`);
          return false;
        }
        return true;
      });

      setAttachedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Máximo 5 archivos
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileDownloadUrl = (fileId: number) => {
    return `http://localhost:5000/api/v1/files/${fileId}/download`;
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await ticketService.deleteTicket(ticketId);
      router.push("/tickets");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al eliminar ticket");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAssign = async (userId: number) => {
    try {
      setAssigning(true);
      await ticketService.assignTicket(ticketId, userId);
      await loadTicket(); // Recargar ticket para ver el cambio
      setShowAssignModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al asignar ticket");
    } finally {
      setAssigning(false);
    }
  };

  const handleChangeStatus = async (statusId: number) => {
    try {
      setChangingStatus(true);
      await ticketService.changeTicketStatus(ticketId, statusId);
      await loadTicket(); // Recargar ticket para ver el cambio
      setShowStatusModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al cambiar estado");
    } finally {
      setChangingStatus(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "closed_support":
      case "closed_client":
      case "corrected":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "not_accepted":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    if (!priority) return <AlertCircle className="w-5 h-5" />;
    
    switch (priority.toLowerCase()) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return <Clock className="w-5 h-5" />;
    
    switch (status.toLowerCase()) {
      case "open":
        return <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case "closed_support":
      case "closed_client":
      case "corrected":
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificado";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando ticket...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !ticket) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg p-6">
              <p className="font-medium">{error || "Ticket no encontrado"}</p>
              <button
                onClick={() => router.push("/tickets")}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Volver a tickets
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
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/tickets")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a tickets
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Ticket #{ticket.id}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority?.name)}`}>
                    {getPriorityIcon(ticket.priority?.name)}
                    {TicketPriorityLabels[ticket.priority?.name || "high"]}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status?.name)}`}>
                    {getStatusIcon(ticket.status?.name)}
                    {TicketStatusLabels[ticket.status?.name || "pending"]}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">
                {/* Botón cambiar estado - Todos los usuarios */}
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Cambiar Estado
                </button>

                {/* Botón asignar - Solo Admin y Soporte */}
                {(isAdmin() || isSupport()) && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <UserIcon className="w-4 h-4" />
                    {ticket.assignedTo ? "Reasignar" : "Asignar"}
                  </button>
                )}

                {/* Botón editar - Solo Admin y Soporte */}
                {(isAdmin() || isSupport()) && (
                  <button
                    onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}

                {/* Botón eliminar - Solo Admin y Soporte */}
                {(isAdmin() || isSupport()) && (
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal - Detalles del ticket */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descripción */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Descripción
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {ticket.description || "Sin descripción"}
                </p>
              </div>

              {/* Sección de comentarios */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comentarios ({comments.length})
                </h2>

                {/* Lista de comentarios */}
                <div className="space-y-4 mb-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay comentarios aún
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {comment.user?.first_name} {comment.user?.last_name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario para agregar comentario */}
                <form onSubmit={handleAddComment} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                  />

                  {/* Archivos adjuntos */}
                  {attachedFiles.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {attachedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Paperclip className="w-4 h-4 text-gray-500 shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500 shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    {/* Botón de adjuntar archivos */}
                    <div>
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={attachedFiles.length >= 5}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                          attachedFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Paperclip className="w-4 h-4" />
                        Adjuntar archivos ({attachedFiles.length}/5)
                      </label>
                    </div>

                    {/* Botón enviar */}
                    <button
                      type="submit"
                      disabled={(!newComment.trim() && attachedFiles.length === 0) || addingComment || uploadingFiles}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingComment || uploadingFiles ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          {uploadingFiles ? 'Subiendo archivos...' : 'Enviando...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Columna lateral - Información del ticket */}
            <div className="space-y-6">
              {/* Información general */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Información
                </h2>

                <div className="space-y-4">
                  {/* Proyecto */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Folder className="w-4 h-4" />
                      Proyecto
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {ticket.project?.name || "Sin proyecto"}
                    </p>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Tag className="w-4 h-4" />
                      Tipo
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {TicketTypeLabels[ticket.type?.name || "other"]}
                    </p>
                  </div>

                  {/* Creado por */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <UserIcon className="w-4 h-4" />
                      Creado por
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {ticket.createdBy 
                        ? `${ticket.createdBy.first_name} ${ticket.createdBy.last_name}` 
                        : "No especificado"}
                    </p>
                  </div>

                  {/* Asignado a */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <UserIcon className="w-4 h-4" />
                      Asignado a
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {ticket.assignedTo 
                        ? `${ticket.assignedTo.first_name} ${ticket.assignedTo.last_name}` 
                        : "Sin asignar"}
                    </p>
                  </div>

                  {/* Fecha de creación */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-4 h-4" />
                      Fecha de creación
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>

                  {/* Última actualización */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Clock className="w-4 h-4" />
                      Última actualización
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(ticket.updatedAt)}
                    </p>
                  </div>

                  {/* Fecha de inicio */}
                  {ticket.startDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-4 h-4" />
                        Fecha de inicio
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(ticket.startDate)}
                      </p>
                    </div>
                  )}

                  {/* Fecha de fin */}
                  {ticket.endDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-4 h-4" />
                        Fecha de fin
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(ticket.endDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Archivos adjuntos */}
              {ticket.files && ticket.files.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Archivos adjuntos ({ticket.files.length})
                  </h2>
                  <div className="space-y-2">
                    {ticket.files.map((file) => (
                      <a
                        key={file.id}
                        href={getFileDownloadUrl(file.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="w-5 h-5 text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.tag || file.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(file.createdAt)} • {(file.fileSize / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Ticket"
        message="¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />

      {/* Modal de asignación */}
      <AssignTicketModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
        currentAssignee={ticket?.assignedTo}
        loading={assigning}
      />

      {/* Modal de cambio de estado */}
      <ChangeStatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onChangeStatus={handleChangeStatus}
        currentStatus={ticket?.status}
        availableStatuses={availableStatuses}
        loading={changingStatus}
        userRole={user?.role?.role || null}
      />
    </ProtectedRoute>
  );
}
