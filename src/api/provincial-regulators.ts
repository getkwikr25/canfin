import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Provincial regulator configurations
const PROVINCIAL_REGULATORS = {
  'fsra': {
    name: 'Financial Services Regulatory Authority of Ontario',
    name_fr: 'Autorité de réglementation des services financiers de l\'Ontario',
    jurisdiction: 'ontario',
    regulated_entities: ['credit_unions', 'insurance', 'pension_plans', 'mortgage_brokers', 'payday_lenders'],
    api_endpoints: {
      submissions: 'https://api.fsrao.ca/submissions',
      entities: 'https://api.fsrao.ca/entities',
      compliance: 'https://api.fsrao.ca/compliance'
    },
    data_formats: ['json', 'xml'],
    reporting_requirements: {
      'credit_unions': {
        quarterly: ['financial_statements', 'capital_adequacy', 'liquidity_position'],
        annual: ['audited_statements', 'governance_report', 'risk_management']
      },
      'insurance': {
        quarterly: ['solvency_reports', 'investment_holdings'],
        annual: ['actuarial_reports', 'mccsr_ratios', 'regulatory_capital']
      }
    }
  },
  
  'amf': {
    name: 'Autorité des marchés financiers du Québec',
    name_fr: 'Autorité des marchés financiers du Québec',
    jurisdiction: 'quebec',
    regulated_entities: ['securities', 'insurance', 'deposit_institutions', 'financial_planners'],
    api_endpoints: {
      submissions: 'https://api.lautorite.qc.ca/soumissions',
      entities: 'https://api.lautorite.qc.ca/entites',
      compliance: 'https://api.lautorite.qc.ca/conformite'
    },
    data_formats: ['json', 'xml'],
    language_requirements: ['french_primary', 'english_secondary'],
    reporting_requirements: {
      'securities': {
        monthly: ['trading_reports', 'client_accounts'],
        quarterly: ['financial_statements', 'regulatory_capital'],
        annual: ['audited_statements', 'compliance_report']
      },
      'insurance': {
        quarterly: ['solvency_reports', 'investment_reports'],
        annual: ['actuarial_valuations', 'mccsr_calculations']
      }
    }
  },
  
  'bcfsa': {
    name: 'BC Financial Services Authority',
    name_fr: 'Autorité des services financiers de la Colombie-Britannique',
    jurisdiction: 'british_columbia',
    regulated_entities: ['credit_unions', 'insurance', 'pension_plans', 'real_estate', 'mortgage_brokers'],
    api_endpoints: {
      submissions: 'https://api.bcfsa.ca/submissions',
      entities: 'https://api.bcfsa.ca/entities',
      compliance: 'https://api.bcfsa.ca/compliance'
    },
    data_formats: ['json', 'csv'],
    reporting_requirements: {
      'credit_unions': {
        monthly: ['liquidity_monitoring', 'large_exposures'],
        quarterly: ['capital_adequacy', 'financial_performance'],
        annual: ['governance_assessment', 'strategic_plans']
      }
    }
  },
  
  'asic': {
    name: 'Alberta Securities Investment Commission',
    name_fr: 'Commission des valeurs mobilières de l\'Alberta', 
    jurisdiction: 'alberta',
    regulated_entities: ['securities', 'investment_funds'],
    api_endpoints: {
      submissions: 'https://api.albertasecurities.com/filings',
      entities: 'https://api.albertasecurities.com/registrants',
      compliance: 'https://api.albertasecurities.com/enforcement'
    },
    data_formats: ['sedar', 'xml'],
    reporting_requirements: {
      'securities': {
        continuous: ['insider_reports', 'early_warning'],
        annual: ['annual_information_forms', 'proxy_circulars'],
        periodic: ['interim_financials', 'md_a_reports']
      }
    }
  },
  
  'fcss': {
    name: 'Financial and Consumer Services Saskatchewan',
    name_fr: 'Services financiers et à la consommation de la Saskatchewan',
    jurisdiction: 'saskatchewan',
    regulated_entities: ['credit_unions', 'insurance', 'securities', 'payday_lenders'],
    api_endpoints: {
      submissions: 'https://api.fcss.gov.sk.ca/submissions',
      entities: 'https://api.fcss.gov.sk.ca/entities'
    },
    data_formats: ['json', 'pdf']
  }
}

