-- ============================================================
-- Stored Procedures
-- ============================================================
USE disaster_response;
DELIMITER $$

-- 1. MatchVolunteers: Find available volunteers by skill, ranked by rating & hours
DROP PROCEDURE IF EXISTS MatchVolunteers$$
CREATE PROCEDURE MatchVolunteers(
    IN p_disaster_id INT,
    IN p_skill       VARCHAR(50)
)
BEGIN
    SELECT
        v.volunteer_id,
        v.name,
        v.email,
        v.phone,
        v.skills,
        v.availability,
        v.hours_contributed,
        v.rating,
        DENSE_RANK() OVER (ORDER BY v.rating DESC, v.hours_contributed DESC) AS volunteer_rank
    FROM volunteers v
    WHERE v.availability = 'Available'
      AND FIND_IN_SET(p_skill, v.skills) > 0
    ORDER BY v.rating DESC, v.hours_contributed DESC;
END$$

-- 2. FindNearestShelter: Find 5 nearest shelters with available spots
DROP PROCEDURE IF EXISTS FindNearestShelter$$
CREATE PROCEDURE FindNearestShelter(
    IN p_lat DECIMAL(10,8),
    IN p_lon DECIMAL(11,8)
)
BEGIN
    SELECT
        shelter_id,
        name,
        location,
        latitude,
        longitude,
        max_capacity,
        current_occupancy,
        (max_capacity - current_occupancy) AS available_spots,
        status,
        has_medical_facility,
        has_food_supply,
        contact_number,
        -- Haversine formula for distance in km
        (6371 * ACOS(
            COS(RADIANS(p_lat)) * COS(RADIANS(latitude)) *
            COS(RADIANS(longitude) - RADIANS(p_lon)) +
            SIN(RADIANS(p_lat)) * SIN(RADIANS(latitude))
        )) AS distance_km
    FROM shelters
    WHERE status = 'Open'
      AND current_occupancy < max_capacity
    ORDER BY distance_km ASC
    LIMIT 5;
END$$

-- 3. DisasterReport: Comprehensive report
DROP PROCEDURE IF EXISTS DisasterReport$$
CREATE PROCEDURE DisasterReport(IN p_disaster_id INT)
BEGIN
    -- Basic disaster info
    SELECT * FROM disasters WHERE disaster_id = p_disaster_id;

    -- Victim stats
    SELECT
        status,
        COUNT(*) AS count
    FROM victims
    WHERE disaster_id = p_disaster_id
    GROUP BY status;

    -- Volunteer deployment stats
    SELECT
        COUNT(*) AS total_volunteers,
        SUM(hours_contributed) AS total_hours
    FROM volunteers
    WHERE assigned_disaster_id = p_disaster_id;

    -- Donation summary
    SELECT
        donation_type,
        COUNT(*) AS donation_count,
        SUM(amount) AS total_amount,
        SUM(quantity) AS total_quantity
    FROM donations
    WHERE disaster_id = p_disaster_id
    GROUP BY donation_type;

    -- Rescue operations summary
    SELECT
        status,
        COUNT(*) AS operations_count,
        SUM(people_rescued) AS total_rescued
    FROM rescue_operations
    WHERE disaster_id = p_disaster_id
    GROUP BY status;

    -- Resource distributions
    SELECT
        r.resource_name,
        r.category,
        SUM(d.quantity_distributed) AS total_distributed
    FROM distributions d
    JOIN resources r ON d.resource_id = r.resource_id
    WHERE d.zone_id IN (
        SELECT zone_id FROM affected_zones WHERE disaster_id = p_disaster_id
    )
    GROUP BY r.resource_id, r.resource_name, r.category;
END$$

-- 4. AllocateResources: Safe resource distribution with transaction
DROP PROCEDURE IF EXISTS AllocateResources$$
CREATE PROCEDURE AllocateResources(
    IN p_resource_id  INT,
    IN p_shelter_id   INT,
    IN p_quantity     INT,
    IN p_volunteer_id INT
)
BEGIN
    DECLARE available_qty INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the resource row
    SELECT quantity INTO available_qty
    FROM resources
    WHERE resource_id = p_resource_id
    FOR UPDATE;

    IF available_qty < p_quantity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient resource quantity';
    END IF;

    -- Deduct from resources
    UPDATE resources
    SET quantity = quantity - p_quantity
    WHERE resource_id = p_resource_id;

    -- Record distribution
    INSERT INTO distributions (resource_id, shelter_id, quantity_distributed, distributed_by)
    VALUES (p_resource_id, p_shelter_id, p_quantity, p_volunteer_id);

    COMMIT;
END$$

DELIMITER ;
