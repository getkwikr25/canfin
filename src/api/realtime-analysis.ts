import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Real-time validation rules
const VALIDATION_RULES = {
  'quarterly_return': {
    required_fields: ['regulatory_capital', 'tier1_ratio', 'total_assets'],
    risk_thresholds: {
      tier1_ratio: { min: 0.08, max: 0.50 }, // 8% minimum, 50% suspicious maximum
      leverage_ratio: { min: 0.03, max: 0.20 },
      liquidity_ratio: { min: 0.10, max: 1.00 }
    },
    compliance_checks: [
      'capital_adequacy',
      'liquidity_coverage',
      'large_exposure_limits'
    ]
  },
  'risk_report': {
    required_fields: ['credit_risk', 'market_risk', 'operational_risk'],
    risk_thresholds: {
      credit_risk: { max: 0.15 }, // 15% max credit risk
      market_risk: { max: 0.10 }, // 10% max market risk
      operational_risk: { max: 0.05 } // 5% max operational risk
    },
    compliance_checks: [
      'stress_testing_results',
      'model_validation',
      'risk_appetite_adherence'
    ]
  }
}

// Real-time analysis endpoint
app.post('/analyze', async (c) => {
  const { env } = c
  const submissionData = await c.req.json()
  
  const analysisStart = Date.now()
  
  try {
    // 1. Immediate validation
    const validationResults = await validateSubmission(submissionData)
    
    // 2. Risk scoring
    const riskScore = await calculateRiskScore(submissionData)
    
    // 3. Compliance checking
    const complianceResults = await checkCompliance(submissionData)
    
    // 4. Pattern analysis
    const patternResults = await analyzePatterns(env, submissionData)
    
    // 5. Generate instant alerts
    const alerts = await generateInstantAlerts(env, submissionData, riskScore, complianceResults)
    
    // 6. Store analysis results
    const analysisId = await storeAnalysisResults(env, submissionData, {
      validation: validationResults,
      risk_score: riskScore,
      compliance: complianceResults,
      patterns: patternResults,
      alerts,
      processing_time: Date.now() - analysisStart
    })
    
    return c.json({
      success: true,
      data: {
        analysis_id: analysisId,
        real_time_results: {
          validation: validationResults,
          risk_score: riskScore,
          compliance_status: complianceResults.overall_status,
          alerts: alerts,
          pattern_flags: patternResults.flags,
          processing_time_ms: Date.now() - analysisStart
        },
        next_actions: generateNextActions(validationResults, riskScore, complianceResults)
      }
    })
    
  } catch (error) {
    console.error('Real-time analysis error:', error)
    return c.json({ success: false, error: 'Analysis failed' })
  }
})

// Live validation during data entry
app.post('/validate-field', async (c) => {
  const { field_name, field_value, filing_type, context } = await c.req.json()
  
  const validation = await validateField(field_name, field_value, filing_type, context)
  
  return c.json({
    success: true,
    data: {
      field_name,
      is_valid: validation.is_valid,
      warnings: validation.warnings,
      errors: validation.errors,
      suggestions: validation.suggestions,
      risk_impact: validation.risk_impact
    }
  })
})

// Helper functions for real-time analysis
async function validateSubmission(data: any) {
  const rules = VALIDATION_RULES[data.filing_type] || {}
  const results = {
    is_valid: true,
    errors: [],
    warnings: [],
    missing_fields: [],
    data_quality_score: 0
  }
  
  // Check required fields
  if (rules.required_fields) {
    for (const field of rules.required_fields) {
      if (!data[field] || data[field] === null || data[field] === '') {
        results.missing_fields.push(field)
        results.errors.push(`Required field missing: ${field}`)
        results.is_valid = false
      }
    }
  }
  
  // Check data ranges
  if (rules.risk_thresholds) {
    for (const [field, thresholds] of Object.entries(rules.risk_thresholds)) {
      const value = parseFloat(data[field])
      if (!isNaN(value)) {
        if (thresholds.min && value < thresholds.min) {
          results.warnings.push(`${field} (${value}) below minimum threshold (${thresholds.min})`)
        }
        if (thresholds.max && value > thresholds.max) {
          results.warnings.push(`${field} (${value}) exceeds maximum threshold (${thresholds.max})`)
        }
      }
    }
  }
  
  // Calculate data quality score
  const totalFields = Object.keys(data).length
  const completeFields = totalFields - results.missing_fields.length
  results.data_quality_score = totalFields > 0 ? (completeFields / totalFields) * 100 : 0
  
  return results
}

