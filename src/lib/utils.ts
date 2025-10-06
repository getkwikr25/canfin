import { APIResponse, ValidationError } from '../types'

// Generate unique request ID for tracing
export function generateRequestId(): string {
  return `cfrp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create standardized API response
export function createApiResponse<T>(
  data?: T, 
  error?: string, 
  requestId?: string
): APIResponse<T> {
  return {
    success: !error,
    data,
    error,
    timestamp: new Date().toISOString(),
    request_id: requestId || generateRequestId()
  }
}

// Validate required fields
export function validateRequiredFields(
  data: any, 
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = []
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      errors.push({
        field,
        message: `${field} is required`,
        severity: 'error'
      })
    }
  })
  
  return errors
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate Canadian postal code
export function validatePostalCode(postalCode: string): boolean {
  const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return postalRegex.test(postalCode)
}

// Validate file upload
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): ValidationError[] {
  const errors: ValidationError[] = []
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      severity: 'error'
    })
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push({
      field: 'file',
      message: `File size ${formatBytes(file.size)} exceeds maximum ${formatBytes(maxSize)}`,
      severity: 'error'
    })
  }
  
  return errors
}

// Format file size in bytes to human readable
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

// Calculate risk score based on filing data
export function calculateBasicRiskScore(filingData: any): number {
  let score = 5.0 // Base score
  
  // Simple risk factors (in production, this would be more sophisticated)
  if (filingData.capital_ratio && filingData.capital_ratio < 0.1) {
    score += 2.0 // Low capital ratio increases risk
  }
  
  if (filingData.liquidity_ratio && filingData.liquidity_ratio < 0.05) {
    score += 1.5 // Low liquidity increases risk
  }
  
  if (filingData.incident_count && filingData.incident_count > 5) {
    score += 1.0 // High incident count increases risk
  }
  
  if (filingData.compliance_violations && filingData.compliance_violations > 0) {
    score += 0.5 * filingData.compliance_violations
  }
  
  // Ensure score is between 1-10
  return Math.max(1, Math.min(10, score))
}

// Generate mock XBRL filing data
export function generateMockFilingData(filingType: string): any {
  const baseData = {
    reporting_period: new Date().toISOString().substr(0, 7), // YYYY-MM
    currency: 'CAD',
    submission_date: new Date().toISOString()
  }
  
  switch (filingType) {
    case 'quarterly_return':
      return {
        ...baseData,
        assets_total: Math.floor(Math.random() * 10000000000) + 1000000000,
        liabilities_total: Math.floor(Math.random() * 8000000000) + 800000000,
        capital_ratio: 0.08 + Math.random() * 0.12,
        liquidity_ratio: 0.03 + Math.random() * 0.07,
        risk_weighted_assets: Math.floor(Math.random() * 8000000000) + 500000000
      }
    
    case 'annual_report':
      return {
        ...baseData,
        net_income: Math.floor(Math.random() * 500000000) + 50000000,
        return_on_equity: 0.05 + Math.random() * 0.15,
        return_on_assets: 0.005 + Math.random() * 0.025,
        efficiency_ratio: 0.4 + Math.random() * 0.4,
        provision_for_losses: Math.floor(Math.random() * 100000000) + 10000000
      }
    
    case 'incident_report':
      return {
        ...baseData,
        incident_type: ['cyber_security', 'operational', 'fraud', 'compliance'][Math.floor(Math.random() * 4)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        affected_customers: Math.floor(Math.random() * 10000),
        estimated_loss: Math.floor(Math.random() * 1000000),
        remediation_status: ['planned', 'in_progress', 'completed'][Math.floor(Math.random() * 3)]
      }
    
    default:
      return baseData
  }
}

// Format currency values
export function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format percentage values
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// Format risk score with color coding
export function formatRiskScore(score: number): { value: string; color: string; label: string } {
  const formattedScore = score.toFixed(1)
  
  if (score <= 3) {
    return { value: formattedScore, color: 'green', label: 'Low Risk' }
  } else if (score <= 6) {
    return { value: formattedScore, color: 'yellow', label: 'Medium Risk' }
  } else if (score <= 8) {
    return { value: formattedScore, color: 'orange', label: 'High Risk' }
  } else {
    return { value: formattedScore, color: 'red', label: 'Critical Risk' }
  }
}

// Generate filing status badge HTML
export function getStatusBadge(status: string): string {
  const badges = {
    pending: '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>',
    validated: '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Validated</span>',
    flagged: '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Flagged</span>',
    approved: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Approved</span>',
    rejected: '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Rejected</span>'
  }
  
  return badges[status as keyof typeof badges] || status
}

// Sanitize HTML input
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Generate pagination info
export function generatePaginationInfo(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit)
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)
  
  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    start_item: startItem,
    end_item: endItem,
    has_previous: page > 1,
    has_next: page < totalPages
  }
}

// Sleep utility for testing
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Debounce function for API calls
export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Check if running in development mode
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Log with timestamp
export function logWithTimestamp(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[${timestamp}] ${message}`, data)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}

// Generate entity type display name
export function getEntityTypeDisplayName(type: string): string {
  const displayNames = {
    'bank': 'Bank',
    'credit_union': 'Credit Union',
    'insurer': 'Insurance Company',
    'investment_firm': 'Investment Firm',
    'trust_company': 'Trust Company'
  }
  
  return displayNames[type as keyof typeof displayNames] || type
}

// Generate Canadian regulatory agency info
export function getRegulatoryAgencies() {
  return [
    {
      code: 'osfi',
      name: 'Office of the Superintendent of Financial Institutions',
      name_fr: 'Bureau du surintendant des institutions financières',
      jurisdiction: 'federal',
      website: 'https://www.osfi-bsif.gc.ca'
    },
    {
      code: 'fcac',
      name: 'Financial Consumer Agency of Canada',
      name_fr: 'Agence de la consommation en matière financière du Canada',
      jurisdiction: 'federal',
      website: 'https://www.canada.ca/en/financial-consumer-agency.html'
    },
    {
      code: 'fsra',
      name: 'Financial Services Regulatory Authority of Ontario',
      name_fr: 'Autorité ontarienne de réglementation des services financiers',
      jurisdiction: 'ontario',
      website: 'https://www.fsrao.ca'
    },
    {
      code: 'amf',
      name: 'Autorité des marchés financiers',
      name_fr: 'Autorité des marchés financiers',
      jurisdiction: 'quebec',
      website: 'https://lautorite.qc.ca'
    }
  ]
}