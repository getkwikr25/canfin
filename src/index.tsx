import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { authMiddleware } from './lib/auth'
import { entityRoutes } from './api/entities'
import { filingRoutes } from './api/filings'
import { riskRoutes } from './api/risk'
import { caseRoutes } from './api/cases'
import { conductRoutes } from './api/conduct'
import { userRoutes } from './api/users'
import distributionAPI from './api/distribution'
import realtimeAnalysisAPI from './api/realtime-analysis'
import workflowCoordinationAPI from './api/workflow-coordination'
import complianceFlaggingAPI from './api/compliance-flagging'
import provincialRegulatorsAPI from './api/provincial-regulators'
import securitiesAPI from './api/securities'
import insuranceAPI from './api/insurance'
import pensionsAPI from './api/pensions'
import paymentsAPI from './api/payments'
import dashboardAPI from './api/dashboard'

// Type definitions for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all API routes
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    service: 'CFRP Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy'
  })
})

// Authentication routes (no auth middleware needed)
app.route('/api/auth', userRoutes)

// Dashboard routes (mixed public/protected)
app.route('/api/dashboard', dashboardAPI)

// Protected API routes
app.use('/api/dashboard/stats', authMiddleware)
app.use('/api/entities/*', authMiddleware)
app.use('/api/filings/*', authMiddleware)
app.use('/api/risk/*', authMiddleware)
app.use('/api/cases/*', authMiddleware)
app.use('/api/conduct/*', authMiddleware)
app.use('/api/distribution/*', authMiddleware)
app.use('/api/realtime/*', authMiddleware)
app.use('/api/workflow/*', authMiddleware)
app.use('/api/compliance/*', authMiddleware)
app.use('/api/provincial/*', authMiddleware)
app.use('/api/securities/*', authMiddleware)
app.use('/api/insurance/*', authMiddleware)
app.use('/api/pensions/*', authMiddleware)
app.use('/api/payments/*', authMiddleware)

app.route('/api/entities', entityRoutes)
app.route('/api/filings', filingRoutes)
app.route('/api/risk', riskRoutes)
app.route('/api/cases', caseRoutes)
app.route('/api/conduct', conductRoutes)
app.route('/api/distribution', distributionAPI)
app.route('/api/realtime', realtimeAnalysisAPI)
app.route('/api/workflow', workflowCoordinationAPI)
app.route('/api/compliance', complianceFlaggingAPI)
app.route('/api/provincial', provincialRegulatorsAPI)
app.route('/api/securities', securitiesAPI)
app.route('/api/insurance', insuranceAPI)
app.route('/api/pensions', pensionsAPI)
app.route('/api/payments', paymentsAPI)

// Favicon route to prevent 500 errors
app.get('/favicon.ico', (c) => {
  return c.text('', 204)
})

