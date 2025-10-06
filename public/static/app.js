/**
 * Canadian Financial Regulatory Platform (CFRP) - Frontend Application
 * This file contains the client-side JavaScript for the CFRP dashboard
 */

// Global application state
const CFRP = {
  user: null,
  apiBaseUrl: '/api/v1',
  currentPage: 'dashboard',
  
  // Initialize the application
  init() {
    console.log('🚀 CFRP Platform Initialized')
    this.setupEventListeners()
    this.checkAuthStatus()
    this.loadDashboardData()
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
        }
      }
    } catch (error) {
      console.log('No active session')
    }
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
      const response = await fetch(`${CFRP.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        CFRP.user = data.data.user
        CFRP.closeModal()
        CFRP.updateUIForLoggedInUser()
        CFRP.showAlert('success', 'Login successful! Welcome to CFRP Platform.')
        CFRP.loadDashboardData()
      } else {
        CFRP.showAlert('error', data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      CFRP.showAlert('error', 'Network error. Please try again.')
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
    
    // Show dashboard content and hide features
    const dashboardContent = document.getElementById('dashboardContent')
    const featuresContent = document.getElementById('featuresContent')
    
    if (dashboardContent) dashboardContent.style.display = 'block'
    if (featuresContent) featuresContent.style.display = 'none'
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
    if (!this.user) return
    
    try {
      // Load entities
      await this.loadEntities()
      
      // Load recent filings
      await this.loadRecentFilings()
      
      // Load risk alerts
      await this.loadRiskAlerts()
      
      // Load case statistics
      await this.loadCaseStats()
      
    } catch (error) {
      console.error('Dashboard loading error:', error)
    }
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
    
    // Simple client-side navigation simulation
    if (href === '#dashboard' || href === '/') {
      this.showAlert('info', 'Dashboard - Current page')
    } else if (href === '#filings') {
      this.showAlert('info', 'Filings section - Login required for full access')
    } else if (href === '#entities') {
      this.showAlert('info', 'Entities section - Login required for full access')  
    } else if (href === '#risk') {
      this.showAlert('info', 'Risk Analytics - Login required for full access')
    } else {
      this.showAlert('info', `Navigation to: ${href}`)
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
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  CFRP.init()
})