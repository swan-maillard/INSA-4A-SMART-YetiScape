import express, { Application } from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes';
import gamesRoutes from './routes/gamesRoutes';

// Boot express
const app: Application = express();

// Application routing
app.use(bodyParser.json());

app.use('/users', usersRoutes);
app.use('/games', gamesRoutes);

// Start server
const port = 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
