"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import FormModal from "@/components/FormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ProjectService } from "@/services";
import { Project, ProjectFile } from "@/interfaces";
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Upload,
  File,
  Download,
  X,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FilePlus
} from "lucide-react";
import { 
  getMaxDate, 
  getMinDate, 
  validateDateNotFuture,
  formatDateShort,
  utcToLocalDate
} from "@/utils/dateValidation";

const projectService = new ProjectService();

// Límites de archivo
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain'
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    launchDate: "",
    description: "" 
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Estado para archivos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Diálogo de confirmación para eliminar
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Diálogo para eliminar archivo
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectFiles = async (projectId: number) => {
    setLoadingFiles(true);
    try {
      const files = await projectService.getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (err: any) {
      console.error("Error cargando archivos:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", launchDate: "", description: "" });
    setEditingProject(null);
    setFormError("");
    setSuccessMessage("");
    setSelectedFiles([]);
    setProjectFiles([]);
    setShowModal(true);
  };

  const openEditModal = async (project: Project) => {
    setModalMode("edit");
    setFormData({ 
      name: project.name, 
      launchDate: utcToLocalDate(project.launchDate),
      description: project.description || "" 
    });
    setEditingProject(project);
    setFormError("");
    setSuccessMessage("");
    setSelectedFiles([]);
    setShowModal(true);
    
    // Cargar archivos del proyecto
    await loadProjectFiles(project.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", launchDate: "", description: "" });
    setEditingProject(null);
    setFormError("");
    setSuccessMessage("");
    setSelectedFiles([]);
    setProjectFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar número de archivos
    if (selectedFiles.length + files.length > MAX_FILES) {
      setFormError(`Solo puedes subir un máximo de ${MAX_FILES} archivos`);
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: El archivo es demasiado grande (máx 10MB)`);
        return;
      }

      // Validar tipo
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setFormError(errors.join('. '));
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setFormError("");
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validaciones
    if (!formData.name.trim()) {
      setFormError("El nombre del proyecto es requerido");
      return;
    }

    if (!formData.launchDate) {
      setFormError("La fecha de lanzamiento es requerida");
      return;
    }

    // Validar que la fecha no sea futura
    const dateError = validateDateNotFuture(formData.launchDate, "La fecha de lanzamiento");
    if (dateError) {
      setFormError(dateError);
      return;
    }

    setSubmitting(true);

    try {
      let project: Project;

      if (modalMode === "create") {
        project = await projectService.createProject(formData);
        setSuccessMessage("¡Proyecto creado exitosamente!");
        
        // Subir archivos si hay
        if (selectedFiles.length > 0) {
          setUploadingFiles(true);
          try {
            await projectService.uploadProjectFiles(project.id, selectedFiles);
            setSuccessMessage("¡Proyecto creado y archivos subidos exitosamente!");
          } catch (uploadErr: any) {
            setFormError("Proyecto creado pero hubo un error al subir archivos");
          } finally {
            setUploadingFiles(false);
          }
        }
      } else if (editingProject) {
        project = await projectService.updateProject(editingProject.id, formData);
        setSuccessMessage("¡Proyecto actualizado exitosamente!");
        
        // Subir nuevos archivos si hay
        if (selectedFiles.length > 0) {
          setUploadingFiles(true);
          try {
            await projectService.uploadProjectFiles(editingProject.id, selectedFiles);
            setSuccessMessage("¡Proyecto actualizado y archivos subidos exitosamente!");
          } catch (uploadErr: any) {
            setFormError("Proyecto actualizado pero hubo un error al subir archivos");
          } finally {
            setUploadingFiles(false);
          }
        }
      }

      await loadProjects();
      
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Error al guardar el proyecto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectToDelete(project);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      await projectService.deleteProject(projectToDelete.id);
      setSuccessMessage("Proyecto eliminado exitosamente");
      await loadProjects();
      setShowDeleteDialog(false);
      setProjectToDelete(null);
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al eliminar el proyecto");
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteFile = (file: ProjectFile) => {
    setFileToDelete(file);
    setShowDeleteFileDialog(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete || !editingProject) return;

    setDeletingFile(true);
    try {
      await projectService.deleteProjectFile(editingProject.id, fileToDelete.id);
      await loadProjectFiles(editingProject.id);
      setShowDeleteFileDialog(false);
      setFileToDelete(null);
    } catch (err: any) {
      setFormError("Error al eliminar el archivo");
    } finally {
      setDeletingFile(false);
    }
  };

  const handleDownloadFile = async (file: ProjectFile) => {
    if (!editingProject) return;

    try {
      const blob = await projectService.downloadProjectFile(editingProject.id, file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setFormError("Error al descargar el archivo");
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimetype.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (mimetype.includes('zip') || mimetype.includes('compressed')) return <FileArchive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <ProtectedRoute requiredRoles={["Administrador", "Soporte"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Folder className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-orange-600 shrink-0" />
                <span>Proyectos</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Gestiona todos los proyectos del sistema
              </p>
            </div>
            <button 
              onClick={openCreateModal}
              className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Nuevo Proyecto
            </button>
          </div>

          {/* Success Message */}
          {successMessage && !showModal && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-start text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start text-sm sm:text-base">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Cargando proyectos...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Proyectos
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {projects.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {projects.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-blue-500 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Con Archivos
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {projects.filter(p => p.files && p.files.length > 0).length}
                  </p>
                </div>
              </div>

              {/* Grid de Proyectos */}
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg shrink-0">
                              <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                {project.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDateShort(project.launchDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {project.description || "Sin descripción"}
                        </p>

                        {project.files && project.files.length > 0 && (
                          <div className="mb-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FilePlus className="w-4 h-4 mr-1" />
                            {project.files.length} archivo{project.files.length !== 1 ? 's' : ''}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {project.id}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEditModal(project)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                              title="Editar proyecto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(project.id, project.name)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                              title="Eliminar proyecto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 sm:p-12 text-center">
                  <Folder className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No hay proyectos
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                    Comienza creando tu primer proyecto
                  </p>
                  <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
                  >
                    Crear Proyecto
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal Crear/Editar Proyecto */}
      <FormModal
        open={showModal}
        onClose={closeModal}
        title={modalMode === "create" ? "Nuevo Proyecto" : "Editar Proyecto"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Izquierda - Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Información del Proyecto
              </h3>

              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Ej: Sistema de Tickets"
                  required
                  disabled={submitting || uploadingFiles}
                />
              </div>

              {/* Campo Fecha de Lanzamiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Lanzamiento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.launchDate}
                    onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                    max={getMaxDate()}
                    min={getMinDate()}
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    disabled={submitting || uploadingFiles}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  La fecha no puede ser posterior a hoy ({formatDateShort(new Date())})
                </p>
              </div>

              {/* Campo Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Describe el proyecto..."
                  rows={6}
                  disabled={submitting || uploadingFiles}
                />
              </div>
            </div>

            {/* Columna Derecha - Archivos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Archivos del Proyecto
              </h3>

              {/* Área de carga de archivos */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={submitting || uploadingFiles}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Haz clic para subir archivos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Máx {MAX_FILES} archivos de 10MB c/u
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF, DOC, XLS, IMG, ZIP
                  </p>
                </label>
              </div>

              {/* Lista de archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Archivos a subir ({selectedFiles.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition shrink-0"
                          disabled={submitting || uploadingFiles}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Archivos existentes (solo en modo edición) */}
              {modalMode === "edit" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Archivos existentes
                  </p>
                  {loadingFiles ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : projectFiles.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {projectFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(file.mimetype)}
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {file.originalName}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(file)}
                              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                              title="Eliminar"
                              disabled={deletingFile}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay archivos adjuntos
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-1/2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              disabled={submitting || uploadingFiles}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={submitting || uploadingFiles}
            >
              {submitting || uploadingFiles ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {uploadingFiles ? "Subiendo archivos..." : modalMode === "create" ? "Creando..." : "Guardando..."}
                </>
              ) : (
                <>{modalMode === "create" ? "Crear Proyecto" : "Guardar Cambios"}</>
              )}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Diálogo de Confirmación para Eliminar Proyecto */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto "${projectToDelete?.name}"? Esta acción eliminará también todos los archivos asociados y no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />

      {/* Diálogo de Confirmación para Eliminar Archivo */}
      <ConfirmDialog
        open={showDeleteFileDialog}
        onClose={() => {
          setShowDeleteFileDialog(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDeleteFile}
        title="Eliminar Archivo"
        message={`¿Estás seguro de que deseas eliminar el archivo "${fileToDelete?.originalName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deletingFile}
      />
    </ProtectedRoute>
  );
}
