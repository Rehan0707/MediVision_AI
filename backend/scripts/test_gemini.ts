import * as aiService from '../src/services/aiService';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const runTest = async () => {
    console.log("Testing Gemini API integration...");

    // Check Key
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        process.exit(1);
    } else {
        console.log("✅ GEMINI_API_KEY found:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
    }

    // Test ECG Analysis
    console.log("\nTesting ECG Analysis...");
    try {
        const dummyECG = "0.5,0.6,0.7,0.8,0.5,0.2,0.1,0.2,0.5,0.8"; // Dummy data
        const result = await aiService.analyzeECG(dummyECG, 500);
        console.log("✅ ECG Analysis Result:", JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error("❌ ECG Analysis Failed:", error.message);
    }

    // Test Image Analysis (Mock buffer)
    // We can skip actual image analysis test if ECG works, as they use the same key/logic. 
    // But let's try a text-only report explanation to be sure.

    console.log("\nTesting Lab Report Explanation...");
    try {

        const result = await aiService.explainLabReport("Hemoglobin: 12.5 g/dL (Normal: 13.0-17.0)");
        if (result) {
            console.log("✅ Lab Report Explanation:", result.substring(0, 100) + "...");
        } else {
            console.error("❌ Lab Report Explanation returned null/undefined");
        }

    } catch (error: any) {
        console.error("❌ Lab Report Explanation Failed:", error.message);
    }
};

runTest();
