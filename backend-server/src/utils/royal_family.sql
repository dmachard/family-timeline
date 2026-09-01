-- royal_family.sql
-- Dynastie royale britannique de George III (1738) à Prince William & Harry (2026)

-- 1. Insert data into Persons table
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('George', 'Windsor', 'King George VI', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Elizabeth', 'Windsor', 'Queen Elizabeth II', 'Female', '/profiles/b924c9f9-5f00-4e03-a30d-181f6f8df496.png');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Philip', 'Mountbatten', 'Prince Philip', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Charles', 'Windsor', 'King Charles III', 'Male', '/profiles/5b3f9e9d-94e7-4bd9-b258-ce8e2de87b21.jpg');
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

-- Ascendants royaux (1738 - 1900)
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('George', 'Windsor', 'King George V', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Mary', 'of Teck', 'Queen Mary', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Edward', 'Windsor', 'King Edward VII', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Alexandra', 'of Denmark', 'Queen Alexandra', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Victoria', 'Windsor', 'Queen Victoria (Empress of India)', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Albert', 'of Saxe-Coburg and Gotha', 'Prince Albert (Prince Consort)', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Edward', 'of Kent', 'Prince Edward (Duke of Kent)', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Victoria', 'of Saxe-Coburg-Saalfeld', 'Duchess of Kent', 'Female', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('George', 'Hanover', 'King George III', 'Male', '');
INSERT INTO Persons (first_name, last_name, notes, gender, picture) VALUES ('Charlotte', 'of Mecklenburg-Strelitz', 'Queen Charlotte', 'Female', '');

-- 2. Insert data into MiddleNames table
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
INSERT INTO MiddleNames (person_id, middle_name) VALUES (18, 'Frederick Ernest Albert');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (19, 'Victoria Mary');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (20, 'Albert Edward');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (21, 'Caroline Marie Charlotte Louise Julie');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (22, 'Alexandrina');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (23, 'Francis Albert Augustus Charles Emmanuel');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (24, 'Augustus');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (25, 'Marie Louise Victoire');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (26, 'William Frederick');
INSERT INTO MiddleNames (person_id, middle_name) VALUES (27, 'Sophia');

-- 3. Insert data into Relatives table
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

-- Elizabeth II and Margaret are sisters
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'sister', 9);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (9, 'sister', 2);

-- Elizabeth II & Philip parents of Charles, Anne, Andrew, Edward
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 6);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'child', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'mother', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'mother', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'mother', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'mother', 2);

INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 5);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 6);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'child', 7);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'father', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (5, 'father', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (6, 'father', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (7, 'father', 3);

-- Marriages
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (1, 'spouse', 8);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (8, 'spouse', 1);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (3, 'spouse', 2);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (2, 'spouse', 3);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'spouse', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'spouse', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'ex-spouse', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'ex-spouse', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'spouse', 13);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (13, 'spouse', 4);

-- Charles & Diana parents of William and Harry
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'child', 11);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (4, 'child', 12);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (11, 'father', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (12, 'father', 4);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'child', 11);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'child', 12);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (11, 'mother', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (12, 'mother', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (11, 'brother', 12);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (12, 'brother', 11);

-- Spencer family
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'child', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'father', 14);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (15, 'child', 10);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (10, 'mother', 15);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'spouse', 15);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (15, 'spouse', 14);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (16, 'child', 14);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'father', 16);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (17, 'child', 14);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (14, 'mother', 17);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (16, 'spouse', 17);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (17, 'spouse', 16);

-- Lignée ascendante : George V & Mary (18, 19) parents de George VI (1)
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (18, 'child', 1);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (1, 'father', 18);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (19, 'child', 1);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (1, 'mother', 19);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (18, 'spouse', 19);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (19, 'spouse', 18);

-- Lignée ascendante : Edward VII & Alexandra (20, 21) parents de George V (18)
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (20, 'child', 18);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (18, 'father', 20);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (21, 'child', 18);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (18, 'mother', 21);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (20, 'spouse', 21);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (21, 'spouse', 20);

-- Lignée ascendante : Victoria & Albert (22, 23) parents d'Edward VII (20)
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (23, 'child', 20);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (20, 'father', 23);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (22, 'child', 20);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (20, 'mother', 22);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (22, 'spouse', 23);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (23, 'spouse', 22);

-- Lignée ascendante : Edward de Kent & Victoria de Saxe-Cobourg (24, 25) parents de Victoria (22)
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (24, 'child', 22);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (22, 'father', 24);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (25, 'child', 22);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (22, 'mother', 25);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (24, 'spouse', 25);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (25, 'spouse', 24);

