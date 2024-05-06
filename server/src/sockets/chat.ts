import { Server, Socket } from 'socket.io';
import User from '../models/user';
export const socketChat = (io: Server, socket: Socket, socketSessions: { [key: string]: User }) => {
  socket.on('chat/message', function (data: { message: string }) {
    const user = socketSessions[socket.id];
    if (!user) return;

    console.log('User sent text in chat : ', user.name, data);
    for (const [socketId, socketUser] of Object.entries(socketSessions)) {
      if (socketUser.game === user.game) {
        io.to(socketId).emit('chat/message', { username: user.name, ...data });
      }
    }
  });
};
