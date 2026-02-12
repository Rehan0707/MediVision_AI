import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No key");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // Note: listModels is on the genAI instance? No, unfortunately the SDK might not expose listModels easily on the instance if it's not the latest version.
        // Actually, let's try to just use 'gemini-pro' and see if that works in a simple generation.

        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("gemini-pro works:", resultPro.response.text());

        console.log("Trying gemini-1.5-flash...");
        const resultFlash = await model.generateContent("Hello");
        console.log("gemini-1.5-flash works:", resultFlash.response.text());

    } catch (err: any) {
        console.error("Error:", err.message);
    }
};

run();
