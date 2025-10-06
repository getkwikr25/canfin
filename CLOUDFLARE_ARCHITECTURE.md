# CFRP - Cloudflare Pages Architecture Adaptation

## Overview
This document outlines the adapted architecture for the Canadian Financial Regulatory Platform (CFRP) optimized for **Cloudflare Pages deployment**, while maintaining core functionality and regulatory requirements.

## Architecture Mapping: Original → Cloudflare Native

### Backend Services
- **Original:** Node.js + GraphQL + PostgreSQL
- **Adapted:** Hono framework + REST APIs + Cloudflare D1 (SQLite)

### Data Storage
- **Original:** AWS Aurora PostgreSQL + ElasticSearch
- **Adapted:** Cloudflare D1 + KV Storage + R2 Bucket Storage

### AI/ML Services  
- **Original:** Internal ML pipelines + Custom risk models
- **Adapted:** OpenAI API integration + Third-party risk scoring APIs

### Real-time Features
- **Original:** WebSockets + Event streaming (Kafka)
- **Adapted:** Server-Sent Events + Cloudflare Workers caching

### Search & Analytics
- **Original:** ElasticSearch + OpenSearch Dashboards
- **Adapted:** Cloudflare KV queries + Chart.js visualizations

## Cloudflare-Native Tech Stack

### Frontend Layer
- **Framework:** Vite + TypeScript + Tailwind CSS
- **Deployment:** Cloudflare Pages
- **Libraries:** Chart.js, Axios, Day.js (CDN)
- **UI Components:** Custom components with accessibility (WCAG 2.2)

### Backend Layer
- **Framework:** Hono (lightweight, edge-optimized)
- **Runtime:** Cloudflare Workers
- **APIs:** RESTful endpoints + JSON responses
- **Validation:** Zod schema validation

### Data Layer
- **Primary Database:** Cloudflare D1 (globally distributed SQLite)
- **Caching:** Cloudflare KV Storage
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Session Management:** JWT tokens + KV storage

### Security Layer
- **Authentication:** JWT + secure cookie sessions
- **Authorization:** Role-based access control (RBAC)
- **Encryption:** TLS 1.3 + AES-256 for data at rest
- **DDoS Protection:** Cloudflare WAF + Bot Management

## Core Services Implementation

### 1. Entity Registry Service
**Purpose:** Manage regulated financial institutions

**D1 Database Schema:**
```sql
CREATE TABLE entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bank', 'credit_union', 'insurer', 'investment_firm'
  jurisdiction TEXT NOT NULL, -- 'federal', 'ontario', 'quebec', etc.
  registration_number TEXT UNIQUE,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  risk_score REAL DEFAULT 5.0, -- 1-10 scale
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_jurisdiction ON entities(jurisdiction);
```

**API Endpoints:**
- `POST /api/entities` - Register new entity
- `GET /api/entities/{id}` - Get entity details
- `GET /api/entities` - List entities with filters
- `PUT /api/entities/{id}` - Update entity info

### 2. Regulatory Filing Service
**Purpose:** Handle submission and validation of regulatory reports

**D1 Database Schema:**
```sql
CREATE TABLE filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  filing_type TEXT NOT NULL, -- 'quarterly_return', 'annual_report', 'incident_report'
  status TEXT DEFAULT 'pending', -- 'pending', 'validated', 'flagged', 'approved'
  data TEXT, -- JSON data of the filing
  file_url TEXT, -- R2 storage URL for uploaded files
  validation_errors TEXT, -- JSON array of validation issues
  risk_score REAL, -- AI-calculated risk score
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  reviewer_id INTEGER,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

CREATE INDEX idx_filings_entity ON filings(entity_id);
CREATE INDEX idx_filings_status ON filings(status);
CREATE INDEX idx_filings_type ON filings(filing_type);
```

**API Endpoints:**
- `POST /api/filings/submit` - Submit new filing
- `GET /api/filings/{id}` - Get filing details
- `GET /api/filings` - List filings with filters
- `POST /api/filings/{id}/validate` - Validate filing data
- `PUT /api/filings/{id}/review` - Regulator review

### 3. Risk Assessment Service
**Purpose:** AI-powered risk scoring using OpenAI API integration

**Implementation:** 
- Use OpenAI GPT-4 for analyzing filing content
- Generate risk scores based on financial ratios and patterns
- Store results in D1 database for historical tracking

**API Endpoints:**
- `POST /api/risk/assess/{filingId}` - Generate risk assessment
- `GET /api/risk/scores/{entityId}` - Get entity risk history
- `GET /api/risk/alerts` - Get high-risk entities

### 4. Case Management Service
**Purpose:** Investigation workflow for regulators

**D1 Database Schema:**
```sql
CREATE TABLE cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  filing_id INTEGER,
  case_type TEXT NOT NULL, -- 'compliance_review', 'investigation', 'enforcement'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'closed', 'escalated'
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT, -- regulator email/id
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (filing_id) REFERENCES filings(id)
);
```

### 5. User Management Service
**Purpose:** Authentication and authorization

**D1 Database Schema:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'regulator', 'institution_admin', 'viewer'
  agency TEXT, -- 'osfi', 'fcac', 'fsra', 'amf', etc.
  entity_id INTEGER, -- for institution users
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);
```

## API Architecture

### Base Configuration
- **Base URL:** `https://cfrp.pages.dev/api/v1`
- **Authentication:** Bearer JWT tokens
- **Content-Type:** `application/json`
- **Rate Limiting:** Cloudflare built-in (100 req/min per IP)

