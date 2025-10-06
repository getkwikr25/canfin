-- Canadian Financial Regulatory Platform (CFRP) Database Schema
-- This migration creates the initial database structure for the regulatory platform

-- Entities table - Financial institutions under regulation
CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'credit_union', 'insurer', 'investment_firm', 'trust_company')),
  jurisdiction TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'under_review')),
  risk_score REAL DEFAULT 5.0 CHECK (risk_score >= 1 AND risk_score <= 10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table - System users (regulators, institution admins, etc.)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'regulator', 'institution_admin', 'viewer')),
  agency TEXT, -- OSFI, FCAC, FSRA, AMF, etc.
  entity_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

-- Filings table - Regulatory submissions from entities
CREATE TABLE IF NOT EXISTS filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  filing_type TEXT NOT NULL CHECK (filing_type IN (
    'quarterly_return', 'annual_report', 'incident_report', 
    'capital_adequacy', 'liquidity_coverage', 'consumer_complaint', 'cyber_incident'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'flagged', 'approved', 'rejected')),
  data TEXT, -- JSON data of the filing
  file_url TEXT, -- R2 storage URL for uploaded files
  validation_errors TEXT, -- JSON array of validation issues
  risk_score REAL CHECK (risk_score >= 1 AND risk_score <= 10),
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  reviewer_id INTEGER,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Cases table - Investigation and compliance cases
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  filing_id INTEGER,
  case_type TEXT NOT NULL CHECK (case_type IN ('compliance_review', 'investigation', 'enforcement', 'audit', 'inquiry')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_review', 'closed', 'escalated')),
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

-- Audit logs table - Track all user actions for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT, -- JSON metadata
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_jurisdiction ON entities(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_risk_score ON entities(risk_score);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_agency ON users(agency);
CREATE INDEX IF NOT EXISTS idx_users_entity_id ON users(entity_id);

CREATE INDEX IF NOT EXISTS idx_filings_entity_id ON filings(entity_id);
CREATE INDEX IF NOT EXISTS idx_filings_type ON filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_filings_status ON filings(status);
CREATE INDEX IF NOT EXISTS idx_filings_submitted_at ON filings(submitted_at);
CREATE INDEX IF NOT EXISTS idx_filings_risk_score ON filings(risk_score);

CREATE INDEX IF NOT EXISTS idx_cases_entity_id ON cases(entity_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Views for common queries
CREATE VIEW IF NOT EXISTS entity_summary AS
SELECT 
  e.id,
  e.name,
  e.type,
  e.jurisdiction,
  e.registration_number,
  e.status,
  e.risk_score,
  COUNT(f.id) as total_filings,
  COUNT(CASE WHEN f.status = 'pending' THEN 1 END) as pending_filings,
  COUNT(CASE WHEN f.status = 'flagged' THEN 1 END) as flagged_filings,
  COUNT(c.id) as total_cases,
  COUNT(CASE WHEN c.status IN ('open', 'in_progress') THEN 1 END) as open_cases,
  MAX(f.submitted_at) as last_filing_date,
  e.created_at,
  e.updated_at
FROM entities e
LEFT JOIN filings f ON e.id = f.entity_id
LEFT JOIN cases c ON e.id = c.entity_id
GROUP BY e.id;

CREATE VIEW IF NOT EXISTS filing_summary AS
SELECT 
  f.id,
  f.entity_id,
  e.name as entity_name,
  e.type as entity_type,
  f.filing_type,
  f.status,
  f.risk_score,
  f.submitted_at,
  f.reviewed_at,
  u.name as reviewer_name,
  COUNT(c.id) as related_cases
FROM filings f
JOIN entities e ON f.entity_id = e.id
LEFT JOIN users u ON f.reviewer_id = u.id
LEFT JOIN cases c ON f.id = c.filing_id
GROUP BY f.id;

-- Triggers to automatically update timestamps
CREATE TRIGGER IF NOT EXISTS update_entities_timestamp 
AFTER UPDATE ON entities
BEGIN
  UPDATE entities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_cases_timestamp 
AFTER UPDATE ON cases
BEGIN
  UPDATE cases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;