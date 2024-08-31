import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';
import logger from '../logger.js'; 


export const profilePictureUpload = (file, oldFilename = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  logger.info("uploading profile picture");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const ext = path.extname(file.originalname);
  const uuid = uuidv4();
  const newFilename = `/profiles/${uuid}${ext}`;
  const uploadPath = path.join(__dirname, '..', config.storage.data_path, newFilename);
  
  // Move the new file to the profiles directory
  fs.renameSync(file.path, uploadPath);

  // If there's an old file, delete it
  if (oldFilename) {
    const oldFilePath = path.join(config.storage.data_path, oldFilename);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  return newFilename;
};
