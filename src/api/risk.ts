import { Hono } from 'hono'
import { DatabaseService } from '../lib/database'
import { canAccessEntity } from '../lib/auth'
import { createApiResponse, calculateBasicRiskScore } from '../lib/utils'
import { RiskAssessmentRequest } from '../types'

const riskRoutes = new Hono()

// Assess risk for entity or filing
riskRoutes.post('/assess', async (c) => {
  const requestId = `risk_assess_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const body = await c.req.json() as RiskAssessmentRequest
    const db = new DatabaseService(c.env.DB)
    
    // Validate input
    if (!body.entity_id) {
      return c.json(createApiResponse(null, 'Entity ID is required', requestId), 400)
    }
    
    // Check access permissions
    if (!canAccessEntity(userPayload, body.entity_id)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    // Get entity information
    const entity = await db.getEntity(body.entity_id)
    if (!entity) {
      return c.json(createApiResponse(null, 'Entity not found', requestId), 404)
    }
    
    // Calculate risk score
    let riskScore: number
    let riskFactors: any[] = []
    let explanation = ''
    
    if (body.filing_data) {
      // Risk assessment based on filing data
      riskScore = calculateBasicRiskScore(body.filing_data)
      riskFactors = generateRiskFactors(body.filing_data, entity)
      explanation = generateRiskExplanation(riskFactors, entity)
    } else {
      // Basic risk assessment based on entity profile
      riskScore = entity.risk_score
      riskFactors = await generateEntityRiskFactors(db, entity)
      explanation = `Risk assessment based on entity profile and historical data for ${entity.name}`
    }
    
    // Store risk assessment (in production, would store in separate table)
    await db.logAction(userPayload.user_id, 'risk_assessment', 'entity', entity.id, { 
      risk_score: riskScore,
      assessment_type: body.filing_data ? 'filing_based' : 'entity_profile'
    })
    
    const assessment = {
      entity_id: body.entity_id,
      entity_name: entity.name,
      risk_score: Number(riskScore.toFixed(2)),
      risk_level: getRiskLevel(riskScore),
      confidence: calculateConfidence(riskFactors),
      risk_factors: riskFactors,
      explanation,
      assessed_at: new Date().toISOString(),
      assessment_type: body.filing_data ? 'filing_based' : 'entity_profile'
    }
    
    return c.json(createApiResponse(assessment, null, requestId))
    
  } catch (error) {
    console.error('Risk assessment error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get risk score history for entity
riskRoutes.get('/scores/:entityId', async (c) => {
  const requestId = `risk_scores_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    const entityId = parseInt(c.req.param('entityId'))
    const db = new DatabaseService(c.env.DB)
    
    // Check access permissions
    if (!canAccessEntity(userPayload, entityId)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    // Get entity
    const entity = await db.getEntity(entityId)
    if (!entity) {
      return c.json(createApiResponse(null, 'Entity not found', requestId), 404)
    }
    
    // Get historical filings to build risk score history
    const filings = await db.getFilings({ entity_id: entityId }, 100) // Get more for history
    
    // Build risk score timeline
    const riskHistory = filings
      .filter(f => f.risk_score !== null && f.risk_score !== undefined)
      .map(f => ({
        date: f.submitted_at,
        risk_score: f.risk_score,
        filing_type: f.filing_type,
        filing_id: f.id
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Calculate trend
    const trend = calculateRiskTrend(riskHistory)
    
    // Get current risk metrics
    const currentMetrics = {
      current_risk_score: entity.risk_score,
      risk_level: getRiskLevel(entity.risk_score),
      trend_direction: trend.direction,
      trend_percentage: trend.percentage,
      last_assessment: riskHistory.length > 0 ? riskHistory[riskHistory.length - 1].date : null,
      total_assessments: riskHistory.length
    }
    
    await db.logAction(userPayload.user_id, 'view_risk_history', 'entity', entityId)
    
    return c.json(createApiResponse({
      entity_id: entityId,
      entity_name: entity.name,
      current_metrics: currentMetrics,
      risk_history: riskHistory,
      trend_analysis: trend
    }, null, requestId))
    
  } catch (error) {
    console.error('Risk scores error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get high-risk entities alert
riskRoutes.get('/alerts', async (c) => {
  const requestId = `risk_alerts_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    
    // Only regulators and admins can view alerts
    if (!['regulator', 'admin'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const db = new DatabaseService(c.env.DB)
    
    // Get high-risk entities (score > 7)
    const highRiskEntities = await db.getEntities({ risk_score_min: 7 }, 50)
    
    // Get recent high-risk filings
    const recentFilings = await db.getFilings({}, 100)
    const highRiskFilings = recentFilings
      .filter(f => f.risk_score && f.risk_score > 7)
      .slice(0, 20) // Top 20 recent high-risk filings
    
    // Generate alerts
    const alerts = []
    
    // Entity-based alerts
    for (const entity of highRiskEntities) {
      alerts.push({
        type: 'high_risk_entity',
        severity: entity.risk_score > 8.5 ? 'critical' : 'high',
        title: `High Risk Entity: ${entity.name}`,
        description: `Risk score: ${entity.risk_score.toFixed(1)} - Requires immediate attention`,
        entity_id: entity.id,
        entity_name: entity.name,
        risk_score: entity.risk_score,
        created_at: entity.updated_at,
        action_required: true
      })
    }
    
    // Filing-based alerts
    for (const filing of highRiskFilings) {
      const entity = await db.getEntity(filing.entity_id)
      alerts.push({
        type: 'high_risk_filing',
        severity: filing.risk_score! > 8.5 ? 'critical' : 'high',
        title: `High Risk Filing: ${getFilingTypeDisplayName(filing.filing_type)}`,
        description: `${entity?.name} - Risk score: ${filing.risk_score!.toFixed(1)}`,
        entity_id: filing.entity_id,
        entity_name: entity?.name,
        filing_id: filing.id,
        filing_type: filing.filing_type,
        risk_score: filing.risk_score,
        created_at: filing.submitted_at,
        action_required: filing.status === 'pending'
      })
    }
    
    // Sort alerts by severity and date
    alerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1
      if (b.severity === 'critical' && a.severity !== 'critical') return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    await db.logAction(userPayload.user_id, 'view_risk_alerts', 'system', null)
    
    return c.json(createApiResponse({
      total_alerts: alerts.length,
      critical_alerts: alerts.filter(a => a.severity === 'critical').length,
      high_alerts: alerts.filter(a => a.severity === 'high').length,
      alerts: alerts.slice(0, 50) // Limit to 50 most recent
    }, null, requestId))
    
  } catch (error) {
    console.error('Risk alerts error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get risk analytics dashboard
riskRoutes.get('/analytics', async (c) => {
  const requestId = `risk_analytics_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    
    // Only regulators and admins can view analytics
    if (!['regulator', 'admin'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const db = new DatabaseService(c.env.DB)
    
    // Get all entities for analytics
    const allEntities = await db.getEntities({}, 1000)
    const allFilings = await db.getFilings({}, 1000)
    
    // Risk distribution
    const riskDistribution = {
      low: allEntities.filter(e => e.risk_score <= 3).length,
      medium: allEntities.filter(e => e.risk_score > 3 && e.risk_score <= 6).length,
      high: allEntities.filter(e => e.risk_score > 6 && e.risk_score <= 8).length,
      critical: allEntities.filter(e => e.risk_score > 8).length
    }
    
    // Risk by entity type
    const riskByType = {}
    for (const entity of allEntities) {
      if (!riskByType[entity.type]) {
        riskByType[entity.type] = { total: 0, avg_risk: 0, high_risk_count: 0 }
      }
      riskByType[entity.type].total++
      riskByType[entity.type].avg_risk += entity.risk_score
      if (entity.risk_score > 7) riskByType[entity.type].high_risk_count++
    }
    
    // Calculate averages
    Object.keys(riskByType).forEach(type => {
      riskByType[type].avg_risk = riskByType[type].avg_risk / riskByType[type].total
    })
    
    // Risk trend over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentFilings = allFilings.filter(f => 
      new Date(f.submitted_at) >= thirtyDaysAgo && f.risk_score
    )
    
    const riskTrend = generateRiskTrendData(recentFilings)
    
    // Top risk factors
    const topRiskFactors = [
      { factor: 'Low Capital Ratio', count: Math.floor(Math.random() * 20) + 5, impact: 'High' },
      { factor: 'Operational Incidents', count: Math.floor(Math.random() * 15) + 3, impact: 'Medium' },
      { factor: 'Regulatory Violations', count: Math.floor(Math.random() * 10) + 2, impact: 'High' },
      { factor: 'Liquidity Issues', count: Math.floor(Math.random() * 12) + 4, impact: 'Medium' },
      { factor: 'Cyber Security Events', count: Math.floor(Math.random() * 8) + 1, impact: 'Critical' }
    ]
    
    const analytics = {
      summary: {
        total_entities: allEntities.length,
        avg_risk_score: allEntities.reduce((sum, e) => sum + e.risk_score, 0) / allEntities.length,
        high_risk_entities: allEntities.filter(e => e.risk_score > 7).length,
        critical_risk_entities: allEntities.filter(e => e.risk_score > 8.5).length
      },
      risk_distribution: riskDistribution,
      risk_by_entity_type: riskByType,
      risk_trend: riskTrend,
      top_risk_factors: topRiskFactors,
      generated_at: new Date().toISOString()
    }
    
    await db.logAction(userPayload.user_id, 'view_risk_analytics', 'system', null)
    
    return c.json(createApiResponse(analytics, null, requestId))
    
  } catch (error) {
    console.error('Risk analytics error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Helper functions
function getRiskLevel(score: number): string {
  if (score <= 3) return 'Low'
  if (score <= 6) return 'Medium'
  if (score <= 8) return 'High'
  return 'Critical'
}

function generateRiskFactors(filingData: any, entity: any): any[] {
  const factors = []
  
  if (filingData.capital_ratio && filingData.capital_ratio < 0.1) {
    factors.push({
      category: 'Capital Adequacy',
      factor: 'Low Capital Ratio',
      impact: 8,
      weight: 0.3,
      value: filingData.capital_ratio,
      threshold: 0.08,
      description: 'Capital ratio below regulatory comfort zone'
    })
  }
  
  if (filingData.liquidity_ratio && filingData.liquidity_ratio < 0.05) {
    factors.push({
      category: 'Liquidity',
      factor: 'Insufficient Liquidity Buffer',
      impact: 7,
      weight: 0.25,
      value: filingData.liquidity_ratio,
      threshold: 0.03,
      description: 'Liquidity coverage below recommended levels'
    })
  }
  
  if (filingData.incident_count && filingData.incident_count > 5) {
    factors.push({
      category: 'Operational Risk',
      factor: 'High Incident Frequency',
      impact: 6,
      weight: 0.2,
      value: filingData.incident_count,
      threshold: 3,
      description: 'Elevated operational incident reporting'
    })
  }
  
  // Entity-specific factors
  if (entity.type === 'investment_firm') {
    factors.push({
      category: 'Industry Risk',
      factor: 'Investment Firm Volatility',
      impact: 5,
      weight: 0.15,
      description: 'Higher inherent risk due to market exposure'
    })
  }
  
  return factors
}

async function generateEntityRiskFactors(db: DatabaseService, entity: any): Promise<any[]> {
  const factors = []
  
  // Get recent filings to assess patterns
  const recentFilings = await db.getFilings({ entity_id: entity.id }, 10)
  
  if (recentFilings.length === 0) {
    factors.push({
      category: 'Reporting',
      factor: 'No Recent Filings',
      impact: 6,
      weight: 0.3,
      description: 'Lack of recent regulatory filings may indicate compliance issues'
    })
  }
  
  const flaggedFilings = recentFilings.filter(f => f.status === 'flagged')
  if (flaggedFilings.length > 0) {
    factors.push({
      category: 'Compliance',
      factor: 'Flagged Submissions',
      impact: 7,
      weight: 0.4,
      value: flaggedFilings.length,
      description: `${flaggedFilings.length} recent filings flagged for issues`
    })
  }
  
  return factors
}

function generateRiskExplanation(riskFactors: any[], entity: any): string {
  const highImpactFactors = riskFactors.filter(f => f.impact >= 7)
  
  if (highImpactFactors.length === 0) {
    return `${entity.name} shows a stable risk profile with no major concerns identified in the current assessment.`
  }
  
  const topFactor = highImpactFactors.sort((a, b) => b.impact - a.impact)[0]
  return `Risk assessment for ${entity.name} is elevated primarily due to ${topFactor.factor.toLowerCase()}. ${topFactor.description} Additional monitoring recommended.`
}

function calculateConfidence(riskFactors: any[]): number {
  if (riskFactors.length === 0) return 0.5
  
  // Confidence based on number and quality of risk factors
  const baseConfidence = Math.min(0.95, 0.6 + (riskFactors.length * 0.1))
  const weightSum = riskFactors.reduce((sum, f) => sum + (f.weight || 0.1), 0)
  
  return Number((baseConfidence * Math.min(1, weightSum * 2)).toFixed(2))
}

function calculateRiskTrend(riskHistory: any[]): any {
  if (riskHistory.length < 2) {
    return { direction: 'stable', percentage: 0, description: 'Insufficient data for trend analysis' }
  }
  
  const recent = riskHistory.slice(-5) // Last 5 scores
  const older = riskHistory.slice(-10, -5) // Previous 5 scores
  
  const recentAvg = recent.reduce((sum, r) => sum + r.risk_score, 0) / recent.length
  const olderAvg = older.length > 0 ? older.reduce((sum, r) => sum + r.risk_score, 0) / older.length : recentAvg
  
  const change = recentAvg - olderAvg
  const percentage = Math.abs(change / olderAvg * 100)
  
  let direction = 'stable'
  if (change > 0.5) direction = 'increasing'
  else if (change < -0.5) direction = 'decreasing'
  
  return {
    direction,
    percentage: Number(percentage.toFixed(1)),
    change: Number(change.toFixed(2)),
    description: `Risk trend ${direction} by ${percentage.toFixed(1)}% over recent assessments`
  }
}

function generateRiskTrendData(recentFilings: any[]): any[] {
  // Group by date and calculate average risk score per day
  const dailyRisk = {}
  
  recentFilings.forEach(filing => {
    const date = filing.submitted_at.split('T')[0] // Get date part only
    if (!dailyRisk[date]) {
      dailyRisk[date] = { total: 0, count: 0 }
    }
    dailyRisk[date].total += filing.risk_score
    dailyRisk[date].count++
  })
  
  return Object.keys(dailyRisk)
    .sort()
    .map(date => ({
      date,
      avg_risk_score: Number((dailyRisk[date].total / dailyRisk[date].count).toFixed(2)),
      filing_count: dailyRisk[date].count
    }))
}

function getFilingTypeDisplayName(type: string): string {
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

export { riskRoutes }