import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/tokens.js';

let io: SocketServer | null = null;

export function groupRoom(groupId: string): string {
  return `group:${groupId}`;
}

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

/// Initialise Socket.IO avec authentification JWT.
export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Token manquant'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.join(userRoom(payload.sub));
      return next();
    } catch {
      return next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    // Un client rejoint la room de son groupe actif pour recevoir les notifications.
    socket.on('group:join', (groupId: string) => {
      if (typeof groupId === 'string' && groupId.length > 0) {
        socket.join(groupRoom(groupId));
      }
    });

    socket.on('group:leave', (groupId: string) => {
      if (typeof groupId === 'string' && groupId.length > 0) {
        socket.leave(groupRoom(groupId));
      }
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error("Socket.IO n'est pas initialisé");
  }
  return io;
}
