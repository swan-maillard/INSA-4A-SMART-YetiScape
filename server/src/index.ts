import express, { Application } from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes';
import gamesRoutes from './routes/gamesRoutes';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';
import { checkAuthAccessGame } from './JWT';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

// Boot express
const app: Application = express();

const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

const sessionsMap: { [key: string]: string } = {};

// Specify allowed origins
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'], // Add other origins as needed
};

// Use the CORS middleware with options
app.use(cors());

const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Application routing
app.use('/users', usersRoutes);
app.use('/games', gamesRoutes);
app.use('/game', checkAuthAccessGame, gameRoutes);

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
    for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
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

http.listen(port, () => console.log(`Server is listening on port ${port}`));
