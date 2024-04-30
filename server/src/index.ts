import express, { Application } from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes';
import gamesRoutes from './routes/gamesRoutes';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';
import { checkAuthAccessGame } from './JWT';

// Boot express
const app: Application = express();

// Specify allowed origins
const corsOptions = {
  origin: ['http://localhost:8080'], // Add other origins as needed
};

// Use the CORS middleware with options
app.use(cors(corsOptions));

const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Application routing
app.use('/users', usersRoutes);
app.use('/games', gamesRoutes);
app.use('/game', checkAuthAccessGame, gameRoutes);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
