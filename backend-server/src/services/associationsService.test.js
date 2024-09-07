import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { setDbConnection } from '../utils/db.js';
import {
    getAllAssociations,
    getAssociationById,
    addAssociation,
    delAssociationById,
    delAssociationByEventId,
    delAssociationByPersonId,
    checkExistingAssociation
} from './associationsService.js';

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

describe('Associations Service Tests', () => {
    it('should get all associations', async () => {
        const associations = await getAllAssociations();
        expect(associations.length).toBeGreaterThan(0);
    });

    it('should get an association by ID', async () => {
        const association = await getAssociationById(1);
        expect(association).toBeTruthy();
        expect(association).toHaveProperty('id', 1);
    });

    it('should add a new association', async () => {
        const newAssociationId = await addAssociation(1, 2); // event_id = 1, person_id = 2
        expect(newAssociationId).toBeTruthy();

        const addedAssociation = await getAssociationById(newAssociationId);
        expect(addedAssociation).toMatchObject({
            event_id: 1,
            person_id: 2
        });
    });

    it('should delete an association by ID', async () => {
        const newAssociationId = await addAssociation(1, 3); // event_id = 1, person_id = 3

        const deleted = await delAssociationById(newAssociationId);
        expect(deleted).toBe(1);

        const associationAfterDeletion = await getAssociationById(newAssociationId);
        expect(associationAfterDeletion).toBeUndefined();
    });

    it('should delete associations by event ID', async () => {
        await addAssociation(2, 3); // event_id = 2, person_id = 3
        await addAssociation(2, 4); // event_id = 2, person_id = 4

        const deleted = await delAssociationByEventId(2);
        expect(deleted).toBeGreaterThan(0);

        const existsAfterDeletion = await checkExistingAssociation(2, 3);
        expect(existsAfterDeletion).toBe(false);
    });

    it('should delete associations by person ID', async () => {
        await addAssociation(3, 1); // event_id = 3, person_id = 1
        await addAssociation(4, 1); // event_id = 4, person_id = 1

        const deleted = await delAssociationByPersonId(1);
        expect(deleted).toBeGreaterThan(0);

        const existsAfterDeletion = await checkExistingAssociation(3, 1);
        expect(existsAfterDeletion).toBe(false);
    });

    it('should check if an association already exists', async () => {
        const exists = await checkExistingAssociation(4, 4); // event_id = 1, person_id = 1
        expect(exists).toBe(true);
    });

    it('should return false if an association does not exist', async () => {
        const exists = await checkExistingAssociation(9999, 9999); // non-existing event_id and person_id
        expect(exists).toBe(false);
    });
});