-- Lignée ascendante : George III & Charlotte (26, 27) parents d'Edward de Kent (24)
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (26, 'child', 24);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (24, 'father', 26);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (27, 'child', 24);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (24, 'mother', 27);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (26, 'spouse', 27);
INSERT INTO Relatives (person_id, relation_type, related_person_id) VALUES (27, 'spouse', 26);

-- 4. Insert data into Events table
-- 1-2: George VI
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1895-12-14', 'Sandringham House, Norfolk, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1952-02-06', 'Sandringham House, Norfolk, England', '', TRUE);
-- 3: Elizabeth II
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1926-04-21', '17 Bruton Street, London, England', '', TRUE);
-- 4-5: Philip
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1921-06-10', 'Mon Repos, Corfu, Greece', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2021-04-09', 'Windsor Castle, Windsor, England', '', TRUE);
-- 6: Marriage Elizabeth & Philip
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1947-11-20', 'Westminster Abbey, London, England', '', TRUE);
-- 7-10: Charles, Anne, Andrew, Edward births
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1948-11-14', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1950-08-15', 'Clarence House, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1960-02-19', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1964-03-10', 'Buckingham Palace, London, England', '', TRUE);
-- 11-12: Elizabeth Bowes-Lyon
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1900-08-04', 'London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2002-03-30', 'Royal Lodge, Windsor, England', '', TRUE);
-- 13-14: Margaret
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1930-08-21', 'Glamis Castle, Scotland', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2002-02-09', 'King Edward VII Hospital, London, England', '', TRUE);
-- 15: Marriage George VI & Elizabeth Bowes-Lyon
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1923-04-26', 'Westminster Abbey, London, England', '', TRUE);
-- 16-18: Diana
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1961-07-01', 'Park House, Sandringham, Norfolk, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1981-07-29', 'St Paul''s Cathedral, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1997-08-31', 'Pitié-Salpêtrière Hospital, Paris, France', '', TRUE);
-- 19-20: William & Harry
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1982-06-21', 'St Mary''s Hospital, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1984-09-15', 'St Mary''s Hospital, London, England', '', TRUE);
-- 21: Divorce Charles & Diana
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('divorce', '1996-08-28', 'London, England', '', TRUE);
-- 22-23: Camilla
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1947-07-17', 'King''s College Hospital, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '2005-04-09', 'Windsor Guildhall, Windsor, England', '', TRUE);
-- 24: Charles ascension
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('other', '2023-05-06', 'London, England', 'King ascension', TRUE);
-- 25: Elizabeth II death
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2022-09-08', 'Balmoral Castle, Scotland', '', TRUE);
-- 26-27: John Spencer
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1924-01-20', 'London, England', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1992-03-29', 'London, England', '', FALSE);
-- 28-29: Frances Shand Kydd
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1936-01-20', 'Sandringham, Norfolk, England', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '2004-06-03', 'Seil, Argyll and Bute, Scotland', '', FALSE);
-- 30-31: Cynthia Hamilton
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1897-10-16', 'Edinburgh, Scotland', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1972-12-04', 'London, England', '', FALSE);
-- 32-33: Albert Spencer
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1975-06-10', 'London, England', '', FALSE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1892-05-23', 'London, England', '', FALSE);

-- Nouveaux événements historiques royaux (1738 - 1953)
-- 34-35: George V
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1865-06-03', 'Marlborough House, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1936-01-20', 'Sandringham House, Norfolk, England', '', TRUE);
-- 36-37: Mary de Teck
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1867-05-26', 'Kensington Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1953-03-24', 'Marlborough House, London, England', '', TRUE);
-- 38: Marriage George V & Mary
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1893-07-06', 'Chapel Royal, St James''s Palace, London, England', '', TRUE);

-- 39-40: Edward VII
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1841-11-09', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1910-05-06', 'Buckingham Palace, London, England', '', TRUE);
-- 41-42: Alexandra de Danemark
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1844-12-01', 'Yellow Palace, Copenhagen, Denmark', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1925-11-20', 'Sandringham House, Norfolk, England', '', TRUE);
-- 43: Marriage Edward VII & Alexandra
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1863-03-10', 'St George''s Chapel, Windsor, England', '', TRUE);

-- 44-45: Victoria
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1819-05-24', 'Kensington Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1901-01-22', 'Osborne House, Isle of Wight, England', '', TRUE);
-- 46-47: Albert de Saxe-Cobourg
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1819-08-26', 'Schloss Rosenau, Coburg, Germany', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1861-12-14', 'Windsor Castle, Windsor, England', '', TRUE);
-- 48: Marriage Victoria & Albert
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1840-02-10', 'Chapel Royal, St James''s Palace, London, England', '', TRUE);

