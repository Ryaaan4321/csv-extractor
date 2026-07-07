import express from 'express'
import upload from '../middlewares/upload.middleware.js';
import validateUploadedFile from '../validators/upload.validators.js'
import uploadCsv from '../controllers/upload.controller.js'

const router = express.Router();

router.post('/', upload.single('file'), validateUploadedFile, uploadCsv);

module.exports = router;