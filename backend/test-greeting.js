const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test greeting generation
async function testGreetingGeneration() {
  console.log('\n🧪 Testing Greeting Generation...\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/greeting/generate`, {
      text: 'Hello! This is a test greeting from ElevenLabs. Welcome to our calling system.',
      name: 'Test Greeting',
      // Optional: voiceId - defaults to Rachel voice
      // voiceId: '21m00Tcm4TlvDq8ikWAM'
    });

    console.log('✅ Greeting generated successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.greeting;
  } catch (error) {
    console.error('❌ Error generating greeting:', error.response?.data || error.message);
    return null;
  }
}

// Test listing greetings
async function testListGreetings() {
  console.log('\n🧪 Testing List Greetings...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/greeting/list`);
    
    console.log('✅ Greetings listed successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.greetings;
  } catch (error) {
    console.error('❌ Error listing greetings:', error.response?.data || error.message);
    return null;
  }
}

// Test sending greeting
async function testSendGreeting(greetingId) {
  console.log('\n🧪 Testing Send Greeting...\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/greeting/send`, {
      to: '+919876543210', // Replace with actual phone number
      greetingId: greetingId
    });

    console.log('✅ Greeting send request successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error sending greeting:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting ElevenLabs Greeting Tests...');
  console.log('=' .repeat(50));
  
  // Test 1: Generate greeting
  const greeting = await testGreetingGeneration();
  
  if (greeting) {
    // Test 2: List greetings
    await testListGreetings();
    
    // Test 3: Send greeting (optional - requires valid phone number)
    // await testSendGreeting(greeting.id);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests completed!');
}

// Run tests
runTests();
