import runQuery from '../utils/db.js';
import logger from '../logger.js'; 

// Function to get all persons
const getPersons = async () => {
  logger.debug(`get all persons`);
  const personsQuery = `
    SELECT p.id, p.first_name, p.last_name, p.notes, p.gender, p.picture,
      (SELECT e.event_date 
       FROM Events e 
       JOIN Connections c ON e.id = c.event_id 
       WHERE c.person_id = p.id AND e.event_type = 'birth') AS birth_date,
      (SELECT e.event_verified 
       FROM Events e 
       JOIN Connections c ON e.id = c.event_id 
       WHERE c.person_id = p.id AND e.event_type = 'birth') AS birth_date_verified,
      (SELECT e.event_date 
       FROM Events e 
       JOIN Connections c ON e.id = c.event_id 
       WHERE c.person_id = p.id AND e.event_type = 'death') AS death_date,
      (SELECT e.event_verified 
       FROM Events e 
       JOIN Connections c ON e.id = c.event_id 
       WHERE c.person_id = p.id AND e.event_type = 'death') AS death_date_verified
    FROM Persons p 
    ORDER BY p.id ASC;
  `;
  
  // Retrieve all persons from the database
  const persons = await runQuery(personsQuery);

  // Enrich each person with additional information (events, relations, etc.)
  const enrichedPersons = await Promise.all(persons.map(async (person) => {
    const enrichedPerson = await getPerson(person.id);
    return enrichedPerson;
  }));

  return enrichedPersons;
};

// Function to get person
const getPerson = async (personId) => {
  logger.debug(`get details for person ${personId}`);
  const personQuery = `
          SELECT p.id, p.first_name, p.last_name, p.notes, p.gender, p.picture,
            (SELECT e.event_date 
              FROM Events e 
              JOIN Connections c ON e.id = c.event_id 
              WHERE c.person_id = p.id AND e.event_type = 'birth') AS birth_date,
            (SELECT e.event_verified 
              FROM Events e 
              JOIN Connections c ON e.id = c.event_id 
              WHERE c.person_id = p.id AND e.event_type = 'birth') AS birth_date_verified,
            (SELECT e.event_date 
              FROM Events e 
              JOIN Connections c ON e.id = c.event_id 
              WHERE c.person_id = p.id AND e.event_type = 'death') AS death_date,
            (SELECT e.event_verified 
              FROM Events e 
              JOIN Connections c ON e.id = c.event_id 
              WHERE c.person_id = p.id AND e.event_type = 'death') AS death_date_verified
          FROM Persons p 
          WHERE p.id = ?`;
  const [person] = await runQuery(personQuery, [personId]);
  if (!person) {
    logger.warn(`Person with ID ${personId} not found`);
    return null; // Return null if person is not found
  }

  const middleNames = await getMiddleNames(personId);
  const events = await getEvents(personId);
  const relatives = await getRelatives(personId);
  const children = await getChildren(personId);

  // Enrich events with related persons and attachments
  for (let event of events) {
    const eventRelations = await getEventRelations(personId, event.id,  event.event_type);
    event.related_persons = eventRelations.map(rel => ({
      id: rel.id,
      relation_type: rel.relation_type
    }));

    const eventAttachments = await getEventAttachments(event.id);
    event.related_attachments = eventAttachments.map(rel => ({
      id: rel.id,
      filepath: rel.file_path,
      description: rel.description
    }));
  }

  // Convert event_verified from integer to boolean
  person.birth_date_verified = !!person.birth_date_verified;
  person.death_date_verified = !!person.death_date_verified;

  // Add children as events
  for (let child of children) {
    const birthEvent = {
      id: child.id,
      event_type: child.relation_type,
      event_date: child.event_date,
      event_verified: child.event_verified,
      event_place: child.event_place,
      event_notes: child.event_notes,
      related_persons: [{
        id: child.person_id,
        relation_type: 'child'
      }],
    };
    events.push(birthEvent);
  }
  
  // Sort events by event_date
  events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  // Return the enriched details for the person
  const enrichedPerson = {
    id: person.id,
    first_name: person.first_name,
    last_name: person.last_name,
    birth_date: person.birth_date,
    death_date: person.death_date,
    birth_date_verified: person.birth_date_verified,
    death_date_verified: person.death_date_verified,
    notes: person.notes,
    gender: person.gender,
    picture: person.picture,
    middle_names: middleNames,
    events: events,
    relatives: relatives
  };
  return enrichedPerson
};

