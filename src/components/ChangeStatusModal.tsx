"use client";

import { useState, useEffect } from "react";
import { TicketStatus, TicketStatusLabels } from "@/interfaces";
import { X, Loader, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  onChangeStatus: (statusId: number) => void;
  currentStatus?: TicketStatus;
  availableStatuses: TicketStatus[];
  loading?: boolean;
  userRole: "Cliente" | "Soporte" | "Administrador" | null;
}

export default function ChangeStatusModal({
  open,
  onClose,
  onChangeStatus,
  currentStatus,
  availableStatuses,
  loading = false,
  userRole,
}: ChangeStatusModalProps) {
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  useEffect(() => {
    if (open && currentStatus) {
      setSelectedStatusId(currentStatus.id);
    }
  }, [open, currentStatus]);

  const handleChange = () => {
    if (selectedStatusId && selectedStatusId !== currentStatus?.id) {
      onChangeStatus(selectedStatusId);
    }
  };

  const getStatusIcon = (statusName?: string) => {
    switch (statusName) {
      case "open":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "closed_support":
      case "closed_client":
      case "corrected":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "not_accepted":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (statusName?: string) => {
    switch (statusName) {
      case "open":
        return "border-blue-600 bg-blue-50 dark:bg-blue-900/30";
      case "in_progress":
        return "border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30";
      case "closed_support":
      case "closed_client":
      case "corrected":
        return "border-green-600 bg-green-50 dark:bg-green-900/30";
      case "not_accepted":
        return "border-red-600 bg-red-50 dark:bg-red-900/30";
      default:
        return "border-gray-600 bg-gray-50 dark:bg-gray-900/30";
    }
  };

  // Filtrar estados según rol
  const getAvailableStatuses = () => {
    if (!userRole) return [];

    if (userRole === "Administrador") {
      // Admin puede cambiar a cualquier estado
      return availableStatuses;
    }

    if (userRole === "Soporte") {
      // Soporte puede cambiar a: abierto, en progreso, cerrado soporte, corregido
      return availableStatuses.filter((s) =>
        ["open", "in_progress", "closed_support", "corrected"].includes(s.name)
      );
    }

    if (userRole === "Cliente") {
      // Cliente solo puede cerrar tickets
      return availableStatuses.filter((s) => s.name === "closed_client");
    }

    return [];
  };

  const filteredStatuses = getAvailableStatuses();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cambiar Estado del Ticket
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
        <div className="p-6">
          {/* Current status info */}
          {currentStatus && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Estado actual:</strong> {TicketStatusLabels[currentStatus.name]}
              </p>
            </div>
          )}

          {/* Status list */}
          <div className="space-y-2 mb-4">
            {filteredStatuses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No tienes permisos para cambiar el estado de este ticket
              </p>
            ) : (
              filteredStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatusId(status.id)}
                  disabled={status.id === currentStatus?.id}
                  className={`w-full p-3 rounded-lg border-2 transition text-left ${
                    selectedStatusId === status.id
                      ? getStatusColor(status.name)
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  } ${
                    status.id === currentStatus?.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status.name)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {TicketStatusLabels[status.name]}
                      </p>
                      {status.id === currentStatus?.id && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Estado actual
                        </p>
                      )}
                    </div>
                    {selectedStatusId === status.id &&
                      status.id !== currentStatus?.id && (
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

          {/* Info based on role */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {userRole === "Cliente" && (
              <p>
                ℹ️ Como cliente, solo puedes cerrar tus tickets cuando estés
                satisfecho con la solución.
              </p>
            )}
            {userRole === "Soporte" && (
              <p>
                ℹ️ Como soporte, puedes marcar tickets como en progreso, cerrados
                o corregidos.
              </p>
            )}
            {userRole === "Administrador" && (
              <p>ℹ️ Como administrador, tienes acceso completo a todos los estados.</p>
            )}
          </div>
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
            onClick={handleChange}
            disabled={
              !selectedStatusId ||
              selectedStatusId === currentStatus?.id ||
              loading ||
              filteredStatuses.length === 0
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              "Cambiar Estado"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
