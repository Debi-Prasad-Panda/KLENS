import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const chatController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const context = conversationHistory?.map((msg: any) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n') || '';

      const prompt = `You are K-LENS AI Assistant for industrial document management and IoT monitoring.

${context ? `Previous:\n${context}\n\n` : ''}User: ${message}

Response:`;

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      res.json({
        message: response,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Chat error:', error?.message || error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
};
