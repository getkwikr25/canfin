import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Securities regulatory framework for Canada
const SECURITIES_REGULATORS = {
  'csa': {
    name: 'Canadian Securities Administrators',
    name_fr: 'Autorités canadiennes en valeurs mobilières',
    type: 'umbrella_organization',
    members: ['osc', 'amf', 'asic', 'bcsc', 'nssc', 'nbsc', 'peisc', 'sfsc', 'yukon_cso']
  },
  
  'osc': {
    name: 'Ontario Securities Commission',
    name_fr: 'Commission des valeurs mobilières de l\'Ontario',
    jurisdiction: 'ontario',
    regulated_entities: ['public_companies', 'investment_dealers', 'investment_fund_managers', 'advisers']
  },
  
  'amf_securities': {
    name: 'Autorité des marchés financiers du Québec - Securities Division',
    name_fr: 'Autorité des marchés financiers du Québec - Division des valeurs mobilières',
    jurisdiction: 'quebec',
    regulated_entities: ['public_companies', 'investment_dealers', 'investment_fund_managers', 'advisers']
  },
  
  'ciro': {
    name: 'Canadian Investment Regulatory Organization',
    name_fr: 'Organisme canadien de réglementation des investissements',
    type: 'sro',
    regulated_entities: ['investment_dealers', 'mutual_fund_dealers'],
    predecessor_organizations: ['iiroc', 'mfda']
  }
}

// Securities filing types and requirements
const SECURITIES_FILINGS = {
  // Continuous disclosure documents
  'annual_information_form': {
    name: 'Annual Information Form',
    name_fr: 'Notice annuelle',
    frequency: 'annual',
    applicable_entities: ['reporting_issuers'],
    deadline_days: 90,
    system: 'sedar_plus'
  },
  
  'audited_financial_statements': {
    name: 'Audited Annual Financial Statements',
    name_fr: 'États financiers annuels audités',
    frequency: 'annual',
    applicable_entities: ['reporting_issuers'],
    deadline_days: 90,
    system: 'sedar_plus'
  },
  
  'interim_financial_statements': {
    name: 'Interim Financial Statements',
    name_fr: 'États financiers intermédiaires',
    frequency: 'quarterly',
    applicable_entities: ['reporting_issuers'],
    deadline_days: 45,
    system: 'sedar_plus'
  },
  
  'management_discussion_analysis': {
    name: 'Management\'s Discussion and Analysis',
    name_fr: 'Rapport de gestion',
    frequency: 'quarterly',
    applicable_entities: ['reporting_issuers'],
    deadline_days: 45,
    system: 'sedar_plus'
  },
  
  'proxy_circular': {
    name: 'Management Information Circular',
    name_fr: 'Circulaire de la direction',
    frequency: 'as_required',
    applicable_entities: ['reporting_issuers'],
    trigger: 'annual_meeting',
    system: 'sedar_plus'
  },
  
  // Insider reporting
  'insider_report': {
    name: 'Insider Report',
    name_fr: 'Déclaration d\'initié',
    frequency: 'as_required',
    applicable_entities: ['insiders'],
    deadline_days: 5,
    system: 'sedi'
  },
  
  'early_warning_report': {
    name: 'Early Warning Report',
    name_fr: 'Déclaration d\'alerte précoce',
    frequency: 'as_required',
    applicable_entities: ['shareholders'],
    trigger: '10_percent_ownership',
    deadline_days: 2,
    system: 'sedar_plus'
  },
  
  // Investment fund specific
  'fund_facts': {
    name: 'Fund Facts',
    name_fr: 'Aperçu du fonds',
    frequency: 'as_required',
    applicable_entities: ['mutual_funds'],
    trigger: 'material_change',
    system: 'sedar_plus'
  },
  
  // Dealer reporting
  'monthly_financial_report': {
    name: 'Monthly Financial Report',
    name_fr: 'Rapport financier mensuel',
    frequency: 'monthly',
    applicable_entities: ['investment_dealers'],
    deadline_days: 20,
    system: 'ciro_reporting'
  }
}

