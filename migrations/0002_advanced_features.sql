-- Advanced Features Migration: Multi-Agency Distribution, Real-Time Analysis, Workflow Coordination, Compliance Flagging

-- Filing Distribution System
CREATE TABLE IF NOT EXISTS filing_distributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_id INTEGER NOT NULL,
  agency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  distributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  format_type TEXT NOT NULL DEFAULT 'json',
  validation_status TEXT DEFAULT 'pending',
  error_message TEXT,
  FOREIGN KEY (filing_id) REFERENCES filings(id)
);

CREATE TABLE IF NOT EXISTS agency_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  distribution_id INTEGER NOT NULL,
  agency TEXT NOT NULL,
  formatted_data TEXT NOT NULL,
  submission_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'submitted',
  FOREIGN KEY (distribution_id) REFERENCES filing_distributions(id)
);

-- Real-Time Analysis System
CREATE TABLE IF NOT EXISTS real_time_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  filing_id INTEGER,
  filing_type TEXT NOT NULL,
  analysis_results TEXT NOT NULL,
  processing_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (filing_id) REFERENCES filings(id)
);

CREATE TABLE IF NOT EXISTS field_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  filing_type TEXT NOT NULL,
  validation_result TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

-- Cross-Agency Workflow System
CREATE TABLE IF NOT EXISTS cross_agency_workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_type TEXT NOT NULL,
  case_id INTEGER,
  entity_id INTEGER,
  primary_agency TEXT NOT NULL,
  involved_agencies TEXT NOT NULL, -- JSON array
  status TEXT DEFAULT 'initiated',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  context TEXT, -- JSON object
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS workflow_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  stage_order INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  owner_agency TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  estimated_duration_days INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  due_date DATETIME,
  completion_notes TEXT,
  attachments TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES cross_agency_workflows(id)
);

CREATE TABLE IF NOT EXISTS workflow_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  stage_id INTEGER,
  assigned_agency TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATETIME,
  completed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES cross_agency_workflows(id),
  FOREIGN KEY (stage_id) REFERENCES workflow_stages(id)
);

CREATE TABLE IF NOT EXISTS workflow_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER,
  recipient_agency TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME
);

CREATE TABLE IF NOT EXISTS inter_agency_communications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER,
  sender_agency TEXT NOT NULL,
  message_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT, -- JSON array
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES cross_agency_workflows(id)
);

CREATE TABLE IF NOT EXISTS communication_recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  communication_id INTEGER NOT NULL,
  recipient_agency TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (communication_id) REFERENCES inter_agency_communications(id)
);

-- Compliance Flagging System
CREATE TABLE IF NOT EXISTS compliance_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  filing_id INTEGER,
  check_results TEXT NOT NULL, -- JSON object
  flags_triggered INTEGER DEFAULT 0,
  overall_status TEXT NOT NULL,
  processing_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (filing_id) REFERENCES filings(id)
);

CREATE TABLE IF NOT EXISTS compliance_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  check_id INTEGER,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  conditions_met TEXT NOT NULL, -- JSON array
  regulatory_impact TEXT NOT NULL,
  escalation_required INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolution_notes TEXT,
  resolved_by TEXT,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (check_id) REFERENCES compliance_checks(id)
);

CREATE TABLE IF NOT EXISTS compliance_escalations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_id INTEGER NOT NULL,
  entity_id INTEGER NOT NULL,
  escalation_type TEXT NOT NULL,
  assigned_agency TEXT NOT NULL,
  priority TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  resolution_notes TEXT,
  FOREIGN KEY (flag_id) REFERENCES compliance_flags(id),
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_filing_distributions_filing_id ON filing_distributions(filing_id);
CREATE INDEX IF NOT EXISTS idx_filing_distributions_agency ON filing_distributions(agency);
CREATE INDEX IF NOT EXISTS idx_agency_submissions_distribution_id ON agency_submissions(distribution_id);

CREATE INDEX IF NOT EXISTS idx_real_time_analyses_entity_id ON real_time_analyses(entity_id);
CREATE INDEX IF NOT EXISTS idx_real_time_analyses_filing_id ON real_time_analyses(filing_id);
CREATE INDEX IF NOT EXISTS idx_field_validations_entity_id ON field_validations(entity_id);

CREATE INDEX IF NOT EXISTS idx_cross_agency_workflows_entity_id ON cross_agency_workflows(entity_id);
CREATE INDEX IF NOT EXISTS idx_cross_agency_workflows_primary_agency ON cross_agency_workflows(primary_agency);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_workflow_id ON workflow_stages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_workflow_id ON workflow_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_assigned_agency ON workflow_actions(assigned_agency);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_recipient_agency ON workflow_notifications(recipient_agency);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_entity_id ON compliance_checks(entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_flags_entity_id ON compliance_flags(entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_flags_status ON compliance_flags(status);
CREATE INDEX IF NOT EXISTS idx_compliance_flags_severity ON compliance_flags(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_escalations_assigned_agency ON compliance_escalations(assigned_agency);
CREATE INDEX IF NOT EXISTS idx_compliance_escalations_status ON compliance_escalations(status);