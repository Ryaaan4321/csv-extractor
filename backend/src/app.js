
import express from 'express'
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js'
const app = express();

app.use(express.json());
app.use('/api', routes);

app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Route not found.' });
});

app.use(errorHandler);

export default app;