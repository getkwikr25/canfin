// Insurance Regulation Module for CFRP
// Comprehensive coverage of Canadian insurance regulatory landscape

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

// Insurance Regulatory Framework
const INSURANCE_REGULATORS = {
  // Federal Level
  'osfi_insurance': {
    name: 'Office of the Superintendent of Financial Institutions - Insurance Division',
    name_fr: 'Bureau du surintendant des institutions financières - Division des assurances',
    jurisdiction: 'federal',
    regulated_entities: ['federally_regulated_insurers', 'reinsurers', 'fraternal_benefit_societies'],
    reporting_requirements: ['quarterly_returns', 'annual_statements', 'actuarial_reports'],
    languages: ['english', 'french'],
    contact: {
      address: '255 Albert Street, Ottawa, ON K1A 0H2',
      phone: '1-800-385-8647',
      email: 'insurance@osfi-bsif.gc.ca'
    }
  },
  
  // Provincial Insurance Regulators
  'fsra_insurance': {
    name: 'Financial Services Regulatory Authority of Ontario - Insurance Division',
    name_fr: 'Autorité de réglementation des services financiers de l\'Ontario - Division des assurances',
    jurisdiction: 'ontario',
    regulated_entities: ['property_casualty_insurers', 'life_insurers', 'mutual_insurers', 'insurance_agents'],
    reporting_requirements: ['quarterly_statements', 'annual_returns', 'market_conduct_reports'],
    languages: ['english', 'french'],
    contact: {
      address: '25 Sheppard Avenue West, Suite 100, Toronto, ON M2N 6S6',
      phone: '416-250-7250',
      email: 'insurance@fsrao.ca'
    }
  },
  
  'amf_insurance': {
    name: 'Autorité des marchés financiers - Assurance',
    name_fr: 'Autorité des marchés financiers - Assurance',
    jurisdiction: 'quebec',
    regulated_entities: ['assureurs_vie', 'assureurs_dommages', 'agents_assurance', 'courtiers_assurance'],
    reporting_requirements: ['etats_financiers_trimestriels', 'rapport_annuel', 'rapport_actuariel'],
    languages: ['french', 'english'],
    primary_language: 'french',
    contact: {
      address: '800, rue du Square-Victoria, 22e étage, Montréal (Québec) H4Z 1G3',
      phone: '514-395-0337',
      email: 'assurance@lautorite.qc.ca'
    }
  },
  
  'bcfsa_insurance': {
    name: 'BC Financial Services Authority - Insurance Division',
    name_fr: 'Autorité des services financiers de la C.-B. - Division des assurances',
    jurisdiction: 'british_columbia',
    regulated_entities: ['insurance_companies', 'mutual_insurers', 'insurance_agents', 'adjusters'],
    reporting_requirements: ['quarterly_filings', 'annual_statements', 'solvency_reports'],
    languages: ['english'],
    contact: {
      address: '2800-555 West Hastings Street, Vancouver, BC V6B 4N6',
      phone: '604-660-3555',
      email: 'insurance@bcfsa.ca'
    }
  },
  
  'asic_insurance': {
    name: 'Alberta Securities and Insurance Commission',
    name_fr: 'Commission des valeurs mobilières et des assurances de l\'Alberta',
    jurisdiction: 'alberta',
    regulated_entities: ['insurance_companies', 'agents', 'adjusters', 'managing_general_agents'],
    reporting_requirements: ['quarterly_returns', 'annual_filings', 'financial_statements'],
    languages: ['english'],
    contact: {
      address: 'Suite 600, 250-5th Street SW, Calgary, AB T2P 0R4',
      phone: '403-297-6454',
      email: 'insurance@asc.ca'
    }
  }
}

