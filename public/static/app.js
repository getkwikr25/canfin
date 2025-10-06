/**
 * Canadian Financial Regulatory Platform (CFRP) - Frontend Application
 * This file contains the client-side JavaScript for the CFRP dashboard
 */

// Global application state
const CFRP = {
  user: null,
  apiBaseUrl: '/api',
  currentPage: 'dashboard',
  
  // Initialize the application
  init() {
    console.log('🚀 CFRP Platform Initialized')
    this.setupEventListeners()
    this.checkAuthStatus()
    this.loadDashboardData()
    // Set initial navigation state
    this.updateNavigationState()
  },

  // Setup event listeners
  setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn')
    if (loginBtn) {
      loginBtn.addEventListener('click', this.showLoginModal.bind(this))
    }

    // Navigation items
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', this.handleNavigation.bind(this))
    })

    // Modal close handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal()
      }
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal()
      }
    })
  },

  // Check if user is authenticated
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/profile`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.user = data.data
          this.updateUIForLoggedInUser()
          return
        }
      }
    } catch (error) {
      console.log('No active session')
    }
    
    // No authenticated user, show public UI
    this.updateUIForPublicUser()
  },

  // Show login modal
  showLoginModal() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">Login to CFRP Platform</h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="loginForm">
              <div class="mb-4">
                <label class="form-label">Email Address</label>
                <input type="email" id="email" class="form-input w-full" required 
                       placeholder="Enter your email" value="admin@cfrp.ca">
              </div>
              <div class="mb-4">
                <label class="form-label">Password</label>
                <input type="password" id="password" class="form-input w-full" required 
                       placeholder="Enter your password" value="demo123">
              </div>
              <div class="mb-4">
                <div class="alert alert-info">
                  <strong>Demo Credentials:</strong><br>
                  • admin@cfrp.ca / demo123 (Administrator)<br>
                  • regulator@osfi.ca / demo123 (Regulator)<br>
                  • compliance@rbc.ca / demo123 (Institution Admin)
                </div>
              </div>
              <div class="flex gap-3">
                <button type="submit" class="btn btn-primary flex-1">
                  <i class="fas fa-sign-in-alt"></i> Login
                </button>
                <button type="button" onclick="CFRP.closeModal()" class="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
    
    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this))
  },

  // Handle login form submission
  async handleLogin(e) {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.user = data.data.user
        this.closeModal()
        this.updateUIForLoggedInUser()
        this.showAlert('success', 'Login successful! Welcome to CFRP Platform.')
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      this.showAlert('error', 'Network error. Please try again.')
    }
  },

  // Update UI for logged-in user
  updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn')
    if (loginBtn && this.user) {
      loginBtn.innerHTML = `
        <div class="flex items-center gap-2">
          <i class="fas fa-user"></i>
          <span class="hidden md:inline">${this.user.name}</span>
          <button onclick="CFRP.logout()" class="ml-2 text-sm hover:bg-red-600 px-2 py-1 rounded">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      `
    }
    
    // Hide hero section for authenticated users (professional regulatory interface)
    const heroSection = document.getElementById('heroSection')
    if (heroSection) {
      heroSection.style.display = 'none'
    }
    
    // Show dashboard content and hide features
    const dashboardContent = document.getElementById('dashboardContent')
    const featuresContent = document.getElementById('featuresContent')
    
    if (dashboardContent) dashboardContent.style.display = 'block'
    if (featuresContent) featuresContent.style.display = 'none'
  },

  // Update UI for public/unauthenticated users
  updateUIForPublicUser() {
    // Show hero section for public users
    const heroSection = document.getElementById('heroSection')
    if (heroSection) {
      heroSection.style.display = 'block'
    }
    
    // Show dashboard content and features for public users
    const dashboardContent = document.getElementById('dashboardContent')
    const featuresContent = document.getElementById('featuresContent')
    
    if (dashboardContent) dashboardContent.style.display = 'block'
    if (featuresContent) featuresContent.style.display = 'block'
  },

  // Logout user
  async logout() {
    try {
      await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    this.user = null
    location.reload()
  },

  // Load dashboard data
  async loadDashboardData() {
    try {
      if (this.user) {
        // Authenticated user - load role-specific dashboard
        this.loadAuthenticatedDashboard()
      } else {
        // Public user - show public/anonymized dashboard
        this.loadPublicDashboard()
      }
    } catch (error) {
      console.error('Dashboard loading error:', error)
    }
  },
  
  // Load role-specific authenticated dashboard
  async loadAuthenticatedDashboard() {
    // Update stats based on user role
    this.updateRoleBasedStats()
    
    // Load different dashboard sections based on user role
    switch (this.user.role) {
      case 'admin':
        this.loadAdminDashboard()
        break
      case 'regulator':
        this.loadRegulatorDashboard()
        break
      case 'institution_admin':
        this.loadInstitutionDashboard()
        break
      case 'viewer':
        this.loadViewerDashboard()
        break
      default:
        // Fallback to basic authenticated dashboard
        await this.loadEntities()
        await this.loadRecentFilings()
        await this.loadRiskAlerts()
        await this.loadCaseStats()
    }
  },
  
  // Update stats based on user role
  updateRoleBasedStats() {
    const totalEntities = document.getElementById('totalEntities')
    const pendingFilings = document.getElementById('pendingFilings') 
    const riskAlerts = document.getElementById('riskAlerts')
    const openCases = document.getElementById('openCases')
    
    if (this.user.role === 'admin') {
      // Admin sees system-wide metrics
      if (totalEntities) totalEntities.textContent = '750'
      if (pendingFilings) pendingFilings.textContent = '23'
      if (riskAlerts) riskAlerts.textContent = '5'
      if (openCases) openCases.textContent = '12'
    } else if (this.user.role === 'regulator') {
      // Regulator sees agency-specific metrics
      if (totalEntities) totalEntities.textContent = this.user.agency === 'osfi' ? '280' : '125'
      if (pendingFilings) pendingFilings.textContent = '8'
      if (riskAlerts) riskAlerts.textContent = '2'
      if (openCases) openCases.textContent = '4'
    } else if (this.user.role === 'institution_admin') {
      // Institution admin sees their entity metrics
      if (totalEntities) totalEntities.textContent = '1'
      if (pendingFilings) pendingFilings.textContent = '3'
      if (riskAlerts) riskAlerts.textContent = '1'
      if (openCases) openCases.textContent = '0'
    } else if (this.user.role === 'viewer') {
      // Viewer sees limited metrics
      if (totalEntities) totalEntities.textContent = '-'
      if (pendingFilings) pendingFilings.textContent = '-'
      if (riskAlerts) riskAlerts.textContent = '-'
      if (openCases) openCases.textContent = '-'
    }
  },
  
  // Admin Dashboard - Full system oversight
  async loadAdminDashboard() {
    await this.loadEntities()
    await this.loadRecentFilings() 
    await this.loadRiskAlerts()
    await this.loadCaseStats()
    
    // Add admin-specific content
    const statsContainer = document.getElementById('statsContainer')
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-cogs mr-2 text-blue-600"></i>
              System Administration
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-blue-50 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">5</div>
                <div class="text-sm text-gray-600">Active Agencies</div>
              </div>
              <div class="p-4 bg-green-50 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600">99.2%</div>
                <div class="text-sm text-gray-600">System Uptime</div>
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <button class="w-full btn btn-secondary text-sm">
                <i class="fas fa-users"></i> User Management
              </button>
              <button class="w-full btn btn-secondary text-sm">
                <i class="fas fa-database"></i> Database Admin
              </button>
              <button class="w-full btn btn-secondary text-sm">
                <i class="fas fa-chart-line"></i> System Analytics
              </button>
            </div>
          </div>
        </div>
      `
    }
  },
  
  // Regulator Dashboard - Agency-specific oversight
  async loadRegulatorDashboard() {
    const agencyName = this.getAgencyFullName(this.user.agency)
    
    // Load filtered data for this regulator's jurisdiction
    await this.loadRegulatorEntities()
    await this.loadRegulatorFilings()
    await this.loadRegulatorRiskAlerts()
    await this.loadRegulatorCases()
  },
  
  // Institution Dashboard - Entity-specific view
  async loadInstitutionDashboard() {
    const entityName = this.getEntityName(this.user.entity_id)
    
    await this.loadInstitutionEntities()
    await this.loadInstitutionFilings()
    await this.loadInstitutionRiskAlerts()
    await this.loadInstitutionCompliance()
  },
  
  // Viewer Dashboard - Read-only audit view
  loadViewerDashboard() {
    this.renderViewerContent()
  },
  
  // Load public dashboard with anonymized/sample data
  loadPublicDashboard() {
    // Update quick stats with public regulatory information
    this.updatePublicStats()
    
    // Show public regulatory overview
    this.renderPublicEntitiesOverview()
    this.renderPublicFilingStatistics()
    this.renderPublicRiskInformation()
    this.renderPublicSystemHealth()
  },
  
  // Update public statistics
  updatePublicStats() {
    // Public regulatory system metrics (anonymized)
    const totalEntities = document.getElementById('totalEntities')
    const pendingFilings = document.getElementById('pendingFilings')
    const riskAlerts = document.getElementById('riskAlerts')
    const openCases = document.getElementById('openCases')
    
    if (totalEntities) totalEntities.textContent = '750+'
    if (pendingFilings) pendingFilings.textContent = '156'
    if (riskAlerts) riskAlerts.textContent = '12'
    if (openCases) openCases.textContent = '34'
  },
  
  // Render public entities overview
  renderPublicEntitiesOverview() {
    const container = document.getElementById('entitiesContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-building mr-2 text-blue-600"></i>
            Canadian Financial System Overview
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">36</div>
              <div class="text-sm text-gray-600">Federal Banks</div>
              <div class="text-xs text-gray-500">OSFI Regulated</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">240+</div>
              <div class="text-sm text-gray-600">Credit Unions</div>
              <div class="text-xs text-gray-500">Provincial</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">280+</div>
              <div class="text-sm text-gray-600">Insurance Companies</div>
              <div class="text-xs text-gray-500">Fed + Provincial</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">190+</div>
              <div class="text-sm text-gray-600">Investment Firms</div>
              <div class="text-xs text-gray-500">Securities Regulated</div>
            </div>
          </div>
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-blue-900">Public Regulatory Information</h4>
                <p class="text-sm text-blue-800 mt-1">
                  Entity counts based on OSFI, FCAC, and provincial regulator public registries. 
                  Login for detailed regulatory access and institution-specific data.
                </p>
                <p class="text-xs text-blue-600 mt-1">
                  Data sources: OSFI Register, Provincial Credit Union Centrals, CSA National Database
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },
  
  // Render public filing statistics
  renderPublicFilingStatistics() {
    const container = document.getElementById('filingsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-file-alt mr-2 text-green-600"></i>
            Regulatory Filing Activity
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium">Quarterly Returns</div>
                <div class="text-sm text-gray-600">Q3 2024 submission period</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">94.2%</div>
                <div class="text-xs text-gray-500">Compliance Rate</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium">Annual Reports</div>
                <div class="text-sm text-gray-600">2023 annual filings</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">98.7%</div>
                <div class="text-xs text-gray-500">Submission Rate</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium">Incident Reports</div>
                <div class="text-sm text-gray-600">Past 30 days</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-orange-600">23</div>
                <div class="text-xs text-gray-500">Reported</div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-green-50 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="fas fa-chart-line text-green-600 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-green-900">Filing Calendar</h4>
                <p class="text-sm text-green-800 mt-1">
                  Next filing deadline: November 15, 2024 (Q3 Liquidity Coverage Reports)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },
  
  // Render public risk information
  renderPublicRiskInformation() {
    const container = document.getElementById('alertsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-shield-alt mr-2 text-blue-600"></i>
            System Risk Overview
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-check-circle text-green-600"></i>
                <span class="font-medium text-green-900">System Stability</span>
              </div>
              <div class="text-2xl font-bold text-green-700">Stable</div>
              <div class="text-sm text-green-600">Overall financial system health</div>
            </div>
            
            <div class="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-chart-bar text-blue-600"></i>
                <span class="font-medium text-blue-900">Capital Adequacy</span>
              </div>
              <div class="text-2xl font-bold text-blue-700">13.8%</div>
              <div class="text-sm text-blue-600">Average sector ratio</div>
            </div>
            
            <div class="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                <span class="font-medium text-yellow-900">Market Volatility</span>
              </div>
              <div class="text-2xl font-bold text-yellow-700">Moderate</div>
              <div class="text-sm text-yellow-600">Current market conditions</div>
            </div>
            
            <div class="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-globe text-purple-600"></i>
                <span class="font-medium text-purple-900">Global Exposure</span>
              </div>
              <div class="text-2xl font-bold text-purple-700">Managed</div>
              <div class="text-sm text-purple-600">International risk exposure</div>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-orange-50 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="fas fa-info-circle text-orange-600 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-orange-900">Public Risk Disclosure</h4>
                <p class="text-sm text-orange-800 mt-1">
                  Detailed risk assessments and specific institution data available to authorized regulatory personnel only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },
  
  // Render public system health
  renderPublicSystemHealth() {
    const container = document.getElementById('statsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-heartbeat mr-2 text-red-600"></i>
            Regulatory System Health
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Filing Compliance Rate</span>
              <span class="text-sm font-bold text-green-600">96.4%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: 96.4%"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">System Response Time</span>
              <span class="text-sm font-bold text-blue-600">< 2.1s</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 92%"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Data Accuracy</span>
              <span class="text-sm font-bold text-purple-600">99.2%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-purple-600 h-2 rounded-full" style="width: 99.2%"></div>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-gray-900">5</div>
              <div class="text-xs text-gray-600">Regulatory Agencies</div>
            </div>
            <div>
              <div class="text-lg font-bold text-gray-900">24/7</div>
              <div class="text-xs text-gray-600">Monitoring</div>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-gray-100 rounded-lg text-center">
            <p class="text-sm text-gray-600">
              Last updated: ${new Date().toLocaleDateString('en-CA', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },

  // Load entities data
  async loadEntities() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/entities?limit=10`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderEntitiesTable(data.data)
        }
      }
    } catch (error) {
      console.error('Entities loading error:', error)
    }
  },

  // Load recent filings
  async loadRecentFilings() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings?limit=10`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderRecentFilings(data.data)
        }
      }
    } catch (error) {
      console.error('Filings loading error:', error)
    }
  },

  // Load risk alerts
  async loadRiskAlerts() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/risk/alerts`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderRiskAlerts(data.data)
        }
      }
    } catch (error) {
      console.error('Risk alerts loading error:', error)
    }
  },

  // Load case statistics
  async loadCaseStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cases/stats/dashboard`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderCaseStats(data.data)
        }
      }
    } catch (error) {
      console.error('Case stats loading error:', error)
    }
  },

  // Render entities table
  renderEntitiesTable(entities) {
    const container = document.getElementById('entitiesContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-building mr-2 text-blue-600"></i>
            Regulated Entities
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Type</th>
                <th>Jurisdiction</th>
                <th>Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${entities.map(entity => `
                <tr onclick="CFRP.showEntityDetails(${entity.id})" class="cursor-pointer">
                  <td class="font-medium">${entity.name}</td>
                  <td>
                    <span class="entity-${entity.type.replace('_', '-')} px-2 py-1 rounded text-xs">
                      ${entity.type_display}
                    </span>
                  </td>
                  <td class="capitalize">${entity.jurisdiction}</td>
                  <td>
                    <span class="risk-${entity.risk_level.toLowerCase()} px-2 py-1 rounded text-xs font-medium">
                      ${entity.risk_score.toFixed(1)} - ${entity.risk_level}
                    </span>
                  </td>
                  <td>
                    <span class="status-${entity.status} px-2 py-1 rounded text-xs capitalize">
                      ${entity.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },

  // Render recent filings
  renderRecentFilings(filings) {
    const container = document.getElementById('filingsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-file-alt mr-2 text-green-600"></i>
            Recent Filings
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Filing Type</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${filings.map(filing => `
                <tr onclick="CFRP.showFilingDetails(${filing.id})" class="cursor-pointer">
                  <td class="font-medium">${filing.entity_name}</td>
                  <td>${filing.filing_type_display}</td>
                  <td>
                    <span class="status-${filing.status} px-2 py-1 rounded text-xs">
                      ${filing.status_display}
                    </span>
                  </td>
                  <td>
                    ${filing.risk_score ? `
                      <span class="risk-${filing.risk_level.toLowerCase()} px-2 py-1 rounded text-xs font-medium">
                        ${filing.risk_score.toFixed(1)}
                      </span>
                    ` : 'N/A'}
                  </td>
                  <td class="text-sm text-gray-600">
                    ${new Date(filing.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },

  // Render risk alerts
  renderRiskAlerts(alertData) {
    const container = document.getElementById('alertsContainer')
    if (!container) return
    
    const alerts = alertData.alerts.slice(0, 5) // Show top 5 alerts
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-exclamation-triangle mr-2 text-red-600"></i>
            Risk Alerts
            <span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">
              ${alertData.critical_alerts + alertData.high_alerts}
            </span>
          </h3>
        </div>
        <div class="p-4">
          ${alerts.length === 0 ? `
            <p class="text-gray-500 text-center py-4">No active risk alerts</p>
          ` : alerts.map(alert => `
            <div class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg mb-3 last:mb-0">
              <div class="flex-shrink-0">
                <i class="fas fa-${alert.severity === 'critical' ? 'exclamation-circle text-red-600' : 'exclamation-triangle text-orange-500'}"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900">${alert.title}</div>
                <div class="text-sm text-gray-600">${alert.description}</div>
                <div class="text-xs text-gray-400 mt-1">
                  ${new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
              <div class="flex-shrink-0">
                <span class="priority-${alert.severity} text-xs font-medium uppercase">
                  ${alert.severity}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
    
    container.innerHTML = html
  },

  // Render case statistics
  renderCaseStats(stats) {
    const container = document.getElementById('statsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
            Case Statistics
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">${stats.total_cases}</div>
              <div class="text-sm text-gray-600">Total Cases</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">${stats.open_cases}</div>
              <div class="text-sm text-gray-600">Open Cases</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">${stats.overdue_cases}</div>
              <div class="text-sm text-gray-600">Overdue</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-600">${stats.closure_rate}%</div>
              <div class="text-sm text-gray-600">Closure Rate</div>
            </div>
          </div>
          
          <div class="mt-6">
            <h4 class="font-medium text-gray-900 mb-3">Cases by Priority</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm">Urgent</span>
                <span class="priority-urgent font-medium">${stats.by_priority.urgent}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">High</span>
                <span class="priority-high font-medium">${stats.by_priority.high}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Medium</span>
                <span class="priority-medium font-medium">${stats.by_priority.medium}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Low</span>
                <span class="priority-low font-medium">${stats.by_priority.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },

  // Show entity details modal
  async showEntityDetails(entityId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/entities/${entityId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const entity = data.data
          
          const modal = `
            <div class="modal-overlay">
              <div class="modal-content max-w-2xl">
                <div class="modal-header">
                  <h3 class="text-xl font-semibold">${entity.name}</h3>
                  <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label class="text-sm font-medium text-gray-600">Entity Type</label>
                      <div class="text-lg">${entity.type_display}</div>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">Registration Number</label>
                      <div class="text-lg">${entity.registration_number}</div>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">Jurisdiction</label>
                      <div class="text-lg capitalize">${entity.jurisdiction}</div>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">Risk Score</label>
                      <div class="text-lg">
                        <span class="risk-${entity.risk_level.toLowerCase()} px-3 py-1 rounded font-medium">
                          ${entity.risk_score.toFixed(1)} - ${entity.risk_level}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <h4 class="font-medium text-gray-900 mb-3">Recent Filings</h4>
                    ${entity.recent_filings && entity.recent_filings.length > 0 ? `
                      <div class="space-y-2">
                        ${entity.recent_filings.map(filing => `
                          <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="text-sm">${filing.filing_type_display}</span>
                            <span class="status-${filing.status} px-2 py-1 rounded text-xs">
                              ${filing.status}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    ` : '<p class="text-gray-500 text-sm">No recent filings</p>'}
                  </div>
                </div>
                <div class="modal-footer">
                  <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
                </div>
              </div>
            </div>
          `
          
          document.body.insertAdjacentHTML('beforeend', modal)
        }
      }
    } catch (error) {
      console.error('Entity details error:', error)
      this.showAlert('error', 'Failed to load entity details')
    }
  },

  // Show filing details modal
  async showFilingDetails(filingId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const filing = data.data
          
          const modal = `
            <div class="modal-overlay">
              <div class="modal-content max-w-2xl">
                <div class="modal-header">
                  <h3 class="text-xl font-semibold">${filing.filing_type_display}</h3>
                  <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label class="text-sm font-medium text-gray-600">Entity</label>
                      <div class="text-lg">${filing.entity_name}</div>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">Status</label>
                      <div class="text-lg">
                        <span class="status-${filing.status} px-3 py-1 rounded">
                          ${filing.status_display}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">Risk Score</label>
                      <div class="text-lg">
                        ${filing.risk_score ? `
                          <span class="risk-${filing.risk_level.toLowerCase()} px-3 py-1 rounded font-medium">
                            ${filing.risk_score.toFixed(1)} - ${filing.risk_level}
                          </span>
                        ` : 'Not assessed'}
                      </div>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">Submitted</label>
                      <div class="text-lg">${new Date(filing.submitted_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  ${filing.validation_errors && filing.validation_errors.length > 0 ? `
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-3">Validation Issues</h4>
                      <div class="space-y-2">
                        ${filing.validation_errors.map(error => `
                          <div class="alert alert-${error.severity === 'error' ? 'error' : 'warning'}">
                            <strong>${error.field}:</strong> ${error.message}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  ${filing.data ? `
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-3">Filing Data</h4>
                      <pre class="bg-gray-100 p-3 rounded text-xs overflow-auto">${JSON.stringify(filing.data, null, 2)}</pre>
                    </div>
                  ` : ''}
                </div>
                <div class="modal-footer">
                  <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
                </div>
              </div>
            </div>
          `
          
          document.body.insertAdjacentHTML('beforeend', modal)
        }
      }
    } catch (error) {
      console.error('Filing details error:', error)
      this.showAlert('error', 'Failed to load filing details')
    }
  },

  // Handle navigation
  handleNavigation(e) {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
    console.log('Navigate to:', href)
    
    // Update current page state
    const oldPage = this.currentPage
    
    // Determine new page based on href
    if (href === '#dashboard' || href === '/' || href === '#') {
      this.currentPage = 'dashboard'
    } else if (href === '#filings') {
      this.currentPage = 'filings'
    } else if (href === '#entities') {
      this.currentPage = 'entities'  
    } else if (href === '#risk') {
      this.currentPage = 'risk'
    } else if (href === '#cases') {
      this.currentPage = 'cases'
    }
    
    // Update navigation UI
    this.updateNavigationState()
    
    // Always show page content (allows dashboard refresh)
    this.showPageContent(this.currentPage)
    
    // Show login prompt for protected sections (not dashboard)
    if (!this.user && ['entities', 'filings', 'risk', 'cases'].includes(this.currentPage)) {
      this.showAlert('info', `Login required for detailed ${this.currentPage} access. Showing public overview.`)
    }
    
    // Show feedback when clicking dashboard
    if (this.currentPage === 'dashboard') {
      this.showAlert('info', 'Dashboard refreshed')
    }
  },
  
  // Update navigation active state
  updateNavigationState() {
    // Update active navigation item
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href')
      const isActive = (
        (href === '#dashboard' || href === '/' || href === '#') && this.currentPage === 'dashboard'
      ) || (
        href === `#${this.currentPage}`
      )
      
      if (isActive) {
        link.classList.add('bg-blue-700', 'text-white')
        link.classList.remove('text-blue-100', 'hover:bg-blue-600')
      } else {
        link.classList.remove('bg-blue-700', 'text-white')
        link.classList.add('text-blue-100', 'hover:bg-blue-600')
      }
    })
  },
  
  // Show page content
  showPageContent(page) {
    // Hide all page sections
    const allSections = ['dashboardContent', 'featuresContent']
    allSections.forEach(sectionId => {
      const section = document.getElementById(sectionId)
      if (section) {
        section.style.display = 'none'
      }
    })
    
    // Show appropriate content based on page
    const dashboardContent = document.getElementById('dashboardContent')
    
    if (page === 'dashboard') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        // Always load dashboard - public or authenticated view
        this.loadDashboardData()
      }
    } else if (page === 'entities') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        this.showEntitiesPage()
      }
    } else if (page === 'filings') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        this.showFilingsPage()
      }
    } else if (page === 'risk') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        this.showRiskPage()
      }
    } else if (page === 'cases') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        this.showCasesPage()
      }
    }
  },
  
  // Show entities page
  async showEntitiesPage() {
    if (!this.user) {
      this.showPublicEntitiesPage()
      return
    }
    
    // Clear dashboard content and show entities-focused view
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="p-6 text-center"><div class="spinner mx-auto mb-4"></div><p class="text-gray-600">Loading all entities...</p></div></div>'
      await this.loadAllEntities()
    }
    
    if (filingsContainer) {
      filingsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-building mr-2 text-blue-600"></i>Entity Management</h3></div><div class="p-6"><p class="text-gray-600">Entity registration, updates, and compliance tracking tools.</p></div></div>'
    }
    
    if (alertsContainer) {
      alertsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-chart-bar mr-2 text-blue-600"></i>Entity Statistics</h3></div><div class="p-6"><p class="text-gray-600">Entity risk distribution, compliance rates, and regulatory metrics.</p></div></div>'
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-tools mr-2 text-blue-600"></i>Entity Tools</h3></div><div class="p-6"><p class="text-gray-600">Entity search, filtering, bulk operations, and export capabilities.</p></div></div>'
    }
  },
  
  // Show filings page
  async showFilingsPage() {
    if (!this.user) {
      this.showPublicFilingsPage()
      return
    }
    
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (filingsContainer) {
      filingsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="p-6 text-center"><div class="spinner mx-auto mb-4"></div><p class="text-gray-600">Loading all filings...</p></div></div>'
      await this.loadAllFilings()
    }
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-upload mr-2 text-green-600"></i>Filing Submission</h3></div><div class="p-6"><p class="text-gray-600">Submit quarterly returns, annual reports, incident reports, and compliance filings.</p></div></div>'
    }
    
    if (alertsContainer) {
      alertsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-check-circle mr-2 text-green-600"></i>Filing Validation</h3></div><div class="p-6"><p class="text-gray-600">Automated validation, error checking, and compliance verification.</p></div></div>'
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-calendar mr-2 text-green-600"></i>Filing Calendar</h3></div><div class="p-6"><p class="text-gray-600">Upcoming deadlines, submission schedules, and regulatory calendar.</p></div></div>'
    }
  },
  
  // Show risk page
  async showRiskPage() {
    if (!this.user) {
      this.showPublicRiskPage()
      return
    }
    
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (alertsContainer) {
      alertsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="p-6 text-center"><div class="spinner mx-auto mb-4"></div><p class="text-gray-600">Loading risk alerts...</p></div></div>'
      await this.loadRiskAlerts()
    }
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-exclamation-triangle mr-2 text-red-600"></i>Risk Assessment</h3></div><div class="p-6"><p class="text-gray-600">AI-powered risk scoring, anomaly detection, and predictive analytics.</p></div></div>'
    }
    
    if (filingsContainer) {
      filingsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-shield-alt mr-2 text-red-600"></i>Risk Mitigation</h3></div><div class="p-6"><p class="text-gray-600">Risk treatment plans, mitigation strategies, and regulatory interventions.</p></div></div>'
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900"><i class="fas fa-chart-line mr-2 text-red-600"></i>Risk Analytics</h3></div><div class="p-6"><p class="text-gray-600">Risk trending, correlation analysis, and regulatory reporting dashboards.</p></div></div>'
    }
  },
  
  // Load all entities (expanded view)
  async loadAllEntities() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/entities?limit=50`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderEntitiesTableExpanded(data.data)
        }
      }
    } catch (error) {
      console.error('All entities loading error:', error)
    }
  },
  
  // Load all filings (expanded view)
  async loadAllFilings() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings?limit=50`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderFilingsTableExpanded(data.data)
        }
      }
    } catch (error) {
      console.error('All filings loading error:', error)
    }
  },
  
  // Render expanded entities table
  renderEntitiesTableExpanded(entities) {
    const container = document.getElementById('entitiesContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-building mr-2 text-blue-600"></i>
              All Regulated Entities (${entities.length})
            </h3>
            <div class="flex gap-2">
              <button class="btn btn-secondary text-sm">
                <i class="fas fa-filter"></i> Filter
              </button>
              <button class="btn btn-secondary text-sm">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Type</th>
                <th>Jurisdiction</th>
                <th>Registration #</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${entities.map(entity => `
                <tr>
                  <td class="font-medium">
                    <div>
                      <div class="font-medium text-gray-900">${entity.name}</div>
                      <div class="text-sm text-gray-500">ID: ${entity.id}</div>
                    </div>
                  </td>
                  <td>
                    <span class="entity-${entity.type.replace('_', '-')} px-2 py-1 rounded text-xs">
                      ${entity.type_display}
                    </span>
                  </td>
                  <td class="capitalize">${entity.jurisdiction}</td>
                  <td class="font-mono text-sm">${entity.registration_number}</td>
                  <td>
                    <span class="risk-${entity.risk_level.toLowerCase()} px-2 py-1 rounded text-xs font-medium">
                      ${entity.risk_score.toFixed(1)} - ${entity.risk_level}
                    </span>
                  </td>
                  <td>
                    <span class="status-${entity.status} px-2 py-1 rounded text-xs capitalize">
                      ${entity.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button onclick="CFRP.showEntityDetails(${entity.id})" class="btn-icon text-blue-600 hover:bg-blue-50" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon text-green-600 hover:bg-green-50" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon text-purple-600 hover:bg-purple-50" title="Filings">
                        <i class="fas fa-file-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-between items-center text-sm text-gray-600">
            <span>Showing ${entities.length} entities</span>
            <div class="flex gap-2">
              <button class="btn btn-secondary text-sm">Previous</button>
              <button class="btn btn-secondary text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },
  
  // Render expanded filings table
  renderFilingsTableExpanded(filings) {
    const container = document.getElementById('filingsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-file-alt mr-2 text-green-600"></i>
              All Regulatory Filings (${filings.length})
            </h3>
            <div class="flex gap-2">
              <button class="btn btn-secondary text-sm">
                <i class="fas fa-filter"></i> Filter
              </button>
              <button class="btn btn-primary text-sm">
                <i class="fas fa-upload"></i> New Filing
              </button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Filing Type</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Submitted</th>
                <th>Reviewed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filings.map(filing => `
                <tr>
                  <td class="font-medium">
                    <div>
                      <div class="font-medium text-gray-900">${filing.entity_name}</div>
                      <div class="text-sm text-gray-500">Filing #${filing.id}</div>
                    </div>
                  </td>
                  <td>
                    <span class="filing-type px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      ${filing.filing_type_display}
                    </span>
                  </td>
                  <td>
                    <span class="status-${filing.status} px-2 py-1 rounded text-xs">
                      ${filing.status_display}
                    </span>
                  </td>
                  <td>
                    ${filing.risk_score ? `
                      <span class="risk-${filing.risk_level.toLowerCase()} px-2 py-1 rounded text-xs font-medium">
                        ${filing.risk_score.toFixed(1)}
                      </span>
                    ` : '<span class="text-gray-400">N/A</span>'}
                  </td>
                  <td class="text-sm text-gray-600">
                    ${new Date(filing.submitted_at).toLocaleDateString()}
                  </td>
                  <td class="text-sm text-gray-600">
                    ${filing.reviewed_at ? new Date(filing.reviewed_at).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button onclick="CFRP.showFilingDetails(${filing.id})" class="btn-icon text-blue-600 hover:bg-blue-50" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon text-green-600 hover:bg-green-50" title="Review">
                        <i class="fas fa-check-circle"></i>
                      </button>
                      <button class="btn-icon text-orange-600 hover:bg-orange-50" title="Download">
                        <i class="fas fa-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-between items-center text-sm text-gray-600">
            <span>Showing ${filings.length} filings</span>
            <div class="flex gap-2">
              <button class="btn btn-secondary text-sm">Previous</button>
              <button class="btn btn-secondary text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
  },

  // Show public entities page
  showPublicEntitiesPage() {
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-building mr-2 text-blue-600"></i>
              Entity Types in Canadian Financial System
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="border-l-4 border-blue-500 pl-4">
                  <h4 class="font-medium text-gray-900">Federal Banks</h4>
                  <p class="text-sm text-gray-600">Regulated by OSFI, including Big Six banks and international subsidiaries</p>
                </div>
                <div class="border-l-4 border-green-500 pl-4">
                  <h4 class="font-medium text-gray-900">Credit Unions</h4>
                  <p class="text-sm text-gray-600">Provincially regulated cooperative financial institutions</p>
                </div>
                <div class="border-l-4 border-purple-500 pl-4">
                  <h4 class="font-medium text-gray-900">Insurance Companies</h4>
                  <p class="text-sm text-gray-600">Life, property, and casualty insurers under federal and provincial oversight</p>
                </div>
              </div>
              <div class="space-y-4">
                <div class="border-l-4 border-orange-500 pl-4">
                  <h4 class="font-medium text-gray-900">Investment Firms</h4>
                  <p class="text-sm text-gray-600">Securities dealers, investment advisors, and fund managers</p>
                </div>
                <div class="border-l-4 border-red-500 pl-4">
                  <h4 class="font-medium text-gray-900">Trust Companies</h4>
                  <p class="text-sm text-gray-600">Fiduciary service providers and estate administrators</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p class="text-sm text-blue-800">
                    <i class="fas fa-lock mr-2"></i>
                    <strong>Login required</strong> for detailed entity data, risk scores, and compliance records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    if (filingsContainer) {
      filingsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-users mr-2 text-blue-600"></i>
              Regulatory Agencies
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-university text-blue-600"></i>
              </div>
              <div>
                <h4 class="font-medium">OSFI - Office of the Superintendent of Financial Institutions</h4>
                <p class="text-sm text-gray-600">Federal prudential regulator for banks, insurers, and trust companies</p>
              </div>
            </div>
            <div class="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-shield-alt text-green-600"></i>
              </div>
              <div>
                <h4 class="font-medium">FCAC - Financial Consumer Agency of Canada</h4>
                <p class="text-sm text-gray-600">Consumer protection and market conduct oversight</p>
              </div>
            </div>
            <div class="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-maple-leaf text-purple-600"></i>
              </div>
              <div>
                <h4 class="font-medium">Provincial Regulators</h4>
                <p class="text-sm text-gray-600">FSRA (Ontario), AMF (Quebec), and other provincial financial services regulators</p>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
              Public Statistics
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">750+</div>
                <div class="text-sm text-gray-600">Total Entities</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">$8.9T</div>
                <div class="text-sm text-gray-600">Total Assets</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">13.2%</div>
                <div class="text-sm text-gray-600">Avg Capital Ratio</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">98.1%</div>
                <div class="text-sm text-gray-600">Compliance Rate</div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-info-circle mr-2 text-blue-600"></i>
              Access Information
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-medium text-blue-900 mb-2">For Financial Institutions</h4>
                <p class="text-sm text-blue-800">Access your entity profile, submit filings, and manage compliance requirements.</p>
                <button onclick="CFRP.showLoginModal()" class="mt-3 btn btn-primary text-sm">
                  <i class="fas fa-sign-in-alt"></i> Institution Login
                </button>
              </div>
              <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 class="font-medium text-green-900 mb-2">For Regulators</h4>
                <p class="text-sm text-green-800">Review filings, conduct oversight, and access regulatory tools.</p>
                <button onclick="CFRP.showLoginModal()" class="mt-3 btn btn-success text-sm">
                  <i class="fas fa-user-shield"></i> Regulator Access
                </button>
              </div>
            </div>
          </div>
        </div>
      `
    }
  },
  
  // Show public filings page
  showPublicFilingsPage() {
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (filingsContainer) {
      filingsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-file-alt mr-2 text-green-600"></i>
              Filing Requirements & Deadlines
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center p-4 bg-green-50 border-l-4 border-green-500">
                <div>
                  <h4 class="font-medium text-green-900">Quarterly Capital Returns</h4>
                  <p class="text-sm text-green-700">Due 45 days after quarter end</p>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-green-900">Next: Nov 15, 2024</div>
                  <div class="text-xs text-green-600">Q3 2024</div>
                </div>
              </div>
              
              <div class="flex justify-between items-center p-4 bg-blue-50 border-l-4 border-blue-500">
                <div>
                  <h4 class="font-medium text-blue-900">Annual Financial Returns</h4>
                  <p class="text-sm text-blue-700">Due 90 days after fiscal year end</p>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-blue-900">Next: Mar 31, 2025</div>
                  <div class="text-xs text-blue-600">FY 2024</div>
                </div>
              </div>
              
              <div class="flex justify-between items-center p-4 bg-orange-50 border-l-4 border-orange-500">
                <div>
                  <h4 class="font-medium text-orange-900">Incident Reports</h4>
                  <p class="text-sm text-orange-700">Within 72 hours of discovery</p>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-orange-900">As Required</div>
                  <div class="text-xs text-orange-600">Ongoing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-calendar mr-2 text-blue-600"></i>
              2024 Filing Calendar
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 pb-2 border-b">
                <div>Period</div>
                <div>Filing Type</div>
                <div>Deadline</div>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm py-2">
                <div>Q3 2024</div>
                <div>Liquidity Coverage</div>
                <div class="font-medium text-orange-600">Nov 15, 2024</div>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm py-2 bg-gray-50">
                <div>Q4 2024</div>
                <div>Capital Adequacy</div>
                <div>Feb 15, 2025</div>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm py-2">
                <div>FY 2024</div>
                <div>Annual Report</div>
                <div>Mar 31, 2025</div>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm py-2 bg-gray-50">
                <div>Q1 2025</div>
                <div>Stress Test Results</div>
                <div>May 15, 2025</div>
              </div>
            </div>
            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                <i class="fas fa-clock mr-2"></i>
                Filing submissions and detailed compliance tracking available after login.
              </p>
            </div>
          </div>
        </div>
      `
    }
    
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-check-circle mr-2 text-green-600"></i>
              Filing Compliance Rates
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm">Banks - Quarterly Returns</span>
              <span class="text-sm font-medium text-green-600">98.2%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: 98.2%"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm">Insurance - Annual Reports</span>
              <span class="text-sm font-medium text-blue-600">96.7%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 96.7%"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm">Credit Unions - Compliance</span>
              <span class="text-sm font-medium text-purple-600">94.1%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-purple-600 h-2 rounded-full" style="width: 94.1%"></div>
            </div>
          </div>
        </div>
      `
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-upload mr-2 text-green-600"></i>
              Submit Filings
            </h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Authorized institutions can submit regulatory filings through the secure portal.</p>
            <div class="space-y-3">
              <button onclick="CFRP.showLoginModal()" class="w-full btn btn-primary">
                <i class="fas fa-file-upload mr-2"></i>Submit New Filing
              </button>
              <button onclick="CFRP.showLoginModal()" class="w-full btn btn-secondary">
                <i class="fas fa-search mr-2"></i>Track Filing Status
              </button>
              <button onclick="CFRP.showLoginModal()" class="w-full btn btn-secondary">
                <i class="fas fa-download mr-2"></i>Download Templates
              </button>
            </div>
            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-800">
                <i class="fas fa-info-circle mr-2"></i>
                Need help? Contact your regulatory liaison or check the filing guidelines.
              </p>
            </div>
          </div>
        </div>
      `
    }
  },
  
  // Show public risk page
  showPublicRiskPage() {
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-shield-alt mr-2 text-blue-600"></i>
              Canadian Financial System Risk Profile
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span class="font-medium text-green-900">Systemic Stability</span>
                </div>
                <div class="text-xl font-bold text-green-700">Strong</div>
                <div class="text-sm text-green-600">Well-capitalized banking sector</div>
              </div>
              
              <div class="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <i class="fas fa-chart-line text-blue-600"></i>
                  <span class="font-medium text-blue-900">Market Risk</span>
                </div>
                <div class="text-xl font-bold text-blue-700">Moderate</div>
                <div class="text-sm text-blue-600">Manageable exposure levels</div>
              </div>
              
              <div class="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <i class="fas fa-home text-yellow-600"></i>
                  <span class="font-medium text-yellow-900">Housing Market</span>
                </div>
                <div class="text-xl font-bold text-yellow-700">Monitored</div>
                <div class="text-sm text-yellow-600">Active policy measures in place</div>
              </div>
              
              <div class="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <i class="fas fa-globe text-purple-600"></i>
                  <span class="font-medium text-purple-900">Global Factors</span>
                </div>
                <div class="text-xl font-bold text-purple-700">Resilient</div>
                <div class="text-sm text-purple-600">Diversified international exposure</div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-exclamation-triangle mr-2 text-orange-600"></i>
              Risk Assessment Framework
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="border-l-4 border-blue-500 pl-4">
                <h4 class="font-medium text-blue-900">Credit Risk</h4>
                <p class="text-sm text-gray-600">Assessment of borrower default probability and loss severity</p>
                <div class="mt-2 flex items-center gap-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: 75%"></div>
                  </div>
                  <span class="text-xs text-gray-600 font-medium">Well Managed</span>
                </div>
              </div>
              
              <div class="border-l-4 border-green-500 pl-4">
                <h4 class="font-medium text-green-900">Liquidity Risk</h4>
                <p class="text-sm text-gray-600">Ability to meet short-term obligations and funding needs</p>
                <div class="mt-2 flex items-center gap-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" style="width: 85%"></div>
                  </div>
                  <span class="text-xs text-gray-600 font-medium">Strong</span>
                </div>
              </div>
              
              <div class="border-l-4 border-yellow-500 pl-4">
                <h4 class="font-medium text-yellow-900">Operational Risk</h4>
                <p class="text-sm text-gray-600">Risk of loss from inadequate processes, systems, or events</p>
                <div class="mt-2 flex items-center gap-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-600 h-2 rounded-full" style="width: 60%"></div>
                  </div>
                  <span class="text-xs text-gray-600 font-medium">Monitored</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    if (filingsContainer) {
      filingsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-chart-bar mr-2 text-purple-600"></i>
              Risk Metrics & Indicators
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-gray-900 mb-3">Capital Adequacy</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Tier 1 Capital Ratio</span>
                    <span class="font-medium">13.8%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Common Equity Tier 1</span>
                    <span class="font-medium">12.1%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Total Capital Ratio</span>
                    <span class="font-medium">16.2%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-medium text-gray-900 mb-3">Asset Quality</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>NPL Ratio</span>
                    <span class="font-medium">0.42%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Provision Coverage</span>
                    <span class="font-medium">186%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Net Charge-offs</span>
                    <span class="font-medium">0.18%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600">
                <i class="fas fa-info-circle mr-2"></i>
                Detailed risk assessments and institution-specific metrics available to authorized users.
              </p>
            </div>
          </div>
        </div>
      `
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-tools mr-2 text-red-600"></i>
              Risk Management Tools
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="p-3 border border-gray-200 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">Stress Testing</h4>
                <p class="text-sm text-gray-600">Regulatory stress tests and scenario analysis</p>
              </div>
              
              <div class="p-3 border border-gray-200 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">Early Warning Systems</h4>
                <p class="text-sm text-gray-600">Automated risk monitoring and alerting</p>
              </div>
              
              <div class="p-3 border border-gray-200 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">Regulatory Reporting</h4>
                <p class="text-sm text-gray-600">Risk-based regulatory return submissions</p>
              </div>
              
              <div class="p-3 border border-gray-200 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-1">Supervisory Review</h4>
                <p class="text-sm text-gray-600">Risk assessment and intervention frameworks</p>
              </div>
            </div>
            
            <div class="mt-6">
              <button onclick="CFRP.showLoginModal()" class="w-full btn btn-primary">
                <i class="fas fa-sign-in-alt mr-2"></i>Access Risk Tools
              </button>
            </div>
          </div>
        </div>
      `
    }
  },

  // Close modal
  closeModal() {
    const modal = document.querySelector('.modal-overlay')
    if (modal) {
      modal.remove()
    }
  },

  // Show alert notification
  showAlert(type, message) {
    const alert = document.createElement('div')
    alert.className = `alert alert-${type} fixed top-4 right-4 z-50 max-w-md`
    alert.innerHTML = `
      <div class="flex items-start gap-3">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mt-0.5"></i>
        <div class="flex-1">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `
    
    document.body.appendChild(alert)
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove()
      }
    }, 5000)
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  },

  // Format date
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  },

  // Create sample data
  async createSampleData(type) {
    try {
      let endpoint = ''
      let message = ''
      
      switch (type) {
        case 'users':
          endpoint = '/auth/demo/create-sample-users'
          message = 'sample users'
          break
        case 'entities':
          endpoint = '/entities/demo/create-sample-entities'
          message = 'sample entities'
          break
        case 'filings':
          endpoint = '/filings/demo/create-sample-filings'
          message = 'sample filings'
          break
        case 'cases':
          endpoint = '/cases/demo/create-sample-cases'
          message = 'sample cases'
          break
        default:
          return
      }
      
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', `Successfully created ${message}`)
        // Reload dashboard data after creating sample data
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || `Failed to create ${message}`)
      }
    } catch (error) {
      console.error('Sample data creation error:', error)
      this.showAlert('error', 'Network error while creating sample data')
    }
  },
  
  // Helper functions for role-based content
  getAgencyFullName(agency) {
    const agencies = {
      'osfi': 'Office of the Superintendent of Financial Institutions',
      'fcac': 'Financial Consumer Agency of Canada',
      'fsra': 'Financial Services Regulatory Authority of Ontario',
      'amf': 'Autorité des marchés financiers'
    }
    return agencies[agency] || agency.toUpperCase()
  },
  
  getEntityName(entityId) {
    // This would typically come from an API call, but for demo purposes:
    const entities = {
      1: 'Royal Bank of Canada',
      2: 'Toronto-Dominion Bank',
      3: 'Bank of Nova Scotia',
      4: 'Bank of Montreal',
      5: 'Canadian Imperial Bank of Commerce',
      6: 'Desjardins Group',
      11: 'Questrade Inc.'
    }
    return entities[entityId] || 'Your Institution'
  },
  
  // Regulator-specific data loading
  async loadRegulatorEntities() {
    const container = document.getElementById('entitiesContainer')
    if (!container) return
    
    const agencyName = this.getAgencyFullName(this.user.agency)
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-building mr-2 text-blue-600"></i>
            ${agencyName} - Regulated Entities
          </h3>
        </div>
        <div class="p-6">
          <div class="alert alert-info">
            <i class="fas fa-info-circle mr-2"></i>
            Showing entities under ${agencyName} jurisdiction. Role: ${this.user.role}
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-600">Loading filtered entity data for ${this.user.agency.toUpperCase()} regulatory oversight...</p>
          </div>
        </div>
      </div>
    `
    
    // Load actual filtered entities data
    try {
      const response = await fetch(`${this.apiBaseUrl}/entities?limit=10`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Filter entities based on regulator jurisdiction
          const filteredEntities = data.data.filter(entity => {
            if (this.user.agency === 'osfi') {
              return ['bank', 'insurer', 'trust_company'].includes(entity.type)
            } else if (this.user.agency === 'fcac') {
              return true // FCAC oversees consumer protection across all institutions
            }
            return entity.jurisdiction === this.user.agency
          })
          this.renderEntitiesTable(filteredEntities)
        }
      }
    } catch (error) {
      console.error('Regulator entities loading error:', error)
    }
  },
  
  async loadRegulatorFilings() {
    const container = document.getElementById('filingsContainer')
    if (!container) return
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-file-alt mr-2 text-green-600"></i>
            Pending Reviews - ${this.user.agency.toUpperCase()}
          </h3>
        </div>
        <div class="p-6">
          <div class="alert alert-warning">
            <i class="fas fa-clock mr-2"></i>
            You have 8 filings pending your review as ${this.user.role} at ${this.user.agency.toUpperCase()}
          </div>
        </div>
      </div>
    `
    
    try {
      await this.loadRecentFilings()
    } catch (error) {
      console.error('Regulator filings loading error:', error)
    }
  },
  
  async loadRegulatorRiskAlerts() {
    const container = document.getElementById('alertsContainer')
    if (!container) return
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-exclamation-triangle mr-2 text-red-600"></i>
            ${this.user.agency.toUpperCase()} Risk Alerts
          </h3>
        </div>
        <div class="p-6">
          <div class="alert alert-warning">
            <i class="fas fa-shield-alt mr-2"></i>
            2 medium-priority alerts require your attention for ${this.getAgencyFullName(this.user.agency)}
          </div>
        </div>
      </div>
    `
  },
  
  async loadRegulatorCases() {
    const container = document.getElementById('statsContainer')
    if (!container) return
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-briefcase mr-2 text-purple-600"></i>
            Active Cases - ${this.user.name}
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-yellow-50 border-l-4 border-yellow-400">
              <span class="text-sm">Cases Assigned to You</span>
              <span class="font-medium">4</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 border-l-4 border-blue-400">
              <span class="text-sm">Reviews Completed This Month</span>
              <span class="font-medium">12</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-green-50 border-l-4 border-green-400">
              <span class="text-sm">Avg Review Time</span>
              <span class="font-medium">2.3 days</span>
            </div>
          </div>
        </div>
      </div>
    `
  },
  
  // Institution-specific data loading
  async loadInstitutionEntities() {
    const container = document.getElementById('entitiesContainer')
    if (!container) return
    
    const entityName = this.getEntityName(this.user.entity_id)
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-building mr-2 text-blue-600"></i>
            ${entityName} - Entity Profile
          </h3>
        </div>
        <div class="p-6">
          <div class="alert alert-info">
            <i class="fas fa-user-tie mr-2"></i>
            Welcome ${this.user.name}, ${this.user.role} at ${entityName}
          </div>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="text-sm text-gray-600">Compliance Status</div>
              <div class="text-lg font-medium text-green-700">Compliant</div>
            </div>
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="text-sm text-gray-600">Risk Rating</div>
              <div class="text-lg font-medium text-blue-700">Medium</div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  
  async loadInstitutionFilings() {
    const container = document.getElementById('filingsContainer')
    if (!container) return
    
    const entityName = this.getEntityName(this.user.entity_id)
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-upload mr-2 text-green-600"></i>
            ${entityName} - Filing Dashboard  
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="alert alert-warning">
              <i class="fas fa-clock mr-2"></i>
              Q3 2024 Capital Return due November 15, 2024 (15 days remaining)
            </div>
            <div class="grid grid-cols-3 gap-4">
              <button class="btn btn-primary">
                <i class="fas fa-plus mr-2"></i>New Filing
              </button>
              <button class="btn btn-secondary">
                <i class="fas fa-search mr-2"></i>Track Status
              </button>
              <button class="btn btn-secondary">
                <i class="fas fa-download mr-2"></i>Templates
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  },
  
  async loadInstitutionRiskAlerts() {
    const container = document.getElementById('alertsContainer')
    if (!container) return
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-shield-alt mr-2 text-green-600"></i>
            Risk & Compliance Status
          </h3>
        </div>
        <div class="p-6">
          <div class="alert alert-success">
            <i class="fas fa-check-circle mr-2"></i>
            All compliance requirements are up to date. Next review: January 2025
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span>Capital Adequacy Ratio</span>
              <span class="font-medium text-green-600">12.8%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Liquidity Coverage Ratio</span>
              <span class="font-medium text-green-600">125%</span>
            </div>
          </div>
        </div>
      </div>
    `
  },
  
  async loadInstitutionCompliance() {
    const container = document.getElementById('statsContainer')
    if (!container) return
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-tasks mr-2 text-blue-600"></i>
            Compliance Tasks
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div class="p-3 border border-gray-200 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm">Monthly Risk Report</span>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Due Soon</span>
              </div>
            </div>
            <div class="p-3 border border-gray-200 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm">AML Training Completion</span>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Complete</span>
              </div>
            </div>
            <div class="p-3 border border-gray-200 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm">Incident Response Review</span>
                <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  
  // Viewer dashboard
  renderViewerContent() {
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    const viewerMessage = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-eye mr-2 text-gray-600"></i>
            Audit View - Read Only Access
          </h3>
        </div>
        <div class="p-6">
          <div class="alert alert-info">
            <i class="fas fa-info-circle mr-2"></i>
            You have read-only access as ${this.user.role}. Contact your administrator for additional permissions.
          </div>
        </div>
      </div>
    `
    
    if (entitiesContainer) entitiesContainer.innerHTML = viewerMessage
    if (filingsContainer) filingsContainer.innerHTML = viewerMessage
    if (alertsContainer) alertsContainer.innerHTML = viewerMessage  
    if (statsContainer) statsContainer.innerHTML = viewerMessage
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  CFRP.init()
})