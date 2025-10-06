import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
}

const dashboardAPI = new Hono<{ Bindings: Bindings }>()

// Public dashboard statistics (no auth required)
dashboardAPI.get('/public-stats', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        total_entities: '750+',
        pending_filings: 156,
        risk_alerts: 12,
        open_cases: 34,
        system_health: 'operational',
        last_updated: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to load public dashboard statistics'
    }, 500)
  }
})

// Dashboard statistics for authenticated users
dashboardAPI.get('/stats', async (c) => {
  try {
    // Get user from context (added by auth middleware)
    const user = c.get('user')
    
    if (!user) {
      return c.json({
        success: false,
        error: 'Authentication required'
      }, 401)
    }

    // Return role-specific statistics
    let stats = {}
    
    if (user.role === 'admin') {
      stats = {
        total_entities: 750,
        pending_filings: 23,
        risk_alerts: 5,
        open_cases: 12,
        system_health: 'operational'
      }
    } else if (user.role === 'regulator') {
      stats = {
        total_entities: user.agency === 'osfi' ? 280 : 125,
        pending_filings: 8,
        risk_alerts: 2,
        open_cases: 4,
        system_health: 'operational'
      }
    } else if (user.role === 'institution_admin') {
      stats = {
        total_entities: 1,
        pending_filings: 3,
        risk_alerts: 1,
        open_cases: 0,
        system_health: 'operational'
      }
    } else {
      stats = {
        total_entities: '-',
        pending_filings: '-',
        risk_alerts: '-',
        open_cases: '-',
        system_health: 'operational'
      }
    }

    return c.json({
      success: true,
      data: {
        ...stats,
        user_role: user.role,
        last_updated: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to load dashboard statistics'
    }, 500)
  }
})

// System health check
dashboardAPI.get('/health', async (c) => {
  try {
    const { env } = c
    
    // Check database connectivity
    let dbStatus = 'unknown'
    try {
      await env.DB.prepare('SELECT 1').first()
      dbStatus = 'connected'
    } catch {
      dbStatus = 'error'
    }

    return c.json({
      success: true,
      data: {
        system_status: 'operational',
        database_status: dbStatus,
        api_status: 'operational',
        last_check: new Date().toISOString(),
        uptime: process.uptime ? Math.floor(process.uptime()) : 'unknown'
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Health check failed'
    }, 500)
  }
})

export default dashboardAPI