// Market surveillance parameters
const MARKET_SURVEILLANCE = {
  'trading_patterns': {
    'unusual_volume': { threshold: '500%', period: '5_days' },
    'price_volatility': { threshold: '20%', period: '1_day' },
    'cross_trading': { threshold: '10%', period: '1_day' }
  },
  
  'insider_trading_indicators': {
    'timing_proximity': '48_hours',
    'volume_threshold': '10000_shares',
    'price_impact': '5%'
  },
  
  'market_manipulation_flags': {
    'wash_trading': { same_beneficial_owner: true },
    'spoofing': { order_cancellation_rate: '80%' },
    'layering': { order_stacking_depth: 5 }
  }
}

// Get securities regulatory framework
app.get('/framework', async (c) => {
  return c.json({
    success: true,
    data: {
      regulators: SECURITIES_REGULATORS,
      filing_types: SECURITIES_FILINGS,
      surveillance_parameters: MARKET_SURVEILLANCE
    }
  })
})

// Submit securities filing
app.post('/filings', async (c) => {
  const { env } = c
  const filingData = await c.req.json()
  
  try {
    // Validate filing type
    const filingType = SECURITIES_FILINGS[filingData.filing_type]
    if (!filingType) {
      return c.json({ success: false, error: 'Invalid securities filing type' })
    }
    
    // Get entity information
    const entity = await env.DB.prepare(`
      SELECT * FROM securities_entities WHERE id = ?
    `).bind(filingData.entity_id).first()
    
    if (!entity) {
      return c.json({ success: false, error: 'Securities entity not found' })
    }
    
    // Check filing applicability
    if (!filingType.applicable_entities.includes(entity.entity_type)) {
      return c.json({ 
        success: false, 
        error: 'Filing type not applicable to this entity type' 
      })
    }
    
    // Calculate deadline
    const deadline = calculateFilingDeadline(filingType, filingData.reporting_period)
    
    // Create securities filing
    const filingResult = await env.DB.prepare(`
      INSERT INTO securities_filings (
        entity_id, filing_type, reporting_period, filing_data,
        deadline, status, submission_system, created_at
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?, CURRENT_TIMESTAMP)
    `).bind(
      filingData.entity_id,
      filingData.filing_type,
      filingData.reporting_period,
      JSON.stringify(filingData),
      deadline,
      filingType.system
    ).run()
    
    const filingId = filingResult.meta.last_row_id
    
    // Perform securities-specific validation
    const validationResults = await validateSecuritiesFiling(filingData, filingType, entity)
    
    // Store validation results
    await env.DB.prepare(`
      INSERT INTO securities_validations (
        filing_id, validation_results, validation_status, created_at
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      filingId,
      JSON.stringify(validationResults),
      validationResults.overall_status
    ).run()
    
    // Auto-submit if validation passes
    if (validationResults.overall_status === 'passed') {
      await submitToSecuritiesSystem(env, filingId, filingType.system, filingData)
    }
    
    return c.json({
      success: true,
      data: {
        filing_id: filingId,
        deadline,
        validation_results: validationResults,
        submission_system: filingType.system,
        status: validationResults.overall_status === 'passed' ? 'submitted' : 'validation_required'
      }
    })
    
  } catch (error) {
    console.error('Securities filing error:', error)
    return c.json({ success: false, error: 'Securities filing failed' })
  }
})

// Market surveillance monitoring
app.post('/surveillance/monitor', async (c) => {
  const { env } = c
  const { trading_data, entity_id, symbol } = await c.req.json()
  
  try {
    // Analyze trading patterns
    const surveillanceResults = await analyzeTrading(trading_data, symbol)
    
    // Store surveillance data
    const surveillanceResult = await env.DB.prepare(`
      INSERT INTO market_surveillance (
        entity_id, symbol, trading_date, trading_data,
        surveillance_results, alert_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      entity_id,
      symbol,
      trading_data.trading_date,
      JSON.stringify(trading_data),
      JSON.stringify(surveillanceResults),
      surveillanceResults.alert_level
    ).run()
    
    // Create alerts for significant findings
    if (surveillanceResults.alert_level === 'high') {
      await createSurveillanceAlert(env, surveillanceResult.meta.last_row_id, surveillanceResults)
    }
    
    return c.json({
      success: true,
      data: {
        surveillance_id: surveillanceResult.meta.last_row_id,
        alert_level: surveillanceResults.alert_level,
        flags: surveillanceResults.flags,
        recommendations: surveillanceResults.recommendations
      }
    })
    
  } catch (error) {
    console.error('Market surveillance error:', error)
    return c.json({ success: false, error: 'Market surveillance failed' })
  }
})

// Insider trading analysis
app.post('/insider-analysis', async (c) => {
  const { env } = c
  const { insider_id, trading_activity, material_events } = await c.req.json()
  
  try {
    // Get insider information
    const insider = await env.DB.prepare(`
      SELECT * FROM insiders WHERE id = ?
    `).bind(insider_id).first()
    
    if (!insider) {
      return c.json({ success: false, error: 'Insider not found' })
    }
    
    // Analyze trading patterns relative to material events
    const insiderAnalysis = await analyzeInsiderActivity(
      insider,
      trading_activity,
      material_events
    )
    
    // Store analysis results
    const analysisResult = await env.DB.prepare(`
      INSERT INTO insider_analyses (
        insider_id, analysis_period_start, analysis_period_end,
        trading_activity, material_events, analysis_results,
        risk_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      insider_id,
      trading_activity.period_start,
      trading_activity.period_end,
      JSON.stringify(trading_activity),
      JSON.stringify(material_events),
      JSON.stringify(insiderAnalysis),
      insiderAnalysis.risk_score
    ).run()
    
    // Flag for regulatory review if high risk
    if (insiderAnalysis.risk_score >= 7) {
      await flagForRegulatoryReview(env, analysisResult.meta.last_row_id, insiderAnalysis)
    }
    
    return c.json({
      success: true,
      data: {
        analysis_id: analysisResult.meta.last_row_id,
        risk_score: insiderAnalysis.risk_score,
        risk_factors: insiderAnalysis.risk_factors,
        regulatory_action_required: insiderAnalysis.risk_score >= 7
      }
    })
    
  } catch (error) {
    console.error('Insider analysis error:', error)
    return c.json({ success: false, error: 'Insider analysis failed' })
  }
})

// Investment fund compliance monitoring
app.get('/funds/:fundId/compliance', async (c) => {
  const { env } = c
  const fundId = c.req.param('fundId')
  
  try {
    // Get fund information and holdings
    const fund = await env.DB.prepare(`
      SELECT * FROM investment_funds WHERE id = ?
    `).bind(fundId).first()
    
    if (!fund) {
      return c.json({ success: false, error: 'Investment fund not found' })
    }
    
    const holdings = await env.DB.prepare(`
      SELECT * FROM fund_holdings WHERE fund_id = ? AND valuation_date = (
        SELECT MAX(valuation_date) FROM fund_holdings WHERE fund_id = ?
      )
    `).bind(fundId, fundId).all()
    
    // Analyze compliance with investment restrictions
    const complianceAnalysis = await analyzeFundCompliance(fund, holdings.results)
    
    return c.json({
      success: true,
      data: {
        fund_id: fundId,
        fund_name: fund.fund_name,
        compliance_status: complianceAnalysis.overall_status,
        violations: complianceAnalysis.violations,
        warnings: complianceAnalysis.warnings,
        investment_restrictions: complianceAnalysis.restrictions_analysis
      }
    })
    
  } catch (error) {
    console.error('Fund compliance error:', error)
    return c.json({ success: false, error: 'Fund compliance analysis failed' })
  }
})

// Helper functions
function calculateFilingDeadline(filingType: any, reportingPeriod: string) {
  const periodEnd = new Date(reportingPeriod + '-01')
  
  // For quarterly periods, find quarter end
  if (filingType.frequency === 'quarterly') {
    const quarter = parseInt(reportingPeriod.split('-Q')[1])
    const year = parseInt(reportingPeriod.split('-Q')[0])
    
    const quarterEndMonth = quarter * 3
    periodEnd.setFullYear(year, quarterEndMonth - 1, 0) // Last day of quarter
  }
  
  // Add deadline days
  const deadline = new Date(periodEnd)
  deadline.setDate(deadline.getDate() + filingType.deadline_days)
  
  return deadline.toISOString().split('T')[0]
}

async function validateSecuritiesFiling(filingData: any, filingType: any, entity: any) {
  const validation = {
    overall_status: 'passed',
    errors: [],
    warnings: [],
    regulatory_checks: []
  }
  
  // Check required disclosures based on filing type
  if (filingType.name.includes('Financial Statements')) {
    if (!filingData.auditor_report) {
      validation.errors.push('Auditor report required for financial statements')
      validation.overall_status = 'failed'
    }
    
    if (!filingData.management_certification) {
      validation.errors.push('Management certification required')
      validation.overall_status = 'failed'
    }
  }
  
  // Check entity-specific requirements
  if (entity.entity_type === 'reporting_issuer') {
    if (!filingData.continuous_disclosure_compliance) {
      validation.warnings.push('Continuous disclosure compliance attestation recommended')
    }
  }
  
  return validation
}

async function submitToSecuritiesSystem(env: any, filingId: number, system: string, filingData: any) {
  // Update filing status to submitted
  await env.DB.prepare(`
    UPDATE securities_filings 
    SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP,
        external_reference = ?
    WHERE id = ?
  `).bind(`${system.toUpperCase()}-${Date.now()}`, filingId).run()
}

async function analyzeTrading(tradingData: any, symbol: string) {
  const analysis = {
    alert_level: 'low',
    flags: [],
    recommendations: []
  }
  
  // Volume analysis
  if (tradingData.volume > tradingData.average_volume * 5) {
    analysis.flags.push('Unusual trading volume detected')
    analysis.alert_level = 'medium'
  }
  
  // Price volatility analysis
  if (Math.abs(tradingData.price_change_percent) > 20) {
    analysis.flags.push('Significant price movement detected')
    analysis.alert_level = 'high'
  }
  
  // Time-based pattern analysis
  if (tradingData.after_hours_volume > tradingData.regular_hours_volume * 0.5) {
    analysis.flags.push('High after-hours trading activity')
    analysis.alert_level = 'medium'
  }
  
  // Generate recommendations
  if (analysis.alert_level === 'high') {
    analysis.recommendations.push('Initiate detailed investigation')
    analysis.recommendations.push('Review insider trading records')
  }
  
  return analysis
}

async function analyzeInsiderActivity(insider: any, tradingActivity: any, materialEvents: any) {
  const analysis = {
    risk_score: 0,
    risk_factors: [],
    trading_patterns: []
  }
  
  // Analyze timing relative to material events
  materialEvents.forEach((event: any) => {
    const eventDate = new Date(event.event_date)
    tradingActivity.trades.forEach((trade: any) => {
      const tradeDate = new Date(trade.trade_date)
      const daysDifference = Math.abs((tradeDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDifference <= 2) {
        analysis.risk_factors.push(`Trading within 2 days of material event: ${event.event_type}`)
        analysis.risk_score += 3
      }
    })
  })
  
  // Volume analysis
  const averageTradeSize = tradingActivity.trades.reduce((sum: number, trade: any) => 
    sum + trade.quantity, 0) / tradingActivity.trades.length
  
  if (averageTradeSize > insider.historical_average_trade_size * 3) {
    analysis.risk_factors.push('Unusually large trade sizes')
    analysis.risk_score += 2
  }
  
  return analysis
}

async function createSurveillanceAlert(env: any, surveillanceId: number, results: any) {
  await env.DB.prepare(`
    INSERT INTO surveillance_alerts (
      surveillance_id, alert_type, alert_level, description, 
      created_at, status
    ) VALUES (?, 'market_surveillance', ?, ?, CURRENT_TIMESTAMP, 'active')
  `).bind(
    surveillanceId,
    results.alert_level,
    results.flags.join('; ')
  ).run()
}

async function flagForRegulatoryReview(env: any, analysisId: number, analysis: any) {
  await env.DB.prepare(`
    INSERT INTO regulatory_reviews (
      analysis_id, review_type, priority, description,
      created_at, status
    ) VALUES (?, 'insider_trading', 'high', ?, CURRENT_TIMESTAMP, 'pending')
  `).bind(
    analysisId,
    analysis.risk_factors.join('; ')
  ).run()
}

async function analyzeFundCompliance(fund: any, holdings: any) {
  const analysis = {
    overall_status: 'compliant',
    violations: [],
    warnings: [],
    restrictions_analysis: {}
  }
  
  // Analyze concentration limits (example: max 10% in single security)
  holdings.forEach((holding: any) => {
    const concentration = (holding.market_value / fund.total_net_assets) * 100
    if (concentration > 10) {
      analysis.violations.push({
        type: 'concentration_limit',
        security: holding.security_name,
        percentage: concentration,
        limit: 10
      })
      analysis.overall_status = 'violation'
    }
  })
  
  return analysis
}

export default app