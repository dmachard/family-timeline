import dotenv from 'dotenv';

dotenv.config();

export default {
  server: {
    listen_port: process.env.SERVER_LISTEN_PORT || 5000
  },
  storage: {
    data_path: process.env.STORAGE_DATA_PATH || "./data"
  },
  db: {
    filename: process.env.DATABASE_FILENAME || './src/db/database.sqlite3',
  }
};
