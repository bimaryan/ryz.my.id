# 📚 RYZ Shortlink - Feature Documentation

Dokumentasi lengkap semua fitur, user stories, dan technical requirements untuk RYZ Shortlink.

---

## 📋 Table of Contents

1. [Core Features](#core-features)
2. [User Features](#user-features)
3. [Analytics Features](#analytics-features)
4. [Team Features](#team-features)
5. [API Features](#api-features)
6. [Admin Features](#admin-features)

---

## 🎯 Core Features

### 1. Create Short Link

**User Story**
```
As a user, I want to create a short link from a long URL
So that I can share it easily on social media and track clicks
```

**Requirements**
- ✅ Input validation (URL must be valid HTTP/HTTPS)
- ✅ Auto-generate short code (6-12 characters)
- ✅ Optional custom slug (must be unique)
- ✅ Custom title & description
- ✅ Tags & category support
- ✅ QR code auto-generation
- ✅ Password protection (optional)
- ✅ Link expiration date (optional)
- ✅ UTM parameters (utm_source, utm_medium, utm_campaign)
- ✅ Preview image & OG tags

**API Endpoint**
```
POST /api/links
Body: {
  original_url: string (required)
  short_code?: string (auto-generated if not provided)
  custom_slug?: string (unique, optional)
  title?: string
  description?: string
  tags?: string[]
  category?: string
  password?: string (will be hashed)
  expires_at?: ISO8601 datetime
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  is_public?: boolean
}
Response: {
  id: string
  short_code: string
  custom_slug?: string
  original_url: string
  qr_code_url: string
  created_at: datetime
}
```

**UI Components**
- Form input dengan validation feedback
- URL preview dengan OG tags
- QR code preview
- Character counter untuk title/description
- Tag input dengan autocomplete
- Date picker untuk expiration
- Password strength indicator

**State Management**
```javascript
// Zustand store
linkStore: {
  isCreating: boolean,
  error: string | null,
  newLink: {
    original_url: string,
    short_code: string,
    custom_slug: string,
    ...
  },
  createLink: (data) => Promise,
}
```

---

### 2. View/Edit Link Details

**User Story**
```
As a user, I want to view and edit my created links
So that I can update information and manage them
```

**Requirements**
- ✅ Display all link metadata
- ✅ Edit title, description, tags, category
- ✅ Change password protection
- ✅ Update expiration date
- ✅ Change UTM parameters
- ✅ Toggle link active/inactive
- ✅ View link statistics
- ✅ Copy short link to clipboard
- ✅ Download QR code (PNG, SVG, PDF)

**API Endpoints**
```
GET /api/links/:id
Response: { full link object }

PUT /api/links/:id
Body: {
  title?: string,
  description?: string,
  tags?: string[],
  category?: string,
  password?: string,
  expires_at?: datetime,
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string,
  is_active?: boolean,
  is_public?: boolean,
}
Response: { updated link object }

GET /api/links/:id/qr-code?format=png|svg|pdf
Response: binary image data or SVG
```

**UI Components**
- Link details card dengan edit mode
- Copy-to-clipboard button dengan feedback
- QR code display dengan download options
- Confirmation modal untuk permanent actions
- Link statistics summary
- Activity timeline

---

### 3. Delete Link

**User Story**
```
As a user, I want to delete links I no longer need
So that my dashboard stays clean and organized
```

**Requirements**
- ✅ Soft delete (keep analytics data)
- ✅ Confirmation dialog before deletion
- ✅ Display affected analytics count
- ✅ Bulk delete support
- ✅ Undo/restore for recent deletions

**API Endpoint**
```
DELETE /api/links/:id
Query: {
  confirm: boolean (required for safety)
}
Response: {
  success: boolean,
  message: string,
  analytics_archived: number
}
```

**UI Components**
- Delete confirmation modal
- Show warning tentang data yang akan hilang
- Success/undo notification

---

### 4. Redirect to Original URL

**User Story**
```
As an end user, I want to click short link dan automatically redirected
So that I can access the target website
```

**Requirements**
- ✅ Fast redirect (<100ms)
- ✅ Track click in analytics
- ✅ Handle password-protected links
- ✅ Check if link expired
- ✅ Handle custom domains
- ✅ Preserve query parameters
- ✅ Support for conditional redirects

**API Endpoint**
```
GET /:short_code
Query: {
  password?: string (if link protected)
}
Response: 301/302 redirect
Headers: Set tracking cookie untuk session
```

**Technical Details**
- Use `tracking_session_id` cookie untuk unique visitor detection
- Capture user agent, IP, referrer
- Call analytics tracking endpoint immediately
- Redirect menggunakan HTTP 301 (permanent) atau 302 (temporary)

---

## 👤 User Features

### 1. User Authentication

**Sign Up**
- Email + Password registration
- Email verification (6-digit code atau link)
- OAuth integration (Google)
- Password strength validation
- Terms of service acceptance

**Login**
- Email + Password
- Google OAuth
- Remember me (30 days)
- Session management
- 2FA support (optional)

**Password Reset**
- Forgot password flow
- Email verification
- Secure token (expires in 1 hour)
- Password strength validation

**API Endpoints**
```
POST /api/auth/signup
Body: {
  email: string,
  password: string,
  full_name: string
}

POST /api/auth/login
Body: {
  email: string,
  password: string,
  remember_me?: boolean
}

POST /api/auth/google/callback
Body: {
  code: string (from Google OAuth)
}

POST /api/auth/verify-email
Body: {
  token: string,
  code: string (if using 6-digit code)
}

POST /api/auth/forgot-password
Body: {
  email: string
}

POST /api/auth/reset-password
Body: {
  token: string,
  new_password: string
}
```

---

### 2. User Profile

**Requirements**
- ✅ View profile information
- ✅ Edit name, email, avatar
- ✅ Change password
- ✅ Two-factor authentication setup
- ✅ Login history
- ✅ Connected devices
- ✅ Email preferences
- ✅ Privacy settings

**API Endpoints**
```
GET /api/account/profile
Response: { user object }

PUT /api/account/profile
Body: {
  full_name?: string,
  avatar_url?: string,
  email?: string
}

POST /api/account/avatar
Body: FormData with image file
Response: { avatar_url: string }

PUT /api/account/password
Body: {
  old_password: string,
  new_password: string
}

GET /api/account/login-history
Response: [
  {
    ip_address: string,
    user_agent: string,
    timestamp: datetime,
    device_name: string,
    is_current: boolean
  }
]

POST /api/account/logout-device/:device_id
```

---

### 3. Subscription & Billing

**Plans**
- Free: 50 links, basic analytics, 30 days retention
- Pro: 500 links, advanced analytics, 90 days retention, team support
- Enterprise: Unlimited, 365 days retention, dedicated support

**Requirements**
- ✅ View current plan & usage
- ✅ Upgrade/downgrade plan
- ✅ Payment method management
- ✅ Billing history & invoices
- ✅ Usage statistics vs limits
- ✅ Auto-renewal settings
- ✅ Cancel subscription

**API Endpoints**
```
GET /api/subscription/current
Response: {
  plan_type: string,
  billing_cycle: string,
  renewal_date: datetime,
  usage: {
    links: number,
    team_members: number,
    api_requests: number
  },
  limits: {
    max_links: number,
    max_team_members: number,
    max_api_requests: number
  }
}

POST /api/subscription/upgrade
Body: {
  plan_type: string
}

POST /api/subscription/downgrade
Body: {
  plan_type: string,
  confirm: boolean
}

GET /api/subscription/invoices
Response: [invoice objects]

DELETE /api/subscription
Body: {
  reason: string
}
```

---

## 📊 Analytics Features

### 1. Real-time Click Tracking

**User Story**
```
As a user, I want to see real-time clicks on my links
So that I can monitor traffic instantly
```

**Requirements**
- ✅ Track setiap click dengan metadata:
  - Geographic location (country, city)
  - Device type (mobile/tablet/desktop)
  - Browser & OS
  - Referrer
  - User agent
  - Session ID
- ✅ Real-time updates (WebSocket atau polling)
- ✅ Session-based unique visitor detection
- ✅ UTM parameter tracking
- ✅ Anonymous tracking (no PII)

**API Endpoint**
```
POST /api/analytics/track
Body: {
  link_id: string,
  referrer: string,
  user_agent: string,
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string,
  utm_content?: string,
  utm_term?: string
}
Response: {
  session_id: string
}

GET /api/links/:id/analytics/realtime
WebSocket untuk real-time updates
Response: { new click data }
```

---

### 2. Analytics Dashboard

**Widgets**
1. **Top Stats**
   - Total clicks
   - Unique visitors
   - Average CTR
   - Traffic trend

2. **Click Trend Chart**
   - Daily/weekly/monthly aggregation
   - Line chart dengan date range filter
   - Comparison dengan previous period

3. **Geographic Analytics**
   - Top countries list
   - World map visualization
   - City breakdown

4. **Device Analytics**
   - Desktop vs Mobile vs Tablet
   - Pie chart distribution
   - Browser breakdown (top 5)
   - OS breakdown (top 5)

5. **Referrer Analytics**
   - Top referrers list
   - Direct traffic
   - Campaign tracking

6. **UTM Analytics**
   - UTM source breakdown
   - UTM medium breakdown
   - UTM campaign tracking

**Requirements**
- ✅ Date range picker (custom, last 7 days, last 30 days, all time)
- ✅ Export to CSV
- ✅ Real-time updates
- ✅ Comparison tools (vs previous period)
- ✅ Link comparison
- ✅ Drill-down capabilities

**API Endpoints**
```
GET /api/links/:id/analytics
Query: {
  start_date?: ISO8601,
  end_date?: ISO8601,
  group_by?: day|week|month
}
Response: {
  total_clicks: number,
  unique_visitors: number,
  clicks_by_date: [{date, count}],
  top_countries: [{country, count}],
  device_breakdown: {mobile, tablet, desktop},
  top_browsers: [{name, count}],
  top_referrers: [{referrer, count}],
  utm_analytics: {...}
}

GET /api/analytics/export
Query: {
  link_id: string,
  format: csv|json,
  start_date?: datetime,
  end_date?: datetime
}
Response: CSV file or JSON
```

---

## 👥 Team Features

### 1. Create Team

**User Story**
```
As a user, I want to create a team
So that I can collaborate dengan colleagues
```

**Requirements**
- ✅ Team name & slug (unique, URL-friendly)
- ✅ Team avatar/logo
- ✅ Team description
- ✅ Default member count = 1 (creator)
- ✅ Inherit plan from creator atau separate

**API Endpoint**
```
POST /api/teams
Body: {
  name: string (required),
  slug: string (required, unique),
  description?: string,
  avatar_url?: string
}
Response: { team object with owner_id }
```

---

### 2. Invite Team Members

**User Story**
```
As a team owner, I want to invite team members
So that we can collaborate on links
```

**Requirements**
- ✅ Send invitation email
- ✅ Set role before inviting (owner/admin/member)
- ✅ Track invitation status (pending/accepted/declined)
- ✅ Invitation expiry (7 days)
- ✅ Resend invitation
- ✅ Bulk invite support

**API Endpoints**
```
POST /api/teams/:team_id/invite
Body: {
  email: string,
  role: owner|admin|member,
  permissions?: {view, edit, delete, manage_team}
}
Response: { invitation_token: string }

GET /api/teams/:team_id/invitations
Response: [{ email, role, status, sent_at, expires_at }]

POST /api/teams/:team_id/invitations/:token/accept
Response: { success: boolean }

POST /api/teams/:team_id/invitations/:token/decline
Response: { success: boolean }
```

---

### 3. Manage Team Members

**Requirements**
- ✅ View member list dengan roles
- ✅ Change member role
- ✅ Update permissions (granular)
- ✅ Remove member
- ✅ Member activity log
- ✅ Leave team (non-owner)

**API Endpoints**
```
GET /api/teams/:team_id/members
Response: [{ user_id, email, role, permissions, joined_at }]

PUT /api/teams/:team_id/members/:user_id
Body: {
  role?: string,
  permissions?: {...}
}

DELETE /api/teams/:team_id/members/:user_id
Response: { success: boolean }

GET /api/teams/:team_id/activity
Response: [{ action, user, timestamp, details }]
```

---

### 4. Team Links

**Requirements**
- ✅ Assign links ke team
- ✅ Shared team analytics
- ✅ Team link ownership tracking
- ✅ Shared link management
- ✅ Team-wide link stats

**API Endpoints**
```
POST /api/teams/:team_id/links/:link_id
Body: {
  assigned_to?: user_id
}
Response: { team_link object }

GET /api/teams/:team_id/links
Response: [links assigned to team]

GET /api/teams/:team_id/analytics
Response: { aggregated analytics for all team links }
```

---

## 🔌 API Features

### 1. API Key Management

**User Story**
```
As a developer, I want to create API keys
So that I can access RYZ Shortlink programmatically
```

**Requirements**
- ✅ Generate API key (display once only)
- ✅ Set key name & description
- ✅ Granular permissions (read/write)
- ✅ Rate limiting per key
- ✅ Expiration date
- ✅ Last used tracking
- ✅ Rotate key
- ✅ Revoke key

**API Endpoints**
```
POST /api/api-keys
Body: {
  name: string,
  permissions: [read:links, create:links, delete:links],
  rate_limit?: number,
  expires_at?: datetime
}
Response: {
  id: string,
  key: string (only shown once!),
  name: string,
  created_at: datetime
}

GET /api/api-keys
Response: [{ id, name, permissions, created_at, last_used_at }]

DELETE /api/api-keys/:key_id
Response: { success: boolean }

PUT /api/api-keys/:key_id
Body: {
  rate_limit?: number,
  expires_at?: datetime
}
```

---

### 2. API Usage & Limits

**Requirements**
- ✅ Track API requests per key
- ✅ Rate limiting (default: 1000/month)
- ✅ Usage analytics
- ✅ Alert when approaching limit

**API Endpoint**
```
GET /api/api-keys/:key_id/usage
Query: {
  period?: day|week|month
}
Response: {
  total_requests: number,
  requests_by_endpoint: {...},
  limit: number,
  remaining: number,
  resets_at: datetime
}
```

---

### 3. REST API Endpoints (untuk API key holders)

**Links API**
```
POST /api/v1/links
- Create short link
- Auth: API Key dalam header

GET /api/v1/links
- List links dengan pagination
- Query: page, limit, tags, category

GET /api/v1/links/:id
- Get link details

PUT /api/v1/links/:id
- Update link

DELETE /api/v1/links/:id
- Delete link

GET /api/v1/links/:id/analytics
- Get link analytics
- Query: start_date, end_date
```

**Example Request**
```bash
curl -X POST https://ryz.my.id/api/v1/links \
  -H "Authorization: Bearer sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "original_url": "https://example.com/long-path",
    "title": "My Link",
    "tags": ["promo", "social"]
  }'
```

---

## 🛡️ Admin Features

### 1. Admin Dashboard

**Access**: Admin users only

**Widgets**
- System statistics (total users, links, clicks)
- User growth chart
- Activity heatmap
- Recent activity log
- System health metrics

**API Endpoints**
```
GET /api/admin/stats
Response: {
  total_users: number,
  total_links: number,
  total_clicks: number,
  active_users_today: number,
  new_users_today: number,
  storage_used: number
}

GET /api/admin/users
Query: {
  page: number,
  limit: number,
  search?: string,
  sort?: created_at|usage
}
Response: [user objects dengan usage]

GET /api/admin/activity-log
Query: {
  action?: string,
  user_id?: string,
  start_date?: datetime,
  end_date?: datetime
}
Response: [activity objects]
```

---

### 2. User Moderation

**Requirements**
- ✅ View user details & usage
- ✅ Flag suspicious links
- ✅ Remove links violating ToS
- ✅ Suspend user account
- ✅ View user activity history

**API Endpoints**
```
GET /api/admin/users/:user_id
Response: { user object dengan full details }

POST /api/admin/links/:link_id/moderate
Body: {
  action: flag|remove|suspend_user,
  reason: string
}
Response: { success: boolean }

PUT /api/admin/users/:user_id
Body: {
  status: active|suspended|banned
}
Response: { success: boolean }
```

---

## 🔐 Security Features

### 1. Link Protection

**Password-Protected Links**
- SHA-256 hash (stored)
- Verification on access
- Rate limiting untuk failed attempts
- 3 strikes lockout

**Link Expiration**
- Optional expiration date/time
- Automatic removal setelah expiry
- Notification sebelum expire
- Can set to expire at specific time

---

### 2. Account Security

**2FA (Two-Factor Authentication)**
- TOTP (Time-based One-Time Password)
- SMS (optional)
- Backup codes
- Device trust

**Session Management**
- Device tracking
- Session termination
- Auto-logout after inactivity
- Login notifications

---

## 📈 Advanced Features (Nice to Have)

### 1. Link Campaigns

**Group links untuk campaign**
- Create campaign
- Assign links to campaign
- Track campaign performance
- Compare links dalam campaign

---

### 2. A/B Testing

**Split testing untuk links**
- Create A/B test
- Route traffic (50/50 or custom)
- Track performance difference
- Statistical significance calculation

---

### 3. Smart Recommendations

**Berdasarkan analytics**
- "Most clicked links this week"
- "Links expiring soon"
- "Underperforming links"
- "Similar to top performers"

---

### 4. Integrations

**Third-party integrations**
- Slack notifications
- Discord webhooks
- Google Analytics integration
- Zapier support

---

## 🎯 Feature Priority Matrix

### Phase 1 (MVP - Week 1-2)
- [ ] User authentication (email + password)
- [ ] Create short links
- [ ] View/edit links
- [ ] Basic analytics (clicks, top links)
- [ ] Delete links

### Phase 2 (Core Features - Week 3-4)
- [ ] OAuth (Google)
- [ ] QR code generation & download
- [ ] Advanced analytics dashboard
- [ ] Link expiration & password protection
- [ ] Export analytics

### Phase 3 (Team & Advanced - Week 5-6)
- [ ] Team creation & management
- [ ] Member invitations & roles
- [ ] API key management
- [ ] REST API endpoints
- [ ] Webhooks

### Phase 4 (Polish - Week 7-8)
- [ ] 2FA support
- [ ] Admin dashboard
- [ ] A/B testing
- [ ] Custom domains
- [ ] Advanced integrations

---

## 📊 Data Model Summary

### Link Model
```javascript
{
  id: UUID,
  user_id: UUID,
  original_url: string,
  short_code: string (unique),
  custom_slug: string (unique, nullable),
  title: string,
  description: string,
  tags: string[],
  category: string,
  is_active: boolean,
  password_hash: string (nullable),
  expires_at: datetime (nullable),
  created_at: datetime,
  updated_at: datetime,
  clicks_count: integer,
  qr_code_url: string,
  is_public: boolean,
  utm_source: string,
  utm_medium: string,
  utm_campaign: string,
  og_title: string,
  og_description: string,
  og_image: string,
}
```

### Analytics Model
```javascript
{
  id: UUID,
  link_id: UUID,
  referrer: string,
  user_agent: string,
  ip_address: string,
  country: string,
  city: string,
  device_type: string (mobile|tablet|desktop),
  browser: string,
  os: string,
  utm_source: string,
  utm_medium: string,
  utm_campaign: string,
  session_id: UUID,
  timestamp: datetime,
}
```

---

## ✅ Checklist untuk Development

Setiap feature harus memiliki:
- [ ] User story written
- [ ] API endpoint documented
- [ ] Database schema designed
- [ ] Frontend component sketched
- [ ] Error handling planned
- [ ] Validation rules defined
- [ ] Security considerations noted
- [ ] Testing strategy outlined

---

**Next: Mulai dari Phase 1 features!** 🚀
