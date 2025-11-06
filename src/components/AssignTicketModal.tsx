"use client";

import { useState, useEffect } from "react";
import { UserService } from "@/services";
import { User } from "@/interfaces";
import { X, UserCircle, Loader, Shield } from "lucide-react";

interface AssignTicketModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (userId: number) => void;
  currentAssignee?: User;
  loading?: boolean;
}

const userService = new UserService();

export default function AssignTicketModal({
  open,
  onClose,
  onAssign,
  currentAssignee,
  loading = false,
}: AssignTicketModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      loadUsers();
      setSelectedUserId(currentAssignee?.id || null);
    }
  }, [open, currentAssignee]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const allUsers = await userService.getUsers();
      
      // Filtrar solo usuarios de Soporte y Admin
      const supportUsers = allUsers.filter(
        (user) => 
          user.role?.role === "Soporte" || 
          user.role?.role === "Administrador"
      );
      
      setUsers(supportUsers);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(selectedUserId);
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const username = user.username.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || username.includes(search);
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Asignar Ticket
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Current assignee info */}
              {currentAssignee && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Asignado actualmente a:</strong> {currentAssignee.first_name}{" "}
                    {currentAssignee.last_name} (@{currentAssignee.username})
                  </p>
                </div>
              )}

              {/* User list */}
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No hay usuarios de soporte disponibles
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        selectedUserId === user.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <UserCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            {user.role?.role === "Administrador" && (
                              <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.role?.role}
                          </p>
                        </div>
                        {selectedUserId === user.id && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedUserId || loading || loadingUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