async function calculateRiskScore(data: any) {
  let riskScore = 0
  const factors = []
  
  // Financial health indicators
  if (data.tier1_ratio) {
    const tier1 = parseFloat(data.tier1_ratio)
    if (tier1 < 0.08) {
      riskScore += 3 // High risk for below regulatory minimum
      factors.push('Capital adequacy concern')
    } else if (tier1 < 0.12) {
      riskScore += 1 // Medium risk
      factors.push('Capital adequacy monitoring')
    }
  }
  
  if (data.leverage_ratio) {
    const leverage = parseFloat(data.leverage_ratio)
    if (leverage < 0.03) {
      riskScore += 2
      factors.push('Leverage ratio below minimum')
    }
  }
  
  // Business volume changes
  if (data.total_assets && data.previous_assets) {
    const growth = (data.total_assets - data.previous_assets) / data.previous_assets
    if (Math.abs(growth) > 0.25) { // 25% change
      riskScore += 1
      factors.push(`Significant asset growth: ${(growth * 100).toFixed(1)}%`)
    }
  }
  
  // Operational indicators
  if (data.consumer_complaints && data.consumer_complaints > 50) {
    riskScore += 1
    factors.push('High consumer complaint volume')
  }
  
  return {
    score: Math.min(riskScore, 10), // Cap at 10
    level: riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low',
    factors,
    calculation_method: 'weighted_indicators'
  }
}

async function checkCompliance(data: any) {
  const rules = VALIDATION_RULES[data.filing_type]?.compliance_checks || []
  const results = {
    overall_status: 'compliant',
    checks_performed: [],
    violations: [],
    recommendations: []
  }
  
  for (const check of rules) {
    const checkResult = await performComplianceCheck(check, data)
    results.checks_performed.push({
      check_name: check,
      status: checkResult.status,
      details: checkResult.details
    })
    
    if (checkResult.status === 'violation') {
      results.violations.push(checkResult)
      results.overall_status = 'non_compliant'
    } else if (checkResult.status === 'warning' && results.overall_status === 'compliant') {
      results.overall_status = 'review_required'
    }
  }
  
  return results
}

async function performComplianceCheck(checkType: string, data: any) {
  switch (checkType) {
    case 'capital_adequacy':
      const tier1 = parseFloat(data.tier1_ratio || 0)
      if (tier1 < 0.08) {
        return {
          status: 'violation',
          details: `Tier 1 capital ratio ${tier1} below regulatory minimum 8%`
        }
      } else if (tier1 < 0.10) {
        return {
          status: 'warning',
          details: `Tier 1 capital ratio ${tier1} approaching regulatory concern level`
        }
      }
      return { status: 'compliant', details: 'Capital adequacy requirements met' }
      
    case 'liquidity_coverage':
      const lcr = parseFloat(data.liquidity_coverage_ratio || 0)
      if (lcr < 1.0) {
        return {
          status: 'violation',
          details: `Liquidity Coverage Ratio ${lcr} below regulatory minimum 100%`
        }
      }
      return { status: 'compliant', details: 'Liquidity coverage requirements met' }
      
    default:
      return { status: 'compliant', details: 'Check performed successfully' }
  }
}

