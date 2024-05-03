import express, { Application } from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes';
import gamesRoutes from './routes/gamesRoutes';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';
import voiceRoutes from './routes/voiceRoutes';
import { checkAuthAccessGame } from './JWT';
import createChatRoutes from './routes/chatRoutes';

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
let server = https.createServer(options, app);

//Inject the peerJS middleware on the /chat route
const ExpressPeerServer = require('peer').ExpressPeerServer;
const peerjs_options = {
  debug: true,
};
const peerServer = ExpressPeerServer(server, peerjs_options);
app.use('/voice/', peerServer);

// Specify allowed origins
const corsOptions = {
  origin: '*', // Add other origins as needed
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
app.use('/voice', voiceRoutes);

const { chatRoutes, chatServer } = createChatRoutes(server);
server = chatServer;
app.use('/chat', chatRoutes);

server.listen(port, '0.0.0.0', () => console.log(`Server is listening on port ${port}`));
