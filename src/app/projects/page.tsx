"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import FormModal from "@/components/FormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ProjectService } from "@/services";
import { Project } from "@/interfaces";
import { Folder, Plus, Edit, Trash2, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";

const projectService = new ProjectService();

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

  // Diálogo de confirmación para eliminar
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", launchDate: "", description: "" });
    setEditingProject(null);
    setFormError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setModalMode("edit");
    setFormData({ 
      name: project.name, 
      launchDate: project.launchDate,
      description: project.description || "" 
    });
    setEditingProject(project);
    setFormError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", launchDate: "", description: "" });
    setEditingProject(null);
    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setFormError("El nombre del proyecto es requerido");
      return;
    }

    if (!formData.launchDate) {
      setFormError("La fecha de lanzamiento es requerida");
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode === "create") {
        await projectService.createProject(formData);
        setSuccessMessage("¡Proyecto creado exitosamente!");
      } else if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
        setSuccessMessage("¡Proyecto actualizado exitosamente!");
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

  return (
    <ProtectedRoute requiredRoles={["Administrador", "Soporte"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

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
                    En Desarrollo
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">0</p>
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
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {project.description || "Sin descripción"}
                        </p>

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
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={submitting}
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
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                disabled={submitting}
              />
            </div>
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
              rows={4}
              disabled={submitting}
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-1/2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {modalMode === "create" ? "Creando..." : "Guardando..."}
                </>
              ) : (
                <>{modalMode === "create" ? "Crear Proyecto" : "Guardar Cambios"}</>
              )}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Diálogo de Confirmación para Eliminar */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto "${projectToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </ProtectedRoute>
  );
}
