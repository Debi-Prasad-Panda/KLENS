import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeDocument(text: string, role: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompts = {
    engineer: `Analyze this technical document and extract: equipment specs, error codes, maintenance procedures, part numbers. Document: ${text}`,
    manager: `Analyze this document for business impact: ROI, risks, deadlines, resource requirements, revenue impact. Document: ${text}`,
    safety_officer: `Analyze this document for compliance: identify regulations, safety violations, missing certifications, risk factors. Document: ${text}`,
    admin: `Provide a comprehensive summary of this document including key points, action items, and stakeholders. Document: ${text}`
  };

  const result = await model.generateContent(prompts[role as keyof typeof prompts] || prompts.admin);
  return result.response.text();
}

export async function detectRisks(text: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `Identify all safety risks, compliance violations, and operational hazards in this document. Return as JSON array of strings. Document: ${text}`;
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response);
  } catch {
    return response.split('\n').filter(line => line.trim());
  }
}

export async function checkCompliance(text: string): Promise<{ regulation: string; status: string; details: string }[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `Check this document against Factory Act 1948, Boiler Regulations 2017, and Railway Safety Standards. Return JSON array with {regulation, status: "compliant"|"violation"|"missing", details}. Document: ${text}`;
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const result = await model.generateContent(`Translate to ${targetLang}: ${text}`);
  return result.response.text();
}
