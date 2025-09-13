#!/usr/bin/env node

/**
 * Test Data Setup Script for Synapse Platform
 * 
 * This script helps create test users and scenarios for testing
 * the matching system with limited email addresses.
 * 
 * Usage: node setup-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user profiles
const testProfiles = [
  {
    email: 'your.email+requester@mail.mcgill.ca', // Replace with your actual email
    name: 'Alice Requester',
    faculty: 'Science',
    program: 'Computer Science',
    year: 'U3',
    knowledgeTags: ['programming', 'algorithms', 'web development'],
    curiosityTags: ['psychology', 'neuroscience', 'cognitive science']
  },
  {
    email: 'your.email+matcher@mail.mcgill.ca', // Replace with your actual email
    name: 'Bob Matcher',
    faculty: 'Arts',
    program: 'Psychology',
    year: 'U2',
    knowledgeTags: ['psychology', 'research methods', 'statistics'],
    curiosityTags: ['artificial intelligence', 'machine learning', 'programming']
  },
  {
    email: 'your.email+interdisciplinary@mail.mcgill.ca', // Replace with your actual email
    name: 'Carol Interdisciplinary',
    faculty: 'Engineering',
    program: 'Bioengineering',
    year: 'Masters',
    knowledgeTags: ['bioengineering', 'medical devices', 'research'],
    curiosityTags: ['ethics', 'philosophy', 'policy']
  }
];

// Sample curiosity requests
const sampleRequests = [
  {
    requesterEmail: 'your.email+requester@mail.mcgill.ca',
    requestText: "I'm really curious about how psychology research methods could be applied to understanding user behavior in software applications. As a computer science student, I know about data collection and analysis from a technical perspective, but I'd love to learn about the psychological frameworks and experimental design approaches that could make my user research more rigorous and insightful."
  },
  {
    requesterEmail: 'your.email+matcher@mail.mcgill.ca',
    requestText: "I've been wondering about the intersection of artificial intelligence and cognitive psychology. How do machine learning algorithms compare to human learning processes? Are there insights from cognitive science that could improve AI systems, or vice versa? I'd love to discuss this with someone who has a technical background in AI."
  }
];

async function createTestUser(profile) {
  try {
    console.log(`Creating test user: ${profile.name} (${profile.email})`);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: profile.email,
      password: 'TestPassword123!',
      email_confirm: true // Auto-confirm for testing
    });

    if (authError) {
      console.error(`❌ Failed to create auth user: ${authError.message}`);
      return null;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: profile.name,
        faculty: profile.faculty,
        program: profile.program,
        year: profile.year,
        knowledgeTags: profile.knowledgeTags,
        curiosityTags: profile.curiosityTags,
        email_verified: true,
        profile_completed: true
      });

    if (profileError) {
      console.error(`❌ Failed to create profile: ${profileError.message}`);
      return null;
    }

    console.log(`✅ Created test user: ${profile.name}`);
    return authData.user.id;
  } catch (error) {
    console.error(`❌ Error creating test user: ${error.message}`);
    return null;
  }
}

async function createTestRequest(request) {
  try {
    // Find the requester user
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error(`❌ Failed to list users: ${userError.message}`);
      return;
    }

    const requester = userData.users.find(user => user.email === request.requesterEmail);
    if (!requester) {
      console.error(`❌ Requester not found: ${request.requesterEmail}`);
      return;
    }

    // Create the request
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .insert({
        requester_id: requester.id,
        request_text: request.requestText,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error(`❌ Failed to create request: ${requestError.message}`);
      return;
    }

    console.log(`✅ Created test request: ${requestData.id}`);
    return requestData.id;
  } catch (error) {
    console.error(`❌ Error creating test request: ${error.message}`);
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up existing test data...');
  
  try {
    // Delete test users (this will cascade to profiles, requests, matches)
    const { data: userData } = await supabase.auth.admin.listUsers();
    const testUsers = userData.users.filter(user => 
      user.email.includes('+test') || 
      user.email.includes('+requester') || 
      user.email.includes('+matcher') ||
      user.email.includes('+interdisciplinary')
    );

    for (const user of testUsers) {
      await supabase.auth.admin.deleteUser(user.id);
      console.log(`🗑️  Deleted test user: ${user.email}`);
    }
  } catch (error) {
    console.log(`⚠️  Cleanup warning: ${error.message}`);
  }
}

async function setupTestData() {
  console.log('🚀 Setting up Synapse test data...\n');

  // Clean up existing test data
  await cleanupTestData();

  console.log('\n📝 Creating test users...');
  const userIds = [];
  for (const profile of testProfiles) {
    const userId = await createTestUser(profile);
    if (userId) userIds.push(userId);
  }

  console.log('\n📋 Creating test requests...');
  for (const request of sampleRequests) {
    await createTestRequest(request);
  }

  console.log('\n✅ Test data setup complete!');
  console.log('\n📧 Test User Credentials:');
  testProfiles.forEach(profile => {
    console.log(`   Email: ${profile.email}`);
    console.log(`   Password: TestPassword123!`);
    console.log(`   Name: ${profile.name} (${profile.faculty})`);
    console.log('');
  });

  console.log('🧪 Testing Instructions:');
  console.log('1. Sign in with any of the test accounts above');
  console.log('2. Submit curiosity requests to trigger matching');
  console.log('3. Check your email for match notifications');
  console.log('4. Test the accept/decline flow');
  console.log('5. Verify connection emails are sent');
  
  console.log('\n⚠️  Remember to update the email addresses in this script with your actual McGill email!');
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Synapse Test Data Setup Script

Usage: node setup-test-data.js [options]

Options:
  --cleanup, -c  Only cleanup existing test data
  --help, -h     Show this help message

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL     Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    Your Supabase service role key

Before running:
1. Update the email addresses in testProfiles to use your McGill email with aliases
2. Make sure your .env.local file has the required Supabase keys
    `);
    process.exit(0);
  }

  if (args.includes('--cleanup') || args.includes('-c')) {
    cleanupTestData().then(() => {
      console.log('✅ Cleanup complete!');
      process.exit(0);
    }).catch(error => {
      console.error(`❌ Cleanup failed: ${error.message}`);
      process.exit(1);
    });
  } else {
    setupTestData().catch(error => {
      console.error(`❌ Setup failed: ${error.message}`);
      process.exit(1);
    });
  }
}

module.exports = { setupTestData, cleanupTestData };