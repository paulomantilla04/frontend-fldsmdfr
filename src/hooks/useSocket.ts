'use client';

import { useEffect } from 'react';
import { socketService } from '../services/socket.service';

export function useSocket() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !socketService.isConnected()) {
      try {
        socketService.connect(token);
      } catch (error) {
        console.warn('No se pudo conectar al WebSocket:', error);
      }
    }

    return () => {
      // No desconectar aquí porque puede ser usado en múltiples componentes
    };
  }, []);

  return socketService;
}
