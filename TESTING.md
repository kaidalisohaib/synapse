# Synapse Platform - End-to-End Testing Guide

This document provides a comprehensive testing checklist for the Synapse platform before production deployment.

## Testing Environment Setup

### Prerequisites
- [ ] Local development environment running (`npm run dev`)
- [ ] Supabase project configured with test data
- [ ] Resend API configured for email testing
- [ ] Test McGill email addresses available
- [ ] Browser developer tools open for debugging

### Test Data Setup
- [ ] Create test user profiles with different faculties/programs
- [ ] Populate knowledge and curiosity tags for variety
- [ ] Ensure admin user exists for admin dashboard testing

---

## 1. User Authentication Flow

### Sign Up Process
- [ ] **Test 1.1:** Sign up with valid McGill email (@mail.mcgill.ca)
  - Expected: Account created, verification email sent
- [ ] **Test 1.2:** Sign up with invalid email domain
  - Expected: Error message about McGill email requirement
- [ ] **Test 1.3:** Sign up with weak password
  - Expected: Password strength validation error
- [ ] **Test 1.4:** Sign up with mismatched password confirmation
  - Expected: Password mismatch error
- [ ] **Test 1.5:** Receive and click email verification link
  - Expected: Email verified, redirected to profile setup

### Sign In Process
- [ ] **Test 1.6:** Sign in with verified account
  - Expected: Successful login, redirect to dashboard or profile setup
- [ ] **Test 1.7:** Sign in with unverified account
  - Expected: Email verification required message
- [ ] **Test 1.8:** Sign in with incorrect credentials
  - Expected: Authentication error message
- [ ] **Test 1.9:** Resend verification email functionality
  - Expected: New verification email sent

### Session Management
- [ ] **Test 1.10:** Session persistence across browser refresh
- [ ] **Test 1.11:** Sign out functionality
- [ ] **Test 1.12:** Automatic redirect to login for protected routes

---

## 2. Profile Management

### Profile Setup (First Time)
- [ ] **Test 2.1:** Complete profile setup with all required fields
  - Expected: Profile saved, redirected to dashboard
- [ ] **Test 2.2:** Attempt to skip required fields
  - Expected: Validation errors displayed
- [ ] **Test 2.3:** Add knowledge tags (minimum 1)
  - Expected: Tags saved and displayed
- [ ] **Test 2.4:** Add curiosity tags (minimum 1)
  - Expected: Tags saved and displayed
- [ ] **Test 2.5:** Test tag input functionality (add/remove)
  - Expected: Tags can be added with Enter/comma, removed by clicking X

### Profile Editing
- [ ] **Test 2.6:** Edit existing profile information
  - Expected: Changes saved successfully
- [ ] **Test 2.7:** Update knowledge and curiosity tags
  - Expected: Tag changes reflected in profile
- [ ] **Test 2.8:** Faculty and program dropdown functionality
  - Expected: All McGill faculties and academic years available

---

## 3. Request Submission and Matching

### Request Creation
- [ ] **Test 3.1:** Submit a curiosity request with valid content
  - Expected: Request saved, matching algorithm triggered
- [ ] **Test 3.2:** Submit request with insufficient content (< 10 chars)
  - Expected: Validation error message
- [ ] **Test 3.3:** Submit request with maximum character limit
  - Expected: Request accepted, character count displayed
- [ ] **Test 3.4:** View request submission confirmation
  - Expected: Success message with next steps explanation

### Matching Algorithm
- [ ] **Test 3.5:** Verify match creation in database
  - Expected: Match record created with appropriate score
- [ ] **Test 3.6:** Test matching with different faculty combinations
  - Expected: Interdisciplinary matches receive faculty bonus
- [ ] **Test 3.7:** Test matching with same program
  - Expected: Same program penalty applied to score
- [ ] **Test 3.8:** Test keyword matching in request text
  - Expected: Knowledge/curiosity tag matches increase score

### Email Notifications
- [ ] **Test 3.9:** Automatic match notification email sent
  - Expected: Matched user receives email with accept link
- [ ] **Test 3.10:** Email content and formatting
  - Expected: Professional email with all required information
- [ ] **Test 3.11:** Accept link functionality
  - Expected: Link leads to match acceptance page

---

## 4. Match Acceptance Flow

### Match Acceptance Page
- [ ] **Test 4.1:** Access match acceptance page with valid link
  - Expected: Match details displayed correctly
- [ ] **Test 4.2:** Accept match request
  - Expected: Match status updated, connection email triggered
- [ ] **Test 4.3:** Decline match request
  - Expected: Match status updated to declined
- [ ] **Test 4.4:** Access expired match link
  - Expected: Appropriate expired message displayed
- [ ] **Test 4.5:** Access match link as unauthorized user
  - Expected: Redirect to login or error message

### Connection Emails
- [ ] **Test 4.6:** Connection email sent to both users
  - Expected: Both requester and matched user receive introduction email
- [ ] **Test 4.7:** Email contains contact information
  - Expected: Both users' emails and profiles shared
- [ ] **Test 4.8:** Email formatting and content accuracy
  - Expected: Professional formatting with all necessary details

---

## 5. Dashboard and User Interface

### Dashboard Functionality
- [ ] **Test 5.1:** Dashboard loads with user information
  - Expected: User name, faculty, program displayed
- [ ] **Test 5.2:** Recent requests displayed
  - Expected: User's requests shown with status
- [ ] **Test 5.3:** Match requests displayed
  - Expected: Incoming match requests shown
- [ ] **Test 5.4:** Quick action buttons work
  - Expected: Links to request, profile, stats function correctly
- [ ] **Test 5.5:** Profile preview section
  - Expected: Knowledge and curiosity tags displayed

