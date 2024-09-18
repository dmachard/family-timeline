import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

import { setDbConnection } from '../utils/db';
import { fetchRelatives, createRelative, deleteRelative } from './relativesController';

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

describe('fetchRelatives', () => {
  it('should return a list of relatives', async () => {
    const req = {};
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    // Call the fetchRelatives controller
    await fetchRelatives(req, res);

    // Assert that the correct number of relatives was returned
    const [result] = res.json.mock.calls[0];
    expect(result).toHaveLength(12);
  });
});

describe('createRelative', () => {
  it('should create a new relative', async () => {
    const req = {
      body: {
        person_id: 1,
        related_person_id: 2,
        relation_type: 'brother'
      },
      user: {
        userId: 1,
        username: 'testuser'
      }
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

      await createRelative(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'success' });
  });
  it('create relative with invalid params', async () => {
    const req = {
      body: {
        person_id: null,
        related_person_id: 2,
        relation_type: 'invalid'
      },
      user: {
        userId: 1,
        username: 'testuser'
      }
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

      await createRelative(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid relationship.' });
  });
});

describe('deleteRelative', () => {
  it('should delete a relative', async () => {
    const req = {
      params: { id: 1 },
      user: { userId: 1, username: 'testuser' }
    };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    await deleteRelative(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Relative deleted successfully' });
  });
  it('delete invalid relative id', async () => {
    const req = {
      params: { id: 100 },
      user: { userId: 1, username: 'testuser' }
    };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    await deleteRelative(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Relative not found' });
  });
});
