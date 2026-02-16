import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();


dotenv.config({ path: process.env.ENV_PATH || undefined }); // Try to load .env if not loaded


// Lazy initialization helpers
const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    return new GoogleGenerativeAI(key);
};

const getOpenAI = () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.length < 10) throw new Error("OPENAI_API_KEY is not set or invalid");
    return new OpenAI({ apiKey: key });
};

// Helper for retrying with backoff
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries > 0 && (error.status === 429 || error.message.includes('429'))) {
            console.warn(`Rate limited. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryOperation(operation, retries - 1, delay * 2);
        }
        throw error;
    }
}

export const analyzeMedicalImage = async (imageBuffer: Buffer, mimeType: string, modality?: string, customPrompt?: string) => {

    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        console.log("DEBUG: AI Service analysis started");
        console.log("DEBUG: Gemini Key present:", !!geminiKey, "Length:", geminiKey?.length);
        console.log("DEBUG: OpenAI Key present:", !!openaiKey, "Length:", openaiKey?.length);


        const prompt = customPrompt || `Analyze this medical scan image with clinical sovereignty and 99.9% anatomical precision. 
        You MUST return the result as a strictly valid JSON object. 

        Refrence Strict Anatomy Keys (Selection is Mandatory):
        - "brain": For all Cerebral, Cranial, or Neural MRI/CT scans.
        - "spine": For Cervical, Thoracic (spine-focused), Lumbar, or Sacral vertebrae.
        - "thorax": For Chest X-rays, Lung Parenchyma, Rib cage, or Clavicle scans.
        - "knee": For Patellar, Femoral-Tibial joint, or Meniscal imaging.
        - "hand": For Carpal, Metacarpal, Phalangeal, Wrist, or Finger scans.
        - "leg": For Femur, Tibia, Fibula, or long bones of the lower extremity.
        - "bone": For general skeletal fractures or bones not specifically listed above (e.g., pelvis, arm).

        JSON Structure:
        {
            "detectedPart": "string (MUST be one of [brain, spine, thorax, knee, hand, leg, bone])",
            "preciseAbnormality": "string (Specific clinical finding, e.g. 'Spiral Fracture', 'Consolidation', 'Glioma')",
            "preciseLocation": "string (Anatomical coordinate, e.g. 'Distal Radius', 'Right Middle Lobe', 'L4 Vertebra')",
            "findings": ["Detailed clinical observation 1", "Observation 2"],
            "recommendations": ["Protocol recommendation 1"],
            "summary": "1-sentence executive clinical summary",
            "pinpoint2D": { "x": number, "y": number }, // Normalized 0-1 coordinates relative to image top-left
            "pinpoint3D": { "x": number, "y": number, "z": number }, // Local model coordinates (approx -2.0 to 2.0 range)
            "confidence": number (0.00-1.00)
        }`;


        // Try OpenAI First (Prioritized due to Gemini Quota issues)
        if (openaiKey && openaiKey.length > 10) {
            try {
                const response = await getOpenAI().chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a world-class radiologist. Always return JSON." },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: { url: `data:${mimeType};base64,${imageBuffer.toString('base64')}` }
                                }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" }
                });
                return JSON.parse(response.choices[0].message.content || '{}');
            } catch (err: any) {
                console.warn('OpenAI failed, trying Gemini...', err.message);
            }
        }

        // Try Gemini Fallback
        if (geminiKey && geminiKey !== 'PLACEHOLDER' && geminiKey.length > 10) {
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

            const result = await retryOperation(() => model.generateContent([
                prompt,
                { inlineData: { data: imageBuffer.toString('base64'), mimeType } }
            ]));

            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }

        throw new Error('AI Analysis Unavailable: No valid API keys found (Gemini/OpenAI).');
    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        throw error;
    }
};

export const generateHealthNews = async (location: string) => {
    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        const prompt = `Generate 3-5 brief, localized health news alerts for: ${location}.
        Focus on environmental health, disease outbreaks, or wellness tips relevant to the area/season.
        
        Return a strict JSON object with this structure:
        {
            "news": [
                {
                    "id": "unique-id",
                    "title": "Headline",
                    "source": "Source Name (e.g. Local Health Dept, WHO)",
                    "time": "Time ago (e.g. 2h ago)",
                    "category": "Category (e.g. Alert, Tip, Update)",
                    "impact": "high | medium | low",
                    "summary": "1-sentence summary"
                }
            ]
        }`;

        if (openaiKey && openaiKey.length > 10) {
            try {
                const response = await getOpenAI().chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a health news aggregator AI. Always return valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                });
                return JSON.parse(response.choices[0].message.content || '{"news": []}');
            } catch (err: any) {
                console.warn('OpenAI Health News failed, trying Gemini...', err.message);
            }
        }

        if (geminiKey && geminiKey !== 'PLACEHOLDER' && geminiKey.length > 10) {
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await retryOperation(() => model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }

        // Fallback mock data if AI fails or no key
        return {
            articles: [
                {
                    id: '1',
                    title: 'Seasonal Flu Advisory',
                    source: 'Health Ministry',
                    time: '1h ago',
                    category: 'Alert',
                    impact: 'medium',
                    summary: `Flu cases rising in ${location}. Vaccination recommended.`
                },
                {
                    id: '2',
                    title: 'Air Quality Update',
                    source: 'Environmental Dept',
                    time: '3h ago',
                    category: 'Update',
                    impact: 'low',
                    summary: `Air quality index in ${location} is moderate today.`
                }
            ]
        };

    } catch (error) {
        console.error("Health News Error:", error);
        return { news: [] };
    }
};

export const synthesizeClinicalNote = async (scanData: any, role: 'doctor' | 'patient') => {
    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        const prompt = role === 'doctor'
            ? `As a clinical AI assistant, draft a professional medical note for Doctor review. Scan type: ${scanData?.type || 'Unknown'}. Findings: ${(scanData?.analysis?.findings || []).join(', ') || 'None documented'}. Use clinical terminology.`
            : `As a patient care assistant, explain this medical scan in simple, comforting language. Scan: ${scanData?.type || 'Unknown'}. Findings: ${(scanData?.analysis?.findings || []).join(', ') || 'None'}. Use analogies, avoid jargon, be reassuring.`;


        if (openaiKey && openaiKey.length > 10) {
            try {
                const res = await getOpenAI().chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }]
                });
                return res.choices[0]?.message?.content || '';
            } catch (err: any) {
                console.warn('OpenAI failed, trying Gemini...', err.message);
            }
        }

        if (geminiKey && geminiKey !== 'PLACEHOLDER' && geminiKey.length > 10) {
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await retryOperation(() => model.generateContent(prompt));
            return (await result.response).text();
        }
        throw new Error('No AI API keys configured');
    } catch (err: any) {
        console.error('Synthesize note error:', err);
        throw err;
    }
};

export const explainLabReport = async (text: string) => {
    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        const prompt = `Explain this lab report in plain English for a patient. Highlight any abnormalities and provide gentle suggestions.
      Lab Report Text: ${text}`;


        if (openaiKey && openaiKey.length > 10) {
            try {
                const response = await getOpenAI().chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }]
                });
                return response.choices[0].message.content;
            } catch (err: any) {
                console.warn('OpenAI failed, trying Gemini...', err.message);
            }
        }

        if (geminiKey && geminiKey !== 'PLACEHOLDER' && geminiKey.length > 10) {
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

            const result = await retryOperation(() => model.generateContent(prompt));
            const response = await result.response;
            return response.text();
        }


        throw new Error("Clinical Explanation Unavailable: No valid API keys found.");
    } catch (error: any) {
        console.error('AI Lab Explanation Error:', error);

        throw error;
    }
};

export const analyzeECG = async (ecgData: any, samplingRate: number) => {
    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        const prompt = `Analyze this ECG data (sampled at ${samplingRate}Hz). 
        Identify rhythm, potential abnormalities (arrhythmias, ischemia, infarction, etc.), and provide a clinical summary.
        
        Data could be a CSV string, JSON array, or descriptive text.
        Data: ${typeof ecgData === 'string' ? ecgData.substring(0, 10000) : JSON.stringify(ecgData).substring(0, 10000)}... (truncated if too long)
        
        Return a strict JSON object:
        {
            "rhythm": "string (e.g. Normal Sinus Rhythm, Atrial Fibrillation)",
            "findings": ["finding 1", "finding 2"],
            "summary": "Clinical summary",
            "confidence": number (0.0-1.0)
        }`;

        // Try OpenAI First (if available) or as fallback
        if (openaiKey && openaiKey.length > 10) {
            try {
                const response = await getOpenAI().chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are an expert cardiologist AI. Always return valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                });
                return JSON.parse(response.choices[0].message.content || '{}');
            } catch (err: any) {
                console.warn('OpenAI ECG analysis failed, trying Gemini...', err.message);
            }
        }

        if (geminiKey && geminiKey !== 'PLACEHOLDER' && geminiKey.length > 10) {
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error("Failed to parse JSON from AI response");
        }

        throw new Error('ECG Analysis Unavailable: No valid API keys found (Gemini/OpenAI).');
    } catch (error: any) {
        console.warn('AI ECG Analysis Error (Using Fallback):', error.message);
        // Fallback Mock Data for Demo/Dev mode
        return {
            "rhythm": "Normal Sinus Rhythm",
            "findings": ["Regular rate and rhythm", "No ST-segment elevation", "Normal axis"],
            "summary": "The ECG shows a normal heart rhythm with no acute abnormalities detected. This is a simulated result.",
            "confidence": 0.95
        };
    }
};



export const chatWithAI = async (message: string, context?: any) => {
    try {
        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        console.log(`[ChatAI] Request received. Message length: ${message.length}`);
        console.log(`[ChatAI] OpenAI Key: ${!!openaiKey}, Gemini Key: ${!!geminiKey}`);

        let systemContext = `You are MediVision AI, a helpful medical assistant. Answer the user's health questions politely and clearly.`;
        if (context) {
            systemContext += `\n\nContext - Recent Scan Analysis:\nType: ${context.type}\nFindings: ${(context.analysis?.findings || []).join(', ')}\nSummary: ${context.analysis?.summary}`;
        }

        // Try OpenAI first (user requested due to Gemini quota)
        if (openaiKey && openaiKey.length > 10) {
            try {
                console.log("[ChatAI] Using OpenAI...");
                const response = await getOpenAI().chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemContext },
                        { role: "user", content: message }
                    ]
                });
                console.log("[ChatAI] OpenAI Success");
                return { reply: response.choices[0].message.content };
            } catch (openaiError: any) {
                console.error("[ChatAI] OpenAI Failed:", openaiError.message);
                // Continue to Gemini fallback
            }
        }

        // Fallback to Gemini
        if (geminiKey && geminiKey !== 'PLACEHOLDER' && geminiKey.length > 10) {
            console.log("[ChatAI] Falling back to Gemini...");
            const prompt = `${systemContext}\n\nUser: ${message}\nAI:`;
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await retryOperation(() => model.generateContent(prompt));
            const response = await result.response;
            return { reply: response.text() };
        }

        throw new Error("Chat Unavailable: No valid API keys found.");
    } catch (error: any) {
        console.error('Chat AI Error:', error);
        throw error;
    }
};