### Navigation and UI
- [ ] **Test 5.6:** Navbar functionality for authenticated users
  - Expected: Dashboard, Request, Profile links work
- [ ] **Test 5.7:** Navbar functionality for unauthenticated users
  - Expected: Login, Sign Up links work
- [ ] **Test 5.8:** Mobile responsiveness
  - Expected: UI adapts properly to mobile screens
- [ ] **Test 5.9:** Footer links functionality
  - Expected: Privacy, Terms, Contact links work

---

## 6. Admin Dashboard

### Admin Access
- [ ] **Test 6.1:** Admin user can access admin dashboard
  - Expected: Admin dashboard loads with system metrics
- [ ] **Test 6.2:** Non-admin user cannot access admin dashboard
  - Expected: Access denied or redirect to login
- [ ] **Test 6.3:** Admin dashboard displays system statistics
  - Expected: User counts, request counts, match statistics shown

### Admin Functionality
- [ ] **Test 6.4:** View all users and profiles
  - Expected: Complete user list with profile information
- [ ] **Test 6.5:** View all requests and matches
  - Expected: Request history with status and match information
- [ ] **Test 6.6:** System health indicators
  - Expected: Database, email, auth status displayed

---

## 7. Security and Error Handling

### Security Tests
- [ ] **Test 7.1:** Rate limiting on match requests
  - Expected: Excessive requests blocked with appropriate message
- [ ] **Test 7.2:** SQL injection protection
  - Expected: Malicious input sanitized or rejected
- [ ] **Test 7.3:** XSS protection
  - Expected: Script tags in user input escaped
- [ ] **Test 7.4:** CSRF protection
  - Expected: Cross-site requests blocked

### Error Handling
- [ ] **Test 7.5:** Database connection errors
  - Expected: Graceful error messages, no system crashes
- [ ] **Test 7.6:** Email service failures
  - Expected: Matching continues, email failures logged
- [ ] **Test 7.7:** Invalid API requests
  - Expected: Appropriate HTTP status codes and error messages
- [ ] **Test 7.8:** Network connectivity issues
  - Expected: User-friendly error messages

---

## 8. Performance and Reliability

### Performance Tests
- [ ] **Test 8.1:** Page load times under 3 seconds
- [ ] **Test 8.2:** Database query performance
- [ ] **Test 8.3:** Email delivery speed
- [ ] **Test 8.4:** Matching algorithm execution time

### Browser Compatibility
- [ ] **Test 8.5:** Chrome (latest version)
- [ ] **Test 8.6:** Firefox (latest version)
- [ ] **Test 8.7:** Safari (latest version)
- [ ] **Test 8.8:** Edge (latest version)

### Device Testing
- [ ] **Test 8.9:** Desktop (1920x1080)
- [ ] **Test 8.10:** Tablet (768x1024)
- [ ] **Test 8.11:** Mobile (375x667)

---

## 9. Data Integrity and Privacy

### Data Validation
- [ ] **Test 9.1:** Profile data validation and sanitization
- [ ] **Test 9.2:** Request text validation and sanitization
- [ ] **Test 9.3:** Email format validation
- [ ] **Test 9.4:** Tag input validation

### Privacy Compliance
- [ ] **Test 9.5:** Email verification requirement enforced
- [ ] **Test 9.6:** Contact information only shared after double opt-in
- [ ] **Test 9.7:** User data access controls (RLS policies)
- [ ] **Test 9.8:** Privacy policy and terms accessible

---

## 10. Edge Cases and Stress Testing

### Edge Cases
- [ ] **Test 10.1:** User with no potential matches
  - Expected: Appropriate "no matches found" message
- [ ] **Test 10.2:** Multiple simultaneous match requests
  - Expected: System handles concurrent requests properly
- [ ] **Test 10.3:** Very long request text (near character limit)
  - Expected: Text handled properly in emails and UI
- [ ] **Test 10.4:** Special characters in user input
  - Expected: Characters properly encoded and displayed

### Stress Testing
- [ ] **Test 10.5:** Multiple users signing up simultaneously
- [ ] **Test 10.6:** High volume of match requests
- [ ] **Test 10.7:** Large number of concurrent users
- [ ] **Test 10.8:** Database connection pool limits

---

## Testing Completion Checklist

### Critical Path Testing
- [ ] Complete user journey: Sign up → Verify email → Setup profile → Submit request → Receive match → Accept match → Get connected
- [ ] Admin workflow: Access dashboard → View users → View requests → Monitor system health
- [ ] Error recovery: Handle failed emails, database errors, network issues

### Documentation and Reporting
- [ ] Document all bugs found and their severity
- [ ] Create test report with pass/fail status for each test
- [ ] Identify any performance bottlenecks
- [ ] Verify all security measures are working
- [ ] Confirm all user-facing error messages are helpful

### Pre-Launch Verification
- [ ] All critical bugs fixed
- [ ] Performance meets requirements
- [ ] Security measures validated
- [ ] Email delivery working reliably
- [ ] Database backups configured
- [ ] Monitoring and logging in place

---

## Test Environment Cleanup

After testing completion:
- [ ] Clear test data from database
- [ ] Reset email quotas if needed
- [ ] Document any configuration changes needed for production
- [ ] Prepare production environment variables
- [ ] Create deployment checklist

---

## Notes and Issues

Use this section to document any issues found during testing:

### Critical Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Minor Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Performance Notes
- [ ] Note 1: [Description]
- [ ] Note 2: [Description]

---

**Testing completed by:** [Name]  
**Date:** [Date]  
**Environment:** [Development/Staging]  
**Overall Status:** [Pass/Fail/Needs Review]