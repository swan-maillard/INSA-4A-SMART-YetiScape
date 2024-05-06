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
import chatRoutes from './routes/chatRoutes';

//
const https = require('https');
const fs = require('fs');
const logger = require('morgan');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, './cert/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './cert/cert.pem')),
};

// Boot express
const app: Application = express();
const http = https.createServer(options, app);

app.use(logger('dev'));

// Use the CORS middleware with options
app.use(cors());

const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// SOCKETS
const socketSessions: { [key: string]: User } = {};

const io = new Server(http, {
  cors: {
    origin: '*',
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

  socket.on('disconnect', function () {
    const user = socketSessions[socket.id];
    if (!user) return;

    console.log('User disconnected from socket: ', user.name);
    delete socketSessions[socket.id];
  });

  socketChat(io, socket, socketSessions);
  socketWaitingRoom(io, socket, socketSessions);
});

app.set('sockets', { io, socketSessions });

// Application routing
app.use('/users', usersRoutes);
app.use('/games', gamesRoutes);
app.use('/game', checkAuthAccessGame, gameRoutes);
app.use('/chat', chatRoutes);

//Inject the peerJS middleware on the /chat route
const ExpressPeerServer = require('peer').ExpressPeerServer;
const peerjs_options = {
  debug: true,
};
const peerServer = ExpressPeerServer(http, peerjs_options);
app.use('/peer', peerServer);

http.listen(port, '0.0.0.0', () => console.log(`Server is listening on port ${port}`));
