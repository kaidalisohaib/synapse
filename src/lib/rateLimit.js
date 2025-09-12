// Simple in-memory rate limiting
// In production, use Redis or a proper rate limiting service

const rateLimitMap = new Map()

export function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }
  
  const requests = rateLimitMap.get(identifier)
  
  // Remove requests outside the current window
  const validRequests = requests.filter(timestamp => timestamp > windowStart)
  
  if (validRequests.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: validRequests[0] + windowMs
    }
  }
  
  // Add current request
  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)
  
  return {
    success: true,
    limit,
    remaining: limit - validRequests.length,
    resetTime: now + windowMs
  }
}

// Clean up old entries periodically (basic garbage collection)
setInterval(() => {
  const now = Date.now()
  for (const [key, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > now - 300000) // 5 minutes
    if (validRequests.length === 0) {
      rateLimitMap.delete(key)
    } else {
      rateLimitMap.set(key, validRequests)
    }
  }
}, 60000) // Clean every minute
