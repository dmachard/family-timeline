import { getAllAttachments, addAttachment, delAttachmentById, getAttachmentById  } from '../services/attachmentsService.js';
import { getEventById } from '../services/eventsService.js';
import { uploadFileAttachment } from '../services/uploadService.js';
import logger from '../logger.js';
import { logActivity } from '../utils/activityLogger.js'; 

export const fetchAttachments = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - fetch all attachments`);

    try {
        const attachments = await getAllAttachments();
        res.json(attachments);
    } catch (err) {
        logger.error(`Error in fetchAttachments: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const createAttachment = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - create attachment`);

    const { personId } = req.query;
    const { event_id, description } = req.body;
    try {
        // check if a file is provided
        if (!req.file) {
            return res.status(400).json({ error: 'attachment file is missing' });
        }

        // Check if event ID exists
        const event = await getEventById(event_id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // upload file
        const attachmentPath = uploadFileAttachment(req.file);

        // add attachment in database
        const attachmentId = await addAttachment(event_id, attachmentPath, description);

        // Log the addition in the Activities table
        await logActivity(req.user.userId, 'ADD', 'ATTACHMENT', personId, ``);

        // finnaly return the new attachment
        const newAttachment = await getAttachmentById(attachmentId);
        res.status(201).json(newAttachment);
    } catch (err) {
        logger.error(`Error in createAttachment: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const deleteAttachment = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - delete attachment`);

    const { id } = req.params;
    const { personId } = req.query;
    try {
        await delAttachmentById(id);

        // Log the addition in the Activities table
        await logActivity(req.user.userId, 'DELETE', 'ATTACHMENT', personId, ``);

        res.json({ message: 'Attachment deleted successfully' });
    } catch (err) {
        logger.error(`Error in deleteAttachment: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
