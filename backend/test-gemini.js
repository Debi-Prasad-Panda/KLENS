import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCfDLK5EvsJaIkBf-CcTRA05QnZVa-K54o';

async function testGemini() {
  try {
    console.log('Testing Gemini API connection...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Test with gemini-2.0-flash-exp
    console.log('\n1. Testing gemini-2.0-flash-exp...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await model.generateContent('Say hello');
      console.log('✅ gemini-2.0-flash-exp works!');
      console.log('Response:', result.response.text());
    } catch (err) {
      console.log('❌ gemini-2.0-flash-exp failed:', err.message);
    }

    // Test with gemini-1.5-flash
    console.log('\n2. Testing gemini-1.5-flash...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Say hello');
      console.log('✅ gemini-1.5-flash works!');
      console.log('Response:', result.response.text());
    } catch (err) {
      console.log('❌ gemini-1.5-flash failed:', err.message);
    }

    // Test with gemini-pro
    console.log('\n3. Testing gemini-pro...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Say hello');
      console.log('✅ gemini-pro works!');
      console.log('Response:', result.response.text());
    } catch (err) {
      console.log('❌ gemini-pro failed:', err.message);
    }

  } catch (error) {
    console.error('❌ API Key Error:', error.message);
  }
}

testGemini();
