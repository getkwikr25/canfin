-- Specialized Modules Database Migration for CFRP
-- Insurance, Pensions, and Payments regulation modules
-- Migration 0004: Create tables for specialized regulatory modules

-- ====================================
-- INSURANCE REGULATION TABLES
-- ====================================

-- Insurance filings table
CREATE TABLE IF NOT EXISTS insurance_filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_type TEXT NOT NULL,
  company_name TEXT NOT NULL,
  license_number TEXT,
  filing_data TEXT NOT NULL, -- JSON data
  language TEXT DEFAULT 'english',
  status TEXT DEFAULT 'submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insurance risk assessments
CREATE TABLE IF NOT EXISTS insurance_risk_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  risk_data TEXT NOT NULL, -- JSON data
  analysis_result TEXT NOT NULL, -- JSON analysis
  risk_score INTEGER,
  assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insurance compliance records
CREATE TABLE IF NOT EXISTS insurance_compliance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_id INTEGER,
  compliance_score INTEGER,
  issues TEXT, -- JSON array of issues
  recommendations TEXT, -- JSON array of recommendations
  regulatory_flags TEXT, -- JSON array of flags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filing_id) REFERENCES insurance_filings(id)
);

-- ====================================
-- PENSION REGULATION TABLES
-- ====================================

-- Pension filings table
CREATE TABLE IF NOT EXISTS pension_filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_type TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_number TEXT,
  administrator_name TEXT NOT NULL,
  filing_data TEXT NOT NULL, -- JSON data
  language TEXT DEFAULT 'english',
  status TEXT DEFAULT 'submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pension funding assessments
CREATE TABLE IF NOT EXISTS pension_funding_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL,
  funding_data TEXT NOT NULL, -- JSON data
  analysis_result TEXT NOT NULL, -- JSON analysis
  funded_ratio REAL,
  solvency_ratio REAL,
  assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pension performance records
CREATE TABLE IF NOT EXISTS pension_performance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL,
  performance_data TEXT NOT NULL, -- JSON data
  analysis_result TEXT NOT NULL, -- JSON analysis
  return_rate REAL,
  benchmark_comparison REAL,
  performance_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pension compliance records
CREATE TABLE IF NOT EXISTS pension_compliance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_id INTEGER,
  plan_type TEXT,
  compliance_score INTEGER,
  issues TEXT, -- JSON array of issues
  recommendations TEXT, -- JSON array of recommendations
  regulatory_flags TEXT, -- JSON array of flags
  funding_alerts TEXT, -- JSON array of funding alerts
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filing_id) REFERENCES pension_filings(id)
);

-- ====================================
-- PAYMENT SERVICES TABLES
-- ====================================

-- Payment service filings table
CREATE TABLE IF NOT EXISTS payment_filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_type TEXT NOT NULL,
  service_provider_name TEXT NOT NULL,
  license_number TEXT,
  service_types TEXT NOT NULL, -- JSON array of service types
  filing_data TEXT NOT NULL, -- JSON data
  language TEXT DEFAULT 'english',
  status TEXT DEFAULT 'submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment transaction monitoring
CREATE TABLE IF NOT EXISTS payment_transaction_monitoring (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id TEXT NOT NULL,
  transaction_data TEXT NOT NULL, -- JSON data
  analysis_result TEXT NOT NULL, -- JSON analysis
  risk_score INTEGER,
  suspicious_flags TEXT, -- JSON array of flags
  monitoring_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment AML records
CREATE TABLE IF NOT EXISTS payment_aml_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_data TEXT NOT NULL, -- JSON data
  transaction_history TEXT NOT NULL, -- JSON data
  aml_result TEXT NOT NULL, -- JSON analysis
  risk_level TEXT DEFAULT 'low',
  requires_reporting BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment compliance records
CREATE TABLE IF NOT EXISTS payment_compliance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_id INTEGER,
  service_types TEXT, -- JSON array of service types
  compliance_score INTEGER,
  issues TEXT, -- JSON array of issues
  recommendations TEXT, -- JSON array of recommendations
  regulatory_flags TEXT, -- JSON array of flags
  aml_alerts TEXT, -- JSON array of AML alerts
  operational_alerts TEXT, -- JSON array of operational alerts
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filing_id) REFERENCES payment_filings(id)
);

-- ====================================
-- PROVINCIAL REGULATOR INTEGRATION TABLES
-- ====================================

