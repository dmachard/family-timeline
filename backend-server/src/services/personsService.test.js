import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { setDbConnection } from '../utils/db.js';
import { getEnrichedPersons, getEnrichedPerson, getMiddleNames, getEvents, getRelatives, getChildren, getEventRelations, getEventAttachments } from './personsService.js';

let db;

// Paths to schema and test data
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

describe('User Service Tests', () => {
  it('should get all persons', async () => {
    const persons = await getEnrichedPersons();
    expect(persons.length).toBe(4);
    expect(persons).not.toHaveLength(0);
  });

  it('should get person by ID', async () => {
    const person = await getEnrichedPerson(1);
    
    expect(person).toBeTruthy();

    expect(person).toMatchObject({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1980-01-01',
      death_date: '2020-01-01',
      birth_date_verified: true,
      death_date_verified: true,
      notes: 'Some notes',
      gender: 'Male',
      picture: 'path/to/picture.jpg'
    });

    expect(person.middle_names).toHaveLength(1);
    expect(person.events).toHaveLength(4);
    expect(person.relatives).toHaveLength(3);
  });



  it('should get events for a person', async () => {
    const events = await getEvents(3);
    
    expect(events).toEqual([
      {
        id: 3,
        event_type: 'birth',
        event_date: '2010-05-01',
        event_verified: true,
        event_place: 'Hospital',
        event_notes: "Notes about Alice\\'s birth"
      }
    ]);
  });

  it('should get middle names for a person', async () => {
    const middleNames = await getMiddleNames(1);
    expect(middleNames).toEqual([{ middle_name: 'MiddleName' }]);
  });

  it('should get relatives for a person', async () => {
    const relatives = await getRelatives(1);
    
    expect(relatives).toEqual([
        { id: 3, relation_type: 'child' }, 
        { id: 4, relation_type: 'child' },
        { id: 2, relation_type: 'spouse' }
    ]);
  });

  it('should get children of a person', async () => {
    const children = await getChildren(1); // John Doe has children

    expect(children).toEqual([
      {
          person_id: 3, // ID of Alice Doe
          first_name: 'Alice',
          last_name: 'Doe',
          relation_type: 'child',
          event_date: '2010-05-01',
          event_verified: true,
          id: 3,
          event_place: 'Hospital',
          event_notes: "Notes about Alice\\'s birth"
      },
      {
          person_id: 4, // ID of Bob Doe
          first_name: 'Bob',
          last_name: 'Doe',
          relation_type: 'child',
          event_date: '2012-07-15',
          event_verified: true,
          id: 4,
          event_place: 'Hospital',
          event_notes: "Notes about Bob\\'s birth"
      }
    ]);
  });

  it('should get event relations', async () => {
    const relations = await getEventRelations(3, 3, 'birth');
    
    expect(relations).toEqual([
      { relation_type: 'father', id: 1, first_name: 'John', last_name: 'Doe' },
      { relation_type: 'mother', id: 2, first_name: 'Jane', last_name: 'Doe' }
    ]);
  });

  it('should get event attachments', async () => {
    const attachments = await getEventAttachments(1);
    
    expect(attachments).toEqual([{ id: 1, file_path: 'path/to/file.jpg', description: 'Description' }]);
  });
});