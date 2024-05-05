import express, { Application } from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes';
import gamesRoutes from './routes/gamesRoutes';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';
import { checkAuthAccessGame } from './JWT';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketChat } from './sockets/chat';
import { getUserByName } from './services/usersServices';
import User from './models/user';
import { socketWaitingRoom } from './sockets/waitingRoom';

// Boot express
const app: Application = express();

const http = createServer(app);

// Use the CORS middleware with options
app.use(cors());

const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// SOCKETS
const socketSessions: { [key: string]: User } = {};

const io = new Server(http, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', function (socket: Socket) {
  console.log('Socket connected');

  socket.on('join-game', async (data: { [key: string]: unknown }) => {
    console.log('User joined game : ', data);
    const user = await getUserByName(data.username as string);
    if (user) {
      socketSessions[socket.id] = user;
    }
  });

  socketChat(io, socket, socketSessions);
  socketWaitingRoom(io, socket, socketSessions);
});

app.set('sockets', { io, socketSessions });

// Application routing
app.use('/users', usersRoutes);
app.use('/games', gamesRoutes);
app.use('/game', checkAuthAccessGame, gameRoutes);

http.listen(port, () => console.log(`Server is listening on port ${port}`));
