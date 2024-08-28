import dotenv from 'dotenv';

dotenv.config();

export default {
  server: {
    listen_port: process.env.SERVER_LISTEN_PORT || 5000,
    log_level : process.env.SERVER_LOG_LEVEL || "info"
  },
  storage: {
    data_path: process.env.STORAGE_DATA_PATH || "./data"
  },
  db: {
    filename: process.env.DATABASE_FILENAME || './src/utils/database.sqlite3',
  },
  jwt: {
    // JWT secret
    secret: process.env.JWT_SECRET || "default_1234567890abcdef",
    // Token expiration time
    access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ||  "1h",
    refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ||  "24h"
  }
};
