"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { UserService } from "@/services";
import { User } from "@/interfaces";
import { Users, Mail, UserCircle, Shield } from "lucide-react";

const userService = new UserService();

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "Administrador":
        return "bg-purple-100 text-purple-800";
      case "Soporte":
        return "bg-blue-100 text-blue-800";
      case "Cliente":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute requiredRoles={["Administrador"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-purple-600" />
              Gestión de Usuarios
            </h1>
            <p className="mt-2 text-gray-600">
              Administra todos los usuarios del sistema
            </p>
          </div>

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
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-gray-600">
                    Total Usuarios
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-400">
                  <p className="text-sm font-medium text-gray-600">
                    Administradores
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter((u) => u.role?.role === "Administrador").length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-600">Soporte</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter((u) => u.role?.role === "Soporte").length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter((u) => u.role?.role === "Cliente").length}
                  </p>
                </div>
              </div>

              {/* Lista de Usuarios */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                  {user.first_name?.charAt(0)}
                                  {user.last_name?.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
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
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Editar
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay usuarios registrados</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
