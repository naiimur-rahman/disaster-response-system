# API Documentation — Disaster Response System

## Base URL
```
http://localhost:3000/api
```

## Authentication
Protected endpoints require a JWT token:
```
Authorization: Bearer <token>
```

GET (read) endpoints are public. POST, PUT, DELETE require authentication.

---

## Auth Endpoints

### POST /api/auth/login
Authenticate and receive a JWT token.

**Request:**
```json
{ "username": "admin", "password": "password123" }
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "user_id": 1, "username": "admin", "email": "admin@example.com", "role": "Admin" }
}
```

**Errors:** `401 Invalid credentials`, `422 Validation failed`

---

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{ "username": "newuser", "email": "new@example.com", "password": "securepassword", "role": "Viewer" }
```

**Response 201:**
```json
{ "user_id": 10, "message": "User registered successfully" }
```

**Errors:** `409 Username/email in use`, `422 Validation failed`

---

### GET /api/auth/me 🔒
Get current authenticated user info.

**Response 200:**
```json
{ "user_id": 1, "username": "admin", "email": "admin@example.com", "role": "Admin", "created_at": "..." }
```

---

## Pagination
All list endpoints support:
- `?page=1` — page number (default: 1)
- `?limit=20` — items per page (default: 20, max: 100)

**Response format:**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

## Disasters

### GET /api/disasters
List disasters with optional filters.

**Query params:** `status`, `type`, `severity`, `page`, `limit`

### GET /api/disasters/:id
Get disaster details with affected zones.

### POST /api/disasters 🔒
Create a new disaster.

**Required fields:** `disaster_type`, `severity`, `location`, `start_date`

**Optional:** `latitude`, `longitude`, `end_date`, `status`, `affected_population`, `description`

### PUT /api/disasters/:id 🔒
Update a disaster.

### DELETE /api/disasters/:id 🔒
Delete a disaster.

**Response 404** if not found.

### GET /api/disasters/:id/report
Get comprehensive disaster report (calls stored procedure).

### GET /api/disasters/export
Download disasters as CSV file.

---

## Shelters

### GET /api/shelters
List all shelters (paginated).

### GET /api/shelters/nearest?lat=&lon=
Find nearest shelters using Haversine formula.

### GET /api/shelters/:id
Get shelter by ID.

### POST /api/shelters 🔒
Create shelter.

**Required:** `name`, `location`, `max_capacity` (positive integer)

### PUT /api/shelters/:id 🔒
Update shelter.

### DELETE /api/shelters/:id 🔒
Delete shelter.

---

## Victims

### GET /api/victims
List victims. **Query params:** `status`, `disaster_id`, `page`, `limit`

### GET /api/victims/search?name=
Search victims by name.

### GET /api/victims/:id
Get victim by ID.

### POST /api/victims 🔒
Register victim. **Required:** `name`

### PUT /api/victims/:id 🔒
Update victim.

### DELETE /api/victims/:id 🔒
Delete victim.

### GET /api/victims/export
Download victims as CSV.

---

## Family Links

### GET /api/family-links
List missing person reports (paginated).

### POST /api/family-links 🔒
Report missing family member. **Required:** `victim_id`, `missing_person_name`, `relationship`

### PUT /api/family-links/:id/found 🔒
Mark person as found.

**Request:** `{ "found_victim_id": 5 }`

### DELETE /api/family-links/:id 🔒
Delete family link.

---

## Volunteers

### GET /api/volunteers
List all volunteers (paginated).

### GET /api/volunteers/leaderboard
Get volunteer leaderboard.

### GET /api/volunteers/match?disaster_id=&skill=
Find matching volunteers for a disaster.

### POST /api/volunteers 🔒
Register volunteer. **Required:** `name`

### PUT /api/volunteers/:id 🔒
Update volunteer.

### DELETE /api/volunteers/:id 🔒
Delete volunteer.

---

## Resources

### GET /api/resources
List resources with low-stock flag (paginated).

### GET /api/resources/:id
Get resource by ID.

### POST /api/resources 🔒
Add resource. **Required:** `resource_name`, `category`

### DELETE /api/resources/:id 🔒
Delete resource.

### GET /api/resources/distributions
List distribution history.

### POST /api/resources/distributions 🔒
Allocate resources (calls stored procedure).

---

## Donations

### GET /api/donations
List donations via transparency view (paginated).

### GET /api/donations/stats
Get donation statistics.

### POST /api/donations 🔒
Record donation. **Required:** `donation_type`

### DELETE /api/donations/:id 🔒
Delete donation.

### GET /api/donations/export
Download donations as CSV.

---

## Rescue Operations

### GET /api/rescue-operations
List all rescue operations (paginated).

### GET /api/rescue-operations/:id
Get rescue operation by ID.

### POST /api/rescue-operations 🔒
Create rescue operation. **Required:** `operation_name`

### PUT /api/rescue-operations/:id 🔒
Update rescue operation.

### DELETE /api/rescue-operations/:id 🔒
Delete rescue operation.

---

## Emergency Contacts

### GET /api/emergency-contacts
List contacts. **Query params:** `service_type`, `is_active`, `page`, `limit`

### GET /api/emergency-contacts/:id
Get contact by ID.

### POST /api/emergency-contacts 🔒
Add emergency contact. **Required:** `organization_name`, `service_type`, `phone`

### PUT /api/emergency-contacts/:id 🔒
Update contact.

### DELETE /api/emergency-contacts/:id 🔒
Delete contact.

---

## Donors

### GET /api/donors
List donors with total donated amounts (paginated).

### GET /api/donors/:id
Get donor with donation history.

### POST /api/donors 🔒
Create donor. **Required:** `name`

### PUT /api/donors/:id 🔒
Update donor.

### DELETE /api/donors/:id 🔒
Delete donor.

---

## Dashboard

### GET /api/dashboard
Get live dashboard stats (disaster counts, victim stats, volunteer counts, donation totals, recent activity).

---

## File Upload

### POST /api/upload 🔒
Upload a file (image or PDF, max 5MB).

**Content-Type:** `multipart/form-data`

**Response:**
```json
{ "url": "/uploads/filename.jpg", "filename": "filename.jpg" }
```

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — missing or invalid parameters |
| 401 | Unauthorized — missing or invalid JWT token |
| 403 | Forbidden — insufficient role |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — duplicate entry |
| 422 | Unprocessable — validation failed (includes `fields` array) |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable — database connection failed |

**Validation Error Example:**
```json
{
  "error": "Validation failed",
  "fields": [
    { "type": "field", "msg": "name is required", "path": "name", "location": "body" }
  ]
}
```
