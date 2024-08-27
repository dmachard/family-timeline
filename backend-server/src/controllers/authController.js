import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { getUserByUsername } from '../services/userService.js';

import config from '../config.js';
import logger from '../logger.js'; 

export const authenticateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    logger.info(`user=${username} - new connection}`);

    // Find the user by username
    const user = await getUserByUsername(username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create access and refresh tokens
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.access_token_expires_in }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, username: user.username },
        config.jwt.secret,
        { expiresIn: config.jwt.refresh_token_expires_in }
    );

    // Send the token to the client
    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error(`Error in authenticateUser: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    logger.info(`user=${decoded.username} - refresh token}`);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      config.jwt.secret,
      { expiresIn: config.jwt.access_token_expires_in }
    );

    // Optionally generate a new refresh token
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      config.jwt.secret,
      { expiresIn: config.jwt.refresh_token_expires_in }
    );

    // Send the new tokens to the client
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    logger.error(`Error in refreshAccessToken: ${error.message}`);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};
