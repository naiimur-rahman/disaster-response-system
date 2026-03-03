# ER Diagram — Disaster Response & Relief Coordination System

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    DISASTERS {
        int disaster_id PK
        enum disaster_type
        enum severity
        varchar location
        decimal latitude
        decimal longitude
        datetime start_date
        datetime end_date
        enum status
        int affected_population
        text description
        timestamp created_at
    }

    AFFECTED_ZONES {
        int zone_id PK
        int disaster_id FK
        varchar zone_name
        enum zone_type
        int population
        enum evacuation_status
    }

    SHELTERS {
        int shelter_id PK
        varchar name
        varchar location
        decimal latitude
        decimal longitude
        int max_capacity
        int current_occupancy
        enum status
        boolean has_medical_facility
        boolean has_food_supply
        varchar contact_number
    }

    VICTIMS {
        int victim_id PK
        varchar name
        int age
        enum gender
        varchar contact
        varchar nid_number
        int disaster_id FK
        int zone_id FK
        int shelter_id FK
        text medical_condition
        enum status
        timestamp registered_at
    }

    FAMILY_LINKS {
        int link_id PK
        int victim_id FK
        varchar missing_person_name
        enum relationship
        varchar last_seen_location
        datetime last_seen_date
        boolean is_found
        int found_victim_id FK
    }

    VOLUNTEERS {
        int volunteer_id PK
        varchar name
        varchar email
        varchar phone
        set skills
        enum availability
        int assigned_disaster_id FK
        int assigned_zone_id FK
        decimal hours_contributed
        decimal rating
    }

    RESOURCES {
        int resource_id PK
        varchar resource_name
        enum category
        int quantity
        varchar unit
        varchar warehouse_location
        date expiry_date
        int min_stock_level
    }

    DISTRIBUTIONS {
        int distribution_id PK
        int resource_id FK
        int shelter_id FK
        int zone_id FK
        int quantity_distributed
        int distributed_by FK
        timestamp distribution_date
    }

    DONORS {
        int donor_id PK
        varchar name
        enum donor_type
        varchar email
        varchar phone
    }

    DONATIONS {
        int donation_id PK
        int donor_id FK
        int disaster_id FK
        enum donation_type
        decimal amount
        text item_description
        int quantity
        timestamp donation_date
        boolean is_verified
    }

    RESCUE_OPERATIONS {
        int operation_id PK
        int disaster_id FK
        int zone_id FK
        varchar operation_name
        int team_lead_id FK
        enum status
        int people_rescued
        datetime start_time
        datetime end_time
        text notes
    }

    EMERGENCY_CONTACTS {
        int contact_id PK
        varchar organization_name
        enum service_type
        varchar phone
        varchar zone_coverage
        boolean is_active
    }

    AUDIT_LOG {
        int log_id PK
        enum action
        varchar table_name
        int record_id
        json old_values
        json new_values
        varchar performed_by
        timestamp timestamp
    }

    USERS {
        int user_id PK
        varchar username
        varchar password_hash
        varchar email
        enum role
        timestamp created_at
    }

    DISASTERS ||--o{ AFFECTED_ZONES : "has"
    DISASTERS ||--o{ VICTIMS : "has"
    DISASTERS ||--o{ VOLUNTEERS : "assigned to"
    DISASTERS ||--o{ DONATIONS : "receives"
    DISASTERS ||--o{ RESCUE_OPERATIONS : "has"
    AFFECTED_ZONES ||--o{ VICTIMS : "contains"
    AFFECTED_ZONES ||--o{ RESCUE_OPERATIONS : "target"
    AFFECTED_ZONES ||--o{ DISTRIBUTIONS : "receives"
    AFFECTED_ZONES ||--o{ VOLUNTEERS : "assigned to"
    SHELTERS ||--o{ VICTIMS : "houses"
    SHELTERS ||--o{ DISTRIBUTIONS : "receives"
    VICTIMS ||--o{ FAMILY_LINKS : "reports"
    VICTIMS ||--o| FAMILY_LINKS : "found as"
    VOLUNTEERS ||--o{ DISTRIBUTIONS : "distributes"
    VOLUNTEERS ||--o{ RESCUE_OPERATIONS : "leads"
    RESOURCES ||--o{ DISTRIBUTIONS : "distributed via"
    DONORS ||--o{ DONATIONS : "makes"
```

## Relationships Summary

| Relationship | Cardinality | Description |
|---|---|---|
| disasters → affected_zones | 1:N | Each disaster has multiple affected zones |
| disasters → victims | 1:N | Each disaster has multiple victims |
| disasters → volunteers | 1:N | Volunteers are assigned to disasters |
| disasters → donations | 1:N | Disasters can receive multiple donations |
| disasters → rescue_operations | 1:N | Each disaster has multiple rescue operations |
| affected_zones → victims | 1:N | A zone contains multiple victims |
| affected_zones → distributions | 1:N | Resources distributed to zones |
| shelters → victims | 1:N | A shelter houses multiple victims |
| shelters → distributions | 1:N | Resources distributed to shelters |
| victims → family_links | 1:N | A victim can report multiple missing persons |
| volunteers → distributions | 1:N | A volunteer handles multiple distributions |
| volunteers → rescue_operations | 1:N | A volunteer leads multiple operations |
| resources → distributions | 1:N | A resource can be distributed multiple times |
| donors → donations | 1:N | A donor can make multiple donations |

## Key Design Decisions

1. **Audit Log**: JSON columns store old/new values for full change history
2. **Soft relationships**: Victims can exist without a shelter or zone (nullable FKs)
3. **Family Links self-reference**: `found_victim_id` references back to victims table for reunification
4. **SET type for skills**: MySQL SET type allows multiple skills per volunteer
5. **CHECK constraint**: `shelters.current_occupancy <= max_capacity` enforces capacity limits
6. **Haversine formula**: Used in `FindNearestShelter` procedure for accurate distance calculation
