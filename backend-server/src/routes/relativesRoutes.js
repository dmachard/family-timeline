import express from 'express';

import { fetchRelatives } from '../controllers/relativesController.js';
import { createRelative, deleteRelative } from '../controllers/relativesController.js';

const router = express.Router();

router.get('/', fetchRelatives);
router.post('/', createRelative);
router.delete('/:id', deleteRelative);

export default router;