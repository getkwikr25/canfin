-- Seed data for Canadian Financial Regulatory Platform (CFRP)
-- This file contains sample data for development and testing

-- Insert sample users
INSERT OR IGNORE INTO users (email, name, role, agency, entity_id, is_active) VALUES 
  ('admin@cfrp.ca', 'System Administrator', 'admin', 'cfrp', NULL, true),
  ('regulator@osfi.ca', 'OSFI Regulatory Analyst', 'regulator', 'osfi', NULL, true),
  ('regulator@fcac.ca', 'FCAC Consumer Protection Officer', 'regulator', 'fcac', NULL, true),
  ('regulator@fsra.ca', 'FSRA Compliance Supervisor', 'regulator', 'fsra', NULL, true),
  ('regulator@amf.ca', 'AMF Financial Analyst', 'regulator', 'amf', NULL, true),
  ('viewer@cfrp.ca', 'Audit Viewer', 'viewer', 'audit', NULL, true);

-- Insert sample entities (financial institutions)
INSERT OR IGNORE INTO entities (name, type, jurisdiction, registration_number, status, risk_score) VALUES 
  ('Royal Bank of Canada', 'bank', 'federal', 'RBC-001', 'active', 4.2),
  ('Toronto-Dominion Bank', 'bank', 'federal', 'TD-002', 'active', 3.8),
  ('Bank of Nova Scotia', 'bank', 'federal', 'BNS-003', 'active', 4.5),
  ('Bank of Montreal', 'bank', 'federal', 'BMO-004', 'active', 4.1),
  ('Canadian Imperial Bank of Commerce', 'bank', 'federal', 'CIBC-005', 'active', 4.3),
  ('Desjardins Group', 'credit_union', 'quebec', 'DES-QC-001', 'active', 5.1),
  ('Vancity Credit Union', 'credit_union', 'british_columbia', 'VCU-BC-001', 'active', 5.8),
  ('Manulife Financial Corporation', 'insurer', 'federal', 'MFC-INS-001', 'active', 6.2),
  ('Sun Life Financial Inc.', 'insurer', 'federal', 'SLF-INS-002', 'active', 5.9),
  ('Great-West Lifeco Inc.', 'insurer', 'federal', 'GWL-INS-003', 'active', 5.7),
  ('Questrade Inc.', 'investment_firm', 'ontario', 'QT-ON-001', 'active', 7.3),
  ('Wealthsimple Inc.', 'investment_firm', 'ontario', 'WS-ON-002', 'active', 6.8),
  ('CI Financial Corp.', 'investment_firm', 'ontario', 'CI-ON-003', 'active', 6.5),
  ('Royal Trust Corporation of Canada', 'trust_company', 'federal', 'RTC-001', 'active', 4.8),
  ('TD Trust Company', 'trust_company', 'federal', 'TDTC-002', 'active', 4.6);

-- Update users with entity associations for institution admins
INSERT OR IGNORE INTO users (email, name, role, agency, entity_id, is_active) VALUES 
  ('compliance@rbc.ca', 'RBC Compliance Manager', 'institution_admin', NULL, 1, true),
  ('compliance@td.ca', 'TD Regulatory Affairs Director', 'institution_admin', NULL, 2, true),
  ('compliance@scotiabank.ca', 'Scotia Compliance Officer', 'institution_admin', NULL, 3, true),
  ('compliance@bmo.ca', 'BMO Risk Management Director', 'institution_admin', NULL, 4, true),
  ('compliance@cibc.ca', 'CIBC Regulatory Specialist', 'institution_admin', NULL, 5, true),
  ('compliance@desjardins.ca', 'Desjardins Compliance Lead', 'institution_admin', NULL, 6, true),
  ('compliance@questrade.ca', 'Questrade Risk Officer', 'institution_admin', NULL, 11, true);

