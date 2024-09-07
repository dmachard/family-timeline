-- just for example 
-- sqlite3 genealogy.db < schema.sql
-- sqlite3 genealogy.db < royal_family.sql

-- Insert data into Persons table
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('George', 'Windsor', 'King George VI', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Elizabeth', 'Windsor', 'Queen Elizabeth II', 'Female', '/profiles/b924c9f9-5f00-4e03-a30d-181f6f8df496.png');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Philip', 'Mountbatten', 'Prince Philip', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Charles', 'Windsor', 'Prince Charles', 'Male', '/profiles/5b3f9e9d-94e7-4bd9-b258-ce8e2de87b21.jpg');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Anne', 'Windsor', 'Princess Anne', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Andrew', 'Windsor', 'Prince Andrew', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Edward', 'Windsor', 'Prince Edward', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Elizabeth', 'Bowes-Lyon', 'Queen Mother', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Margaret', 'Windsor', 'Princess Margaret', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Diana', 'Spencer', 'Princess Diana', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('William', 'Windsor', 'Prince William', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Henry', 'Windsor', 'Prince Harry', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Camilla', 'Shand', 'Queen Camilla', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('John', 'Spencer', '8th Earl Spencer', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Frances', 'Shand Kydd', 'Mother of Diana', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Albert', 'Spencer', '7th Earl Spencer', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Cynthia', 'Hamilton', 'Countess Spencer', 'Female', '');

-- Insert data into MiddleNames table
INSERT INTO MiddleNames (person_id, middle_name) VALUES (1, 'Albert');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (2, 'Alexandra Mary');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (3, 'Arthur George');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (4, 'Philip Arthur George');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (5, 'Elizabeth Alice Louise');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (6, 'Albert Christian Edward');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (7, 'Antony Richard Louis');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (8, 'Angela Marguerite');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (9, 'Rose');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (10, 'Frances');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (11, 'Arthur Philip Louis');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (12, 'Charles Albert David');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (13, 'Rosemary');

-- Insert data into Relatives table
-- George VI is the father of Elizabeth II and Margaret
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (1, 'child', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (1, 'child', 9);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'father', 1);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (9, 'father', 1);
-- Elizabeth Bowes-Lyon is the mother of Elizabeth II and Margaret
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (8, 'child', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (8, 'child', 9);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'mother', 8);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (9, 'mother', 8);
-- Elizabeth II and Margaret are sister
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'sister', 9);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (9, 'sister', 2);
-- Elizabeth II is the mother of Charles, Anne, Andrew, and Edward
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 6);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'mother', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'mother', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'mother', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'mother', 2);
-- Philip is the father of Charles, Anne, Andrew, and Edward
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 6);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'father', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'father', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'father', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'father', 3);
-- Charles, Anne, Andrew, and Edward are brother and sister
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'sister', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'brother', 6);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'brother', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'brother', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'brother', 6);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'brother', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'sister', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'brother', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'brother', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'sister', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'brother', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'brother', 6);
-- George VI is married to Elizabeth Bowes-Lyon
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (1, 'spouse', 8);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (8, 'spouse', 1);
-- Philip is married to Elizabeth II
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'spouse', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'spouse', 3);
-- Diana is married to Charles
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'spouse', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'spouse', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'ex-spouse', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'ex-spouse', 10);
-- Charles is the father of William and Harry
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'child', 11);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'child', 12);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (11, 'father', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (12, 'father', 4);
-- Diana is the mother of William and Harry
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'child', 11);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'child', 12);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (11, 'mother', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (12, 'mother', 10);
-- William and Harry are brother
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (11, 'brother', 12);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (12, 'brother', 11);
-- Camelia is married to Charles
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'spouse', 13);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (13, 'spouse', 4);
-- John Spencer if the father of Diana
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'child', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'father', 14);
-- Frances Shand Kydd is the mother of Diana
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (15, 'child', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'mother', 15);
-- John Spencer is married to Frances Shand Kydd
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'spouse', 15);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (15, 'spouse', 14);
-- Albert if the father of John
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (16, 'child', 14);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'father', 16);
-- Cynthia is the mother of John
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (17, 'child', 14);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'mother', 17);
-- Albert is married to Cynthia
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (16, 'spouse', 17);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (17, 'spouse', 16);

