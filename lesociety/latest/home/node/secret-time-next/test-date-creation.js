#!/usr/bin/env node

/**
 * Test script to verify the date creation fix for female users
 * This script simulates the date creation process and checks for gender-related validation issues
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TEST_USER_TOKEN = 'test_token_for_female_user';

// Mock female user data
const mockFemaleUser = {
  user_name: 'test_female_user',
  gender: 'female',
  age: 28,
  country_code: 'US',
  country: 'United States',
  images: ['https://example.com/image1.jpg'],
  token: TEST_USER_TOKEN
};

// Mock date creation payload
const mockDatePayload = {
  user_name: mockFemaleUser.user_name,
  location: 'New York',
  province: 'NY',
  country: mockFemaleUser.country,
  country_code: mockFemaleUser.country_code,
  date_length: '2-3 hours',
  price: 100,
  date_details: 'A lovely evening date in the city',
  image_index: 0,
  date_status: true,
  gender: mockFemaleUser.gender,
  standard_class_date: 'Evening Date'
};

async function testDateCreation() {
  console.log('🧪 Testing date creation for female user...');
  console.log('User:', mockFemaleUser);
  console.log('Date payload:', mockDatePayload);
  
  try {
    // Test 1: Check if gender validation works
    console.log('\n📋 Test 1: Gender validation');
    const genderValidationResponse = await axios.post(
      `${API_BASE_URL}/api/v1/date`,
      { ...mockDatePayload, gender: 'invalid_gender' },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('❌ Gender validation should have failed but didn\'t');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('gender')) {
      console.log('✅ Gender validation working correctly');
    } else {
      console.log('⚠️  Unexpected error in gender validation:', error.response?.data?.message);
    }
  }

  try {
    // Test 2: Check if female user can create date with valid gender
    console.log('\n📋 Test 2: Female user date creation');
    const dateCreationResponse = await axios.post(
      `${API_BASE_URL}/api/v1/date`,
      mockDatePayload,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (dateCreationResponse.status === 201) {
      console.log('✅ Female user date creation successful');
      console.log('Response:', dateCreationResponse.data);
      return true;
    } else {
      console.log('❌ Date creation failed with status:', dateCreationResponse.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Date creation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCountryValidation() {
  console.log('\n🧪 Testing country validation for female users...');
  
  try {
    // Test 3: Check if female users can select any country
    console.log('\n📋 Test 3: Female user country selection');
    const countryTestPayload = {
      ...mockDatePayload,
      country_code: 'CA', // Different country
      country: 'Canada'
    };
    
    const countryResponse = await axios.get(
      `${API_BASE_URL}/api/v1/date`,
      {
        params: {
          user_name: mockFemaleUser.user_name,
          country_code: 'CA',
          current_page: 1,
          per_page: 10
        },
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`
        }
      }
    );
    
    console.log('✅ Female user can access dates from different countries');
    return true;
  } catch (error) {
    console.log('❌ Country validation test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting date creation validation tests...\n');
  
  const test1Result = await testDateCreation();
  const test2Result = await testCountryValidation();
  
  console.log('\n📊 Test Results:');
  console.log(`Date Creation Test: ${test1Result ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Country Validation Test: ${test2Result ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (test1Result && test2Result) {
    console.log('\n🎉 All tests passed! The fix appears to be working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDateCreation, testCountryValidation };