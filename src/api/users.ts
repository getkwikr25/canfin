import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { DatabaseService } from '../lib/database'
import { generateToken, hashPassword, verifyPassword, verifyToken, setAuthCookie, clearAuthCookie } from '../lib/auth'
import { createApiResponse, validateRequiredFields, validateEmail } from '../lib/utils'
import { LoginRequest, User, UserRole } from '../types'

const userRoutes = new Hono()

// User login
userRoutes.post('/login', async (c) => {
  const requestId = `login_${Date.now()}`
  
  try {
    const body = await c.req.json() as LoginRequest
    const db = new DatabaseService(c.env.DB)
    
    // Validate input
    const errors = validateRequiredFields(body, ['email', 'password'])
    if (errors.length > 0) {
      return c.json(createApiResponse(null, 'Validation failed', requestId), 400)
    }
    
    if (!validateEmail(body.email)) {
      return c.json(createApiResponse(null, 'Invalid email format', requestId), 400)
    }
    
    // Find user by email
    const user = await db.getUserByEmail(body.email)
    if (!user || !user.is_active) {
      return c.json(createApiResponse(null, 'Invalid credentials', requestId), 401)
    }
    
    // Verify password (in production, get hashed password from separate table)
    // For demo, we'll use a default password
    const isValidPassword = body.password === 'demo123' || await verifyPassword(body.password, 'demo-hash')
    if (!isValidPassword) {
      return c.json(createApiResponse(null, 'Invalid credentials', requestId), 401)
    }
    
    // Generate JWT token
    const token = await generateToken(user)
    
    // Set secure cookie
    setAuthCookie(c, token)
    
    // Log successful login
    await db.logAction(user.id, 'login', 'user', user.id, { ip: c.req.header('cf-connecting-ip') })
    
    return c.json(createApiResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agency: user.agency,
        entity_id: user.entity_id
      },
      token
    }, null, requestId))
    
  } catch (error) {
    console.error('Login error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// User logout
userRoutes.post('/logout', async (c) => {
  const requestId = `logout_${Date.now()}`
  
  try {
    clearAuthCookie(c)
    return c.json(createApiResponse({ message: 'Logged out successfully' }, null, requestId))
  } catch (error) {
    console.error('Logout error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get current user profile
userRoutes.get('/profile', async (c) => {
  const requestId = `profile_${Date.now()}`
  
  try {
    // Check for authentication manually since this route needs custom handling
    const token = getCookie(c, 'cfrp_token') || c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return c.json(createApiResponse(null, 'Authentication required', requestId), 401)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return c.json(createApiResponse(null, 'Invalid or expired token', requestId), 401)
    }

    const db = new DatabaseService(c.env.DB)
    
    const user = await db.getUser(payload.user_id)
    if (!user) {
      return c.json(createApiResponse(null, 'User not found', requestId), 404)
    }
    
    return c.json(createApiResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      agency: user.agency,
      entity_id: user.entity_id,
      created_at: user.created_at
    }, null, requestId))
    
  } catch (error) {
    console.error('Profile error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Register new user (admin only)
userRoutes.post('/register', async (c) => {
  const requestId = `register_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    if (userPayload.role !== 'admin') {
      return c.json(createApiResponse(null, 'Admin access required', requestId), 403)
    }
    
    const body = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    
    // Validate input
    const errors = validateRequiredFields(body, ['email', 'name', 'role'])
    if (errors.length > 0) {
      return c.json(createApiResponse(null, 'Validation failed', requestId), 400)
    }
    
    if (!validateEmail(body.email)) {
      return c.json(createApiResponse(null, 'Invalid email format', requestId), 400)
    }
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(body.email)
    if (existingUser) {
      return c.json(createApiResponse(null, 'User already exists', requestId), 409)
    }
    
    // Create new user
    const newUser = await db.createUser({
      email: body.email,
      name: body.name,
      role: body.role as UserRole,
      agency: body.agency,
      entity_id: body.entity_id,
      is_active: true
    })
    
    // Log user creation
    await db.logAction(userPayload.user_id, 'create_user', 'user', newUser.id, { created_user: newUser.email })
    
    return c.json(createApiResponse({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      agency: newUser.agency,
      entity_id: newUser.entity_id,
      created_at: newUser.created_at
    }, null, requestId), 201)
    
  } catch (error) {
    console.error('Registration error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Get all users (admin/regulator only)
userRoutes.get('/', async (c) => {
  const requestId = `get_users_${Date.now()}`
  
  try {
    const userPayload = c.get('user')
    if (!['admin', 'regulator'].includes(userPayload.role)) {
      return c.json(createApiResponse(null, 'Access denied', requestId), 403)
    }
    
    const db = new DatabaseService(c.env.DB)
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = (page - 1) * limit
    
    const users = await db.getUsers(limit, offset)
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      agency: user.agency,
      entity_id: user.entity_id,
      is_active: user.is_active,
      created_at: user.created_at
    }))
    
    return c.json(createApiResponse(sanitizedUsers, null, requestId))
    
  } catch (error) {
    console.error('Get users error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

// Demo endpoint to create sample users
userRoutes.post('/demo/create-sample-users', async (c) => {
  const requestId = `demo_users_${Date.now()}`
  
  try {
    const db = new DatabaseService(c.env.DB)
    
    const sampleUsers = [
      {
        email: 'admin@cfrp.ca',
        name: 'System Administrator',
        role: 'admin' as UserRole,
        agency: 'cfrp',
        entity_id: null,
        is_active: true
      },
      {
        email: 'regulator@osfi.ca',
        name: 'OSFI Regulatory Analyst',
        role: 'regulator' as UserRole,
        agency: 'osfi',
        entity_id: null,
        is_active: true
      },
      {
        email: 'regulator@fcac.ca',
        name: 'FCAC Consumer Protection Officer',
        role: 'regulator' as UserRole,
        agency: 'fcac',
        entity_id: null,
        is_active: true
      },
      {
        email: 'bank.admin@rbc.ca',
        name: 'RBC Compliance Manager',
        role: 'institution_admin' as UserRole,
        agency: null,
        entity_id: 1, // Will be created if doesn't exist
        is_active: true
      },
      {
        email: 'viewer@cfrp.ca',
        name: 'Audit Viewer',
        role: 'viewer' as UserRole,
        agency: 'audit',
        entity_id: null,
        is_active: true
      }
    ]
    
    const createdUsers = []
    
    for (const userData of sampleUsers) {
      // Check if user already exists
      const existing = await db.getUserByEmail(userData.email)
      if (!existing) {
        const user = await db.createUser(userData)
        createdUsers.push(user.email)
      }
    }
    
    return c.json(createApiResponse({
      message: 'Sample users created',
      created_users: createdUsers,
      login_info: {
        any_user: 'demo123',
        note: 'All demo users use password: demo123'
      }
    }, null, requestId))
    
  } catch (error) {
    console.error('Demo users error:', error)
    return c.json(createApiResponse(null, 'Internal server error', requestId), 500)
  }
})

export { userRoutes }