// Insurance Filing Types
const INSURANCE_FILINGS = {
  'quarterly_return': {
    name: 'Quarterly Return',
    name_fr: 'Déclaration trimestrielle',
    frequency: 'quarterly',
    deadline_days: 45,
    required_fields: ['financial_position', 'income_statement', 'cash_flow', 'regulatory_capital'],
    regulators: ['osfi_insurance', 'fsra_insurance', 'amf_insurance', 'bcfsa_insurance']
  },
  
  'annual_statement': {
    name: 'Annual Statement',
    name_fr: 'État annuel',
    frequency: 'annual',
    deadline_days: 90,
    required_fields: ['audited_financials', 'actuarial_opinion', 'management_discussion', 'risk_assessment'],
    regulators: ['osfi_insurance', 'fsra_insurance', 'amf_insurance', 'bcfsa_insurance']
  },
  
  'solvency_report': {
    name: 'Solvency and Capital Assessment Report',
    name_fr: 'Rapport d\'évaluation de la solvabilité et du capital',
    frequency: 'annual',
    deadline_days: 120,
    required_fields: ['capital_adequacy', 'risk_profile', 'stress_testing', 'governance_assessment'],
    regulators: ['osfi_insurance', 'fsra_insurance']
  },
  
  'market_conduct_report': {
    name: 'Market Conduct Report',
    name_fr: 'Rapport sur la conduite du marché',
    frequency: 'annual',
    deadline_days: 60,
    required_fields: ['complaint_statistics', 'sales_practices', 'claims_handling', 'consumer_protection'],
    regulators: ['fsra_insurance', 'amf_insurance', 'bcfsa_insurance']
  },
  
  'actuarial_report': {
    name: 'Actuarial Report',
    name_fr: 'Rapport actuariel',
    frequency: 'annual',
    deadline_days: 90,
    required_fields: ['reserve_adequacy', 'methodology', 'data_quality', 'peer_review'],
    regulators: ['osfi_insurance', 'fsra_insurance', 'amf_insurance']
  }
}

// Insurance Risk Categories
const INSURANCE_RISKS = {
  'underwriting_risk': {
    name: 'Underwriting Risk',
    name_fr: 'Risque de souscription',
    subcategories: ['premium_risk', 'reserve_risk', 'catastrophe_risk'],
    monitoring_frequency: 'monthly',
    threshold_metrics: ['loss_ratio', 'combined_ratio', 'reserve_development']
  },
  
  'market_risk': {
    name: 'Market Risk',
    name_fr: 'Risque de marché',
    subcategories: ['interest_rate_risk', 'equity_risk', 'credit_risk', 'currency_risk'],
    monitoring_frequency: 'daily',
    threshold_metrics: ['duration_mismatch', 'var_limits', 'credit_exposure']
  },
  
  'operational_risk': {
    name: 'Operational Risk',
    name_fr: 'Risque opérationnel',
    subcategories: ['fraud_risk', 'cyber_risk', 'process_risk', 'people_risk'],
    monitoring_frequency: 'monthly',
    threshold_metrics: ['incident_frequency', 'loss_severity', 'control_effectiveness']
  },
  
  'liquidity_risk': {
    name: 'Liquidity Risk',
    name_fr: 'Risque de liquidité',
    subcategories: ['asset_liquidity', 'funding_risk', 'market_liquidity'],
    monitoring_frequency: 'weekly',
    threshold_metrics: ['liquidity_ratio', 'cash_flow_matching', 'stress_scenario']
  }
}

const app = new Hono<{ Bindings: Bindings }>()

// Get all insurance regulators
app.get('/regulators', (c) => {
  return c.json({
    success: true,
    data: INSURANCE_REGULATORS,
    count: Object.keys(INSURANCE_REGULATORS).length
  })
})

// Get regulator by jurisdiction
app.get('/regulators/:jurisdiction', (c) => {
  const jurisdiction = c.req.param('jurisdiction')
  const regulator = Object.values(INSURANCE_REGULATORS).find(reg => reg.jurisdiction === jurisdiction)
  
  if (!regulator) {
    return c.json({ success: false, error: 'Regulator not found' }, 404)
  }
  
  return c.json({ success: true, data: regulator })
})

