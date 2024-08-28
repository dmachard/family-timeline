import winston from 'winston';
import config from './config.js';

const logger = winston.createLogger({
  level: config.server.log_level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
    // new winston.transports.File({ filename: 'logs/combined.log' }),
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

export default logger;
