-- ============================================================
-- Triggers
-- ============================================================
USE disaster_response;
DELIMITER $$

-- 1. Auto-update shelter status when occupancy reaches max capacity
DROP TRIGGER IF EXISTS trg_shelter_status_update$$
CREATE TRIGGER trg_shelter_status_update
AFTER UPDATE ON shelters
FOR EACH ROW
BEGIN
    IF NEW.current_occupancy >= NEW.max_capacity AND NEW.status != 'Closed' THEN
        UPDATE shelters SET status = 'Full' WHERE shelter_id = NEW.shelter_id;
    ELSEIF NEW.current_occupancy < NEW.max_capacity AND OLD.status = 'Full' THEN
        UPDATE shelters SET status = 'Open' WHERE shelter_id = NEW.shelter_id;
    END IF;
END$$

-- 2. Low stock alert — log when resources drop below minimum level
DROP TRIGGER IF EXISTS trg_low_stock_alert$$
CREATE TRIGGER trg_low_stock_alert
AFTER UPDATE ON resources
FOR EACH ROW
BEGIN
    IF NEW.quantity < NEW.min_stock_level AND OLD.quantity >= OLD.min_stock_level THEN
        INSERT INTO audit_log (action, table_name, record_id, old_values, new_values, performed_by)
        VALUES (
            'UPDATE',
            'resources',
            NEW.resource_id,
            JSON_OBJECT('quantity', OLD.quantity, 'min_stock_level', OLD.min_stock_level),
            JSON_OBJECT('quantity', NEW.quantity, 'alert', 'LOW_STOCK', 'resource_name', NEW.resource_name),
            'SYSTEM_TRIGGER'
        );
    END IF;
END$$

-- 3. Auto-deduct resources after distribution insert
DROP TRIGGER IF EXISTS trg_auto_deduct_resources$$
CREATE TRIGGER trg_auto_deduct_resources
AFTER INSERT ON distributions
FOR EACH ROW
BEGIN
    UPDATE resources
    SET quantity = quantity - NEW.quantity_distributed
    WHERE resource_id = NEW.resource_id;
END$$

-- 4a. Audit trail on victims INSERT
DROP TRIGGER IF EXISTS trg_victims_audit_insert$$
CREATE TRIGGER trg_victims_audit_insert
AFTER INSERT ON victims
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (action, table_name, record_id, new_values, performed_by)
    VALUES (
        'INSERT',
        'victims',
        NEW.victim_id,
        JSON_OBJECT(
            'name', NEW.name,
            'status', NEW.status,
            'disaster_id', NEW.disaster_id,
            'shelter_id', NEW.shelter_id
        ),
        'SYSTEM'
    );
END$$

-- 4b. Audit trail on victims UPDATE
DROP TRIGGER IF EXISTS trg_victims_audit_update$$
CREATE TRIGGER trg_victims_audit_update
AFTER UPDATE ON victims
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (action, table_name, record_id, old_values, new_values, performed_by)
    VALUES (
        'UPDATE',
        'victims',
        NEW.victim_id,
        JSON_OBJECT(
            'name', OLD.name,
            'status', OLD.status,
            'disaster_id', OLD.disaster_id,
            'shelter_id', OLD.shelter_id
        ),
        JSON_OBJECT(
            'name', NEW.name,
            'status', NEW.status,
            'disaster_id', NEW.disaster_id,
            'shelter_id', NEW.shelter_id
        ),
        'SYSTEM'
    );
END$$

DELIMITER ;
