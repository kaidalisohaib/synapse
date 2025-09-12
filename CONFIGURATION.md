# 🔧 Synapse Configuration Guide

This guide explains how to configure the Synapse platform using environment variables.

## 📋 **Environment Setup**

### **Step 1: Copy the Environment Template**
```bash
cp env.example .env.local
```

### **Step 2: Configure Required Variables**
Edit `.env.local` and fill in the required values:

```env
# REQUIRED: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# REQUIRED: Email Service (if email notifications enabled)
RESEND_API_KEY=your_resend_api_key

# REQUIRED: Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔐 **Security Configuration**

### **Admin Access**
```env
# Comma-separated list of admin emails
ADMIN_EMAILS=admin@synapse.mcgill.ca,your-email@mail.mcgill.ca
```

### **Rate Limiting**
```env
# Match requests per user per hour
RATE_LIMIT_MATCH_REQUESTS_PER_HOUR=5

# Email sends per user per hour
RATE_LIMIT_EMAIL_SENDS_PER_HOUR=10

# Rate limit window in milliseconds (default: 1 hour)
RATE_LIMIT_WINDOW_MS=3600000
```

### **Password Requirements**
```env
# Minimum password length
PASSWORD_MIN_LENGTH=8

# Require special characters (true/false)
PASSWORD_REQUIRE_SPECIAL_CHARS=false
```

## 🎯 **Matching Algorithm Configuration**

### **Scoring System**
```env
# Minimum score threshold for valid matches
MATCH_SCORE_THRESHOLD=10

# Points awarded for knowledge tag matches
MATCH_SCORE_KNOWLEDGE_TAG=15

# Points awarded for curiosity tag matches
MATCH_SCORE_CURIOSITY_TAG=5

# Bonus points for cross-faculty matches
MATCH_SCORE_FACULTY_BONUS=25

# Penalty for same-program matches
MATCH_SCORE_SAME_PROGRAM_PENALTY=50
```

### **Business Logic**
```env
# Days before same users can be matched again
MATCH_COOLDOWN_DAYS=30

# Days until match requests expire
MATCH_EXPIRY_DAYS=7

# Maximum requests per user
MAX_REQUESTS_PER_USER=10

# Maximum tags per category (knowledge/curiosity)
MAX_TAGS_PER_CATEGORY=10
```

## 📧 **Email Configuration**

### **Email Service Settings**
```env
# Email sender address
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# Email sender name
EMAIL_FROM_NAME=Synapse Platform
```

### **Email Domain Validation**
```env
# Allowed email domains (comma-separated)
ALLOWED_EMAIL_DOMAINS=@mail.mcgill.ca,@mcgill.ca
```

## 🎛️ **Feature Flags**

Enable or disable platform features:

```env
# Enable email notifications (true/false)
ENABLE_EMAIL_NOTIFICATIONS=true

# Enable admin dashboard (true/false)
ENABLE_ADMIN_DASHBOARD=true

# Enable user registration (true/false)
ENABLE_USER_REGISTRATION=true

# Enable match scoring algorithm (true/false)
ENABLE_MATCH_SCORING=true
```

## 📊 **Monitoring & Logging**

```env
# Log level: error, warn, info, debug
LOG_LEVEL=info

# Enable API request logging (true/false)
ENABLE_REQUEST_LOGGING=false
```

## 🎓 **McGill-Specific Configuration**

The following are hardcoded in the configuration but can be customized:

### **Faculties**
- Agricultural and Environmental Sciences
- Arts, Dentistry, Education, Engineering
- Law, Management, Medicine and Health Sciences
- Music, Religious Studies, Science
- Continuing Studies

### **Academic Years**
- U1, U2, U3, U4, U5
- Masters, PhD, Postdoc

## 🔄 **Configuration Usage in Code**

### **Importing Configuration**
```javascript
import { adminConfig, securityConfig, matchingConfig } from '@/lib/config'

// Use admin emails
if (adminConfig.emails.includes(user.email)) {
  // Admin access
}

// Use matching scores
const score = matchingConfig.scoring.knowledgeTag * tagMatches
```

### **Available Configuration Objects**
- `adminConfig` - Admin settings and emails
- `securityConfig` - Security and rate limiting
- `matchingConfig` - Algorithm and business logic
- `validationConfig` - Email and input validation
- `featureFlags` - Feature toggles
- `mcgillConfig` - McGill-specific data
- `appConfig` - Application settings

## 🚀 **Environment-Specific Settings**

### **Development**
```env
NODE_ENV=development
DEBUG_MATCHING_ALGORITHM=true
DEBUG_EMAIL_SENDING=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Production**
```env
NODE_ENV=production
DEBUG_MATCHING_ALGORITHM=false
DEBUG_EMAIL_SENDING=false
NEXT_PUBLIC_APP_URL=https://synapse.mcgill.ca
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=true
```

## ✅ **Configuration Validation**

The application automatically validates configuration on startup:

```javascript
import { validateConfig } from '@/lib/config'

const validation = validateConfig()
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors)
}
```

## 🛠️ **Common Configuration Tasks**

### **Adding a New Admin**
1. Add their email to `ADMIN_EMAILS`
2. Restart the application
3. They can now access `/admin`

### **Adjusting Match Difficulty**
- Increase `MATCH_SCORE_THRESHOLD` for stricter matching
- Decrease for more lenient matching

### **Changing Rate Limits**
- Modify `RATE_LIMIT_*` variables
- Changes take effect immediately

### **Updating Email Domains**
- Add to `ALLOWED_EMAIL_DOMAINS`
- Use comma separation: `@domain1.com,@domain2.edu`

## 🔍 **Troubleshooting**

### **Configuration Not Loading**
1. Check file is named `.env.local`
2. Verify no syntax errors in env file
3. Restart development server
4. Check browser console for validation errors

### **Admin Access Denied**
1. Verify email in `ADMIN_EMAILS`
2. Check email spelling and casing
3. Ensure user is signed in with correct email

### **Matching Not Working**
1. Check `MATCH_SCORE_THRESHOLD` isn't too high
2. Verify users have sufficient tags
3. Check `MATCH_COOLDOWN_DAYS` setting

---

**💡 Tip:** Use the admin system status page (`/admin/system`) to verify configuration values are loaded correctly.
