// Pensions Regulation Module for CFRP
// Comprehensive coverage of Canadian pension regulatory landscape

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

// Pension Regulatory Framework
const PENSION_REGULATORS = {
  // Federal Level
  'osfi_pensions': {
    name: 'Office of the Superintendent of Financial Institutions - Pensions Division',
    name_fr: 'Bureau du surintendant des institutions financières - Division des pensions',
    jurisdiction: 'federal',
    regulated_entities: ['federal_pension_plans', 'cpp_supplementary', 'government_pensions'],
    reporting_requirements: ['annual_information_returns', 'actuarial_reports', 'investment_reports'],
    languages: ['english', 'french'],
    contact: {
      address: '255 Albert Street, Ottawa, ON K1A 0H2',
      phone: '1-800-385-8647',
      email: 'pensions@osfi-bsif.gc.ca'
    }
  },
  
  'cppib': {
    name: 'Canada Pension Plan Investment Board',
    name_fr: 'Office d\'investissement du régime de pensions du Canada',
    jurisdiction: 'federal',
    role: 'cpp_investment_management',
    regulated_entities: ['cpp_fund', 'investment_portfolios'],
    reporting_requirements: ['quarterly_performance', 'annual_report', 'risk_management'],
    languages: ['english', 'french'],
    contact: {
      address: 'One Queen Street East, Suite 2600, Toronto, ON M5C 2W5',
      phone: '416-868-4075',
      email: 'info@cppib.com'
    }
  },
  
  // Provincial Pension Regulators
  'fsra_pensions': {
    name: 'Financial Services Regulatory Authority of Ontario - Pensions Division',
    name_fr: 'Autorité de réglementation des services financiers de l\'Ontario - Division des pensions',
    jurisdiction: 'ontario',
    regulated_entities: ['registered_pension_plans', 'pooled_pension_plans', 'pension_administrators'],
    reporting_requirements: ['annual_information_returns', 'financial_statements', 'actuarial_valuations'],
    languages: ['english', 'french'],
    contact: {
      address: '25 Sheppard Avenue West, Suite 100, Toronto, ON M2N 6S6',
      phone: '416-250-7250',
      email: 'pensions@fsrao.ca'
    }
  },
  
  'retraite_quebec': {
    name: 'Retraite Québec',
    name_fr: 'Retraite Québec',
    jurisdiction: 'quebec',
    regulated_entities: ['regimes_supplementaires', 'rentes_du_quebec', 'administrateurs_regimes'],
    reporting_requirements: ['declaration_annuelle', 'etats_financiers', 'evaluation_actuarielle'],
    languages: ['french', 'english'],
    primary_language: 'french',
    contact: {
      address: '2600, boulevard Laurier, Québec (Québec) G1V 4T3',
      phone: '1-800-463-5185',
      email: 'info@retraitequebec.gouv.qc.ca'
    }
  },
  
  'alberta_pensions': {
    name: 'Alberta Pension Services Corporation',
    name_fr: 'Société des services de pension de l\'Alberta',
    jurisdiction: 'alberta',
    regulated_entities: ['provincial_pension_plans', 'public_sector_pensions'],
    reporting_requirements: ['annual_reports', 'actuarial_valuations', 'investment_performance'],
    languages: ['english'],
    contact: {
      address: '5103 Windermere Boulevard SW, Edmonton, AB T6W 0S9',
      phone: '780-427-5555',
      email: 'info@apsc.ca'
    }
  },
  
  'bcpensions': {
    name: 'BC Pension Corporation',
    name_fr: 'Société des pensions de la Colombie-Britannique',
    jurisdiction: 'british_columbia',
    regulated_entities: ['public_service_pension', 'teachers_pension', 'municipal_pension'],
    reporting_requirements: ['annual_reports', 'financial_statements', 'member_statements'],
    languages: ['english'],
    contact: {
      address: 'PO Box 9460, Victoria, BC V8W 9V8',
      phone: '1-800-665-6770',
      email: 'info@bcpension.ca'
    }
  }
}

