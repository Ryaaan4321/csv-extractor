import express from 'express';
import validateExtractionRequest from '../validators/extraction.validator.js';
import extractCrmData from '../controllers/extraction.controller.js';
const extractionRouter = express.Router();
extractionRouter.post('/', validateExtractionRequest, extractCrmData);
export default extractionRouter;