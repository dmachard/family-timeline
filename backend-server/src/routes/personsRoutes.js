import express from 'express';
import { getPersons } from '../controllers/personsController.js';

const router = express.Router();

router.get('/', getPersons);

export default router;
