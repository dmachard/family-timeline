import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import config from '../config.js';

import { fetchEnrichedPersons, fetchPersons, fetchMiddleNames } from '../controllers/personsController.js';
import { createPerson, updatePerson, deletePerson } from '../controllers/personsController.js';
import { createEvent } from '../controllers/eventsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '..', config.storage.data_path + "/tmp");

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}
const upload = multer({ dest: tmpDir }); // Temporary storage location

const router = express.Router();

router.get('/', fetchPersons);
router.post('/', upload.single('picture'), createPerson);
router.put('/:id', upload.single('picture'), updatePerson);
router.delete('/:id', deletePerson);

router.get('/middle-names', fetchMiddleNames);
router.get('/enriched', fetchEnrichedPersons);

router.post('/:id/events', createEvent);

export default router;
