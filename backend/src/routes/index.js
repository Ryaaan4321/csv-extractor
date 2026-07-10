import express from 'express'
import uploadRouter from './upload.routes.js';
import extractionRouter from './extraction.route.js';
const routes = express.Router();
routes.use('/upload', uploadRouter);
routes.use('/extraction',extractionRouter)

export default routes;