"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EditUserModal from "@/components/EditUserModal";
import { UserService } from "@/services";
import { User } from "@/interfaces";
import { Users, Mail, UserCircle, Shield, Edit } from "lucide-react";

const userService = new UserService();

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (userId: number, roleId: number) => {
    setSavingRole(true);
    setError(null);
    try {
      await userService.updateUser(userId, { roleId });
      setSuccessMessage("Rol actualizado exitosamente");
      await loadUsers();
      setEditingUser(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al actualizar el rol");
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setSavingRole(true);
    setError(null);
    try {
      await userService.deleteUser(userId);
      setSuccessMessage("Usuario eliminado exitosamente");
      await loadUsers();
      setEditingUser(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al eliminar el usuario");
    } finally {
      setSavingRole(false);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "Administrador":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Soporte":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Cliente":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <ProtectedRoute requiredRoles={["Administrador"]}>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra todos los usuarios del sistema
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Usuarios
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {users.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-400">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Administradores
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.role?.role === "Administrador").length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Soporte</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.role?.role === "Soporte").length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.role?.role === "Cliente").length}
                  </p>
                </div>
              </div>

              {/* Lista de Usuarios */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-linear-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                  {user.first_name?.charAt(0)}
                                  {user.last_name?.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.first_name} {user.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <UserCircle className="w-4 h-4 mr-2 text-gray-400" />
                              {user.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                                user.role?.role
                              )}`}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {user.role?.role || "Sin rol"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados</p>
                  </div>
                )}
            </div>
          </>
        )}
      </main>

      {/* Modal de edición */}
      <EditUserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveRole}
        onDelete={handleDeleteUser}
        user={editingUser}
        loading={savingRole}
      />
    </ProtectedRoute>
  );
}