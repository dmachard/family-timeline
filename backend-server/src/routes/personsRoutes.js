import express from 'express';
import { 
    fetchEnrichedPersons, fetchPersons, fetchMiddleNames, 
    createPerson, updatePerson, deletePerson
} from '../controllers/personsController.js';

const router = express.Router();

router.get('/', fetchPersons);
router.post('/', createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

router.get('/middle-names', fetchMiddleNames);
router.get('/enriched', fetchEnrichedPersons);


export default router;
