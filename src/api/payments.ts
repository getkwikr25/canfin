// Payments Regulation Module for CFRP
// Comprehensive coverage of Canadian payments regulatory landscape

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

// Payment System Regulators
const PAYMENT_REGULATORS = {
  // Federal Level - Primary Payment System Oversight
  'bank_of_canada': {
    name: 'Bank of Canada',
    name_fr: 'Banque du Canada',
    jurisdiction: 'federal',
    role: 'payment_system_oversight',
    regulated_entities: ['payment_clearing_systems', 'systemically_important_fps', 'central_bank_digital_currency'],
    oversight_areas: ['system_safety', 'efficiency', 'competitive_landscape'],
    languages: ['english', 'french'],
    contact: {
      address: '234 Wellington Street, Ottawa, ON K1A 0G9',
      phone: '1-800-303-1282',
      email: 'info@bankofcanada.ca'
    }
  },
  
  'payments_canada': {
    name: 'Payments Canada',
    name_fr: 'Paiements Canada',
    jurisdiction: 'federal',
    role: 'payment_system_operator',
    regulated_entities: ['clearing_members', 'payment_participants', 'rtgs_participants'],
    systems_operated: ['rtgs', 'acss', 'lynx', 'real_time_rail'],
    languages: ['english', 'french'],
    contact: {
      address: '80 Richmond Street West, Toronto, ON M5H 2A4',
      phone: '416-348-5500',
      email: 'info@payments.ca'
    }
  },
  
  // Federal Financial Services Regulators with Payment Oversight
  'osfi_payments': {
    name: 'Office of the Superintendent of Financial Institutions - Payment Services',
    name_fr: 'Bureau du surintendant des institutions financières - Services de paiement',
    jurisdiction: 'federal',
    regulated_entities: ['federally_regulated_psps', 'bank_payment_services', 'credit_union_centrals'],
    regulatory_focus: ['prudential_supervision', 'operational_risk', 'cybersecurity'],
    languages: ['english', 'french'],
    contact: {
      address: '255 Albert Street, Ottawa, ON K1A 0H2',
      phone: '1-800-385-8647',
      email: 'payments@osfi-bsif.gc.ca'
    }
  },
  
  'fcac_payments': {
    name: 'Financial Consumer Agency of Canada - Payment Services',
    name_fr: 'Agence de la consommation en matière financière du Canada - Services de paiement',
    jurisdiction: 'federal',
    regulatory_focus: ['consumer_protection', 'market_conduct', 'disclosure_requirements'],
    regulated_entities: ['payment_service_providers', 'fintech_companies', 'digital_wallets'],
    languages: ['english', 'french'],
    contact: {
      address: '427 Laurier Avenue West, Ottawa, ON K1R 1B9',
      phone: '1-866-461-3222',
      email: 'info@fcac-acfc.gc.ca'
    }
  },
  
  // Provincial Payment Service Regulators
  'fsra_payments': {
    name: 'Financial Services Regulatory Authority of Ontario - Payment Services',
    name_fr: 'Autorité de réglementation des services financiers de l\'Ontario - Services de paiement',
    jurisdiction: 'ontario',
    regulated_entities: ['money_service_businesses', 'payment_processors', 'cryptocurrency_exchanges'],
    licensing_requirements: ['msb_license', 'payment_processor_registration'],
    languages: ['english', 'french'],
    contact: {
      address: '25 Sheppard Avenue West, Suite 100, Toronto, ON M2N 6S6',
      phone: '416-250-7250',
      email: 'payments@fsrao.ca'
    }
  },
  
  'amf_payments': {
    name: 'Autorité des marchés financiers - Services de paiement',
    name_fr: 'Autorité des marchés financiers - Services de paiement',
    jurisdiction: 'quebec',
    regulated_entities: ['entreprises_services_monetaires', 'processeurs_paiements', 'portefeuilles_numeriques'],
    licensing_requirements: ['permis_esm', 'enregistrement_processeur'],
    languages: ['french', 'english'],
    primary_language: 'french',
    contact: {
      address: '800, rue du Square-Victoria, 22e étage, Montréal (Québec) H4Z 1G3',
      phone: '514-395-0337',
      email: 'paiements@lautorite.qc.ca'
    }
  },
  
  'bcfsa_payments': {
    name: 'BC Financial Services Authority - Payment Services',
    name_fr: 'Autorité des services financiers de la C.-B. - Services de paiement',
    jurisdiction: 'british_columbia',
    regulated_entities: ['money_service_businesses', 'payment_facilitators', 'remittance_companies'],
    licensing_requirements: ['msb_license', 'payment_facilitator_registration'],
    languages: ['english'],
    contact: {
      address: '2800-555 West Hastings Street, Vancouver, BC V6B 4N6',
      phone: '604-660-3555',
      email: 'payments@bcfsa.ca'
    }
  }
}

