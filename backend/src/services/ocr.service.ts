// @ts-ignore
import Tesseract from 'tesseract.js';
// @ts-ignore
import pdfParse from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';
import fs from 'fs/promises';

export async function extractText(filePath: string, fileType: string): Promise<string> {
  switch (fileType) {
    case 'application/pdf':
      return await extractFromPDF(filePath);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await extractFromDOCX(filePath);
    case 'image/png':
    case 'image/jpeg':
      return await extractFromImage(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractFromPDF(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function extractFromDOCX(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractFromImage(filePath: string): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng+hin+mal+tam', {
    logger: m => console.log(m)
  });
  return text;
}
