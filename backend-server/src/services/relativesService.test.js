import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { setDbConnection } from '../utils/db.js';
import {
    getAllRelatives, getRelativeById,
    addRelative, delRelativeById, delRelativeByPersonId,
    checkExistingRelation
} from './relativesService.js';

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
    await db.close(); // Close the database after each test
});

describe('Relatives Service Tests', () => {
    it('should get all relatives', async () => {
        const relatives = await getAllRelatives();
        expect(relatives.length).toBeGreaterThan(0);
    });

    it('should get a relative by ID', async () => {
        const relative = await getRelativeById(1);
        expect(relative).toBeTruthy();
        expect(relative).toHaveProperty('id', 1);
    });

    it('should add a new relative', async () => {
        const newRelativeId = await addRelative(1, 'child', 2);
        expect(newRelativeId).toBeTruthy();

        const addedRelative = await getRelativeById(newRelativeId);
        expect(addedRelative).toMatchObject({
            person_id: 1,
            relation_type: 'child',
            related_person_id: 2
        });
    });

    it('should check if a relative already exists', async () => {
        const exists = await checkExistingRelation(1, 'child', 2);
        expect(exists).toBe(true);
    });

    it('should delete a relative by ID', async () => {
        const newRelativeId = await addRelative(1, 'child', 3);

        const deleted = await delRelativeById(newRelativeId);
        expect(deleted).toBe(1);

        const relativeAfterDeletion = await getRelativeById(newRelativeId);
        expect(relativeAfterDeletion).toBeUndefined();
    });

    it('should delete a relative by person IDs', async () => {
        await addRelative(10, 'child', 30);

        const deleted = await delRelativeByPersonId(10, 30);
        expect(deleted).toBe(1);

        const existsAfterDeletion = await checkExistingRelation(10, 'child', 30);
        expect(existsAfterDeletion).toBe(false);
    });
});
