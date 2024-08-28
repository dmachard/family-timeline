-- Insert test users
INSERT INTO users (id, username, password, email) VALUES 
(1, 'testuser1', 'password1', 'test1@example.com'),
(2, 'testuser2', 'password2', 'test2@example.com');

-- Insert test data into Persons
INSERT INTO Persons (id, first_name, last_name, notes, gender, picture) VALUES
(1, 'John', 'Doe', 'Some notes', 'Male', 'path/to/picture.jpg'),
(2, 'Jane', 'Doe', 'Some notes', 'Female', 'path/to/picture.jpg'),
(3, 'Alice', 'Doe', 'Some notes about Alice', 'Female', 'path/to/picture3.jpg'),  -- Enfant de John et Jane
(4, 'Bob', 'Doe', 'Some notes about Bob', 'Male', 'path/to/picture4.jpg');  -- Enfant de John et Jane

-- Insert test data into Events
INSERT INTO Events (id, event_type, event_date, event_verified, event_place, event_notes) VALUES
(1, 'birth', '1980-01-01', true, 'Place', 'Notes'),
(2, 'death', '2020-01-01', true, 'Place', 'Notes'),
(3, 'birth', '2010-05-01', true, 'Hospital', "Notes about Alice\'s birth"),
(4, 'birth', '2012-07-15', true, 'Hospital', "Notes about Bob\'s birth");

-- Insert test data into MiddleNames
INSERT INTO MiddleNames (person_id, middle_name) VALUES
(1, 'MiddleName');

-- Insert test data into Relatives
INSERT INTO Relatives (person_id, related_person_id, relation_type) VALUES
(1, 3, 'child'),
(2, 3, 'child'),
(1, 4, 'child'),
(2, 4, 'child'),
(3, 1, 'father'),
(3, 2, 'mother'),
(4, 1, 'father'),
(4, 2, 'mother'),
(3, 4, 'brother'),
(3, 4, 'sister'),
(1, 2, 'spouse'),
(2, 1, 'spouse');

-- Insert test data into Connections
INSERT INTO Connections (person_id, event_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 3),
(4, 4);

-- Insert test data into Attachments
INSERT INTO Attachments (id, file_path, description, event_id) VALUES
(1, 'path/to/file.jpg', 'Description', 1);