-- 49-50: Edward, Duc de Kent
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1767-11-02', 'Buckingham Palace, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1820-01-23', 'Sidmouth, Devon, England', '', TRUE);
-- 51-52: Victoire de Saxe-Cobourg-Saalfeld
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1786-08-17', 'Coburg, Germany', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1861-03-16', 'Frogmore House, Windsor, England', '', TRUE);
-- 53: Marriage Edward & Victoire
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1818-05-29', 'Schloss Ehrenburg, Coburg, Germany', '', TRUE);

-- 54-55: George III
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1738-06-04', 'Norfolk House, London, England', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1820-01-29', 'Windsor Castle, Windsor, England', '', TRUE);
-- 56-57: Charlotte de Mecklembourg-Strelitz
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('birth', '1744-05-19', 'Mirow, Germany', '', TRUE);
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('death', '1818-11-17', 'Kew Palace, London, England', '', TRUE);
-- 58: Marriage George III & Charlotte
INSERT INTO Events (event_type, event_date, event_place, event_notes, event_verified) VALUES ('marriage', '1761-09-08', 'Chapel Royal, St James''s Palace, London, England', '', TRUE);

-- 5. Insert data into Associations table
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
INSERT INTO Associations (event_id, person_id) VALUES (26, 14);
INSERT INTO Associations (event_id, person_id) VALUES (27, 14);
INSERT INTO Associations (event_id, person_id) VALUES (28, 15);
INSERT INTO Associations (event_id, person_id) VALUES (29, 15);
INSERT INTO Associations (event_id, person_id) VALUES (30, 17);
INSERT INTO Associations (event_id, person_id) VALUES (31, 17);
INSERT INTO Associations (event_id, person_id) VALUES (32, 16);
INSERT INTO Associations (event_id, person_id) VALUES (33, 16);

-- Associations pour les ascendants (34 à 58)
INSERT INTO Associations (event_id, person_id) VALUES (34, 18); -- George V birth
INSERT INTO Associations (event_id, person_id) VALUES (35, 18); -- George V death
INSERT INTO Associations (event_id, person_id) VALUES (36, 19); -- Mary birth
INSERT INTO Associations (event_id, person_id) VALUES (37, 19); -- Mary death
INSERT INTO Associations (event_id, person_id) VALUES (38, 18); -- Marriage George V & Mary
INSERT INTO Associations (event_id, person_id) VALUES (38, 19);

INSERT INTO Associations (event_id, person_id) VALUES (39, 20); -- Edward VII birth
INSERT INTO Associations (event_id, person_id) VALUES (40, 20); -- Edward VII death
INSERT INTO Associations (event_id, person_id) VALUES (41, 21); -- Alexandra birth
INSERT INTO Associations (event_id, person_id) VALUES (42, 21); -- Alexandra death
INSERT INTO Associations (event_id, person_id) VALUES (43, 20); -- Marriage Edward VII & Alexandra
INSERT INTO Associations (event_id, person_id) VALUES (43, 21);

INSERT INTO Associations (event_id, person_id) VALUES (44, 22); -- Victoria birth
INSERT INTO Associations (event_id, person_id) VALUES (45, 22); -- Victoria death
INSERT INTO Associations (event_id, person_id) VALUES (46, 23); -- Albert birth
INSERT INTO Associations (event_id, person_id) VALUES (47, 23); -- Albert death
INSERT INTO Associations (event_id, person_id) VALUES (48, 22); -- Marriage Victoria & Albert
INSERT INTO Associations (event_id, person_id) VALUES (48, 23);

INSERT INTO Associations (event_id, person_id) VALUES (49, 24); -- Edward Kent birth
INSERT INTO Associations (event_id, person_id) VALUES (50, 24); -- Edward Kent death
INSERT INTO Associations (event_id, person_id) VALUES (51, 25); -- Victoire birth
INSERT INTO Associations (event_id, person_id) VALUES (52, 25); -- Victoire death
INSERT INTO Associations (event_id, person_id) VALUES (53, 24); -- Marriage Edward & Victoire
INSERT INTO Associations (event_id, person_id) VALUES (53, 25);

INSERT INTO Associations (event_id, person_id) VALUES (54, 26); -- George III birth
INSERT INTO Associations (event_id, person_id) VALUES (55, 26); -- George III death
INSERT INTO Associations (event_id, person_id) VALUES (56, 27); -- Charlotte birth
INSERT INTO Associations (event_id, person_id) VALUES (57, 27); -- Charlotte death
INSERT INTO Associations (event_id, person_id) VALUES (58, 26); -- Marriage George III & Charlotte
INSERT INTO Associations (event_id, person_id) VALUES (58, 27);

-- 6. Insert data into Attachments table
INSERT INTO Attachments (event_id, file_path, description) VALUES (24, '/attachments/193592c6-b4b7-4e1a-bf3f-6340aa20591f.jpg', 'Coronation Balcony 2023');