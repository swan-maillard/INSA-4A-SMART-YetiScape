import express, { Application } from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes';

// Boot express
const app: Application = express();

// Application routing
app.use(bodyParser.json());

app.use('/users', usersRoutes);

// Start server
const port = 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
