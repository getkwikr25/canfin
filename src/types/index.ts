// API Response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  request_id?: string;
}

// User and Authentication types
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  agency?: string;
  entity_id?: number;
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'admin' | 'regulator' | 'institution_admin' | 'viewer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  user_id: number;
  email: string;
  role: UserRole;
  agency?: string;
  entity_id?: number;
  exp: number;
}

// Entity types
export interface Entity {
  id: number;
  name: string;
  type: EntityType;
  jurisdiction: string;
  registration_number: string;
  status: EntityStatus;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

export type EntityType = 'bank' | 'credit_union' | 'insurer' | 'investment_firm' | 'trust_company';
export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'under_review';

export interface CreateEntityRequest {
  name: string;
  type: EntityType;
  jurisdiction: string;
  registration_number: string;
}

// Filing types
export interface Filing {
  id: number;
  entity_id: number;
  filing_type: FilingType;
  status: FilingStatus;
  data?: any;
  file_url?: string;
  validation_errors?: ValidationError[];
  risk_score?: number;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: number;
}

export type FilingType = 
  | 'quarterly_return' 
  | 'annual_report' 
  | 'incident_report' 
  | 'capital_adequacy' 
  | 'liquidity_coverage'
  | 'consumer_complaint'
  | 'cyber_incident';

export type FilingStatus = 'pending' | 'validated' | 'flagged' | 'approved' | 'rejected';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SubmitFilingRequest {
  entity_id: number;
  filing_type: FilingType;
  data: any;
  file_data?: string; // Base64 encoded file
  file_name?: string;
}

// Risk Assessment types
export interface RiskAssessment {
  id: number;
  entity_id: number;
  filing_id?: number;
  risk_score: number;
  risk_factors: RiskFactor[];
  confidence: number;
  explanation: string;
  assessed_at: string;
}

export interface RiskFactor {
  category: string;
  factor: string;
  impact: number; // 1-10 scale
  weight: number; // 0-1 scale
}

export interface RiskAssessmentRequest {
  entity_id: number;
  filing_data?: any;
  historical_context?: boolean;
}

// Case Management types
export interface Case {
  id: number;
  entity_id: number;
  filing_id?: number;
  case_type: CaseType;
  priority: CasePriority;
  status: CaseStatus;
  title: string;
  description: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export type CaseType = 'compliance_review' | 'investigation' | 'enforcement' | 'audit' | 'inquiry';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseStatus = 'open' | 'in_progress' | 'pending_review' | 'closed' | 'escalated';

export interface CreateCaseRequest {
  entity_id: number;
  filing_id?: number;
  case_type: CaseType;
  priority: CasePriority;
  title: string;
  description: string;
}

export interface UpdateCaseRequest {
  status?: CaseStatus;
  assigned_to?: string;
  priority?: CasePriority;
  description?: string;
}

// Analytics and Dashboard types
export interface DashboardMetrics {
  total_entities: number;
  pending_filings: number;
  high_risk_entities: number;
  open_cases: number;
  compliance_rate: number;
  avg_processing_time: number;
}

export interface EntityMetrics {
  entity_id: number;
  total_filings: number;
  avg_risk_score: number;
  compliance_rate: number;
  last_filing_date?: string;
  open_cases: number;
}

export interface FilingTrend {
  date: string;
  filing_type: FilingType;
  count: number;
  avg_risk_score: number;
}

// Audit Log types
export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  metadata?: any;
}

// Search and Filter types
export interface EntityFilters {
  type?: EntityType[];
  jurisdiction?: string[];
  status?: EntityStatus[];
  risk_score_min?: number;
  risk_score_max?: number;
  search?: string;
}

export interface FilingFilters {
  entity_id?: number;
  filing_type?: FilingType[];
  status?: FilingStatus[];
  date_from?: string;
  date_to?: string;
  risk_score_min?: number;
  risk_score_max?: number;
}

export interface CaseFilters {
  entity_id?: number;
  case_type?: CaseType[];
  status?: CaseStatus[];
  priority?: CasePriority[];
  assigned_to?: string;
  created_from?: string;
  created_to?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Configuration types
export interface AppConfig {
  api_base_url: string;
  jwt_expiry: number;
  max_file_size: number;
  supported_file_types: string[];
  regulatory_agencies: RegulatoryAgency[];
}

export interface RegulatoryAgency {
  code: string;
  name: string;
  name_fr: string;
  jurisdiction: string;
  website: string;
}

// Error types
export interface ValidationErrorResponse {
  success: false;
  error: string;
  validation_errors: ValidationError[];
  timestamp: string;
}

export interface APIError extends Error {
  status: number;
  code: string;
  details?: any;
}