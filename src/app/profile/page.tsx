"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormModal from "@/components/FormModal";
import { useAuth } from "@/hooks/useAuth";
import { UserService } from "@/services";
import { UpdateUser } from "@/interfaces";
import {
  User,
  Mail,
  Lock,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";

const userService = new UserService();

export default function ProfilePage() {
  const { user: currentUser, logout, checkAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  });

  const [saveDialog, setSaveDialog] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSaveClick = () => {
    // Validaciones
    if (!formData.username.trim() || !formData.email.trim()) {
      setError("El nombre de usuario y el email son obligatorios");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updateData: UpdateUser = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      };

      // Solo incluir la contraseña si se está cambiando
      if (formData.password) {
        updateData.password = formData.password;
      }

      await userService.updateUser(currentUser.id, updateData);

      // Actualizar el usuario en localStorage y estado
      const updatedUser = { ...currentUser, ...updateData };
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      checkAuth();

      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al actualizar perfil");
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setSaveDialog(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        password: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleLabel = (roleName?: string) => {
    switch (roleName) {
      case "Administrador":
        return "Administrador";
      case "Soporte":
        return "Soporte";
      case "Cliente":
        return "Cliente";
      default:
        return "Usuario";
    }
  };

  if (!currentUser) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Card Principal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Header del card */}
            <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {currentUser.first_name} {currentUser.last_name}
                    </h2>
                    <p className="text-blue-100">@{currentUser.username}</p>
                  </div>
                </div>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {isEditing ? (
                /* Modo Edición */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre de Usuario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de Usuario *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="usuario123"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Juan"
                      />
                    </div>

                    {/* Apellido */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  {/* Cambio de Contraseña */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Cambiar Contraseña
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Deja estos campos en blanco si no deseas cambiar tu contraseña
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nueva Contraseña */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>

                      {/* Confirmar Contraseña */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirmar Contraseña
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveClick}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo Vista */
                <div className="space-y-6">
                  {/* Información Personal */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Información Personal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Nombre de Usuario</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {currentUser.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Nombre Completo</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {currentUser.first_name} {currentUser.last_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rol</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {getRoleLabel(currentUser.role?.role)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Diálogo de confirmación de guardado */}
      <ConfirmDialog
        open={saveDialog}
        title="Guardar Cambios"
        message="¿Estás seguro de que deseas guardar los cambios en tu perfil?"
        confirmText="Guardar"
        cancelText="Cancelar"
        type="info"
        onConfirm={handleSaveConfirm}
        onClose={() => setSaveDialog(false)}
        loading={loading}
      />
    </ProtectedRoute>
  );
}