// Get provincial regulator information
app.get('/regulators', async (c) => {
  const { env } = c
  const jurisdiction = c.req.query('jurisdiction')
  
  if (jurisdiction && PROVINCIAL_REGULATORS[jurisdiction]) {
    return c.json({
      success: true,
      data: PROVINCIAL_REGULATORS[jurisdiction]
    })
  }
  
  return c.json({
    success: true,
    data: Object.entries(PROVINCIAL_REGULATORS).map(([code, regulator]) => ({
      code,
      ...regulator
    }))
  })
})

// Submit to provincial regulator
app.post('/submit/:regulator', async (c) => {
  const { env } = c
  const regulatorCode = c.req.param('regulator')
  const submissionData = await c.req.json()
  
  try {
    const regulator = PROVINCIAL_REGULATORS[regulatorCode]
    if (!regulator) {
      return c.json({ success: false, error: 'Invalid regulator' })
    }
    
    // Get entity information to determine applicable requirements
    const entity = await env.DB.prepare(`
      SELECT * FROM entities WHERE id = ?
    `).bind(submissionData.entity_id).first()
    
    if (!entity) {
      return c.json({ success: false, error: 'Entity not found' })
    }
    
    // Check if entity is regulated by this provincial regulator
    const entityJurisdiction = entity.jurisdiction
    if (regulator.jurisdiction !== entityJurisdiction && entityJurisdiction !== 'federal') {
      return c.json({ 
        success: false, 
        error: 'Entity not regulated by this provincial regulator' 
      })
    }
    
    // Transform data for provincial requirements
    const transformedData = await transformForProvincialRegulator(
      submissionData, 
      regulator, 
      entity
    )
    
    // Create provincial submission record
    const submissionResult = await env.DB.prepare(`
      INSERT INTO provincial_submissions (
        entity_id, regulator_code, submission_type, 
        original_data, transformed_data, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(
      submissionData.entity_id,
      regulatorCode,
      submissionData.submission_type,
      JSON.stringify(submissionData),
      JSON.stringify(transformedData)
    ).run()
    
    const submissionId = submissionResult.meta.last_row_id
    
    // In a real implementation, we would make API calls to provincial systems
    // For now, we simulate successful submission
    await env.DB.prepare(`
      UPDATE provincial_submissions 
      SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP,
          external_reference = ?
      WHERE id = ?
    `).bind(`${regulatorCode.toUpperCase()}-${Date.now()}`, submissionId).run()
    
    return c.json({
      success: true,
      data: {
        submission_id: submissionId,
        regulator: regulator.name,
        external_reference: `${regulatorCode.toUpperCase()}-${Date.now()}`,
        status: 'submitted'
      }
    })
    
  } catch (error) {
    console.error('Provincial submission error:', error)
    return c.json({ success: false, error: 'Submission failed' })
  }
})

// Get provincial submission status
app.get('/submissions/:submissionId/status', async (c) => {
  const { env } = c
  const submissionId = c.req.param('submissionId')
  
  const submission = await env.DB.prepare(`
    SELECT ps.*, e.entity_name, e.entity_type
    FROM provincial_submissions ps
    JOIN entities e ON ps.entity_id = e.id
    WHERE ps.id = ?
  `).bind(submissionId).first()
  
  if (!submission) {
    return c.json({ success: false, error: 'Submission not found' })
  }
  
  const regulator = PROVINCIAL_REGULATORS[submission.regulator_code]
  
  return c.json({
    success: true,
    data: {
      ...submission,
      regulator_name: regulator?.name || submission.regulator_code,
      transformed_data: JSON.parse(submission.transformed_data || '{}'),
      original_data: JSON.parse(submission.original_data || '{}')
    }
  })
})

// Get entity's provincial regulatory obligations
app.get('/obligations/:entityId', async (c) => {
  const { env } = c
  const entityId = c.req.param('entityId')
  
  const entity = await env.DB.prepare(`
    SELECT * FROM entities WHERE id = ?
  `).bind(entityId).first()
  
  if (!entity) {
    return c.json({ success: false, error: 'Entity not found' })
  }
  
  // Determine applicable provincial regulators
  const applicableRegulators = []
  
  // Add primary jurisdiction regulator
  if (entity.jurisdiction && entity.jurisdiction !== 'federal') {
    const primaryRegulator = findRegulatorByJurisdiction(entity.jurisdiction)
    if (primaryRegulator) {
      applicableRegulators.push({
        ...primaryRegulator,
        relationship: 'primary',
        requirements: getEntityRequirements(primaryRegulator, entity.entity_type)
      })
    }
  }
  
  // Add federal regulators (OSFI, FCAC) for federally regulated entities
  if (entity.primary_regulator === 'osfi' || entity.entity_type === 'chartered_bank') {
    applicableRegulators.push({
      code: 'osfi',
      name: 'Office of the Superintendent of Financial Institutions',
      relationship: 'federal_primary',
      requirements: getOSFIRequirements(entity.entity_type)
    })
  }
  
  return c.json({
    success: true,
    data: {
      entity_id: entityId,
      entity_name: entity.entity_name,
      applicable_regulators: applicableRegulators,
      total_regulators: applicableRegulators.length
    }
  })
})

// Cross-jurisdictional coordination
app.post('/coordinate', async (c) => {
  const { env } = c
  const { entity_id, submission_type, target_regulators } = await c.req.json()
  
  try {
    // Create coordination workflow
    const coordinationResult = await env.DB.prepare(`
      INSERT INTO regulatory_coordination (
        entity_id, submission_type, target_regulators, 
        status, created_at
      ) VALUES (?, ?, ?, 'initiated', CURRENT_TIMESTAMP)
    `).bind(
      entity_id,
      submission_type,
      JSON.stringify(target_regulators)
    ).run()
    
    const coordinationId = coordinationResult.meta.last_row_id
    
    // Create coordination stages
    const stages = [
      { stage: 'preparation', description: 'Prepare jurisdiction-specific submissions' },
      { stage: 'primary_submission', description: 'Submit to primary regulator' },
      { stage: 'secondary_submissions', description: 'Submit to secondary regulators' },
      { stage: 'coordination', description: 'Inter-regulator coordination' },
      { stage: 'completion', description: 'All submissions completed' }
    ]
    
    for (let i = 0; i < stages.length; i++) {
      await env.DB.prepare(`
        INSERT INTO coordination_stages (
          coordination_id, stage_order, stage_name, 
          description, status, created_at
        ) VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
      `).bind(
        coordinationId,
        i + 1,
        stages[i].stage,
        stages[i].description
      ).run()
    }
    
    return c.json({
      success: true,
      data: {
        coordination_id: coordinationId,
        stages_created: stages.length,
        target_regulators: target_regulators
      }
    })
    
  } catch (error) {
    console.error('Coordination error:', error)
    return c.json({ success: false, error: 'Coordination setup failed' })
  }
})

// Helper functions
async function transformForProvincialRegulator(submissionData: any, regulator: any, entity: any) {
  const transformed = { ...submissionData }
  
  // Add regulator-specific fields
  transformed.regulator_code = regulator.jurisdiction
  transformed.jurisdiction = regulator.jurisdiction
  transformed.entity_provincial_id = entity.provincial_id || entity.id
  
  // Language transformations for Quebec (AMF)
  if (regulator.jurisdiction === 'quebec') {
    transformed.language = 'fr'
    transformed.currency_display = 'CAD (français)'
  }
  
  // Format transformations
  if (regulator.data_formats.includes('sedar')) {
    transformed.format_version = 'SEDAR_XML_2024'
  }
  
  return transformed
}

function findRegulatorByJurisdiction(jurisdiction: string) {
  return Object.entries(PROVINCIAL_REGULATORS)
    .map(([code, reg]) => ({ code, ...reg }))
    .find(reg => reg.jurisdiction === jurisdiction)
}

function getEntityRequirements(regulator: any, entityType: string) {
  const requirements = regulator.reporting_requirements?.[entityType]
  if (!requirements) return null
  
  return {
    quarterly: requirements.quarterly || [],
    annual: requirements.annual || [],
    monthly: requirements.monthly || [],
    continuous: requirements.continuous || []
  }
}

function getOSFIRequirements(entityType: string) {
  const osfiRequirements = {
    'chartered_bank': {
      quarterly: ['bcar', 'regulatory_capital', 'liquidity_coverage'],
      annual: ['icaap', 'audited_statements', 'pillar_3_disclosure']
    },
    'life_insurance': {
      quarterly: ['mccsr', 'investment_holdings'],
      annual: ['actuarial_report', 'orsa', 'regulatory_capital']
    }
  }
  
  return osfiRequirements[entityType] || null
}

export default app