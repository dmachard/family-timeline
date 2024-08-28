-- schema.sql

-- Table People
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Table People
CREATE TABLE IF NOT EXISTS Persons (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    notes TEXT, 
    gender TEXT CHECK(gender IN ('Female', 'Male', 'Undefined')),
    picture TEXT
);

-- Table Middle Names
CREATE TABLE IF NOT EXISTS MiddleNames (
    id INTEGER PRIMARY KEY,
    person_id INTEGER,
    middle_name VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES Persons(id)
);

-- Table Relatives
CREATE TABLE IF NOT EXISTS  Relatives (
    id INTEGER PRIMARY KEY,
    person_id INTEGER,
    relation_type TEXT CHECK(relation_type IN ('father', 'mother', 'child', 'sister', 'brother', 'spouse', 'ex-spouse', 'godfather', 'godmother')),
    related_person_id INTEGER,
    FOREIGN KEY (person_id) REFERENCES Persons(id),
    FOREIGN KEY (related_person_id) REFERENCES Persons(id)
);

-- Table Events
CREATE TABLE IF NOT EXISTS Events (
    id INTEGER PRIMARY KEY,
    event_type TEXT CHECK(event_type IN ('birth', 'death', 'marriage', 'divorce', 'civil union', 'civil separation', 'other')),
    event_date DATE,
    event_verified BOOLEAN DEFAULT FALSE,
    event_place VARCHAR(255),
    event_notes TEXT
);

-- Table Connections
CREATE TABLE IF NOT EXISTS Connections (
    id INTEGER PRIMARY KEY,
    event_id INTEGER,
    person_id INTEGER,
    FOREIGN KEY (event_id) REFERENCES Events(id),
    FOREIGN KEY (person_id) REFERENCES Persons(id)
);

-- Table Attachments
CREATE TABLE IF NOT EXISTS Attachments (
    id INTEGER PRIMARY KEY,
    event_id INTEGER,
    file_path TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (event_id) REFERENCES Events(id)
);