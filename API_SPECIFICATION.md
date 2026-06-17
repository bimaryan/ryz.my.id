# 🔌 RYZ Shortlink - API Specification

Complete REST API documentation dengan request/response examples.

---

## 📋 Base URL

```
Development: http://localhost:3000/api
Production: https://ryz.my.id/api
```

---

## 🔐 Authentication

### API Key Authentication (for API v1)

```bash
Authorization: Bearer sk_live_xxxxx
```

### Session Authentication (for Web UI)

```
Cookie: session_id=xxxxx
X-CSRF-Token: xxxxx
```

---

## 📡 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2026-06-15T10:30:00Z",
  "request_id": "req_xxx"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email is required",
    "details": {
      "field": "email"
    }
  },
  "timestamp": "2026-06-15T10:30:00Z",
  "request_id": "req_xxx"
}
```

### Error Codes

| Code | Status | Deskripsi |
|------|--------|-----------|
| `INVALID_INPUT` | 400 | Validation error |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate/conflict (e.g., slug exists) |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🔐 Authentication Endpoints

### POST /auth/signup

**Create new account**

**Request**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_verified": false
    },
    "message": "Please verify your email"
  }
}
```

**Errors**
- `400`: Invalid email or password
- `409`: Email already registered
- `422`: Password doesn't meet requirements

---

### POST /auth/login

**Login to account**

**Request**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "session": {
      "token": "eyJhbGc...",
      "expires_in": 3600
    }
  }
}
```

**Errors**
- `400`: Invalid credentials
- `401`: Email not verified
- `429`: Too many login attempts (locked for 15 min)

---

### POST /auth/logout

**Logout from account**

**Request**
```bash
POST /api/auth/logout
Authorization: Bearer token
```

**Response (200)**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/verify-email

**Verify email dengan token atau code**

**Request**
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verify_token_xxx",
  "code": "123456"  // or use token
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### POST /auth/forgot-password

**Request password reset**

**Request**
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password

**Reset password dengan token**

**Request**
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_xxx",
  "new_password": "NewSecurePass123!"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 🔗 Links Endpoints

### POST /links

**Create new short link**

**Request**
```bash
POST /api/links
Authorization: Bearer token
Content-Type: application/json

