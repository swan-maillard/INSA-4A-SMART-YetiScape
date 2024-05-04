import { Server, Socket } from 'socket.io';
import User from '../models/user';
import { getGameById } from '../services/gamesServices';

export const socketWaitingRoom = (io: Server, socket: Socket, socketSessions: { [key: string]: User }) => {
  socket.on('waiting-room/start-game', async () => {
    const user = socketSessions[socket.id];
    if (!user) return;

    const game = await getGameById(user.game!);
    if (!game) return;

    console.log('Start game: ', game);

    for (const [socketId, socketUser] of Object.entries(socketSessions)) {
      if (socketUser.game === user.game) {
        io.to(socketId).emit('waiting-room/start-game');
      }
    }
  });
};
