import { Hono } from 'hono'
import { DatabaseService } from '../lib/database'
import { canAccessEntity } from '../lib/auth'
import { createApiResponse, validateRequiredFields } from '../lib/utils'
import { CreateCaseRequest, UpdateCaseRequest, CaseType, CasePriority, CaseStatus } from '../types'

const caseRoutes = new Hono()

// Get all cases
caseRoutes.get('/', async (c) => {
  const requestId = `get_cases_${Date.now()}`
  
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
    if (c.req.query('status')) filters.status = c.req.query('status')
    if (c.req.query('assigned_to')) filters.assigned_to = c.req.query('assigned_to')
    if (c.req.query('case_type')) filters.case_type = c.req.query('case_type')
    if (c.req.query('priority')) filters.priority = c.req.query('priority')
    
    // Filter by user role and permissions
    if (userPayload.role === 'institution_admin' && userPayload.entity_id) {
      filters.entity_id = userPayload.entity_id
    }
    
    if (userPayload.role === 'regulator') {
      // Regulators can see cases in their agency or assigned to them
      if (!filters.assigned_to) {
        // Show cases assigned to them or unassigned cases
        filters.assigned_to = userPayload.email
      }
    }
    
    const cases = await db.getCases(filters, limit, offset)
    
    // Enrich cases with entity and filing information
    const enrichedCases = []
    for (const caseItem of cases) {
      const entity = await db.getEntity(caseItem.entity_id)
      let filing = null
      if (caseItem.filing_id) {
        filing = await db.getFiling(caseItem.filing_id)
      }
      
      enrichedCases.push({
        ...caseItem,
        entity_name: entity?.name || 'Unknown Entity',
        entity_type: entity?.type || 'unknown',
        filing_type: filing?.filing_type || null,
        case_type_display: getCaseTypeDisplayName(caseItem.case_type),
        priority_display: getPriorityDisplayName(caseItem.priority),
        status_display: getStatusDisplayName(caseItem.status),
        age_days: calculateCaseAge(caseItem.created_at),
        is_overdue: isOverdue(caseItem.created_at, caseItem.priority, caseItem.status)
      })
    }
    
    return c.json(createApiResponse(enrichedCases, null, requestId))
    
  } catch (error) {
    console.error('Get cases error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get single case by ID
caseRoutes.get('/:id', async (c) => {
  const requestId = `get_case_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const db = new DatabaseService(c.env.DB)
    const caseId = parseInt(c.req.param('id'))
    
    const caseItem = await db.getCase(caseId)
    if (!caseItem) {
      return c.json(createApiResponse(null, 'Case not found', requestId), 404)
    }
    
    // Check access permissions
    if (!canAccessEntity(userPayload, caseItem.entity_id)) {
      // Additional check for assigned regulator
      if (userPayload.role === 'regulator' && caseItem.assigned_to !== userPayload.email) {
        return c.json(createApiResponse(null, 'Access denied', requestId), 403)
      }
    }
    
    // Get related information
    const entity = await db.getEntity(caseItem.entity_id)
    let filing = null
    if (caseItem.filing_id) {
      filing = await db.getFiling(caseItem.filing_id)
    }
    
    // Get case activity/history (simplified - in production would have separate activity table)
    const relatedFilings = await db.getFilings({ entity_id: caseItem.entity_id }, 10)
    
    const enrichedCase = {
      ...caseItem,
      entity_name: entity?.name || 'Unknown Entity',
      entity_type: entity?.type || 'unknown',
      entity: entity,
      filing: filing,
      case_type_display: getCaseTypeDisplayName(caseItem.case_type),
      priority_display: getPriorityDisplayName(caseItem.priority),
      status_display: getStatusDisplayName(caseItem.status),
      age_days: calculateCaseAge(caseItem.created_at),
      is_overdue: isOverdue(caseItem.created_at, caseItem.priority, caseItem.status),
      related_filings: relatedFilings,
      estimated_resolution: getEstimatedResolution(caseItem.case_type, caseItem.priority)
    }
    
    await db.logAction(userPayload.user_id, 'view_case', 'case', caseId)
    
    return c.json(createApiResponse(enrichedCase, null, requestId))
    
  } catch (error) {
    console.error('Get case error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Create new case
caseRoutes.post('/', async (c) => {
  const requestId = `create_case_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    
    // Only regulators and admins can create cases
    if (!['regulator', 'admin'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const body = await c.req.json() as CreateCaseRequest
    const db = new DatabaseService(c.env.DB)
    
    // Validate input
    const errors = validateRequiredFields(body, ['entity_id', 'case_type', 'priority', 'title', 'description'])
    if (errors.length > 0) {
      return c.json(createApiResponse(null, 'Validation failed', requestId), 400)
    }
    
    // Validate entity exists
    const entity = await db.getEntity(body.entity_id)
    if (!entity) {
      return c.json(createApiResponse(null, 'Entity not found', requestId), 404)
    }
    
    // Validate case type
    const validTypes: CaseType[] = ['compliance_review', 'investigation', 'enforcement', 'audit', 'inquiry']
    if (!validTypes.includes(body.case_type)) {
      return c.json(createApiResponse(null, 'Invalid case type', requestId), 400)
    }
    
    // Validate priority
    const validPriorities: CasePriority[] = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(body.priority)) {
      return c.json(createApiResponse(null, 'Invalid priority', requestId), 400)
    }
    
    // Validate filing if provided
    if (body.filing_id) {
      const filing = await db.getFiling(body.filing_id)
      if (!filing || filing.entity_id !== body.entity_id) {
        return c.json(createApiResponse(null, 'Invalid filing ID', requestId), 400)
      }
    }
    
    // Create case
    const newCase = await db.createCase({
      entity_id: body.entity_id,
      filing_id: body.filing_id,
      case_type: body.case_type,
      priority: body.priority,
      status: 'open',
      title: body.title,
      description: body.description,
      assigned_to: userPayload.email, // Auto-assign to creator
      created_by: userPayload.email
    })
    
    await db.logAction(userPayload.user_id, 'create_case', 'case', newCase.id, { 
      entity_id: newCase.entity_id,
      case_type: newCase.case_type,
      priority: newCase.priority
    })
    
    const enrichedCase = {
      ...newCase,
      entity_name: entity.name,
      entity_type: entity.type,
      case_type_display: getCaseTypeDisplayName(newCase.case_type),
      priority_display: getPriorityDisplayName(newCase.priority),
      status_display: getStatusDisplayName(newCase.status),
      age_days: 0,
      is_overdue: false
    }
    
    return c.json(createApiResponse(enrichedCase, null, requestId), 201)
    
  } catch (error) {
    console.error('Create case error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Update case
caseRoutes.put('/:id', async (c) => {
  const requestId = `update_case_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    
    // Only regulators and admins can update cases
    if (!['regulator', 'admin'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const caseId = parseInt(c.req.param('id'))
    const body = await c.req.json() as UpdateCaseRequest
    const db = new DatabaseService(c.env.DB)
    
    // Check if case exists
    const existingCase = await db.getCase(caseId)
    if (!existingCase) {
      return c.json(createApiResponse(null, 'Case not found', requestId), 404)
    }
    
    // Check if user can update this case
    if (userPayload.role === 'regulator' && 
        existingCase.assigned_to !== userPayload.email && 
        userPayload.role !== 'admin') {
      return c.json(createApiResponse(null, 'Can only update assigned cases', requestId), 403)
    }
    
    // Validate updates
    const allowedUpdates = ['status', 'assigned_to', 'priority', 'description']
    const updates: any = {}
    
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return c.json(createApiResponse(null, 'No valid updates provided', requestId), 400)
    }
    
    // Validate status if being updated
    if (updates.status) {
      const validStatuses: CaseStatus[] = ['open', 'in_progress', 'pending_review', 'closed', 'escalated']
      if (!validStatuses.includes(updates.status)) {
        return c.json(createApiResponse(null, 'Invalid case status', requestId), 400)
      }
      
      // Set closed_at if closing case
      if (updates.status === 'closed' && !existingCase.closed_at) {
        updates.closed_at = new Date().toISOString()
      }
    }
    
    // Validate priority if being updated
    if (updates.priority) {
      const validPriorities: CasePriority[] = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(updates.priority)) {
        return c.json(createApiResponse(null, 'Invalid priority', requestId), 400)
      }
    }
    
    // Update case (using entity update pattern since we don't have updateCase method)
    // In production, would implement proper case update method
    const caseUpdateQuery = `
      UPDATE cases 
      SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `
    
    const params = [...Object.values(updates), caseId]
    await db.db.prepare(caseUpdateQuery).bind(...params).run()
    
    // Get updated case
    const updatedCase = await db.getCase(caseId)
    
    await db.logAction(userPayload.user_id, 'update_case', 'case', caseId, {
      updates,
      previous_status: existingCase.status
    })
    
    // Enrich updated case
    const entity = await db.getEntity(updatedCase!.entity_id)
    const enrichedCase = {
      ...updatedCase,
      entity_name: entity?.name || 'Unknown Entity',
      case_type_display: getCaseTypeDisplayName(updatedCase!.case_type),
      priority_display: getPriorityDisplayName(updatedCase!.priority),
      status_display: getStatusDisplayName(updatedCase!.status),
      age_days: calculateCaseAge(updatedCase!.created_at),
      is_overdue: isOverdue(updatedCase!.created_at, updatedCase!.priority, updatedCase!.status)
    }
    
    return c.json(createApiResponse(enrichedCase, null, requestId))
    
  } catch (error) {
    console.error('Update case error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get case statistics
caseRoutes.get('/stats/dashboard', async (c) => {
  const requestId = `case_stats_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    
    // Only regulators and admins can view stats
    if (!['regulator', 'admin'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const db = new DatabaseService(c.env.DB)
    
    // Get all cases for statistics
    const allCases = await db.getCases({}, 1000) // Get many for stats
    
    // Filter by user if regulator (only their assigned cases)
    const userCases = userPayload.role === 'regulator' 
      ? allCases.filter(c => c.assigned_to === userPayload.email)
      : allCases
    
    // Calculate statistics
    const stats = {
      total_cases: userCases.length,
      open_cases: userCases.filter(c => ['open', 'in_progress'].includes(c.status)).length,
      closed_cases: userCases.filter(c => c.status === 'closed').length,
      overdue_cases: userCases.filter(c => isOverdue(c.created_at, c.priority, c.status)).length,
      
      // By priority
      by_priority: {
        urgent: userCases.filter(c => c.priority === 'urgent').length,
        high: userCases.filter(c => c.priority === 'high').length,
        medium: userCases.filter(c => c.priority === 'medium').length,
        low: userCases.filter(c => c.priority === 'low').length
      },
      
      // By type
      by_type: {
        compliance_review: userCases.filter(c => c.case_type === 'compliance_review').length,
        investigation: userCases.filter(c => c.case_type === 'investigation').length,
        enforcement: userCases.filter(c => c.case_type === 'enforcement').length,
        audit: userCases.filter(c => c.case_type === 'audit').length,
        inquiry: userCases.filter(c => c.case_type === 'inquiry').length
      },
      
      // By status
      by_status: {
        open: userCases.filter(c => c.status === 'open').length,
        in_progress: userCases.filter(c => c.status === 'in_progress').length,
        pending_review: userCases.filter(c => c.status === 'pending_review').length,
        closed: userCases.filter(c => c.status === 'closed').length,
        escalated: userCases.filter(c => c.status === 'escalated').length
      },
      
      // Performance metrics
      avg_resolution_time: calculateAvgResolutionTime(userCases.filter(c => c.status === 'closed')),
      closure_rate: userCases.length > 0 ? (userCases.filter(c => c.status === 'closed').length / userCases.length * 100).toFixed(1) : 0
    }
    
    await db.logAction(userPayload.user_id, 'view_case_stats', 'system', null)
    
    return c.json(createApiResponse(stats, null, requestId))
    
  } catch (error) {
    console.error('Case stats error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Demo endpoint to create sample cases
caseRoutes.post('/demo/create-sample-cases', async (c) => {
  const requestId = `demo_cases_${Date.now()}`
  
  try {
    const db = new DatabaseService(c.env.DB)
    
    // Get existing entities for demo cases
    const entities = await db.getEntities({}, 10)
    if (entities.length === 0) {
      return c.json(createApiResponse(null, 'No entities found. Create entities first.', requestId), 400)
    }
    
    const sampleCases = [
      {
        entity_id: entities[0]?.id,
        case_type: 'compliance_review' as CaseType,
        priority: 'medium' as CasePriority,
        title: 'Quarterly Capital Adequacy Review',
        description: 'Review of Q3 capital adequacy ratios showing decline from previous quarter',
        assigned_to: 'regulator@osfi.ca',
        created_by: 'admin@cfrp.ca'
      },
      {
        entity_id: entities[1]?.id,
        case_type: 'investigation' as CaseType,
        priority: 'high' as CasePriority,
        title: 'Consumer Complaint Investigation',
        description: 'Multiple complaints regarding unauthorized fees charged to customer accounts',
        assigned_to: 'regulator@fcac.ca',
        created_by: 'admin@cfrp.ca'
      },
      {
        entity_id: entities[0]?.id,
        case_type: 'enforcement' as CaseType,
        priority: 'urgent' as CasePriority,
        title: 'Regulatory Breach - Reporting Delays',
        description: 'Persistent delays in mandatory regulatory reporting submissions',
        assigned_to: 'regulator@osfi.ca',
        created_by: 'admin@cfrp.ca'
      }
    ]
    
    const createdCases = []
    
    for (const caseData of sampleCases) {
      if (caseData.entity_id) {
        const newCase = await db.createCase({
          ...caseData,
          status: 'open',
          filing_id: undefined
        })
        createdCases.push(`${caseData.title} - ${entities.find(e => e.id === caseData.entity_id)?.name}`)
      }
    }
    
    return c.json(createApiResponse({
      message: 'Sample cases created',
      created_cases: createdCases
    }, null, requestId))
    
  } catch (error) {
    console.error('Demo cases error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Helper functions
function getCaseTypeDisplayName(type: CaseType): string {
  const displayNames = {
    'compliance_review': 'Compliance Review',
    'investigation': 'Investigation',
    'enforcement': 'Enforcement Action',
    'audit': 'Regulatory Audit',
    'inquiry': 'General Inquiry'
  }
  return displayNames[type] || type
}

function getPriorityDisplayName(priority: CasePriority): string {
  const displayNames = {
    'low': 'Low Priority',
    'medium': 'Medium Priority',
    'high': 'High Priority',
    'urgent': 'Urgent'
  }
  return displayNames[priority] || priority
}

function getStatusDisplayName(status: CaseStatus): string {
  const displayNames = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'pending_review': 'Pending Review',
    'closed': 'Closed',
    'escalated': 'Escalated'
  }
  return displayNames[status] || status
}

function calculateCaseAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - created.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function isOverdue(createdAt: string, priority: CasePriority, status: CaseStatus): boolean {
  if (status === 'closed') return false
  
  const ageDays = calculateCaseAge(createdAt)
  const slaThresholds = {
    'urgent': 1,
    'high': 5,
    'medium': 15,
    'low': 30
  }
  
  return ageDays > slaThresholds[priority]
}

function getEstimatedResolution(caseType: CaseType, priority: CasePriority): string {
  const baseDays = {
    'inquiry': 3,
    'compliance_review': 14,
    'audit': 30,
    'investigation': 45,
    'enforcement': 90
  }
  
  const priorityMultiplier = {
    'urgent': 0.5,
    'high': 0.7,
    'medium': 1,
    'low': 1.5
  }
  
  const estimated = Math.ceil(baseDays[caseType] * priorityMultiplier[priority])
  return `${estimated} days`
}

function calculateAvgResolutionTime(closedCases: any[]): string {
  if (closedCases.length === 0) return 'N/A'
  
  const totalDays = closedCases.reduce((sum, c) => {
    return sum + calculateCaseAge(c.created_at)
  }, 0)
  
  const avgDays = Math.round(totalDays / closedCases.length)
  return `${avgDays} days`
}

export { caseRoutes }