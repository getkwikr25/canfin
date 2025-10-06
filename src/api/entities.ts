import { Hono } from 'hono'
import { DatabaseService } from '../lib/database'
import { canAccessEntity } from '../lib/auth'
import { createApiResponse, validateRequiredFields, getEntityTypeDisplayName } from '../lib/utils'
import { CreateEntityRequest, EntityType, EntityStatus } from '../types'

const entityRoutes = new Hono()

// Get all entities
entityRoutes.get('/', async (c) => {
  const requestId = `get_entities_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const db = new DatabaseService(c.env.DB)
    
    // Parse query parameters
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = (page - 1) * limit
    
    // Build filters
    const filters: any = {}
    if (c.req.query('type')) filters.type = c.req.query('type')
    if (c.req.query('jurisdiction')) filters.jurisdiction = c.req.query('jurisdiction')
    if (c.req.query('status')) filters.status = c.req.query('status')
    if (c.req.query('search')) filters.search = c.req.query('search')
    
    // If user is institution admin, only show their entity
    if (userPayload.role === 'institution_admin' && userPayload.entity_id) {
      const entity = await db.getEntity(userPayload.entity_id)
      return c.json(createApiResponse([entity].filter(Boolean), null, requestId))
    }
    
    const entities = await db.getEntities(filters, limit, offset)
    
    // Add display names and format data
    const formattedEntities = entities.map(entity => ({
      ...entity,
      type_display: getEntityTypeDisplayName(entity.type),
      risk_level: entity.risk_score <= 3 ? 'Low' : 
                 entity.risk_score <= 6 ? 'Medium' : 
                 entity.risk_score <= 8 ? 'High' : 'Critical'
    }))
    
    return c.json(createApiResponse(formattedEntities, null, requestId))
    
  } catch (error) {
    console.error('Get entities error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get single entity by ID
entityRoutes.get('/:id', async (c) => {
  const requestId = `get_entity_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const db = new DatabaseService(c.env.DB)
    const entityId = parseInt(c.req.param('id'))
    
    if (!canAccessEntity(userPayload, entityId)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const entity = await db.getEntity(entityId)
    if (!entity) {
      return c.json(createApiResponse(null, 'Entity not found', requestId), 404)
    }
    
    // Get related filings count
    const filings = await db.getFilings({ entity_id: entityId }, 5) // Get recent 5
    
    const entityWithMetrics = {
      ...entity,
      type_display: getEntityTypeDisplayName(entity.type),
      risk_level: entity.risk_score <= 3 ? 'Low' : 
                 entity.risk_score <= 6 ? 'Medium' : 
                 entity.risk_score <= 8 ? 'High' : 'Critical',
      recent_filings: filings,
      total_filings: filings.length // In production, would get actual count
    }
    
    await db.logAction(userPayload.user_id, 'view_entity', 'entity', entityId)
    
    return c.json(createApiResponse(entityWithMetrics, null, requestId))
    
  } catch (error) {
    console.error('Get entity error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Create new entity (admin/regulator only)
entityRoutes.post('/', async (c) => {
  const requestId = `create_entity_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    if (!['admin', 'regulator'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const body = await c.req.json() as CreateEntityRequest
    const db = new DatabaseService(c.env.DB)
    
    // Validate input
    const errors = validateRequiredFields(body, ['name', 'type', 'jurisdiction', 'registration_number'])
    if (errors.length > 0) {
      return c.json(createApiResponse(null, 'Validation failed', requestId), 400)
    }
    
    // Validate entity type
    const validTypes: EntityType[] = ['bank', 'credit_union', 'insurer', 'investment_firm', 'trust_company']
    if (!validTypes.includes(body.type)) {
      return c.json(createApiResponse(null, 'Invalid entity type', requestId), 400)
    }
    
    // Check for duplicate registration number
    const existingEntities = await db.getEntities({ registration_number: body.registration_number })
    if (existingEntities.length > 0) {
      return c.json(createApiResponse(null, 'Registration number already exists', requestId), 409)
    }
    
    // Create entity with default values
    const newEntity = await db.createEntity({
      name: body.name,
      type: body.type,
      jurisdiction: body.jurisdiction,
      registration_number: body.registration_number,
      status: 'active' as EntityStatus,
      risk_score: 5.0 // Default medium risk
    })
    
    await db.logAction(userPayload.user_id, 'create_entity', 'entity', newEntity.id, { name: newEntity.name })
    
    const formattedEntity = {
      ...newEntity,
      type_display: getEntityTypeDisplayName(newEntity.type),
      risk_level: 'Medium'
    }
    
    return c.json(createApiResponse(formattedEntity, null, requestId), 201)
    
  } catch (error) {
    console.error('Create entity error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Update entity (admin/regulator only)
entityRoutes.put('/:id', async (c) => {
  const requestId = `update_entity_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    if (!['admin', 'regulator'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const entityId = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    
    // Check if entity exists
    const existingEntity = await db.getEntity(entityId)
    if (!existingEntity) {
      return c.json(createApiResponse(null, 'Entity not found', requestId), 404)
    }
    
    // Validate allowed updates
    const allowedUpdates = ['name', 'status', 'risk_score']
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
      const validStatuses: EntityStatus[] = ['active', 'inactive', 'suspended', 'under_review']
      if (!validStatuses.includes(updates.status)) {
        return c.json(createApiResponse(null, 'Invalid entity status', requestId), 400)
      }
    }
    
    // Validate risk score if being updated
    if (updates.risk_score !== undefined) {
      if (typeof updates.risk_score !== 'number' || updates.risk_score < 1 || updates.risk_score > 10) {
        return c.json(createApiResponse(null, 'Risk score must be between 1 and 10', requestId), 400)
      }
    }
    
    const updatedEntity = await db.updateEntity(entityId, updates)
    if (!updatedEntity) {
      return c.json(createApiResponse(null, 'Failed to update entity', requestId), 500)
    }
    
    await db.logAction(userPayload.user_id, 'update_entity', 'entity', entityId, updates)
    
    const formattedEntity = {
      ...updatedEntity,
      type_display: getEntityTypeDisplayName(updatedEntity.type),
      risk_level: updatedEntity.risk_score <= 3 ? 'Low' : 
                 updatedEntity.risk_score <= 6 ? 'Medium' : 
                 updatedEntity.risk_score <= 8 ? 'High' : 'Critical'
    }
    
    return c.json(createApiResponse(formattedEntity, null, requestId))
    
  } catch (error) {
    console.error('Update entity error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get entity dashboard metrics
entityRoutes.get('/:id/metrics', async (c) => {
  const requestId = `entity_metrics_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const db = new DatabaseService(c.env.DB)
    const entityId = parseInt(c.req.param('id'))
    
    if (!canAccessEntity(userPayload, entityId)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    // Get entity
    const entity = await db.getEntity(entityId)
    if (!entity) {
      return c.json(createApiResponse(null, 'Entity not found', requestId), 404)
    }
    
    // Get filings metrics
    const allFilings = await db.getFilings({ entity_id: entityId }, 1000) // Get all for metrics
    const pendingFilings = allFilings.filter(f => f.status === 'pending')
    const flaggedFilings = allFilings.filter(f => f.status === 'flagged')
    
    // Get cases metrics
    const allCases = await db.getCases({ entity_id: entityId }, 1000)
    const openCases = allCases.filter(c => ['open', 'in_progress'].includes(c.status))
    
    // Calculate average risk score from recent filings
    const recentFilings = allFilings.slice(0, 10) // Last 10 filings
    const avgRiskScore = recentFilings.length > 0 
      ? recentFilings.reduce((sum, f) => sum + (f.risk_score || 0), 0) / recentFilings.length 
      : entity.risk_score
    
    // Calculate compliance rate (simplified)
    const complianceRate = allFilings.length > 0 
      ? ((allFilings.length - flaggedFilings.length) / allFilings.length) * 100
      : 100
    
    const metrics = {
      entity_id: entityId,
      entity_name: entity.name,
      total_filings: allFilings.length,
      pending_filings: pendingFilings.length,
      flagged_filings: flaggedFilings.length,
      avg_risk_score: Number(avgRiskScore.toFixed(2)),
      compliance_rate: Number(complianceRate.toFixed(1)),
      open_cases: openCases.length,
      last_filing_date: allFilings.length > 0 ? allFilings[0].submitted_at : null,
      current_risk_score: entity.risk_score,
      risk_trend: 'stable' // In production, would calculate actual trend
    }
    
    await db.logAction(userPayload.user_id, 'view_entity_metrics', 'entity', entityId)
    
    return c.json(createApiResponse(metrics, null, requestId))
    
  } catch (error) {
    console.error('Entity metrics error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Demo endpoint to create sample entities
entityRoutes.post('/demo/create-sample-entities', async (c) => {
  const requestId = `demo_entities_${Date.now()}`
  
  try {
    const db = new DatabaseService(c.env.DB)
    
    const sampleEntities = [
      {
        name: 'Royal Bank of Canada',
        type: 'bank' as EntityType,
        jurisdiction: 'federal',
        registration_number: 'RBC-001',
        status: 'active' as EntityStatus,
        risk_score: 4.2
      },
      {
        name: 'Toronto-Dominion Bank',
        type: 'bank' as EntityType,
        jurisdiction: 'federal',
        registration_number: 'TD-002',
        status: 'active' as EntityStatus,
        risk_score: 3.8
      },
      {
        name: 'Desjardins Group',
        type: 'credit_union' as EntityType,
        jurisdiction: 'quebec',
        registration_number: 'DES-QC-001',
        status: 'active' as EntityStatus,
        risk_score: 5.1
      },
      {
        name: 'Manulife Financial Corporation',
        type: 'insurer' as EntityType,
        jurisdiction: 'federal',
        registration_number: 'MFC-INS-001',
        status: 'active' as EntityStatus,
        risk_score: 6.2
      },
      {
        name: 'Questrade Inc.',
        type: 'investment_firm' as EntityType,
        jurisdiction: 'ontario',
        registration_number: 'QT-ON-001',
        status: 'active' as EntityStatus,
        risk_score: 7.3
      }
    ]
    
    const createdEntities = []
    
    for (const entityData of sampleEntities) {
      // Check if entity already exists by registration number
      const existing = await db.getEntities({ registration_number: entityData.registration_number })
      if (existing.length === 0) {
        const entity = await db.createEntity(entityData)
        createdEntities.push(entity.name)
      }
    }
    
    return c.json(createApiResponse({
      message: 'Sample entities created',
      created_entities: createdEntities
    }, null, requestId))
    
  } catch (error) {
    console.error('Demo entities error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

export { entityRoutes }