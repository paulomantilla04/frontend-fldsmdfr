"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Shield, Save, Trash2, AlertTriangle } from "lucide-react";
import { User as UserInterface } from "@/interfaces";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (userId: number, roleId: number) => Promise<void>;
  onDelete?: (userId: number) => Promise<void>;
  user: UserInterface | null;
  loading?: boolean;
}

const ROLES = [
  { id: 1, name: "Administrador", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: 2, name: "Soporte", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: 3, name: "Cliente", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
];

export default function EditUserModal({
  open,
  onClose,
  onSave,
  onDelete,
  user,
  loading = false,
}: EditUserModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number>(3);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.role?.id) {
      setSelectedRoleId(user.role.id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await onSave(user.id, selectedRoleId);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (user && onDelete) {
      setDeleting(true);
      try {
        await onDelete(user.id);
        setShowDeleteConfirm(false);
        onClose();
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  if (!open || !user) return null;

  const selectedRole = ROLES.find(r => r.id === selectedRoleId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Editar Usuario
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Diálogo de confirmación de eliminación */}
          {showDeleteConfirm ? (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ¿Eliminar Usuario?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-400">
                  <strong>Usuario a eliminar:</strong><br />
                  {user.first_name} {user.last_name} ({user.email})
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar Usuario
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Información del usuario */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Selector de rol */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Rol del Usuario
                    </label>
                    <div className="space-y-2">
                      {ROLES.map((role) => (
                        <label
                          key={role.id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                            selectedRoleId === role.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.id}
                            checked={selectedRoleId === role.id}
                            onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {role.name}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                                ID: {role.id}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {role.id === 1 && "Acceso completo al sistema, incluida gestión de usuarios."}
                              {role.id === 2 && "Puede gestionar tickets y proyectos del sistema."}
                              {role.id === 3 && "Rol predeterminado. Puede crear y ver sus propios tickets."}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Info sobre el cambio */}
                  {selectedRoleId !== user.role?.id && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        <strong>Cambio de rol:</strong> {user.role?.role || "Cliente"} → {selectedRole?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || selectedRoleId === user.role?.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
