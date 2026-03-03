-- ============================================================
-- Views
-- ============================================================
USE disaster_response;

-- 1. Live Dashboard — Active disasters with counts
CREATE OR REPLACE VIEW live_dashboard AS
SELECT
    d.disaster_id,
    d.disaster_type,
    d.severity,
    d.location,
    d.status,
    d.start_date,
    d.affected_population,
    COUNT(DISTINCT v.victim_id)                                         AS total_victims,
    SUM(CASE WHEN v.status = 'Missing'  THEN 1 ELSE 0 END)             AS missing_count,
    SUM(CASE WHEN v.status = 'Injured'  THEN 1 ELSE 0 END)             AS injured_count,
    SUM(CASE WHEN v.status = 'Critical' THEN 1 ELSE 0 END)             AS critical_count,
    COUNT(DISTINCT vol.volunteer_id)                                    AS volunteer_count,
    COUNT(DISTINCT az.zone_id)                                          AS zone_count
FROM disasters d
LEFT JOIN victims    v   ON d.disaster_id = v.disaster_id
LEFT JOIN volunteers vol ON d.disaster_id = vol.assigned_disaster_id
LEFT JOIN affected_zones az ON d.disaster_id = az.disaster_id
WHERE d.status = 'Active'
GROUP BY d.disaster_id, d.disaster_type, d.severity, d.location,
         d.status, d.start_date, d.affected_population;

-- 2. Donation Transparency — All donations with donor info
CREATE OR REPLACE VIEW donation_transparency AS
SELECT
    dn.donation_id,
    dr.name            AS donor_name,
    dr.donor_type,
    dr.email           AS donor_email,
    dis.disaster_type,
    dis.location       AS disaster_location,
    dn.donation_type,
    dn.amount,
    dn.item_description,
    dn.quantity,
    dn.donation_date,
    dn.is_verified
FROM donations dn
LEFT JOIN donors    dr  ON dn.donor_id    = dr.donor_id
LEFT JOIN disasters dis ON dn.disaster_id = dis.disaster_id
ORDER BY dn.donation_date DESC;

-- 3. Volunteer Leaderboard — ranked by hours and rating
CREATE OR REPLACE VIEW volunteer_leaderboard AS
SELECT
    volunteer_id,
    name,
    email,
    skills,
    availability,
    hours_contributed,
    rating,
    DENSE_RANK() OVER (ORDER BY hours_contributed DESC, rating DESC) AS volunteer_rank
FROM volunteers
ORDER BY volunteer_rank;

-- 4. Zone Urgency Report — zones needing immediate attention
CREATE OR REPLACE VIEW zone_urgency_report AS
SELECT
    az.zone_id,
    az.zone_name,
    az.zone_type,
    az.population,
    az.evacuation_status,
    d.disaster_type,
    d.severity,
    d.location AS disaster_location,
    COUNT(DISTINCT v.victim_id)                                     AS victim_count,
    SUM(CASE WHEN v.status IN ('Missing','Critical') THEN 1 ELSE 0 END) AS urgent_cases,
    COUNT(DISTINCT ro.operation_id)                                 AS active_operations
FROM affected_zones az
JOIN disasters d ON az.disaster_id = d.disaster_id
LEFT JOIN victims v ON az.zone_id = v.zone_id
LEFT JOIN rescue_operations ro ON az.zone_id = ro.zone_id AND ro.status = 'In Progress'
WHERE d.status = 'Active'
  AND (az.zone_type IN ('Red','Orange') OR az.evacuation_status != 'Completed')
GROUP BY az.zone_id, az.zone_name, az.zone_type, az.population,
         az.evacuation_status, d.disaster_type, d.severity, d.location
ORDER BY
    FIELD(az.zone_type,'Red','Orange','Yellow','Green'),
    urgent_cases DESC;