// Get filing types
app.get('/filings', (c) => {
  return c.json({
    success: true,
    data: INSURANCE_FILINGS,
    count: Object.keys(INSURANCE_FILINGS).length
  })
})

// Submit insurance filing
app.post('/filings', async (c) => {
  const { env } = c
  
  try {
    const filing = await c.req.json()
    const { 
      filing_type, 
      regulator_ids, 
      company_name, 
      license_number,
      filing_data,
      language = 'english'
    } = filing

    // Validate filing type
    if (!INSURANCE_FILINGS[filing_type]) {
      return c.json({ success: false, error: 'Invalid filing type' }, 400)
    }

    // Insert filing record
    const result = await env.DB.prepare(`
      INSERT INTO insurance_filings (
        filing_type, company_name, license_number, 
        filing_data, language, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      filing_type,
      company_name,
      license_number,
      JSON.stringify(filing_data),
      language,
      'submitted'
    ).run()

    const filingId = result.meta.last_row_id

    // Submit to each regulator
    const submissions = []
    for (const regulatorId of regulator_ids) {
      if (INSURANCE_REGULATORS[regulatorId]) {
        const submissionResult = await env.DB.prepare(`
          INSERT INTO regulator_submissions (
            filing_id, regulator_id, regulator_type, 
            submission_data, status, created_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          filingId,
          regulatorId,
          'insurance',
          JSON.stringify({
            regulator: INSURANCE_REGULATORS[regulatorId],
            filing: INSURANCE_FILINGS[filing_type],
            data: filing_data
          }),
          'pending'
        ).run()

        submissions.push({
          regulator_id: regulatorId,
          submission_id: submissionResult.meta.last_row_id,
          status: 'pending'
        })
      }
    }

    // Perform compliance analysis
    const complianceResult = await analyzeInsuranceCompliance(filing_data, filing_type)

    return c.json({
      success: true,
      data: {
        filing_id: filingId,
        submissions,
        compliance_analysis: complianceResult,
        message: `Insurance filing submitted to ${submissions.length} regulators`
      }
    })

  } catch (error) {
    console.error('Insurance filing error:', error)
    return c.json({ success: false, error: 'Filing submission failed' }, 500)
  }
})

