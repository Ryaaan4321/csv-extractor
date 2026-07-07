import express from 'express'
import uploadRouter from './upload.routes.js';
const routes = express.Router();

routes.use('/upload', uploadRouter);

export default routes;