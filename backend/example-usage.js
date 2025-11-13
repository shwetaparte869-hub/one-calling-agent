/**
 * ElevenLabs Greeting Integration - Usage Examples
 * 
 * This file demonstrates how to use the ElevenLabs greeting endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Example 1: Generate a simple English greeting
async function example1_SimpleGreeting() {
  console.log('\n📝 Example 1: Generate Simple English Greeting\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/greeting/generate`, {
      text: 'Hello! Welcome to our service. How can I help you today?',
      name: 'Simple Welcome'
    });
    
    console.log('✅ Success!');
    console.log('Greeting URL:', response.data.greeting.url);
    console.log('Greeting ID:', response.data.greeting.id);
    
    return response.data.greeting;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 2: Generate a Hindi greeting
async function example2_HindiGreeting() {
  console.log('\n📝 Example 2: Generate Hindi Greeting\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/greeting/generate`, {
      text: 'नमस्ते! हमारी सेवा में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?',
      name: 'Hindi Welcome'
    });
    
    console.log('✅ Success!');
    console.log('Greeting URL:', response.data.greeting.url);
    console.log('Greeting ID:', response.data.greeting.id);
    
    return response.data.greeting;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 3: Generate greeting with specific voice
async function example3_CustomVoice() {
  console.log('\n📝 Example 3: Generate Greeting with Male Voice\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/greeting/generate`, {
      text: 'Good morning! This is a test message with a male voice.',
      name: 'Male Voice Greeting',
      voiceId: 'pNInz6obpgDQGcFmaJgB' // Adam - Male voice
    });
    
    console.log('✅ Success!');
    console.log('Greeting URL:', response.data.greeting.url);
    console.log('Voice ID:', response.data.greeting.voiceId);
    
    return response.data.greeting;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 4: Generate and send greeting
async function example4_GenerateAndSend() {
  console.log('\n📝 Example 4: Generate and Send Greeting\n');
  
  try {
    // Step 1: Generate greeting
    console.log('Step 1: Generating greeting...');
    const generateResponse = await axios.post(`${BASE_URL}/greeting/generate`, {
      text: 'Hello! This is an automated greeting. Thank you for your call.',
      name: 'Automated Greeting'
    });
    
    const greeting = generateResponse.data.greeting;
    console.log('✅ Greeting generated:', greeting.id);
    
    // Step 2: Send greeting via call
    console.log('\nStep 2: Sending greeting via call...');
    const sendResponse = await axios.post(`${BASE_URL}/greeting/send`, {
      to: '+919876543210', // Replace with actual phone number
      greetingId: greeting.id
    });
    
    console.log('✅ Greeting sent!');
    console.log('Response:', sendResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 5: List all greetings
async function example5_ListGreetings() {
  console.log('\n📝 Example 5: List All Greetings\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/greeting/list`);
    
    console.log('✅ Success!');
    console.log(`Total greetings: ${response.data.count}`);
    
    response.data.greetings.forEach((greeting, index) => {
      console.log(`\n${index + 1}. ${greeting.filename}`);
      console.log(`   URL: ${greeting.url}`);
      console.log(`   Size: ${(greeting.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${new Date(greeting.createdAt).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 6: Complete workflow
async function example6_CompleteWorkflow() {
  console.log('\n📝 Example 6: Complete Workflow\n');
  console.log('This example demonstrates the complete workflow:\n');
  
  try {
    // 1. Generate greeting
    console.log('1️⃣ Generating greeting...');
    const greeting = await example1_SimpleGreeting();
    
    if (!greeting) {
      console.log('❌ Failed to generate greeting. Stopping workflow.');
      return;
    }
    
    // 2. Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. List all greetings
    console.log('\n2️⃣ Listing all greetings...');
    await example5_ListGreetings();
    
    // 4. Note about sending
    console.log('\n3️⃣ To send this greeting via call:');
    console.log(`   - Use greeting ID: ${greeting.id}`);
    console.log(`   - Or use greeting URL: ${greeting.url}`);
    console.log(`   - Configure Exotel app to play this URL`);
    
  } catch (error) {
    console.error('❌ Workflow error:', error.message);
  }
}

// Main menu
async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   ElevenLabs Greeting Integration - Examples      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  const example = process.argv[2] || 'all';
  
  switch (example) {
    case '1':
      await example1_SimpleGreeting();
      break;
    case '2':
      await example2_HindiGreeting();
      break;
    case '3':
      await example3_CustomVoice();
      break;
    case '4':
      await example4_GenerateAndSend();
      break;
    case '5':
      await example5_ListGreetings();
      break;
    case '6':
      await example6_CompleteWorkflow();
      break;
    case 'all':
      console.log('\n🚀 Running all examples...\n');
      await example1_SimpleGreeting();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await example2_HindiGreeting();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await example3_CustomVoice();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await example5_ListGreetings();
      break;
    default:
      console.log('\nUsage: node example-usage.js [example_number]');
      console.log('\nAvailable examples:');
      console.log('  1 - Simple English greeting');
      console.log('  2 - Hindi greeting');
      console.log('  3 - Custom voice greeting');
      console.log('  4 - Generate and send greeting');
      console.log('  5 - List all greetings');
      console.log('  6 - Complete workflow');
      console.log('  all - Run all examples (default)');
  }
  
  console.log('\n' + '═'.repeat(52));
  console.log('✅ Examples completed!\n');
}

// Run main function
main().catch(console.error);
