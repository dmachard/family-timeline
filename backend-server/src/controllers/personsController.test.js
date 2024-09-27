import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

import { setDbConnection } from '../utils/db';

import { fetchEnrichedPersons, fetchPersons, fetchMiddleNames } from './personsController';

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

  // Set the database connection
  setDbConnection(db);
});

afterAll(async () => {
  await db.close(); // Close the database after all tests are done
});

describe('fetchEnrichedPersons', () => {
    it('should return enriched persons', async () => {
        const req = { user: { username: 'testuser' } };
        const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
        };

        await fetchEnrichedPersons(req, res);

        const [result] = res.json.mock.calls[0];
        expect(result).toBeDefined();
        expect(result).toHaveLength(4);
    });
});

describe('fetchPersons', () => {
    it('should return all persons', async () => {
      const req = { user: { username: 'testuser' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };
  
      await fetchPersons(req, res);
  
      const [result] = res.json.mock.calls[0];
      expect(result).toBeDefined();
      expect(result).toHaveLength(4);
    });
});

describe('fetchMiddleNames', () => {
    it('should return middle names', async () => {
      const req = { user: { username: 'testuser' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };
  
      await fetchMiddleNames(req, res);
  
      const [result] = res.json.mock.calls[0];
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
});