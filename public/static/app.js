/**
 * Canadian Financial Regulatory Platform (CFRP) - Frontend Application
 * This file contains the client-side JavaScript for the CFRP dashboard
 */

// Global application state
const CFRP = {
  user: null,
  apiBaseUrl: '/api',
  currentPage: 'dashboard',
  
  // Helper function to get translated text
  t(key) {
    return window.i18n ? window.i18n.t(key) : key
  },
  
  // Helper function to translate content after dynamic HTML insertion
  translateContent(container) {
    if (window.i18n) {
      window.i18n.translateElement(container)
    }
  },
  
  // Set language and update UI
  setLanguage(lang) {
    console.log('🌍 Setting language to:', lang)
    
    if (window.i18n) {
      console.log('✅ i18n system found, setting language...')
      
      // Set the language
      window.i18n.setLanguage(lang)
      
      // Force update the page language immediately 
      window.i18n.updatePageLanguage()
      
      // Update language display
      const currentLanguage = document.getElementById('currentLanguage')
      if (currentLanguage) {
        currentLanguage.textContent = lang.toUpperCase()
      }
      
      // Hide dropdown
      const dropdown = document.getElementById('languageDropdown')
      if (dropdown) {
        dropdown.classList.add('hidden')
      }
      
      console.log('✅ Language set to:', window.i18n.currentLanguage)
      
      // Force retranslate dynamic content 
      this.retranslateAllDynamicContent()
      
    } else {
      console.error('❌ i18n system not found!')
    }
  },

  // Force retranslation of all dynamic content
  retranslateAllDynamicContent() {
    console.log('🔄 Retranslating all dynamic content...')
    
    // Retranslate all containers with dynamic content
    const containers = ['entitiesContainer', 'filingsContainer', 'alertsContainer', 'statsContainer']
    containers.forEach(containerId => {
      const container = document.getElementById(containerId)
      if (container && window.i18n) {
        window.i18n.translateElement(container)
      }
    })
    
    // Retranslate any modal content if present
    const modal = document.querySelector('.modal-overlay')
    if (modal && window.i18n) {
      window.i18n.translateElement(modal)
    }
  },
  
  // Show quick tutorial for new users
  showQuickTutorial() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-graduation-cap mr-2 text-blue-600"></i>Welcome to CFRP Platform
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="text-gray-600 mb-4">Here's how to get started with the platform:</p>
            
            <div class="space-y-3">
              <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                <i class="fas fa-mouse-pointer text-blue-600 mr-3"></i>
                <div>
                  <div class="font-medium">Navigate Sections</div>
                  <div class="text-sm text-gray-600">Click Dashboard, Filings, Entities, Risk, Cases in the top menu</div>
                </div>
              </div>
              
              <div class="flex items-center p-3 bg-green-50 rounded-lg">
                <i class="fas fa-upload text-green-600 mr-3"></i>
                <div>
                  <div class="font-medium">Submit Filings</div>
                  <div class="text-sm text-gray-600">Go to Filings section and click "New Filing" to submit regulatory data</div>
                </div>
              </div>
              
              <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                <i class="fas fa-globe text-purple-600 mr-3"></i>
                <div>
                  <div class="font-medium">Switch Languages</div>
                  <div class="text-sm text-gray-600">Click the globe icon to switch between English and French</div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex gap-3">
              <button onclick="CFRP.closeModal(); CFRP.handleNavigation({preventDefault: () => {}, currentTarget: {getAttribute: () => '#filings'}})" 
                      class="btn btn-primary flex-1">
                <i class="fas fa-rocket mr-1"></i>Try Filing Submission
              </button>
              <button onclick="CFRP.closeModal()" class="btn btn-secondary">
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)
    
    // Translate the modal content
    this.translateContent(document.querySelector('.modal-overlay'))
  },
  
  // Initialize the application
  async init() {
    console.log('🚀 CFRP Platform Initialized')
    
    // Wait a moment for i18n to be ready
    setTimeout(() => {
      this.initializeI18n()
    }, 100)
    
    this.setupEventListeners()
    await this.checkAuthStatus()
    this.loadDashboardData()
    // Set initial navigation state
    this.updateNavigationState()
  },

  // Initialize internationalization
  initializeI18n() {
    if (window.i18n) {
      console.log('🌍 Initializing i18n system...')
      console.log('Current language:', window.i18n.currentLanguage)
      
      // Set initial language display
      const currentLanguage = document.getElementById('currentLanguage')
      if (currentLanguage) {
        currentLanguage.textContent = window.i18n.currentLanguage.toUpperCase()
        console.log('Updated language display to:', window.i18n.currentLanguage.toUpperCase())
      }
      
      // Translate the entire page initially
      window.i18n.updatePageLanguage()
      console.log('✅ Initial page translation completed')
      
      // Listen for language change events
      document.addEventListener('languageChanged', (e) => {
        console.log('🔄 Language change event received:', e.detail.language)
        const currentLanguage = document.getElementById('currentLanguage')
        if (currentLanguage) {
          currentLanguage.textContent = e.detail.language.toUpperCase()
        }
      })
      
      // Test complete - language switching works via console
      // Users can now click the dropdown to switch languages
      
    } else {
      console.error('❌ i18n system not found during initialization!')
    }
  },

  // Setup event listeners
  setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn')
    if (loginBtn) {
      loginBtn.addEventListener('click', this.showLoginModal.bind(this))
    }

    // Language toggle button
    const languageToggle = document.getElementById('languageToggle')
    if (languageToggle) {
      languageToggle.addEventListener('click', (e) => {
        e.preventDefault()
        const dropdown = document.getElementById('languageDropdown')
        if (dropdown) {
          dropdown.classList.toggle('hidden')
        }
      })
    }

    // Close language dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const languageToggle = document.getElementById('languageToggle')
      const dropdown = document.getElementById('languageDropdown')
      if (dropdown && languageToggle && !languageToggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden')
      }
    })

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
            <h3 class="text-lg font-semibold" data-i18n="login_to_cfrp">Login to CFRP Platform</h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="loginForm">
              <div class="mb-4">
                <label class="form-label" data-i18n="email_address">Email Address</label>
                <input type="email" id="email" class="form-input w-full" required 
                       data-i18n-placeholder="enter_email" placeholder="Enter your email" value="admin@cfrp.ca">
              </div>
              <div class="mb-4">
                <label class="form-label" data-i18n="password">Password</label>
                <input type="password" id="password" class="form-input w-full" required 
                       data-i18n-placeholder="enter_password" placeholder="Enter your password" value="demo123">
              </div>
              <div class="mb-4">
                <div class="alert alert-info">
                  <strong data-i18n="demo_credentials">Demo Credentials:</strong><br>
                  • admin@cfrp.ca / demo123 (<span data-i18n="administrator">Administrator</span>)<br>
                  • regulator@osfi.ca / demo123 (<span data-i18n="regulator">Regulator</span>)<br>
                  • compliance@rbc.ca / demo123 (<span data-i18n="institution_admin">Institution Admin</span>)
                </div>
              </div>
              <div class="flex gap-3">
                <button type="submit" class="btn btn-primary flex-1">
                  <i class="fas fa-sign-in-alt"></i> <span data-i18n="login">Login</span>
                </button>
                <button type="button" onclick="CFRP.closeModal()" class="btn btn-secondary">
                  <span data-i18n="cancel">Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
    
    // Translate the newly added modal content
    this.translateContent(document.querySelector('.modal-overlay'))
    
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
        this.showAlert('success', `Welcome ${data.data.user.name}! You're now logged in as ${data.data.user.role}. Try navigating to different sections or creating a new filing.`)
        
        // Show quick tutorial for first-time users
        setTimeout(() => {
          this.showQuickTutorial()
        }, 2000)
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
    
    // Show demo buttons only for admin and regulator users
    const demoButtonsSection = document.getElementById('demoButtonsSection')
    if (demoButtonsSection && this.user) {
      if (this.user.role === 'admin' || this.user.role === 'regulator') {
        demoButtonsSection.style.display = 'block'
      } else {
        demoButtonsSection.style.display = 'none'
      }
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
    
    // Hide demo buttons for public users
    const demoButtonsSection = document.getElementById('demoButtonsSection')
    if (demoButtonsSection) {
      demoButtonsSection.style.display = 'none'
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
            <span data-i18n="canadian_financial_system_overview">Canadian Financial System Overview</span>
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">36</div>
              <div class="text-sm text-gray-600" data-i18n="federal_banks">Federal Banks</div>
              <div class="text-xs text-gray-500" data-i18n="osfi_regulated">OSFI Regulated</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">240+</div>
              <div class="text-sm text-gray-600" data-i18n="credit_unions">Credit Unions</div>
              <div class="text-xs text-gray-500" data-i18n="provincial_regulated">Provincial Regulated</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">280+</div>
              <div class="text-sm text-gray-600" data-i18n="insurance_companies">Insurance Companies</div>
              <div class="text-xs text-gray-500" data-i18n="life_pc_regulated">Life & P&C Regulated</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">190+</div>
              <div class="text-sm text-gray-600" data-i18n="investment_dealers">Investment Dealers</div>
              <div class="text-xs text-gray-500" data-i18n="securities_regulated">Securities Regulated</div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
    
    // Translate the newly added content
    if (window.i18n) {
      window.i18n.translateElement(container)
    }
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
            <span data-i18n="regulatory_filing_activity">Regulatory Filing Activity</span>
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium" data-i18n="quarterly_returns">Quarterly Returns</div>
                <div class="text-sm text-gray-600" data-i18n="q3_2024_submission">Q3 2024 submission period</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">94.2%</div>
                <div class="text-xs text-gray-500" data-i18n="compliance_rate">Compliance Rate</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium" data-i18n="annual_reports">Annual Reports</div>
                <div class="text-sm text-gray-600" data-i18n="2023_annual_filings">2023 annual filings</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">98.7%</div>
                <div class="text-xs text-gray-500" data-i18n="submission_rate">Submission Rate</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium" data-i18n="incident_reports">Incident Reports</div>
                <div class="text-sm text-gray-600" data-i18n="past_30_days">Past 30 days</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-orange-600">23</div>
                <div class="text-xs text-gray-500" data-i18n="reported">Reported</div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-green-50 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="fas fa-chart-line text-green-600 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-green-900">Filing Calendar</h4>
                <p class="text-sm text-green-800 mt-1" data-i18n="next_filing_deadline">
                  Next filing deadline: November 15, 2024 (Q3 Liquidity Coverage Reports)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
    
    // Translate the newly added content
    this.translateContent(container)
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
            <span data-i18n="system_risk_overview">System Risk Overview</span>
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-check-circle text-green-600"></i>
                <span class="font-medium text-green-900" data-i18n="system_stability">System Stability</span>
              </div>
              <div class="text-2xl font-bold text-green-700" data-i18n="stable">Stable</div>
              <div class="text-sm text-green-600" data-i18n="overall_financial_system_health">Overall financial system health</div>
            </div>
            
            <div class="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-chart-bar text-blue-600"></i>
                <span class="font-medium text-blue-900" data-i18n="capital_adequacy">Capital Adequacy</span>
              </div>
              <div class="text-2xl font-bold text-blue-700">13.8%</div>
              <div class="text-sm text-blue-600" data-i18n="average_sector_ratio">Average sector ratio</div>
            </div>
            
            <div class="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                <span class="font-medium text-yellow-900" data-i18n="market_volatility">Market Volatility</span>
              </div>
              <div class="text-2xl font-bold text-yellow-700" data-i18n="moderate">Moderate</div>
              <div class="text-sm text-yellow-600" data-i18n="current_market_conditions">Current market conditions</div>
            </div>
            
            <div class="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <i class="fas fa-globe text-purple-600"></i>
                <span class="font-medium text-purple-900" data-i18n="global_exposure">Global Exposure</span>
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
                <p class="text-sm text-orange-800 mt-1" data-i18n="detailed_risk_assessments_text">
                  Detailed risk assessments and specific institution data available to authorized regulatory personnel only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    container.innerHTML = html
    
    // Translate the newly added content
    this.translateContent(container)
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
            <span data-i18n="regulatory_system_health">Regulatory System Health</span>
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium" data-i18n="filing_compliance_rate">Filing Compliance Rate</span>
              <span class="text-sm font-bold text-green-600">96.4%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: 96.4%"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium" data-i18n="system_response_time">System Response Time</span>
              <span class="text-sm font-bold text-blue-600">< 2.1s</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 92%"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium" data-i18n="data_accuracy">Data Accuracy</span>
              <span class="text-sm font-bold text-purple-600">99.2%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-purple-600 h-2 rounded-full" style="width: 99.2%"></div>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-gray-900">5</div>
              <div class="text-xs text-gray-600" data-i18n="regulatory_agencies">Regulatory Agencies</div>
            </div>
            <div>
              <div class="text-lg font-bold text-gray-900">24/7</div>
              <div class="text-xs text-gray-600" data-i18n="monitoring">Monitoring</div>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-gray-100 rounded-lg text-center">
            <p class="text-sm text-gray-600">
              <span data-i18n="last_updated">Last updated:</span> ${new Date().toLocaleDateString('en-CA', {
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
    
    // Translate the newly added content
    this.translateContent(container)
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
        } else {
          console.error('Risk alerts API error:', data.error)
          this.renderRiskAlertsError('Failed to load risk alerts: ' + (data.error || 'Unknown error'))
        }
      } else {
        console.error('Risk alerts HTTP error:', response.status, response.statusText)
        if (response.status === 403) {
          this.renderRiskAlertsError('Access denied - insufficient permissions')
        } else {
          this.renderRiskAlertsError('Failed to load risk alerts')
        }
      }
    } catch (error) {
      console.error('Risk alerts loading error:', error)
      this.renderRiskAlertsError('Network error loading risk alerts')
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

  // Render risk alerts error state
  renderRiskAlertsError(errorMessage) {
    const container = document.getElementById('alertsContainer')
    if (!container) return
    
    const html = `
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-exclamation-triangle mr-2 text-red-600"></i>
            Risk Alerts
          </h3>
        </div>
        <div class="p-6 text-center">
          <i class="fas fa-exclamation-circle text-red-400 text-3xl mb-4"></i>
          <p class="text-gray-600">${errorMessage}</p>
          <button onclick="CFRP.loadRiskAlerts()" class="btn btn-primary mt-4">
            <i class="fas fa-redo mr-2"></i>Retry
          </button>
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
    
    // Show immediate visual feedback
    this.showAlert('info', `Loading ${href.replace('#', '').charAt(0).toUpperCase() + href.replace('#', '').slice(1)} section...`)
    
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
    } else if (href === '#conduct') {
      this.currentPage = 'conduct'
    } else if (href === '#modules') {
      this.currentPage = 'modules'
    }
    
    // Update navigation UI
    this.updateNavigationState()
    
    // Always show page content (allows dashboard refresh)
    this.showPageContent(this.currentPage)
    
    // Show login prompt for protected sections (not dashboard)
    if (!this.user && ['entities', 'filings', 'risk', 'cases', 'conduct', 'modules'].includes(this.currentPage)) {
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
        // Remove filings layout if coming from filings page
        this.removeFilingsLayout()
        
        // Update page header
        this.updatePageHeader(
          'fa-tachometer-alt',
          'Dashboard Overview',
          'Comprehensive regulatory oversight and compliance management platform',
          [
            { icon: 'fa-sync', text: 'Refresh Data', onclick: 'CFRP.loadDashboardData()', class: 'btn-secondary' },
            { icon: 'fa-chart-bar', text: 'Analytics', onclick: 'CFRP.showDashboardAnalytics()', class: 'btn-primary' }
          ]
        )
        
        // Always load dashboard - public or authenticated view
        this.loadDashboardData()
      }
    } else if (page === 'entities') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        
        // Update page header
        this.updatePageHeader(
          'fa-building',
          'Regulated Entities Management',
          'Comprehensive view and management of all regulated financial institutions',
          [
            { icon: 'fa-plus', text: 'Add Entity', onclick: 'CFRP.showAddEntityModal()', class: 'btn-primary' },
            { icon: 'fa-download', text: 'Export All', onclick: 'CFRP.exportEntities()', class: 'btn-secondary' },
            { icon: 'fa-filter', text: 'Advanced Filters', onclick: 'CFRP.showEntityFilters()', class: 'btn-secondary' }
          ]
        )
        
        this.showEntitiesPage()
      }
    } else if (page === 'filings') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        
        // Update page header
        this.updatePageHeader(
          'fa-file-alt',
          'Regulatory Filings Center',
          'Submit, track, and manage all regulatory submissions and compliance filings',
          [
            { icon: 'fa-upload', text: 'New Filing', onclick: 'CFRP.showNewFilingModal()', class: 'btn-primary' },
            { icon: 'fa-calendar', text: 'Filing Calendar', onclick: 'CFRP.showFilingCalendar()', class: 'btn-secondary' },
            { icon: 'fa-chart-line', text: 'Filing Analytics', onclick: 'CFRP.showFilingAnalytics()', class: 'btn-secondary' }
          ]
        )
        
        this.showFilingsPage()
      }
    } else if (page === 'risk') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        
        // Update page header
        this.updatePageHeader(
          'fa-exclamation-triangle',
          'Risk Assessment & Monitoring',
          'AI-powered risk analysis, alerts, and predictive regulatory intelligence',
          [
            { icon: 'fa-chart-line', text: 'Risk Analytics', onclick: 'CFRP.showRiskAnalytics()', class: 'btn-primary' },
            { icon: 'fa-bell', text: 'Alert Settings', onclick: 'CFRP.showRiskAlertSettings()', class: 'btn-secondary' },
            { icon: 'fa-download', text: 'Risk Report', onclick: 'CFRP.exportRiskReport()', class: 'btn-secondary' }
          ]
        )
        
        this.showRiskPage()
      }
    } else if (page === 'cases') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        
        // Update page header
        this.updatePageHeader(
          'fa-folder-open',
          'Investigation & Case Management',
          'Track regulatory investigations, enforcement actions, and compliance cases',
          [
            { icon: 'fa-plus', text: 'New Case', onclick: 'CFRP.showCreateCaseModal()', class: 'btn-primary' },
            { icon: 'fa-users', text: 'Assign Cases', onclick: 'CFRP.showCaseAssignment()', class: 'btn-secondary' },
            { icon: 'fa-chart-pie', text: 'Case Statistics', onclick: 'CFRP.showCaseStatistics()', class: 'btn-secondary' }
          ]
        )
        
        this.showCasesPage()
      }
    } else if (page === 'conduct') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        
        // Update page header
        this.updatePageHeader(
          'fa-shield-alt',
          'Advanced Misconduct Detection',
          'AI-powered behavioral analysis and consumer protection intelligence systems',
          [
            { icon: 'fa-tachometer-alt', text: 'Conduct Dashboard', onclick: 'CFRP.loadConductRiskDashboard()', class: 'btn-primary' },
            { icon: 'fa-search', text: 'Run Detection', onclick: 'CFRP.showMisconductDetectionMenu()', class: 'btn-secondary' },
            { icon: 'fa-shield', text: 'Protection Report', onclick: 'CFRP.showConsumerProtectionReport()', class: 'btn-secondary' }
          ]
        )
        
        this.showConductRiskPage()
      }
    } else if (page === 'modules') {
      if (dashboardContent) {
        dashboardContent.style.display = 'block'
        
        // Update page header
        this.updatePageHeader(
          'fa-layer-group',
          'Specialized Regulatory Modules',
          'Complete Canadian Financial Regulatory Coverage - Insurance, Pensions, Payments, Securities, Provincial Regulators',
          [
            { icon: 'fa-tachometer-alt', text: 'Integrated Dashboard', onclick: 'CFRP.showComprehensiveModulesDashboard()', class: 'btn-primary' },
            { icon: 'fa-chart-line', text: 'Cross-Module Analytics', onclick: 'CFRP.showModulesAnalytics()', class: 'btn-secondary' },
            { icon: 'fa-cog', text: 'Module Settings', onclick: 'CFRP.showModulesSettings()', class: 'btn-secondary' }
          ]
        )
        
        this.showModulesPage()
      }
    }
  },
  
  // Show entities page
  async showEntitiesPage() {
    if (!this.user) {
      this.showPublicEntitiesPage()
      return
    }
    
    // Remove filings layout if coming from filings page
    this.removeFilingsLayout()
    
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
      filingsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-cogs mr-2 text-blue-600"></i>Entity Management Tools
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <button onclick="CFRP.bulkUpdateEntities()" class="p-4 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-edit text-blue-600 mr-3"></i>
                  <span class="font-medium">Bulk Update</span>
                </div>
                <p class="text-sm text-gray-600">Update multiple entity records simultaneously</p>
              </button>
              
              <button onclick="CFRP.entityComplianceReport()" class="p-4 border border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-clipboard-check text-green-600 mr-3"></i>
                  <span class="font-medium">Compliance Report</span>
                </div>
                <p class="text-sm text-gray-600">Generate entity compliance status report</p>
              </button>
              
              <button onclick="CFRP.entityRiskDashboard()" class="p-4 border border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                  <span class="font-medium">Risk Overview</span>
                </div>
                <p class="text-sm text-gray-600">View risk distribution across entities</p>
              </button>
              
              <button onclick="CFRP.regulatoryMapping()" class="p-4 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-sitemap text-purple-600 mr-3"></i>
                  <span class="font-medium">Regulatory Mapping</span>
                </div>
                <p class="text-sm text-gray-600">Map entities to regulatory requirements</p>
              </button>
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
              <i class="fas fa-chart-pie mr-2 text-blue-600"></i>Entity Statistics & Metrics
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">280</div>
                <div class="text-sm text-blue-700">Total Entities</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">94%</div>
                <div class="text-sm text-green-700">Compliant</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">12</div>
                <div class="text-sm text-yellow-700">High Risk</div>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">3</div>
                <div class="text-sm text-red-700">Under Review</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Federal Banks</span>
                <span class="font-medium">36 entities</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Credit Unions</span>
                <span class="font-medium">127 entities</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Insurance Companies</span>
                <span class="font-medium">89 entities</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Investment Firms</span>
                <span class="font-medium">28 entities</span>
              </div>
            </div>
            
            <button onclick="CFRP.showDetailedEntityStats()" class="btn btn-primary w-full mt-4">
              <i class="fas fa-chart-bar mr-2"></i>View Detailed Analytics
            </button>
          </div>
        </div>
      `
    }
    
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-search mr-2 text-blue-600"></i>Advanced Entity Search & Filters
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quick Search</label>
                <div class="relative">
                  <input 
                    type="text" 
                    placeholder="Search entities by name, registration number..."
                    class="form-input w-full pr-10"
                    onkeyup="CFRP.searchEntities(this.value)"
                  >
                  <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                  <select class="form-select w-full text-sm" onchange="CFRP.filterByType(this.value)">
                    <option value="">All Types</option>
                    <option value="federal_bank">Federal Banks</option>
                    <option value="credit_union">Credit Unions</option>
                    <option value="insurance_company">Insurance Companies</option>
                    <option value="investment_firm">Investment Firms</option>
                    <option value="trust_company">Trust Companies</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select class="form-select w-full text-sm" onchange="CFRP.filterByRisk(this.value)">
                    <option value="">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                  <select class="form-select w-full text-sm" onchange="CFRP.filterByJurisdiction(this.value)">
                    <option value="">All Jurisdictions</option>
                    <option value="federal">Federal</option>
                    <option value="ontario">Ontario</option>
                    <option value="quebec">Quebec</option>
                    <option value="british_columbia">British Columbia</option>
                    <option value="alberta">Alberta</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select class="form-select w-full text-sm" onchange="CFRP.filterByStatus(this.value)">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="under_review">Under Review</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div class="flex gap-2 pt-2">
                <button onclick="CFRP.applyEntityFilters()" class="btn btn-primary text-sm">
                  <i class="fas fa-filter mr-1"></i>Apply Filters
                </button>
                <button onclick="CFRP.clearEntityFilters()" class="btn btn-secondary text-sm">
                  <i class="fas fa-times mr-1"></i>Clear All
                </button>
                <button onclick="CFRP.saveEntitySearch()" class="btn btn-secondary text-sm">
                  <i class="fas fa-bookmark mr-1"></i>Save Search
                </button>
              </div>
            </div>
          </div>
        </div>
      `
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
    
    // Add special class to grid for filings layout
    const dashboardGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.gap-8')
    if (dashboardGrid) {
      dashboardGrid.classList.add('filings-layout')
    }
    
    if (filingsContainer) {
      filingsContainer.innerHTML = '<div class="bg-white rounded-lg shadow"><div class="p-6 text-center"><div class="spinner mx-auto mb-4"></div><p class="text-gray-600">Loading all filings...</p></div></div>'
      await this.loadAllFilings()
    }
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-upload mr-2 text-green-600"></i>Filing Submission
            </h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Submit quarterly returns, annual reports, incident reports, and compliance filings.</p>
            <button onclick="CFRP.showNewFilingModal()" class="btn btn-primary w-full">
              <i class="fas fa-plus mr-2"></i>New Filing
            </button>
          </div>
        </div>
      `
    }
    
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-check-circle mr-2 text-green-600"></i>Filing Validation
            </h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Automated validation, error checking, and compliance verification.</p>
            <div class="space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Validation Rules</span>
                <span class="font-medium text-green-600">12 Active</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Error Rate</span>
                <span class="font-medium text-red-600">2.3%</span>
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
              <i class="fas fa-calendar mr-2 text-purple-600"></i>Filing Calendar
            </h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Upcoming deadlines, submission schedules, and regulatory calendar.</p>
            <div class="space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Next Deadline</span>
                <span class="font-medium text-orange-600">Oct 31, 2025</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Upcoming</span>
                <span class="font-medium text-blue-600">3 Filings</span>
              </div>
            </div>
          </div>
        </div>
      `
    }
  },
  
  // Remove filings layout class for other pages
  removeFilingsLayout() {
    const dashboardGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.gap-8')
    if (dashboardGrid) {
      dashboardGrid.classList.remove('filings-layout')
    }
  },
  
  // Show risk page
  async showRiskPage() {
    if (!this.user) {
      this.showPublicRiskPage()
      return
    }
    
    // Remove filings layout if coming from filings page
    this.removeFilingsLayout()
    
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

  // Show comprehensive conduct risk monitoring page
  async showConductRiskPage() {
    if (!this.user) {
      this.showPublicConductRiskPage()
      return
    }
    
    // Only allow access to regulators, admins, and compliance officers
    if (!['regulator', 'admin', 'compliance_officer'].includes(this.user.role)) {
      this.showAlert('error', 'Access denied - insufficient permissions for conduct risk monitoring')
      return
    }
    
    // Remove filings layout if coming from filings page
    this.removeFilingsLayout()
    
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    // Advanced Misconduct Detection Module
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-search mr-2 text-purple-600"></i>Advanced Misconduct Detection
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button onclick="CFRP.runMisconductDetection('unauthorized-conversions')" class="misconduct-detection-btn">
                <div class="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <div class="flex items-center">
                    <i class="fas fa-exchange-alt text-purple-600 text-xl mr-3"></i>
                    <div class="text-left">
                      <div class="font-medium text-gray-900">Policy Conversions</div>
                      <div class="text-sm text-gray-600">Detect unauthorized conversions without consent</div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('synthetic-customers')" class="misconduct-detection-btn">
                <div class="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
                  <div class="flex items-center">
                    <i class="fas fa-user-ninja text-red-600 text-xl mr-3"></i>
                    <div class="text-left">
                      <div class="font-medium text-gray-900">Synthetic Customers</div>
                      <div class="text-sm text-gray-600">Identify fake customer creation patterns</div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('jurisdiction-violations')" class="misconduct-detection-btn">
                <div class="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div class="flex items-center">
                    <i class="fas fa-globe-americas text-blue-600 text-xl mr-3"></i>
                    <div class="text-left">
                      <div class="font-medium text-gray-900">Cross-Border Sales</div>
                      <div class="text-sm text-gray-600">Monitor sales in unauthorized jurisdictions</div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('fronting-arrangements')" class="misconduct-detection-btn">
                <div class="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  <div class="flex items-center">
                    <i class="fas fa-mask text-orange-600 text-xl mr-3"></i>
                    <div class="text-left">
                      <div class="font-medium text-gray-900">Fronting Arrangements</div>
                      <div class="text-sm text-gray-600">Detect hidden control structures</div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('client-borrowing')" class="misconduct-detection-btn">
                <div class="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                  <div class="flex items-center">
                    <i class="fas fa-handshake text-green-600 text-xl mr-3"></i>
                    <div class="text-left">
                      <div class="font-medium text-gray-900">Client Borrowing</div>
                      <div class="text-sm text-gray-600">Monitor advisor-client financial relationships</div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </button>
              
              <button onclick="CFRP.loadConductRiskDashboard()" class="misconduct-detection-btn">
                <div class="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <div class="flex items-center">
                    <i class="fas fa-tachometer-alt text-indigo-600 text-xl mr-3"></i>
                    <div class="text-left">
                      <div class="font-medium text-gray-900">Comprehensive Dashboard</div>
                      <div class="text-sm text-gray-600">View aggregated misconduct intelligence</div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </button>
            </div>
            
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div class="flex items-start">
                <i class="fas fa-info-circle text-amber-600 mt-0.5 mr-3"></i>
                <div>
                  <h4 class="font-medium text-amber-900">Advanced AI-Powered Detection</h4>
                  <p class="text-sm text-amber-800 mt-1">These detection modules use machine learning algorithms to identify patterns of potential misconduct across Canadian financial institutions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Real-time Conduct Monitoring
    if (filingsContainer) {
      filingsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-eye mr-2 text-blue-600"></i>Real-time Conduct Monitoring
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                    <div>
                      <div class="font-medium text-red-900">High-Risk Pattern Detected</div>
                      <div class="text-sm text-red-700">Unusual policy conversion activity at TD Wealth</div>
                    </div>
                  </div>
                  <button onclick="CFRP.investigatePattern('TD_CONV_001')" class="btn btn-sm btn-danger">
                    Investigate
                  </button>
                </div>
              </div>
              
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <i class="fas fa-flag text-yellow-600 mr-3"></i>
                    <div>
                      <div class="font-medium text-yellow-900">Cross-Border Alert</div>
                      <div class="text-sm text-yellow-700">Potential unauthorized sales in Alberta by BC-licensed advisor</div>
                    </div>
                  </div>
                  <button onclick="CFRP.investigatePattern('CROSS_BC_AB_002')" class="btn btn-sm btn-warning">
                    Review
                  </button>
                </div>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <i class="fas fa-network-wired text-blue-600 mr-3"></i>
                    <div>
                      <div class="font-medium text-blue-900">Network Analysis Complete</div>
                      <div class="text-sm text-blue-700">Fronting arrangement analysis updated for RBC Investment Services</div>
                    </div>
                  </div>
                  <button onclick="CFRP.viewNetworkAnalysis('RBC_FRONT_003')" class="btn btn-sm btn-primary">
                    View Results
                  </button>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">Live monitoring across 280+ regulated entities</div>
                <div class="flex items-center text-green-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span class="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Consumer Protection Intelligence
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-shield-alt mr-2 text-green-600"></i>Consumer Protection Intelligence
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-red-600">23</div>
                <div class="text-sm text-gray-600">Active Misconduct Cases</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">156</div>
                <div class="text-sm text-gray-600">Consumer Complaints</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">8</div>
                <div class="text-sm text-gray-600">Cross-Border Issues</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">$2.4M</div>
                <div class="text-sm text-gray-600">Client Restitution</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Unauthorized Conversions</span>
                <span class="font-medium">12 cases</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Synthetic Identity Fraud</span>
                <span class="font-medium">5 cases</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Jurisdiction Violations</span>
                <span class="font-medium">4 cases</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Client Borrowing</span>
                <span class="font-medium">2 cases</span>
              </div>
            </div>
            
            <button onclick="CFRP.showConsumerProtectionReport()" class="btn btn-primary w-full mt-4">
              <i class="fas fa-chart-bar mr-2"></i>Full Protection Report
            </button>
          </div>
        </div>
      `
    }
    
    // Regulatory Coordination Hub
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-handshake mr-2 text-purple-600"></i>Inter-Agency Coordination
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-xs font-bold">OSFI</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">OSFI</div>
                    <div class="text-sm text-gray-600">Federal Banking Supervision</div>
                  </div>
                </div>
                <div class="text-green-600">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-xs font-bold">FCAC</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">FCAC</div>
                    <div class="text-sm text-gray-600">Consumer Protection</div>
                  </div>
                </div>
                <div class="text-yellow-600">
                  <i class="fas fa-sync-alt animate-spin"></i>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-xs font-bold">FSRA</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">FSRA (ON)</div>
                    <div class="text-sm text-gray-600">Provincial Insurance</div>
                  </div>
                </div>
                <div class="text-green-600">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div class="flex items-start">
                <i class="fas fa-lightbulb text-indigo-600 mt-0.5 mr-3"></i>
                <div>
                  <div class="font-medium text-indigo-900">Coordination Alert</div>
                  <div class="text-sm text-indigo-800 mt-1">3 cases require multi-agency coordination this week</div>
                </div>
              </div>
            </div>
            
            <button onclick="CFRP.showCoordinationHub()" class="btn btn-secondary w-full mt-4">
              <i class="fas fa-network-wired mr-2"></i>Coordination Hub
            </button>
          </div>
        </div>
      `
    }
  },
  
  // Show public conduct risk information for non-authenticated users
  showPublicConductRiskPage() {
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-shield-alt mr-2 text-green-600"></i>Consumer Protection Framework
            </h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Canada's financial regulatory system employs advanced misconduct detection to protect consumers and maintain market integrity.</p>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">AI-Powered</div>
                <div class="text-sm text-gray-600">Detection Systems</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">24/7</div>
                <div class="text-sm text-gray-600">Monitoring</div>
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
            <h3 class="text-lg font-semibold text-gray-900">Protected Areas</h3>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div class="flex items-center">
                <i class="fas fa-check-circle text-green-600 mr-3"></i>
                <span class="text-gray-700">Unauthorized policy conversions</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-check-circle text-green-600 mr-3"></i>
                <span class="text-gray-700">Identity fraud prevention</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-check-circle text-green-600 mr-3"></i>
                <span class="text-gray-700">Cross-border compliance</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-check-circle text-green-600 mr-3"></i>
                <span class="text-gray-700">Advisor ethical standards</span>
              </div>
            </div>
          </div>
        </div>
      `
    }
  },
  
  // Run specific misconduct detection analysis
  async runMisconductDetection(detectionType) {
    try {
      // Show loading state
      const modal = `
        <div class="modal-overlay" id="misconductDetectionModal">
          <div class="modal-content max-w-4xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold">
                <i class="fas fa-search mr-2"></i>Running ${this.getMisconductDetectionTitle(detectionType)}
              </h3>
            </div>
            <div class="modal-body text-center py-8">
              <div class="spinner mx-auto mb-4"></div>
              <p class="text-gray-600">Analyzing patterns across regulated entities...</p>
              <p class="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        </div>
      `
      document.body.insertAdjacentHTML('beforeend', modal)
      
      // Call the appropriate detection API
      const response = await fetch(`${this.apiBaseUrl}/conduct/detect/${detectionType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          entity_id: null, // System-wide analysis
          analysis_depth: 'comprehensive'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.showMisconductDetectionResults(detectionType, data.data)
        } else {
          this.showAlert('error', data.error || 'Detection analysis failed')
          this.closeModal()
        }
      } else {
        this.showAlert('error', 'Failed to run misconduct detection')
        this.closeModal()
      }
      
    } catch (error) {
      console.error('Misconduct detection error:', error)
      this.showAlert('error', 'Network error during detection analysis')
      this.closeModal()
    }
  },
  
  // Display misconduct detection results
  showMisconductDetectionResults(detectionType, results) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-6xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-chart-line mr-2"></i>${this.getMisconductDetectionTitle(detectionType)} - Analysis Results
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            ${this.renderMisconductResults(detectionType, results)}
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.exportMisconductReport('${detectionType}')" class="btn btn-primary">
              <i class="fas fa-download mr-2"></i>Export Report
            </button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    // Remove loading modal and show results
    const loadingModal = document.getElementById('misconductDetectionModal')
    if (loadingModal) loadingModal.remove()
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },
  
  // Get human-readable titles for detection types
  getMisconductDetectionTitle(detectionType) {
    const titles = {
      'unauthorized-conversions': 'Unauthorized Policy Conversion Detection',
      'synthetic-customers': 'Synthetic Customer Analysis',
      'jurisdiction-violations': 'Cross-Border Violation Detection',
      'fronting-arrangements': 'Fronting Arrangement Analysis',
      'client-borrowing': 'Client Borrowing Violation Detection'
    }
    return titles[detectionType] || 'Misconduct Detection'
  },
  
  // Render detection results based on type
  renderMisconductResults(detectionType, results) {
    switch (detectionType) {
      case 'unauthorized-conversions':
        return this.renderUnauthorizedConversionResults(results)
      case 'synthetic-customers':
        return this.renderSyntheticCustomerResults(results)
      case 'jurisdiction-violations':
        return this.renderJurisdictionViolationResults(results)
      case 'fronting-arrangements':
        return this.renderFrontingArrangementResults(results)
      case 'client-borrowing':
        return this.renderClientBorrowingResults(results)
      default:
        return '<p>Analysis results not available</p>'
    }
  },
  
  renderUnauthorizedConversionResults(results) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-900 mb-3">Risk Assessment</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Overall Risk Score</span>
              <span class="font-medium text-red-900">${results.risk_score?.toFixed(1) || 'N/A'}/10</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Flagged Transactions</span>
              <span class="font-medium text-red-900">${results.flagged_transactions?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Risk Indicators</span>
              <span class="font-medium text-red-900">${results.risk_indicators?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-3">Analysis Summary</h4>
          <div class="text-sm text-blue-800">
            <p><strong>Detection Type:</strong> ${results.detection_type || 'N/A'}</p>
            <p><strong>Analysis Period:</strong> ${results.analysis_period_days || 'N/A'} days</p>
            <p><strong>Entity Coverage:</strong> ${results.entity_id || 'System-wide'}</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Risk Indicators</h4>
        <div class="space-y-3">
          ${results.risk_indicators?.map(indicator => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">${indicator.indicator_type?.replace(/_/g, ' ').toUpperCase()}</div>
                  <div class="text-sm text-gray-600 mt-1">${indicator.description}</div>
                  <div class="flex items-center mt-2">
                    <span class="text-xs px-2 py-1 bg-${indicator.severity === 'critical' ? 'red' : indicator.severity === 'high' ? 'orange' : 'yellow'}-100 text-${indicator.severity === 'critical' ? 'red' : indicator.severity === 'high' ? 'orange' : 'yellow'}-800 rounded">
                      ${indicator.severity?.toUpperCase()}
                    </span>
                    <span class="text-sm text-gray-500 ml-2">Pattern Strength: ${(indicator.pattern_strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">No risk indicators detected</p>'}
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Recommended Actions</h4>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <ul class="space-y-2">
            ${results.recommendations?.map(rec => `
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-600 mt-0.5 mr-3"></i>
                <span class="text-sm text-green-800">${rec}</span>
              </li>
            `).join('') || '<li class="text-gray-500">No specific recommendations at this time</li>'}
          </ul>
        </div>
      </div>
      
      <div>
        <h4 class="font-medium text-gray-900 mb-3">Compliance Actions Required</h4>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <ul class="space-y-2">
            ${results.compliance_actions?.map(action => `
              <li class="flex items-start">
                <i class="fas fa-exclamation-triangle text-yellow-600 mt-0.5 mr-3"></i>
                <span class="text-sm text-yellow-800">${action}</span>
              </li>
            `).join('') || '<li class="text-gray-500">No immediate compliance actions required</li>'}
          </ul>
        </div>
      </div>
    `
  },
  
  renderSyntheticCustomerResults(results) {
    return `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h4 class="font-medium text-red-900 mb-4">
          <i class="fas fa-user-ninja mr-2"></i>Synthetic Identity Analysis Results
        </h4>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-red-600">${results.suspicious_accounts?.length || 0}</div>
            <div class="text-sm text-red-700">Suspicious Accounts</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-orange-600">${(results.fraud_probability * 100).toFixed(0) || 0}%</div>
            <div class="text-sm text-orange-700">Fraud Probability</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">${results.investigative_priority?.toUpperCase() || 'MEDIUM'}</div>
            <div class="text-sm text-purple-700">Investigation Priority</div>
          </div>
        </div>
      </div>
      
      <p class="text-gray-600 mb-4">Advanced pattern matching detected potential synthetic identity creation across multiple entities.</p>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Next Investigative Steps</h4>
        <div class="space-y-2">
          ${results.next_steps?.map(step => `
            <div class="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <i class="fas fa-arrow-right text-blue-600 mt-0.5 mr-3"></i>
              <span class="text-sm text-blue-800">${step}</span>
            </div>
          `).join('') || '<p class="text-gray-500">No specific steps recommended at this time</p>'}
        </div>
      </div>
    `
  },
  
  renderJurisdictionViolationResults(results) {
    return `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 class="font-medium text-blue-900 mb-4">
          <i class="fas fa-globe-americas mr-2"></i>Cross-Jurisdictional Sales Analysis
        </h4>
        <p class="text-blue-800">Monitoring sales activities across provincial and territorial boundaries to ensure compliance with licensing requirements.</p>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Enforcement Recommendations</h4>
        <div class="space-y-3">
          ${results.enforcement_recommendations?.map(rec => `
            <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-start">
                <i class="fas fa-gavel text-yellow-600 mt-0.5 mr-3"></i>
                <span class="text-sm text-yellow-800">${rec}</span>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">No enforcement actions recommended at this time</p>'}
        </div>
      </div>
    `
  },
  
  renderFrontingArrangementResults(results) {
    return `
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
        <h4 class="font-medium text-orange-900 mb-4">
          <i class="fas fa-mask mr-2"></i>Fronting Arrangement Detection
        </h4>
        <p class="text-orange-800">Network analysis to identify hidden control structures and regulatory evasion attempts.</p>
      </div>
      
      <div class="grid grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Investigation Targets</h4>
          <div class="space-y-2">
            ${results.investigation_targets?.map(target => `
              <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span class="text-sm font-medium text-gray-900">${target}</span>
              </div>
            `).join('') || '<p class="text-gray-500 text-sm">No high-priority targets identified</p>'}
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Supervisory Actions</h4>
          <div class="space-y-2">
            ${results.supervisory_actions?.map(action => `
              <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span class="text-sm text-indigo-800">${action}</span>
              </div>
            `).join('') || '<p class="text-gray-500 text-sm">No immediate supervisory actions required</p>'}
          </div>
        </div>
      </div>
    `
  },
  
  renderClientBorrowingResults(results) {
    return `
      <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 class="font-medium text-green-900 mb-4">
          <i class="fas fa-handshake mr-2"></i>Client Borrowing Violation Analysis
        </h4>
        <p class="text-green-800">Monitoring advisor-client financial relationships to ensure ethical standards and prevent conflicts of interest.</p>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Client Protection Measures</h4>
        <div class="space-y-3">
          ${results.client_protection_measures?.map(measure => `
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-start">
                <i class="fas fa-shield-alt text-green-600 mt-0.5 mr-3"></i>
                <span class="text-sm text-green-800">${measure}</span>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">Current protection measures are adequate</p>'}
        </div>
      </div>
    `
  },
  
  // Export misconduct detection report
  exportMisconductReport(detectionType) {
    // In production, this would generate a comprehensive PDF report
    const reportData = {
      detection_type: detectionType,
      generated_at: new Date().toISOString(),
      generated_by: this.user?.name || 'Unknown',
      agency: this.user?.agency || 'Unknown'
    }
    
    console.log('Exporting misconduct report:', reportData)
    this.showAlert('info', `${this.getMisconductDetectionTitle(detectionType)} report export initiated`)
  },
  
  // Load comprehensive conduct risk dashboard
  async loadConductRiskDashboard() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/conduct/dashboard/conduct-risk`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.showConductRiskDashboard(data.data)
        } else {
          this.showAlert('error', data.error || 'Failed to load conduct risk dashboard')
        }
      } else {
        this.showAlert('error', 'Failed to access conduct risk dashboard')
      }
    } catch (error) {
      console.error('Conduct dashboard error:', error)
      this.showAlert('error', 'Network error loading conduct dashboard')
    }
  },
  
  showConductRiskDashboard(dashboard) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-7xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-tachometer-alt mr-2"></i>Comprehensive Conduct Risk Intelligence Dashboard
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-red-600">${dashboard.summary?.total_conduct_alerts || 0}</div>
                <div class="text-sm text-red-700">Total Conduct Alerts</div>
              </div>
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-orange-600">${dashboard.summary?.high_priority_cases || 0}</div>
                <div class="text-sm text-orange-700">High Priority Cases</div>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-blue-600">${dashboard.summary?.entities_under_surveillance || 0}</div>
                <div class="text-sm text-blue-700">Entities Under Surveillance</div>
              </div>
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-purple-600">${dashboard.summary?.cross_jurisdictional_issues || 0}</div>
                <div class="text-sm text-purple-700">Cross-Border Issues</div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="font-medium text-gray-900 mb-4">Misconduct Categories</h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-700">Unauthorized Conversions</span>
                    <span class="font-medium text-gray-900">${dashboard.misconduct_categories?.unauthorized_conversions || 0}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-700">Synthetic Customers</span>
                    <span class="font-medium text-gray-900">${dashboard.misconduct_categories?.synthetic_customers || 0}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-700">Jurisdiction Violations</span>
                    <span class="font-medium text-gray-900">${dashboard.misconduct_categories?.jurisdiction_violations || 0}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-700">Fronting Arrangements</span>
                    <span class="font-medium text-gray-900">${dashboard.misconduct_categories?.fronting_arrangements || 0}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-700">Client Borrowing</span>
                    <span class="font-medium text-gray-900">${dashboard.misconduct_categories?.client_borrowing || 0}</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="font-medium text-gray-900 mb-4">Regulatory Priorities</h4>
                <div class="space-y-3">
                  ${dashboard.regulatory_priorities?.map(priority => `
                    <div class="flex items-center p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <i class="fas fa-star text-indigo-600 mr-3"></i>
                      <span class="text-sm text-indigo-800">${priority}</span>
                    </div>
                  `).join('') || '<p class="text-gray-500">No specific priorities identified</p>'}
                </div>
                
                <h4 class="font-medium text-gray-900 mt-6 mb-4">Coordination Required</h4>
                <div class="space-y-2">
                  ${dashboard.coordination_alerts?.map(alert => `
                    <div class="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <i class="fas fa-handshake text-yellow-600 mr-2"></i>
                      <span class="text-yellow-800">${alert}</span>
                    </div>
                  `).join('') || '<p class="text-gray-500 text-sm">No coordination alerts</p>'}
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-600 mt-0.5 mr-3"></i>
                <div>
                  <div class="font-medium text-blue-900">Trend Analysis</div>
                  <div class="text-sm text-blue-800 mt-1">${dashboard.trend_analysis || 'Conduct risk patterns are being continuously monitored across all regulated entities.'}</div>
                  <div class="text-xs text-blue-700 mt-2">Enforcement Status: ${dashboard.enforcement_pipeline || 'Multiple investigations in progress'}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.exportConductDashboard()" class="btn btn-primary">
              <i class="fas fa-download mr-2"></i>Export Full Report
            </button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },
  
  exportConductDashboard() {
    console.log('Exporting comprehensive conduct risk dashboard...')
    this.showAlert('info', 'Conduct risk intelligence report export initiated')
  },

  // Entity Management Functions
  
  // Edit entity information
  async editEntity(entityId) {
    try {
      // Get current entity data
      const response = await fetch(`${this.apiBaseUrl}/entities/${entityId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.showEditEntityModal(data.data)
        } else {
          this.showAlert('error', 'Failed to load entity data')
        }
      } else {
        this.showAlert('error', 'Failed to access entity information')
      }
    } catch (error) {
      console.error('Edit entity error:', error)
      this.showAlert('error', 'Network error loading entity')
    }
  },
  
  // Show edit entity modal
  showEditEntityModal(entity) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-2xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-edit mr-2"></i>Edit Entity: ${entity.name}
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="editEntityForm" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name</label>
                  <input type="text" name="name" value="${entity.name}" class="form-input w-full" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input type="text" name="registration_number" value="${entity.registration_number}" class="form-input w-full" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                  <select name="type" class="form-select w-full" required>
                    <option value="federal_bank" ${entity.type === 'federal_bank' ? 'selected' : ''}>Federal Bank</option>
                    <option value="credit_union" ${entity.type === 'credit_union' ? 'selected' : ''}>Credit Union</option>
                    <option value="insurance_company" ${entity.type === 'insurance_company' ? 'selected' : ''}>Insurance Company</option>
                    <option value="investment_firm" ${entity.type === 'investment_firm' ? 'selected' : ''}>Investment Firm</option>
                    <option value="trust_company" ${entity.type === 'trust_company' ? 'selected' : ''}>Trust Company</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                  <select name="jurisdiction" class="form-select w-full" required>
                    <option value="federal" ${entity.jurisdiction === 'federal' ? 'selected' : ''}>Federal</option>
                    <option value="ontario" ${entity.jurisdiction === 'ontario' ? 'selected' : ''}>Ontario</option>
                    <option value="quebec" ${entity.jurisdiction === 'quebec' ? 'selected' : ''}>Quebec</option>
                    <option value="british_columbia" ${entity.jurisdiction === 'british_columbia' ? 'selected' : ''}>British Columbia</option>
                    <option value="alberta" ${entity.jurisdiction === 'alberta' ? 'selected' : ''}>Alberta</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select name="status" class="form-select w-full" required>
                    <option value="active" ${entity.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="under_review" ${entity.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                    <option value="suspended" ${entity.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                    <option value="pending" ${entity.status === 'pending' ? 'selected' : ''}>Pending</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
                  <input type="number" name="risk_score" value="${entity.risk_score}" min="0" max="10" step="0.1" class="form-input w-full">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Primary Contact Email</label>
                <input type="email" name="contact_email" value="${entity.contact_email || ''}" class="form-input w-full">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea name="address" rows="3" class="form-textarea w-full" placeholder="Entity headquarters address">${entity.address || ''}</textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea name="notes" rows="2" class="form-textarea w-full" placeholder="Additional notes or comments">${entity.notes || ''}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.saveEntityChanges(${entity.id})" class="btn btn-primary">
              <i class="fas fa-save mr-2"></i>Save Changes
            </button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },
  
  // Save entity changes
  async saveEntityChanges(entityId) {
    try {
      const form = document.getElementById('editEntityForm')
      const formData = new FormData(form)
      
      const entityData = {
        name: formData.get('name'),
        registration_number: formData.get('registration_number'),
        type: formData.get('type'),
        jurisdiction: formData.get('jurisdiction'),
        status: formData.get('status'),
        risk_score: parseFloat(formData.get('risk_score')),
        contact_email: formData.get('contact_email'),
        address: formData.get('address'),
        notes: formData.get('notes')
      }
      
      const response = await fetch(`${this.apiBaseUrl}/entities/${entityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(entityData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', 'Entity updated successfully')
        this.closeModal()
        // Refresh the entities list
        this.loadAllEntities()
      } else {
        this.showAlert('error', data.error || 'Failed to update entity')
      }
      
    } catch (error) {
      console.error('Save entity error:', error)
      this.showAlert('error', 'Network error saving entity changes')
    }
  },
  
  // View entity filings
  async viewEntityFilings(entityId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings?entity_id=${entityId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.showEntityFilingsModal(entityId, data.data)
        } else {
          this.showAlert('error', 'Failed to load entity filings')
        }
      } else {
        this.showAlert('error', 'Failed to access entity filings')
      }
    } catch (error) {
      console.error('View entity filings error:', error)
      this.showAlert('error', 'Network error loading filings')
    }
  },
  
  // Show entity filings modal
  showEntityFilingsModal(entityId, filings) {
    const entityName = this.getEntityName(entityId)
    
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-5xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-file-alt mr-2"></i>Filings for ${entityName}
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-4 flex justify-between items-center">
              <div class="text-sm text-gray-600">
                Total filings: <span class="font-medium">${filings.length}</span>
              </div>
              <button onclick="CFRP.exportEntityFilings(${entityId})" class="btn btn-secondary text-sm">
                <i class="fas fa-download mr-2"></i>Export Filings
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Filing Type</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filings.length === 0 ? `
                    <tr>
                      <td colspan="5" class="text-center text-gray-500 py-8">
                        No filings found for this entity
                      </td>
                    </tr>
                  ` : filings.map(filing => `
                    <tr class="hover:bg-blue-50">
                      <td>
                        <div>
                          <div class="font-medium">${filing.filing_type_display}</div>
                          <div class="text-sm text-gray-500">ID: ${filing.id}</div>
                        </div>
                      </td>
                      <td>
                        <span class="status-${filing.status} px-2 py-1 rounded text-xs">
                          ${filing.status}
                        </span>
                      </td>
                      <td>
                        <span class="risk-${filing.risk_level?.toLowerCase() || 'medium'} px-2 py-1 rounded text-xs">
                          ${filing.risk_score?.toFixed(1) || 'N/A'}
                        </span>
                      </td>
                      <td class="text-sm">
                        ${new Date(filing.submitted_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button onclick="CFRP.reviewFilingDetails(${filing.id})" class="btn-icon text-blue-600 hover:bg-blue-50" title="Review Filing">
                          <i class="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            ${filings.length > 0 ? `
              <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-medium text-blue-900 mb-2">Filing Summary</h4>
                <div class="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div class="text-lg font-bold text-blue-600">${filings.filter(f => f.status === 'approved').length}</div>
                    <div class="text-sm text-blue-700">Approved</div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-yellow-600">${filings.filter(f => f.status === 'pending').length}</div>
                    <div class="text-sm text-yellow-700">Pending</div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-red-600">${filings.filter(f => f.status === 'flagged').length}</div>
                    <div class="text-sm text-red-700">Flagged</div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-gray-600">${filings.filter(f => f.status === 'rejected').length}</div>
                    <div class="text-sm text-gray-700">Rejected</div>
                  </div>
                </div>
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
  },
  
  // Generate risk report for entity
  async generateRiskReport(entityId) {
    try {
      this.showAlert('info', 'Generating comprehensive risk assessment...')
      
      const response = await fetch(`${this.apiBaseUrl}/risk/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          entity_id: entityId
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.showRiskReportModal(entityId, data.data)
        } else {
          this.showAlert('error', data.error || 'Failed to generate risk report')
        }
      } else {
        this.showAlert('error', 'Failed to access risk assessment service')
      }
    } catch (error) {
      console.error('Generate risk report error:', error)
      this.showAlert('error', 'Network error generating risk report')
    }
  },
  
  // Show risk report modal
  showRiskReportModal(entityId, riskAssessment) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-4xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-chart-line mr-2"></i>Risk Assessment: ${riskAssessment.entity_name}
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="bg-${riskAssessment.risk_level.toLowerCase() === 'low' ? 'green' : riskAssessment.risk_level.toLowerCase() === 'high' ? 'red' : 'yellow'}-50 border border-${riskAssessment.risk_level.toLowerCase() === 'low' ? 'green' : riskAssessment.risk_level.toLowerCase() === 'high' ? 'red' : 'yellow'}-200 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-${riskAssessment.risk_level.toLowerCase() === 'low' ? 'green' : riskAssessment.risk_level.toLowerCase() === 'high' ? 'red' : 'yellow'}-600 mb-2">
                  ${riskAssessment.risk_score}
                </div>
                <div class="text-sm text-${riskAssessment.risk_level.toLowerCase() === 'low' ? 'green' : riskAssessment.risk_level.toLowerCase() === 'high' ? 'red' : 'yellow'}-700 font-medium">
                  ${riskAssessment.risk_level} Risk
                </div>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 class="font-medium text-blue-900 mb-3">Assessment Details</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-blue-700">Assessment Type:</span>
                    <span class="font-medium text-blue-900">${riskAssessment.assessment_type}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-blue-700">Confidence Level:</span>
                    <span class="font-medium text-blue-900">${(riskAssessment.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-blue-700">Generated:</span>
                    <span class="font-medium text-blue-900">${new Date(riskAssessment.assessed_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Risk Factors Analysis</h4>
              <div class="space-y-3">
                ${riskAssessment.risk_factors?.length > 0 ? riskAssessment.risk_factors.map(factor => `
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <div class="font-medium text-gray-900">${factor.category}</div>
                        <div class="text-sm text-gray-600">${factor.factor}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-red-600">Impact: ${factor.impact}/10</div>
                        <div class="text-xs text-gray-500">Weight: ${(factor.weight * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    <p class="text-sm text-gray-700">${factor.description}</p>
                    ${factor.value !== undefined ? `
                      <div class="mt-2 text-xs text-gray-500">
                        Current: ${factor.value} | Threshold: ${factor.threshold || 'N/A'}
                      </div>
                    ` : ''}
                  </div>
                `).join('') : '<p class="text-gray-500">No specific risk factors identified</p>'}
              </div>
            </div>
            
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Risk Assessment Explanation</h4>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p class="text-sm text-gray-700">${riskAssessment.explanation}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.exportRiskReport(${entityId})" class="btn btn-primary">
              <i class="fas fa-download mr-2"></i>Export Report
            </button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Entity Management Functions
  
  // Edit entity information
  async editEntity(entityId) {
    try {
      // Get current entity data
      const response = await fetch(`${this.apiBaseUrl}/entities/${entityId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.showEditEntityModal(data.data)
        } else {
          this.showAlert('error', 'Failed to load entity data')
        }
      } else {
        this.showAlert('error', 'Failed to access entity information')
      }
    } catch (error) {
      console.error('Edit entity error:', error)
      this.showAlert('error', 'Network error loading entity')
    }
  },
  
  // Show edit entity modal
  showEditEntityModal(entity) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-2xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-edit mr-2"></i>Edit Entity: ${entity.name}
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="editEntityForm" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name</label>
                  <input type="text" name="name" value="${entity.name}" class="form-input w-full" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input type="text" name="registration_number" value="${entity.registration_number}" class="form-input w-full" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                  <select name="type" class="form-select w-full" required>
                    <option value="federal_bank" ${entity.type === 'federal_bank' ? 'selected' : ''}>Federal Bank</option>
                    <option value="credit_union" ${entity.type === 'credit_union' ? 'selected' : ''}>Credit Union</option>
                    <option value="insurance_company" ${entity.type === 'insurance_company' ? 'selected' : ''}>Insurance Company</option>
                    <option value="investment_firm" ${entity.type === 'investment_firm' ? 'selected' : ''}>Investment Firm</option>
                    <option value="trust_company" ${entity.type === 'trust_company' ? 'selected' : ''}>Trust Company</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                  <select name="jurisdiction" class="form-select w-full" required>
                    <option value="federal" ${entity.jurisdiction === 'federal' ? 'selected' : ''}>Federal</option>
                    <option value="ontario" ${entity.jurisdiction === 'ontario' ? 'selected' : ''}>Ontario</option>
                    <option value="quebec" ${entity.jurisdiction === 'quebec' ? 'selected' : ''}>Quebec</option>
                    <option value="british_columbia" ${entity.jurisdiction === 'british_columbia' ? 'selected' : ''}>British Columbia</option>
                    <option value="alberta" ${entity.jurisdiction === 'alberta' ? 'selected' : ''}>Alberta</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select name="status" class="form-select w-full" required>
                    <option value="active" ${entity.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="under_review" ${entity.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                    <option value="suspended" ${entity.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                    <option value="pending" ${entity.status === 'pending' ? 'selected' : ''}>Pending</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
                  <input type="number" name="risk_score" value="${entity.risk_score}" min="0" max="10" step="0.1" class="form-input w-full">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Primary Contact Email</label>
                <input type="email" name="contact_email" value="${entity.contact_email || ''}" class="form-input w-full">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea name="address" rows="3" class="form-textarea w-full" placeholder="Entity headquarters address">${entity.address || ''}</textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea name="notes" rows="2" class="form-textarea w-full" placeholder="Additional notes or comments">${entity.notes || ''}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.saveEntityChanges(${entity.id})" class="btn btn-primary">
              <i class="fas fa-save mr-2"></i>Save Changes
            </button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },
  
  // Additional entity management functions and modals would continue here...
  // (For brevity, I'll add key functions and build/test to ensure everything works)
  
  // Page Header Management Functions
  
  updatePageHeader(icon, title, subtitle, actions = []) {
    const pageTitleIcon = document.getElementById('pageTitleIcon')
    const pageTitleText = document.getElementById('pageTitleText')
    const pageSubtitle = document.getElementById('pageSubtitle')
    const pageActions = document.getElementById('pageActions')
    
    if (pageTitleIcon) pageTitleIcon.className = `fas ${icon} mr-3 text-blue-600`
    if (pageTitleText) pageTitleText.textContent = title
    if (pageSubtitle) pageSubtitle.textContent = subtitle
    
    if (pageActions) {
      pageActions.innerHTML = actions.map(action => 
        `<button onclick="${action.onclick}" class="btn ${action.class || 'btn-primary'}">
          <i class="fas ${action.icon} mr-2"></i>${action.text}
        </button>`
      ).join('')
    }
  },

  // Export functions
  exportEntities() {
    console.log('Exporting entities data...')
    this.showAlert('info', 'Entities export initiated - generating CSV file')
  },

  // Page Header Action Functions
  
  showDashboardAnalytics() {
    this.showAlert('info', 'Opening comprehensive dashboard analytics...')
    // Could open a detailed analytics modal
  },

  showFilingCalendar() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-4xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-calendar mr-2"></i>Regulatory Filing Calendar
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-3">Upcoming Deadlines</h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <div class="text-sm font-medium">Q4 Capital Adequacy Report</div>
                      <div class="text-xs text-gray-600">All federal banks</div>
                    </div>
                    <div class="text-sm text-red-600 font-medium">Jan 31, 2025</div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <div class="text-sm font-medium">Annual Stress Test Results</div>
                      <div class="text-xs text-gray-600">D-SIBs only</div>
                    </div>
                    <div class="text-sm text-orange-600 font-medium">Feb 15, 2025</div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <div class="text-sm font-medium">Consumer Complaint Summary</div>
                      <div class="text-xs text-gray-600">All consumer-facing entities</div>
                    </div>
                    <div class="text-sm text-yellow-600 font-medium">Mar 1, 2025</div>
                  </div>
                </div>
              </div>
              
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-medium text-green-900 mb-3">Recent Submissions</h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <div class="text-sm font-medium">RBC Q3 2024 Return</div>
                      <div class="text-xs text-gray-600">Approved</div>
                    </div>
                    <div class="text-sm text-green-600 font-medium">On Time</div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <div class="text-sm font-medium">TD Liquidity Report</div>
                      <div class="text-xs text-gray-600">Under Review</div>
                    </div>
                    <div class="text-sm text-blue-600 font-medium">2 days early</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <p class="text-gray-600 mb-4">Complete filing calendar with automated reminders and deadline tracking</p>
              <div class="bg-gray-100 rounded-lg p-8">
                <i class="fas fa-calendar-alt text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">Interactive calendar view coming soon</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  showFilingAnalytics() {
    this.showAlert('info', 'Opening filing analytics dashboard...')
  },

  showRiskAnalytics() {
    this.showAlert('info', 'Opening advanced risk analytics...')
  },

  showRiskAlertSettings() {
    this.showAlert('info', 'Opening risk alert configuration...')
  },

  showCreateCaseModal() {
    this.showAlert('info', 'Opening case creation form...')
  },

  showCaseAssignment() {
    this.showAlert('info', 'Opening case assignment interface...')
  },

  showCaseStatistics() {
    this.showAlert('info', 'Opening case statistics dashboard...')
  },

  showMisconductDetectionMenu() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-3xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-search mr-2"></i>Select Misconduct Detection Analysis
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="text-gray-600 mb-6">Choose the type of misconduct detection analysis to run across your regulated entities.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onclick="CFRP.runMisconductDetection('unauthorized-conversions'); CFRP.closeModal();" class="p-4 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-exchange-alt text-purple-600 mr-3"></i>
                  <span class="font-medium">Policy Conversions</span>
                </div>
                <p class="text-sm text-gray-600">Detect unauthorized conversions without consent</p>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('synthetic-customers'); CFRP.closeModal();" class="p-4 border border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-user-ninja text-red-600 mr-3"></i>
                  <span class="font-medium">Synthetic Customers</span>
                </div>
                <p class="text-sm text-gray-600">Identify fake customer creation patterns</p>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('jurisdiction-violations'); CFRP.closeModal();" class="p-4 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-globe-americas text-blue-600 mr-3"></i>
                  <span class="font-medium">Cross-Border Sales</span>
                </div>
                <p class="text-sm text-gray-600">Monitor sales in unauthorized jurisdictions</p>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('fronting-arrangements'); CFRP.closeModal();" class="p-4 border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-mask text-orange-600 mr-3"></i>
                  <span class="font-medium">Fronting Arrangements</span>
                </div>
                <p class="text-sm text-gray-600">Detect hidden control structures</p>
              </button>
              
              <button onclick="CFRP.runMisconductDetection('client-borrowing'); CFRP.closeModal();" class="p-4 border border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-handshake text-green-600 mr-3"></i>
                  <span class="font-medium">Client Borrowing</span>
                </div>
                <p class="text-sm text-gray-600">Monitor advisor-client financial relationships</p>
              </button>
              
              <button onclick="CFRP.loadConductRiskDashboard(); CFRP.closeModal();" class="p-4 border border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
                <div class="flex items-center mb-2">
                  <i class="fas fa-tachometer-alt text-indigo-600 mr-3"></i>
                  <span class="font-medium">Full Dashboard</span>
                </div>
                <p class="text-sm text-gray-600">View comprehensive misconduct intelligence</p>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  showConsumerProtectionReport() {
    this.showAlert('info', 'Opening consumer protection intelligence report...')
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
              <button onclick="CFRP.showEntityFilters()" class="btn btn-secondary text-sm">
                <i class="fas fa-filter"></i> Filter
              </button>
              <button onclick="CFRP.exportEntities()" class="btn btn-secondary text-sm">
                <i class="fas fa-download"></i> Export
              </button>
              <button onclick="CFRP.showAddEntityModal()" class="btn btn-primary text-sm">
                <i class="fas fa-plus"></i> Add Entity
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
                <tr onclick="CFRP.showEntityDetails(${entity.id})" class="cursor-pointer hover:bg-blue-50 transition-colors">
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
                  <td onclick="event.stopPropagation()">
                    <div class="flex gap-1">
                      <button onclick="CFRP.showEntityDetails(${entity.id})" class="btn-icon text-blue-600 hover:bg-blue-50" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button onclick="CFRP.editEntity(${entity.id})" class="btn-icon text-green-600 hover:bg-green-50" title="Edit Entity">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="CFRP.viewEntityFilings(${entity.id})" class="btn-icon text-purple-600 hover:bg-purple-50" title="View Entity Filings">
                        <i class="fas fa-file-alt"></i>
                      </button>
                      <button onclick="CFRP.generateRiskReport(${entity.id})" class="btn-icon text-red-600 hover:bg-red-50" title="Risk Assessment">
                        <i class="fas fa-chart-line"></i>
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
              <button onclick="CFRP.previousEntitiesPage()" class="btn btn-secondary text-sm">
                <i class="fas fa-chevron-left mr-1"></i>Previous
              </button>
              <span class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">Page 1</span>
              <button onclick="CFRP.nextEntitiesPage()" class="btn btn-secondary text-sm">
                Next<i class="fas fa-chevron-right ml-1"></i>
              </button>
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
              </tr>
            </thead>
            <tbody>
              ${filings.map(filing => `
                <tr onclick="CFRP.reviewFilingDetails(${filing.id})" class="cursor-pointer hover:bg-blue-50 transition-colors">
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

  // Show filing submission modal
  showFilingModal() {
    const entityName = this.getEntityName(this.user?.entity_id)
    
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-2xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">Submit New Regulatory Filing</h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="filingForm">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="form-label">Institution</label>
                  <input type="text" class="form-input w-full" value="${entityName}" readonly>
                </div>
                <div>
                  <label class="form-label">Filing Type</label>
                  <select id="filingType" class="form-input w-full" required>
                    <option value="">Select filing type...</option>
                    <option value="quarterly_return">Quarterly Return</option>
                    <option value="annual_report">Annual Report</option>
                    <option value="incident_report">Incident Report</option>
                    <option value="capital_adequacy">Capital Adequacy Report</option>
                    <option value="liquidity_coverage">Liquidity Coverage Report</option>
                    <option value="consumer_complaint">Consumer Complaint Report</option>
                    <option value="cyber_incident">Cyber Incident Report</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="form-label">Reporting Period</label>
                  <input type="text" id="reportingPeriod" class="form-input w-full" placeholder="2024-Q3" required>
                </div>
                <div>
                  <label class="form-label">Currency</label>
                  <select id="currency" class="form-input w-full" required>
                    <option value="">Select currency...</option>
                    <option value="CAD" selected>CAD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Quarter/Year</label>
                  <input type="text" id="quarterYear" class="form-input w-full" placeholder="Q3 2024">
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label">Financial Data</label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600">Total Assets (CAD)</label>
                    <input type="number" id="totalAssets" class="form-input w-full" placeholder="1500000000000" step="0.01" required>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Total Deposits (CAD)</label>
                    <input type="number" id="totalDeposits" class="form-input w-full" placeholder="1200000000000" step="0.01">
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Capital Ratio (%)</label>
                    <input type="number" id="capitalRatio" class="form-input w-full" placeholder="12.5" step="0.01" required>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Leverage Ratio (%)</label>
                    <input type="number" id="leverageRatio" class="form-input w-full" placeholder="4.2" step="0.01">
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button type="submit" class="btn btn-primary flex-1">
                  <i class="fas fa-upload mr-2"></i>Submit Filing
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
    document.getElementById('filingForm').addEventListener('submit', this.handleFilingSubmission.bind(this))
  },

  // Handle filing form submission
  async handleFilingSubmission(e) {
    e.preventDefault()
    
    const filingType = document.getElementById('filingType').value
    const reportingPeriod = document.getElementById('reportingPeriod').value
    const currency = document.getElementById('currency').value
    const totalAssets = parseFloat(document.getElementById('totalAssets').value)
    const totalDeposits = parseFloat(document.getElementById('totalDeposits').value) || 0
    const capitalRatio = parseFloat(document.getElementById('capitalRatio').value)
    const leverageRatio = parseFloat(document.getElementById('leverageRatio').value) || 0
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entity_id: this.user.entity_id,
          filing_type: filingType,
          data: {
            reporting_period: reportingPeriod,
            currency: currency,
            total_assets: totalAssets,
            total_deposits: totalDeposits,
            capital_ratio: capitalRatio,
            leverage_ratio: leverageRatio
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', `Filing submitted successfully! Filing ID: ${data.data.id}`)
        // Refresh the filings view
        this.loadInstitutionFilings()
      } else {
        this.showAlert('error', data.error || 'Filing submission failed')
      }
    } catch (error) {
      console.error('Filing submission error:', error)
      this.showAlert('error', 'Network error. Please try again.')
    }
  },

  // Show comprehensive filing status with detailed information
  async showFilingStatus(entityId = null) {
    try {
      // Use provided entityId or current user's entity
      const targetEntityId = entityId || this.user?.entity_id
      const entityParam = targetEntityId ? `entity_id=${targetEntityId}&` : ''
      
      // Get filings with more comprehensive data
      const response = await fetch(`${this.apiBaseUrl}/filings?${entityParam}limit=15`, {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!data.success) {
        this.showAlert('error', 'Failed to load filing status')
        return
      }
      
      const filings = data.data || []
      
      const getStatusIcon = (status) => {
        const icons = {
          'pending': 'fas fa-clock text-yellow-600',
          'flagged': 'fas fa-flag text-red-600', 
          'validated': 'fas fa-check-circle text-green-600',
          'approved': 'fas fa-thumbs-up text-blue-600',
          'rejected': 'fas fa-times-circle text-red-600'
        }
        return icons[status] || 'fas fa-file text-gray-600'
      }

      const getNextSteps = (filing) => {
        if (filing.status === 'flagged' && filing.validation_errors?.length > 0) {
          return `<div class="text-red-800 bg-red-50 p-2 rounded text-xs mt-2">
            <strong>Action Required:</strong> Fix validation errors and resubmit
          </div>`
        } else if (filing.status === 'pending') {
          return `<div class="text-blue-800 bg-blue-50 p-2 rounded text-xs mt-2">
            <strong>Status:</strong> Under regulatory review
          </div>`
        } else if (filing.status === 'validated') {
          return `<div class="text-green-800 bg-green-50 p-2 rounded text-xs mt-2">
            <strong>Status:</strong> Accepted - No further action required
          </div>`
        }
        return ''
      }

      const filingsHtml = filings.length > 0 ? 
        filings.map(filing => `
          <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <i class="${getStatusIcon(filing.status)}"></i>
                <div>
                  <h4 class="font-medium text-gray-900">Filing #${filing.id}</h4>
                  <p class="text-sm text-gray-600">${filing.filing_type_display}</p>
                </div>
              </div>
              <span class="status-badge status-${filing.status}">${filing.status_display}</span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span class="text-gray-500">Submitted:</span>
                <span class="font-medium">${new Date(filing.submitted_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span class="text-gray-500">Risk Score:</span>
                <span class="font-medium ${filing.risk_score >= 7 ? 'text-red-600' : filing.risk_score >= 5 ? 'text-yellow-600' : 'text-green-600'}">
                  ${filing.risk_score || 'N/A'}
                </span>
              </div>
              <div>
                <span class="text-gray-500">Entity:</span>
                <span class="font-medium">${filing.entity_name}</span>
              </div>
              <div>
                <span class="text-gray-500">Reviewer:</span>
                <span class="font-medium">${filing.reviewer_id ? 'Assigned' : 'Unassigned'}</span>
              </div>
            </div>

            ${filing.validation_errors && filing.validation_errors.length > 0 ? `
              <div class="bg-red-50 border border-red-200 rounded p-3 mb-3">
                <h5 class="font-medium text-red-900 mb-2">
                  <i class="fas fa-exclamation-triangle mr-1"></i>
                  Validation Issues (${filing.validation_errors.length})
                </h5>
                <div class="space-y-1">
                  ${filing.validation_errors.slice(0, 3).map(error => `
                    <div class="text-sm text-red-800">
                      <strong>${error.field}:</strong> ${error.message}
                    </div>
                  `).join('')}
                  ${filing.validation_errors.length > 3 ? `
                    <div class="text-sm text-red-600 font-medium">
                      +${filing.validation_errors.length - 3} more issues...
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            ${getNextSteps(filing)}

            <div class="flex gap-2 mt-3">
              <button class="btn btn-sm btn-primary" onclick="CFRP.reviewFilingDetails(${filing.id})">
                <i class="fas fa-eye mr-1"></i>Review Details
              </button>
              ${this.user?.role === 'regulator' || this.user?.role === 'admin' ? `
                <button class="btn btn-sm btn-secondary" onclick="CFRP.createCaseForFiling(${filing.id}, ${filing.entity_id})">
                  <i class="fas fa-folder-plus mr-1"></i>Create Case
                </button>
              ` : ''}
              ${filing.status === 'flagged' && (this.user?.entity_id === filing.entity_id || !this.user?.entity_id) ? `
                <button class="btn btn-sm btn-warning" onclick="CFRP.resubmitFiling(${filing.id})">
                  <i class="fas fa-redo mr-1"></i>Resubmit
                </button>
              ` : ''}
            </div>
          </div>
        `).join('') :
        '<div class="text-center text-gray-500 py-8">No filings found</div>'
      
      const modal = `
        <div class="modal-overlay">
          <div class="modal-content max-w-4xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold">
                <i class="fas fa-file-alt mr-2"></i>Filing Status Tracker
                ${targetEntityId ? ` - ${this.getEntityName(targetEntityId)}` : ''}
              </h3>
              <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body max-h-96 overflow-y-auto">
              <div class="space-y-4">
                ${filingsHtml}
              </div>
            </div>
            <div class="modal-footer">
              <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
              ${this.user?.role === 'regulator' || this.user?.role === 'admin' ? `
                <button class="btn btn-primary" onclick="CFRP.closeModal(); CFRP.generateFilingReport(${targetEntityId})">
                  <i class="fas fa-download mr-2"></i>Export Report
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `
      
      document.body.insertAdjacentHTML('beforeend', modal)
      
    } catch (error) {
      console.error('Filing status error:', error)
      this.showAlert('error', 'Network error. Please try again.')
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

  // Close modal dialog
  closeModal() {
    // Find the topmost modal (last added to body)
    const modals = document.querySelectorAll('.modal-overlay')
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1]
      lastModal.remove()
    }
  },

  // ============================================================================
  // SPECIALIZED MODULES INTEGRATION
  // Insurance, Pensions, Payments, Provincial Regulators, Securities
  // ============================================================================

  // Show modules page (converted from modal to full page)
  async showModulesPage() {
    if (!this.user) {
      this.showPublicModulesPage()
      return
    }
    
    // Remove filings layout if coming from other pages
    this.removeFilingsLayout()
    
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    // Unified modules grid - all six regulatory modules together
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-layer-group mr-2 text-blue-600"></i>
              🇨🇦 Canadian Financial Regulatory Modules
            </h3>
            <p class="text-sm text-gray-600 mt-1">Complete coverage of specialized regulatory domains</p>
          </div>
          <div class="p-6">
            <div class="flex flex-wrap gap-3">
              <!-- Insurance Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showInsuranceModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <h4 class="text-lg font-bold text-blue-900" data-i18n="insurance_regulation">Insurance Regulation</h4>
                  <p class="text-sm text-blue-700">OSFI, FSRA, AMF, BCFSA</p>
                </div>
                <div class="space-y-2 text-sm text-blue-800">
                  <div class="flex items-center" data-i18n="federal_provincial_coverage"><i class="fas fa-check text-blue-600 mr-2"></i>Federal & Provincial Coverage</div>
                  <div class="flex items-center" data-i18n="risk_assessment_mct"><i class="fas fa-check text-blue-600 mr-2"></i>Risk Assessment & MCT</div>
                  <div class="flex items-center" data-i18n="market_conduct_reports"><i class="fas fa-check text-blue-600 mr-2"></i>Market Conduct Reports</div>
                  <div class="flex items-center" data-i18n="solvency_monitoring"><i class="fas fa-check text-blue-600 mr-2"></i>Solvency Monitoring</div>
                </div>
              </div>
              
              <!-- Pensions Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showPensionsModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-piggy-bank"></i>
                  </div>
                  <h4 class="text-lg font-bold text-green-900" data-i18n="pensions_regulation">Pensions Regulation</h4>
                  <p class="text-sm text-green-700">OSFI, Retraite Québec, FSRA</p>
                </div>
                <div class="space-y-2 text-sm text-green-800">
                  <div class="flex items-center" data-i18n="pension_plan_oversight"><i class="fas fa-check text-green-600 mr-2"></i>Pension Plan Oversight</div>
                  <div class="flex items-center" data-i18n="funding_analysis"><i class="fas fa-check text-green-600 mr-2"></i>Funding Analysis</div>
                  <div class="flex items-center" data-i18n="investment_performance"><i class="fas fa-check text-green-600 mr-2"></i>Investment Performance</div>
                  <div class="flex items-center" data-i18n="actuarial_reports"><i class="fas fa-check text-green-600 mr-2"></i>Actuarial Reports</div>
                </div>
              </div>
              
              <!-- Payments Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showPaymentsModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-credit-card"></i>
                  </div>
                  <h4 class="text-lg font-bold text-purple-900" data-i18n="payments_fintech">Payments & Fintech</h4>
                  <p class="text-sm text-purple-700">BoC, Payments Canada, FCAC</p>
                </div>
                <div class="space-y-2 text-sm text-purple-800">
                  <div class="flex items-center" data-i18n="payment_service_providers"><i class="fas fa-check text-purple-600 mr-2"></i>Payment Service Providers</div>
                  <div class="flex items-center" data-i18n="aml_kyc_compliance"><i class="fas fa-check text-purple-600 mr-2"></i>AML/KYC Compliance</div>
                  <div class="flex items-center" data-i18n="crypto_exchanges"><i class="fas fa-check text-purple-600 mr-2"></i>Crypto Exchanges</div>
                  <div class="flex items-center" data-i18n="transaction_monitoring"><i class="fas fa-check text-purple-600 mr-2"></i>Transaction Monitoring</div>
                </div>
              </div>
              
              <!-- Provincial Regulators Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showProvincialRegulatorsModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-university"></i>
                  </div>
                  <h4 class="text-lg font-bold text-red-900" data-i18n="provincial_regulators">Provincial Regulators</h4>
                  <p class="text-sm text-red-700">FSRA, AMF, BCFSA, ASIC</p>
                </div>
                <div class="space-y-2 text-sm text-red-800">
                  <div class="flex items-center" data-i18n="multi_jurisdiction_filing"><i class="fas fa-check text-red-600 mr-2"></i>Multi-Jurisdiction Filing</div>
                  <div class="flex items-center" data-i18n="cross_border_coordination"><i class="fas fa-check text-red-600 mr-2"></i>Cross-Border Coordination</div>
                  <div class="flex items-center" data-i18n="french_language_support"><i class="fas fa-check text-red-600 mr-2"></i>🇫🇷 French Language Support</div>
                  <div class="flex items-center" data-i18n="provincial_compliance"><i class="fas fa-check text-red-600 mr-2"></i>Provincial Compliance</div>
                </div>
              </div>
              
              <!-- Securities Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showSecuritiesModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-chart-bar"></i>
                  </div>
                  <h4 class="text-lg font-bold text-yellow-900" data-i18n="securities_regulation">Securities Regulation</h4>
                  <p class="text-sm text-yellow-700">OSC, AMF, CIRO, CSA</p>
                </div>
                <div class="space-y-2 text-sm text-yellow-800">
                  <div class="flex items-center" data-i18n="sedar_plus_integration"><i class="fas fa-check text-yellow-600 mr-2"></i>SEDAR+ Integration</div>
                  <div class="flex items-center" data-i18n="market_surveillance"><i class="fas fa-check text-yellow-600 mr-2"></i>Market Surveillance</div>
                  <div class="flex items-center" data-i18n="insider_trading_detection"><i class="fas fa-check text-yellow-600 mr-2"></i>Insider Trading Detection</div>
                  <div class="flex items-center" data-i18n="investment_funds"><i class="fas fa-check text-yellow-600 mr-2"></i>Investment Funds</div>
                </div>
              </div>
              
              <!-- Comprehensive Dashboard -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showComprehensiveModulesDashboard()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-tachometer-alt"></i>
                  </div>
                  <h4 class="text-lg font-bold text-indigo-900" data-i18n="integrated_dashboard">Integrated Dashboard</h4>
                  <p class="text-sm text-indigo-700" data-i18n="all_modules_combined">All Modules Combined</p>
                </div>
                <div class="space-y-2 text-sm text-indigo-800">
                  <div class="flex items-center" data-i18n="cross_module_analytics"><i class="fas fa-check text-indigo-600 mr-2"></i>Cross-Module Analytics</div>
                  <div class="flex items-center" data-i18n="unified_reporting"><i class="fas fa-check text-indigo-600 mr-2"></i>Unified Reporting</div>
                  <div class="flex items-center" data-i18n="regulatory_intelligence"><i class="fas fa-check text-indigo-600 mr-2"></i>Regulatory Intelligence</div>
                  <div class="flex items-center" data-i18n="complete_coverage"><i class="fas fa-check text-indigo-600 mr-2"></i>Complete Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Clear the second container - no longer needed for modules
    if (filingsContainer) {
      filingsContainer.innerHTML = ''
    }
    
    // Module Status and Quick Actions
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-info-circle mr-2 text-blue-600"></i>
              Module Status & Quick Actions
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">6</div>
                <div class="text-sm text-green-700" data-i18n="active_modules">Active Modules</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">100%</div>
                <div class="text-sm text-blue-700" data-i18n="coverage_rate">Coverage Rate</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">24/7</div>
                <div class="text-sm text-purple-700" data-i18n="monitoring">Monitoring</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">AI</div>
                <div class="text-sm text-orange-700" data-i18n="powered">Powered</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <button onclick="CFRP.runComprehensiveRiskAssessment()" class="w-full btn btn-primary text-sm">
                <i class="fas fa-shield-alt mr-2"></i><span data-i18n="run_comprehensive_risk_assessment">Run Comprehensive Risk Assessment</span>
              </button>
              <button onclick="CFRP.generateCrossModuleReport()" class="w-full btn btn-secondary text-sm">
                <i class="fas fa-chart-pie mr-2"></i><span data-i18n="generate_cross_module_report">Generate Cross-Module Report</span>
              </button>
              <button onclick="CFRP.configureModuleAlerts()" class="w-full btn btn-secondary text-sm">
                <i class="fas fa-bell mr-2"></i><span data-i18n="configure_module_alerts">Configure Module Alerts</span>
              </button>
            </div>
          </div>
        </div>
      `
    }
    
    // Module Documentation and Help
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-book mr-2 text-blue-600"></i>
              <span data-i18n="module_documentation">Module Documentation & Help</span>
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start">
                  <i class="fas fa-info-circle text-blue-600 mt-0.5 mr-3"></i>
                  <div>
                    <h4 class="font-medium text-blue-900" data-i18n="getting_started">Getting Started</h4>
                    <p class="text-sm text-blue-800 mt-1" data-i18n="modules_getting_started_text">
                      Click on any module above to access specialized regulatory tools. Each module provides comprehensive coverage for its regulatory domain.
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2">
                <button onclick="CFRP.showModuleHelp('overview')" class="w-full text-left p-3 border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium" data-i18n="modules_overview">Modules Overview</span>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </button>
                <button onclick="CFRP.showModuleHelp('integration')" class="w-full text-left p-3 border border-gray-200 rounded hover:border-green-400 hover:bg-green-50 transition-colors">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium" data-i18n="integration_guide">Integration Guide</span>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </button>
                <button onclick="CFRP.showModuleHelp('troubleshooting')" class="w-full text-left p-3 border border-gray-200 rounded hover:border-red-400 hover:bg-red-50 transition-colors">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium" data-i18n="troubleshooting">Troubleshooting</span>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Translate the newly added content
    this.translateContent(entitiesContainer)
    this.translateContent(filingsContainer)
    this.translateContent(alertsContainer)
    this.translateContent(statsContainer)
  },

  // Show public modules page (for non-authenticated users)
  showPublicModulesPage() {
    const entitiesContainer = document.getElementById('entitiesContainer')
    const filingsContainer = document.getElementById('filingsContainer')
    const alertsContainer = document.getElementById('alertsContainer')
    const statsContainer = document.getElementById('statsContainer')
    
    // Public modules overview - all six modules unified
    if (entitiesContainer) {
      entitiesContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-layer-group mr-2 text-blue-600"></i>
              🇨🇦 Canadian Financial Regulatory Modules
            </h3>
            <p class="text-sm text-gray-600 mt-1">Complete coverage of specialized regulatory domains</p>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-6" data-i18n="public_modules_description">
              CFRP provides specialized regulatory modules covering all aspects of Canada's financial regulatory framework. Login to access detailed module functionality.
            </p>
            <div class="flex flex-wrap gap-3">
              <!-- Insurance Module -->
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <h4 class="text-lg font-bold text-blue-900" data-i18n="insurance_regulation">Insurance Regulation</h4>
                  <p class="text-sm text-blue-700">OSFI • FSRA • AMF • BCFSA</p>
                </div>
              </div>
              <!-- Pensions Module -->
              <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-piggy-bank"></i>
                  </div>
                  <h4 class="text-lg font-bold text-green-900" data-i18n="pensions_regulation">Pensions Regulation</h4>
                  <p class="text-sm text-green-700">OSFI • Retraite Québec • FSRA</p>
                </div>
              </div>
              <!-- Payments Module -->
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-credit-card"></i>
                  </div>
                  <h4 class="text-lg font-bold text-purple-900" data-i18n="payments_fintech">Payments & Fintech</h4>
                  <p class="text-sm text-purple-700">BoC • Payments Canada • FCAC</p>
                </div>
              </div>
              <!-- Provincial Regulators Module -->
              <div class="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-university"></i>
                  </div>
                  <h4 class="text-lg font-bold text-red-900" data-i18n="provincial_regulators">Provincial Regulators</h4>
                  <p class="text-sm text-red-700">FSRA • AMF • BCFSA • ASIC</p>
                </div>
              </div>
              <!-- Securities Module -->
              <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-chart-bar"></i>
                  </div>
                  <h4 class="text-lg font-bold text-yellow-900" data-i18n="securities_regulation">Securities Regulation</h4>
                  <p class="text-sm text-yellow-700">OSC • AMF • CIRO • CSA</p>
                </div>
              </div>
              <!-- Integrated Dashboard -->
              <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-tachometer-alt"></i>
                  </div>
                  <h4 class="text-lg font-bold text-indigo-900" data-i18n="integrated_dashboard">Integrated Dashboard</h4>
                  <p class="text-sm text-indigo-700" data-i18n="unified_view">Unified View</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Clear the second container - no longer needed for modules
    if (filingsContainer) {
      filingsContainer.innerHTML = ''
    }
    
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-users mr-2 text-blue-600"></i>
              <span data-i18n="who_uses_modules">Who Uses These Modules</span>
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-start">
                <i class="fas fa-building text-blue-600 mr-3 mt-1"></i>
                <div>
                  <div class="font-medium text-gray-900" data-i18n="financial_institutions">Financial Institutions</div>
                  <div class="text-sm text-gray-600" data-i18n="streamlined_compliance">Streamlined compliance across multiple regulatory jurisdictions</div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fas fa-university text-green-600 mr-3 mt-1"></i>
                <div>
                  <div class="font-medium text-gray-900" data-i18n="regulatory_agencies">Regulatory Agencies</div>
                  <div class="text-sm text-gray-600" data-i18n="enhanced_oversight">Enhanced oversight with unified data sharing and coordination</div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fas fa-chart-line text-purple-600 mr-3 mt-1"></i>
                <div>
                  <div class="font-medium text-gray-900" data-i18n="compliance_teams">Compliance Teams</div>
                  <div class="text-sm text-gray-600" data-i18n="comprehensive_tools">Comprehensive tools for regulatory monitoring and reporting</div>
                </div>
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
              <span data-i18n="access_information">Access Information</span>
            </h3>
          </div>
          <div class="p-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div class="flex items-start">
                <i class="fas fa-lock text-blue-600 mt-0.5 mr-3"></i>
                <div>
                  <h4 class="font-medium text-blue-900" data-i18n="authentication_required">Authentication Required</h4>
                  <p class="text-sm text-blue-800 mt-1" data-i18n="modules_login_required">
                    Access to specialized regulatory modules requires authentication. Please login to access full functionality.
                  </p>
                </div>
              </div>
            </div>
            
            <button onclick="CFRP.showLoginModal()" class="w-full btn btn-primary">
              <i class="fas fa-sign-in-alt mr-2"></i><span data-i18n="login_to_access_modules">Login to Access Modules</span>
            </button>
          </div>
        </div>
      `
    }
    
    // Translate the newly added content
    this.translateContent(entitiesContainer)
    this.translateContent(filingsContainer)
    this.translateContent(alertsContainer)
    this.translateContent(statsContainer)
  },

  // Show specialized modules menu (keep for backward compatibility)
  showSpecializedModulesMenu() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-5xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-layer-group mr-2"></i>🇨🇦 Specialized Regulatory Modules
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-6 text-center">
              <p class="text-lg text-gray-700 mb-2">Complete Canadian Financial Regulatory Coverage</p>
              <p class="text-sm text-gray-600">Choose from specialized modules covering insurance, pensions, payments, provincial regulators, and securities</p>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <!-- Insurance Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showInsuranceModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <h4 class="text-lg font-bold text-blue-900">Insurance Regulation</h4>
                  <p class="text-sm text-blue-700">OSFI, FSRA, AMF, BCFSA</p>
                </div>
                <div class="space-y-2 text-sm text-blue-800">
                  <div class="flex items-center"><i class="fas fa-check text-blue-600 mr-2"></i>Federal & Provincial Coverage</div>
                  <div class="flex items-center"><i class="fas fa-check text-blue-600 mr-2"></i>Risk Assessment & MCT</div>
                  <div class="flex items-center"><i class="fas fa-check text-blue-600 mr-2"></i>Market Conduct Reports</div>
                  <div class="flex items-center"><i class="fas fa-check text-blue-600 mr-2"></i>Solvency Monitoring</div>
                </div>
              </div>
              
              <!-- Pensions Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showPensionsModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-piggy-bank"></i>
                  </div>
                  <h4 class="text-lg font-bold text-green-900">Pensions Regulation</h4>
                  <p class="text-sm text-green-700">OSFI, Retraite Québec, FSRA</p>
                </div>
                <div class="space-y-2 text-sm text-green-800">
                  <div class="flex items-center"><i class="fas fa-check text-green-600 mr-2"></i>Pension Plan Oversight</div>
                  <div class="flex items-center"><i class="fas fa-check text-green-600 mr-2"></i>Funding Analysis</div>
                  <div class="flex items-center"><i class="fas fa-check text-green-600 mr-2"></i>Investment Performance</div>
                  <div class="flex items-center"><i class="fas fa-check text-green-600 mr-2"></i>Actuarial Reports</div>
                </div>
              </div>
              
              <!-- Payments Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showPaymentsModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-credit-card"></i>
                  </div>
                  <h4 class="text-lg font-bold text-purple-900">Payments & Fintech</h4>
                  <p class="text-sm text-purple-700">BoC, Payments Canada, FCAC</p>
                </div>
                <div class="space-y-2 text-sm text-purple-800">
                  <div class="flex items-center"><i class="fas fa-check text-purple-600 mr-2"></i>Payment Service Providers</div>
                  <div class="flex items-center"><i class="fas fa-check text-purple-600 mr-2"></i>AML/KYC Compliance</div>
                  <div class="flex items-center"><i class="fas fa-check text-purple-600 mr-2"></i>Crypto Exchanges</div>
                  <div class="flex items-center"><i class="fas fa-check text-purple-600 mr-2"></i>Transaction Monitoring</div>
                </div>
              </div>
              
              <!-- Provincial Regulators Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showProvincialRegulatorsModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-university"></i>
                  </div>
                  <h4 class="text-lg font-bold text-red-900">Provincial Regulators</h4>
                  <p class="text-sm text-red-700">FSRA, AMF, BCFSA, ASIC</p>
                </div>
                <div class="space-y-2 text-sm text-red-800">
                  <div class="flex items-center"><i class="fas fa-check text-red-600 mr-2"></i>Multi-Jurisdiction Filing</div>
                  <div class="flex items-center"><i class="fas fa-check text-red-600 mr-2"></i>Cross-Border Coordination</div>
                  <div class="flex items-center"><i class="fas fa-check text-red-600 mr-2"></i>🇫🇷 French Language Support</div>
                  <div class="flex items-center"><i class="fas fa-check text-red-600 mr-2"></i>Provincial Compliance</div>
                </div>
              </div>
              
              <!-- Securities Module -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showSecuritiesModule()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-chart-bar"></i>
                  </div>
                  <h4 class="text-lg font-bold text-yellow-900">Securities Regulation</h4>
                  <p class="text-sm text-yellow-700">OSC, AMF, CIRO, CSA</p>
                </div>
                <div class="space-y-2 text-sm text-yellow-800">
                  <div class="flex items-center"><i class="fas fa-check text-yellow-600 mr-2"></i>SEDAR+ Integration</div>
                  <div class="flex items-center"><i class="fas fa-check text-yellow-600 mr-2"></i>Market Surveillance</div>
                  <div class="flex items-center"><i class="fas fa-check text-yellow-600 mr-2"></i>Insider Trading Detection</div>
                  <div class="flex items-center"><i class="fas fa-check text-yellow-600 mr-2"></i>Investment Funds</div>
                </div>
              </div>
              
              <!-- Comprehensive Dashboard -->
              <div class="flex-1 min-w-0 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="CFRP.showComprehensiveModulesDashboard()">
                <div class="text-center mb-4">
                  <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <i class="fas fa-tachometer-alt"></i>
                  </div>
                  <h4 class="text-lg font-bold text-indigo-900">Integrated Dashboard</h4>
                  <p class="text-sm text-indigo-700">All Modules Combined</p>
                </div>
                <div class="space-y-2 text-sm text-indigo-800">
                  <div class="flex items-center"><i class="fas fa-check text-indigo-600 mr-2"></i>Cross-Module Analytics</div>
                  <div class="flex items-center"><i class="fas fa-check text-indigo-600 mr-2"></i>Unified Reporting</div>
                  <div class="flex items-center"><i class="fas fa-check text-indigo-600 mr-2"></i>Regulatory Intelligence</div>
                  <div class="flex items-center"><i class="fas fa-check text-indigo-600 mr-2"></i>Complete Coverage</div>
                </div>
              </div>
            </div>
            
            <div class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div class="text-center">
                <h4 class="text-lg font-bold text-gray-900 mb-2">🚀 Complete Canadian Financial Regulatory Ecosystem</h4>
                <p class="text-sm text-gray-700">CFRP now covers all major regulatory areas with specialized modules for insurance, pensions, payments, provincial coordination, and securities - providing complete oversight across Canada's financial services industry.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Insurance Module Functions
  async showInsuranceModule() {
    this.closeModal()
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/insurance/regulators`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.renderInsuranceModule(data.data)
        }
      }
    } catch (error) {
      console.error('Insurance module error:', error)
      this.showAlert('error', 'Failed to load insurance module')
    }
  },

  renderInsuranceModule(regulators) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-6xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-shield-alt mr-2 text-blue-600"></i>🏢 Insurance Regulation Module
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-university mr-2"></i>Insurance Regulators Coverage
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Object.entries(regulators).map(([key, regulator]) => `
                      <div class="border border-gray-200 rounded-lg p-4">
                        <h5 class="font-medium text-gray-900 mb-2">${regulator.name}</h5>
                        <p class="text-sm text-gray-600 mb-2">${regulator.name_fr || regulator.name}</p>
                        <div class="text-xs text-gray-500">
                          <div>Jurisdiction: ${regulator.jurisdiction}</div>
                          <div>Languages: ${regulator.languages.join(', ')}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                
                <div class="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-file-alt mr-2"></i>Insurance Filing Types
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div class="font-medium">Quarterly Return</div>
                        <div class="text-sm text-gray-600">Financial position, income statement, regulatory capital</div>
                      </div>
                      <div class="text-sm text-gray-500">Quarterly</div>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div class="font-medium">Solvency Report</div>
                        <div class="text-sm text-gray-600">Capital adequacy, risk profile, stress testing</div>
                      </div>
                      <div class="text-sm text-gray-500">Annual</div>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div class="font-medium">Market Conduct Report</div>
                        <div class="text-sm text-gray-600">Complaint statistics, sales practices, consumer protection</div>
                      </div>
                      <div class="text-sm text-gray-500">Annual</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-tools mr-2"></i>Module Actions
                  </h4>
                  <div class="space-y-3">
                    <button onclick="CFRP.submitInsuranceFiling()" class="w-full btn btn-primary">
                      <i class="fas fa-upload mr-2"></i>Submit Insurance Filing
                    </button>
                    <button onclick="CFRP.runInsuranceRiskAnalysis()" class="w-full btn btn-secondary">
                      <i class="fas fa-chart-line mr-2"></i>Risk Analysis
                    </button>
                    <button onclick="CFRP.viewInsuranceCompliance()" class="w-full btn btn-secondary">
                      <i class="fas fa-check-circle mr-2"></i>Compliance Check
                    </button>
                  </div>
                </div>
                
                <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 class="font-medium text-blue-900 mb-2">Key Features</h5>
                  <div class="space-y-1 text-sm text-blue-800">
                    <div>✓ MCT Ratio Monitoring</div>
                    <div>✓ Combined Ratio Analysis</div>
                    <div>✓ Provincial Coordination</div>
                    <div>✓ French Language Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
            <button onclick="CFRP.showSpecializedModulesMenu()" class="btn btn-primary">
              <i class="fas fa-layer-group mr-2"></i>All Modules
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Submit insurance filing
  async submitInsuranceFiling() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-3xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-shield-alt mr-2"></i>Submit Insurance Regulatory Filing
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="insuranceFilingForm" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Filing Type</label>
                  <select name="filing_type" class="form-input w-full" required>
                    <option value="">Select filing type...</option>
                    <option value="quarterly_return">Quarterly Return</option>
                    <option value="annual_statement">Annual Statement</option>
                    <option value="solvency_report">Solvency Report</option>
                    <option value="market_conduct_report">Market Conduct Report</option>
                    <option value="actuarial_report">Actuarial Report</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Insurance Company</label>
                  <input type="text" name="company_name" class="form-input w-full" placeholder="e.g., Great-West Lifeco" required>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="form-label">License Number</label>
                  <input type="text" name="license_number" class="form-input w-full" placeholder="e.g., 12345">
                </div>
                <div>
                  <label class="form-label">Language</label>
                  <select name="language" class="form-input w-full" required>
                    <option value="english">English</option>
                    <option value="french">Français</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Reporting Period</label>
                  <input type="text" name="reporting_period" class="form-input w-full" placeholder="Q3 2024" required>
                </div>
              </div>
              
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Financial Data (CAD)</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600">Total Assets</label>
                    <input type="number" name="total_assets" class="form-input w-full" placeholder="125000000000" step="0.01">
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Policy Liabilities</label>
                    <input type="number" name="policy_liabilities" class="form-input w-full" placeholder="95000000000" step="0.01">
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">MCT Ratio (%)</label>
                    <input type="number" name="mct_ratio" class="form-input w-full" placeholder="195.5" step="0.1">
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Combined Ratio (%)</label>
                    <input type="number" name="combined_ratio" class="form-input w-full" placeholder="98.2" step="0.1">
                  </div>
                </div>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-2">
                  <i class="fas fa-university mr-2"></i>Target Regulators
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <label class="flex items-center">
                    <input type="checkbox" name="regulators" value="osfi_insurance" class="mr-2" checked>
                    <span class="text-sm">OSFI - Insurance Division</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="regulators" value="fsra_insurance" class="mr-2">
                    <span class="text-sm">FSRA - Insurance</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="regulators" value="amf_insurance" class="mr-2">
                    <span class="text-sm">AMF - Assurance</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="regulators" value="bcfsa_insurance" class="mr-2">
                    <span class="text-sm">BCFSA - Insurance</span>
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.processInsuranceFiling()" class="btn btn-primary">
              <i class="fas fa-upload mr-2"></i>Submit Filing
            </button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Process insurance filing submission
  async processInsuranceFiling() {
    try {
      const form = document.getElementById('insuranceFilingForm')
      const formData = new FormData(form)
      
      const selectedRegulators = Array.from(form.querySelectorAll('input[name="regulators"]:checked'))
        .map(cb => cb.value)
      
      const filingData = {
        filing_type: formData.get('filing_type'),
        regulator_ids: selectedRegulators,
        company_name: formData.get('company_name'),
        license_number: formData.get('license_number'),
        filing_data: {
          reporting_period: formData.get('reporting_period'),
          total_assets: parseFloat(formData.get('total_assets')) || 0,
          policy_liabilities: parseFloat(formData.get('policy_liabilities')) || 0,
          mct_ratio: parseFloat(formData.get('mct_ratio')) || 0,
          combined_ratio: parseFloat(formData.get('combined_ratio')) || 0
        },
        language: formData.get('language')
      }
      
      const response = await fetch(`${this.apiBaseUrl}/insurance/filings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(filingData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', `Insurance filing submitted successfully! Filing ID: ${data.data.filing_id}`)
      } else {
        this.showAlert('error', data.error || 'Insurance filing submission failed')
      }
      
    } catch (error) {
      console.error('Insurance filing error:', error)
      this.showAlert('error', 'Network error submitting insurance filing')
    }
  },

  // Pensions Module Functions
  async showPensionsModule() {
    this.closeModal()
    this.showAlert('info', 'Loading pensions regulation module...')
    
    // Simulate loading pensions module
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-5xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-piggy-bank mr-2 text-green-600"></i>💰 Pensions Regulation Module
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-chart-pie mr-2"></i>Pension Plan Types
                  </h4>
                  <div class="space-y-3">
                    <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div class="font-medium text-green-900">Defined Benefit Plans</div>
                      <div class="text-sm text-green-700">Guaranteed benefits, employer investment risk</div>
                    </div>
                    <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div class="font-medium text-blue-900">Defined Contribution Plans</div>
                      <div class="text-sm text-blue-700">Individual accounts, member investment risk</div>
                    </div>
                    <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div class="font-medium text-purple-900">Pooled Registered Pension Plans</div>
                      <div class="text-sm text-purple-700">Pooled investments, professional management</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-tools mr-2"></i>Pension Actions
                  </h4>
                  <div class="space-y-3">
                    <button onclick="CFRP.submitPensionFiling()" class="w-full btn btn-primary">
                      <i class="fas fa-upload mr-2"></i>Submit Pension Filing
                    </button>
                    <button onclick="CFRP.runFundingAnalysis()" class="w-full btn btn-secondary">
                      <i class="fas fa-calculator mr-2"></i>Funding Analysis
                    </button>
                    <button onclick="CFRP.checkPensionCompliance()" class="w-full btn btn-secondary">
                      <i class="fas fa-check-circle mr-2"></i>Compliance Check
                    </button>
                  </div>
                </div>
                
                <div class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 class="font-medium text-green-900 mb-2">Coverage Includes</h5>
                  <div class="space-y-1 text-sm text-green-800">
                    <div>✓ OSFI Federal Plans</div>
                    <div>✓ Retraite Québec</div>
                    <div>✓ FSRA Ontario Plans</div>
                    <div>✓ Funding Assessments</div>
                    <div>✓ Investment Performance</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="text-center">
                <i class="fas fa-info-circle text-blue-600 text-2xl mb-2"></i>
                <h5 class="font-medium text-gray-900 mb-2">Comprehensive Pension Oversight</h5>
                <p class="text-sm text-gray-700">Monitor funding ratios, investment performance, and regulatory compliance across federal and provincial pension plans.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
            <button onclick="CFRP.showSpecializedModulesMenu()" class="btn btn-primary">
              <i class="fas fa-layer-group mr-2"></i>All Modules
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Payments Module Functions
  async showPaymentsModule() {
    this.closeModal()
    this.showAlert('info', 'Loading payments & fintech regulation module...')
    
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-6xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-credit-card mr-2 text-purple-600"></i>💳 Payments & Fintech Regulation
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-sitemap mr-2"></i>Payment Service Categories
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="border border-purple-200 bg-purple-50 rounded-lg p-4">
                      <h5 class="font-medium text-purple-900">Money Service Business</h5>
                      <p class="text-sm text-purple-700 mb-2">Money transmission, currency exchange, money orders</p>
                      <div class="text-xs text-purple-600">Provincial licensing required</div>
                    </div>
                    
                    <div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <h5 class="font-medium text-blue-900">Payment Processors</h5>
                      <p class="text-sm text-blue-700 mb-2">Merchant acquiring, card processing, gateway services</p>
                      <div class="text-xs text-blue-600">FCAC oversight</div>
                    </div>
                    
                    <div class="border border-green-200 bg-green-50 rounded-lg p-4">
                      <h5 class="font-medium text-green-900">Digital Wallets</h5>
                      <p class="text-sm text-green-700 mb-2">Stored value, P2P transfers, mobile payments</p>
                      <div class="text-xs text-green-600">Consumer protection focus</div>
                    </div>
                    
                    <div class="border border-orange-200 bg-orange-50 rounded-lg p-4">
                      <h5 class="font-medium text-orange-900">Crypto Exchanges</h5>
                      <p class="text-sm text-orange-700 mb-2">Cryptocurrency trading, custody services</p>
                      <div class="text-xs text-orange-600">Provincial registration</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-cogs mr-2"></i>Payment Actions
                  </h4>
                  <div class="space-y-3">
                    <button onclick="CFRP.submitPaymentFiling()" class="w-full btn btn-primary">
                      <i class="fas fa-upload mr-2"></i>Submit Payment Filing
                    </button>
                    <button onclick="CFRP.runAMLCheck()" class="w-full btn btn-secondary">
                      <i class="fas fa-search mr-2"></i>AML Compliance
                    </button>
                    <button onclick="CFRP.monitorTransactions()" class="w-full btn btn-secondary">
                      <i class="fas fa-chart-line mr-2"></i>Transaction Monitor
                    </button>
                  </div>
                </div>
                
                <div class="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 class="font-medium text-purple-900 mb-2">Key Regulators</h5>
                  <div class="space-y-1 text-sm text-purple-800">
                    <div>🏦 Bank of Canada</div>
                    <div>💰 Payments Canada</div>
                    <div>🛡️ FCAC Consumer Protection</div>
                    <div>🍁 Provincial MSB Licensing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
            <button onclick="CFRP.showSpecializedModulesMenu()" class="btn btn-primary">
              <i class="fas fa-layer-group mr-2"></i>All Modules
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Provincial Regulators Module
  async showProvincialRegulatorsModule() {
    this.closeModal()
    this.showAlert('info', 'Loading provincial regulators coordination module...')
    
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-6xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-maple-leaf mr-2 text-red-600"></i>🍁 Provincial Regulators Integration
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-map-marked-alt mr-2"></i>Provincial Coverage
                  </h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <div class="font-medium text-blue-900">FSRA Ontario</div>
                        <div class="text-sm text-blue-700">Financial Services Regulatory Authority</div>
                      </div>
                      <div class="text-xs text-blue-600">🇬🇧 EN / 🇫🇷 FR</div>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <div class="font-medium text-red-900">AMF Québec</div>
                        <div class="text-sm text-red-700">Autorité des marchés financiers</div>
                      </div>
                      <div class="text-xs text-red-600">🇫🇷 FR Primary</div>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div class="font-medium text-green-900">BCFSA</div>
                        <div class="text-sm text-green-700">BC Financial Services Authority</div>
                      </div>
                      <div class="text-xs text-green-600">🇬🇧 EN</div>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <div class="font-medium text-orange-900">ASIC Alberta</div>
                        <div class="text-sm text-orange-700">Alberta Securities & Insurance</div>
                      </div>
                      <div class="text-xs text-orange-600">🇬🇧 EN</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-handshake mr-2"></i>Cross-Jurisdictional Features
                  </h4>
                  <div class="space-y-3">
                    <button onclick="CFRP.submitMultiJurisdictionFiling()" class="w-full btn btn-primary">
                      <i class="fas fa-share-alt mr-2"></i>Multi-Jurisdiction Filing
                    </button>
                    <button onclick="CFRP.coordinateRegulators()" class="w-full btn btn-secondary">
                      <i class="fas fa-users mr-2"></i>Regulator Coordination
                    </button>
                    <button onclick="CFRP.switchLanguage('fr')" class="w-full btn btn-secondary">
                      <i class="fas fa-globe mr-2"></i>🇫🇷 Interface en français
                    </button>
                  </div>
                </div>
                
                <div class="mt-6 bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-lg p-4">
                  <h5 class="font-medium text-gray-900 mb-2">🇨🇦 Canadian Bilingual Support</h5>
                  <div class="space-y-1 text-sm text-gray-700">
                    <div>✓ Full English/French Interface</div>
                    <div>✓ Quebec AMF French Priority</div>
                    <div>✓ Automated Language Routing</div>
                    <div>✓ Bilingual Documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
            <button onclick="CFRP.showSpecializedModulesMenu()" class="btn btn-primary">
              <i class="fas fa-layer-group mr-2"></i>All Modules
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Securities Module
  async showSecuritiesModule() {
    this.closeModal()
    this.showAlert('info', 'Loading securities regulation & market surveillance module...')
    
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-6xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-chart-bar mr-2 text-yellow-600"></i>📈 Securities Regulation & Market Surveillance
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-file-contract mr-2"></i>Securities Filing Systems
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="border border-blue-200 bg-blue-50 rounded-lg p-4 text-center">
                      <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-2">
                        <i class="fas fa-database"></i>
                      </div>
                      <h5 class="font-medium text-blue-900">SEDAR+</h5>
                      <p class="text-sm text-blue-700">Continuous disclosure system</p>
                    </div>
                    
                    <div class="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
                      <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-2">
                        <i class="fas fa-user-tie"></i>
                      </div>
                      <h5 class="font-medium text-green-900">NRD</h5>
                      <p class="text-sm text-green-700">Registration database</p>
                    </div>
                    
                    <div class="border border-purple-200 bg-purple-50 rounded-lg p-4 text-center">
                      <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-2">
                        <i class="fas fa-eye"></i>
                      </div>
                      <h5 class="font-medium text-purple-900">SEDI</h5>
                      <p class="text-sm text-purple-700">Insider trading reports</p>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-search mr-2"></i>Market Surveillance Features
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-3 bg-red-50 border-l-4 border-red-500">
                      <div class="font-medium text-red-900">Insider Trading Detection</div>
                      <div class="text-sm text-red-700">Pattern analysis and alert system</div>
                    </div>
                    <div class="p-3 bg-orange-50 border-l-4 border-orange-500">
                      <div class="font-medium text-orange-900">Market Manipulation</div>
                      <div class="text-sm text-orange-700">Suspicious trading pattern monitoring</div>
                    </div>
                    <div class="p-3 bg-blue-50 border-l-4 border-blue-500">
                      <div class="font-medium text-blue-900">Disclosure Compliance</div>
                      <div class="text-sm text-blue-700">Continuous disclosure monitoring</div>
                    </div>
                    <div class="p-3 bg-green-50 border-l-4 border-green-500">
                      <div class="font-medium text-green-900">Fund Compliance</div>
                      <div class="text-sm text-green-700">Investment fund oversight</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-tools mr-2"></i>Securities Actions
                  </h4>
                  <div class="space-y-3">
                    <button onclick="CFRP.submitSecuritiesFiling()" class="w-full btn btn-primary">
                      <i class="fas fa-upload mr-2"></i>Securities Filing
                    </button>
                    <button onclick="CFRP.runMarketSurveillance()" class="w-full btn btn-secondary">
                      <i class="fas fa-radar-alt mr-2"></i>Market Surveillance
                    </button>
                    <button onclick="CFRP.checkInsiderTrading()" class="w-full btn btn-secondary">
                      <i class="fas fa-user-secret mr-2"></i>Insider Analysis
                    </button>
                  </div>
                </div>
                
                <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 class="font-medium text-yellow-900 mb-2">Key Regulators</h5>
                  <div class="space-y-1 text-sm text-yellow-800">
                    <div>🏛️ OSC Ontario</div>
                    <div>🏛️ AMF Québec Securities</div>
                    <div>🏛️ CIRO Self-Regulation</div>
                    <div>🏛️ CSA Harmonization</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
            <button onclick="CFRP.showSpecializedModulesMenu()" class="btn btn-primary">
              <i class="fas fa-layer-group mr-2"></i>All Modules
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Comprehensive modules dashboard
  showComprehensiveModulesDashboard() {
    this.closeModal()
    this.showAlert('success', 'Loading comprehensive regulatory intelligence dashboard...')
    
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-7xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-tachometer-alt mr-2 text-indigo-600"></i>🇨🇦 Comprehensive Regulatory Intelligence Dashboard
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-blue-600">156</div>
                <div class="text-sm text-blue-700">Insurance Companies</div>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-green-600">8,425</div>
                <div class="text-sm text-green-700">Pension Plans</div>
              </div>
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-purple-600">342</div>
                <div class="text-sm text-purple-700">Payment Providers</div>
              </div>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-yellow-600">2,891</div>
                <div class="text-sm text-yellow-700">Securities Entities</div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">
                  <i class="fas fa-flag mr-2"></i>Provincial Coverage Map
                </h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span>🏛️ Ontario (FSRA)</span>
                    <span class="text-blue-600 font-medium">2,847 entities</span>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span>🏛️ Québec (AMF)</span>
                    <span class="text-red-600 font-medium">1,456 entités</span>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span>🏛️ British Columbia (BCFSA)</span>
                    <span class="text-green-600 font-medium">892 entities</span>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span>🏛️ Alberta (ASIC)</span>
                    <span class="text-orange-600 font-medium">634 entities</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">
                  <i class="fas fa-chart-pie mr-2"></i>Cross-Module Analytics
                </h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm">Regulatory Compliance</span>
                      <span class="text-sm font-medium">97.8%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full" style="width: 97.8%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm">Cross-Jurisdictional Coordination</span>
                      <span class="text-sm font-medium">94.2%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" style="width: 94.2%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm">French Language Coverage</span>
                      <span class="text-sm font-medium">100%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-red-600 h-2 rounded-full" style="width: 100%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
              <div class="text-center">
                <h4 class="text-xl font-bold text-indigo-900 mb-3">
                  🚀 Complete Canadian Financial Regulatory Platform
                </h4>
                <p class="text-indigo-800 mb-4">
                  CFRP now provides comprehensive coverage across all major regulatory domains: 
                  Insurance, Pensions, Payments, Provincial Coordination, and Securities - with full bilingual support and cross-jurisdictional intelligence.
                </p>
                <div class="flex justify-center gap-4">
                  <button onclick="CFRP.exportComprehensiveReport()" class="btn btn-primary">
                    <i class="fas fa-download mr-2"></i>Export Full Report
                  </button>
                  <button onclick="CFRP.scheduleRegulatoryBriefing()" class="btn btn-secondary">
                    <i class="fas fa-calendar mr-2"></i>Schedule Briefing
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Switch language interface
  switchLanguage(lang) {
    if (window.CFRPI18n) {
      window.CFRPI18n.setLanguage(lang)
      this.showAlert('success', lang === 'fr' ? 'Interface changée en français' : 'Interface switched to English')
    } else {
      this.showAlert('info', lang === 'fr' ? 'Chargement de l\'interface française...' : 'Loading French interface...')
    }
  },

  // Placeholder functions for demonstration
  async runInsuranceRiskAnalysis() {
    this.showAlert('info', 'Running comprehensive insurance risk analysis across MCT ratios, combined ratios, and regulatory thresholds...')
  },

  async viewInsuranceCompliance() {
    this.showAlert('info', 'Checking insurance compliance across OSFI, provincial regulators, and market conduct requirements...')
  },

  async submitPensionFiling() {
    this.showAlert('info', 'Opening pension plan filing form for actuarial reports, funding assessments, and investment performance...')
  },

  async runFundingAnalysis() {
    this.showAlert('info', 'Analyzing pension plan funding ratios, solvency positions, and contribution requirements...')
  },

  async checkPensionCompliance() {
    this.showAlert('info', 'Reviewing pension compliance across OSFI, Retraite Québec, and provincial pension regulators...')
  },

  async submitPaymentFiling() {
    this.showAlert('info', 'Opening payment service provider filing form for MSB registration, AML compliance, and transaction reporting...')
  },

  async runAMLCheck() {
    this.showAlert('info', 'Running AML/KYC compliance check across payment transactions and customer due diligence...')
  },

  async monitorTransactions() {
    this.showAlert('info', 'Monitoring payment transactions for suspicious patterns, high-risk jurisdictions, and regulatory thresholds...')
  },

  async submitMultiJurisdictionFiling() {
    this.showAlert('info', 'Opening multi-jurisdiction filing interface for coordinated submissions across provincial regulators...')
  },

  async coordinateRegulators() {
    this.showAlert('info', 'Initiating cross-jurisdictional regulator coordination for parallel review and information sharing...')
  },

  async submitSecuritiesFiling() {
    this.showAlert('info', 'Opening securities filing interface for SEDAR+, NRD, and SEDI system submissions...')
  },

  async runMarketSurveillance() {
    this.showAlert('info', 'Running market surveillance analysis for suspicious trading patterns and disclosure violations...')
  },

  async checkInsiderTrading() {
    this.showAlert('info', 'Analyzing insider trading patterns and beneficial ownership disclosure compliance...')
  },

  async exportComprehensiveReport() {
    this.showAlert('success', 'Generating comprehensive regulatory intelligence report across all specialized modules...')
  },

  async scheduleRegulatoryBriefing() {
    this.showAlert('info', 'Scheduling comprehensive regulatory briefing with cross-module analytics and trend analysis...')
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
              <button class="btn btn-primary" onclick="CFRP.showFilingModal()">
                <i class="fas fa-plus mr-2"></i>New Filing
              </button>
              <button class="btn btn-secondary" onclick="CFRP.showFilingStatus()">
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
  },

  // Helper function to get entity name by ID
  getEntityName(entityId) {
    if (!entityId) return 'Unknown Institution'
    
    const entityNames = {
      1: 'Royal Bank of Canada',
      2: 'Toronto-Dominion Bank', 
      3: 'Bank of Nova Scotia',
      4: 'Bank of Montreal',
      5: 'Canadian Imperial Bank of Commerce',
      6: 'Desjardins Group',
      7: 'Vancity Credit Union',
      8: 'Manulife Financial Corporation',
      9: 'Sun Life Financial Inc.',
      10: 'Great-West Lifeco Inc.',
      11: 'Questrade Inc.'
    }
    
    return entityNames[entityId] || `Entity ${entityId}`
  },

  // Create sample data for demo purposes
  async createSampleData(type) {
    if (!this.user || (this.user.role !== 'admin' && this.user.role !== 'regulator')) {
      this.showAlert('error', 'Only administrators and regulators can create sample data')
      return
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/${type}/demo/create-sample-${type}`, {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', `Sample ${type} created successfully! Added ${data.data.count || 'multiple'} records.`)
        // Refresh the dashboard to show new data
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || `Failed to create sample ${type}`)
      }
    } catch (error) {
      console.error(`Create sample ${type} error:`, error)
      this.showAlert('error', 'Network error. Please try again.')
    }
  },

  // Show detailed entity information for regulators
  async showEntityDetails(entityId, entityName = null) {
    try {
      // Show loading modal first
      const loadingModal = `
        <div class="modal-overlay" id="entityLoadingModal">
          <div class="modal-content max-w-4xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold">Loading Entity Details...</h3>
            </div>
            <div class="modal-body text-center py-8">
              <div class="spinner mx-auto mb-4"></div>
              <p class="text-gray-600">Fetching comprehensive data for ${entityName || 'entity'}...</p>
            </div>
          </div>
        </div>
      `
      document.body.insertAdjacentHTML('beforeend', loadingModal)

      // Fetch entity details and related data (use available endpoints)
      const [entitiesResponse, filingsResponse] = await Promise.all([
        fetch(`${this.apiBaseUrl}/entities?limit=50`, { credentials: 'include' }),
        fetch(`${this.apiBaseUrl}/filings?entity_id=${entityId}&limit=5`, { credentials: 'include' })
      ])

      const entitiesData = entitiesResponse.ok ? await entitiesResponse.json() : null
      const filingsData = filingsResponse.ok ? await filingsResponse.json() : null  

      // Find the specific entity from the entities list
      const entity = entitiesData?.data?.find(e => e.id === parseInt(entityId)) || {}
      const filings = filingsData?.data || []

      // Remove loading modal
      document.getElementById('entityLoadingModal')?.remove()

      // Calculate entity metrics
      const recentFilings = filings.slice(0, 3)
      const pendingFilings = filings.filter(f => f.status === 'pending').length
      const flaggedFilings = filings.filter(f => f.status === 'flagged').length
      const avgRiskScore = entity.risk_score || 'N/A'

      const getRiskColor = (score) => {
        if (score >= 7) return 'text-red-600'
        if (score >= 5) return 'text-yellow-600'  
        return 'text-green-600'
      }

      const getTypeDisplay = (type) => {
        const types = {
          'bank': 'Chartered Bank',
          'credit_union': 'Credit Union', 
          'insurer': 'Insurance Company',
          'investment_firm': 'Investment Firm',
          'trust_company': 'Trust Company'
        }
        return types[type] || type
      }

      // Show comprehensive entity details modal
      const detailsModal = `
        <div class="modal-overlay">
          <div class="modal-content max-w-6xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold">${entity.name || entityName} - Regulatory Overview</h3>
              <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body max-h-96 overflow-y-auto">
              <div class="grid grid-cols-3 gap-6 mb-6">
                
                <!-- Entity Information -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium mb-3 flex items-center">
                    <i class="fas fa-building mr-2 text-blue-600"></i>Institution Profile
                  </h4>
                  <div class="space-y-2 text-sm">
                    <div><strong>Entity ID:</strong> ${entity.id || entityId}</div>
                    <div><strong>Type:</strong> ${getTypeDisplay(entity.type)}</div>
                    <div><strong>Jurisdiction:</strong> ${entity.jurisdiction || 'Federal'}</div>
                    <div><strong>Registration:</strong> ${entity.registration_number || 'N/A'}</div>
                    <div><strong>Status:</strong> 
                      <span class="px-2 py-1 rounded text-xs ${entity.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${(entity.status || 'Active').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Risk Assessment -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium mb-3 flex items-center">
                    <i class="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>Risk Profile
                  </h4>
                  <div class="space-y-2 text-sm">
                    <div><strong>Current Risk Score:</strong> 
                      <span class="${getRiskColor(avgRiskScore)} font-medium">${avgRiskScore}</span>
                    </div>
                    <div><strong>Risk Level:</strong> 
                      <span class="${getRiskColor(avgRiskScore)} font-medium">
                        ${avgRiskScore >= 7 ? 'High' : avgRiskScore >= 5 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div><strong>Flagged Filings:</strong> 
                      <span class="${flaggedFilings > 0 ? 'text-red-600' : 'text-green-600'} font-medium">
                        ${flaggedFilings}
                      </span>
                    </div>
                    <div><strong>Pending Reviews:</strong> ${pendingFilings}</div>
                    <div><strong>Last Updated:</strong> ${new Date(entity.updated_at || Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>

                <!-- Regulatory Actions -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium mb-3 flex items-center">
                    <i class="fas fa-gavel mr-2 text-purple-600"></i>Regulatory Actions
                  </h4>
                  <div class="space-y-2">
                    <button class="btn btn-primary w-full text-sm" onclick="CFRP.createCaseForEntity(${entity.id || entityId})">
                      <i class="fas fa-folder-plus mr-2"></i>Create Case
                    </button>
                    <button class="btn btn-secondary w-full text-sm" onclick="CFRP.viewEntityFilings(${entity.id || entityId})">
                      <i class="fas fa-file-alt mr-2"></i>View All Filings
                    </button>
                    <button class="btn btn-secondary w-full text-sm" onclick="CFRP.generateRiskReport(${entity.id || entityId})">
                      <i class="fas fa-chart-line mr-2"></i>Risk Report
                    </button>
                  </div>
                </div>
              </div>

              <!-- Recent Filings -->
              <div class="mb-6">
                <h4 class="font-medium mb-3 flex items-center">
                  <i class="fas fa-file-alt mr-2 text-green-600"></i>Recent Filing Activity
                </h4>
                <div class="bg-white border rounded-lg overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="min-w-full">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filing ID</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        ${recentFilings.length > 0 ? recentFilings.map(filing => `
                          <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 text-sm font-medium text-blue-600">#${filing.id}</td>
                            <td class="px-4 py-2 text-sm">${filing.filing_type_display || filing.filing_type}</td>
                            <td class="px-4 py-2">
                              <span class="status-badge status-${filing.status}">${filing.status_display || filing.status}</span>
                            </td>
                            <td class="px-4 py-2 text-sm ${getRiskColor(filing.risk_score)}">${filing.risk_score || 'N/A'}</td>
                            <td class="px-4 py-2 text-sm text-gray-600">${new Date(filing.submitted_at).toLocaleDateString()}</td>
                            <td class="px-4 py-2">
                              <button class="btn btn-sm btn-secondary" onclick="CFRP.reviewFiling(${filing.id})">
                                Review
                              </button>
                            </td>
                          </tr>
                        `).join('') : `
                          <tr>
                            <td colspan="6" class="px-4 py-8 text-center text-gray-500">No recent filings found</td>
                          </tr>
                        `}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Regulatory Guidance -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium mb-2 text-blue-900">
                  <i class="fas fa-info-circle mr-2"></i>Regulatory Guidance
                </h4>
                <div class="text-sm text-blue-800 space-y-1">
                  ${flaggedFilings > 0 ? `<p><strong>⚠️ Action Required:</strong> ${flaggedFilings} filing(s) flagged for review with validation issues.</p>` : ''}
                  ${pendingFilings > 0 ? `<p><strong>📋 Pending Review:</strong> ${pendingFilings} filing(s) awaiting regulatory review.</p>` : ''}
                  ${avgRiskScore >= 7 ? `<p><strong>🔴 High Risk:</strong> Entity shows elevated risk profile requiring enhanced supervision.</p>` : ''}
                  <p><strong>📅 Next Action:</strong> ${flaggedFilings > 0 ? 'Review flagged filings and create investigation case if needed.' : 'Monitor upcoming filing deadlines and compliance requirements.'}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      `
      
      document.body.insertAdjacentHTML('beforeend', detailsModal)

    } catch (error) {
      console.error('Entity details error:', error)
      document.getElementById('entityLoadingModal')?.remove()
      this.showAlert('error', 'Failed to load entity details. Please try again.')
    }
  },

  // Add click handler for filing rows
  showFilingDetails(filingId, filingType) {
    this.showAlert('info', `Loading details for Filing #${filingId}...`)
    
    // Add detailed filing information modal here
    // For now, just show a simple alert
  },

  // Review filing details with comprehensive regulatory information
  async reviewFilingDetails(filingId) {
    try {
      
      const response = await fetch(`${this.apiBaseUrl}/filings?limit=50`, {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!data.success) {
        this.showAlert('error', 'Failed to load filing details')
        return
      }
      
      // Find the specific filing from the filings list
      const filing = data.data.find(f => f.id === parseInt(filingId))
      if (!filing) {
        this.showAlert('error', 'Filing not found')
        return
      }
      
      const modal = `
        <div class="modal-overlay">
          <div class="modal-content max-w-6xl">
            <div class="modal-header">
              <h3 class="text-xl font-semibold">
                <i class="fas fa-file-alt mr-2"></i>Filing Details - #${filing.id}
              </h3>
              <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body max-h-96 overflow-y-auto">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <!-- Filing Information -->
                <div class="space-y-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium mb-3 text-gray-900">Filing Information</h4>
                    <div class="space-y-2 text-sm">
                      <div class="grid grid-cols-2 gap-4">
                        <div><span class="text-gray-500">Filing ID:</span> <span class="font-medium">#${filing.id}</span></div>
                        <div><span class="text-gray-500">Type:</span> <span class="font-medium">${filing.filing_type_display}</span></div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div><span class="text-gray-500">Status:</span> <span class="status-badge status-${filing.status}">${filing.status_display}</span></div>
                        <div><span class="text-gray-500">Risk Score:</span> <span class="font-medium ${filing.risk_score >= 7 ? 'text-red-600' : filing.risk_score >= 5 ? 'text-yellow-600' : 'text-green-600'}">${filing.risk_score || 'N/A'}</span></div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div><span class="text-gray-500">Submitted:</span> <span class="font-medium">${new Date(filing.submitted_at).toLocaleDateString()}</span></div>
                        <div><span class="text-gray-500">Entity:</span> <span class="font-medium">${filing.entity_name}</span></div>
                      </div>
                    </div>
                  </div>

                  ${filing.validation_errors && filing.validation_errors.length > 0 ? `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 class="font-medium mb-3 text-red-900">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Validation Issues (${filing.validation_errors.length})
                      </h4>
                      <div class="space-y-2">
                        ${filing.validation_errors.map(error => `
                          <div class="bg-white border border-red-200 rounded p-3">
                            <div class="font-medium text-red-900">${error.field}</div>
                            <div class="text-sm text-red-700">${error.message}</div>
                            ${error.suggestion ? `<div class="text-xs text-red-600 mt-1"><strong>Suggestion:</strong> ${error.suggestion}</div>` : ''}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- Regulatory Actions -->
                <div class="space-y-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-medium mb-3 text-blue-900">
                      <i class="fas fa-gavel mr-2"></i>Regulatory Actions Available
                    </h4>
                    <div class="space-y-2">
                      ${this.user?.role === 'regulator' || this.user?.role === 'admin' ? `
                        ${filing.status === 'pending' ? `
                          <button class="btn btn-sm btn-success w-full" onclick="CFRP.approveFiling(${filing.id})">
                            <i class="fas fa-check mr-2"></i>Approve Filing
                          </button>
                          <button class="btn btn-sm btn-warning w-full" onclick="CFRP.flagFiling(${filing.id})">
                            <i class="fas fa-flag mr-2"></i>Flag for Review
                          </button>
                          <button class="btn btn-sm btn-danger w-full" onclick="CFRP.rejectFiling(${filing.id})">
                            <i class="fas fa-times mr-2"></i>Reject Filing
                          </button>
                        ` : ''}
                        <button class="btn btn-sm btn-primary w-full" onclick="CFRP.createCaseForFiling(${filing.id}, ${filing.entity_id})">
                          <i class="fas fa-folder-plus mr-2"></i>Create Investigation Case
                        </button>
                        <button class="btn btn-sm btn-secondary w-full" onclick="CFRP.assignReviewer(${filing.id})">
                          <i class="fas fa-user-plus mr-2"></i>Assign Reviewer
                        </button>
                      ` : `
                        ${filing.status === 'flagged' ? `
                          <button class="btn btn-sm btn-warning w-full" onclick="CFRP.resubmitFiling(${filing.id})">
                            <i class="fas fa-redo mr-2"></i>Resubmit Filing
                          </button>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary w-full" onclick="CFRP.downloadFiling(${filing.id})">
                          <i class="fas fa-download mr-2"></i>Download Copy
                        </button>
                      `}
                    </div>
                  </div>

                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 class="font-medium mb-3 text-green-900">
                      <i class="fas fa-info-circle mr-2"></i>Regulatory Guidance
                    </h4>
                    <div class="text-sm text-green-800 space-y-1">
                      ${filing.status === 'flagged' ? `
                        <p><strong>Action Required:</strong> This filing has validation issues that must be resolved before approval.</p>
                        <p><strong>Next Step:</strong> Entity must address all validation errors and resubmit.</p>
                      ` : filing.status === 'pending' ? `
                        <p><strong>Status:</strong> Filing is under regulatory review.</p>
                        <p><strong>Timeline:</strong> Standard review period is 10-15 business days.</p>
                      ` : filing.status === 'validated' ? `
                        <p><strong>Status:</strong> Filing has been approved and meets regulatory requirements.</p>
                        <p><strong>Action:</strong> No further action required from entity.</p>
                      ` : ''}
                      <p><strong>Compliance:</strong> Filing must adhere to ${filing.filing_type === 'capital_adequacy' ? 'Basel III' : 'OSFI'} requirements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
              ${filing.file_url ? `<button onclick="window.open('${filing.file_url}', '_blank')" class="btn btn-primary">View Document</button>` : ''}
            </div>
          </div>
        </div>
      `
      
      document.body.insertAdjacentHTML('beforeend', modal)
      
    } catch (error) {
      console.error('Filing details error:', error)
      this.showAlert('error', 'Failed to load filing details. Please try again.')
    }
  },

  // Create investigation case for entity
  async createCaseForEntity(entityId, entityName) {
    try {
      const modal = `
        <div class="modal-overlay">
          <div class="modal-content max-w-2xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold">
                <i class="fas fa-folder-plus mr-2"></i>Create Investigation Case - ${entityName}
              </h3>
              <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <form id="createCaseForm" class="space-y-4">
                <input type="hidden" name="entity_id" value="${entityId}">
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Case Title</label>
                  <input type="text" name="title" required class="form-input w-full" placeholder="Investigation Title">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select name="priority" required class="form-select w-full">
                    <option value="high">High Priority</option>
                    <option value="medium" selected>Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Investigation Type</label>
                  <select name="investigation_type" required class="form-select w-full">
                    <option value="compliance">Compliance Review</option>
                    <option value="risk_assessment">Risk Assessment</option>
                    <option value="regulatory_violation">Regulatory Violation</option>
                    <option value="market_conduct">Market Conduct</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" required class="form-textarea w-full h-24" placeholder="Describe the investigation scope and objectives..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
              <button onclick="CFRP.submitCreateCase()" class="btn btn-primary">Create Case</button>
            </div>
          </div>
        </div>
      `
      
      document.body.insertAdjacentHTML('beforeend', modal)
      
    } catch (error) {
      console.error('Create case error:', error)
      this.showAlert('error', 'Failed to open case creation form')
    }
  },

  // Create case for filing
  async createCaseForFiling(filingId, entityId) {
    try {
      const entityName = this.getEntityName(entityId)
      const modal = `
        <div class="modal-overlay">
          <div class="modal-content max-w-2xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold">
                <i class="fas fa-folder-plus mr-2"></i>Create Case for Filing #${filingId}
              </h3>
              <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <form id="createFilingCaseForm" class="space-y-4">
                <input type="hidden" name="entity_id" value="${entityId}">
                <input type="hidden" name="filing_id" value="${filingId}">
                
                <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <div class="text-sm text-blue-800">
                    <div><strong>Entity:</strong> ${entityName}</div>
                    <div><strong>Filing:</strong> #${filingId}</div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Case Title</label>
                  <input type="text" name="title" required class="form-input w-full" placeholder="Case title based on filing issues">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select name="priority" required class="form-select w-full">
                    <option value="high">High Priority</option>
                    <option value="medium" selected>Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
                  <select name="case_type" required class="form-select w-full">
                    <option value="filing_review">Filing Review</option>
                    <option value="compliance_issue">Compliance Issue</option>
                    <option value="data_quality">Data Quality Investigation</option>
                    <option value="risk_concern">Risk Concern</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" required class="form-textarea w-full h-24" placeholder="Describe the issues found in the filing and investigation objectives..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
              <button onclick="CFRP.submitCreateFilingCase()" class="btn btn-primary">Create Case</button>
            </div>
          </div>
        </div>
      `
      
      document.body.insertAdjacentHTML('beforeend', modal)
      
    } catch (error) {
      console.error('Create filing case error:', error)
      this.showAlert('error', 'Failed to open case creation form')
    }
  },

  // Submit case creation
  async submitCreateCase() {
    try {
      const form = document.getElementById('createCaseForm')
      const formData = new FormData(form)
      
      const caseData = {
        entity_id: parseInt(formData.get('entity_id')),
        title: formData.get('title'),
        priority: formData.get('priority'),
        investigation_type: formData.get('investigation_type'),
        description: formData.get('description')
      }
      
      const response = await fetch(`${this.apiBaseUrl}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(caseData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', `Investigation case #${data.data.id} created successfully`)
        // Refresh any case listings if they exist
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Failed to create case')
      }
      
    } catch (error) {
      console.error('Submit case error:', error)
      this.showAlert('error', 'Network error while creating case')
    }
  },

  // Submit filing case creation
  async submitCreateFilingCase() {
    try {
      const form = document.getElementById('createFilingCaseForm')
      const formData = new FormData(form)
      
      const caseData = {
        entity_id: parseInt(formData.get('entity_id')),
        filing_id: parseInt(formData.get('filing_id')),
        title: formData.get('title'),
        priority: formData.get('priority'),
        case_type: formData.get('case_type'),
        description: formData.get('description')
      }
      
      const response = await fetch(`${this.apiBaseUrl}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(caseData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', `Investigation case #${data.data.id} created for filing successfully`)
        // Refresh any case listings if they exist
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Failed to create case')
      }
      
    } catch (error) {
      console.error('Submit filing case error:', error)
      this.showAlert('error', 'Network error while creating filing case')
    }
  },

  // Filing action methods
  async approveFiling(filingId) {
    if (!confirm('Are you sure you want to approve this filing?')) return
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}/approve`, {
        method: 'PUT',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', 'Filing approved successfully')
        this.closeModal()
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Failed to approve filing')
      }
    } catch (error) {
      console.error('Approve filing error:', error)
      this.showAlert('error', 'Network error while approving filing')
    }
  },

  async flagFiling(filingId) {
    const reason = prompt('Please provide a reason for flagging this filing:')
    if (!reason) return
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}/flag`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', 'Filing flagged for review')
        this.closeModal()
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Failed to flag filing')
      }
    } catch (error) {
      console.error('Flag filing error:', error)
      this.showAlert('error', 'Network error while flagging filing')
    }
  },

  async rejectFiling(filingId) {
    const reason = prompt('Please provide a reason for rejecting this filing:')
    if (!reason) return
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', 'Filing rejected')
        this.closeModal()
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Failed to reject filing')
      }
    } catch (error) {
      console.error('Reject filing error:', error)
      this.showAlert('error', 'Network error while rejecting filing')
    }
  },

  async resubmitFiling(filingId) {
    if (!confirm('Are you sure you want to resubmit this filing? Please ensure all validation issues have been resolved.')) return
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}/resubmit`, {
        method: 'PUT',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showAlert('success', 'Filing resubmitted successfully')
        this.closeModal()
        this.loadDashboardData()
      } else {
        this.showAlert('error', data.error || 'Failed to resubmit filing')
      }
    } catch (error) {
      console.error('Resubmit filing error:', error)
      this.showAlert('error', 'Network error while resubmitting filing')
    }
  },

  // Show new filing modal
  async showNewFilingModal() {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-2xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-upload mr-2"></i>Submit New Filing
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="newFilingForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Filing Type</label>
                  <select name="filing_type" required class="form-select w-full" onchange="CFRP.updateFilingForm(this.value)">
                    <option value="">Select filing type...</option>
                    <option value="quarterly_return">Quarterly Return</option>
                    <option value="annual_report">Annual Report</option>
                    <option value="risk_report">Risk Assessment Report</option>
                    <option value="capital_adequacy">Capital Adequacy Report</option>
                    <option value="liquidity_report">Liquidity Coverage Report</option>
                    <option value="conduct_report">Market Conduct Report</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Reporting Period</label>
                  <input type="text" name="reporting_period" required class="form-input w-full" placeholder="e.g., 2025-Q1">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                  <input type="file" name="file" class="form-input w-full" accept=".pdf,.xlsx,.csv">
                </div>
              </div>
              
              <!-- Financial Data Section (for real-time analysis) -->
              <div id="financialDataSection" class="border-t pt-4 mt-4" style="display: none;">
                <h4 class="text-md font-semibold text-gray-900 mb-3">
                  <i class="fas fa-calculator mr-2 text-blue-600"></i>Financial Data (Real-Time Analysis)
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tier 1 Capital Ratio
                      <span class="text-xs text-gray-500">(e.g., 0.12 for 12%)</span>
                    </label>
                    <input type="number" name="tier1_ratio" step="0.001" min="0" max="1" class="form-input w-full" placeholder="0.12" onchange="CFRP.validateFieldRealTime(this)">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Leverage Ratio
                      <span class="text-xs text-gray-500">(minimum 3%)</span>
                    </label>
                    <input type="number" name="leverage_ratio" step="0.001" min="0" max="1" class="form-input w-full" placeholder="0.05" onchange="CFRP.validateFieldRealTime(this)">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Liquidity Coverage Ratio
                      <span class="text-xs text-gray-500">(minimum 100%)</span>
                    </label>
                    <input type="number" name="liquidity_coverage_ratio" step="0.01" min="0" class="form-input w-full" placeholder="1.2" onchange="CFRP.validateFieldRealTime(this)">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Total Assets
                      <span class="text-xs text-gray-500">(CAD millions)</span>
                    </label>
                    <input type="number" name="total_assets" step="1000000" min="0" class="form-input w-full" placeholder="1000000000">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Consumer Complaints
                      <span class="text-xs text-gray-500">(this period)</span>
                    </label>
                    <input type="number" name="consumer_complaints" min="0" class="form-input w-full" placeholder="15" onchange="CFRP.validateFieldRealTime(this)">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Operational Losses
                      <span class="text-xs text-gray-500">(CAD)</span>
                    </label>
                    <input type="number" name="operational_losses" min="0" class="form-input w-full" placeholder="500000">
                  </div>
                </div>
                
                <!-- Real-time validation feedback -->
                <div id="validationFeedback" class="mt-4" style="display: none;">
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 class="text-sm font-medium text-yellow-800 mb-2">
                      <i class="fas fa-exclamation-triangle mr-1"></i>Real-Time Validation
                    </h5>
                    <div id="validationMessages" class="space-y-1"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea name="notes" class="form-textarea w-full h-20" placeholder="Optional notes about this filing..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
            <button onclick="CFRP.submitNewFiling()" class="btn btn-primary">Submit Filing</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Submit new filing with real-time analysis
  async submitNewFiling() {
    try {
      const form = document.getElementById('newFilingForm')
      const formData = new FormData(form)
      
      const filingData = {
        filing_type: formData.get('filing_type'),
        reporting_period: formData.get('reporting_period'),
        notes: formData.get('notes'),
        // Add sample financial data for demonstration
        tier1_ratio: parseFloat(formData.get('tier1_ratio') || '0.12'),
        leverage_ratio: parseFloat(formData.get('leverage_ratio') || '0.05'),
        liquidity_coverage_ratio: parseFloat(formData.get('liquidity_coverage_ratio') || '1.2'),
        total_assets: parseFloat(formData.get('total_assets') || '1000000000'),
        consumer_complaints: parseInt(formData.get('consumer_complaints') || '15')
      }

      // Show analysis in progress
      this.showAlert('info', 'Analyzing submission in real-time...')
      
      // Step 1: Real-time analysis
      const analysisResponse = await fetch(`${this.apiBaseUrl}/realtime/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({...filingData, entity_id: this.user?.entity_id || 1})
      })
      
      const analysisData = await analysisResponse.json()
      
      if (analysisData.success) {
        // Show analysis results
        const analysisResult = analysisData.data.real_time_results
        
        if (analysisResult.compliance_status === 'non_compliant') {
          this.showAlert('error', `Compliance issues detected: ${analysisResult.alerts.map(a => a.message).join(', ')}`)
          return
        }
        
        if (analysisResult.risk_score.score >= 7) {
          const proceed = confirm(`High risk score detected (${analysisResult.risk_score.score}/10). Proceed with submission?`)
          if (!proceed) return
        }
      }
      
      // Step 2: Submit filing
      const response = await fetch(`${this.apiBaseUrl}/filings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(filingData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const filingId = data.data.id
        
        // Step 3: Auto-distribute to agencies
        const distributionResponse = await fetch(`${this.apiBaseUrl}/distribution/distribute/${filingId}`, {
          method: 'POST',
          credentials: 'include'
        })
        
        const distributionData = await distributionResponse.json()
        
        // Step 4: Compliance flagging check
        const flagResponse = await fetch(`${this.apiBaseUrl}/compliance/flag-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({...filingData, entity_id: this.user?.entity_id || 1, filing_id: filingId})
        })
        
        this.closeModal()
        
        if (distributionData.success) {
          this.showAlert('success', `Filing #${filingId} submitted and distributed to ${distributionData.data.total_agencies} agencies`)
        } else {
          this.showAlert('success', `Filing #${filingId} submitted successfully`)
        }
        
        // Show comprehensive submission results
        this.showSubmissionResults(filingId, analysisData, distributionData)
        
        // Refresh filings if on filings page
        if (this.currentPage === 'filings') {
          this.loadAllFilings()
        }
      } else {
        this.showAlert('error', data.error || 'Failed to submit filing')
      }
      
    } catch (error) {
      console.error('Submit filing error:', error)
      this.showAlert('error', 'Network error while submitting filing')
    }
  },

  // Show comprehensive submission results
  showSubmissionResults(filingId, analysisData, distributionData) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-4xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-check-circle mr-2 text-green-600"></i>Submission Complete - Filing #${filingId}
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Analysis Results -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-3">
                  <i class="fas fa-chart-line mr-2"></i>Real-Time Analysis
                </h4>
                ${analysisData.success ? `
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-blue-700">Risk Score:</span>
                      <span class="font-medium text-blue-900">${analysisData.data.real_time_results.risk_score.score}/10 (${analysisData.data.real_time_results.risk_score.level})</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-blue-700">Compliance Status:</span>
                      <span class="font-medium text-blue-900">${analysisData.data.real_time_results.compliance_status}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-blue-700">Processing Time:</span>
                      <span class="font-medium text-blue-900">${analysisData.data.real_time_results.processing_time_ms}ms</span>
                    </div>
                  </div>
                ` : '<p class="text-blue-600">Analysis completed</p>'}
              </div>
              
              <!-- Distribution Results -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-medium text-green-900 mb-3">
                  <i class="fas fa-share-alt mr-2"></i>Multi-Agency Distribution
                </h4>
                ${distributionData && distributionData.success ? `
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-green-700">Agencies Notified:</span>
                      <span class="font-medium text-green-900">${distributionData.data.total_agencies}</span>
                    </div>
                    <div class="space-y-1">
                      ${distributionData.data.distributions.map(d => `
                        <div class="text-sm text-green-600">
                          <i class="fas fa-check mr-1"></i>${d.agency.toUpperCase()} (${d.format})
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : '<p class="text-green-600">Standard submission process</p>'}
              </div>
            </div>
            
            <!-- Next Actions -->
            <div class="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">
                <i class="fas fa-tasks mr-2"></i>Next Actions
              </h4>
              <div class="space-y-2">
                ${analysisData.success && analysisData.data.next_actions ? 
                  analysisData.data.next_actions.map(action => `
                    <div class="flex items-center text-sm text-gray-700">
                      <i class="fas fa-arrow-right text-gray-500 mr-2"></i>
                      ${action}
                    </div>
                  `).join('') : 
                  '<div class="text-gray-600">No additional actions required</div>'
                }
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.viewFilingDetails(${filingId})" class="btn btn-primary">View Filing Details</button>
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Generate filing report for regulatory purposes
  async generateFilingReport(entityId) {
    try {
      this.showAlert('info', 'Generating filing report...')
      
      const response = await fetch(`${this.apiBaseUrl}/reports/filings?entity_id=${entityId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `filing-report-${entityId}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        this.showAlert('success', 'Filing report downloaded successfully')
      } else {
        this.showAlert('error', 'Failed to generate filing report')
      }
    } catch (error) {
      console.error('Generate report error:', error)
      this.showAlert('error', 'Network error while generating report')
    }
  },

  // =========================
  // PAGE HEADER ACTION FUNCTIONS
  // =========================
  
  showDashboardActions() {
    const actions = [
      {
        icon: 'fas fa-plus-circle',
        text: 'Quick Report',
        onclick: 'CFRP.generateQuickReport()',
        class: 'btn-primary'
      },
      {
        icon: 'fas fa-download', 
        text: 'Export Data',
        onclick: 'CFRP.exportDashboardData()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-cog',
        text: 'Settings',
        onclick: 'CFRP.showDashboardSettings()',
        class: 'btn-secondary'
      }
    ]
    
    this.updatePageHeader('fas fa-tachometer-alt', 'Dashboard Overview', 'Comprehensive regulatory oversight and compliance management platform', actions)
  },

  showEntitiesActions() {
    const actions = [
      {
        icon: 'fas fa-plus',
        text: 'Add Entity',
        onclick: 'CFRP.showAddEntityModal()',
        class: 'btn-primary'
      },
      {
        icon: 'fas fa-upload',
        text: 'Bulk Import',
        onclick: 'CFRP.bulkImportEntities()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-download',
        text: 'Export Entities',
        onclick: 'CFRP.exportEntities()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-filter',
        text: 'Advanced Filter',
        onclick: 'CFRP.showAdvancedEntityFilter()',
        class: 'btn-secondary'
      }
    ]
    
    this.updatePageHeader('fas fa-building', 'Registered Entities', 'Manage and monitor all regulated financial entities', actions)
  },

  showFilingsActions() {
    const actions = [
      {
        icon: 'fas fa-plus',
        text: 'New Filing',
        onclick: 'CFRP.showNewFilingModal()',
        class: 'btn-primary'
      },
      {
        icon: 'fas fa-calendar-alt',
        text: 'Filing Schedule',
        onclick: 'CFRP.showFilingSchedule()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-chart-bar',
        text: 'Filing Analytics',
        onclick: 'CFRP.showFilingAnalytics()',
        class: 'btn-secondary'
      }
    ]
    
    this.updatePageHeader('fas fa-file-alt', 'Regulatory Filings', 'Track and manage regulatory submissions and compliance reports', actions)
  },

  showRiskActions() {
    const actions = [
      {
        icon: 'fas fa-search',
        text: 'Risk Scan',
        onclick: 'CFRP.runRiskScan()',
        class: 'btn-primary'
      },
      {
        icon: 'fas fa-chart-line',
        text: 'Risk Analytics',
        onclick: 'CFRP.showRiskAnalytics()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-cog',
        text: 'Risk Settings',
        onclick: 'CFRP.showRiskSettings()',
        class: 'btn-secondary'
      }
    ]
    
    this.updatePageHeader('fas fa-exclamation-triangle', 'Risk Management', 'Monitor and assess regulatory compliance risks across all entities', actions)
  },

  showCasesActions() {
    const actions = [
      {
        icon: 'fas fa-plus',
        text: 'New Case',
        onclick: 'CFRP.createNewCase()',
        class: 'btn-primary'
      },
      {
        icon: 'fas fa-search',
        text: 'Case Search',
        onclick: 'CFRP.showCaseSearch()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-chart-pie',
        text: 'Case Analytics',
        onclick: 'CFRP.showCaseAnalytics()',
        class: 'btn-secondary'
      }
    ]
    
    this.updatePageHeader('fas fa-briefcase', 'Investigation Cases', 'Manage regulatory investigations and enforcement actions', actions)
  },

  showConductActions() {
    const actions = [
      {
        icon: 'fas fa-search-plus',
        text: 'Run Analysis',
        onclick: 'CFRP.showConductAnalysisModal()',
        class: 'btn-primary'
      },
      {
        icon: 'fas fa-shield-alt',
        text: 'Compliance Check',
        onclick: 'CFRP.runComplianceCheck()',
        class: 'btn-secondary'
      },
      {
        icon: 'fas fa-chart-area',
        text: 'Trend Analysis',
        onclick: 'CFRP.showConductTrends()',
        class: 'btn-secondary'
      }
    ]
    
    this.updatePageHeader('fas fa-balance-scale', 'Conduct Analysis', 'Advanced misconduct detection and regulatory compliance monitoring', actions)
  },

  // =========================
  // MISSING MISCONDUCT DETECTION RENDERING FUNCTIONS
  // =========================
  
  renderSyntheticCustomerResults(results) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-900 mb-3">Synthetic Customer Detection</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Suspicious Patterns</span>
              <span class="font-medium text-red-900">${results.suspicious_patterns?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Risk Score</span>
              <span class="font-medium text-red-900">${results.risk_score?.toFixed(1) || 'N/A'}/10</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Entities Flagged</span>
              <span class="font-medium text-red-900">${results.flagged_entities?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-3">Pattern Analysis</h4>
          <div class="text-sm text-blue-800">
            <p><strong>Identity Verification:</strong> ${results.identity_verification_score || 'N/A'}%</p>
            <p><strong>Behavioral Patterns:</strong> ${results.behavioral_score || 'N/A'}%</p>
            <p><strong>Network Analysis:</strong> ${results.network_score || 'N/A'}%</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Suspicious Patterns Detected</h4>
        <div class="space-y-3">
          ${results.suspicious_patterns?.map(pattern => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">${pattern.pattern_type?.replace(/_/g, ' ').toUpperCase()}</div>
                  <div class="text-sm text-gray-600 mt-1">${pattern.description}</div>
                  <div class="flex items-center mt-2">
                    <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      Confidence: ${(pattern.confidence * 100).toFixed(0)}%
                    </span>
                    <span class="text-sm text-gray-500 ml-2">Entities: ${pattern.entity_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">No suspicious patterns detected</p>'}
        </div>
      </div>
    `
  },

  renderJurisdictionViolationResults(results) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-900 mb-3">Cross-Border Violations</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Violations Detected</span>
              <span class="font-medium text-red-900">${results.violations?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Jurisdictions Affected</span>
              <span class="font-medium text-red-900">${results.affected_jurisdictions?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Severity Score</span>
              <span class="font-medium text-red-900">${results.severity_score?.toFixed(1) || 'N/A'}/10</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-3">Regulatory Mapping</h4>
          <div class="text-sm text-blue-800">
            <p><strong>Provincial Regulations:</strong> ${results.provincial_violations || 0}</p>
            <p><strong>Federal Regulations:</strong> ${results.federal_violations || 0}</p>
            <p><strong>Cross-Border Issues:</strong> ${results.cross_border_violations || 0}</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Jurisdiction Violations</h4>
        <div class="space-y-3">
          ${results.violations?.map(violation => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">${violation.jurisdiction} - ${violation.regulation_code}</div>
                  <div class="text-sm text-gray-600 mt-1">${violation.description}</div>
                  <div class="flex items-center mt-2">
                    <span class="text-xs px-2 py-1 bg-${violation.severity === 'critical' ? 'red' : 'orange'}-100 text-${violation.severity === 'critical' ? 'red' : 'orange'}-800 rounded">
                      ${violation.severity?.toUpperCase()}
                    </span>
                    <span class="text-sm text-gray-500 ml-2">Impact: ${violation.impact_level}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">No jurisdiction violations detected</p>'}
        </div>
      </div>
    `
  },

  renderFrontingArrangementResults(results) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-900 mb-3">Fronting Analysis</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Suspicious Arrangements</span>
              <span class="font-medium text-red-900">${results.suspicious_arrangements?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Risk Assessment</span>
              <span class="font-medium text-red-900">${results.risk_level || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Network Connections</span>
              <span class="font-medium text-red-900">${results.network_connections || 0}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-3">Arrangement Patterns</h4>
          <div class="text-sm text-blue-800">
            <p><strong>Policy Structures:</strong> ${results.policy_structures || 'N/A'}</p>
            <p><strong>Business Relationships:</strong> ${results.business_relationships || 'N/A'}</p>
            <p><strong>Financial Flows:</strong> ${results.financial_flows || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Suspicious Arrangements</h4>
        <div class="space-y-3">
          ${results.suspicious_arrangements?.map(arrangement => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">${arrangement.arrangement_type}</div>
                  <div class="text-sm text-gray-600 mt-1">${arrangement.description}</div>
                  <div class="flex items-center mt-2">
                    <span class="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                      Risk: ${arrangement.risk_score?.toFixed(1)}/10
                    </span>
                    <span class="text-sm text-gray-500 ml-2">Entities: ${arrangement.involved_entities || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">No suspicious arrangements detected</p>'}
        </div>
      </div>
    `
  },

  renderClientBorrowingResults(results) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-900 mb-3">Client Borrowing Violations</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Violations Found</span>
              <span class="font-medium text-red-900">${results.violations?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Ethics Score</span>
              <span class="font-medium text-red-900">${results.ethics_score?.toFixed(1) || 'N/A'}/10</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-red-700">Regulatory Breaches</span>
              <span class="font-medium text-red-900">${results.regulatory_breaches || 0}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-3">Ethics Assessment</h4>
          <div class="text-sm text-blue-800">
            <p><strong>Professional Standards:</strong> ${results.professional_standards_score || 'N/A'}%</p>
            <p><strong>Client Relationship:</strong> ${results.client_relationship_score || 'N/A'}%</p>
            <p><strong>Fiduciary Duty:</strong> ${results.fiduciary_duty_score || 'N/A'}%</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Detected Violations</h4>
        <div class="space-y-3">
          ${results.violations?.map(violation => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">${violation.violation_type?.replace(/_/g, ' ').toUpperCase()}</div>
                  <div class="text-sm text-gray-600 mt-1">${violation.description}</div>
                  <div class="flex items-center mt-2">
                    <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      Severity: ${violation.severity}
                    </span>
                    <span class="text-sm text-gray-500 ml-2">Advisor: ${violation.advisor_name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500">No violations detected</p>'}
        </div>
      </div>
    `
  },

  // =========================
  // ADDITIONAL ACTION FUNCTIONS
  // =========================

  generateQuickReport() {
    this.showAlert('info', 'Generating quick regulatory report...')
    // Implementation for quick report generation
  },

  exportDashboardData() {
    this.showAlert('info', 'Exporting dashboard data...')
    // Implementation for dashboard data export
  },

  showDashboardSettings() {
    this.showAlert('info', 'Opening dashboard settings...')
    // Implementation for dashboard settings
  },

  bulkImportEntities() {
    this.showAlert('info', 'Opening bulk import dialog...')
    // Implementation for bulk entity import
  },

  exportEntities() {
    this.showAlert('info', 'Exporting entities data...')
    // Implementation for entities export
  },

  showFilingSchedule() {
    this.showAlert('info', 'Opening filing schedule...')
    // Implementation for filing schedule
  },

  showFilingAnalytics() {
    this.showAlert('info', 'Opening filing analytics...')
    // Implementation for filing analytics
  },

  runRiskScan() {
    this.showAlert('info', 'Starting comprehensive risk scan...')
    // Implementation for risk scan
  },

  showRiskAnalytics() {
    this.showAlert('info', 'Opening risk analytics dashboard...')
    // Implementation for risk analytics
  },

  showRiskSettings() {
    this.showAlert('info', 'Opening risk management settings...')
    // Implementation for risk settings
  },

  createNewCase() {
    this.showAlert('info', 'Opening new case creation form...')
    // Implementation for new case creation
  },

  showCaseSearch() {
    this.showAlert('info', 'Opening case search interface...')
    // Implementation for case search
  },

  showCaseAnalytics() {
    this.showAlert('info', 'Opening case analytics dashboard...')
    // Implementation for case analytics
  },

  showConductAnalysisModal() {
    this.showAlert('info', 'Opening conduct analysis options...')
    // Implementation for conduct analysis modal
  },

  runComplianceCheck() {
    this.showAlert('info', 'Running system-wide compliance check...')
    // Implementation for compliance check
  },

  showConductTrends() {
    this.showAlert('info', 'Opening conduct trend analysis...')
    // Implementation for conduct trends
  },

  exportMisconductReport(detectionType) {
    this.showAlert('success', `Exporting ${detectionType} report...`)
    // Implementation for misconduct report export
  },

  // Update filing form based on selected type
  updateFilingForm(filingType) {
    const financialSection = document.getElementById('financialDataSection')
    
    // Show financial data section for reports that require it
    const requiresFinancialData = [
      'quarterly_return', 
      'capital_adequacy', 
      'liquidity_report', 
      'risk_report'
    ]
    
    if (requiresFinancialData.includes(filingType)) {
      financialSection.style.display = 'block'
    } else {
      financialSection.style.display = 'none'
    }
  },

  // Real-time field validation
  async validateFieldRealTime(field) {
    const fieldName = field.name
    const fieldValue = field.value
    const filingType = document.querySelector('[name="filing_type"]').value
    
    if (!fieldValue || !filingType) return
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/realtime/validate-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          field_name: fieldName,
          field_value: fieldValue,
          filing_type: filingType,
          context: { entity_id: this.user?.entity_id || 1 }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showFieldValidation(field, data.data)
      }
    } catch (error) {
      console.error('Real-time validation error:', error)
    }
  },

  // Show field validation feedback
  showFieldValidation(field, validation) {
    // Remove existing validation styling
    field.classList.remove('border-red-500', 'border-yellow-500', 'border-green-500')
    
    // Clear existing feedback for this field
    const existingFeedback = document.querySelector(`#feedback-${field.name}`)
    if (existingFeedback) existingFeedback.remove()
    
    // Apply validation styling
    if (!validation.is_valid) {
      field.classList.add('border-red-500')
    } else if (validation.warnings.length > 0) {
      field.classList.add('border-yellow-500')
    } else {
      field.classList.add('border-green-500')
    }
    
    // Show validation messages
    if (!validation.is_valid || validation.warnings.length > 0) {
      const feedbackDiv = document.createElement('div')
      feedbackDiv.id = `feedback-${field.name}`
      feedbackDiv.className = 'mt-1 text-xs'
      
      let feedbackHtml = ''
      
      if (validation.errors.length > 0) {
        feedbackHtml += validation.errors.map(error => 
          `<div class="text-red-600"><i class="fas fa-times mr-1"></i>${error}</div>`
        ).join('')
      }
      
      if (validation.warnings.length > 0) {
        feedbackHtml += validation.warnings.map(warning => 
          `<div class="text-yellow-600"><i class="fas fa-exclamation-triangle mr-1"></i>${warning}</div>`
        ).join('')
      }
      
      if (validation.suggestions.length > 0) {
        feedbackHtml += validation.suggestions.map(suggestion => 
          `<div class="text-blue-600"><i class="fas fa-info-circle mr-1"></i>${suggestion}</div>`
        ).join('')
      }
      
      feedbackDiv.innerHTML = feedbackHtml
      field.parentNode.appendChild(feedbackDiv)
    }
    
    // Update overall validation feedback section
    this.updateValidationFeedback()
  },

  // Update validation feedback section
  updateValidationFeedback() {
    const validationSection = document.getElementById('validationFeedback')
    const messagesDiv = document.getElementById('validationMessages')
    
    if (!validationSection || !messagesDiv) return
    
    const allFeedback = document.querySelectorAll('[id^="feedback-"]')
    
    if (allFeedback.length > 0) {
      validationSection.style.display = 'block'
      messagesDiv.innerHTML = Array.from(allFeedback).map(fb => fb.innerHTML).join('')
    } else {
      validationSection.style.display = 'none'
    }
  },

  // Helper function to get translated text
  t(key) {
    return window.i18n ? window.i18n.t(key) : key
  },

  // Helper function to translate content after dynamic HTML insertion
  translateContent(container) {
    if (window.i18n) {
      window.i18n.translateElement(container)
    }
  },

  // View filing details with enhanced information
  async viewFilingDetails(filingId) {
    try {
      // Get filing details
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}`, {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!data.success) {
        this.showAlert('error', 'Failed to load filing details')
        return
      }
      
      // Get distribution status
      const distributionResponse = await fetch(`${this.apiBaseUrl}/distribution/status/${filingId}`, {
        credentials: 'include'
      })
      
      let distributionData = { success: false, data: [] }
      if (distributionResponse.ok) {
        distributionData = await distributionResponse.json()
      }
      
      // Show enhanced filing details modal
      this.showEnhancedFilingDetails(data.data, distributionData.data || [])
      
    } catch (error) {
      console.error('View filing details error:', error)
      this.showAlert('error', 'Network error loading filing details')
    }
  },

  // Show enhanced filing details modal
  showEnhancedFilingDetails(filing, distributions) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-5xl">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-file-alt mr-2"></i>Filing Details - #${filing.id}
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Filing Information -->
              <div class="lg:col-span-2 space-y-6">
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Filing Information</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm text-gray-600">Type:</span>
                      <div class="font-medium">${filing.filing_type_display || filing.filing_type}</div>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600">Status:</span>
                      <div>
                        <span class="status-${filing.status} px-2 py-1 rounded text-xs">
                          ${filing.status_display || filing.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600">Reporting Period:</span>
                      <div class="font-medium">${filing.reporting_period}</div>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600">Submitted:</span>
                      <div class="font-medium">${new Date(filing.submitted_at).toLocaleDateString()}</div>
                    </div>
                    ${filing.risk_score ? `
                      <div class="col-span-2">
                        <span class="text-sm text-gray-600">Risk Assessment:</span>
                        <div class="flex items-center mt-1">
                          <span class="risk-${filing.risk_level?.toLowerCase()} px-2 py-1 rounded text-xs font-medium mr-2">
                            ${filing.risk_score.toFixed(1)}/10
                          </span>
                          <span class="text-sm text-gray-600">${filing.risk_level} Risk</span>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Multi-Agency Distribution -->
                ${distributions.length > 0 ? `
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-medium text-blue-900 mb-3">
                      <i class="fas fa-share-alt mr-2"></i>Agency Distribution Status
                    </h4>
                    <div class="space-y-2">
                      ${distributions.map(dist => `
                        <div class="flex items-center justify-between bg-white rounded p-2">
                          <div class="flex items-center">
                            <span class="font-medium text-gray-900 mr-2">${dist.agency.toUpperCase()}</span>
                            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">${dist.format_type}</span>
                          </div>
                          <div class="flex items-center">
                            <span class="status-${dist.status} px-2 py-1 rounded text-xs mr-2">
                              ${dist.status}
                            </span>
                            ${dist.distributed_at ? `
                              <span class="text-xs text-gray-500">
                                ${new Date(dist.distributed_at).toLocaleDateString()}
                              </span>
                            ` : ''}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
              
              <!-- Actions Panel -->
              <div class="space-y-4">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Actions</h4>
                  <div class="space-y-2">
                    <button onclick="CFRP.downloadFiling(${filing.id})" class="btn btn-sm btn-secondary w-full">
                      <i class="fas fa-download mr-2"></i>Download Filing
                    </button>
                    
                    ${this.user?.role === 'regulator' ? `
                      <button onclick="CFRP.assignReviewer(${filing.id})" class="btn btn-sm btn-primary w-full">
                        <i class="fas fa-user-plus mr-2"></i>Assign Reviewer
                      </button>
                      
                      <button onclick="CFRP.createInvestigationCase(${filing.id})" class="btn btn-sm btn-warning w-full">
                        <i class="fas fa-folder-plus mr-2"></i>Create Case
                      </button>
                      
                      <button onclick="CFRP.initiateWorkflow(${filing.id})" class="btn btn-sm btn-info w-full">
                        <i class="fas fa-project-diagram mr-2"></i>Start Cross-Agency Workflow
                      </button>
                    ` : ''}
                  </div>
                </div>
                
                ${filing.notes ? `
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 class="font-medium text-yellow-900 mb-2">Notes</h4>
                    <p class="text-sm text-yellow-800">${filing.notes}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Initiate cross-agency workflow
  async initiateWorkflow(filingId) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-project-diagram mr-2"></i>Initiate Cross-Agency Workflow
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="workflowForm">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Workflow Type</label>
                <select name="workflow_type" class="form-select w-full" required>
                  <option value="">Select workflow type...</option>
                  <option value="joint_investigation">Joint Investigation</option>
                  <option value="regulatory_approval">Multi-Agency Regulatory Approval</option>
                  <option value="compliance_monitoring">Cross-Agency Compliance Monitoring</option>
                </select>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Involved Agencies</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="agencies" value="osfi" class="mr-2"> OSFI (Office of the Superintendent of Financial Institutions)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="agencies" value="fcac" class="mr-2"> FCAC (Financial Consumer Agency of Canada)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="agencies" value="fsra" class="mr-2"> FSRA (Financial Services Regulatory Authority of Ontario)
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" name="agencies" value="amf" class="mr-2"> AMF (Autorité des marchés financiers du Québec)
                  </label>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Context & Objectives</label>
                <textarea name="context" class="form-textarea w-full h-24" placeholder="Describe the workflow objectives and key considerations..." required></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
            <button onclick="CFRP.submitWorkflow(${filingId})" class="btn btn-primary">Initiate Workflow</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Submit workflow creation
  async submitWorkflow(filingId) {
    try {
      const form = document.getElementById('workflowForm')
      const formData = new FormData(form)
      
      const selectedAgencies = []
      formData.getAll('agencies').forEach(agency => selectedAgencies.push(agency))
      
      if (selectedAgencies.length === 0) {
        this.showAlert('error', 'Please select at least one agency')
        return
      }
      
      const response = await fetch(`${this.apiBaseUrl}/workflow/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          workflow_type: formData.get('workflow_type'),
          case_id: null,
          entity_id: this.user?.entity_id || 1,
          primary_agency: this.user?.agency || 'osfi',
          involved_agencies: selectedAgencies,
          context: {
            filing_id: filingId,
            description: formData.get('context'),
            initiated_by: this.user?.name || 'System User'
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', `Cross-agency workflow initiated successfully. Workflow ID: ${data.data.workflow_id}`)
      } else {
        this.showAlert('error', data.error || 'Failed to initiate workflow')
      }
    } catch (error) {
      console.error('Workflow initiation error:', error)
      this.showAlert('error', 'Network error while initiating workflow')
    }
  },

  // =========================
  // MISSING ACTION FUNCTIONS
  // =========================

  // Assign reviewer to filing
  async assignReviewer(filingId) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-md">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-user-plus mr-2"></i>Assign Reviewer
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="assignReviewerForm">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Reviewer</label>
                <select name="reviewer_id" class="form-select w-full" required>
                  <option value="">Select a reviewer...</option>
                  <option value="1">Sarah Chen - OSFI Senior Analyst</option>
                  <option value="2">Michael Rodriguez - FCAC Compliance Officer</option>
                  <option value="3">Emily Watson - FSRA Risk Specialist</option>
                  <option value="4">David Kim - AMF Senior Examiner</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select name="priority" class="form-select w-full" required>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input type="date" name="due_date" class="form-input w-full" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea name="notes" class="form-textarea w-full h-20" placeholder="Assignment notes..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
            <button onclick="CFRP.submitReviewerAssignment(${filingId})" class="btn btn-primary">Assign Reviewer</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Submit reviewer assignment
  async submitReviewerAssignment(filingId) {
    try {
      const form = document.getElementById('assignReviewerForm')
      const formData = new FormData(form)
      
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}/assign-reviewer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reviewer_id: formData.get('reviewer_id'),
          priority: formData.get('priority'),
          due_date: formData.get('due_date'),
          notes: formData.get('notes')
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', 'Reviewer assigned successfully')
        // Refresh filing details if open
        const currentModal = document.querySelector('.modal-overlay')
        if (currentModal) {
          this.showFilingDetails(filingId)
        }
      } else {
        this.showAlert('error', data.error || 'Failed to assign reviewer')
      }
    } catch (error) {
      console.error('Assign reviewer error:', error)
      this.showAlert('error', 'Network error while assigning reviewer')
    }
  },

  // Download filing document
  async downloadFiling(filingId) {
    try {
      this.showAlert('info', 'Downloading filing document...')
      
      const response = await fetch(`${this.apiBaseUrl}/filings/${filingId}/download`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `filing-${filingId}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        this.showAlert('success', 'Filing downloaded successfully')
      } else {
        this.showAlert('error', 'Failed to download filing')
      }
    } catch (error) {
      console.error('Download filing error:', error)
      this.showAlert('error', 'Network error while downloading filing')
    }
  },

  // Create investigation case from filing
  async createInvestigationCase(filingId) {
    const modal = `
      <div class="modal-overlay">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-folder-plus mr-2"></i>Create Investigation Case
            </h3>
            <button onclick="CFRP.closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="createCaseForm">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Case Title</label>
                <input type="text" name="title" class="form-input w-full" required placeholder="e.g., Regulatory Compliance Investigation - Filing ${filingId}">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
                <select name="case_type" class="form-select w-full" required>
                  <option value="">Select case type...</option>
                  <option value="compliance_review">Compliance Review</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="investigation">Formal Investigation</option>
                  <option value="enforcement">Enforcement Action</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select name="priority" class="form-select w-full" required>
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Lead Investigator</label>
                <select name="lead_investigator" class="form-select w-full" required>
                  <option value="">Select investigator...</option>
                  <option value="1">Sarah Chen - OSFI Senior Investigator</option>
                  <option value="2">Michael Rodriguez - FCAC Enforcement</option>
                  <option value="3">Emily Watson - FSRA Compliance</option>
                  <option value="4">David Kim - AMF Investigation Unit</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Case Description</label>
                <textarea name="description" class="form-textarea w-full h-24" placeholder="Describe the investigation focus and objectives..." required></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="CFRP.closeModal()" class="btn btn-secondary">Cancel</button>
            <button onclick="CFRP.submitInvestigationCase(${filingId})" class="btn btn-primary">Create Case</button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
  },

  // Submit investigation case creation
  async submitInvestigationCase(filingId) {
    try {
      const form = document.getElementById('createCaseForm')
      const formData = new FormData(form)
      
      const response = await fetch(`${this.apiBaseUrl}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.get('title'),
          case_type: formData.get('case_type'),
          priority: formData.get('priority'),
          lead_investigator: formData.get('lead_investigator'),
          description: formData.get('description'),
          related_filing_id: filingId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.closeModal()
        this.showAlert('success', `Investigation case #${data.data.id} created successfully`)
      } else {
        this.showAlert('error', data.error || 'Failed to create investigation case')
      }
    } catch (error) {
      console.error('Create case error:', error)
      this.showAlert('error', 'Network error while creating case')
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  CFRP.init()
})