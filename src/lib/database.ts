import { D1Database } from '@cloudflare/workers-types'
import { Entity, Filing, User, Case, RiskAssessment } from '../types'

// Database query utilities
export class DatabaseService {
  constructor(private db: D1Database) {}

  // Entity operations
  async createEntity(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Promise<Entity> {
    // Insert the entity
    const insertResult = await this.db.prepare(`
      INSERT INTO entities (name, type, jurisdiction, registration_number, status, risk_score)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      entity.name,
      entity.type,
      entity.jurisdiction,
      entity.registration_number,
      entity.status || 'active',
      entity.risk_score || 5.0
    ).run()

    if (!insertResult.success) {
      throw new Error('Failed to create entity')
    }

    // Get the inserted entity by ID
    const entityId = insertResult.meta.last_row_id
    const result = await this.db.prepare(`
      SELECT * FROM entities WHERE id = ?
    `).bind(entityId).first<Entity>()

    if (!result) {
      throw new Error('Failed to retrieve created entity')
    }
    return result
  }

  async getEntity(id: number): Promise<Entity | null> {
    return await this.db.prepare(`
      SELECT * FROM entities WHERE id = ?
    `).bind(id).first<Entity>()
  }

  async getEntities(filters: any = {}, limit: number = 50, offset: number = 0): Promise<Entity[]> {
    let query = 'SELECT * FROM entities WHERE 1=1'
    const params: any[] = []

    if (filters.type) {
      query += ' AND type = ?'
      params.push(filters.type)
    }
    if (filters.jurisdiction) {
      query += ' AND jurisdiction = ?'
      params.push(filters.jurisdiction)
    }
    if (filters.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }
    if (filters.search) {
      query += ' AND (name LIKE ? OR registration_number LIKE ?)'
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await this.db.prepare(query).bind(...params).all<Entity>()
    return result.results || []
  }

  async updateEntity(id: number, updates: Partial<Entity>): Promise<Entity | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id')
    if (fields.length === 0) return null

    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const params = fields.map(field => updates[field as keyof Entity])
    params.push(id)

    await this.db.prepare(`
      UPDATE entities SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(...params).run()

    return this.getEntity(id)
  }

  // Filing operations
  async createFiling(filing: Omit<Filing, 'id' | 'submitted_at'>): Promise<Filing> {
    // Insert the filing
    const insertResult = await this.db.prepare(`
      INSERT INTO filings (entity_id, filing_type, status, data, file_url, validation_errors, risk_score, reviewer_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      filing.entity_id,
      filing.filing_type,
      filing.status,
      JSON.stringify(filing.data),
      filing.file_url || null,
      JSON.stringify(filing.validation_errors || []),
      filing.risk_score,
      filing.reviewer_id || null
    ).run()

    if (!insertResult.success) {
      throw new Error('Failed to create filing')
    }

    // Get the inserted filing by ID
    const filingId = insertResult.meta.last_row_id
    const result = await this.db.prepare(`
      SELECT * FROM filings WHERE id = ?
    `).bind(filingId).first<Filing>()

    if (!result) {
      throw new Error('Failed to retrieve created filing')
    }
    return result
  }

  async getFiling(id: number): Promise<Filing | null> {
    const result = await this.db.prepare(`
      SELECT * FROM filings WHERE id = ?
    `).bind(id).first<Filing>()
    
    if (result) {
      // Parse JSON fields
      if (result.data) result.data = JSON.parse(result.data as string)
      if (result.validation_errors) result.validation_errors = JSON.parse(result.validation_errors as string)
    }
    
    return result
  }

  async getFilings(filters: any = {}, limit: number = 50, offset: number = 0): Promise<Filing[]> {
    let query = 'SELECT * FROM filings WHERE 1=1'
    const params: any[] = []

    if (filters.entity_id) {
      query += ' AND entity_id = ?'
      params.push(filters.entity_id)
    }
    if (filters.filing_type) {
      query += ' AND filing_type = ?'
      params.push(filters.filing_type)
    }
    if (filters.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }

    query += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await this.db.prepare(query).bind(...params).all<Filing>()
    const filings = result.results || []
    
    // Parse JSON fields for each filing
    filings.forEach(filing => {
      if (filing.data) filing.data = JSON.parse(filing.data as string)
      if (filing.validation_errors) filing.validation_errors = JSON.parse(filing.validation_errors as string)
    })
    
    return filings
  }

  async updateFiling(id: number, updates: Partial<Filing>): Promise<Filing | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'submitted_at')
    if (fields.length === 0) return null

    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const params = fields.map(field => {
      const value = updates[field as keyof Filing]
      // Stringify objects for JSON fields
      if (field === 'data' || field === 'validation_errors') {
        return JSON.stringify(value)
      }
      return value
    })
    params.push(id)

    await this.db.prepare(`
      UPDATE filings SET ${setClause} WHERE id = ?
    `).bind(...params).run()

    return this.getFiling(id)
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    // Insert the user
    const insertResult = await this.db.prepare(`
      INSERT INTO users (email, name, role, agency, entity_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user.email,
      user.name,
      user.role,
      user.agency || null,
      user.entity_id || null,
      user.is_active !== undefined ? user.is_active : true
    ).run()

    if (!insertResult.success) {
      throw new Error('Failed to create user')
    }

    // Get the inserted user by ID
    const userId = insertResult.meta.last_row_id
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first<User>()

    if (!result) {
      throw new Error('Failed to retrieve created user')
    }
    return result
  }

  async getUser(id: number): Promise<User | null> {
    return await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first<User>()
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first<User>()
  }

  async getUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const result = await this.db.prepare(`
      SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).bind(limit, offset).all<User>()
    return result.results || []
  }

  // Case operations
  async createCase(caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>): Promise<Case> {
    // Insert the case
    const insertResult = await this.db.prepare(`
      INSERT INTO cases (entity_id, filing_id, case_type, priority, status, title, description, assigned_to, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      caseData.entity_id,
      caseData.filing_id || null,
      caseData.case_type,
      caseData.priority || 'medium',
      caseData.status || 'open',
      caseData.title,
      caseData.description,
      caseData.assigned_to || null,
      caseData.created_by
    ).run()

    if (!insertResult.success) {
      throw new Error('Failed to create case')
    }

    // Get the inserted case by ID
    const caseId = insertResult.meta.last_row_id
    const result = await this.db.prepare(`
      SELECT * FROM cases WHERE id = ?
    `).bind(caseId).first<Case>()

    if (!result) {
      throw new Error('Failed to retrieve created case')
    }
    return result
  }

  async getCase(id: number): Promise<Case | null> {
    return await this.db.prepare(`
      SELECT * FROM cases WHERE id = ?
    `).bind(id).first<Case>()
  }

  async getCases(filters: any = {}, limit: number = 50, offset: number = 0): Promise<Case[]> {
    let query = 'SELECT * FROM cases WHERE 1=1'
    const params: any[] = []

    if (filters.entity_id) {
      query += ' AND entity_id = ?'
      params.push(filters.entity_id)
    }
    if (filters.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }
    if (filters.assigned_to) {
      query += ' AND assigned_to = ?'
      params.push(filters.assigned_to)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await this.db.prepare(query).bind(...params).all<Case>()
    return result.results || []
  }

  // Analytics queries
  async getDashboardMetrics(): Promise<any> {
    const [entitiesResult, filingsResult, casesResult] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as total FROM entities').first(),
      this.db.prepare(`SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        FROM filings`).first(),
      this.db.prepare(`SELECT 
        COUNT(CASE WHEN status IN ('open', 'in_progress') THEN 1 END) as open
        FROM cases`).first()
    ])

    return {
      total_entities: entitiesResult?.total || 0,
      total_filings: filingsResult?.total || 0,
      pending_filings: filingsResult?.pending || 0,
      open_cases: casesResult?.open || 0
    }
  }

  // Audit logging
  async logAction(userId: number, action: string, resource: string, resourceId?: number, metadata?: any): Promise<void> {
    await this.db.prepare(`
      INSERT INTO audit_logs (user_id, action, resource, resource_id, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      userId,
      action,
      resource,
      resourceId,
      JSON.stringify(metadata)
    ).run()
  }
}