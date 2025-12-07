import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCfDLK5EvsJaIkBf-CcTRA05QnZVa-K54o';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('Fetching available models...\n');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log('✅ Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
        console.log(`    Supported: ${model.supportedGenerationMethods?.join(', ')}`);
      });
    } else {
      console.log('❌ No models found or API key invalid');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