// Payment Service Types
const PAYMENT_SERVICE_TYPES = {
  'money_service_business': {
    name: 'Money Service Business',
    name_fr: 'Entreprise de services monétaires',
    services: ['money_transmission', 'currency_exchange', 'money_orders', 'travellers_cheques'],
    regulatory_requirements: ['licensing', 'aml_compliance', 'reporting', 'record_keeping'],
    capital_requirements: 'varies_by_province'
  },
  
  'payment_processor': {
    name: 'Payment Processor',
    name_fr: 'Processeur de paiements',
    services: ['merchant_acquiring', 'card_processing', 'settlement_services', 'gateway_services'],
    regulatory_requirements: ['registration', 'operational_controls', 'data_security', 'dispute_resolution'],
    capital_requirements: 'risk_based'
  },
  
  'digital_wallet': {
    name: 'Digital Wallet Provider',
    name_fr: 'Fournisseur de portefeuille numérique',
    services: ['stored_value', 'p2p_transfers', 'bill_payments', 'merchant_payments'],
    regulatory_requirements: ['consumer_protection', 'fund_safeguarding', 'transparency', 'interoperability'],
    capital_requirements: 'segregated_funds'
  },
  
  'cryptocurrency_exchange': {
    name: 'Cryptocurrency Exchange',
    name_fr: 'Plateforme d\'échange de cryptomonnaies',
    services: ['crypto_trading', 'custody_services', 'fiat_onramp', 'crypto_payments'],
    regulatory_requirements: ['registration', 'custody_controls', 'market_integrity', 'consumer_protection'],
    capital_requirements: 'segregated_custody'
  },
  
  'remittance_service': {
    name: 'Remittance Service Provider',
    name_fr: 'Fournisseur de services de transfert de fonds',
    services: ['international_transfers', 'cross_border_payments', 'foreign_exchange', 'cash_pickup'],
    regulatory_requirements: ['licensing', 'aml_kyc', 'correspondent_banking', 'consumer_disclosure'],
    capital_requirements: 'minimum_capital'
  }
}

// Payment Filing Types
const PAYMENT_FILINGS = {
  'quarterly_report': {
    name: 'Quarterly Payment Services Report',
    name_fr: 'Rapport trimestriel des services de paiement',
    frequency: 'quarterly',
    deadline_days: 30,
    required_fields: ['transaction_volumes', 'revenue_breakdown', 'risk_metrics', 'operational_incidents'],
    regulators: ['osfi_payments', 'fsra_payments', 'amf_payments']
  },
  
  'annual_compliance_report': {
    name: 'Annual Compliance Report',
    name_fr: 'Rapport de conformité annuel',
    frequency: 'annual',
    deadline_days: 90,
    required_fields: ['aml_program', 'kyc_procedures', 'suspicious_transactions', 'training_records'],
    regulators: ['fcac_payments', 'fsra_payments', 'amf_payments']
  },
  
  'operational_resilience_report': {
    name: 'Operational Resilience Report',
    name_fr: 'Rapport de résilience opérationnelle',
    frequency: 'annual',
    deadline_days: 120,
    required_fields: ['business_continuity', 'cyber_security', 'third_party_risk', 'incident_management'],
    regulators: ['osfi_payments', 'payments_canada', 'bank_of_canada']
  },
  
  'consumer_protection_report': {
    name: 'Consumer Protection Report',
    name_fr: 'Rapport de protection des consommateurs',
    frequency: 'annual',
    deadline_days: 60,
    required_fields: ['complaint_handling', 'dispute_resolution', 'fee_transparency', 'service_quality'],
    regulators: ['fcac_payments', 'fsra_payments', 'amf_payments']
  },
  
  'system_participation_report': {
    name: 'Payment System Participation Report',
    name_fr: 'Rapport de participation aux systèmes de paiement',
    frequency: 'monthly',
    deadline_days: 15,
    required_fields: ['system_usage', 'settlement_performance', 'operational_metrics', 'risk_controls'],
    regulators: ['payments_canada', 'bank_of_canada']
  }
}

