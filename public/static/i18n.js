// Comprehensive Internationalization (i18n) System for CFRP Platform
// Complete bilingual support for English and French as required by Canadian federal law

class CFRPI18n {
  constructor() {
    this.currentLanguage = this.detectLanguage()
    this.translations = {
      en: {
        // ==================
        // CORE NAVIGATION & BRANDING
        // ==================
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
        specialized_modules: 'Modules',
        login: 'Login',
        logout: 'Logout',
        
        // ==================
        // DASHBOARD CONTENT
        // ==================
        dashboard_overview: 'Dashboard Overview',
        dashboard_subtitle: 'Comprehensive regulatory oversight and compliance management platform',
        total_entities: 'Total Entities',
        pending_filings: 'Pending Filings',
        high_risk_alerts: 'High Risk Alerts',
        open_cases: 'Open Cases',
        recent_filings: 'Recent Filings',
        loading_entities: 'Loading entities...',
        loading_filings: 'Loading filings...',
        loading_alerts: 'Loading alerts...',
        loading_statistics: 'Loading statistics...',
        
        // Dynamic Dashboard Content
        regulatory_filing_activity: 'Regulatory Filing Activity',
        quarterly_returns: 'Quarterly Returns', 
        q3_2024_submission: 'Q3 2024 Submission Period',
        compliance_rate: 'Compliance Rate',
        annual_reports: 'Annual Reports',
        '2023_annual_filings': '2023 Annual Filings',
        submission_rate: 'Submission Rate',
        incident_reports: 'Incident Reports',
        past_30_days: 'Past 30 Days',
        reported: 'Reported',
        filing_calendar: 'Filing Calendar',
        next_filing_deadline: 'Next Filing Deadline: November 15, 2024 (Q3 Liquidity Coverage Reports)',
        
        // System Risk Overview
        system_risk_overview: 'System Risk Overview',
        system_stability: 'System Stability',
        stable: 'Stable',
        overall_financial_system_health: 'Overall financial system health',
        average_sector_ratio: 'Average sector ratio',
        market_volatility: 'Market Volatility',
        moderate: 'Moderate',
        current_market_conditions: 'Current market conditions',
        global_exposure: 'Global Exposure',
        managed: 'Managed',
        international_risk_exposure: 'International risk exposure',
        public_risk_disclosure: 'Public Risk Disclosure',
        detailed_risk_assessments_text: 'Detailed risk assessments and institution-specific data are available only to authorized regulatory personnel.',
        
        // Regulatory System Health
        regulatory_system_health: 'Regulatory System Health',
        filing_compliance_rate: 'Filing Compliance Rate',
        system_response_time: 'System Response Time',
        data_accuracy: 'Data Accuracy',
        regulatory_agencies: 'Regulatory Agencies',
        monitoring: 'Monitoring',
        last_updated: 'Last Updated',
        
        // Dashboard Cards
        canadian_financial_system_overview: 'Canadian Financial System Overview',
        federal_banks: 'Federal Banks',
        osfi_regulated: 'OSFI Regulated',
        credit_unions: 'Credit Unions',
        provincial_regulated: 'Provincial Regulated',
        insurance_companies: 'Insurance Companies',
        life_pc_regulated: 'Life & P&C Regulated',
        investment_dealers: 'Investment Dealers',
        securities_regulated: 'Securities Regulated',
        
        // ==================
        // HOW CFRP WORKS SECTION
        // ==================
        how_cfrp_works: 'How CFRP Works',
        how_cfrp_subtitle: 'The Canadian Financial Regulatory Platform transforms how financial institutions interact with regulators, creating a unified ecosystem for compliance, oversight, and consumer protection.',
        how_cfrp_works_description: 'The Canadian Financial Regulatory Platform transforms how financial institutions interact with regulators, creating a unified ecosystem for compliance, oversight, and consumer protection.',
        what_is_cfrp: 'What is CFRP?',
        what_is_cfrp_description: 'CFRP is Canada\'s first unified regulatory technology platform that connects all major financial regulators (OSFI, FCAC, FSRA, AMF) with financial institutions through a single, intelligent interface.',
        cfrp_description: 'CFRP is Canada\'s first unified regulatory technology platform that connects all major financial regulators (OSFI, FCAC, FSRA, AMF) with financial institutions through a single, intelligent interface.',
        one_platform_feature: 'One platform for all regulatory interactions',
        ai_compliance_monitoring: 'AI-powered compliance monitoring',
        realtime_risk_assessment: 'Real-time risk assessment and alerts',
        unified_ecosystem: 'Unified Ecosystem',
        unified_ecosystem_subtitle: 'Connecting regulators and institutions across Canada',
        connecting_regulators_text: 'Connecting regulators and institutions across Canada',
        
        // CFRP Process
        cfrp_process: 'The CFRP Process',
        step_1_title: 'Centralized Filing',
        step_1_description: 'Financial institutions use CFRP\'s unified portal to submit regulatory data. Single interface streamlines compliance workflows across multiple agencies.',
        centralized_filing_description: 'Financial institutions use CFRP\'s unified portal to submit regulatory data. Single interface streamlines compliance workflows across multiple agencies.',
        step_2_title: 'Risk Analysis',
        step_2_description: 'Advanced algorithms analyze submissions for risk patterns, misconduct indicators, and compliance issues using behavioral analytics and pattern recognition.',
        risk_analysis_description: 'Advanced algorithms analyze submissions for risk patterns, misconduct indicators, and compliance issues using behavioral analytics and pattern recognition.',
        step_3_title: 'Regulatory Oversight',
        step_3_description: 'Regulators access comprehensive dashboards, risk alerts, and investigation tools for enhanced supervision and proactive consumer protection.',
        regulatory_oversight_description: 'Regulators access comprehensive dashboards, risk alerts, and investigation tools for enhanced supervision and proactive consumer protection.',
        
        // Goals
        our_goals: 'Our Goals',
        reduce_costs: 'Reduce Costs',
        reduce_costs_subtitle: '60% reduction in compliance processing costs',
        reduce_costs_description: '60% reduction in compliance processing costs',
        save_time: 'Save Time',
        save_time_subtitle: 'Eliminate duplicate filings and manual processes',
        save_time_description: 'Eliminate duplicate filings and manual processes',
        protect_consumers: 'Protect Consumers',
        protect_consumers_subtitle: 'Enhanced oversight and faster issue detection',
        protect_consumers_description: 'Enhanced oversight and faster issue detection',
        improve_markets: 'Improve Markets',
        improve_markets_subtitle: 'Better data leads to stronger financial stability',
        improve_markets_description: 'Better data leads to stronger financial stability',
        
        // Who Uses CFRP
        for_financial_institutions: 'For Financial Institutions',
        banks_credit_unions: 'Banks & Credit Unions: Submit regulatory reports once for all agencies',
        insurance_companies_desc: 'Insurance Companies: Streamlined compliance across provinces',
        investment_firms: 'Investment Firms: Real-time risk monitoring and alerts',
        
        for_regulators: 'For Regulators',
        for_regulators_desc: 'Unified oversight tools, cross-agency coordination, advanced analytics, and consumer protection capabilities.',
        enhanced_supervision: 'Enhanced Supervision',
        enhanced_supervision_desc: 'Real-time monitoring, risk assessment, and coordinated regulatory response across all Canadian financial regulators.',
        
        // ==================
        // DEMO INSTRUCTIONS
        // ==================
        how_to_use_platform: 'How to Use CFRP Platform',
        step_1_login: 'Login with demo credentials (e.g., compliance@rbc.ca / demo123)',
        step_2_navigate: 'Use navigation menu to explore: Dashboard • Filings • Entities • Risk',
        step_3_filing: 'As RBC user, click "New Filing" to submit regulatory data',
        step_4_review: 'As regulator (regulator@osfi.ca), review filings and create cases',
        demo_environment_setup: 'Demo Environment Setup',
        demo_environment_desc: 'Need sample data? Click the buttons below to populate the system with realistic Canadian financial data.',
        create_sample_users: 'Create Sample Users',
        create_sample_entities: 'Create Sample Entities',
        create_sample_filings: 'Create Sample Filings',
        create_sample_cases: 'Create Sample Cases',
        
        // ==================
        // ENTITIES MANAGEMENT
        // ==================
        entity_management: 'Entity Management',
        registered_entities: 'Registered Entities',
        regulated_entities_management: 'Regulated Entities Management',
        regulated_entities_subtitle: 'Comprehensive view and management of all regulated financial institutions',
        entity_name: 'Entity Name',
        entity_type: 'Entity Type',
        jurisdiction: 'Jurisdiction',
        primary_regulator: 'Primary Regulator',
        status: 'Status',
        actions: 'Actions',
        add_entity: 'Add Entity',
        edit_entity: 'Edit Entity',
        view_details: 'View Details',
        export_all: 'Export All',
        advanced_filters: 'Advanced Filters',
        
        // ==================
        // FILINGS MANAGEMENT
        // ==================
        regulatory_filings: 'Regulatory Filings',
        filings_subtitle: 'Track and manage regulatory submissions and compliance reports',
        filing_type: 'Filing Type',
        reporting_period: 'Reporting Period',
        submitted: 'Submitted',
        risk_score: 'Risk Score',
        new_filing: 'New Filing',
        submit_filing: 'Submit Filing',
        filing_schedule: 'Filing Schedule',
        filing_analytics: 'Filing Analytics',
        quarterly_return: 'Quarterly Return',
        annual_report: 'Annual Report',
        capital_adequacy: 'Capital Adequacy Report',
        liquidity_report: 'Liquidity Report',
        risk_report: 'Risk Assessment Report',
        
        // Filing Form
        select_filing_type: 'Select Filing Type',
        financial_data_required: 'Financial Data Required',
        tier1_ratio: 'Tier 1 Capital Ratio',
        tier1_ratio_percent: 'Tier 1 Capital Ratio (%)',
        leverage_ratio: 'Leverage Ratio',
        leverage_ratio_percent: 'Leverage Ratio (%)',
        liquidity_coverage_ratio: 'Liquidity Coverage Ratio',
        total_assets: 'Total Assets',
        total_assets_cad_millions: 'Total Assets (CAD millions)',
        consumer_complaints: 'Consumer Complaints',
        consumer_complaints_period: 'Consumer Complaints (this period)',
        operational_losses: 'Operational Losses',
        operational_losses_cad: 'Operational Losses (CAD)',
        additional_notes: 'Additional Notes',
        optional_notes: 'Optional notes about this filing...',
        
        // ==================
        // RISK MANAGEMENT
        // ==================
        risk_management: 'Risk Management',
        risk_subtitle: 'Monitor and assess regulatory compliance risks across all entities',
        risk_assessment: 'Risk Assessment',
        compliance_status: 'Compliance Status',
        tier1_capital: 'Tier 1 Capital Ratio',
        leverage_ratio_full: 'Leverage Ratio',
        liquidity_coverage: 'Liquidity Coverage Ratio',
        risk_scan: 'Risk Scan',
        risk_analytics: 'Risk Analytics',
        risk_settings: 'Risk Settings',
        
        // ==================
        // CASES MANAGEMENT
        // ==================
        cases_management: 'Cases Management',
        investigation_cases: 'Investigation Cases',
        cases_subtitle: 'Manage regulatory investigations and enforcement actions',
        new_case: 'New Case',
        case_search: 'Case Search',
        case_analytics: 'Case Analytics',
        case_title: 'Case Title',
        case_type: 'Case Type',
        priority: 'Priority',
        lead_investigator: 'Lead Investigator',
        case_description: 'Case Description',
        compliance_review: 'Compliance Review',
        formal_investigation: 'Formal Investigation',
        enforcement_action: 'Enforcement Action',
        
        // ==================
        // CONDUCT ANALYSIS
        // ==================
        conduct_analysis: 'Conduct Analysis',
        conduct_subtitle: 'Advanced misconduct detection and regulatory compliance monitoring',
        misconduct_detection: 'Misconduct Detection',
        consumer_protection: 'Consumer Protection',
        regulatory_breaches: 'Regulatory Breaches',
        run_analysis: 'Run Analysis',
        compliance_check: 'Compliance Check',
        trend_analysis: 'Trend Analysis',
        
        // Specialized Detection Types
        synthetic_customers: 'Synthetic Customers',
        jurisdiction_violations: 'Jurisdiction Violations',
        fronting_arrangements: 'Fronting Arrangements',
        client_borrowing_violations: 'Client Borrowing Violations',
        
        // ==================
        // SPECIALIZED MODULES
        // ==================
        insurance_module: 'Insurance Regulation',
        pensions_module: 'Pensions Regulation',
        payments_module: 'Payments & Fintech',
        securities_module: 'Securities Regulation',
        
        // Insurance
        insurance_oversight: 'Insurance Regulatory Oversight',
        solvency_monitoring: 'Solvency Monitoring',
        mct_ratios: 'MCT Ratios',
        
        // Pensions
        pension_oversight: 'Pension Plan Oversight',
        funding_analysis: 'Funding Analysis',
        
        // Payments
        payment_oversight: 'Payment Service Provider Oversight',
        aml_compliance: 'AML Compliance',
        
        // Securities
        securities_oversight: 'Securities Market Oversight',
        market_surveillance: 'Market Surveillance',
        
        // ==================
        // COMMON UI ELEMENTS
        // ==================
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
        refresh: 'Refresh',
        search: 'Search',
        filter: 'Filter',
        clear: 'Clear',
        reset: 'Reset',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        
        // Status Labels
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        under_review: 'Under Review',
        completed: 'Completed',
        in_progress: 'In Progress',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        critical: 'Critical',
        
        // Time & Dates
        today: 'Today',
        yesterday: 'Yesterday',
        this_week: 'This Week',
        this_month: 'This Month',
        this_quarter: 'This Quarter',
        this_year: 'This Year',
        
        // Messages
        no_data_available: 'No data available',
        loading: 'Loading...',
        please_wait: 'Please wait...',
        operation_completed: 'Operation completed successfully',
        error_occurred: 'An error occurred',
        unauthorized: 'Unauthorized access',
        
        // ==================
        // REGULATORY AGENCIES
        // ==================
        agencies: {
          osfi: 'Office of the Superintendent of Financial Institutions',
          fcac: 'Financial Consumer Agency of Canada',
          fsra: 'Financial Services Regulatory Authority of Ontario',
          amf: 'Autorité des marchés financiers du Québec',
          bcfsa: 'BC Financial Services Authority',
          asic: 'Alberta Securities Investment Commission',
          ciro: 'Canadian Investment Regulatory Organization'
        },
        
        // ==================
        // ENTITY TYPES
        // ==================
        entity_types: {
          chartered_bank: 'Chartered Bank',
          credit_union: 'Credit Union',
          life_insurance: 'Life Insurance Company',
          pc_insurance: 'Property & Casualty Insurance Company',
          trust_company: 'Trust Company',
          loan_company: 'Loan Company',
          investment_dealer: 'Investment Dealer',
          mutual_fund_dealer: 'Mutual Fund Dealer',
          pension_plan: 'Pension Plan',
          payment_processor: 'Payment Processor'
        },
        
        // ==================
        // SPECIALIZED MODULES
        // ==================
        insurance_regulation: 'Insurance Regulation',
        pensions_regulation: 'Pensions Regulation', 
        payments_fintech: 'Payments & Fintech',
        provincial_regulators: 'Provincial Regulators',
        securities_regulation: 'Securities Regulation',
        integrated_dashboard: 'Integrated Dashboard',
        
        federal_provincial_coverage: 'Federal & Provincial Coverage',
        risk_assessment_mct: 'Risk Assessment & MCT',
        market_conduct_reports: 'Market Conduct Reports',
        solvency_monitoring: 'Solvency Monitoring',
        
        pension_plan_oversight: 'Pension Plan Oversight',
        funding_analysis: 'Funding Analysis',
        investment_performance: 'Investment Performance',
        actuarial_reports: 'Actuarial Reports',
        
        payment_service_providers: 'Payment Service Providers',
        aml_kyc_compliance: 'AML/KYC Compliance',
        crypto_exchanges: 'Crypto Exchanges',
        transaction_monitoring: 'Transaction Monitoring',
        
        multi_jurisdiction_filing: 'Multi-Jurisdiction Filing',
        cross_border_coordination: 'Cross-Border Coordination',
        french_language_support: 'French Language Support',
        provincial_compliance: 'Provincial Compliance',
        
        sedar_plus_integration: 'SEDAR+ Integration',
        market_surveillance: 'Market Surveillance',
        insider_trading_detection: 'Insider Trading Detection',
        investment_funds: 'Investment Funds',
        
        all_modules_combined: 'All Modules Combined',
        cross_module_analytics: 'Cross-Module Analytics',
        unified_reporting: 'Unified Reporting',
        regulatory_intelligence: 'Regulatory Intelligence',
        complete_coverage: 'Complete Coverage',
        
        active_modules: 'Active Modules',
        coverage_rate: 'Coverage Rate',
        monitoring: 'Monitoring',
        powered: 'Powered',
        
        run_comprehensive_risk_assessment: 'Run Comprehensive Risk Assessment',
        generate_cross_module_report: 'Generate Cross-Module Report',
        configure_module_alerts: 'Configure Module Alerts',
        
        module_documentation: 'Module Documentation & Help',
        getting_started: 'Getting Started',
        modules_getting_started_text: 'Click on any module above to access specialized regulatory tools. Each module provides comprehensive coverage for its regulatory domain.',
        modules_overview: 'Modules Overview',
        integration_guide: 'Integration Guide',
        troubleshooting: 'Troubleshooting',
        
        public_modules_description: 'CFRP provides specialized regulatory modules covering all aspects of Canada\'s financial regulatory framework. Login to access detailed module functionality.',
        who_uses_modules: 'Who Uses These Modules',
        financial_institutions: 'Financial Institutions',
        streamlined_compliance: 'Streamlined compliance across multiple regulatory jurisdictions',
        regulatory_agencies: 'Regulatory Agencies',
        enhanced_oversight: 'Enhanced oversight with unified data sharing and coordination',
        compliance_teams: 'Compliance Teams',
        comprehensive_tools: 'Comprehensive tools for regulatory monitoring and reporting',
        
        access_information: 'Access Information',
        authentication_required: 'Authentication Required',
        modules_login_required: 'Access to specialized regulatory modules requires authentication. Please login to access full functionality.',
        login_to_access_modules: 'Login to Access Modules',
        unified_view: 'Unified View'
      },
      
      fr: {
        // ==================
        // NAVIGATION ET MARQUE PRINCIPALE
        // ==================
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
        specialized_modules: 'Modules',
        login: 'Connexion',
        logout: 'Déconnexion',
        
        // ==================
        // CONTENU DU TABLEAU DE BORD
        // ==================
        dashboard_overview: 'Aperçu du tableau de bord',
        dashboard_subtitle: 'Plateforme complète de supervision réglementaire et de gestion de la conformité',
        total_entities: 'Entités totales',
        pending_filings: 'Dépôts en attente',
        high_risk_alerts: 'Alertes à haut risque',
        open_cases: 'Cas ouverts',
        recent_filings: 'Dépôts récents',
        loading_entities: 'Chargement des entités...',
        loading_filings: 'Chargement des dépôts...',
        loading_alerts: 'Chargement des alertes...',
        loading_statistics: 'Chargement des statistiques...',
        
        // Cartes du tableau de bord
        canadian_financial_system_overview: 'Aperçu du système financier canadien',
        federal_banks: 'Banques fédérales',
        osfi_regulated: 'Régulées par le BSIF',
        credit_unions: 'Coopératives de crédit',
        provincial_regulated: 'Régulées provincialement',
        insurance_companies: 'Compagnies d\'assurance',
        life_pc_regulated: 'Vie et IARD régulées',
        investment_dealers: 'Courtiers en placement',
        securities_regulated: 'Régulés par les valeurs mobilières',
        
        // ==================  
        // CONTENU DYNAMIQUE ET STATISTIQUES
        // ==================
        regulatory_filing_activity: 'Activité de dépôt réglementaire',
        quarterly_returns: 'Rendements trimestriels',
        q3_2024_submission: 'Période de soumission Q3 2024',
        compliance_rate: 'Taux de conformité',
        annual_reports: 'Rapports annuels',
        '2023_annual_filings': 'Dépôts annuels 2023',
        submission_rate: 'Taux de soumission',
        incident_reports: 'Rapports d\'incident',
        past_30_days: '30 derniers jours',
        reported: 'Signalés',
        filing_calendar: 'Calendrier de dépôt',
        next_filing_deadline: 'Prochaine échéance de dépôt : 15 novembre 2024 (Rapports de couverture de liquidité Q3)',
        
        // Aperçu des risques du système
        system_risk_overview: 'Aperçu des risques du système',
        system_stability: 'Stabilité du système',
        stable: 'Stable',
        overall_financial_system_health: 'Santé globale du système financier',
        capital_adequacy: 'Adéquation du capital',
        average_sector_ratio: 'Ratio moyen du secteur',
        market_volatility: 'Volatilité du marché',
        moderate: 'Modérée',
        current_market_conditions: 'Conditions actuelles du marché',
        global_exposure: 'Exposition mondiale',
        managed: 'Gérée',
        international_risk_exposure: 'Exposition au risque international',
        public_risk_disclosure: 'Divulgation publique des risques',
        detailed_risk_assessments_text: 'Les évaluations détaillées des risques et les données spécifiques des institutions ne sont disponibles qu\'au personnel réglementaire autorisé.',
        
        // Santé du système réglementaire
        regulatory_system_health: 'Santé du système réglementaire',
        filing_compliance_rate: 'Taux de conformité des dépôts',
        system_response_time: 'Temps de réponse du système',
        data_accuracy: 'Précision des données',
        regulatory_agencies: 'Agences réglementaires',
        monitoring: 'Surveillance',
        last_updated: 'Dernière mise à jour',
        
        // Modal de connexion
        login_to_cfrp: 'Se connecter à la plateforme PCRF',
        email_address: 'Adresse courriel',
        enter_email: 'Entrez votre courriel',
        password: 'Mot de passe',
        enter_password: 'Entrez votre mot de passe',
        demo_credentials: 'Identifiants de démonstration',
        administrator: 'Administrateur',
        regulator: 'Régulateur',
        institution_admin: 'Administrateur d\'institution',
        cancel: 'Annuler',
        
        // ==================
        // SECTION COMMENT FONCTIONNE PCRF
        // ==================
        how_cfrp_works: 'Comment fonctionne PCRF',
        how_cfrp_works_description: 'La Plateforme canadienne de réglementation financière transforme la façon dont les institutions financières interagissent avec les régulateurs, créant un écosystème unifié pour la conformité, la surveillance et la protection des consommateurs.',
        what_is_cfrp: 'Qu\'est-ce que PCRF?',
        cfrp_description: 'PCRF est la première plateforme technologique réglementaire unifiée du Canada qui connecte tous les principaux régulateurs financiers (BSIF, ACFC, ARSF, AMF) avec les institutions financières via une interface intelligente unique.',
        one_platform_feature: 'Une plateforme pour toutes les interactions réglementaires',
        ai_compliance_monitoring: 'Surveillance de conformité alimentée par l\'IA',
        realtime_risk_assessment: 'Évaluation des risques et alertes en temps réel',
        unified_ecosystem: 'Écosystème unifié',
        connecting_regulators_text: 'Connecter les régulateurs et les institutions à travers le Canada',
        centralized_filing_description: 'Les institutions financières utilisent le portail unifié de PCRF pour soumettre les données réglementaires. Une interface unique rationalise les flux de travail de conformité à travers plusieurs agences.',
        risk_analysis_description: 'Des algorithmes avancés analysent les soumissions pour détecter les modèles de risque, les indicateurs d\'inconduite et les problèmes de conformité en utilisant l\'analytique comportementale et la reconnaissance de formes.',
        regulatory_oversight_description: 'Les régulateurs accèdent à des tableaux de bord complets, des alertes de risque et des outils d\'enquête pour une supervision améliorée et une protection proactive des consommateurs.',
        reduce_costs_description: 'Réduction de 60% des coûts de traitement de la conformité',
        save_time_description: 'Éliminer les dépôts en double et les processus manuels',
        protect_consumers_description: 'Surveillance renforcée et détection plus rapide des problèmes',
        improve_markets_description: 'De meilleures données conduisent à une stabilité financière plus forte',
        
        // Processus PCRF
        cfrp_process: 'Le processus PCRF',
        centralized_filing: 'Dépôt centralisé',
        centralized_filing_description: 'Les institutions financières utilisent le portail unifié de PCRF pour soumettre les données réglementaires. Une interface unique rationalise les flux de travail de conformité à travers plusieurs agences.',
        risk_analysis: 'Analyse des risques',
        risk_analysis_description: 'Des algorithmes avancés analysent les soumissions pour détecter les modèles de risque, les indicateurs d\'inconduite et les problèmes de conformité en utilisant l\'analytique comportementale et la reconnaissance de formes.',
        regulatory_oversight: 'Surveillance réglementaire',
        regulatory_oversight_description: 'Les régulateurs accèdent à des tableaux de bord complets, des alertes de risque et des outils d\'enquête pour une supervision améliorée et une protection proactive des consommateurs.',
        
        // Objectifs
        our_goals: 'Nos objectifs',
        reduce_costs: 'Réduire les coûts',
        reduce_costs_description: 'Réduction de 60% des coûts de traitement de la conformité',
        save_time: 'Économiser du temps',
        save_time_description: 'Éliminer les dépôts en double et les processus manuels',
        protect_consumers: 'Protéger les consommateurs',
        protect_consumers_description: 'Surveillance renforcée et détection plus rapide des problèmes',
        improve_markets: 'Améliorer les marchés',
        improve_markets_description: 'De meilleures données conduisent à une stabilité financière plus forte',
        
        // Qui utilise PCRF
        for_financial_institutions: 'Pour les institutions financières',
        banks_credit_unions: 'Banques et coopératives de crédit : Soumettre les rapports réglementaires une fois pour toutes les agences',
        insurance_companies_desc: 'Compagnies d\'assurance : Conformité rationalisée à travers les provinces',
        investment_firms: 'Sociétés d\'investissement : Surveillance des risques en temps réel et alertes',
        
        for_regulators: 'Pour les régulateurs',
        for_regulators_desc: 'Outils de surveillance unifiés, coordination inter-agences, analytique avancée et capacités de protection des consommateurs.',
        enhanced_supervision: 'Supervision renforcée',
        enhanced_supervision_desc: 'Surveillance en temps réel, évaluation des risques et réponse réglementaire coordonnée à travers tous les régulateurs financiers canadiens.',
        
        // ==================
        // INSTRUCTIONS DE DÉMONSTRATION
        // ==================
        how_to_use_platform: 'Comment utiliser la plateforme PCRF',
        step_1_login: 'Connectez-vous avec les identifiants de démonstration (ex: compliance@rbc.ca / demo123)',
        step_2_navigate: 'Utilisez le menu de navigation pour explorer : Tableau de bord • Dépôts • Entités • Risque',
        step_3_filing: 'En tant qu\'utilisateur RBC, cliquez sur "Nouveau dépôt" pour soumettre des données réglementaires',
        step_4_review: 'En tant que régulateur (regulator@osfi.ca), examinez les dépôts et créez des cas',
        demo_environment_setup: 'Configuration de l\'environnement de démonstration',
        demo_environment_desc: 'Besoin de données d\'exemple? Cliquez sur les boutons ci-dessous pour remplir le système avec des données financières canadiennes réalistes.',
        create_sample_users: 'Créer des utilisateurs d\'exemple',
        create_sample_entities: 'Créer des entités d\'exemple',
        create_sample_filings: 'Créer des dépôts d\'exemple',
        create_sample_cases: 'Créer des cas d\'exemple',
        
        // ==================
        // GESTION DES ENTITÉS
        // ==================
        entity_management: 'Gestion des entités',
        registered_entities: 'Entités enregistrées',
        regulated_entities_management: 'Gestion des entités réglementées',
        regulated_entities_subtitle: 'Vue complète et gestion de toutes les institutions financières réglementées',
        entity_name: 'Nom de l\'entité',
        entity_type: 'Type d\'entité',
        jurisdiction: 'Juridiction',
        primary_regulator: 'Régulateur principal',
        status: 'Statut',
        actions: 'Actions',
        add_entity: 'Ajouter une entité',
        edit_entity: 'Modifier l\'entité',
        view_details: 'Voir les détails',
        export_all: 'Exporter tout',
        advanced_filters: 'Filtres avancés',
        
        // ==================
        // GESTION DES DÉPÔTS
        // ==================
        regulatory_filings: 'Dépôts réglementaires',
        filings_subtitle: 'Suivre et gérer les soumissions réglementaires et les rapports de conformité',
        filing_type: 'Type de dépôt',
        reporting_period: 'Période de déclaration',
        submitted: 'Soumis',
        risk_score: 'Score de risque',
        new_filing: 'Nouveau dépôt',
        submit_filing: 'Soumettre le dépôt',
        filing_schedule: 'Calendrier des dépôts',
        filing_analytics: 'Analytique des dépôts',
        quarterly_return: 'Rendement trimestriel',
        annual_report: 'Rapport annuel',
        capital_adequacy: 'Rapport d\'adéquation du capital',
        liquidity_report: 'Rapport de liquidité',
        risk_report: 'Rapport d\'évaluation des risques',
        
        // Formulaire de dépôt
        select_filing_type: 'Sélectionner le type de dépôt',
        financial_data_required: 'Données financières requises',
        tier1_ratio: 'Ratio de capital de niveau 1',
        tier1_ratio_percent: 'Ratio de capital de niveau 1 (%)',
        leverage_ratio: 'Ratio de levier',
        leverage_ratio_percent: 'Ratio de levier (%)',
        liquidity_coverage_ratio: 'Ratio de couverture de liquidité',
        total_assets: 'Actifs totaux',
        total_assets_cad_millions: 'Actifs totaux (millions CAD)',
        consumer_complaints: 'Plaintes des consommateurs',
        consumer_complaints_period: 'Plaintes des consommateurs (cette période)',
        operational_losses: 'Pertes opérationnelles',
        operational_losses_cad: 'Pertes opérationnelles (CAD)',
        additional_notes: 'Notes supplémentaires',
        optional_notes: 'Notes optionnelles sur ce dépôt...',
        
        // ==================
        // GESTION DES RISQUES
        // ==================
        risk_management: 'Gestion des risques',
        risk_subtitle: 'Surveiller et évaluer les risques de conformité réglementaire à travers toutes les entités',
        risk_assessment: 'Évaluation des risques',
        compliance_status: 'Statut de conformité',
        tier1_capital: 'Ratio de capital de niveau 1',
        leverage_ratio_full: 'Ratio de levier',
        liquidity_coverage: 'Ratio de couverture de liquidité',
        risk_scan: 'Analyse des risques',
        risk_analytics: 'Analytique des risques',
        risk_settings: 'Paramètres des risques',
        
        // ==================
        // GESTION DES CAS
        // ==================
        cases_management: 'Gestion des cas',
        investigation_cases: 'Cas d\'enquête',
        cases_subtitle: 'Gérer les enquêtes réglementaires et les actions d\'application',
        new_case: 'Nouveau cas',
        case_search: 'Recherche de cas',
        case_analytics: 'Analytique des cas',
        case_title: 'Titre du cas',
        case_type: 'Type de cas',
        priority: 'Priorité',
        lead_investigator: 'Enquêteur principal',
        case_description: 'Description du cas',
        compliance_review: 'Examen de conformité',
        formal_investigation: 'Enquête formelle',
        enforcement_action: 'Action d\'application',
        
        // ==================
        // ANALYSE DE CONDUITE
        // ==================
        conduct_analysis: 'Analyse de conduite',
        conduct_subtitle: 'Détection avancée d\'inconduite et surveillance de la conformité réglementaire',
        misconduct_detection: 'Détection d\'inconduite',
        consumer_protection: 'Protection des consommateurs',
        regulatory_breaches: 'Violations réglementaires',
        run_analysis: 'Exécuter l\'analyse',
        compliance_check: 'Vérification de conformité',
        trend_analysis: 'Analyse des tendances',
        
        // Types de détection spécialisés
        synthetic_customers: 'Clients synthétiques',
        jurisdiction_violations: 'Violations de juridiction',
        fronting_arrangements: 'Arrangements de façade',
        client_borrowing_violations: 'Violations d\'emprunt client',
        
        // ==================
        // MODULES SPÉCIALISÉS
        // ==================
        insurance_module: 'Réglementation d\'assurance',
        pensions_module: 'Réglementation des pensions',
        payments_module: 'Paiements et fintech',
        securities_module: 'Réglementation des valeurs mobilières',
        
        // Assurance
        insurance_oversight: 'Surveillance réglementaire d\'assurance',
        solvency_monitoring: 'Surveillance de la solvabilité',
        mct_ratios: 'Ratios TCM',
        
        // Pensions
        pension_oversight: 'Surveillance des régimes de pension',
        funding_analysis: 'Analyse du financement',
        
        // Paiements
        payment_oversight: 'Surveillance des fournisseurs de services de paiement',
        aml_compliance: 'Conformité LBC',
        
        // Valeurs mobilières
        securities_oversight: 'Surveillance du marché des valeurs mobilières',
        market_surveillance: 'Surveillance du marché',
        
        // ==================
        // ÉLÉMENTS D'INTERFACE COMMUNE
        // ==================
        // Actions et boutons
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
        refresh: 'Actualiser',
        search: 'Rechercher',
        filter: 'Filtrer',
        clear: 'Effacer',
        reset: 'Réinitialiser',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        
        // Étiquettes de statut
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté',
        under_review: 'En cours d\'examen',
        completed: 'Terminé',
        in_progress: 'En cours',
        high: 'Élevé',
        medium: 'Moyen',
        low: 'Faible',
        critical: 'Critique',
        
        // Temps et dates
        today: 'Aujourd\'hui',
        yesterday: 'Hier',
        this_week: 'Cette semaine',
        this_month: 'Ce mois-ci',
        this_quarter: 'Ce trimestre',
        this_year: 'Cette année',
        
        // Messages
        no_data_available: 'Aucune donnée disponible',
        loading: 'Chargement...',
        please_wait: 'Veuillez patienter...',
        operation_completed: 'Opération terminée avec succès',
        error_occurred: 'Une erreur s\'est produite',
        unauthorized: 'Accès non autorisé',
        
        // ==================
        // ORGANISMES DE RÉGLEMENTATION
        // ==================
        agencies: {
          osfi: 'Bureau du surintendant des institutions financières',
          fcac: 'Agence de la consommation en matière financière du Canada',
          fsra: 'Autorité de réglementation des services financiers de l\'Ontario',
          amf: 'Autorité des marchés financiers du Québec',
          bcfsa: 'Autorité des services financiers de la Colombie-Britannique',
          asic: 'Commission des valeurs mobilières de l\'Alberta',
          ciro: 'Organisme canadien de réglementation des investissements'
        },
        
        // ==================
        // TYPES D'ENTITÉS
        // ==================
        entity_types: {
          chartered_bank: 'Banque à charte',
          credit_union: 'Coopérative de crédit',
          life_insurance: 'Compagnie d\'assurance-vie',
          pc_insurance: 'Compagnie d\'assurance IARD',
          trust_company: 'Société de fiducie',
          loan_company: 'Société de prêt',
          investment_dealer: 'Courtier en placement',
          mutual_fund_dealer: 'Courtier en fonds mutuels',
          pension_plan: 'Régime de pension',
          payment_processor: 'Processeur de paiement'
        },
        
        // ==================
        // MODULES SPÉCIALISÉS
        // ==================
        insurance_regulation: 'Réglementation des assurances',
        pensions_regulation: 'Réglementation des pensions',
        payments_fintech: 'Paiements et technologie financière',
        provincial_regulators: 'Régulateurs provinciaux',
        securities_regulation: 'Réglementation des valeurs mobilières',
        integrated_dashboard: 'Tableau de bord intégré',
        
        federal_provincial_coverage: 'Couverture fédérale et provinciale',
        risk_assessment_mct: 'Évaluation des risques et TCM',
        market_conduct_reports: 'Rapports de conduite du marché',
        solvency_monitoring: 'Surveillance de la solvabilité',
        
        pension_plan_oversight: 'Surveillance des régimes de retraite',
        funding_analysis: 'Analyse du financement',
        investment_performance: 'Performance des investissements',
        actuarial_reports: 'Rapports actuariels',
        
        payment_service_providers: 'Fournisseurs de services de paiement',
        aml_kyc_compliance: 'Conformité LBC/CVD',
        crypto_exchanges: 'Bourses de cryptomonnaies',
        transaction_monitoring: 'Surveillance des transactions',
        
        multi_jurisdiction_filing: 'Dépôt multijuridictionnel',
        cross_border_coordination: 'Coordination transfrontalière',
        french_language_support: 'Support en français',
        provincial_compliance: 'Conformité provinciale',
        
        sedar_plus_integration: 'Intégration SEDAR+',
        market_surveillance: 'Surveillance du marché',
        insider_trading_detection: 'Détection des délits d\'initiés',
        investment_funds: 'Fonds d\'investissement',
        
        all_modules_combined: 'Tous les modules combinés',
        cross_module_analytics: 'Analyses inter-modules',
        unified_reporting: 'Rapports unifiés',
        regulatory_intelligence: 'Intelligence réglementaire',
        complete_coverage: 'Couverture complète',
        
        active_modules: 'Modules actifs',
        coverage_rate: 'Taux de couverture',
        monitoring: 'Surveillance',
        powered: 'Alimenté par',
        
        run_comprehensive_risk_assessment: 'Effectuer une évaluation complète des risques',
        generate_cross_module_report: 'Générer un rapport inter-modules',
        configure_module_alerts: 'Configurer les alertes des modules',
        
        module_documentation: 'Documentation et aide des modules',
        getting_started: 'Commencer',
        modules_getting_started_text: 'Cliquez sur n\'importe quel module ci-dessus pour accéder aux outils réglementaires spécialisés. Chaque module fournit une couverture complète pour son domaine réglementaire.',
        modules_overview: 'Aperçu des modules',
        integration_guide: 'Guide d\'intégration',
        troubleshooting: 'Dépannage',
        
        public_modules_description: 'PCRF fournit des modules réglementaires spécialisés couvrant tous les aspects du cadre réglementaire financier du Canada. Connectez-vous pour accéder aux fonctionnalités détaillées des modules.',
        who_uses_modules: 'Qui utilise ces modules',
        financial_institutions: 'Institutions financières',
        streamlined_compliance: 'Conformité rationalisée dans plusieurs juridictions réglementaires',
        regulatory_agencies: 'Organismes de réglementation',
        enhanced_oversight: 'Surveillance renforcée avec partage de données unifié et coordination',
        compliance_teams: 'Équipes de conformité',
        comprehensive_tools: 'Outils complets pour la surveillance et les rapports réglementaires',
        
        access_information: 'Information d\'accès',
        authentication_required: 'Authentification requise',
        modules_login_required: 'L\'accès aux modules réglementaires spécialisés nécessite une authentification. Veuillez vous connecter pour accéder à toutes les fonctionnalités.',
        login_to_access_modules: 'Se connecter pour accéder aux modules',
        unified_view: 'Vue unifiée'
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
  
  // Get translation
  t(key) {
    const keys = key.split('.')
    let result = this.translations[this.currentLanguage]
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        // Fallback to English if key not found in current language
        result = this.translations['en']
        for (const fallbackKey of keys) {
          if (result && typeof result === 'object' && fallbackKey in result) {
            result = result[fallbackKey]
          } else {
            return key // Return key itself if not found
          }
        }
        break
      }
    }
    
    return result || key
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
  
  // Update all page elements
  updatePageLanguage() {
    // Update document title
    const titleElement = document.querySelector('[data-i18n-document-title]')
    if (titleElement) {
      const titleKey = titleElement.getAttribute('data-i18n-document-title')
      document.title = this.t(titleKey)
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n')
      element.textContent = this.t(key)
    })
    
    // Update all elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html')
      element.innerHTML = this.t(key)
    })
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder')
      element.placeholder = this.t(key)
    })
    
    // Update titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title')
      element.title = this.t(key)
    })
    
    // Update page direction for RTL languages (future use)
    document.documentElement.lang = this.currentLanguage
    
    // Update language selector if exists
    const languageSelector = document.getElementById('languageSelector')
    if (languageSelector) {
      languageSelector.value = this.currentLanguage
    }
    
    // Update language label
    const languageLabel = document.querySelector('label[for="languageSelector"]')
    if (languageLabel) {
      languageLabel.innerHTML = `
        <i class="fas fa-globe mr-1"></i>
        ${this.currentLanguage === 'fr' ? 'Langue' : 'Language'}:
      `
    }
  }
  
  // Translate dynamic content
  translateElement(element) {
    // Translate data-i18n attributes
    element.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      el.textContent = this.t(key)
    })
    
    // Translate data-i18n-html attributes
    element.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html')
      el.innerHTML = this.t(key)
    })
    
    // Translate placeholders
    element.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder')
      el.placeholder = this.t(key)
    })
    
    // Translate titles
    element.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title')
      el.title = this.t(key)
    })
  }
  
  // Initialize internationalization
  init() {
    this.updatePageLanguage()
    
    // Don't add automatic language selector - we have our own custom one
    // this.addLanguageSelector()
    
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
  formatCurrency(amount) {
    const locale = this.currentLanguage === 'fr' ? 'fr-CA' : 'en-CA'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CAD'
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