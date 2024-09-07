import express from 'express';
import { fetchAssociations, deleteAssociation } from '../controllers/associationsController.js';

const router = express.Router();

router.get('/', fetchAssociations);
router.delete('/:id', deleteAssociation);

export default router;
