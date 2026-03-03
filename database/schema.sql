-- ============================================================
-- Disaster Response & Relief Coordination System
-- Database Schema - MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS disaster_response;
USE disaster_response;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    role        ENUM('Admin','Coordinator','Volunteer','Viewer') DEFAULT 'Viewer',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Disasters table
CREATE TABLE IF NOT EXISTS disasters (
    disaster_id         INT AUTO_INCREMENT PRIMARY KEY,
    disaster_type       ENUM('Flood','Cyclone','Earthquake','Fire','Landslide','Pandemic') NOT NULL,
    severity            ENUM('Low','Medium','High','Critical') NOT NULL,
    location            VARCHAR(200) NOT NULL,
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    start_date          DATETIME NOT NULL,
    end_date            DATETIME,
    status              ENUM('Active','Contained','Resolved') DEFAULT 'Active',
    affected_population INT DEFAULT 0,
    description         TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Affected Zones
CREATE TABLE IF NOT EXISTS affected_zones (
    zone_id             INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id         INT NOT NULL,
    zone_name           VARCHAR(100) NOT NULL,
    zone_type           ENUM('Red','Orange','Yellow','Green') NOT NULL,
    population          INT DEFAULT 0,
    evacuation_status   ENUM('Not Started','In Progress','Completed') DEFAULT 'Not Started',
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE CASCADE
);

-- 4. Shelters
CREATE TABLE IF NOT EXISTS shelters (
    shelter_id          INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    location            VARCHAR(200) NOT NULL,
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    max_capacity        INT NOT NULL,
    current_occupancy   INT DEFAULT 0,
    status              ENUM('Open','Full','Closed') DEFAULT 'Open',
    has_medical_facility BOOLEAN DEFAULT FALSE,
    has_food_supply     BOOLEAN DEFAULT FALSE,
    contact_number      VARCHAR(20),
    CONSTRAINT chk_occupancy CHECK (current_occupancy <= max_capacity)
);

-- 5. Victims
CREATE TABLE IF NOT EXISTS victims (
    victim_id           INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    age                 INT,
    gender              ENUM('Male','Female','Other'),
    contact             VARCHAR(20),
    nid_number          VARCHAR(20) UNIQUE,
    disaster_id         INT,
    zone_id             INT,
    shelter_id          INT,
    medical_condition   TEXT,
    status              ENUM('Safe','Missing','Injured','Critical','Deceased') DEFAULT 'Safe',
    registered_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id)     REFERENCES affected_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (shelter_id)  REFERENCES shelters(shelter_id) ON DELETE SET NULL
);

-- 6. Family Links (missing person reports)
CREATE TABLE IF NOT EXISTS family_links (
    link_id             INT AUTO_INCREMENT PRIMARY KEY,
    victim_id           INT NOT NULL,
    missing_person_name VARCHAR(100) NOT NULL,
    relationship        ENUM('Spouse','Parent','Child','Sibling','Relative','Friend','Other') NOT NULL,
    last_seen_location  VARCHAR(200),
    last_seen_date      DATETIME,
    is_found            BOOLEAN DEFAULT FALSE,
    found_victim_id     INT,
    FOREIGN KEY (victim_id)       REFERENCES victims(victim_id) ON DELETE CASCADE,
    FOREIGN KEY (found_victim_id) REFERENCES victims(victim_id) ON DELETE SET NULL
);

-- 7. Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id        INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(100) UNIQUE,
    phone               VARCHAR(20),
    skills              SET('Medical','Rescue','Cooking','Driving','Counseling','Engineering','Communication'),
    availability        ENUM('Available','Deployed','Unavailable') DEFAULT 'Available',
    assigned_disaster_id INT,
    assigned_zone_id    INT,
    hours_contributed   DECIMAL(8,2) DEFAULT 0.00,
    rating              DECIMAL(3,2) DEFAULT 0.00,
    FOREIGN KEY (assigned_disaster_id) REFERENCES disasters(disaster_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_zone_id)     REFERENCES affected_zones(zone_id) ON DELETE SET NULL
);

-- 8. Resources
CREATE TABLE IF NOT EXISTS resources (
    resource_id         INT AUTO_INCREMENT PRIMARY KEY,
    resource_name       VARCHAR(150) NOT NULL,
    category            ENUM('Food','Water','Medicine','Clothing','Equipment','Shelter Material','Fuel') NOT NULL,
    quantity            INT DEFAULT 0,
    unit                VARCHAR(30),
    warehouse_location  VARCHAR(200),
    expiry_date         DATE,
    min_stock_level     INT DEFAULT 100
);

-- 9. Distributions
CREATE TABLE IF NOT EXISTS distributions (
    distribution_id     INT AUTO_INCREMENT PRIMARY KEY,
    resource_id         INT NOT NULL,
    shelter_id          INT,
    zone_id             INT,
    quantity_distributed INT NOT NULL,
    distributed_by      INT,
    distribution_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id)   REFERENCES resources(resource_id),
    FOREIGN KEY (shelter_id)    REFERENCES shelters(shelter_id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id)       REFERENCES affected_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (distributed_by) REFERENCES volunteers(volunteer_id) ON DELETE SET NULL
);

-- 10. Donors
CREATE TABLE IF NOT EXISTS donors (
    donor_id    INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    donor_type  ENUM('Individual','Organization','Government','NGO') DEFAULT 'Individual',
    email       VARCHAR(100),
    phone       VARCHAR(20)
);

-- 11. Donations
CREATE TABLE IF NOT EXISTS donations (
    donation_id     INT AUTO_INCREMENT PRIMARY KEY,
    donor_id        INT,
    disaster_id     INT,
    donation_type   ENUM('Money','Food','Medicine','Clothing','Equipment') NOT NULL,
    amount          DECIMAL(12,2) DEFAULT 0.00,
    item_description TEXT,
    quantity        INT DEFAULT 0,
    donation_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (donor_id)    REFERENCES donors(donor_id) ON DELETE SET NULL,
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE SET NULL
);

-- 12. Rescue Operations
CREATE TABLE IF NOT EXISTS rescue_operations (
    operation_id    INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id     INT,
    zone_id         INT,
    operation_name  VARCHAR(150) NOT NULL,
    team_lead_id    INT,
    status          ENUM('Planned','In Progress','Completed','Aborted') DEFAULT 'Planned',
    people_rescued  INT DEFAULT 0,
    start_time      DATETIME,
    end_time        DATETIME,
    notes           TEXT,
    FOREIGN KEY (disaster_id)  REFERENCES disasters(disaster_id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id)      REFERENCES affected_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (team_lead_id) REFERENCES volunteers(volunteer_id) ON DELETE SET NULL
);

-- 13. Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id          INT AUTO_INCREMENT PRIMARY KEY,
    organization_name   VARCHAR(150) NOT NULL,
    service_type        ENUM('Fire','Medical','Police','Army','NGO','Government') NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    zone_coverage       VARCHAR(200),
    is_active           BOOLEAN DEFAULT TRUE
);

-- 14. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    log_id          INT AUTO_INCREMENT PRIMARY KEY,
    action          ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    table_name      VARCHAR(50) NOT NULL,
    record_id       INT,
    old_values      JSON,
    new_values      JSON,
    performed_by    VARCHAR(100),
    timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
