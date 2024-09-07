import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';
import logger from '../logger.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const profilePictureUpload = (file, oldFilename = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  logger.info("uploading profile picture");
  
  const ext = path.extname(file.originalname);
  const uuid = uuidv4();
  const newFilename = `/profiles/${uuid}${ext}`;
  const uploadPath = path.join(__dirname, '..', config.storage.data_path, newFilename);
  
  // Move the new file to the profiles directory
  fs.renameSync(file.path, uploadPath);

  // If there's an old file, delete it
  if (oldFilename) {
    const oldFilePath = path.join(__dirname, '..', config.storage.data_path, oldFilename);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  return newFilename;
};

export const deleteProfilePicture = (filename) => {
  if (!filename) {
    logger.warn('No filename provided for deletion');
    return;
  }

  logger.info('Deleting profile picture');

  const filePath = path.join(__dirname, '..', config.storage.data_path, filename);
  
  // Check if the file exists before attempting to delete
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      logger.info(`Deleted profile picture: ${filename}`);
    } catch (err) {
      logger.error(`Failed to delete profile picture: ${err.message}`);
    }
  } else {
    logger.warn(`Profile picture not found: ${filename}`);
  }
};

export const uploadFileAttachment = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  logger.info("uploading attachment file");
  
  const ext = path.extname(file.originalname);
  const uuid = uuidv4();
  const newFilename = `/attachments/${uuid}${ext}`;
  const uploadPath = path.join(__dirname, '..', config.storage.data_path, newFilename);
  
  // Move the new file to the profiles directory
  fs.renameSync(file.path, uploadPath);

  return newFilename;
};