-- Insert sample filings
INSERT OR IGNORE INTO filings (entity_id, filing_type, status, data, risk_score, submitted_at) VALUES 
  (1, 'quarterly_return', 'validated', '{"reporting_period":"2024-Q3","currency":"CAD","assets_total":1450000000000,"liabilities_total":1320000000000,"capital_ratio":0.125,"liquidity_ratio":0.065,"risk_weighted_assets":985000000000}', 4.1, '2024-10-01 09:30:00'),
  (1, 'annual_report', 'approved', '{"reporting_period":"2023","currency":"CAD","net_income":15600000000,"return_on_equity":0.145,"return_on_assets":0.012,"efficiency_ratio":0.58,"provision_for_losses":2850000000}', 3.9, '2024-03-15 14:20:00'),
  (2, 'quarterly_return', 'pending', '{"reporting_period":"2024-Q3","currency":"CAD","assets_total":1890000000000,"liabilities_total":1720000000000,"capital_ratio":0.118,"liquidity_ratio":0.058,"risk_weighted_assets":1245000000000}', 4.3, '2024-10-02 11:15:00'),
  (3, 'incident_report', 'flagged', '{"reporting_period":"2024-09","currency":"CAD","incident_type":"cyber_security","severity":"medium","affected_customers":2500,"estimated_loss":150000,"remediation_status":"in_progress"}', 7.2, '2024-09-28 16:45:00'),
  (11, 'quarterly_return', 'pending', '{"reporting_period":"2024-Q3","currency":"CAD","assets_total":8500000000,"liabilities_total":7200000000,"capital_ratio":0.095,"liquidity_ratio":0.042,"risk_weighted_assets":6800000000}', 7.8, '2024-10-03 10:30:00'),
  (6, 'consumer_complaint', 'in_progress', '{"reporting_period":"2024-09","currency":"CAD","complaint_type":"unauthorized_fees","complaint_count":15,"total_amount":45000,"resolution_status":"investigating"}', 6.1, '2024-09-30 13:20:00'),
  (8, 'liquidity_coverage', 'validated', '{"reporting_period":"2024-Q3","currency":"CAD","liquidity_coverage_ratio":1.25,"net_stable_funding_ratio":1.18,"high_quality_assets":125000000000}', 5.8, '2024-10-01 08:45:00');

-- Insert sample cases
INSERT OR IGNORE INTO cases (entity_id, filing_id, case_type, priority, status, title, description, assigned_to, created_by) VALUES 
  (1, 1, 'compliance_review', 'medium', 'in_progress', 'Q3 Capital Adequacy Review', 'Review of Q3 capital adequacy ratios showing slight decline from Q2', 'regulator@osfi.ca', 'admin@cfrp.ca'),
  (3, 4, 'investigation', 'high', 'open', 'Cyber Security Incident Investigation', 'Investigation into cyber security breach affecting 2,500 customers', 'regulator@osfi.ca', 'admin@cfrp.ca'),
  (6, 6, 'investigation', 'medium', 'open', 'Consumer Complaint Investigation', 'Investigation into unauthorized fee charges reported by multiple customers', 'regulator@fcac.ca', 'admin@cfrp.ca'),
  (11, NULL, 'enforcement', 'urgent', 'escalated', 'Capital Ratio Breach Notice', 'Capital ratio below regulatory minimum - immediate corrective action required', 'regulator@osfi.ca', 'admin@cfrp.ca'),
  (2, NULL, 'audit', 'low', 'open', 'Annual Risk Assessment Audit', 'Scheduled annual audit of risk management practices and procedures', 'regulator@osfi.ca', 'admin@cfrp.ca'),
  (8, NULL, 'compliance_review', 'medium', 'closed', 'Insurance Solvency Review', 'Quarterly review of solvency ratios and capital requirements - completed satisfactorily', 'regulator@osfi.ca', 'admin@cfrp.ca');

-- Insert sample audit logs
INSERT OR IGNORE INTO audit_logs (user_id, action, resource, resource_id, metadata, timestamp) VALUES 
  (1, 'login', 'user', 1, '{"ip":"192.168.1.100","user_agent":"Mozilla/5.0"}', '2024-10-06 08:00:00'),
  (2, 'view_entity', 'entity', 1, '{"entity_name":"Royal Bank of Canada"}', '2024-10-06 09:15:00'),
  (2, 'review_filing', 'filing', 1, '{"filing_type":"quarterly_return","new_status":"validated"}', '2024-10-06 10:30:00'),
  (3, 'create_case', 'case', 3, '{"entity_id":6,"case_type":"investigation"}', '2024-10-06 11:20:00'),
  (1, 'view_risk_analytics', 'system', NULL, '{"report_type":"dashboard"}', '2024-10-06 14:15:00'),
  (4, 'submit_filing', 'filing', 2, '{"entity_id":2,"filing_type":"quarterly_return"}', '2024-10-06 15:30:00');

-- Create some additional validation errors for demonstration
UPDATE filings 
SET validation_errors = '[{"field":"capital_ratio","message":"Capital ratio below regulatory minimum","severity":"warning"}]'
WHERE id = 2;

UPDATE filings 
SET validation_errors = '[{"field":"incident_type","message":"Incident requires immediate regulator notification","severity":"error"},{"field":"affected_customers","message":"Customer notification procedures must be documented","severity":"warning"}]'
WHERE id = 4;

-- Set some review timestamps
UPDATE filings 
SET reviewed_at = '2024-10-02 14:30:00', reviewer_id = 2
WHERE id = 1;

UPDATE filings 
SET reviewed_at = '2024-03-20 16:45:00', reviewer_id = 2
WHERE id = 2;

-- Close some cases with timestamps
UPDATE cases 
SET status = 'closed', closed_at = '2024-09-25 17:00:00'
WHERE id = 6;