-- Provincial regulator submissions (extends existing regulator_submissions)
CREATE TABLE IF NOT EXISTS provincial_regulator_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_id INTEGER NOT NULL,
  regulator_type TEXT NOT NULL, -- 'provincial', 'federal'
  regulator_code TEXT NOT NULL, -- 'fsra', 'amf', 'bcfsa', etc.
  jurisdiction TEXT NOT NULL, -- 'ontario', 'quebec', 'british_columbia'
  language_requirement TEXT, -- 'english', 'french', 'bilingual'
  submission_data TEXT NOT NULL, -- JSON data
  status TEXT DEFAULT 'pending',
  submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_date DATETIME,
  response_data TEXT, -- JSON response from regulator
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cross-jurisdictional coordination
CREATE TABLE IF NOT EXISTS cross_jurisdictional_coordination (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  primary_filing_id INTEGER NOT NULL,
  coordinating_regulators TEXT NOT NULL, -- JSON array of regulator codes
  coordination_type TEXT NOT NULL, -- 'parallel', 'lead_regulator', 'joint_review'
  lead_regulator TEXT, -- Primary regulator code
  coordination_status TEXT DEFAULT 'initiated',
  coordination_data TEXT, -- JSON coordination details
  initiated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- SECURITIES REGULATION TABLES
-- ====================================

-- Securities filings table (extends existing for investment industry)
CREATE TABLE IF NOT EXISTS securities_filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_type TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'public_company', 'investment_fund', 'dealer', 'adviser'
  sedar_number TEXT,
  crd_number TEXT,
  filing_data TEXT NOT NULL, -- JSON data
  language TEXT DEFAULT 'english',
  status TEXT DEFAULT 'submitted',
  filing_system TEXT DEFAULT 'sedar_plus', -- 'sedar_plus', 'nrd', 'sedi'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Market surveillance records
CREATE TABLE IF NOT EXISTS market_surveillance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  surveillance_type TEXT NOT NULL, -- 'insider_trading', 'market_manipulation', 'disclosure'
  surveillance_data TEXT NOT NULL, -- JSON data
  analysis_result TEXT NOT NULL, -- JSON analysis
  risk_score INTEGER,
  alerts_generated TEXT, -- JSON array of alerts
  surveillance_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Investment fund compliance
CREATE TABLE IF NOT EXISTS investment_fund_compliance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fund_id TEXT NOT NULL,
  compliance_type TEXT NOT NULL, -- 'prospectus', 'continuous_disclosure', 'sales_practices'
  compliance_data TEXT NOT NULL, -- JSON data
  compliance_score INTEGER,
  violations TEXT, -- JSON array of violations
  corrective_actions TEXT, -- JSON array of actions
  compliance_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Insurance indexes
CREATE INDEX IF NOT EXISTS idx_insurance_filings_company ON insurance_filings(company_name);
CREATE INDEX IF NOT EXISTS idx_insurance_filings_type ON insurance_filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_insurance_filings_status ON insurance_filings(status);
CREATE INDEX IF NOT EXISTS idx_insurance_filings_date ON insurance_filings(created_at);

-- Pension indexes
CREATE INDEX IF NOT EXISTS idx_pension_filings_plan ON pension_filings(plan_name);
CREATE INDEX IF NOT EXISTS idx_pension_filings_type ON pension_filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_pension_filings_status ON pension_filings(status);
CREATE INDEX IF NOT EXISTS idx_pension_filings_date ON pension_filings(created_at);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_filings_provider ON payment_filings(service_provider_name);
CREATE INDEX IF NOT EXISTS idx_payment_filings_type ON payment_filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_payment_filings_status ON payment_filings(status);
CREATE INDEX IF NOT EXISTS idx_payment_filings_date ON payment_filings(created_at);

-- Provincial regulator indexes
CREATE INDEX IF NOT EXISTS idx_provincial_submissions_regulator ON provincial_regulator_submissions(regulator_code);
CREATE INDEX IF NOT EXISTS idx_provincial_submissions_jurisdiction ON provincial_regulator_submissions(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_provincial_submissions_status ON provincial_regulator_submissions(status);
CREATE INDEX IF NOT EXISTS idx_provincial_submissions_date ON provincial_regulator_submissions(submission_date);

-- Cross-jurisdictional indexes
CREATE INDEX IF NOT EXISTS idx_coordination_filing ON cross_jurisdictional_coordination(primary_filing_id);
CREATE INDEX IF NOT EXISTS idx_coordination_type ON cross_jurisdictional_coordination(coordination_type);
CREATE INDEX IF NOT EXISTS idx_coordination_status ON cross_jurisdictional_coordination(coordination_status);

-- Securities indexes
CREATE INDEX IF NOT EXISTS idx_securities_filings_entity ON securities_filings(entity_name);
CREATE INDEX IF NOT EXISTS idx_securities_filings_type ON securities_filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_securities_filings_system ON securities_filings(filing_system);
CREATE INDEX IF NOT EXISTS idx_securities_filings_date ON securities_filings(created_at);

-- Market surveillance indexes
CREATE INDEX IF NOT EXISTS idx_surveillance_entity ON market_surveillance_records(entity_id);
CREATE INDEX IF NOT EXISTS idx_surveillance_type ON market_surveillance_records(surveillance_type);
CREATE INDEX IF NOT EXISTS idx_surveillance_date ON market_surveillance_records(surveillance_date);

-- ====================================
-- AUDIT AND COMPLIANCE TRIGGERS
-- ====================================

-- Update timestamp triggers for insurance filings
CREATE TRIGGER IF NOT EXISTS update_insurance_filings_timestamp 
  AFTER UPDATE ON insurance_filings
  FOR EACH ROW
  BEGIN
    UPDATE insurance_filings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Update timestamp triggers for pension filings
CREATE TRIGGER IF NOT EXISTS update_pension_filings_timestamp 
  AFTER UPDATE ON pension_filings
  FOR EACH ROW
  BEGIN
    UPDATE pension_filings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Update timestamp triggers for payment filings
CREATE TRIGGER IF NOT EXISTS update_payment_filings_timestamp 
  AFTER UPDATE ON payment_filings
  FOR EACH ROW
  BEGIN
    UPDATE payment_filings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Update timestamp triggers for provincial submissions
CREATE TRIGGER IF NOT EXISTS update_provincial_submissions_timestamp 
  AFTER UPDATE ON provincial_regulator_submissions
  FOR EACH ROW
  BEGIN
    UPDATE provincial_regulator_submissions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Update timestamp triggers for securities filings
CREATE TRIGGER IF NOT EXISTS update_securities_filings_timestamp 
  AFTER UPDATE ON securities_filings
  FOR EACH ROW
  BEGIN
    UPDATE securities_filings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- ====================================
-- SAMPLE DATA FOR TESTING
-- ====================================

-- Sample insurance regulator data
INSERT OR IGNORE INTO regulators (code, name, name_fr, jurisdiction, type, contact_info, status) VALUES
('osfi_insurance', 'OSFI - Insurance Division', 'BSIF - Division des assurances', 'federal', 'insurance', '{"phone": "1-800-385-8647", "email": "insurance@osfi-bsif.gc.ca"}', 'active'),
('fsra_insurance', 'FSRA - Insurance Division', 'ARSO - Division des assurances', 'ontario', 'insurance', '{"phone": "416-250-7250", "email": "insurance@fsrao.ca"}', 'active'),
('amf_insurance', 'AMF - Assurance', 'AMF - Assurance', 'quebec', 'insurance', '{"phone": "514-395-0337", "email": "assurance@lautorite.qc.ca"}', 'active');

-- Sample pension regulator data
INSERT OR IGNORE INTO regulators (code, name, name_fr, jurisdiction, type, contact_info, status) VALUES
('osfi_pensions', 'OSFI - Pensions Division', 'BSIF - Division des pensions', 'federal', 'pensions', '{"phone": "1-800-385-8647", "email": "pensions@osfi-bsif.gc.ca"}', 'active'),
('fsra_pensions', 'FSRA - Pensions Division', 'ARSO - Division des pensions', 'ontario', 'pensions', '{"phone": "416-250-7250", "email": "pensions@fsrao.ca"}', 'active'),
('retraite_quebec', 'Retraite Québec', 'Retraite Québec', 'quebec', 'pensions', '{"phone": "1-800-463-5185", "email": "info@retraitequebec.gouv.qc.ca"}', 'active');

-- Sample payment regulator data
INSERT OR IGNORE INTO regulators (code, name, name_fr, jurisdiction, type, contact_info, status) VALUES
('bank_of_canada', 'Bank of Canada', 'Banque du Canada', 'federal', 'payments', '{"phone": "1-800-303-1282", "email": "info@bankofcanada.ca"}', 'active'),
('payments_canada', 'Payments Canada', 'Paiements Canada', 'federal', 'payments', '{"phone": "416-348-5500", "email": "info@payments.ca"}', 'active'),
('fcac_payments', 'FCAC - Payment Services', 'ACFC - Services de paiement', 'federal', 'payments', '{"phone": "1-866-461-3222", "email": "info@fcac-acfc.gc.ca"}', 'active');

-- Sample provincial regulator data
INSERT OR IGNORE INTO regulators (code, name, name_fr, jurisdiction, type, contact_info, status) VALUES
('fsra_ontario', 'Financial Services Regulatory Authority of Ontario', 'Autorité de réglementation des services financiers de l\'Ontario', 'ontario', 'provincial', '{"phone": "416-250-7250", "email": "contact@fsrao.ca"}', 'active'),
('amf_quebec', 'Autorité des marchés financiers', 'Autorité des marchés financiers', 'quebec', 'provincial', '{"phone": "514-395-0337", "email": "info@lautorite.qc.ca"}', 'active'),
('bcfsa', 'BC Financial Services Authority', 'Autorité des services financiers de la C.-B.', 'british_columbia', 'provincial', '{"phone": "604-660-3555", "email": "info@bcfsa.ca"}', 'active');

-- Sample securities regulator data
INSERT OR IGNORE INTO regulators (code, name, name_fr, jurisdiction, type, contact_info, status) VALUES
('osc', 'Ontario Securities Commission', 'Commission des valeurs mobilières de l\'Ontario', 'ontario', 'securities', '{"phone": "416-593-8314", "email": "inquiries@osc.gov.on.ca"}', 'active'),
('amf_securities', 'AMF - Valeurs mobilières', 'AMF - Valeurs mobilières', 'quebec', 'securities', '{"phone": "514-395-0337", "email": "securities@lautorite.qc.ca"}', 'active'),
('ciro', 'Canadian Investment Regulatory Organization', 'Organisme canadien de réglementation des investissements', 'federal', 'securities', '{"phone": "416-364-6133", "email": "registration@ciro.ca"}', 'active');