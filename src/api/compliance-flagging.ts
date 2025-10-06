import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Compliance flag definitions and thresholds
const COMPLIANCE_FLAGS = {
  // Capital adequacy flags
  'capital_inadequacy': {
    severity: 'critical',
    conditions: [
      { field: 'tier1_ratio', operator: '<', threshold: 0.08, message: 'Tier 1 capital below regulatory minimum' },
      { field: 'total_capital_ratio', operator: '<', threshold: 0.10, message: 'Total capital below regulatory minimum' }
    ],
    regulatory_impact: 'immediate_action_required',
    escalation_required: true
  },
  
  // Liquidity flags
  'liquidity_concern': {
    severity: 'high',
    conditions: [
      { field: 'liquidity_coverage_ratio', operator: '<', threshold: 1.0, message: 'LCR below 100% minimum' },
      { field: 'net_stable_funding_ratio', operator: '<', threshold: 1.0, message: 'NSFR below 100% minimum' }
    ],
    regulatory_impact: 'enhanced_monitoring',
    escalation_required: true
  },
  
  // Operational flags
  'operational_risk': {
    severity: 'medium',
    conditions: [
      { field: 'consumer_complaints', operator: '>', threshold: 100, message: 'High consumer complaint volume' },
      { field: 'operational_losses', operator: '>', threshold: 10000000, message: 'Significant operational losses' },
      { field: 'staff_turnover_rate', operator: '>', threshold: 0.25, message: 'High staff turnover indicates operational stress' }
    ],
    regulatory_impact: 'investigation_recommended',
    escalation_required: false
  },
  
  // Growth and change flags
  'rapid_growth': {
    severity: 'medium',
    conditions: [
      { field: 'asset_growth_rate', operator: '>', threshold: 0.30, message: 'Rapid asset growth may indicate risk' },
      { field: 'loan_growth_rate', operator: '>', threshold: 0.40, message: 'Aggressive lending growth' }
    ],
    regulatory_impact: 'enhanced_supervision',
    escalation_required: false
  },
  
  // Market conduct flags
  'conduct_concern': {
    severity: 'high',
    conditions: [
      { field: 'mis_selling_incidents', operator: '>', threshold: 10, message: 'Multiple mis-selling incidents reported' },
      { field: 'regulatory_breaches', operator: '>', threshold: 3, message: 'Multiple regulatory breaches' },
      { field: 'consumer_redress', operator: '>', threshold: 1000000, message: 'Significant consumer redress payments' }
    ],
    regulatory_impact: 'enforcement_consideration',
    escalation_required: true
  }
}

// Real-time compliance flagging
app.post('/flag-check', async (c) => {
  const { env } = c
  const submissionData = await c.req.json()
  
  const flaggingStart = Date.now()
  
  try {
    // Run all compliance checks
    const flagResults = []
    const activeFlags = []
    
    for (const [flagType, flagConfig] of Object.entries(COMPLIANCE_FLAGS)) {
      const flagResult = await checkComplianceFlag(flagType, flagConfig, submissionData)
      flagResults.push(flagResult)
      
      if (flagResult.triggered) {
        activeFlags.push(flagResult)
        
        // Store flag in database
        await storeComplianceFlag(env, submissionData, flagResult)
        
        // Auto-escalate if required
        if (flagConfig.escalation_required) {
          await createEscalation(env, submissionData, flagResult)
        }
      }
    }
    
    // Calculate overall compliance status
    const overallStatus = calculateOverallStatus(activeFlags)
    
    // Generate immediate actions
    const immediateActions = generateImmediateActions(activeFlags)
    
    // Store compliance check results
    const checkId = await storeComplianceCheck(env, submissionData, {
      flags_checked: flagResults.length,
      flags_triggered: activeFlags.length,
      overall_status: overallStatus,
      processing_time: Date.now() - flaggingStart,
      active_flags: activeFlags
    })
    
    return c.json({
      success: true,
      data: {
        compliance_check_id: checkId,
        overall_status: overallStatus,
        flags_triggered: activeFlags.length,
        active_flags: activeFlags.map(f => ({
          type: f.type,
          severity: f.severity,
          message: f.message,
          regulatory_impact: f.regulatory_impact,
          escalation_required: f.escalation_required
        })),
        immediate_actions: immediateActions,
        processing_time_ms: Date.now() - flaggingStart
      }
    })
    
  } catch (error) {
    console.error('Compliance flagging error:', error)
    return c.json({ success: false, error: 'Compliance check failed' })
  }
})