### Response Format
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  request_id: string;
}
```

### Error Handling
- HTTP status codes (400, 401, 403, 404, 500)
- Structured error messages
- Request correlation IDs for debugging

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   ├── charts/          # Data visualization
│   └── layouts/         # Page layouts
├── pages/
│   ├── dashboard/       # Role-based dashboards
│   ├── filings/         # Filing management
│   ├── entities/        # Entity management
│   └── cases/           # Case management
├── services/
│   ├── api.ts          # API client
│   ├── auth.ts         # Authentication
│   └── utils.ts        # Utilities
└── types/
    └── index.ts        # TypeScript definitions
```

### State Management
- **Local State:** React hooks (useState, useEffect)
- **Global State:** Context API for user authentication
- **Server State:** Direct API calls with loading states

### Routing
- **Framework:** React Router (client-side routing)
- **Protected Routes:** Role-based route guards
- **Deep Linking:** Support for bookmarkable URLs

## Security Implementation

### Authentication Flow
1. User login with email/password
2. Server validates credentials against D1 database
3. JWT token generated with user role and permissions
4. Token stored in secure, httpOnly cookie
5. Token validated on each API request

### Authorization Model
```typescript
interface UserRole {
  role: 'admin' | 'regulator' | 'institution_admin' | 'viewer';
  permissions: string[];
  agency?: string;
  entity_id?: number;
}

const rolePermissions = {
  admin: ['*'], // All permissions
  regulator: ['read_filings', 'review_filings', 'create_cases', 'read_entities'],
  institution_admin: ['create_filings', 'read_own_filings', 'update_own_entity'],
  viewer: ['read_public_data']
};
```

### Data Protection
- **Encryption:** All sensitive data encrypted in D1
- **Audit Logging:** All API calls logged with user/action/timestamp
- **Input Validation:** Zod schemas for all API inputs
- **Rate Limiting:** Per-user and per-IP limits

## Performance Optimization

### Caching Strategy
- **Static Assets:** Cloudflare CDN (1 year cache)
- **API Responses:** KV storage for frequently accessed data (1 hour cache)
- **Database Queries:** Prepared statements with D1
- **Client-Side:** React memo for expensive components

### Monitoring & Observability
- **Metrics:** Cloudflare Analytics for traffic/performance
- **Logging:** Structured JSON logs to Cloudflare Workers logs
- **Alerting:** Custom alerts for API errors/high latency
- **Health Checks:** `/api/health` endpoint for monitoring

## Development Workflow

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Setup local D1 database
wrangler d1 migrations apply cfrp-db --local

# 3. Seed test data
npm run db:seed

# 4. Start development server
npm run dev
```

### Database Management
```bash
# Create migration
wrangler d1 migrations create cfrp-db "migration_name"

# Apply migrations (local)
wrangler d1 migrations apply cfrp-db --local

# Apply migrations (production)
wrangler d1 migrations apply cfrp-db

# Query database
wrangler d1 execute cfrp-db --local --command="SELECT * FROM entities"
```

### Deployment Process
```bash
# 1. Build application
npm run build

# 2. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name cfrp

# 3. Apply database migrations
wrangler d1 migrations apply cfrp-db

# 4. Verify deployment
curl https://cfrp.pages.dev/api/health
```

## Third-Party Integrations

### OpenAI Integration (Risk Assessment)
```typescript
interface RiskAssessmentRequest {
  filingData: any;
  entityType: string;
  historicalRisk: number;
}

async function assessRisk(request: RiskAssessmentRequest): Promise<number> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a financial risk analyst. Analyze the provided filing data and return a risk score from 1-10."
    }, {
      role: "user", 
      content: JSON.stringify(request)
    }]
  });
  
  return parseFloat(response.choices[0].message.content);
}
```

### Email Notifications (Resend API)
- Filing submission confirmations
- Risk alert notifications
- Case assignment notifications

## Compliance & Regulatory Requirements

### Data Residency
- All Cloudflare services configured for Canadian regions
- D1 databases replicated within Canadian data centers
- R2 storage buckets restricted to Canadian locations

### Audit Trail
- Immutable audit logs stored in D1
- All user actions tracked with timestamps
- Data lineage for regulatory filings

### Privacy Protection (PIPEDA Compliance)
- Personal data minimization
- User consent tracking
- Data retention policies (7 years)
- Right to deletion (where legally permitted)

### Accessibility (WCAG 2.2 AA)
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Bilingual support (English/French)

## Limitations & Tradeoffs

### Accepted Limitations
1. **No Real-time WebSockets:** Using Server-Sent Events for live updates
2. **Simplified ML:** Using OpenAI API instead of custom models
3. **Basic Search:** KV queries instead of ElasticSearch
4. **File Size Limits:** R2 storage limited to reasonable file sizes
5. **Concurrent Users:** Optimized for regulatory workloads (not social media scale)

### Future Enhancements
1. **Advanced Analytics:** Integration with external BI tools
2. **Mobile Apps:** React Native applications
3. **International Integration:** APIs for cross-border regulatory data
4. **Advanced AI:** Custom fine-tuned models for Canadian regulatory context
5. **Blockchain Integration:** Immutable audit trails using distributed ledger

## Success Metrics

### Technical KPIs
- **Response Time:** < 200ms average API response
- **Uptime:** > 99.9% availability
- **Security:** Zero data breaches
- **Performance:** < 3s page load times

### Business KPIs  
- **User Adoption:** 80% of regulated entities onboarded
- **Efficiency Gains:** 40% reduction in filing processing time
- **Accuracy:** 95% automated validation accuracy
- **Cost Savings:** 50% reduction in compliance costs

This architecture provides a solid foundation for building the CFRP MVP while working within Cloudflare Pages constraints, maintaining security and regulatory compliance requirements.