-- Insert data into Events table
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1895-12-14', 'Sandringham House, Norfolk, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1952-02-06', 'Sandringham House, Norfolk, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1926-04-21', '17 Bruton Street, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1921-06-10', 'Mon Repos, Corfu, Greece', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2021-04-09', 'Windsor Castle, Windsor, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1947-11-20', 'Westminster Abbey, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1948-11-14', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1950-08-15', 'Clarence House, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1960-02-19', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1964-03-10', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1900-08-04', 'London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2002-03-30', 'Royal Lodge, Windsor, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1930-08-21', 'Glamis Castle, Scotland', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2002-02-09', 'King Edward VII Hospital, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1923-04-26', 'Westminster Abbey, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1961-07-01', 'Park House, Sandringham, Norfolk, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1981-07-29', "St Paul's Cathedral, London, England", '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1997-08-31', 'Pitié-Salpêtrière Hospital, Paris, France', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1982-06-21', "St Mary's Hospital, London, England", '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1984-09-15', "St Mary's Hospital, London, England", '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('divorce', '1996-08-28', 'London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1947-07-17', "King's College Hospital, London, England", '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '2005-04-09', 'Windsor Guildhall, Windsor, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('other', '2023-05-06', 'London, England', 'King ascension', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2022-09-08', 'London, England', '', TRUE);
-- Birth and death of John Spencer
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1924-01-20', 'London, England', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1992-03-29', 'London, England', '', FALSE);
-- Birth and death of Frances Shand Kydd
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1936-01-20', 'Sandringham, Norfolk, England', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2004-06-03', 'Seil, Argyll and Bute, Scotland', '', FALSE);
-- Birth and death of Cynthia Hamilton
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1897-10-16', 'Edinburgh, Scotland', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1972-12-04', 'London, England', '', FALSE);
-- Birth and death of Albert Spencer
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1975-06-10', 'London, England', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1892-05-23', 'London, England', '', FALSE);

-- Insert data into Associations table
INSERT INTO Associations (event_id, person_id) VALUES (1, 1);
INSERT INTO Associations (event_id, person_id) VALUES (2, 1);
INSERT INTO Associations (event_id, person_id) VALUES (3, 2);
INSERT INTO Associations (event_id, person_id) VALUES (4, 3);
INSERT INTO Associations (event_id, person_id) VALUES (5, 3);
INSERT INTO Associations (event_id, person_id) VALUES (6, 2);
INSERT INTO Associations (event_id, person_id) VALUES (6, 3);
INSERT INTO Associations (event_id, person_id) VALUES (7, 4);
INSERT INTO Associations (event_id, person_id) VALUES (8, 5);
INSERT INTO Associations (event_id, person_id) VALUES (9, 6);
INSERT INTO Associations (event_id, person_id) VALUES (10, 7);
INSERT INTO Associations (event_id, person_id) VALUES (11, 8);
INSERT INTO Associations (event_id, person_id) VALUES (12, 8);
INSERT INTO Associations (event_id, person_id) VALUES (13, 9);
INSERT INTO Associations (event_id, person_id) VALUES (14, 9);
INSERT INTO Associations (event_id, person_id) VALUES (15, 1);
INSERT INTO Associations (event_id, person_id) VALUES (15, 8);
INSERT INTO Associations (event_id, person_id) VALUES (16, 10);
INSERT INTO Associations (event_id, person_id) VALUES (17, 10);
INSERT INTO Associations (event_id, person_id) VALUES (17, 4);
INSERT INTO Associations (event_id, person_id) VALUES (18, 10);
INSERT INTO Associations (event_id, person_id) VALUES (19, 11);
INSERT INTO Associations (event_id, person_id) VALUES (20, 12);
INSERT INTO Associations (event_id, person_id) VALUES (21, 10);
INSERT INTO Associations (event_id, person_id) VALUES (21, 4);
INSERT INTO Associations (event_id, person_id) VALUES (22, 13);
INSERT INTO Associations (event_id, person_id) VALUES (23, 13);
INSERT INTO Associations (event_id, person_id) VALUES (23, 4);
INSERT INTO Associations (event_id, person_id) VALUES (24, 4);
INSERT INTO Associations (event_id, person_id) VALUES (25, 2);
INSERT INTO Associations (event_id, person_id) VALUES (26, 14); -- birth de John Spencer
INSERT INTO Associations (event_id, person_id) VALUES (27, 14); -- death de John Spencer
INSERT INTO Associations (event_id, person_id) VALUES (28, 15); -- birth de Frances Shand Kydd
INSERT INTO Associations (event_id, person_id) VALUES (29, 15); -- death de Frances Shand Kydd
INSERT INTO Associations (event_id, person_id) VALUES (30, 17); -- birth de Cynthia Hamilton
INSERT INTO Associations (event_id, person_id) VALUES (31, 17); -- death de Cynthia Hamilton
INSERT INTO Associations (event_id, person_id) VALUES (32, 16); -- birth de Albert Spencer
INSERT INTO Associations (event_id, person_id) VALUES (33, 16); -- death de Albert Spencer

-- Insert data into Attachments table
INSERT INTO Attachments (event_id, file_path, description) VALUES (24, '/attachments/193592c6-b4b7-4e1a-bf3f-6340aa20591f.jpg', 'Coronation Balcony 2023');