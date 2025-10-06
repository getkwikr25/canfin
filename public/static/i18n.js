// Internationalization (i18n) System for CFRP Platform
// Supports English and French as required by Canadian federal law and Quebec regulations

class CFRPI18n {
  constructor() {
    this.currentLanguage = this.detectLanguage()
    this.translations = {
      en: {
        // Navigation & Core
        platform_name: 'Canadian Financial Regulatory Platform',
        platform_abbrev: 'CFRP',
        hero_subtitle: 'From Compliance Burden to Regulatory Intelligence',
        get_started: 'Get Started',
        documentation: 'Documentation',
        dashboard: 'Dashboard',
        entities: 'Entities', 
        filings: 'Filings',
        risk: 'Risk',
        cases: 'Cases',
        conduct: 'Conduct',
        login: 'Login',
        logout: 'Logout',
        
        // Dashboard
        dashboard_overview: 'Dashboard Overview',
        dashboard_subtitle: 'Comprehensive regulatory oversight and compliance management platform',
        total_entities: 'Total Entities',
        pending_filings: 'Pending Filings',
        high_risk_alerts: 'High Risk Alerts',
        open_cases: 'Open Cases',
        recent_filings: 'Recent Filings',
        
        // Entities
        entity_management: 'Entity Management',
        registered_entities: 'Registered Entities',
        entity_name: 'Entity Name',
        entity_type: 'Entity Type',
        jurisdiction: 'Jurisdiction',
        primary_regulator: 'Primary Regulator',
        status: 'Status',
        actions: 'Actions',
        add_entity: 'Add Entity',
        edit_entity: 'Edit Entity',
        view_details: 'View Details',
        
        // Filings
        regulatory_filings: 'Regulatory Filings',
        filing_type: 'Filing Type',
        reporting_period: 'Reporting Period',
        submitted: 'Submitted',
        risk_score: 'Risk Score',
        new_filing: 'New Filing',
        submit_filing: 'Submit Filing',
        quarterly_return: 'Quarterly Return',
        annual_report: 'Annual Report',
        risk_report: 'Risk Assessment Report',
        
        // Risk Management
        risk_management: 'Risk Management',
        risk_assessment: 'Risk Assessment',
        compliance_status: 'Compliance Status',
        tier1_capital: 'Tier 1 Capital Ratio',
        leverage_ratio: 'Leverage Ratio',
        liquidity_coverage: 'Liquidity Coverage Ratio',
        
        // Compliance & Conduct
        compliance_monitoring: 'Compliance Monitoring',
        misconduct_detection: 'Misconduct Detection',
        consumer_protection: 'Consumer Protection',
        regulatory_breaches: 'Regulatory Breaches',
        
        // Agencies
        agencies: {
          osfi: 'Office of the Superintendent of Financial Institutions',
          fcac: 'Financial Consumer Agency of Canada',
          fsra: 'Financial Services Regulatory Authority of Ontario',
          amf: 'Autorité des marchés financiers du Québec',
          bcfsa: 'BC Financial Services Authority',
          asic: 'Alberta Securities Investment Commission'
        },
        
        // Entity Types
        entity_types: {
          chartered_bank: 'Chartered Bank',
          credit_union: 'Credit Union',
          life_insurance: 'Life Insurance Company',
          pc_insurance: 'Property & Casualty Insurance Company',
          trust_company: 'Trust Company',
          loan_company: 'Loan Company',
          investment_dealer: 'Investment Dealer',
          mutual_fund_dealer: 'Mutual Fund Dealer'
        },
        
        // Actions & Buttons  
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        submit: 'Submit',
        create: 'Create',
        update: 'Update',
        delete: 'Delete',
        view: 'View',
        edit: 'Edit',
        download: 'Download',
        export: 'Export',
        
        // Status Labels
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        under_review: 'Under Review',
        compliant: 'Compliant',
        non_compliant: 'Non-Compliant',
        
        // Messages
        loading: 'Loading...',
        no_data: 'No data available',
        error_occurred: 'An error occurred',
        success_save: 'Saved successfully',
        confirm_delete: 'Are you sure you want to delete this item?',
        
        // Provinces
        provinces: {
          on: 'Ontario',
          qc: 'Quebec',
          bc: 'British Columbia', 
          ab: 'Alberta',
          sk: 'Saskatchewan',
          mb: 'Manitoba',
          ns: 'Nova Scotia',
          nb: 'New Brunswick',
          pe: 'Prince Edward Island',
          nl: 'Newfoundland and Labrador',
          nt: 'Northwest Territories',
          nu: 'Nunavut',
          yt: 'Yukon'
        }
      },
      
      fr: {
        // Navigation & Core / Navigation et Base
        platform_name: 'Plateforme canadienne de réglementation financière',
        platform_abbrev: 'PCRF',
        hero_subtitle: 'Du fardeau de conformité à l\'intelligence réglementaire',
        get_started: 'Commencer',
        documentation: 'Documentation',
        dashboard: 'Tableau de bord',
        entities: 'Entités',
        filings: 'Dépôts',
        risk: 'Risque',
        cases: 'Cas',
        conduct: 'Conduite',
        login: 'Connexion',
        logout: 'Déconnexion',
        
        // Dashboard / Tableau de bord
        dashboard_overview: 'Aperçu du tableau de bord',
        dashboard_subtitle: 'Plateforme complète de supervision réglementaire et de gestion de la conformité',
        total_entities: 'Entités totales',
        pending_filings: 'Dépôts en attente',
        high_risk_alerts: 'Alertes à haut risque',
        open_cases: 'Cas ouverts',
        recent_filings: 'Dépôts récents',
        
        // Entities / Entités
        entity_management: 'Gestion des entités',
        registered_entities: 'Entités enregistrées',
        entity_name: 'Nom de l\'entité',
        entity_type: 'Type d\'entité',
        jurisdiction: 'Juridiction',
        primary_regulator: 'Régulateur principal',
        status: 'Statut',
        actions: 'Actions',
        add_entity: 'Ajouter une entité',
        edit_entity: 'Modifier l\'entité',
        view_details: 'Voir les détails',
        
        // Filings / Dépôts
        regulatory_filings: 'Dépôts réglementaires',
        filing_type: 'Type de dépôt',
        reporting_period: 'Période de déclaration',
        submitted: 'Soumis',
        risk_score: 'Score de risque',
        new_filing: 'Nouveau dépôt',
        submit_filing: 'Soumettre le dépôt',
        quarterly_return: 'Rendement trimestriel',
        annual_report: 'Rapport annuel',
        risk_report: 'Rapport d\'évaluation des risques',
        
        // Risk Management / Gestion des risques
        risk_management: 'Gestion des risques',
        risk_assessment: 'Évaluation des risques',
        compliance_status: 'Statut de conformité',
        tier1_capital: 'Ratio de capital de catégorie 1',
        leverage_ratio: 'Ratio de levier',
        liquidity_coverage: 'Ratio de couverture de liquidité',
        
        // Compliance & Conduct / Conformité et conduite
        compliance_monitoring: 'Surveillance de la conformité',
        misconduct_detection: 'Détection d\'inconduite',
        consumer_protection: 'Protection des consommateurs',
        regulatory_breaches: 'Violations réglementaires',
        
        // Agencies / Organismes
        agencies: {
          osfi: 'Bureau du surintendant des institutions financières',
          fcac: 'Agence de la consommation en matière financière du Canada',
          fsra: 'Autorité de réglementation des services financiers de l\'Ontario',
          amf: 'Autorité des marchés financiers du Québec',
          bcfsa: 'Autorité des services financiers de la Colombie-Britannique',
          asic: 'Commission des valeurs mobilières de l\'Alberta'
        },
        
        // Entity Types / Types d'entités
        entity_types: {
          chartered_bank: 'Banque à charte',
          credit_union: 'Caisse de crédit',
          life_insurance: 'Compagnie d\'assurance-vie',
          pc_insurance: 'Compagnie d\'assurance IARD',
          trust_company: 'Société de fiducie',
          loan_company: 'Société de prêt',
          investment_dealer: 'Courtier en placement',
          mutual_fund_dealer: 'Courtier en fonds mutuels'
        },
        
        // Actions & Buttons / Actions et boutons
        save: 'Enregistrer',
        cancel: 'Annuler',
        close: 'Fermer',
        submit: 'Soumettre',
        create: 'Créer',
        update: 'Mettre à jour',
        delete: 'Supprimer',
        view: 'Voir',
        edit: 'Modifier',
        download: 'Télécharger',
        export: 'Exporter',
        
        // Status Labels / Étiquettes de statut
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté',
        under_review: 'En révision',
        compliant: 'Conforme',
        non_compliant: 'Non conforme',
        
        // Messages
        loading: 'Chargement...',
        no_data: 'Aucune donnée disponible',
        error_occurred: 'Une erreur s\'est produite',
        success_save: 'Enregistré avec succès',
        confirm_delete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
        
        // Provinces
        provinces: {
          on: 'Ontario',
          qc: 'Québec',
          bc: 'Colombie-Britannique',
          ab: 'Alberta',
          sk: 'Saskatchewan',
          mb: 'Manitoba',
          ns: 'Nouvelle-Écosse',
          nb: 'Nouveau-Brunswick',
          pe: 'Île-du-Prince-Édouard',
          nl: 'Terre-Neuve-et-Labrador',
          nt: 'Territoires du Nord-Ouest',
          nu: 'Nunavut',
          yt: 'Yukon'
        }
      }
    }
  }
  
