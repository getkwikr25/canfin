import { Hono } from 'hono'
import { DatabaseService } from '../lib/database'
import { canAccessEntity } from '../lib/auth'
import { createApiResponse, validateRequiredFields, generateMockFilingData, calculateBasicRiskScore } from '../lib/utils'
import { SubmitFilingRequest, FilingType, FilingStatus, ValidationError } from '../types'

const filingRoutes = new Hono()

// Get all filings
filingRoutes.get('/', async (c) => {
  const requestId = `get_filings_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const db = new DatabaseService(c.env.DB)
    
    // Parse query parameters
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = (page - 1) * limit
    
    // Build filters
    const filters: any = {}
    if (c.req.query('entity_id')) filters.entity_id = parseInt(c.req.query('entity_id'))
    if (c.req.query('filing_type')) filters.filing_type = c.req.query('filing_type')
    if (c.req.query('status')) filters.status = c.req.query('status')
    
    // If user is institution admin, only show their entity's filings
    if (userPayload.role === 'institution_admin' && userPayload.entity_id) {
      filters.entity_id = userPayload.entity_id
    }
    
    const filings = await db.getFilings(filters, limit, offset)
    
    // Get entity names for display
    const enrichedFilings = []
    for (const filing of filings) {
      const entity = await db.getEntity(filing.entity_id)
      enrichedFilings.push({
        ...filing,
        entity_name: entity?.name || 'Unknown Entity',
        filing_type_display: getFilingTypeDisplayName(filing.filing_type),
        status_display: getFilingStatusDisplayName(filing.status),
        risk_level: filing.risk_score ? getRiskLevel(filing.risk_score) : 'Unknown'
      })
    }
    
    return c.json(createApiResponse(enrichedFilings, null, requestId))
    
  } catch (error) {
    console.error('Get filings error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get single filing by ID
filingRoutes.get('/:id', async (c) => {
  const requestId = `get_filing_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const db = new DatabaseService(c.env.DB)
    const filingId = parseInt(c.req.param('id'))
    
    const filing = await db.getFiling(filingId)
    if (!filing) {
      return c.json(createApiResponse(null, 'Filing not found', requestId), 404)
    }
    
    // Check access permissions
    if (!canAccessEntity(userPayload, filing.entity_id)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    // Get entity information
    const entity = await db.getEntity(filing.entity_id)
    
    const enrichedFiling = {
      ...filing,
      entity_name: entity?.name || 'Unknown Entity',
      entity_type: entity?.type || 'unknown',
      filing_type_display: getFilingTypeDisplayName(filing.filing_type),
      status_display: getFilingStatusDisplayName(filing.status),
      risk_level: filing.risk_score ? getRiskLevel(filing.risk_score) : 'Unknown'
    }
    
    await db.logAction(userPayload.user_id, 'view_filing', 'filing', filingId)
    
    return c.json(createApiResponse(enrichedFiling, null, requestId))
    
  } catch (error) {
    console.error('Get filing error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Submit new filing
filingRoutes.post('/submit', async (c) => {
  const requestId = `submit_filing_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const body = await c.req.json() as SubmitFilingRequest
    const db = new DatabaseService(c.env.DB)
    
    // Validate input
    const errors = validateRequiredFields(body, ['entity_id', 'filing_type', 'data'])
    if (errors.length > 0) {
      return c.json(createApiResponse(null, 'Validation failed', requestId), 400)
    }
    
    // Check access permissions
    if (!canAccessEntity(userPayload, body.entity_id)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    // Validate filing type
    const validTypes: FilingType[] = [
      'quarterly_return', 'annual_report', 'incident_report', 
      'capital_adequacy', 'liquidity_coverage', 'consumer_complaint', 'cyber_incident'
    ]
    if (!validTypes.includes(body.filing_type)) {
      return c.json(createApiResponse(null, 'Invalid filing type', requestId), 400)
    }
    
    // Validate filing data
    const validationErrors = validateFilingData(body.filing_type, body.data)
    
    // Calculate basic risk score
    const riskScore = calculateBasicRiskScore(body.data)
    
    // Handle file upload to R2 storage (if file provided)
    let fileUrl: string | undefined
    if (body.file_data && body.file_name) {
      // In production, would upload to R2 bucket
      fileUrl = `/files/${body.entity_id}/${Date.now()}_${body.file_name}`
      // For demo, just store the URL
    }
    
    // Create filing
    const newFiling = await db.createFiling({
      entity_id: body.entity_id,
      filing_type: body.filing_type,
      status: validationErrors.length > 0 ? 'flagged' : 'pending',
      data: body.data,
      file_url: fileUrl,
      validation_errors: validationErrors,
      risk_score: riskScore,
      reviewed_at: undefined,
      reviewer_id: undefined
    })
    
    // Update entity risk score if this filing is high risk
    if (riskScore > 7) {
      const entity = await db.getEntity(body.entity_id)
      if (entity && riskScore > entity.risk_score) {
        await db.updateEntity(body.entity_id, { risk_score: riskScore })
      }
    }
    
    await db.logAction(userPayload.user_id, 'submit_filing', 'filing', newFiling.id, { 
      filing_type: newFiling.filing_type,
      entity_id: newFiling.entity_id 
    })
    
    const enrichedFiling = {
      ...newFiling,
      filing_type_display: getFilingTypeDisplayName(newFiling.filing_type),
      status_display: getFilingStatusDisplayName(newFiling.status),
      risk_level: getRiskLevel(newFiling.risk_score || 0)
    }
    
    return c.json(createApiResponse(enrichedFiling, null, requestId), 201)
    
  } catch (error) {
    console.error('Submit filing error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Validate filing data (without submission)
filingRoutes.post('/validate', async (c) => {
  const requestId = `validate_filing_${Date.now()}`
  
  try {
    const body = await c.req.json()
    
    // Validate input
    const errors = validateRequiredFields(body, ['filing_type', 'data'])
    if (errors.length > 0) {
      return c.json(createApiResponse(null, 'Validation failed', requestId), 400)
    }
    
    // Validate filing data
    const validationErrors = validateFilingData(body.filing_type, body.data)
    const riskScore = calculateBasicRiskScore(body.data)
    
    return c.json(createApiResponse({
      is_valid: validationErrors.length === 0,
      validation_errors: validationErrors,
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
      estimated_processing_time: getEstimatedProcessingTime(body.filing_type)
    }, null, requestId))
    
  } catch (error) {
    console.error('Validate filing error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Review filing (regulator only)
filingRoutes.put('/:id/review', async (c) => {
  const requestId = `review_filing_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    if (userPayload.role !== 'regulator' && userPayload.role !== 'admin') {
      return c.json(createApiResponse(null, 'Regulator access required', requestId), 403)
    }
    
    const filingId = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    
    // Check if filing exists
    const filing = await db.getFiling(filingId)
    if (!filing) {
      return c.json(createApiResponse(null, 'Filing not found', requestId), 404)
    }
    
    // Validate status
    const validStatuses: FilingStatus[] = ['pending', 'validated', 'flagged', 'approved', 'rejected']
    if (!body.status || !validStatuses.includes(body.status)) {
      return c.json(createApiResponse(null, 'Invalid status', requestId), 400)
    }
    
    // Update filing
    const updates: any = {
      status: body.status,
      reviewed_at: new Date().toISOString(),
      reviewer_id: userPayload.user_id
    }
    
    // Add validation errors if flagging
    if (body.status === 'flagged' && body.validation_errors) {
      updates.validation_errors = body.validation_errors
    }
    
    const updatedFiling = await db.updateFiling(filingId, updates)
    if (!updatedFiling) {
      return c.json(createApiResponse(null, 'Failed to update filing', requestId), 500)
    }
    
    await db.logAction(userPayload.user_id, 'review_filing', 'filing', filingId, { 
      new_status: body.status,
      previous_status: filing.status 
    })
    
    const enrichedFiling = {
      ...updatedFiling,
      filing_type_display: getFilingTypeDisplayName(updatedFiling.filing_type),
      status_display: getFilingStatusDisplayName(updatedFiling.status),
      risk_level: getRiskLevel(updatedFiling.risk_score || 0)
    }
    
    return c.json(createApiResponse(enrichedFiling, null, requestId))
    
  } catch (error) {
    console.error('Review filing error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Demo endpoint to create sample filings
filingRoutes.post('/demo/create-sample-filings', async (c) => {
  const requestId = `demo_filings_${Date.now()}`
  
  try {
    const db = new DatabaseService(c.env.DB)
    
    // Get existing entities for demo filings
    const entities = await db.getEntities({}, 10)
    if (entities.length === 0) {
      return c.json(createApiResponse(null, 'No entities found. Create entities first.', requestId), 400)
    }
    
    const filingTypes: FilingType[] = ['quarterly_return', 'annual_report', 'incident_report']
    const createdFilings = []
    
    // Create sample filings for first few entities
    for (let i = 0; i < Math.min(entities.length, 3); i++) {
      const entity = entities[i]
      
      for (const filingType of filingTypes) {
        const mockData = generateMockFilingData(filingType)
        const riskScore = calculateBasicRiskScore(mockData)
        
        const filing = await db.createFiling({
          entity_id: entity.id,
          filing_type: filingType,
          status: Math.random() > 0.7 ? 'flagged' : 'pending',
          data: mockData,
          file_url: undefined,
          validation_errors: [],
          risk_score: riskScore,
          reviewed_at: undefined,
          reviewer_id: undefined
        })
        
        createdFilings.push(`${entity.name} - ${filingType}`)
      }
    }
    
    return c.json(createApiResponse({
      message: 'Sample filings created',
      created_filings: createdFilings
    }, null, requestId))
    
  } catch (error) {
    console.error('Demo filings error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Helper functions
function getFilingTypeDisplayName(type: FilingType): string {
  const displayNames = {
    'quarterly_return': 'Quarterly Return',
    'annual_report': 'Annual Report',
    'incident_report': 'Incident Report',
    'capital_adequacy': 'Capital Adequacy Report',
    'liquidity_coverage': 'Liquidity Coverage Report',
    'consumer_complaint': 'Consumer Complaint Filing',
    'cyber_incident': 'Cyber Security Incident Report'
  }
  return displayNames[type] || type
}

function getFilingStatusDisplayName(status: FilingStatus): string {
  const displayNames = {
    'pending': 'Pending Review',
    'validated': 'Validated',
    'flagged': 'Flagged for Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  }
  return displayNames[status] || status
}

function getRiskLevel(score: number): string {
  if (score <= 3) return 'Low'
  if (score <= 6) return 'Medium'
  if (score <= 8) return 'High'
  return 'Critical'
}

function validateFilingData(filingType: FilingType, data: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  // Common validations
  if (!data.reporting_period) {
    errors.push({
      field: 'reporting_period',
      message: 'Reporting period is required',
      severity: 'error'
    })
  }
  
  if (!data.currency) {
    errors.push({
      field: 'currency',
      message: 'Currency is required',
      severity: 'error'
    })
  }
  
  // Filing type specific validations
  switch (filingType) {
    case 'quarterly_return':
      if (!data.assets_total || data.assets_total <= 0) {
        errors.push({
          field: 'assets_total',
          message: 'Total assets must be greater than 0',
          severity: 'error'
        })
      }
      
      if (!data.capital_ratio || data.capital_ratio < 0.08) {
        errors.push({
          field: 'capital_ratio',
          message: 'Capital ratio below regulatory minimum (8%)',
          severity: 'warning'
        })
      }
      break
      
    case 'incident_report':
      if (!data.incident_type) {
        errors.push({
          field: 'incident_type',
          message: 'Incident type is required',
          severity: 'error'
        })
      }
      
      if (!data.severity) {
        errors.push({
          field: 'severity',
          message: 'Severity level is required',
          severity: 'error'
        })
      }
      break
  }
  
  return errors
}

function getEstimatedProcessingTime(filingType: FilingType): string {
  const processingTimes = {
    'quarterly_return': '2-3 business days',
    'annual_report': '5-7 business days',
    'incident_report': '1-2 business days',
    'capital_adequacy': '3-5 business days',
    'liquidity_coverage': '2-3 business days',
    'consumer_complaint': '1-2 business days',
    'cyber_incident': 'Same day (priority)'
  }
  return processingTimes[filingType] || '3-5 business days'
}

export { filingRoutes }