import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Agency distribution rules and configurations
const AGENCY_RULES = {
  'quarterly_return': ['osfi', 'provincial'], // OSFI + Provincial regulator
  'risk_report': ['osfi', 'fcac'],           // OSFI + FCAC
  'consumer_complaint': ['fcac', 'provincial'], // FCAC + Provincial
  'insurance_filing': ['provincial', 'osfi'],   // Provincial + OSFI
  'capital_adequacy': ['osfi'],                 // OSFI only
  'liquidity_report': ['osfi'],                // OSFI only
  'conduct_report': ['fcac', 'provincial'],     // FCAC + Provincial
  'market_conduct': ['osfi', 'fcac', 'provincial'] // All agencies
}

// Agency-specific formatting requirements
const AGENCY_FORMATS = {
  'osfi': {
    format: 'xml',
    schema: 'OSFI_REGULATORY_2024',
    validation_rules: ['capital_ratios', 'liquidity_coverage', 'stress_testing']
  },
  'fcac': {
    format: 'json',
    schema: 'FCAC_CONSUMER_PROTECTION_2024',
    validation_rules: ['consumer_complaints', 'product_disclosure', 'sales_practices']
  },
  'provincial': {
    format: 'csv',
    schema: 'PROVINCIAL_STANDARD_2024',
    validation_rules: ['licensing', 'local_compliance', 'consumer_protection']
  }
}

// Automatic filing distribution
app.post('/distribute/:filingId', async (c) => {
  const { env } = c
  const filingId = c.req.param('filingId')
  
  try {
    // Get filing details
    const filing = await env.DB.prepare(`
      SELECT f.*, e.jurisdiction, e.entity_type, e.primary_regulator
      FROM filings f
      JOIN entities e ON f.entity_id = e.id
      WHERE f.id = ?
    `).bind(filingId).first()
    
    if (!filing) {
      return c.json({ success: false, error: 'Filing not found' })
    }
    
    // Determine target agencies based on filing type and entity
    const targetAgencies = getTargetAgencies(filing.filing_type, filing.jurisdiction, filing.entity_type)
    
    // Create distribution records
    const distributions = []
    for (const agency of targetAgencies) {
      const distributionId = await createDistribution(env, filingId, agency, filing)
      
      // Format filing for specific agency
      const formattedData = await formatForAgency(filing, agency)
      
      // Create agency-specific submission
      await createAgencySubmission(env, distributionId, agency, formattedData)
      
      distributions.push({
        agency,
        distribution_id: distributionId,
        status: 'distributed',
        format: AGENCY_FORMATS[agency]?.format || 'json'
      })
    }
    
    // Update filing status
    await env.DB.prepare(`
      UPDATE filings 
      SET status = 'distributed', distributed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(filingId).run()
    
    return c.json({
      success: true,
      data: {
        filing_id: filingId,
        distributions,
        total_agencies: distributions.length
      }
    })
    
  } catch (error) {
    console.error('Distribution error:', error)
    return c.json({ success: false, error: 'Distribution failed' })
  }
})

// Get distribution status
app.get('/status/:filingId', async (c) => {
  const { env } = c
  const filingId = c.req.param('filingId')
  
  const distributions = await env.DB.prepare(`
    SELECT agency, status, distributed_at, processed_at, format_type
    FROM filing_distributions
    WHERE filing_id = ?
    ORDER BY distributed_at DESC
  `).bind(filingId).all()
  
  return c.json({
    success: true,
    data: distributions.results
  })
})

// Helper functions
function getTargetAgencies(filingType: string, jurisdiction: string, entityType: string): string[] {
  let agencies = AGENCY_RULES[filingType] || ['osfi']
  
  // Add jurisdiction-specific logic
  if (jurisdiction === 'ontario' && !agencies.includes('fsra')) {
    agencies.push('fsra')
  } else if (jurisdiction === 'quebec' && !agencies.includes('amf')) {
    agencies.push('amf')
  }
  
  // Entity-specific rules
  if (entityType === 'insurance' && !agencies.includes('provincial')) {
    agencies.push('provincial')
  }
  
  return [...new Set(agencies)] // Remove duplicates
}

async function createDistribution(env: any, filingId: string, agency: string, filing: any) {
  const result = await env.DB.prepare(`
    INSERT INTO filing_distributions (
      filing_id, agency, status, distributed_at, format_type, validation_status
    ) VALUES (?, ?, 'pending', CURRENT_TIMESTAMP, ?, 'validating')
  `).bind(
    filingId, 
    agency, 
    AGENCY_FORMATS[agency]?.format || 'json'
  ).run()
  
  return result.meta.last_row_id
}

async function formatForAgency(filing: any, agency: string) {
  const agencyFormat = AGENCY_FORMATS[agency]
  
  // Transform data based on agency requirements
  const baseData = {
    filing_id: filing.id,
    entity_name: filing.entity_name,
    filing_type: filing.filing_type,
    reporting_period: filing.reporting_period,
    submitted_at: filing.submitted_at
  }
  
  switch (agency) {
    case 'osfi':
      return {
        ...baseData,
        regulatory_capital: filing.regulatory_capital || 0,
        tier1_ratio: filing.tier1_ratio || 0,
        leverage_ratio: filing.leverage_ratio || 0,
        format: 'OSFI_XML_2024'
      }
      
    case 'fcac':
      return {
        ...baseData,
        consumer_complaints: filing.consumer_complaints || 0,
        product_sales: filing.product_sales || 0,
        disclosure_score: filing.disclosure_score || 0,
        format: 'FCAC_JSON_2024'
      }
      
    case 'provincial':
    case 'fsra':
    case 'amf':
      return {
        ...baseData,
        local_licenses: filing.local_licenses || [],
        provincial_compliance: filing.provincial_compliance || 'compliant',
        format: 'PROVINCIAL_CSV_2024'
      }
      
    default:
      return baseData
  }
}

async function createAgencySubmission(env: any, distributionId: number, agency: string, formattedData: any) {
  await env.DB.prepare(`
    INSERT INTO agency_submissions (
      distribution_id, agency, formatted_data, created_at, status
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'submitted')
  `).bind(
    distributionId,
    agency,
    JSON.stringify(formattedData)
  ).run()
}

export default app