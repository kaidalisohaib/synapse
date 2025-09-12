// Configuration utility for environment variables
// Centralizes all configuration and provides defaults

// Helper function to parse comma-separated values
function parseCommaSeparated(value, fallback = []) {
  if (!value) return fallback
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

// Helper function to parse boolean values
function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback
  return value.toLowerCase() === 'true'
}

// Helper function to parse integer values
function parseInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

// ======================
// SUPABASE CONFIGURATION
// ======================
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

// ======================
// EMAIL CONFIGURATION
// ======================
export const emailConfig = {
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.EMAIL_FROM_ADDRESS || 'noreply@synapse.mcgill.ca',
  fromName: process.env.EMAIL_FROM_NAME || 'Synapse Platform',
}

// ======================
// APPLICATION SETTINGS
// ======================
export const appConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Synapse',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
}

// ======================
// ADMIN CONFIGURATION
// ======================
export const adminConfig = {
  emails: parseCommaSeparated(
    process.env.ADMIN_EMAILS,
    ['admin@synapse.mcgill.ca', 'sohaib.kaidali@mail.mcgill.ca']
  ),
}

// ======================
// SECURITY SETTINGS
// ======================
export const securityConfig = {
  rateLimit: {
    matchRequestsPerHour: parseInt(process.env.RATE_LIMIT_MATCH_REQUESTS_PER_HOUR, 5),
    emailSendsPerHour: parseInt(process.env.RATE_LIMIT_EMAIL_SENDS_PER_HOUR, 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 3600000), // 1 hour
  },
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 8),
    requireSpecialChars: parseBoolean(process.env.PASSWORD_REQUIRE_SPECIAL_CHARS, false),
  },
  session: {
    timeoutHours: parseInt(process.env.SESSION_TIMEOUT_HOURS, 24),
  },
}

// ======================
// BUSINESS LOGIC CONFIG
// ======================
export const matchingConfig = {
  scoreThreshold: parseInt(process.env.MATCH_SCORE_THRESHOLD, 10),
  cooldownDays: parseInt(process.env.MATCH_COOLDOWN_DAYS, 30),
  expiryDays: parseInt(process.env.MATCH_EXPIRY_DAYS, 7),
  scoring: {
    knowledgeTag: parseInt(process.env.MATCH_SCORE_KNOWLEDGE_TAG, 15),
    curiosityTag: parseInt(process.env.MATCH_SCORE_CURIOSITY_TAG, 5),
    facultyBonus: parseInt(process.env.MATCH_SCORE_FACULTY_BONUS, 25),
    sameProgramPenalty: parseInt(process.env.MATCH_SCORE_SAME_PROGRAM_PENALTY, 50),
  },
  limits: {
    maxRequestsPerUser: parseInt(process.env.MAX_REQUESTS_PER_USER, 10),
    maxTagsPerCategory: parseInt(process.env.MAX_TAGS_PER_CATEGORY, 10),
  },
}

// ======================
// EMAIL DOMAIN VALIDATION
// ======================
export const validationConfig = {
  allowedEmailDomains: parseCommaSeparated(
    process.env.ALLOWED_EMAIL_DOMAINS,
    ['@mail.mcgill.ca', '@mcgill.ca']
  ),
}

// ======================
// FEATURE FLAGS
// ======================
export const featureFlags = {
  enableEmailNotifications: parseBoolean(process.env.ENABLE_EMAIL_NOTIFICATIONS, true),
  enableAdminDashboard: parseBoolean(process.env.ENABLE_ADMIN_DASHBOARD, true),
  enableUserRegistration: parseBoolean(process.env.ENABLE_USER_REGISTRATION, true),
  enableMatchScoring: parseBoolean(process.env.ENABLE_MATCH_SCORING, true),
}

// ======================
// MONITORING & LOGGING
// ======================
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  enableRequestLogging: parseBoolean(process.env.ENABLE_REQUEST_LOGGING, false),
}

// ======================
// DEVELOPMENT SETTINGS
// ======================
export const debugConfig = {
  matchingAlgorithm: parseBoolean(process.env.DEBUG_MATCHING_ALGORITHM, false),
  emailSending: parseBoolean(process.env.DEBUG_EMAIL_SENDING, false),
}

// ======================
// MCGILL SPECIFIC CONFIG
// ======================
export const mcgillConfig = {
  faculties: [
    'Agricultural and Environmental Sciences',
    'Arts',
    'Dentistry',
    'Education',
    'Engineering',
    'Law',
    'Management',
    'Medicine and Health Sciences',
    'Music',
    'Religious Studies',
    'Science',
    'Continuing Studies'
  ],
  academicYears: [
    'U1', 'U2', 'U3', 'U4', 'U5',
    'Masters', 'PhD', 'Postdoc'
  ],
}

// ======================
// VALIDATION FUNCTIONS
// ======================

// Validate required environment variables
export function validateConfig() {
  const errors = []

  // Check required Supabase config
  if (!supabaseConfig.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!supabaseConfig.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  // Check email config if email notifications are enabled
  if (featureFlags.enableEmailNotifications && !emailConfig.apiKey) {
    errors.push('RESEND_API_KEY is required when email notifications are enabled')
  }

  // Validate admin emails format
  adminConfig.emails.forEach(email => {
    if (!email.includes('@')) {
      errors.push(`Invalid admin email format: ${email}`)
    }
  })

  // Validate email domains format
  validationConfig.allowedEmailDomains.forEach(domain => {
    if (!domain.startsWith('@')) {
      errors.push(`Email domain must start with @: ${domain}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get all configuration as a single object (useful for debugging)
export function getAllConfig() {
  return {
    supabase: supabaseConfig,
    email: emailConfig,
    app: appConfig,
    admin: adminConfig,
    security: securityConfig,
    matching: matchingConfig,
    validation: validationConfig,
    features: featureFlags,
    logging: loggingConfig,
    debug: debugConfig,
    mcgill: mcgillConfig,
  }
}

// Check if running in production
export const isProduction = appConfig.nodeEnv === 'production'
export const isDevelopment = appConfig.nodeEnv === 'development'

// Default export with most commonly used configs
export default {
  app: appConfig,
  admin: adminConfig,
  security: securityConfig,
  matching: matchingConfig,
  features: featureFlags,
  mcgill: mcgillConfig,
  isProduction,
  isDevelopment,
}
