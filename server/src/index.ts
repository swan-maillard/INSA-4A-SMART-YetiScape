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

// Boot express
const app: Application = express();

const http = createServer(app);

// Use the CORS middleware with options
app.use(cors());

const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Application routing
app.use('/users', usersRoutes);
app.use('/games', gamesRoutes);
app.use('/game', checkAuthAccessGame, gameRoutes);

// SOCKETS

const io = new Server(http, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', function (socket: Socket) {
  console.log('Socket connected');
  socketChat(socket);
});

http.listen(port, () => console.log(`Server is listening on port ${port}`));