// Function to get middle names for a person
const getMiddleNames = async (personId) => {
  logger.debug(`get middle names for person ${personId}`);
  const query = `SELECT middle_name FROM MiddleNames WHERE person_id = ?`;
  return await runQuery(query, [personId]);
};

// Function to get events for a person
const getEvents = async (personId) => {
  logger.debug(`get events for person ${personId}`);
  const query = `
    SELECT e.id, e.event_type, e.event_date, e.event_verified, e.event_place, e.event_notes 
    FROM Events e 
    JOIN Connections c ON e.id = c.event_id 
    WHERE c.person_id = ? 
    ORDER BY e.event_date ASC;
  `;

  // Fetch data from the database
  const events = await runQuery(query, [personId]);

  // Convert event_verified to boolean
  return events.map(evt => ({
    ...evt,
    event_verified: evt.event_verified === 1 // Convert integer to boolean
  }));
};

// Function to get relations for a person
const getRelatives = async (personId) => {
  logger.debug(`get relatives for person ${personId}`);
  const query = `
    SELECT p.id, r.relation_type 
    FROM Persons p
    JOIN Relatives r ON p.id = r.related_person_id
    WHERE r.person_id = ?;
  `;
  return await runQuery(query, [personId]);
};

// Function to get children of a person
const getChildren = async (personId) => {
  logger.debug(`get children for person ${personId}`);
  const query = `
    SELECT p.id as person_id, p.first_name, p.last_name, r.relation_type, e.event_date, e.event_verified, e.id, e.event_place, e.event_notes
    FROM Persons p 
    JOIN Connections c ON p.id = c.person_id
    JOIN Events e ON e.event_type = 'birth' AND e.id = c.event_id
    JOIN Relatives r ON p.id = r.related_person_id 
    WHERE r.person_id = ? AND r.relation_type IN ('child');
  `;
  
  // Fetch data from the database
  const children = await runQuery(query, [personId]);

  // Convert event_verified to boolean
  return children.map(child => ({
    ...child,
    event_verified: child.event_verified === 1 // Convert integer to boolean
  }));
};

// Function to get event relations
const getEventRelations = async (personId, eventId, eventType) => {
  logger.debug(`get event relations for person ${personId} and event ${eventId}`);
  let relationsQuery;
  switch (eventType) {
    case 'birth':
      relationsQuery = `
        SELECT r.relation_type, p.id, p.first_name, p.last_name 
        FROM Relatives r 
        JOIN Persons p ON r.related_person_id = p.id 
        WHERE r.person_id = ? AND r.relation_type IN ('father', 'mother');
      `;
      return await runQuery(relationsQuery, [personId]);

    case 'divorce':
    case 'marriage':
      relationsQuery = `
        SELECT DISTINCT r.relation_type, p.id, p.first_name, p.last_name
        FROM Persons p
        JOIN Relatives r ON p.id = r.related_person_id
        WHERE r.related_person_id IN (
          SELECT p.id
          FROM Persons p
          JOIN Connections c ON p.id = c.person_id
          WHERE c.event_id = ? AND c.person_id != ?
        )
        AND r.relation_type = 'spouse';
      `;
      return await runQuery(relationsQuery, [eventId, personId]);

    default:
      return [];
  }
};

// Function to get event attachments
const getEventAttachments = async (eventId) => {
  logger.debug(`get event attachment for ${eventId}`);
  const attachmentsQuery = `SELECT id, file_path, description FROM Attachments WHERE event_id = ?;`;
  return await runQuery(attachmentsQuery, [eventId]);
};

export { getPersons, getPerson, getMiddleNames, getEvents, getRelatives, getChildren, getEventRelations, getEventAttachments};