{
  "original_url": "https://example.com/very/long/path",
  "title": "My Amazing Link",
  "description": "This is a test link",
  "tags": ["promo", "social"],
  "category": "marketing",
  "custom_slug": "my-link",
  "password": "secret123",
  "expires_at": "2026-12-31T23:59:59Z",
  "utm_source": "twitter",
  "utm_medium": "social",
  "utm_campaign": "summer-sale",
  "is_public": true
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "lnk_abc123",
    "user_id": "usr_abc123",
    "original_url": "https://example.com/very/long/path",
    "short_code": "abc123",
    "custom_slug": "my-link",
    "title": "My Amazing Link",
    "description": "This is a test link",
    "tags": ["promo", "social"],
    "qr_code_url": "data:image/png;base64,...",
    "clicks_count": 0,
    "created_at": "2026-06-15T10:30:00Z"
  }
}
```

**Errors**
- `400`: Invalid URL or missing fields
- `409`: Custom slug already exists
- `422`: User quota exceeded

---

### GET /links

**List user's links dengan pagination**

**Request**
```bash
GET /api/links?page=1&limit=20&search=promo&tags=social&sort=-created_at
Authorization: Bearer token
```

**Query Parameters**
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `search`: string (search title/description/slug)
- `tags`: string (comma-separated)
- `category`: string
- `sort`: created_at|-created_at|clicks_count|-clicks_count
- `is_active`: boolean

**Response (200)**
```json
{
  "success": true,
  "data": {
    "links": [
      {
        "id": "lnk_abc123",
        "original_url": "https://example.com",
        "short_code": "abc123",
        "title": "My Link",
        "clicks_count": 42,
        "created_at": "2026-06-15T10:30:00Z"
      }
      // ... more links
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### GET /links/:id

**Get single link details**

**Request**
```bash
GET /api/links/lnk_abc123
Authorization: Bearer token
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "lnk_abc123",
    "user_id": "usr_abc123",
    "original_url": "https://example.com/very/long/path",
    "short_code": "abc123",
    "custom_slug": "my-link",
    "title": "My Amazing Link",
    "description": "This is a test link",
    "tags": ["promo", "social"],
    "category": "marketing",
    "password_hash": "hashed_password",
    "expires_at": "2026-12-31T23:59:59Z",
    "qr_code_url": "data:image/png;base64,...",
    "clicks_count": 42,
    "is_public": true,
    "utm_source": "twitter",
    "utm_medium": "social",
    "utm_campaign": "summer-sale",
    "created_at": "2026-06-15T10:30:00Z",
    "updated_at": "2026-06-15T10:30:00Z"
  }
}
```

---

### PUT /links/:id

**Update link details**

**Request**
```bash
PUT /api/links/lnk_abc123
Authorization: Bearer token
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new-tag"],
  "category": "sales",
  "is_active": true,
  "password": "newpassword123",
  "expires_at": "2026-12-31T23:59:59Z",
  "utm_source": "facebook"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    // updated link object
  }
}
```

**Errors**
- `404`: Link not found
- `403`: Not authorized to edit

---

### DELETE /links/:id

**Delete link**

**Request**
```bash
DELETE /api/links/lnk_abc123
Authorization: Bearer token
```

**Response (200)**
```json
{
  "success": true,
  "message": "Link deleted successfully",
  "data": {
    "archived_analytics": 156
  }
}
```

---

### GET /links/:id/qr-code

**Download QR code**

**Request**
```bash
GET /api/links/lnk_abc123/qr-code?format=png&size=300
Authorization: Bearer token
```

**Query Parameters**
- `format`: png|svg|pdf (default: png)
- `size`: 100-1000 (default: 300)

**Response (200)**
```
Binary image data
Content-Type: image/png
```

---

## 📊 Analytics Endpoints

### GET /links/:id/analytics

**Get link analytics**

**Request**
```bash
GET /api/links/lnk_abc123/analytics?start_date=2026-06-01&end_date=2026-06-15&group_by=day
Authorization: Bearer token
```

**Query Parameters**
- `start_date`: ISO8601 date
- `end_date`: ISO8601 date
- `group_by`: day|week|month (default: day)

**Response (200)**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_clicks": 1250,
      "unique_visitors": 842,
      "avg_clicks_per_day": 83.3
    },
    "clicks_by_date": [
      {
        "date": "2026-06-15",
        "clicks": 95,
        "unique_visitors": 72
      }
      // ... more dates
    ],
    "top_countries": [
      {
        "country": "Indonesia",
        "clicks": 450,
        "percentage": 36.0
      },
      {
        "country": "United States",
        "clicks": 280,
        "percentage": 22.4
      }
      // ... more countries
    ],
    "device_breakdown": {
      "mobile": {
        "clicks": 750,
        "percentage": 60.0
      },
      "tablet": {
        "clicks": 200,
        "percentage": 16.0
      },
      "desktop": {
        "clicks": 300,
        "percentage": 24.0
      }
    },
    "top_browsers": [
      {
        "browser": "Chrome",
        "clicks": 600,
        "percentage": 48.0
      },
      {
        "browser": "Safari",
        "clicks": 350,
        "percentage": 28.0
      }
      // ... more browsers
    ],
    "top_referrers": [
      {
        "referrer": "twitter.com",
        "clicks": 500,
        "percentage": 40.0
      },
      {
        "referrer": "(direct)",
        "clicks": 350,
        "percentage": 28.0
      }
      // ... more referrers
    ],
    "utm_analytics": {
      "sources": [
        {
          "source": "twitter",
          "clicks": 400
        }
      ],
      "mediums": [
        {
          "medium": "social",
          "clicks": 400
        }
      ],
      "campaigns": [
        {
          "campaign": "summer-sale",
          "clicks": 400
        }
      ]
    }
  }
}
```

---

### GET /analytics/export

**Export analytics to CSV**

**Request**
```bash
GET /api/analytics/export?link_id=lnk_abc123&format=csv&start_date=2026-06-01&end_date=2026-06-15
Authorization: Bearer token
```

**Response (200)**
```
CSV file download
Content-Type: text/csv
Content-Disposition: attachment; filename="analytics.csv"
```

---

## 👥 Teams Endpoints

### POST /teams

**Create new team**

**Request**
```bash
POST /api/teams
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Marketing Team",
  "slug": "marketing-team",
  "description": "Team untuk campaign marketing",
  "avatar_url": "https://..."
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "tm_abc123",
    "owner_id": "usr_abc123",
    "name": "Marketing Team",
    "slug": "marketing-team",
    "members_count": 1,
    "created_at": "2026-06-15T10:30:00Z"
  }
}
```

---

### POST /teams/:team_id/invite

**Invite member to team**

**Request**
```bash
POST /api/teams/tm_abc123/invite
Authorization: Bearer token
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Invitation sent to newmember@example.com"
}
```

---

### GET /teams/:team_id/members

**Get team members**

**Request**
```bash
GET /api/teams/tm_abc123/members
Authorization: Bearer token
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "tm_mem_123",
        "user_id": "usr_abc123",
        "email": "owner@example.com",
        "role": "owner",
        "joined_at": "2026-06-15T10:30:00Z"
      },
      {
        "id": "tm_mem_456",
        "user_id": "usr_def456",
        "email": "member@example.com",
        "role": "member",
        "joined_at": "2026-06-15T11:00:00Z"
      }
    ]
  }
}
```

---

## 🔑 API Keys Endpoints

### POST /api-keys

**Generate API key**

**Request**
```bash
POST /api/api-keys
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Mobile App Integration",
  "permissions": ["read:links", "create:links"],
  "expires_at": "2027-06-15T23:59:59Z"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Mobile App Integration",
    "key": "sk_live_abc123xyz...",
    "permissions": ["read:links", "create:links"],
    "created_at": "2026-06-15T10:30:00Z",
    "expires_at": "2027-06-15T23:59:59Z"
  }
}
```

**Note**: Key hanya ditampilkan sekali. User harus save immediately!

---

### GET /api-keys/:key_id/usage

**Get API key usage**

**Request**
```bash
GET /api/api-keys/key_abc123/usage?period=month
Authorization: Bearer token
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "limit": 10000,
    "used": 3245,
    "remaining": 6755,
    "resets_at": "2026-07-15T00:00:00Z",
    "requests_by_endpoint": {
      "POST /links": 1200,
      "GET /links": 1500,
      "GET /links/:id/analytics": 545
    }
  }
}
```

---

## 👤 Account Endpoints

### GET /account/profile

**Get user profile**

**Request**
```bash
GET /api/account/profile
Authorization: Bearer token
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "plan_type": "pro",
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### PUT /account/profile