// Get entity compliance history
app.get('/flags/entity/:entityId', async (c) => {
  const { env } = c
  const entityId = c.req.param('entityId')
  
  const flags = await env.DB.prepare(`
    SELECT cf.*, cc.submitted_at
    FROM compliance_flags cf
    JOIN compliance_checks cc ON cf.check_id = cc.id
    WHERE cf.entity_id = ?
    ORDER BY cf.created_at DESC
    LIMIT 50
  `).bind(entityId).all()
  
  const summary = await calculateEntityComplianceSummary(env, entityId)
  
  return c.json({
    success: true,
    data: {
      entity_id: entityId,
      compliance_history: flags.results,
      summary
    }
  })
})

// Agency compliance dashboard
app.get('/dashboard/:agency', async (c) => {
  const { env } = c
  const agency = c.req.param('agency')
  
  // Current critical flags requiring immediate attention
  const criticalFlags = await env.DB.prepare(`
    SELECT cf.*, e.entity_name, cc.submitted_at
    FROM compliance_flags cf
    JOIN entities e ON cf.entity_id = e.id
    JOIN compliance_checks cc ON cf.check_id = cc.id
    WHERE cf.severity = 'critical' 
    AND cf.status = 'active'
    AND (e.primary_regulator = ? OR e.jurisdiction_regulators LIKE '%' || ? || '%')
    ORDER BY cf.created_at DESC
  `).bind(agency, agency).all()
  
  // High-priority flags
  const highPriorityFlags = await env.DB.prepare(`
    SELECT cf.*, e.entity_name, cc.submitted_at
    FROM compliance_flags cf
    JOIN entities e ON cf.entity_id = e.id
    JOIN compliance_checks cc ON cf.check_id = cc.id
    WHERE cf.severity = 'high' 
    AND cf.status = 'active'
    AND (e.primary_regulator = ? OR e.jurisdiction_regulators LIKE '%' || ? || '%')
    ORDER BY cf.created_at DESC
    LIMIT 20
  `).bind(agency, agency).all()
  
  // Compliance trends
  const trends = await calculateComplianceTrends(env, agency)
  
  // Escalations requiring action
  const escalations = await env.DB.prepare(`
    SELECT e.*, cf.flag_type, ent.entity_name
    FROM compliance_escalations e
    JOIN compliance_flags cf ON e.flag_id = cf.id
    JOIN entities ent ON cf.entity_id = ent.id
    WHERE e.assigned_agency = ? AND e.status = 'pending'
    ORDER BY e.created_at ASC
  `).bind(agency).all()
  
  return c.json({
    success: true,
    data: {
      agency,
      critical_flags: criticalFlags.results,
      high_priority_flags: highPriorityFlags.results,
      compliance_trends: trends,
      pending_escalations: escalations.results,
      dashboard_metrics: {
        total_critical: criticalFlags.results.length,
        total_high_priority: highPriorityFlags.results.length,
        pending_escalations: escalations.results.length
      }
    }
  })
})

