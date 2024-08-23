import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import personsRoutes from './routes/personsRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import logger from './logger.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = config.server.listen_port;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "data" directory
app.use('/data', express.static(path.join(__dirname, config.storage.data_path)));

// Routes
app.use('/api/persons', personsRoutes);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