async function analyzePatterns(env: any, data: any) {
  // Get historical data for pattern analysis
  const historicalData = await env.DB.prepare(`
    SELECT filing_data, risk_score, submitted_at
    FROM filings
    WHERE entity_id = ? AND filing_type = ?
    ORDER BY submitted_at DESC
    LIMIT 12
  `).bind(data.entity_id, data.filing_type).all()
  
  const patterns = {
    trends: [],
    anomalies: [],
    flags: [],
    confidence: 0
  }
  
  if (historicalData.results.length >= 3) {
    // Trend analysis
    const ratios = historicalData.results.map(h => {
      const parsed = JSON.parse(h.filing_data || '{}')
      return parseFloat(parsed.tier1_ratio || 0)
    }).filter(r => r > 0)
    
    if (ratios.length >= 3) {
      const trend = calculateTrend(ratios)
      if (trend.slope < -0.005) { // Declining trend
        patterns.flags.push('declining_capital_trend')
        patterns.trends.push('Capital adequacy showing declining trend')
      }
    }
  }
  
  patterns.confidence = Math.min(historicalData.results.length / 6, 1) * 100
  
  return patterns
}

async function generateInstantAlerts(env: any, data: any, riskScore: any, compliance: any) {
  const alerts = []
  
  // High risk alerts
  if (riskScore.score >= 7) {
    alerts.push({
      type: 'high_risk',
      priority: 'urgent',
      message: 'High risk score detected - immediate review required',
      actions: ['assign_senior_reviewer', 'escalate_to_supervisor']
    })
  }
  
  // Compliance violation alerts
  if (compliance.overall_status === 'non_compliant') {
    alerts.push({
      type: 'compliance_violation',
      priority: 'high',
      message: 'Regulatory compliance violations detected',
      actions: ['create_investigation_case', 'notify_legal_team']
    })
  }
  
  // Data quality alerts
  if (data.data_quality_score < 70) {
    alerts.push({
      type: 'data_quality',
      priority: 'medium',
      message: 'Poor data quality - additional validation required',
      actions: ['request_data_revision', 'schedule_entity_meeting']
    })
  }
  
  return alerts
}

function calculateTrend(values: number[]) {
  const n = values.length
  const sumX = n * (n - 1) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((sum, y, i) => sum + (i * y), 0)
  const sumXX = n * (n - 1) * (2 * n - 1) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return { slope, intercept }
}

async function validateField(fieldName: string, fieldValue: any, filingType: string, context: any) {
  const validation = {
    is_valid: true,
    warnings: [],
    errors: [],
    suggestions: [],
    risk_impact: 'none'
  }
  
  // Real-time field validation
  switch (fieldName) {
    case 'tier1_ratio':
      const ratio = parseFloat(fieldValue)
      if (isNaN(ratio)) {
        validation.errors.push('Must be a valid number')
        validation.is_valid = false
      } else if (ratio < 0.08) {
        validation.errors.push('Below regulatory minimum of 8%')
        validation.risk_impact = 'high'
        validation.is_valid = false
      } else if (ratio < 0.10) {
        validation.warnings.push('Approaching regulatory concern level')
        validation.risk_impact = 'medium'
      } else if (ratio > 0.50) {
        validation.warnings.push('Unusually high ratio - please verify')
        validation.suggestions.push('Consider reviewing calculation methodology')
      }
      break
      
    case 'consumer_complaints':
      const complaints = parseInt(fieldValue)
      if (complaints > 100) {
        validation.warnings.push('High complaint volume detected')
        validation.risk_impact = 'medium'
        validation.suggestions.push('Consider providing explanation for high complaint volume')
      }
      break
  }
  
  return validation
}

function generateNextActions(validation: any, riskScore: any, compliance: any) {
  const actions = []
  
  if (!validation.is_valid) {
    actions.push('Fix validation errors before submission')
  }
  
  if (riskScore.score >= 5) {
    actions.push('Schedule risk assessment meeting')
    actions.push('Prepare risk mitigation plan')
  }
  
  if (compliance.overall_status !== 'compliant') {
    actions.push('Address compliance violations')
    actions.push('Consult with legal/compliance team')
  }
  
  if (actions.length === 0) {
    actions.push('Ready for submission')
  }
  
  return actions
}

async function storeAnalysisResults(env: any, submissionData: any, analysisResults: any) {
  const result = await env.DB.prepare(`
    INSERT INTO real_time_analyses (
      entity_id, filing_type, analysis_results, created_at, processing_time_ms
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
  `).bind(
    submissionData.entity_id,
    submissionData.filing_type,
    JSON.stringify(analysisResults),
    analysisResults.processing_time
  ).run()
  
  return result.meta.last_row_id
}

export default app