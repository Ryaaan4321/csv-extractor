import express from 'express'
import uploadRouter from './upload.routes.js';
const routes = express.Router();

console.log("routes from the index")
routes.use('/upload', uploadRouter);

export default routes;