// Pension Plan Types
const PENSION_PLAN_TYPES = {
  'defined_benefit': {
    name: 'Defined Benefit Pension Plan',
    name_fr: 'Régime de retraite à prestations déterminées',
    characteristics: ['guaranteed_benefits', 'employer_investment_risk', 'actuarial_valuations'],
    regulatory_focus: ['funding_adequacy', 'benefit_security', 'investment_governance']
  },
  
  'defined_contribution': {
    name: 'Defined Contribution Pension Plan',
    name_fr: 'Régime de retraite à cotisations déterminées',
    characteristics: ['individual_accounts', 'member_investment_risk', 'portable_benefits'],
    regulatory_focus: ['investment_options', 'fee_disclosure', 'member_education']
  },
  
  'group_rrsp': {
    name: 'Group Registered Retirement Savings Plan',
    name_fr: 'Régime enregistré d\'épargne-retraite collectif',
    characteristics: ['employer_sponsored', 'individual_ownership', 'tax_deferred'],
    regulatory_focus: ['investment_selection', 'fee_transparency', 'portability']
  },
  
  'pooled_registered_pension': {
    name: 'Pooled Registered Pension Plan',
    name_fr: 'Régime de pension agréé collectif',
    characteristics: ['pooled_investments', 'professional_management', 'low_cost'],
    regulatory_focus: ['administrator_oversight', 'investment_governance', 'member_protection']
  }
}

// Pension Filing Types
const PENSION_FILINGS = {
  'annual_information_return': {
    name: 'Annual Information Return',
    name_fr: 'Déclaration de renseignements annuelle',
    frequency: 'annual',
    deadline_days: 180,
    required_fields: ['plan_membership', 'financial_position', 'benefit_payments', 'investments'],
    regulators: ['osfi_pensions', 'fsra_pensions', 'retraite_quebec']
  },
  
  'actuarial_valuation': {
    name: 'Actuarial Valuation Report',
    name_fr: 'Rapport d\'évaluation actuarielle',
    frequency: 'triennial',
    deadline_days: 120,
    required_fields: ['actuarial_assumptions', 'funding_position', 'contribution_requirements', 'risk_assessment'],
    regulators: ['osfi_pensions', 'fsra_pensions', 'retraite_quebec']
  },
  
  'financial_statements': {
    name: 'Audited Financial Statements',
    name_fr: 'États financiers vérifiés',
    frequency: 'annual',
    deadline_days: 180,
    required_fields: ['statement_of_net_assets', 'statement_of_changes', 'notes_to_statements', 'auditor_opinion'],
    regulators: ['fsra_pensions', 'retraite_quebec', 'alberta_pensions']
  },
  
  'investment_report': {
    name: 'Investment Performance Report',
    name_fr: 'Rapport de rendement des placements',
    frequency: 'quarterly',
    deadline_days: 45,
    required_fields: ['asset_allocation', 'performance_benchmarks', 'risk_metrics', 'costs_fees'],
    regulators: ['osfi_pensions', 'cppib', 'fsra_pensions']
  },
  
  'governance_report': {
    name: 'Pension Governance Report',
    name_fr: 'Rapport de gouvernance des pensions',
    frequency: 'annual',
    deadline_days: 120,
    required_fields: ['board_composition', 'policy_framework', 'risk_management', 'compliance_monitoring'],
    regulators: ['fsra_pensions', 'retraite_quebec']
  }
}

// Pension Risk Categories
const PENSION_RISKS = {
  'funding_risk': {
    name: 'Funding Risk',
    name_fr: 'Risque de financement',
    subcategories: ['going_concern_deficit', 'solvency_deficit', 'contribution_volatility'],
    monitoring_frequency: 'annual',
    threshold_metrics: ['funded_ratio', 'solvency_ratio', 'contribution_rate']
  },
  
  'investment_risk': {
    name: 'Investment Risk',
    name_fr: 'Risque de placement',
    subcategories: ['market_risk', 'credit_risk', 'liquidity_risk', 'inflation_risk'],
    monitoring_frequency: 'quarterly',
    threshold_metrics: ['asset_liability_matching', 'portfolio_diversification', 'risk_budget']
  },
  
  'longevity_risk': {
    name: 'Longevity Risk',
    name_fr: 'Risque de longévité',
    subcategories: ['mortality_improvement', 'demographic_changes', 'medical_advances'],
    monitoring_frequency: 'triennial',
    threshold_metrics: ['life_expectancy_trends', 'mortality_tables', 'population_demographics']
  },
  
  'operational_risk': {
    name: 'Operational Risk',
    name_fr: 'Risque opérationnel',
    subcategories: ['administration_errors', 'fraud', 'system_failures', 'regulatory_changes'],
    monitoring_frequency: 'ongoing',
    threshold_metrics: ['error_rates', 'processing_times', 'member_complaints']
  },
  
  'regulatory_risk': {
    name: 'Regulatory Risk',
    name_fr: 'Risque réglementaire',
    subcategories: ['rule_changes', 'compliance_costs', 'reporting_requirements'],
    monitoring_frequency: 'ongoing',
    threshold_metrics: ['compliance_scores', 'regulatory_updates', 'cost_impact']
  }
}