// Real-time compliance analysis
app.post('/analyze', async (c) => {
  try {
    const { filing_data, filing_type } = await c.req.json()
    
    const analysis = await analyzeInsuranceCompliance(filing_data, filing_type)
    
    return c.json({
      success: true,
      data: analysis
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return c.json({ success: false, error: 'Analysis failed' }, 500)
  }
})

// Get risk assessment
app.get('/risks', (c) => {
  return c.json({
    success: true,
    data: INSURANCE_RISKS,
    count: Object.keys(INSURANCE_RISKS).length
  })
})

// Risk monitoring endpoint
app.post('/risks/monitor', async (c) => {
  const { env } = c
  
  try {
    const { company_id, risk_data } = await c.req.json()
    
    // Analyze risk metrics
    const riskAnalysis = await analyzeRiskMetrics(risk_data)
    
    // Store risk assessment
    const result = await env.DB.prepare(`
      INSERT INTO insurance_risk_assessments (
        company_id, risk_data, analysis_result, 
        risk_score, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(
      company_id,
      JSON.stringify(risk_data),
      JSON.stringify(riskAnalysis),
      riskAnalysis.overall_score
    ).run()

    return c.json({
      success: true,
      data: {
        assessment_id: result.meta.last_row_id,
        risk_analysis: riskAnalysis
      }
    })

  } catch (error) {
    console.error('Risk monitoring error:', error)
    return c.json({ success: false, error: 'Risk monitoring failed' }, 500)
  }
})

// Helper Functions
async function analyzeInsuranceCompliance(filingData: any, filingType: string) {
  const filing = INSURANCE_FILINGS[filingType]
  if (!filing) {
    throw new Error('Invalid filing type')
  }

  const analysis = {
    filing_type: filingType,
    compliance_score: 0,
    issues: [] as string[],
    recommendations: [] as string[],
    regulatory_flags: [] as string[],
    timestamp: new Date().toISOString()
  }

  // Check required fields
  let missingFields = 0
  for (const field of filing.required_fields) {
    if (!filingData[field] || filingData[field] === '') {
      analysis.issues.push(`Missing required field: ${field}`)
      missingFields++
    }
  }

  // Calculate compliance score
  const fieldScore = Math.max(0, (filing.required_fields.length - missingFields) / filing.required_fields.length * 100)
  analysis.compliance_score = Math.round(fieldScore)

  // Financial ratio analysis for insurance
  if (filingData.financial_position) {
    const ratios = calculateInsuranceRatios(filingData.financial_position)
    
    // Solvency checks
    if (ratios.mct_ratio && ratios.mct_ratio < 150) {
      analysis.regulatory_flags.push(`MCT ratio below minimum: ${ratios.mct_ratio}%`)
      analysis.recommendations.push('Increase capital or reduce risk exposure')
    }
    
    // Combined ratio check
    if (ratios.combined_ratio && ratios.combined_ratio > 100) {
      analysis.regulatory_flags.push(`Combined ratio indicates underwriting loss: ${ratios.combined_ratio}%`)
      analysis.recommendations.push('Review underwriting practices and pricing adequacy')
    }
  }

  // Language compliance for Quebec (AMF)
  if (filingData.language === 'french' || filingData.jurisdiction === 'quebec') {
    if (!filingData.french_documentation) {
      analysis.issues.push('French documentation required for Quebec jurisdiction')
    }
  }

  return analysis
}

function calculateInsuranceRatios(financialData: any) {
  return {
    mct_ratio: financialData.available_capital ? 
      (financialData.available_capital / financialData.base_solvency_buffer * 100) : null,
    combined_ratio: financialData.incurred_claims && financialData.earned_premiums ? 
      ((financialData.incurred_claims + financialData.expenses) / financialData.earned_premiums * 100) : null,
    loss_ratio: financialData.incurred_claims && financialData.earned_premiums ? 
      (financialData.incurred_claims / financialData.earned_premiums * 100) : null,
    expense_ratio: financialData.expenses && financialData.earned_premiums ? 
      (financialData.expenses / financialData.earned_premiums * 100) : null
  }
}

async function analyzeRiskMetrics(riskData: any) {
  const analysis = {
    overall_score: 0,
    risk_categories: {} as any,
    alerts: [] as string[],
    recommendations: [] as string[]
  }

  let totalScore = 0
  let categoryCount = 0

  // Analyze each risk category
  for (const [categoryKey, categoryInfo] of Object.entries(INSURANCE_RISKS)) {
    const categoryData = riskData[categoryKey]
    if (categoryData) {
      const categoryScore = calculateRiskScore(categoryKey, categoryData)
      analysis.risk_categories[categoryKey] = {
        score: categoryScore,
        status: categoryScore > 70 ? 'high' : categoryScore > 40 ? 'medium' : 'low'
      }
      
      totalScore += categoryScore
      categoryCount++

      // Generate alerts
      if (categoryScore > 70) {
        analysis.alerts.push(`High ${categoryKey} detected`)
        analysis.recommendations.push(`Implement additional controls for ${categoryKey}`)
      }
    }
  }

  analysis.overall_score = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0

  return analysis
}

function calculateRiskScore(category: string, data: any): number {
  // Simplified risk scoring algorithm
  // In production, this would be much more sophisticated
  
  let score = 0
  
  switch (category) {
    case 'underwriting_risk':
      if (data.loss_ratio > 80) score += 30
      if (data.combined_ratio > 100) score += 40
      break
    case 'market_risk':
      if (data.duration_mismatch > 2) score += 25
      if (data.credit_exposure > 0.1) score += 35
      break
    case 'operational_risk':
      score += (data.incident_count || 0) * 10
      break
    case 'liquidity_risk':
      if (data.liquidity_ratio < 1.2) score += 50
      break
  }
  
  return Math.min(100, score)
}

export default app