// Update flag status
app.post('/flags/:flagId/update', async (c) => {
  const { env } = c
  const flagId = c.req.param('flagId')
  const { status, resolution_notes, resolved_by } = await c.req.json()
  
  try {
    await env.DB.prepare(`
      UPDATE compliance_flags 
      SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, resolution_notes, resolved_by, flagId).run()
    
    // If flag is resolved, close any related escalations
    if (status === 'resolved') {
      await env.DB.prepare(`
        UPDATE compliance_escalations 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE flag_id = ?
      `).bind(flagId).run()
    }
    
    return c.json({
      success: true,
      data: { flag_updated: true }
    })
    
  } catch (error) {
    console.error('Flag update error:', error)
    return c.json({ success: false, error: 'Failed to update flag' })
  }
})

// Helper functions
async function checkComplianceFlag(flagType: string, flagConfig: any, data: any) {
  const result = {
    type: flagType,
    severity: flagConfig.severity,
    triggered: false,
    conditions_met: [],
    message: '',
    regulatory_impact: flagConfig.regulatory_impact,
    escalation_required: flagConfig.escalation_required
  }
  
  for (const condition of flagConfig.conditions) {
    const fieldValue = parseFloat(data[condition.field] || 0)
    let conditionMet = false
    
    switch (condition.operator) {
      case '<':
        conditionMet = fieldValue < condition.threshold
        break
      case '>':
        conditionMet = fieldValue > condition.threshold
        break
      case '<=':
        conditionMet = fieldValue <= condition.threshold
        break
      case '>=':
        conditionMet = fieldValue >= condition.threshold
        break
      case '==':
        conditionMet = fieldValue === condition.threshold
        break
    }
    
    if (conditionMet) {
      result.conditions_met.push({
        field: condition.field,
        value: fieldValue,
        threshold: condition.threshold,
        message: condition.message
      })
      result.triggered = true
    }
  }
  
  if (result.triggered) {
    result.message = result.conditions_met.map(c => c.message).join('; ')
  }
  
  return result
}

async function storeComplianceFlag(env: any, submissionData: any, flagResult: any) {
  const result = await env.DB.prepare(`
    INSERT INTO compliance_flags (
      entity_id, check_id, flag_type, severity, message,
      conditions_met, regulatory_impact, escalation_required,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
  `).bind(
    submissionData.entity_id,
    submissionData.check_id || null,
    flagResult.type,
    flagResult.severity,
    flagResult.message,
    JSON.stringify(flagResult.conditions_met),
    flagResult.regulatory_impact,
    flagResult.escalation_required ? 1 : 0
  ).run()
  
  return result.meta.last_row_id
}

async function createEscalation(env: any, submissionData: any, flagResult: any) {
  // Determine which agency should handle the escalation
  const assignedAgency = determineEscalationAgency(flagResult.type, submissionData.entity_jurisdiction)
  
  const result = await env.DB.prepare(`
    INSERT INTO compliance_escalations (
      flag_id, entity_id, escalation_type, assigned_agency,
      priority, description, status, created_at
    ) VALUES (?, ?, 'compliance_violation', ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
  `).bind(
    flagResult.flag_id,
    submissionData.entity_id,
    assignedAgency,
    flagResult.severity === 'critical' ? 'urgent' : 'high',
    `${flagResult.type}: ${flagResult.message}`
  ).run()
  
  // Send notification to assigned agency
  await env.DB.prepare(`
    INSERT INTO workflow_notifications (
      recipient_agency, notification_type, title, message, sent_at
    ) VALUES (?, 'compliance_escalation', ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    assignedAgency,
    `Compliance Escalation: ${flagResult.type}`,
    `Entity ${submissionData.entity_name} has triggered a ${flagResult.severity} compliance flag requiring immediate attention.`
  ).run()
  
  return result.meta.last_row_id
}

function determineEscalationAgency(flagType: string, jurisdiction: string) {
  // Routing logic for different flag types
  switch (flagType) {
    case 'capital_inadequacy':
    case 'liquidity_concern':
      return 'osfi' // Prudential supervision
      
    case 'conduct_concern':
      return 'fcac' // Consumer protection
      
    case 'operational_risk':
      // Route based on jurisdiction
      if (jurisdiction === 'ontario') return 'fsra'
      if (jurisdiction === 'quebec') return 'amf'
      return 'osfi'
      
    default:
      return 'osfi' // Default to federal regulator
  }
}

function calculateOverallStatus(activeFlags: any[]) {
  if (activeFlags.some(f => f.severity === 'critical')) {
    return 'non_compliant'
  } else if (activeFlags.some(f => f.severity === 'high')) {
    return 'review_required'
  } else if (activeFlags.some(f => f.severity === 'medium')) {
    return 'monitoring_required'
  } else {
    return 'compliant'
  }
}

function generateImmediateActions(activeFlags: any[]) {
  const actions = []
  
  for (const flag of activeFlags) {
    switch (flag.severity) {
      case 'critical':
        actions.push(`IMMEDIATE: Address ${flag.type} - ${flag.message}`)
        actions.push('Notify senior management and board')
        actions.push('Prepare remediation plan within 24 hours')
        break
        
      case 'high':
        actions.push(`URGENT: Review ${flag.type} - ${flag.message}`)
        actions.push('Schedule meeting with compliance team')
        break
        
      case 'medium':
        actions.push(`MONITOR: ${flag.type} - ${flag.message}`)
        break
    }
    
    if (flag.escalation_required) {
      actions.push(`Contact regulator regarding ${flag.type}`)
    }
  }
  
  return [...new Set(actions)] // Remove duplicates
}

async function storeComplianceCheck(env: any, submissionData: any, checkResults: any) {
  const result = await env.DB.prepare(`
    INSERT INTO compliance_checks (
      entity_id, filing_id, check_results, flags_triggered,
      overall_status, processing_time_ms, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    submissionData.entity_id,
    submissionData.filing_id || null,
    JSON.stringify(checkResults),
    checkResults.flags_triggered,
    checkResults.overall_status,
    checkResults.processing_time
  ).run()
  
  return result.meta.last_row_id
}

async function calculateEntityComplianceSummary(env: any, entityId: string) {
  const totalFlags = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM compliance_flags WHERE entity_id = ?
  `).bind(entityId).first()
  
  const activeFlags = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM compliance_flags 
    WHERE entity_id = ? AND status = 'active'
  `).bind(entityId).first()
  
  const criticalFlags = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM compliance_flags 
    WHERE entity_id = ? AND severity = 'critical' AND status = 'active'
  `).bind(entityId).first()
  
  return {
    total_flags: totalFlags.count,
    active_flags: activeFlags.count,
    critical_flags: criticalFlags.count,
    compliance_score: calculateComplianceScore(totalFlags.count, activeFlags.count, criticalFlags.count)
  }
}

async function calculateComplianceTrends(env: any, agency: string) {
  const monthlyTrends = await env.DB.prepare(`
    SELECT 
      DATE(cf.created_at, 'start of month') as month,
      COUNT(*) as flag_count,
      COUNT(CASE WHEN cf.severity = 'critical' THEN 1 END) as critical_count,
      COUNT(CASE WHEN cf.severity = 'high' THEN 1 END) as high_count
    FROM compliance_flags cf
    JOIN entities e ON cf.entity_id = e.id
    WHERE (e.primary_regulator = ? OR e.jurisdiction_regulators LIKE '%' || ? || '%')
    AND cf.created_at >= date('now', '-12 months')
    GROUP BY DATE(cf.created_at, 'start of month')
    ORDER BY month DESC
  `).bind(agency, agency).all()
  
  return monthlyTrends.results
}

function calculateComplianceScore(totalFlags: number, activeFlags: number, criticalFlags: number) {
  let score = 100
  
  // Deduct points for active flags
  score -= (activeFlags * 5)
  
  // Extra deduction for critical flags
  score -= (criticalFlags * 15)
  
  // Historical penalty
  score -= Math.min(totalFlags * 2, 30)
  
  return Math.max(score, 0)
}

export default app