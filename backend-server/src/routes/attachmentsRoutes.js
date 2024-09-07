import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import config from '../config.js';

import { fetchAttachments, createAttachment, deleteAttachment } from '../controllers/attachmentsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '..', config.storage.data_path + "/tmp");

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}
const upload = multer({ dest: tmpDir }); // Temporary storage location

const router = express.Router();

router.get('/', fetchAttachments);
router.post('/', upload.single('attachment'), createAttachment);
router.delete('/:id', deleteAttachment);

export default router;