**Update profile**

**Request**
```bash
PUT /api/account/profile
Authorization: Bearer token
Content-Type: application/json

{
  "full_name": "John Updated",
  "avatar_url": "https://..."
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    // updated user object
  }
}
```

---

### PUT /account/password

**Change password**

**Request**
```bash
PUT /api/account/password
Authorization: Bearer token
Content-Type: application/json

{
  "old_password": "OldPass123!",
  "new_password": "NewSecurePass456!"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Rate Limiting

**Limits per API key**
- Default: 1000 requests/month
- Pro: 10000 requests/month
- Enterprise: Unlimited

**Rate limit headers**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 742
X-RateLimit-Reset: 1656374400
```

**When exceeded (429)**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retry_after": 3600
  }
}
```

---

## 🔒 CORS Policy

**Allowed Origins** (production)
```
- https://ryz.my.id
- https://www.ryz.my.id
- https://app.ryz.my.id
```

**Allowed Methods**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers**
```
Authorization, Content-Type, X-CSRF-Token
```

---

## 📝 Webhook Events

**Available events**
- `link.created` - Link dibuat
- `link.updated` - Link diupdate
- `link.deleted` - Link didelete
- `link.clicked` - Link diklik (optional, high volume)
- `team.member_invited` - Member diinvite
- `team.member_joined` - Member join team

**Example payload**
```json
{
  "event": "link.created",
  "data": {
    "link": {
      "id": "lnk_abc123",
      "short_code": "abc123",
      "original_url": "https://..."
    }
  },
  "timestamp": "2026-06-15T10:30:00Z"
}
```

---

**Documentation Last Updated**: 2026-06-15
**API Version**: v1