// Payment Risk Categories
const PAYMENT_RISKS = {
  'operational_risk': {
    name: 'Operational Risk',
    name_fr: 'Risque opérationnel',
    subcategories: ['system_failures', 'processing_errors', 'fraud', 'cyber_attacks'],
    monitoring_frequency: 'real_time',
    threshold_metrics: ['system_availability', 'processing_accuracy', 'fraud_rates', 'security_incidents']
  },
  
  'credit_risk': {
    name: 'Credit Risk',
    name_fr: 'Risque de crédit',
    subcategories: ['counterparty_risk', 'settlement_risk', 'merchant_risk', 'liquidity_risk'],
    monitoring_frequency: 'daily',
    threshold_metrics: ['exposure_limits', 'settlement_ratios', 'reserve_adequacy']
  },
  
  'compliance_risk': {
    name: 'Compliance Risk',
    name_fr: 'Risque de conformité',
    subcategories: ['aml_violations', 'regulatory_breaches', 'data_protection', 'consumer_harm'],
    monitoring_frequency: 'ongoing',
    threshold_metrics: ['violation_counts', 'regulatory_findings', 'consumer_complaints']
  },
  
  'market_risk': {
    name: 'Market Risk',
    name_fr: 'Risque de marché',
    subcategories: ['currency_fluctuations', 'interest_rate_changes', 'competitive_pressure', 'technology_disruption'],
    monitoring_frequency: 'daily',
    threshold_metrics: ['fx_exposure', 'rate_sensitivity', 'market_share', 'innovation_gaps']
  },
  
  'systemic_risk': {
    name: 'Systemic Risk',
    name_fr: 'Risque systémique',
    subcategories: ['system_interconnection', 'concentration_risk', 'contagion_effects', 'critical_service_disruption'],
    monitoring_frequency: 'continuous',
    threshold_metrics: ['system_criticality', 'market_concentration', 'interconnectedness_measures']
  }
}

const app = new Hono<{ Bindings: Bindings }>()

// Get all payment regulators
app.get('/regulators', (c) => {
  return c.json({
    success: true,
    data: PAYMENT_REGULATORS,
    count: Object.keys(PAYMENT_REGULATORS).length
  })
})

// Get regulator by jurisdiction or role
app.get('/regulators/:identifier', (c) => {
  const identifier = c.req.param('identifier')
  
  // Try to find by ID first, then by jurisdiction
  let regulator = PAYMENT_REGULATORS[identifier]
  if (!regulator) {
    const regulators = Object.values(PAYMENT_REGULATORS).filter(reg => 
      reg.jurisdiction === identifier || reg.role === identifier
    )
    if (regulators.length > 0) {
      return c.json({ success: true, data: regulators })
    }
  }
  
  if (!regulator) {
    return c.json({ success: false, error: 'Regulator not found' }, 404)
  }
  
  return c.json({ success: true, data: regulator })
})

// Get payment service types
app.get('/service-types', (c) => {
  return c.json({
    success: true,
    data: PAYMENT_SERVICE_TYPES,
    count: Object.keys(PAYMENT_SERVICE_TYPES).length
  })
})