  // Detect user's preferred language
  detectLanguage() {
    // 1. Check localStorage for saved preference
    const saved = localStorage.getItem('cfrp_language')
    if (saved && ['en', 'fr'].includes(saved)) {
      return saved
    }
    
    // 2. Check browser language
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang.startsWith('fr')) {
      return 'fr'
    }
    
    // 3. Default to English
    return 'en'
  }
  
  // Get translation for a key
  t(key, params = {}) {
    const keys = key.split('.')
    let value = this.translations[this.currentLanguage]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        break
      }
    }
    
    // Fallback to English if translation not found
    if (!value && this.currentLanguage !== 'en') {
      let englishValue = this.translations.en
      for (const k of keys) {
        if (englishValue && typeof englishValue === 'object') {
          englishValue = englishValue[k]
        } else {
          break
        }
      }
      value = englishValue
    }
    
    // Return key if no translation found
    if (!value) {
      return key
    }
    
    // Replace parameters in translation
    let result = value
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param])
    })
    
    return result
  }
  
  // Change language
  setLanguage(lang) {
    if (['en', 'fr'].includes(lang)) {
      this.currentLanguage = lang
      localStorage.setItem('cfrp_language', lang)
      this.updatePageLanguage()
      
      // Notify application of language change
      document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
      }))
    }
  }
  
  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage
  }
  
  // Update page elements with translations
  updatePageLanguage() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n')
      element.textContent = this.t(key)
    })
    
    // Update elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder')
      element.placeholder = this.t(key)
    })
    
    // Update elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title')
      element.title = this.t(key)
    })
    
    // Update document title
    const titleElement = document.querySelector('[data-i18n-document-title]')
    if (titleElement) {
      const key = titleElement.getAttribute('data-i18n-document-title')
      document.title = this.t(key)
    }
    
    // Update page direction for RTL languages (future use)
    document.documentElement.lang = this.currentLanguage
    
    // Update language selector if exists
    const languageSelector = document.getElementById('languageSelector')
    if (languageSelector) {
      languageSelector.value = this.currentLanguage
    }
  }
  
  // Initialize internationalization
  init() {
    this.updatePageLanguage()
    
    // Add language selector if not exists
    this.addLanguageSelector()
    
    // Listen for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.translateElement(node)
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
  
  // Translate a specific element and its children
  translateElement(element) {
    // Translate the element itself
    if (element.hasAttribute && element.hasAttribute('data-i18n')) {
      const key = element.getAttribute('data-i18n')
      element.textContent = this.t(key)
    }
    
    if (element.hasAttribute && element.hasAttribute('data-i18n-placeholder')) {
      const key = element.getAttribute('data-i18n-placeholder')
      element.placeholder = this.t(key)
    }
    
    if (element.hasAttribute && element.hasAttribute('data-i18n-title')) {
      const key = element.getAttribute('data-i18n-title')
      element.title = this.t(key)
    }
    
    // Translate child elements
    if (element.querySelectorAll) {
      element.querySelectorAll('[data-i18n]').forEach(child => {
        const key = child.getAttribute('data-i18n')
        child.textContent = this.t(key)
      })
      
      element.querySelectorAll('[data-i18n-placeholder]').forEach(child => {
        const key = child.getAttribute('data-i18n-placeholder')
        child.placeholder = this.t(key)
      })
      
      element.querySelectorAll('[data-i18n-title]').forEach(child => {
        const key = child.getAttribute('data-i18n-title')
        child.title = this.t(key)
      })
    }
  }
  
  // Add language selector to navigation
  addLanguageSelector() {
    const nav = document.querySelector('nav')
    if (!nav) return
    
    // Find the right section with login button
    const rightSection = nav.querySelector('.flex.items-center.space-x-4')
    if (!rightSection) return
    
    // Check if selector already exists
    if (document.getElementById('languageSelector')) return
    
    const languageContainer = document.createElement('div')
    languageContainer.className = 'flex items-center'
    languageContainer.innerHTML = `
      <label for="languageSelector" class="text-white text-sm mr-2">
        <i class="fas fa-globe mr-1"></i>
        ${this.currentLanguage === 'fr' ? 'Langue' : 'Language'}:
      </label>
      <select id="languageSelector" class="text-sm border border-blue-300 rounded px-2 py-1 bg-white text-gray-800">
        <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>English</option>
        <option value="fr" ${this.currentLanguage === 'fr' ? 'selected' : ''}>Français</option>
      </select>
    `
    
    rightSection.insertBefore(languageContainer, rightSection.firstChild)
    
    // Add event listener
    document.getElementById('languageSelector').addEventListener('change', (e) => {
      this.setLanguage(e.target.value)
    })
  }
  
  // Format numbers according to locale
  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === 'fr' ? 'fr-CA' : 'en-CA'
    return new Intl.NumberFormat(locale, options).format(number)
  }
  
  // Format currency according to locale
  formatCurrency(amount, currency = 'CAD') {
    const locale = this.currentLanguage === 'fr' ? 'fr-CA' : 'en-CA'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  // Format dates according to locale
  formatDate(date, options = {}) {
    const locale = this.currentLanguage === 'fr' ? 'fr-CA' : 'en-CA'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(new Date(date))
  }
}

// Create global i18n instance
window.i18n = new CFRPI18n()

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.i18n.init())
} else {
  window.i18n.init()
}