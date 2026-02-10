import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeMedicalImage = async (imageBuffer: Buffer, mimeType: string, modality?: string, customPrompt?: string) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey.length < 10) {
            throw new Error('AI Analysis Unavailable: Valid Gemini API Key Required. System is currently in restricted mode.');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // ... (rest of prompt logic remains same)
        const defaultPrompt = `Analyze this medical scan image with clinical sovereignty and 99.9% anatomical precision. 
        You MUST return the result as a strictly valid JSON object. 

        Refrence Strict Anatomy Keys (Selection is Mandatory):
        - "brain": For all Cerebral, Cranial, or Neural MRI/CT scans.
        - "spine": For Cervical, Thoracic (spine-focused), Lumbar, or Sacral vertebrae.
        - "thorax": For Chest X-rays, Lung Parenchyma, Rib cage, or Clavicle scans.
        - "knee": For Patellar, Femoral-Tibial joint, or Meniscal imaging.
        - "hand": For Carpal, Metacarpal, Phalangeal, Wrist, or Finger scans.
        - "bone": For Long bones (Femur, Humerus), Pelvis, or general skeletal fractures not covered above.

        JSON Structure:
        {
            "detectedPart": "string (MUST be one of [brain, spine, thorax, knee, hand, bone])",
            "preciseAbnormality": "string (Specific clinical finding, e.g. 'Spiral Fracture', 'Consolidation', 'Glioma')",
            "preciseLocation": "string (Anatomical coordinate, e.g. 'Distal Radius', 'Right Middle Lobe', 'L4 Vertebra')",
            "findings": ["Detailed clinical observation 1", "Observation 2"],
            "recommendations": ["Protocol recommendation 1"],
            "summary": "1-sentence executive clinical summary",
            "confidence": number (0.00-1.00)
        }`;

        const prompt = customPrompt || defaultPrompt;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse clinical AI response. Raw output: ' + text);
    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        throw error;
    }
};

export const generateHealthNews = async (location: string) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey.length < 10) {
            return []; // No mock news, return empty to allow frontend to handle gracefully
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate 3 realistic breaking health news headlines and brief summaries for ${location}. 
        Focus on public health, medical tech, or local outbreaks/wellness trends appropriate for this region.
        
        Strict JSON Format:
        [
            {
                "id": "string (unique)",
                "title": "string (headline)",
                "source": "string (credible sounding local source)",
                "time": "string (e.g. '2h ago')",
                "category": "string (e.g. 'Outbreak', 'Policy', 'Tech')",
                "impact": "high" | "medium" | "low",
                "summary": "string"
            }
        ]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return [];
    } catch (error: any) {
        console.error('AI News Generation Error:', error);
        return [];
    }
};

export const explainLabReport = async (text: string) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey.length < 10) {
            throw new Error("Clinical Explanation Unavailable: Missing Gemini API Key.");
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Explain this lab report in plain English for a patient. Highlight any abnormalities and provide gentle suggestions.
      Lab Report Text: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Lab Explanation Error:', error);
        throw error;
    }
};
