import { Socket } from 'socket.io';

interface ChatSocket extends Socket {
  username: string;
  session_id: string;
}

export const socketChat = (socket: Socket) => {
  const sessionsMap: { [key: string]: string } = {};

  const chatSocket = socket as ChatSocket;

  chatSocket.on('chat/user_join', function (data: { [key: string]: unknown }) {
    console.log('User joined chat : ', data);
    chatSocket.username = data.user as string;
    sessionsMap[chatSocket.id] = data.session_id as string;
    for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
      if (sessionId == data.session_id) {
        chatSocket.broadcast.to(socketId).emit('user_join', data.user);
      }
    }
  });

  chatSocket.on('chat/chat_message', function (data: { [key: string]: unknown }) {
    console.log('User sent text : ', data);

    data.username = chatSocket.username;
    for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
      if (sessionId == data.session_id) {
        chatSocket.broadcast.to(socketId).emit('chat_message', data);
      }
    }
  });

  chatSocket.on('chat/disconnect', function (data) {
    console.log('User disconnected chat : ', data);

    const disconnectedSession = sessionsMap[chatSocket.id];
    delete sessionsMap[chatSocket.id];
    for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
      if (sessionId == disconnectedSession) {
        chatSocket.broadcast.to(socketId).emit('user_leave', chatSocket.username);
      }
    }
  });
};
