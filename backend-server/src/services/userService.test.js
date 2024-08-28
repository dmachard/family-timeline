import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { setDbConnection } from '../utils/db';
import { getUserByUsername, createUser, getUserById } from './userService.js';

let db;

// Path to the schema file
const schemaPath = path.resolve(__dirname, '../utils/schema.sql');
const testdataPath = path.resolve(__dirname, '../utils/testdata.sql');

// Function to load the schema
const loadSchema = async () => {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await db.exec(schema);
};

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

describe('User Service with SQLite', () => {
    it('should return a user by username', async () => {
        const user = await getUserByUsername('testuser1');

        expect(user).toEqual({
            id: 1,
            username: 'testuser1',
            password: 'password1',
            email: 'test1@example.com'
        });
    });

    it('should create a new user', async () => {
        await createUser('newuser', 'newpassword', 'newuser@example.com');

        const user = await getUserByUsername('newuser');

        expect(user).toEqual({
            id: 3, // Assuming auto-increment
            username: 'newuser',
            password: 'newpassword',
            email: 'newuser@example.com'
        });
    });

    it('should return a user by ID', async () => {
        const user = await getUserById(2);

        expect(user).toEqual({
            id: 2,
            username: 'testuser2',
            password: 'password2',
            email: 'test2@example.com'
        });
    });
});