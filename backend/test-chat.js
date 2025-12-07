import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCfDLK5EvsJaIkBf-CcTRA05QnZVa-K54o';

async function testChat() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are K-LENS AI Assistant for industrial document management.'
    });

    const chat = model.startChat({
      history: []
    });

    console.log('Testing chat with gemini-2.5-flash...\n');
    
    const result = await chat.sendMessage('Hello, what can you help me with?');
    console.log('✅ Chat works!');
    console.log('Response:', result.response.text());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testChat();
