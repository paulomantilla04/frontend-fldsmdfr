import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: false,
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado a WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Desconectado de WebSocket');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ Error de conexión WebSocket (no crítico):', error.message);
      });

      this.socket.on('notification', (notification) => {
        console.log('📬 Nueva notificación:', notification);
        this.emit('notification', notification);
      });
    } catch (error) {
      console.warn('⚠️ No se pudo inicializar WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  joinTicket(ticketId: number) {
    this.socket?.emit('join_ticket', ticketId);
  }

  leaveTicket(ticketId: number) {
    this.socket?.emit('leave_ticket', ticketId);
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
