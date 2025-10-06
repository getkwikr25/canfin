import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { authMiddleware } from './lib/auth'
import { entityRoutes } from './api/entities'
import { filingRoutes } from './api/filings'
import { riskRoutes } from './api/risk'
import { caseRoutes } from './api/cases'
import { userRoutes } from './api/users'

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

// Protected API routes
app.use('/api/*', authMiddleware)
app.route('/api/entities', entityRoutes)
app.route('/api/filings', filingRoutes)
app.route('/api/risk', riskRoutes)
app.route('/api/cases', caseRoutes)

// Main dashboard route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CFRP - Canadian Financial Regulatory Platform</title>
        <meta name="description" content="Unified SupTech Platform for Canada's Financial Regulators">
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Icons -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <!-- Custom styles -->
        <link href="/static/styles.css" rel="stylesheet">
        
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
                        <div class="text-xl font-bold">CFRP</div>
                        <div class="hidden md:block ml-2 text-sm opacity-90">
                            Canadian Financial Regulatory Platform
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-10 flex items-baseline space-x-4">
                            <a href="#" class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
                            </a>
                            <a href="#" class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-file-alt mr-1"></i>Filings
                            </a>
                            <a href="#" class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-building mr-1"></i>Entities
                            </a>
                            <a href="#" class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-exclamation-triangle mr-1"></i>Risk
                            </a>
                        </div>
                    </div>
                    <div>
                        <button id="loginBtn" class="bg-cfrp-green hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                            <i class="fas fa-sign-in-alt mr-1"></i>Login
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="bg-gradient-to-r from-cfrp-blue to-blue-800 text-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold mb-6">
                        Canadian Financial<br>Regulatory Platform
                    </h1>
                    <p class="text-xl md:text-2xl mb-8 opacity-90">
                        From Compliance Burden to Regulatory Intelligence
                    </p>
                    <div class="flex flex-col md:flex-row gap-4 justify-center">
                        <button class="bg-cfrp-green hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium">
                            <i class="fas fa-rocket mr-2"></i>Get Started
                        </button>
                        <button class="border-2 border-white text-white hover:bg-white hover:text-cfrp-blue px-8 py-3 rounded-lg text-lg font-medium">
                            <i class="fas fa-book mr-2"></i>Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dashboard Content (shown when logged in) -->
        <div id="dashboardContent" class="py-16" style="display: none;">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Total Entities</p>
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
                                <p class="text-sm font-medium text-gray-600">Pending Filings</p>
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
                                <p class="text-sm font-medium text-gray-600">High Risk Alerts</p>
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
                                <p class="text-sm font-medium text-gray-600">Open Cases</p>
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
                                <p class="text-gray-600">Loading entities...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Filings -->
                    <div id="filingsContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600">Loading filings...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Risk Alerts -->
                    <div id="alertsContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600">Loading alerts...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Case Statistics -->
                    <div id="statsContainer">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 text-center">
                                <div class="spinner mx-auto mb-4"></div>
                                <p class="text-gray-600">Loading statistics...</p>
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
                            <h3 class="text-lg font-semibold text-blue-900 mb-2">Demo Environment Setup</h3>
                            <p class="text-blue-800 mb-4">
                                This is a demonstration of the CFRP platform. Click the buttons below to populate the system with sample data.
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

        <!-- Features Grid (shown when not logged in) -->
        <div id="featuresContent" class="py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Unified Regulatory Intelligence</h2>
                    <p class="text-xl text-gray-600">
                        Single platform for all Canadian financial regulatory interactions
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
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app