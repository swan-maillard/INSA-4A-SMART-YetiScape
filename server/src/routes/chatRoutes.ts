// chatRoutes.ts

import { Router, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';

// Define a function to create the router with the server instance
export default function createChatRoutes(server: Server) {
  const router = Router();

  // @ts-ignore
  const io = new Server(server, {
    path: '/chat',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const sessionsMap: { [key: string]: string } = {};

  interface CustomSocket extends Socket {
    username?: string;
  }

  io.on('connection', function (socket: CustomSocket) {
    console.log('Socket connected');
    socket.on('user_join', function (data: { [key: string]: unknown }) {
      console.log(data);

      socket.username = data.user as string;
      sessionsMap[socket.id] = data.session_id as string;
      for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
        if (sessionId == data.session_id) {
          socket.broadcast.to(socketId).emit('user_join', data.user);
        }
      }
    });

    socket.on('chat_message', function (data: { [key: string]: unknown }) {
      data.username = socket.username;
      console.log(data);
      for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
        console.log(data, sessionId);
        if (sessionId == data.session_id) {
          socket.broadcast.to(socketId).emit('chat_message', data);
        }
      }
    });

    socket.on('disconnect', function () {
      const disconnectedSession = sessionsMap[socket.id];
      delete sessionsMap[socket.id];
      for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
        if (sessionId == disconnectedSession) {
          socket.broadcast.to(socketId).emit('user_leave', socket.username);
        }
      }
    });
  });

  return { chatRoutes: router, chatServer: server };
}
