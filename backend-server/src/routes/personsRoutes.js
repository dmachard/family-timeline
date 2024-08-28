import express from 'express';
import { fetchAllPersons } from '../controllers/personsController.js';

const router = express.Router();

router.get('/', fetchAllPersons);

export default router;
