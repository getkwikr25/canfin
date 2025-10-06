import { Context, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { JWTPayload, User, UserRole } from '../types'

const JWT_SECRET = 'cfrp-jwt-secret-key-change-in-production'

// Generate JWT token for user
export async function generateToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    agency: user.agency,
    entity_id: user.entity_id,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }
  
  return await sign(payload, JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET) as JWTPayload
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch (error) {
    return null
  }
}

// Authentication middleware
export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for health check and auth routes
  const path = c.req.path
  if (path === '/api/health' || path.startsWith('/api/auth/')) {
    await next()
    return
  }

  const token = getCookie(c, 'cfrp_token') || c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ 
      success: false, 
      error: 'Authentication required',
      timestamp: new Date().toISOString()
    }, 401)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return c.json({ 
      success: false, 
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    }, 401)
  }

  // Add user info to context
  c.set('user', payload)
  await next()
}

// Role-based authorization middleware
export function requireRole(allowedRoles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload
    
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      }, 403)
    }

    await next()
  }
}

// Check if user can access entity data
export function canAccessEntity(user: JWTPayload, entityId: number): boolean {
  // Admin can access everything
  if (user.role === 'admin') return true
  
  // Regulators can access all entities
  if (user.role === 'regulator') return true
  
  // Institution admins can only access their own entity
  if (user.role === 'institution_admin') {
    return user.entity_id === entityId
  }
  
  return false
}

// Generate random password for demo users
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Hash password (simple implementation for demo)
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'cfrp-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Set secure cookie with JWT
export function setAuthCookie(c: Context, token: string) {
  setCookie(c, 'cfrp_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  })
}

// Clear auth cookie
export function clearAuthCookie(c: Context) {
  setCookie(c, 'cfrp_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 0,
    path: '/'
  })
}