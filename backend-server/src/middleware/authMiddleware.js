import jwt from 'jsonwebtoken';

import logger from '../logger.js'; 
import config from '../config.js';

const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    // Check if the Authorization header is present
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Ensure the header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // Verify the token using the jwtSecret
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded; // Attach the decoded user information to the request
        next();
    } catch (err) {
        logger.error(`token invalid: ${err}`);
        // If token verification fails, return a 401 error
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authenticateToken;
