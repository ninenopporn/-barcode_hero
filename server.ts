import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for AI Smart Product Barcode Assistant
  app.post('/api/ai/barcode', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'กรุณาระบุข้อมูลสินค้า' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'ไม่พบ GEMINI_API_KEY กรุณาตั้งค่าใน Settings > Secrets' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `คุณเป็นผู้ช่วยอัจฉริยะในการสร้างบาร์โค้ดและจัดการสินค้า 
จากคำอธิบายสินค้าต่อไปนี้: "${prompt}"
โปรดสร้างข้อมูลสินค้าที่เหมาะสมสำหรับการทำฉลากบาร์โค้ด โดยคืนค่าเป็น JSON ตาม Schema ที่กำหนด:
- productName: ชื่อสินค้าภาษาไทยและอังกฤษที่กระชับ
- skuOrCode: รหัสสินค้า (SKU) หรือตัวเลขบาร์โค้ดมาตรฐาน (เช่น รหัส EAN-13 13 หลัก หรือ Code 128)
- symbology: รูปแบบบาร์โค้ดที่เหมาะสมที่สุด (CODE128, EAN13, UPC, QR)
- price: ราคา (ตัวเลข)
- category: หมวดหมู่สินค้า
- description: คำอธิบายสั้นๆ 1 ประโยค`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              skuOrCode: { type: Type.STRING },
              symbology: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['productName', 'skuOrCode', 'symbology', 'price', 'category'],
          },
        },
      });

      const resultText = response.text || '{}';
      const data = JSON.parse(resultText);
      res.json(data);
    } catch (error: any) {
      console.error('Gemini AI Error:', error);
      res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการประมวลผล AI' });
    }
  });

  // Setup Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
