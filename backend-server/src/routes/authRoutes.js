import express from 'express';

import { authenticateUser, refreshAccessToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authenticateUser);
router.post('/refresh-token', refreshAccessToken);

export default router;
