import express from 'express';

import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventsController.js';
import { createAssociation } from '../controllers/associationsController.js';


const router = express.Router();

router.get('/', fetchEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

router.post('/:id/associations', createAssociation);

export default router;
