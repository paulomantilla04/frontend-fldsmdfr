'use client';

import { useEffect, useState } from 'react';
import { Clock, User, FileText, CheckCircle, UserPlus, MessageSquare, Upload, History } from 'lucide-react';
import { historyService } from '../services/history.service';
import type { TicketHistory, ResolutionTime } from '../interfaces';

interface TicketHistoryPanelProps {
  ticketId: number;
}

export default function TicketHistoryPanel({ ticketId }: TicketHistoryPanelProps) {
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [resolutionTime, setResolutionTime] = useState<ResolutionTime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [ticketId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [historyData, resTime] = await Promise.all([
        historyService.getTicketHistory(ticketId),
        historyService.getResolutionTime(ticketId).catch(() => null),
      ]);
      setHistory(historyData);
      setResolutionTime(resTime);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'status_changed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'assigned':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'comment_added':
        return <MessageSquare className="w-5 h-5 text-yellow-500" />;
      case 'file_uploaded':
        return <Upload className="w-5 h-5 text-indigo-500" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-red-500" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Estado cambiado',
      assigned: 'Asignado',
      comment_added: 'Comentario agregado',
      file_uploaded: 'Archivo subido',
      closed: 'Cerrado',
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial del Ticket
        </h2>
        {resolutionTime && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Tiempo de resolución: {resolutionTime.formatted}</span>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay historial disponible
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="relative pl-8 pb-4 border-l-2 border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
            >
              {/* Icono */}
              <div className="absolute -left-3 top-0 bg-white dark:bg-gray-800 p-1 rounded-full border-2 border-gray-200 dark:border-gray-700">
                {getActionIcon(item.action)}
              </div>

              {/* Contenido */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {getActionLabel(item.action)}
                    </span>
                    {item.user && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span>
                          {item.user.first_name} {item.user.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {item.description}
                  </p>
                )}

                {item.field && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Campo: </span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.field}</span>
                  </div>
                )}

                {(item.oldValue || item.newValue) && (
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    {item.oldValue && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Anterior: </span>
                        <span className="text-red-600 dark:text-red-400 line-through">
                          {item.oldValue}
                        </span>
                      </div>
                    )}
                    {item.newValue && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Nuevo: </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {item.newValue}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