// Main dashboard route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title data-i18n-document-title="platform_name">CFRP - Canadian Financial Regulatory Platform</title>
        <meta name="description" content="Unified SupTech Platform for Canada's Financial Regulators">
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Icons -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <!-- Custom styles -->
        <link href="/static/styles.css" rel="stylesheet">
        
        <!-- Internationalization -->
        <script src="/static/i18n.js"></script>
        
        <!-- Configure Tailwind theme -->
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'cfrp-blue': '#0052CC',
                  'cfrp-green': '#00C881',
                  'cfrp-gold': '#FFD500',
                  'cfrp-gray': '#F9FAFB'
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-cfrp-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-cfrp-blue text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-university text-2xl mr-3"></i>
                        <div class="text-xl font-bold" data-i18n="platform_abbrev">CFRP</div>
                        <div class="hidden md:block ml-2 text-sm opacity-90" data-i18n="platform_name">
                            Canadian Financial Regulatory Platform
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-10 flex items-baseline space-x-4">
                            <a href="#dashboard" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-tachometer-alt mr-1"></i>
                                <span data-i18n="dashboard">Dashboard</span>
                            </a>
                            <a href="#filings" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-file-alt mr-1"></i>
                                <span data-i18n="filings">Filings</span>
                            </a>
                            <a href="#entities" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-building mr-1"></i>
                                <span data-i18n="entities">Entities</span>
                            </a>
                            <a href="#risk" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-exclamation-triangle mr-1"></i>
                                <span data-i18n="risk">Risk</span>
                            </a>
                            <a href="#conduct" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-shield-alt mr-1"></i>
                                <span data-i18n="conduct">Conduct</span>
                            </a>
                            <a href="#" onclick="CFRP.showSpecializedModulesMenu()" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium bg-blue-700">
                                <i class="fas fa-layer-group mr-1"></i>
                                <span data-i18n="specialized_modules">Modules</span>
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- Language Selector -->
                        <div class="relative">
                            <button id="languageToggle" class="text-blue-100 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                <i class="fas fa-globe mr-2"></i>
                                <span id="currentLanguage">EN</span>
                                <i class="fas fa-chevron-down ml-1"></i>
                            </button>
                            <div id="languageDropdown" class="hidden absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50">
                                <a href="#" onclick="CFRP.setLanguage('en')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-flag mr-2"></i>English
                                </a>
                                <a href="#" onclick="CFRP.setLanguage('fr')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-flag mr-2"></i>Français
                                </a>
                            </div>
                        </div>
                        <button id="loginBtn" class="bg-cfrp-green hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                            <i class="fas fa-sign-in-alt mr-1"></i>
                            <span data-i18n="login">Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div id="heroSection" class="bg-gradient-to-r from-cfrp-blue to-blue-800 text-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold mb-6">
                        <span data-i18n="platform_name">Canadian Financial<br>Regulatory Platform</span>
                    </h1>
                    <p class="text-xl md:text-2xl mb-8 opacity-90">
                        <span data-i18n="hero_subtitle">From Compliance Burden to Regulatory Intelligence</span>
                    </p>
                    <div class="flex flex-col md:flex-row gap-4 justify-center">
                        <button class="bg-cfrp-green hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium">
                            <i class="fas fa-rocket mr-2"></i>
                            <span data-i18n="get_started">Get Started</span>
                        </button>
                        <button class="border-2 border-white text-white hover:bg-white hover:text-cfrp-blue px-8 py-3 rounded-lg text-lg font-medium">
                            <i class="fas fa-book mr-2"></i>
                            <span data-i18n="documentation">Documentation</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dashboard Content (public and authenticated access) -->
        <div id="dashboardContent" class="py-16" style="display: block;">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <!-- Page Header with Dynamic Title -->
                <div id="pageHeader" class="mb-8 pb-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 id="pageTitle" class="text-3xl font-bold text-gray-900">
                                <i id="pageTitleIcon" class="fas fa-tachometer-alt mr-3 text-blue-600"></i>
                                <span id="pageTitleText" data-i18n="dashboard_overview">Dashboard Overview</span>
                            </h1>
                            <p id="pageSubtitle" class="mt-2 text-gray-600" data-i18n="dashboard_subtitle">
                                Comprehensive regulatory oversight and compliance management platform
                            </p>
                        </div>
                        <div id="pageActions" class="flex gap-3">
                            <!-- Dynamic page-specific actions will be inserted here -->
                        </div>
                    </div>
                </div>
                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-i18n="total_entities">Total Entities</p>
                                <p class="text-3xl font-bold text-cfrp-blue" id="totalEntities">-</p>
                            </div>
                            <div class="text-cfrp-blue">
                                <i class="fas fa-building text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-i18n="pending_filings">Pending Filings</p>
                                <p class="text-3xl font-bold text-cfrp-gold" id="pendingFilings">-</p>
                            </div>
                            <div class="text-cfrp-gold">
                                <i class="fas fa-file-alt text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-i18n="high_risk_alerts">High Risk Alerts</p>
                                <p class="text-3xl font-bold text-red-600" id="riskAlerts">-</p>
                            </div>
                            <div class="text-red-600">
                                <i class="fas fa-exclamation-triangle text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-i18n="open_cases">Open Cases</p>
                                <p class="text-3xl font-bold text-cfrp-green" id="openCases">-</p>
                            </div>
                            <div class="text-cfrp-green">
                                <i class="fas fa-folder-open text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Dashboard Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Entities -->
                    <div id="entitiesContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600" data-i18n="loading_entities">Loading entities...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Filings -->
                    <div id="filingsContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600" data-i18n="loading_filings">Loading filings...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Risk Alerts -->
                    <div id="alertsContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600" data-i18n="loading_alerts">Loading alerts...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Case Statistics -->
                    <div id="statsContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600" data-i18n="loading_statistics">Loading statistics...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Demo Data Setup -->
                <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-blue-600 text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-blue-900 mb-2">🚀 How to Use CFRP Platform</h3>
                            <div class="text-blue-800 mb-4 space-y-2">
                                <p><strong>Step 1:</strong> <a href="#" onclick="CFRP.showLoginModal()" class="text-blue-600 hover:underline">Login</a> with demo credentials (e.g., compliance@rbc.ca / demo123)</p>
                                <p><strong>Step 2:</strong> Use navigation menu to explore: <strong>Dashboard</strong> • <strong>Filings</strong> • <strong>Entities</strong> • <strong>Risk</strong></p>
                                <p><strong>Step 3:</strong> As RBC user, click <strong>"New Filing"</strong> to submit regulatory data</p>
                                <p><strong>Step 4:</strong> As regulator (regulator@osfi.ca), review filings and create cases</p>
                            </div>
                            
                            <!-- Demo buttons only shown for authenticated admin/regulator users -->
                            <div id="demoButtonsSection" style="display: none;">
                                <h4 class="text-md font-medium text-blue-900 mb-2">Demo Environment Setup</h4>
                                <p class="text-blue-800 mb-4">
                                    Need sample data? Click the buttons below to populate the system with realistic Canadian financial data.
                                </p>
                                <div class="flex flex-wrap gap-3">
                                    <button onclick="CFRP.createSampleData('users')" class="btn btn-primary">
                                        <i class="fas fa-users"></i> Create Sample Users
                                    </button>
                                    <button onclick="CFRP.createSampleData('entities')" class="btn btn-primary">
                                        <i class="fas fa-building"></i> Create Sample Entities
                                    </button>
                                    <button onclick="CFRP.createSampleData('filings')" class="btn btn-primary">
                                        <i class="fas fa-file-alt"></i> Create Sample Filings
                                    </button>
                                    <button onclick="CFRP.createSampleData('cases')" class="btn btn-primary">
                                        <i class="fas fa-folder"></i> Create Sample Cases
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- How it Works Section -->
        <div class="py-20 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-gray-900 mb-6">How CFRP Works</h2>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto" data-i18n="how_cfrp_subtitle">
                        The Canadian Financial Regulatory Platform transforms how financial institutions interact with regulators, 
                        creating a unified ecosystem for compliance, oversight, and consumer protection.
                    </p>
                </div>

                <!-- What is CFRP -->
                <div class="bg-white rounded-xl shadow-lg p-8 mb-12">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 class="text-2xl font-bold text-cfrp-blue mb-4">
                                <i class="fas fa-university mr-3"></i>What is CFRP?
                            </h3>
                            <p class="text-gray-700 text-lg leading-relaxed mb-6" data-i18n="what_is_cfrp_description">
                                CFRP is Canada's first unified regulatory technology platform that connects all major financial regulators 
                                (OSFI, FCAC, FSRA, AMF) with financial institutions through a single, intelligent interface.
                            </p>
                            <div class="space-y-3">
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-green-600 mr-3"></i>
                                    <span class="text-gray-700" data-i18n="unified_ecosystem">One platform for all regulatory interactions</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-green-600 mr-3"></i>
                                    <span class="text-gray-700" data-i18n="step_2_description">AI-powered compliance monitoring</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-green-600 mr-3"></i>
                                    <span class="text-gray-700" data-i18n="step_3_description">Real-time risk assessment and alerts</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-center">
                            <div class="bg-gradient-to-br from-cfrp-blue to-blue-800 rounded-lg p-8 text-white">
                                <i class="fas fa-network-wired text-6xl mb-4 opacity-80"></i>
                                <h4 class="text-xl font-semibold mb-2" data-i18n="unified_ecosystem">Unified Ecosystem</h4>
                                <p class="opacity-90" data-i18n="connecting_regulators_text">Connecting regulators and institutions across Canada</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- How it Works Process -->
                <div class="mb-16">
                    <h3 class="text-3xl font-bold text-center text-gray-900 mb-12" data-i18n="cfrp_process">The CFRP Process</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Step 1 -->
                        <div class="text-center">
                            <div class="bg-cfrp-blue text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                1
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 h-full">
                                <i class="fas fa-upload text-cfrp-blue text-3xl mb-4"></i>
                                <h4 class="text-xl font-bold mb-3 text-gray-900">Centralized Filing</h4>
                                <p class="text-gray-600" data-i18n="centralized_filing_description">
                                    Financial institutions use CFRP's unified portal to submit regulatory data. 
                                    Single interface streamlines compliance workflows across multiple agencies.
                                </p>
                            </div>
                        </div>

                        <!-- Step 2 -->
                        <div class="text-center">
                            <div class="bg-cfrp-green text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                2
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 h-full">
                                <i class="fas fa-search-plus text-cfrp-green text-3xl mb-4"></i>
                                <h4 class="text-xl font-bold mb-3 text-gray-900">Risk Analysis</h4>
                                <p class="text-gray-600" data-i18n="risk_analysis_description">
                                    Advanced algorithms analyze submissions for risk patterns, misconduct indicators, 
                                    and compliance issues using behavioral analytics and pattern recognition.
                                </p>
                            </div>
                        </div>

                        <!-- Step 3 -->
                        <div class="text-center">
                            <div class="bg-cfrp-gold text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                3
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 h-full">
                                <i class="fas fa-chart-line text-cfrp-gold text-3xl mb-4"></i>
                                <h4 class="text-xl font-bold mb-3 text-gray-900">Regulatory Oversight</h4>
                                <p class="text-gray-600" data-i18n="regulatory_oversight_description">
                                    Regulators access comprehensive dashboards, risk alerts, and investigation tools 
                                    for enhanced supervision and proactive consumer protection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Key Goals -->
                <div class="bg-gradient-to-r from-cfrp-blue to-blue-800 rounded-xl text-white p-8 mb-12">
                    <h3 class="text-3xl font-bold text-center mb-8" data-i18n="our_goals">Our Goals</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="text-center">
                            <i class="fas fa-dollar-sign text-4xl mb-4 text-cfrp-gold"></i>
                            <h4 class="text-lg font-semibold mb-2" data-i18n="reduce_costs">Reduce Costs</h4>
                            <p class="text-sm opacity-90" data-i18n="reduce_costs_description">60% reduction in compliance processing costs</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-clock text-4xl mb-4 text-cfrp-green"></i>
                            <h4 class="text-lg font-semibold mb-2" data-i18n="save_time">Save Time</h4>
                            <p class="text-sm opacity-90" data-i18n="save_time_description">Eliminate duplicate filings and manual processes</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-users text-4xl mb-4 text-blue-300"></i>
                            <h4 class="text-lg font-semibold mb-2" data-i18n="protect_consumers">Protect Consumers</h4>
                            <p class="text-sm opacity-90" data-i18n="protect_consumers_description">Enhanced oversight and faster issue detection</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-chart-line text-4xl mb-4 text-yellow-300"></i>
                            <h4 class="text-lg font-semibold mb-2" data-i18n="improve_markets">Improve Markets</h4>
                            <p class="text-sm opacity-90" data-i18n="improve_markets_description">Better data leads to stronger financial stability</p>
                        </div>
                    </div>
                </div>

                <!-- Who Uses CFRP -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Financial Institutions -->
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <h3 class="text-2xl font-bold text-cfrp-blue mb-6">
                            <i class="fas fa-building mr-3"></i>For Financial Institutions
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-green mr-3 mt-1"></i>
                                <div>
                                    <strong>Banks & Credit Unions:</strong> Submit regulatory reports once for all agencies
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-green mr-3 mt-1"></i>
                                <div>
                                    <strong>Insurance Companies:</strong> Streamlined compliance across provinces
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-green mr-3 mt-1"></i>
                                <div>
                                    <strong>Investment Firms:</strong> Real-time risk monitoring and alerts
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-green mr-3 mt-1"></i>
                                <div>
                                    <strong>Fintech Companies:</strong> Simplified regulatory navigation
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Regulators -->
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <h3 class="text-2xl font-bold text-cfrp-blue mb-6">
                            <i class="fas fa-university mr-3"></i>For Regulators
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-blue mr-3 mt-1"></i>
                                <div>
                                    <strong>OSFI:</strong> Enhanced prudential supervision with AI insights
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-blue mr-3 mt-1"></i>
                                <div>
                                    <strong>FCAC:</strong> Improved consumer protection monitoring
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-blue mr-3 mt-1"></i>
                                <div>
                                    <strong>Provincial Regulators:</strong> Unified data sharing and collaboration
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-cfrp-blue mr-3 mt-1"></i>
                                <div>
                                    <strong>All Agencies:</strong> Real-time compliance intelligence
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Grid (shown when not logged in) -->
        <div id="featuresContent" class="py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
                    <p class="text-xl text-gray-600">
                        Comprehensive tools for modern financial regulation
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Single Reporting Portal -->
                    <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div class="text-cfrp-blue text-3xl mb-4">
                            <i class="fas fa-file-upload"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Single Reporting Portal</h3>
                        <p class="text-gray-600">
                            One submission satisfies all agencies. No more duplicate filings across OSFI, FCAC, and provincial regulators.
                        </p>
                    </div>
                    
                    <!-- Proactive Risk Monitoring -->
                    <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div class="text-cfrp-blue text-3xl mb-4">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Proactive Risk Monitoring</h3>
                        <p class="text-gray-600">
                            AI-powered anomaly detection identifies potential compliance issues before they become problems.
                        </p>
                    </div>
                    
                    <!-- Data Transparency -->
                    <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div class="text-cfrp-blue text-3xl mb-4">
                            <i class="fas fa-share-alt"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Data Transparency</h3>
                        <p class="text-gray-600">
                            Shared data fabric across jurisdictions provides complete regulatory visibility.
                        </p>
                    </div>
                    
                    <!-- Cost Efficiency -->
                    <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div class="text-cfrp-green text-3xl mb-4">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Cost Efficiency</h3>
                        <p class="text-gray-600">
                            60% reduction in compliance costs through automated processes and unified workflows.
                        </p>
                    </div>
                    
                    <!-- Consumer Protection -->
                    <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div class="text-cfrp-green text-3xl mb-4">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Consumer Protection</h3>
                        <p class="text-gray-600">
                            Faster investigations and stronger oversight protect Canadian financial consumers.
                        </p>
                    </div>
                    
                    <!-- Real-time Compliance -->
                    <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div class="text-cfrp-gold text-3xl mb-4">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Real-time Compliance</h3>
                        <p class="text-gray-600">
                            Continuous monitoring ensures ongoing compliance with Canadian financial regulations.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Section -->
        <div class="bg-cfrp-blue text-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div class="text-4xl font-bold mb-2">5+</div>
                        <div class="text-lg opacity-90">Regulatory Agencies</div>
                        <div class="text-sm opacity-75">OSFI, FCAC, FSRA, AMF+</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">60%</div>
                        <div class="text-lg opacity-90">Cost Reduction</div>
                        <div class="text-sm opacity-75">In compliance processing</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">24/7</div>
                        <div class="text-lg opacity-90">Monitoring</div>
                        <div class="text-sm opacity-75">Continuous compliance</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">AI</div>
                        <div class="text-lg opacity-90">Risk Analysis</div>
                        <div class="text-sm opacity-75">Predictive intelligence</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="mb-4 md:mb-0">
                        <div class="text-lg font-bold">CFRP Platform</div>
                        <div class="text-sm opacity-75">Canadian Financial Regulatory Platform</div>
                    </div>
                    <div class="flex space-x-6">
                        <a href="#" class="hover:text-cfrp-green">
                            <i class="fas fa-file-alt mr-1"></i>Documentation
                        </a>
                        <a href="#" class="hover:text-cfrp-green">
                            <i class="fas fa-code mr-1"></i>API
                        </a>
                        <a href="#" class="hover:text-cfrp-green">
                            <i class="fas fa-life-ring mr-1"></i>Support
                        </a>
                    </div>
                </div>
                <div class="mt-6 pt-6 border-t border-gray-700 text-center text-sm opacity-75">
                    © 2024 Canadian Financial Regulatory Platform. Built with Cloudflare Pages & Hono.
                </div>
            </div>
        </footer>

        <!-- JavaScript Libraries -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          // Ensure CFRP object exists for inline handlers
          window.CFRP = window.CFRP || {};
        </script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app