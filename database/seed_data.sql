-- ============================================================
-- Seed Data — Bangladesh Context
-- ============================================================
USE disaster_response;

-- Users
INSERT INTO users (username, password_hash, email, role) VALUES
('admin',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImmjLGii', 'admin@disasterbd.gov.bd',      'Admin'),
('coordinator1','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImmjLGii', 'coord1@disasterbd.gov.bd',     'Coordinator'),
('coordinator2','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImmjLGii', 'coord2@disasterbd.gov.bd',     'Coordinator'),
('volunteer1',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImmjLGii', 'vol1@gmail.com',               'Volunteer'),
('viewer1',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImmjLGii', 'viewer1@gmail.com',            'Viewer');
-- Default password for all: "password123"

-- Disasters
INSERT INTO disasters (disaster_type, severity, location, latitude, longitude, start_date, end_date, status, affected_population, description) VALUES
('Flood',      'Critical', 'Sylhet, Bangladesh',          24.8949, 91.8687, '2024-06-15 06:00:00', NULL,                  'Active',    850000, 'Severe monsoon flooding in Sylhet division affecting thousands of families.'),
('Cyclone',    'High',     'Cox''s Bazar, Bangladesh',    21.4272, 92.0058, '2024-05-22 18:00:00', NULL,                  'Active',    320000, 'Cyclone Remal made landfall near Cox''s Bazar with winds up to 130 km/h.'),
('Flood',      'High',     'Sunamganj, Bangladesh',       25.0651, 91.3962, '2024-07-01 00:00:00', NULL,                  'Active',    420000, 'Flash floods in Sunamganj due to upstream rainfall in Meghalaya.'),
('Earthquake', 'Medium',   'Chattogram, Bangladesh',      22.3569, 91.7832, '2024-04-10 03:25:00', '2024-04-15 00:00:00','Resolved',   95000, 'Magnitude 5.6 earthquake near Chattogram, minor structural damage.'),
('Fire',       'High',     'Dhaka, Bangladesh',           23.8103, 90.4125, '2024-03-05 22:00:00', '2024-03-06 08:00:00','Resolved',   12000, 'Large fire in Banani, Dhaka destroying several commercial buildings.'),
('Landslide',  'Critical', 'Rangamati, Bangladesh',       22.6423, 92.2222, '2024-08-10 14:00:00', NULL,                  'Active',    180000, 'Landslides in Rangamati Hill District after continuous rainfall.'),
('Flood',      'Medium',   'Kurigram, Bangladesh',        25.8047, 89.6393, '2024-07-20 00:00:00', NULL,                  'Contained', 230000, 'Brahmaputra River overflow causing moderate flooding.'),
('Cyclone',    'Medium',   'Khulna, Bangladesh',          22.8456, 89.5403, '2024-05-20 12:00:00', '2024-05-25 00:00:00','Resolved',   150000, 'Cyclone hit coastal areas of Khulna division.'),
('Pandemic',   'High',     'Dhaka Metropolitan, Bangladesh',23.7104,90.4074,'2024-01-01 00:00:00', NULL,                  'Active',   2000000, 'Dengue outbreak across Dhaka Metropolitan area.'),
('Flood',      'Low',      'Jamalpur, Bangladesh',        24.9000, 89.9500, '2024-07-25 00:00:00', '2024-08-01 00:00:00','Resolved',   80000, 'Minor flooding in Jamalpur district, quickly contained.');

-- Affected Zones
INSERT INTO affected_zones (disaster_id, zone_name, zone_type, population, evacuation_status) VALUES
(1, 'Sylhet Sadar South', 'Red',    45000, 'In Progress'),
(1, 'Golapganj Upazila',  'Red',    62000, 'Not Started'),
(1, 'Fenchuganj',         'Orange', 28000, 'In Progress'),
(1, 'Bishwanath',         'Yellow', 35000, 'Completed'),
(2, 'Cox''s Bazar Sadar', 'Red',    80000, 'In Progress'),
(2, 'Teknaf',             'Red',    55000, 'Not Started'),
(2, 'Ukhia (Rohingya Camp)','Orange',120000,'In Progress'),
(3, 'Sunamganj Sadar',    'Red',    52000, 'Not Started'),
(3, 'Tahirpur Upazila',   'Orange', 38000, 'In Progress'),
(6, 'Rangamati Sadar',    'Red',    40000, 'Not Started'),
(6, 'Kaptai',             'Orange', 25000, 'In Progress'),
(7, 'Kurigram Sadar',     'Yellow', 48000, 'Completed'),
(9, 'Dhaka North',        'Orange',500000, 'Not Started'),
(9, 'Dhaka South',        'Orange',400000, 'Not Started');

-- Shelters
INSERT INTO shelters (name, location, latitude, longitude, max_capacity, current_occupancy, status, has_medical_facility, has_food_supply, contact_number) VALUES
('Sylhet Government School Shelter',   'Sylhet Sadar, Sylhet',    24.8963, 91.8724, 500,  380, 'Open', TRUE,  TRUE,  '01711-123456'),
('Osmani Stadium Relief Camp',         'Sylhet City',             24.8901, 91.8601, 1000, 875, 'Open', TRUE,  TRUE,  '01711-234567'),
('Cox''s Bazar College Shelter',       'Cox''s Bazar Sadar',      21.4380, 92.0105, 800,  800, 'Full', FALSE, TRUE,  '01812-345678'),
('Ukhia Primary School Camp',          'Ukhia, Cox''s Bazar',     21.2178, 92.1136, 600,  420, 'Open', TRUE,  TRUE,  '01812-456789'),
('Sunamganj District Shelter',         'Sunamganj Sadar',         25.0692, 91.3925, 400,  310, 'Open', FALSE, TRUE,  '01913-567890'),
('Rangamati Sports Complex Camp',      'Rangamati Sadar',         22.6473, 92.2061, 700,  550, 'Open', TRUE,  TRUE,  '01914-678901'),
('Kurigram Ideal College Shelter',     'Kurigram Sadar',          25.8065, 89.6321, 300,  180, 'Open', FALSE, TRUE,  '01715-789012'),
('Dhaka DNCC School Camp',             'Mirpur, Dhaka',           23.8223, 90.3654, 200,   85, 'Open', TRUE,  FALSE, '01716-890123'),
('Teknaf Emergency Shelter',           'Teknaf, Cox''s Bazar',    20.8641, 92.3010, 450,  430, 'Open', FALSE, TRUE,  '01817-901234'),
('Chattogram Red Crescent Shelter',    'Nasirabad, Chattogram',   22.3735, 91.7943, 350,   95, 'Open', TRUE,  TRUE,  '01918-012345'),
('Khulna City Corporation Relief Camp','Khulna City',             22.8456, 89.5403, 500,   60, 'Open', TRUE,  TRUE,  '01719-123450'),
('Jamalpur Flood Relief Center',       'Jamalpur Sadar',          24.8998, 89.9473, 250,    0, 'Open', FALSE, FALSE, '01820-234561');

-- Victims
INSERT INTO victims (name, age, gender, contact, nid_number, disaster_id, zone_id, shelter_id, medical_condition, status) VALUES
('Md. Rahim Uddin',     45, 'Male',   '01711-111001', '1991234560001', 1, 1, 1,  NULL,               'Safe'),
('Fatema Begum',        38, 'Female', '01711-111002', '1991234560002', 1, 1, 1,  'Diabetes',         'Injured'),
('Karim Ahmed',         12, 'Male',   NULL,           '1991234560003', 1, 2, NULL,'High fever',      'Critical'),
('Shahida Khatun',      60, 'Female', '01812-222001', '1991234560004', 2, 5, 3,  'Heart condition',  'Injured'),
('Noor Islam',          28, 'Male',   '01812-222002', '1991234560005', 2, 6, NULL,NULL,              'Missing'),
('Razia Begum',         35, 'Female', '01812-222003', '1991234560006', 2, 7, 4,  NULL,               'Safe'),
('Abdul Khalek',        55, 'Male',   '01913-333001', '1991234560007', 3, 8, 5,  'Hypertension',    'Safe'),
('Momena Akter',        25, 'Female', '01913-333002', '1991234560008', 3, 9, 5,  NULL,               'Missing'),
('Babu Mia',            8,  'Male',   NULL,           '1991234560009', 3, 8, NULL,'Malnourished',   'Critical'),
('Salma Khatun',        42, 'Female', '01914-444001', '1991234560010', 6, 10,6,  'Fracture',         'Injured'),
('Jhontu Chakma',       30, 'Male',   '01914-444002', '1991234560011', 6, 10,NULL,NULL,             'Missing'),
('Laila Begum',         22, 'Female', '01914-444003', '1991234560012', 6, 11,6,  NULL,               'Safe'),
('Akter Hossain',       48, 'Male',   '01715-555001', '1991234560013', 7, 12,7,  NULL,               'Safe'),
('Dilruba Akter',       31, 'Female', '01715-555002', '1991234560014', 7, 12,7,  NULL,               'Safe'),
('Rubel Khan',          19, 'Male',   '01716-666001', '1991234560015', 9, 13,8,  'Dengue positive',  'Injured'),
('Shirin Akter',        27, 'Female', '01716-666002', '1991234560016', 9, 14,NULL,'Dengue positive', 'Injured'),
('Md. Hasan Ali',       65, 'Male',   '01717-777001', '1991234560017', 1, 2, 2,  'COPD',             'Critical'),
('Nasrin Sultana',      33, 'Female', '01717-777002', '1991234560018', 1, 3, 1,  NULL,               'Safe'),
('Milon Biswas',        40, 'Male',   '01818-888001', '1991234560019', 2, 5, 9,  NULL,               'Safe'),
('Rahela Begum',        52, 'Female', '01818-888002', '1991234560020', 2, 7, 4,  'Asthma',           'Injured');

-- Family Links
INSERT INTO family_links (victim_id, missing_person_name, relationship, last_seen_location, last_seen_date, is_found, found_victim_id) VALUES
(1,  'Karim Ahmed',      'Child',    'Golapganj Upazila',       '2024-06-15 10:00:00', FALSE, NULL),
(4,  'Noor Islam',       'Spouse',   'Teknaf Beach Road',       '2024-05-22 20:00:00', FALSE, NULL),
(7,  'Momena Akter',     'Child',    'Sunamganj River Bank',    '2024-07-01 08:00:00', FALSE, NULL),
(10, 'Jhontu Chakma',    'Sibling',  'Rangamati Hill Road',     '2024-08-10 15:00:00', FALSE, NULL),
(13, 'Unknown Person 1', 'Relative', 'Kurigram Flood Area',     '2024-07-20 12:00:00', TRUE,  14),
(15, 'Parent Unknown',   'Parent',   'Dhaka North Slum',        '2024-01-15 09:00:00', FALSE, NULL),
(2,  'Unknown Relative', 'Relative', 'Sylhet Bus Terminal',     '2024-06-16 14:00:00', FALSE, NULL),
(6,  'Rashed Karim',     'Sibling',  'Ukhia Rohingya Camp B',   '2024-05-23 06:00:00', FALSE, NULL);

-- Volunteers
INSERT INTO volunteers (name, email, phone, skills, availability, assigned_disaster_id, assigned_zone_id, hours_contributed, rating) VALUES
('Dr. Aminul Islam',    'aminul@bsmsucbd.edu.bd',   '01711-VOL001', 'Medical,Counseling',               'Deployed',    1, 1, 120.50, 4.90),
('Rafiq Hossain',       'rafiq@volunteer.org',       '01812-VOL002', 'Rescue,Driving',                   'Deployed',    2, 5, 95.00, 4.75),
('Nadia Chowdhury',     'nadia@redcrescent.org.bd',  '01913-VOL003', 'Medical,Cooking',                  'Deployed',    3, 8, 88.00, 4.80),
('Iqbal Hasan',         'iqbal@rescue.org',          '01914-VOL004', 'Rescue,Engineering',               'Deployed',    6,10, 110.00, 4.60),
('Sultana Parvin',      'sultana@ngo.org',           '01715-VOL005', 'Counseling,Communication',         'Available',  NULL,NULL, 60.00, 4.20),
('Faruk Ahmed',         'faruk@army.bd',             '01716-VOL006', 'Rescue,Driving,Engineering',       'Deployed',    1, 2,  75.00, 4.50),
('Mitu Begum',          'mitu@cook.org',             '01717-VOL007', 'Cooking,Counseling',               'Available',  NULL,NULL, 45.00, 4.10),
('Shaheen Alam',        'shaheen@engineer.org',      '01818-VOL008', 'Engineering,Communication',        'Deployed',    6,11, 130.00, 4.95),
('Dr. Rokeya Khanam',   'rokeya@dhaka-med.edu.bd',   '01919-VOL009', 'Medical,Counseling',               'Deployed',    9,13, 200.00, 5.00),
('Arif Billah',         'arif@rescue.org',           '01720-VOL010', 'Rescue,Driving',                   'Available',  NULL,NULL, 30.00, 3.90),
('Tasnim Jahan',        'tasnim@commun.org',         '01821-VOL011', 'Communication,Counseling',         'Available',  NULL,NULL, 55.00, 4.30),
('Zahid Hasan',         'zahid@engineer.bd',         '01922-VOL012', 'Engineering,Driving,Rescue',       'Deployed',    2, 6, 85.00, 4.65),
('Parveen Akhter',      'parveen@medical.org',       '01723-VOL013', 'Medical',                          'Available',  NULL,NULL, 40.00, 4.40),
('Mahbub Rahman',       'mahbub@ngbd.org',           '01824-VOL014', 'Cooking,Driving',                  'Deployed',    3, 9, 70.00, 4.25),
('Sadia Islam',         'sadia@counsel.org',         '01925-VOL015', 'Counseling,Communication,Medical', 'Available',  NULL,NULL, 25.00, 4.00);

-- Resources
INSERT INTO resources (resource_name, category, quantity, unit, warehouse_location, expiry_date, min_stock_level) VALUES
('Rice (50kg bags)',        'Food',             2000, 'bags',   'Sylhet Central Warehouse',      '2025-12-31', 200),
('Mineral Water (1L)',      'Water',            15000,'bottles','Chattogram Port Warehouse',     '2025-06-30', 1000),
('ORS Packets',             'Medicine',         5000, 'packets','Dhaka Medical Stores',          '2026-03-31', 500),
('Blankets',                'Clothing',         3000, 'pieces', 'Khulna Relief Store',           NULL,         300),
('Emergency Tents',         'Shelter Material', 500,  'units',  'Cox''s Bazar Staging Area',    NULL,         50),
('Paracetamol 500mg',       'Medicine',         10000,'tablets','Dhaka Medical Stores',          '2026-12-31', 1000),
('Lentils (dal) 10kg',      'Food',             1200, 'bags',   'Sylhet Central Warehouse',     '2025-08-31', 100),
('Cooking Oil 5L',          'Food',             800,  'cans',   'Sylhet Central Warehouse',     '2025-10-31', 100),
('Diesel Fuel',             'Fuel',             5000, 'liters', 'Sunamganj Fuel Depot',          NULL,         500),
('Generators (5kW)',        'Equipment',        30,   'units',  'Rangamati Logistics Center',    NULL,         5),
('First Aid Kits',          'Medicine',         400,  'kits',   'Dhaka Medical Stores',          '2026-06-30', 50),
('Children''s Clothing Set','Clothing',         1500, 'sets',   'Khulna Relief Store',           NULL,         100),
('Insulin (vials)',         'Medicine',         200,  'vials',  'Dhaka Medical Stores',          '2025-09-30', 30),
('Portable Water Filters',  'Water',            150,  'units',  'Chattogram Port Warehouse',     NULL,         20),
('Sandbags',                'Equipment',        10000,'pieces', 'Sunamganj Logistics Area',      NULL,         1000);

-- Distributions
INSERT INTO distributions (resource_id, shelter_id, zone_id, quantity_distributed, distributed_by, distribution_date) VALUES
(1,  1, 1,  50, 1, '2024-06-16 09:00:00'),
(2,  1, 1, 500, 1, '2024-06-16 09:30:00'),
(3,  1, 1, 200, 1, '2024-06-16 10:00:00'),
(1,  2, 2, 100, 6, '2024-06-17 08:00:00'),
(4,  2, 2, 200, 6, '2024-06-17 09:00:00'),
(5,  3, 5,  30, 2, '2024-05-23 07:00:00'),
(6,  3, 5, 500, 2, '2024-05-23 08:00:00'),
(2,  4, 7, 800, 12,'2024-05-23 10:00:00'),
(1,  5, 8,  80, 3, '2024-07-02 09:00:00'),
(11, 5, 8,  50, 3, '2024-07-02 10:00:00'),
(1,  6,10,  60, 4, '2024-08-11 08:00:00'),
(10, 6,10,   5, 8, '2024-08-11 09:00:00'),
(9,  7,12, 300,14, '2024-07-21 07:00:00'),
(6,  8,13,1000, 9, '2024-01-20 10:00:00'),
(13, 8,13,  20, 9, '2024-01-20 11:00:00');

-- Donors
INSERT INTO donors (name, donor_type, email, phone) VALUES
('Dr. Muhammad Yunus Foundation', 'NGO',          'info@yunus.org',           '01711-DON001'),
('BRAC Bangladesh',               'NGO',          'donor@brac.net',           '01812-DON002'),
('Bangladesh Government Relief',  'Government',   'relief@gov.bd',            '01913-DON003'),
('Islami Bank Foundation',        'Organization', 'csr@islamibank.com.bd',    '01914-DON004'),
('Md. Kamal Hossain',             'Individual',   'kamal.hossain@gmail.com',  '01715-DON005'),
('UNICEF Bangladesh',             'NGO',          'dhaka@unicef.org',         '01716-DON006'),
('Grameen Bank',                  'Organization', 'csr@grameen.com.bd',       '01717-DON007'),
('Anonymous Donor 1',             'Individual',   NULL,                       NULL),
('Red Crescent Society BD',       'NGO',          'info@bdrcs.org',           '01818-DON009'),
('Dutch-Bangla Bank CSR',         'Organization', 'csr@dutchbanglabank.com',  '01919-DON010'),
('Md. Anwar Hossain',             'Individual',   'anwar@business.com',       '01720-DON011'),
('World Food Programme BD',       'NGO',          'dhaka@wfp.org',            '01821-DON012');

-- Donations
INSERT INTO donations (donor_id, disaster_id, donation_type, amount, item_description, quantity, donation_date, is_verified) VALUES
(3,  1, 'Money',     5000000.00, 'Government emergency relief fund',      0,   '2024-06-15 12:00:00', TRUE),
(2,  1, 'Food',      0.00,       'Rice, lentils, oil packages',           5000,'2024-06-16 08:00:00', TRUE),
(6,  1, 'Medicine',  0.00,       'ORS, water purification tablets',       8000,'2024-06-16 10:00:00', TRUE),
(1,  2, 'Money',     2000000.00, 'Cyclone relief from Yunus Foundation',  0,   '2024-05-23 09:00:00', TRUE),
(9,  2, 'Equipment', 0.00,       'Emergency tents and rescue equipment',  100, '2024-05-23 10:00:00', TRUE),
(4,  2, 'Money',     500000.00,  'CSR donation for cyclone victims',      0,   '2024-05-24 11:00:00', TRUE),
(12, 3, 'Food',      0.00,       'Food packages for flood victims',       3000,'2024-07-02 09:00:00', TRUE),
(7,  3, 'Money',     1000000.00, 'Grameen Bank flood relief',             0,   '2024-07-03 08:00:00', FALSE),
(5,  1, 'Money',     50000.00,   'Personal donation',                     0,   '2024-06-20 15:00:00', TRUE),
(8,  6, 'Clothing',  0.00,       'Blankets and warm clothing',            500, '2024-08-11 12:00:00', FALSE),
(10, 9, 'Medicine',  0.00,       'Dengue test kits and medicines',        2000,'2024-02-01 09:00:00', TRUE),
(11, 9, 'Money',     200000.00,  'Dengue response fund',                  0,   '2024-02-05 10:00:00', FALSE),
(2,  6, 'Food',      0.00,       'Emergency food for landslide victims',  1500,'2024-08-12 08:00:00', TRUE),
(6,  2, 'Food',      0.00,       'WFP food supply for Cox''s Bazar',     10000,'2024-05-25 07:00:00', TRUE),
(3,  6, 'Money',     3000000.00, 'Government Rangamati relief allocation',0,   '2024-08-10 18:00:00', TRUE);

-- Rescue Operations
INSERT INTO rescue_operations (disaster_id, zone_id, operation_name, team_lead_id, status, people_rescued, start_time, end_time, notes) VALUES
(1, 1, 'Sylhet Sadar Flood Rescue',         6,  'In Progress', 450, '2024-06-15 08:00:00', NULL,                  'Using boats for house-to-house rescue.'),
(1, 2, 'Golapganj Emergency Evacuation',    1,  'Planned',       0, '2024-06-18 06:00:00', NULL,                  'Awaiting water level to drop.'),
(2, 5, 'Cox''s Bazar Cyclone Rescue',       2,  'In Progress', 820, '2024-05-22 20:00:00', NULL,                  'Beach area severely affected. Army support requested.'),
(2, 6, 'Teknaf Island Rescue',             12,  'In Progress', 310, '2024-05-23 06:00:00', NULL,                  'Using coast guard vessels.'),
(3, 8, 'Sunamganj River Rescue',            3,  'In Progress', 275, '2024-07-01 06:00:00', NULL,                  'Community boats deployed.'),
(6,10, 'Rangamati Landslide Rescue',        8,  'In Progress', 130, '2024-08-10 15:00:00', NULL,                  'Heavy machinery needed. Roads blocked.'),
(6,11, 'Kaptai Evacuation',                 4,  'Completed',   200, '2024-08-10 16:00:00', '2024-08-12 18:00:00', 'Successfully evacuated Kaptai area.'),
(4, NULL,'Chattogram Earthquake Response',  5,  'Completed',    85, '2024-04-10 04:00:00', '2024-04-10 20:00:00', 'Search & rescue completed.'),
(5, NULL,'Banani Fire Rescue',              7,  'Completed',    55, '2024-03-05 22:30:00', '2024-03-06 06:00:00', 'All occupants evacuated.'),
(9,13, 'Dhaka Dengue Response Team',        9,  'In Progress',   0, '2024-01-10 08:00:00', NULL,                  'Door-to-door health screening ongoing.');

-- Emergency Contacts
INSERT INTO emergency_contacts (organization_name, service_type, phone, zone_coverage, is_active) VALUES
('Bangladesh Fire Service & Civil Defence', 'Fire',       '199',          'Nationwide',                   TRUE),
('National Emergency Service',              'Medical',    '999',          'Nationwide',                   TRUE),
('Bangladesh Police',                       'Police',     '100',          'Nationwide',                   TRUE),
('Bangladesh Army Disaster Response',       'Army',       '01769-100200', 'All Divisions',                TRUE),
('BRAC Disaster Management Unit',           'NGO',        '01841-200300', 'Cox''s Bazar, Sylhet, Dhaka', TRUE),
('Sylhet DDMC',                             'Government', '0821-715530',  'Sylhet Division',             TRUE),
('Cox''s Bazar District Admin',             'Government', '0341-63131',   'Cox''s Bazar District',       TRUE),
('Bangladesh Red Crescent (Dhaka)',         'NGO',        '02-9330188',   'Dhaka Division',               TRUE),
('Chattogram Port Authority Emergency',     'Government', '031-710740',   'Chattogram',                   TRUE),
('DNCC Emergency Response',                 'Government', '01705-060506', 'Dhaka North',                  TRUE),
('Sunamganj Emergency Service',             'Government', '0871-62155',   'Sunamganj District',           TRUE),
('DGDA Emergency Hotline',                  'Medical',    '16197',        'Nationwide',                   TRUE);