const app = new Hono<{ Bindings: Bindings }>()

// Get all pension regulators
app.get('/regulators', (c) => {
  return c.json({
    success: true,
    data: PENSION_REGULATORS,
    count: Object.keys(PENSION_REGULATORS).length
  })
})

// Get regulator by jurisdiction
app.get('/regulators/:jurisdiction', (c) => {
  const jurisdiction = c.req.param('jurisdiction')
  const regulators = Object.values(PENSION_REGULATORS).filter(reg => reg.jurisdiction === jurisdiction)
  
  if (regulators.length === 0) {
    return c.json({ success: false, error: 'No regulators found for jurisdiction' }, 404)
  }
  
  return c.json({ success: true, data: regulators })
})

// Get pension plan types
app.get('/plan-types', (c) => {
  return c.json({
    success: true,
    data: PENSION_PLAN_TYPES,
    count: Object.keys(PENSION_PLAN_TYPES).length
  })
})

// Get filing types
app.get('/filings', (c) => {
  return c.json({
    success: true,
    data: PENSION_FILINGS,
    count: Object.keys(PENSION_FILINGS).length
  })
})

// Submit pension filing
app.post('/filings', async (c) => {
  const { env } = c
  
  try {
    const filing = await c.req.json()
    const { 
      filing_type, 
      regulator_ids, 
      plan_name,
      plan_number,
      administrator_name,
      filing_data,
      language = 'english'
    } = filing

    // Validate filing type
    if (!PENSION_FILINGS[filing_type]) {
      return c.json({ success: false, error: 'Invalid filing type' }, 400)
    }

    // Insert filing record
    const result = await env.DB.prepare(`
      INSERT INTO pension_filings (
        filing_type, plan_name, plan_number, administrator_name,
        filing_data, language, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      filing_type,
      plan_name,
      plan_number,
      administrator_name,
      JSON.stringify(filing_data),
      language,
      'submitted'
    ).run()

    const filingId = result.meta.last_row_id

    // Submit to each regulator
    const submissions = []
    for (const regulatorId of regulator_ids) {
      if (PENSION_REGULATORS[regulatorId]) {
        const submissionResult = await env.DB.prepare(`
          INSERT INTO regulator_submissions (
            filing_id, regulator_id, regulator_type, 
            submission_data, status, created_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          filingId,
          regulatorId,
          'pensions',
          JSON.stringify({
            regulator: PENSION_REGULATORS[regulatorId],
            filing: PENSION_FILINGS[filing_type],
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
    const complianceResult = await analyzePensionCompliance(filing_data, filing_type)

    return c.json({
      success: true,
      data: {
        filing_id: filingId,
        submissions,
        compliance_analysis: complianceResult,
        message: `Pension filing submitted to ${submissions.length} regulators`
      }
    })

  } catch (error) {
    console.error('Pension filing error:', error)
    return c.json({ success: false, error: 'Filing submission failed' }, 500)
  }
})

// Real-time compliance analysis
app.post('/analyze', async (c) => {
  try {
    const { filing_data, filing_type, plan_type } = await c.req.json()
    
    const analysis = await analyzePensionCompliance(filing_data, filing_type, plan_type)
    
    return c.json({
      success: true,
      data: analysis
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return c.json({ success: false, error: 'Analysis failed' }, 500)
  }
})

// Get risk categories
app.get('/risks', (c) => {
  return c.json({
    success: true,
    data: PENSION_RISKS,
    count: Object.keys(PENSION_RISKS).length
  })
})

// Funding status monitoring
app.post('/funding/monitor', async (c) => {
  const { env } = c
  
  try {
    const { plan_id, funding_data } = await c.req.json()
    
    // Analyze funding status
    const fundingAnalysis = await analyzeFundingStatus(funding_data)
    
    // Store funding assessment
    const result = await env.DB.prepare(`
      INSERT INTO pension_funding_assessments (
        plan_id, funding_data, analysis_result, 
        funded_ratio, solvency_ratio, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      plan_id,
      JSON.stringify(funding_data),
      JSON.stringify(fundingAnalysis),
      fundingAnalysis.funded_ratio,
      fundingAnalysis.solvency_ratio
    ).run()

    return c.json({
      success: true,
      data: {
        assessment_id: result.meta.last_row_id,
        funding_analysis: fundingAnalysis
      }
    })

  } catch (error) {
    console.error('Funding monitoring error:', error)
    return c.json({ success: false, error: 'Funding monitoring failed' }, 500)
  }
})

// Investment performance tracking
app.post('/investments/performance', async (c) => {
  const { env } = c
  
  try {
    const { plan_id, performance_data } = await c.req.json()
    
    // Analyze investment performance
    const performanceAnalysis = await analyzeInvestmentPerformance(performance_data)
    
    // Store performance record
    const result = await env.DB.prepare(`
      INSERT INTO pension_performance_records (
        plan_id, performance_data, analysis_result, 
        return_rate, benchmark_comparison, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      plan_id,
      JSON.stringify(performance_data),
      JSON.stringify(performanceAnalysis),
      performanceAnalysis.net_return,
      performanceAnalysis.benchmark_excess
    ).run()

    return c.json({
      success: true,
      data: {
        record_id: result.meta.last_row_id,
        performance_analysis: performanceAnalysis
      }
    })

  } catch (error) {
    console.error('Performance tracking error:', error)
    return c.json({ success: false, error: 'Performance tracking failed' }, 500)
  }
})

// Helper Functions
async function analyzePensionCompliance(filingData: any, filingType: string, planType?: string) {
  const filing = PENSION_FILINGS[filingType]
  if (!filing) {
    throw new Error('Invalid filing type')
  }

  const analysis = {
    filing_type: filingType,
    plan_type: planType,
    compliance_score: 0,
    issues: [] as string[],
    recommendations: [] as string[],
    regulatory_flags: [] as string[],
    funding_alerts: [] as string[],
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

  // Funding analysis for defined benefit plans
  if (planType === 'defined_benefit' && filingData.funding_position) {
    const fundingRatio = filingData.funding_position.going_concern_ratio
    const solvencyRatio = filingData.funding_position.solvency_ratio
    
    if (fundingRatio && fundingRatio < 90) {
      analysis.regulatory_flags.push(`Going concern funding ratio below 90%: ${fundingRatio}%`)
      analysis.funding_alerts.push('Plan may require special funding payments')
    }
    
    if (solvencyRatio && solvencyRatio < 85) {
      analysis.regulatory_flags.push(`Solvency ratio critically low: ${solvencyRatio}%`)
      analysis.funding_alerts.push('Immediate regulatory attention required')
    }
  }

  // Investment analysis
  if (filingData.investments) {
    const investmentAnalysis = analyzeInvestmentCompliance(filingData.investments)
    analysis.issues.push(...investmentAnalysis.issues)
    analysis.recommendations.push(...investmentAnalysis.recommendations)
  }

  // Governance analysis
  if (filingData.governance) {
    const governanceScore = analyzeGovernanceCompliance(filingData.governance)
    if (governanceScore < 70) {
      analysis.regulatory_flags.push('Governance framework requires strengthening')
      analysis.recommendations.push('Review board composition and policy framework')
    }
  }

  // Quebec French language compliance
  if (filingData.language === 'french' || filingData.jurisdiction === 'quebec') {
    if (!filingData.french_documentation) {
      analysis.issues.push('French documentation required for Quebec jurisdiction')
    }
  }

  return analysis
}

async function analyzeFundingStatus(fundingData: any) {
  const analysis = {
    funded_ratio: 0,
    solvency_ratio: 0,
    funding_status: 'unknown',
    required_contributions: 0,
    recommendations: [] as string[],
    alerts: [] as string[]
  }

  // Calculate funding ratios
  if (fundingData.assets && fundingData.liabilities) {
    analysis.funded_ratio = Math.round((fundingData.assets / fundingData.liabilities) * 100)
  }

  if (fundingData.assets && fundingData.solvency_liabilities) {
    analysis.solvency_ratio = Math.round((fundingData.assets / fundingData.solvency_liabilities) * 100)
  }

  // Determine funding status
  if (analysis.funded_ratio >= 100 && analysis.solvency_ratio >= 100) {
    analysis.funding_status = 'fully_funded'
  } else if (analysis.funded_ratio >= 90) {
    analysis.funding_status = 'adequately_funded'
  } else {
    analysis.funding_status = 'underfunded'
    analysis.alerts.push('Plan requires additional funding')
  }

  // Calculate required contributions
  if (analysis.funded_ratio < 100) {
    const deficit = fundingData.liabilities - fundingData.assets
    analysis.required_contributions = Math.round(deficit * 0.15) // Simplified calculation
    analysis.recommendations.push(`Consider increasing contributions by $${analysis.required_contributions.toLocaleString()}`)
  }

  return analysis
}

async function analyzeInvestmentPerformance(performanceData: any) {
  const analysis = {
    net_return: 0,
    benchmark_return: 0,
    benchmark_excess: 0,
    risk_adjusted_return: 0,
    asset_allocation_score: 0,
    recommendations: [] as string[],
    alerts: [] as string[]
  }

  // Calculate returns
  if (performanceData.portfolio_return) {
    analysis.net_return = parseFloat(performanceData.portfolio_return)
  }

  if (performanceData.benchmark_return) {
    analysis.benchmark_return = parseFloat(performanceData.benchmark_return)
    analysis.benchmark_excess = analysis.net_return - analysis.benchmark_return
  }

  // Risk-adjusted return (simplified Sharpe ratio)
  if (performanceData.volatility && performanceData.risk_free_rate) {
    analysis.risk_adjusted_return = (analysis.net_return - performanceData.risk_free_rate) / performanceData.volatility
  }

  // Asset allocation analysis
  if (performanceData.asset_allocation) {
    analysis.asset_allocation_score = calculateAssetAllocationScore(performanceData.asset_allocation)
  }

  // Generate recommendations
  if (analysis.benchmark_excess < -1) {
    analysis.alerts.push('Portfolio underperforming benchmark by significant margin')
    analysis.recommendations.push('Review investment strategy and manager selection')
  }

  if (analysis.asset_allocation_score < 70) {
    analysis.recommendations.push('Review asset allocation against plan\'s risk tolerance')
  }

  return analysis
}

function analyzeInvestmentCompliance(investmentData: any) {
  const analysis = {
    issues: [] as string[],
    recommendations: [] as string[]
  }

  // Check investment limits
  if (investmentData.single_investment_limit > 10) {
    analysis.issues.push(`Single investment exceeds 10% limit: ${investmentData.single_investment_limit}%`)
  }

  if (investmentData.real_estate_allocation > 15) {
    analysis.issues.push(`Real estate allocation exceeds 15% limit: ${investmentData.real_estate_allocation}%`)
  }

  // Check diversification
  if (investmentData.equity_concentration > 30) {
    analysis.recommendations.push('Consider diversifying equity holdings')
  }

  return analysis
}

function analyzeGovernanceCompliance(governanceData: any): number {
  let score = 0
  
  // Board composition
  if (governanceData.independent_members >= 3) score += 25
  if (governanceData.investment_committee) score += 20
  
  // Policies
  if (governanceData.investment_policy) score += 20
  if (governanceData.risk_management_policy) score += 15
  if (governanceData.conflict_of_interest_policy) score += 10
  
  // Reporting
  if (governanceData.regular_reporting) score += 10
  
  return score
}

function calculateAssetAllocationScore(assetAllocation: any): number {
  let score = 100
  
  // Check for over-concentration
  Object.values(assetAllocation).forEach((allocation: any) => {
    if (allocation > 50) score -= 20 // Penalize high concentration
    if (allocation < 5) score -= 5   // Penalize very small allocations
  })
  
  return Math.max(0, score)
}

export default app