// Get filing types
app.get('/filings', (c) => {
  return c.json({
    success: true,
    data: PAYMENT_FILINGS,
    count: Object.keys(PAYMENT_FILINGS).length
  })
})

// Submit payment service filing
app.post('/filings', async (c) => {
  const { env } = c
  
  try {
    const filing = await c.req.json()
    const { 
      filing_type, 
      regulator_ids, 
      service_provider_name,
      license_number,
      service_types,
      filing_data,
      language = 'english'
    } = filing

    // Validate filing type
    if (!PAYMENT_FILINGS[filing_type]) {
      return c.json({ success: false, error: 'Invalid filing type' }, 400)
    }

    // Insert filing record
    const result = await env.DB.prepare(`
      INSERT INTO payment_filings (
        filing_type, service_provider_name, license_number, 
        service_types, filing_data, language, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      filing_type,
      service_provider_name,
      license_number,
      JSON.stringify(service_types),
      JSON.stringify(filing_data),
      language,
      'submitted'
    ).run()

    const filingId = result.meta.last_row_id

    // Submit to each regulator
    const submissions = []
    for (const regulatorId of regulator_ids) {
      if (PAYMENT_REGULATORS[regulatorId]) {
        const submissionResult = await env.DB.prepare(`
          INSERT INTO regulator_submissions (
            filing_id, regulator_id, regulator_type, 
            submission_data, status, created_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          filingId,
          regulatorId,
          'payments',
          JSON.stringify({
            regulator: PAYMENT_REGULATORS[regulatorId],
            filing: PAYMENT_FILINGS[filing_type],
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
    const complianceResult = await analyzePaymentCompliance(filing_data, filing_type, service_types)

    return c.json({
      success: true,
      data: {
        filing_id: filingId,
        submissions,
        compliance_analysis: complianceResult,
        message: `Payment service filing submitted to ${submissions.length} regulators`
      }
    })

  } catch (error) {
    console.error('Payment filing error:', error)
    return c.json({ success: false, error: 'Filing submission failed' }, 500)
  }
})

// Real-time compliance analysis
app.post('/analyze', async (c) => {
  try {
    const { filing_data, filing_type, service_types } = await c.req.json()
    
    const analysis = await analyzePaymentCompliance(filing_data, filing_type, service_types)
    
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
    data: PAYMENT_RISKS,
    count: Object.keys(PAYMENT_RISKS).length
  })
})

// Transaction monitoring
app.post('/transactions/monitor', async (c) => {
  const { env } = c
  
  try {
    const { provider_id, transaction_data } = await c.req.json()
    
    // Analyze transaction patterns
    const monitoringResult = await analyzeTransactionPatterns(transaction_data)
    
    // Store monitoring record
    const result = await env.DB.prepare(`
      INSERT INTO payment_transaction_monitoring (
        provider_id, transaction_data, analysis_result, 
        risk_score, suspicious_flags, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      provider_id,
      JSON.stringify(transaction_data),
      JSON.stringify(monitoringResult),
      monitoringResult.risk_score,
      JSON.stringify(monitoringResult.suspicious_flags)
    ).run()

    return c.json({
      success: true,
      data: {
        monitoring_id: result.meta.last_row_id,
        monitoring_result: monitoringResult
      }
    })

  } catch (error) {
    console.error('Transaction monitoring error:', error)
    return c.json({ success: false, error: 'Transaction monitoring failed' }, 500)
  }
})

// AML compliance check
app.post('/aml/check', async (c) => {
  const { env } = c
  
  try {
    const { customer_data, transaction_history } = await c.req.json()
    
    // Perform AML analysis
    const amlResult = await performAMLAnalysis(customer_data, transaction_history)
    
    // Store AML record
    const result = await env.DB.prepare(`
      INSERT INTO payment_aml_records (
        customer_data, transaction_history, aml_result, 
        risk_level, requires_reporting, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      JSON.stringify(customer_data),
      JSON.stringify(transaction_history),
      JSON.stringify(amlResult),
      amlResult.risk_level,
      amlResult.requires_sar ? 1 : 0
    ).run()

    return c.json({
      success: true,
      data: {
        aml_id: result.meta.last_row_id,
        aml_result: amlResult
      }
    })

  } catch (error) {
    console.error('AML analysis error:', error)
    return c.json({ success: false, error: 'AML analysis failed' }, 500)
  }
})

// Helper Functions
async function analyzePaymentCompliance(filingData: any, filingType: string, serviceTypes: string[]) {
  const filing = PAYMENT_FILINGS[filingType]
  if (!filing) {
    throw new Error('Invalid filing type')
  }

  const analysis = {
    filing_type: filingType,
    service_types: serviceTypes,
    compliance_score: 0,
    issues: [] as string[],
    recommendations: [] as string[],
    regulatory_flags: [] as string[],
    aml_alerts: [] as string[],
    operational_alerts: [] as string[],
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

  // AML compliance analysis
  if (filingData.aml_program) {
    const amlScore = analyzeAMLCompliance(filingData.aml_program)
    if (amlScore < 70) {
      analysis.regulatory_flags.push('AML program requires strengthening')
      analysis.aml_alerts.push('Enhanced due diligence procedures needed')
    }
  }

  // Transaction volume analysis
  if (filingData.transaction_volumes) {
    const volumeAnalysis = analyzeTransactionVolumes(filingData.transaction_volumes)
    if (volumeAnalysis.risk_level === 'high') {
      analysis.operational_alerts.push('High transaction volumes require enhanced monitoring')
      analysis.recommendations.push('Implement additional operational controls')
    }
  }

  // Operational resilience check
  if (filingData.operational_metrics) {
    const resilienceScore = analyzeOperationalResilience(filingData.operational_metrics)
    if (resilienceScore < 80) {
      analysis.regulatory_flags.push('Operational resilience below expectations')
      analysis.recommendations.push('Strengthen business continuity planning')
    }
  }

  // Consumer protection analysis
  if (filingData.consumer_metrics) {
    const consumerScore = analyzeConsumerProtection(filingData.consumer_metrics)
    if (consumerScore < 75) {
      analysis.regulatory_flags.push('Consumer protection measures need improvement')
      analysis.recommendations.push('Enhance complaint handling and dispute resolution')
    }
  }

  // Service-specific compliance
  for (const serviceType of serviceTypes) {
    const serviceAnalysis = analyzeServiceCompliance(serviceType, filingData)
    analysis.issues.push(...serviceAnalysis.issues)
    analysis.recommendations.push(...serviceAnalysis.recommendations)
  }

  // Quebec French language compliance
  if (filingData.language === 'french' || filingData.jurisdiction === 'quebec') {
    if (!filingData.french_documentation) {
      analysis.issues.push('French documentation required for Quebec jurisdiction')
    }
  }

  return analysis
}

async function analyzeTransactionPatterns(transactionData: any) {
  const analysis = {
    risk_score: 0,
    suspicious_flags: [] as string[],
    patterns_detected: [] as string[],
    recommendations: [] as string[]
  }

  let riskScore = 0

  // Volume analysis
  if (transactionData.daily_volume > 1000000) {
    riskScore += 20
    analysis.patterns_detected.push('High daily volume')
  }

  // Frequency analysis
  if (transactionData.transaction_frequency > 100) {
    riskScore += 15
    analysis.patterns_detected.push('High frequency transactions')
  }

  // Geographic analysis
  if (transactionData.high_risk_countries && transactionData.high_risk_countries.length > 0) {
    riskScore += 30
    analysis.suspicious_flags.push('Transactions from high-risk jurisdictions')
  }

  // Time pattern analysis
  if (transactionData.unusual_timing) {
    riskScore += 25
    analysis.suspicious_flags.push('Unusual transaction timing patterns')
  }

  analysis.risk_score = Math.min(100, riskScore)

  // Generate recommendations
  if (analysis.risk_score > 70) {
    analysis.recommendations.push('Enhanced monitoring required')
    analysis.recommendations.push('Consider filing suspicious transaction report')
  }

  return analysis
}

async function performAMLAnalysis(customerData: any, transactionHistory: any) {
  const analysis = {
    risk_level: 'low',
    requires_sar: false,
    pep_check: false,
    sanctions_check: false,
    enhanced_dd_required: false,
    alerts: [] as string[]
  }

  let riskScore = 0

  // Customer risk factors
  if (customerData.high_risk_country) {
    riskScore += 30
    analysis.alerts.push('Customer from high-risk jurisdiction')
  }

  if (customerData.cash_intensive_business) {
    riskScore += 25
    analysis.alerts.push('Cash-intensive business model')
  }

  // PEP check
  if (customerData.politically_exposed_person) {
    analysis.pep_check = true
    riskScore += 40
    analysis.alerts.push('Politically Exposed Person identified')
  }

  // Transaction patterns
  if (transactionHistory.structuring_patterns) {
    riskScore += 50
    analysis.alerts.push('Potential structuring detected')
  }

  if (transactionHistory.rapid_movement) {
    riskScore += 35
    analysis.alerts.push('Rapid fund movement patterns')
  }

  // Determine risk level and requirements
  if (riskScore >= 70) {
    analysis.risk_level = 'high'
    analysis.enhanced_dd_required = true
  } else if (riskScore >= 40) {
    analysis.risk_level = 'medium'
  }

  if (riskScore >= 80) {
    analysis.requires_sar = true
    analysis.alerts.push('Suspicious Activity Report (SAR) filing required')
  }

  return analysis
}

function analyzeAMLCompliance(amlProgram: any): number {
  let score = 0
  
  if (amlProgram.written_policies) score += 20
  if (amlProgram.compliance_officer) score += 20
  if (amlProgram.training_program) score += 20
  if (amlProgram.independent_testing) score += 20
  if (amlProgram.customer_identification) score += 20
  
  return score
}

function analyzeTransactionVolumes(volumes: any) {
  const dailyVolume = volumes.daily_average || 0
  const monthlyGrowth = volumes.monthly_growth || 0
  
  let riskLevel = 'low'
  
  if (dailyVolume > 10000000 || monthlyGrowth > 50) {
    riskLevel = 'high'
  } else if (dailyVolume > 1000000 || monthlyGrowth > 25) {
    riskLevel = 'medium'
  }
  
  return { risk_level: riskLevel, daily_volume: dailyVolume, growth_rate: monthlyGrowth }
}

function analyzeOperationalResilience(metrics: any): number {
  let score = 0
  
  if (metrics.system_uptime >= 99.9) score += 25
  if (metrics.backup_systems) score += 20
  if (metrics.incident_response_plan) score += 20
  if (metrics.third_party_risk_management) score += 20
  if (metrics.cyber_security_framework) score += 15
  
  return score
}

function analyzeConsumerProtection(metrics: any): number {
  let score = 0
  
  if (metrics.complaint_resolution_time <= 30) score += 25
  if (metrics.fee_transparency_score >= 80) score += 25
  if (metrics.service_availability >= 99) score += 25
  if (metrics.dispute_resolution_process) score += 25
  
  return score
}

function analyzeServiceCompliance(serviceType: string, filingData: any) {
  const analysis = {
    issues: [] as string[],
    recommendations: [] as string[]
  }
  
  const serviceConfig = PAYMENT_SERVICE_TYPES[serviceType]
  if (!serviceConfig) {
    analysis.issues.push(`Unknown service type: ${serviceType}`)
    return analysis
  }
  
  // Check service-specific requirements
  for (const requirement of serviceConfig.regulatory_requirements) {
    if (!filingData[requirement]) {
      analysis.issues.push(`Missing ${requirement} for ${serviceType}`)
      analysis.recommendations.push(`Implement ${requirement} procedures`)
    }
  }
  
  // Capital requirements check
  if (serviceConfig.capital_requirements !== 'varies_by_province' && !filingData.capital_adequacy) {
    analysis.issues.push(`Capital adequacy documentation required for ${serviceType}`)
  }
  
  return analysis
}

export default app