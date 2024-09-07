import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { setDbConnection } from '../utils/db.js';
import { getAllAttachments, getAttachmentById, addAttachment, delAttachmentById } from './attachmentsService.js';

let db;

// Paths to schema and test data
const schemaPath = path.resolve(__dirname, '../utils/schema.sql');
const testdataPath = path.resolve(__dirname, '../utils/testdata.sql');

// Function to load the schema
const loadSchema = async () => {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await db.exec(schema);
};

// Function to load test data
const loadTestData = async () => {
    const testdata = fs.readFileSync(testdataPath, 'utf-8');
    await db.exec(testdata);
};

beforeAll(async () => {
    db = new sqlite3.Database(':memory:', (err) => {
        if (err) {
            console.error('Error opening in-memory database:', err.message);
            throw err;
        }
    });

    await loadSchema();
    await loadTestData();

    // Replace the default db with our in-memory db for testing
    setDbConnection(db);
});

afterAll(async () => {
    await db.close(); // Close the database after all tests
});

describe('Attachments Service Tests', () => {
    it('should get all attachments', async () => {
        const attachments = await getAllAttachments();
        expect(attachments.length).toBeGreaterThan(0);
    });

    it('should get an attachment by ID', async () => {
        const attachment = await getAttachmentById(1);
        expect(attachment).toBeTruthy();
        expect(attachment).toHaveProperty('id', 1);
    });

    it('should add a new attachment', async () => {
        const newAttachmentId = await addAttachment(1, 'path/to/newfile.jpg', 'New description');
        expect(newAttachmentId).toBeTruthy();

        const addedAttachment = await getAttachmentById(newAttachmentId);
        expect(addedAttachment).toMatchObject({
            event_id: 1,
            file_path: 'path/to/newfile.jpg',
            description: 'New description'
        });
    });

    it('should delete an attachment by ID', async () => {
        const newAttachmentId = await addAttachment(1, 'path/to/tempfile.jpg', 'Temporary description');

        const deleted = await delAttachmentById(newAttachmentId);
        expect(deleted).toBe(1);

        const attachmentAfterDeletion = await getAttachmentById(newAttachmentId);
        expect(attachmentAfterDeletion).toBeUndefined();
    });

    it('should throw an error when deleting a non-existing attachment', async () => {
        await expect(delAttachmentById(9999)).rejects.toThrow('Attachment not found');
    });
});
