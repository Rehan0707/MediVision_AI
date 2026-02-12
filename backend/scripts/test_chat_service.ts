
import dotenv from 'dotenv';
import path from 'path';
import { chatWithAI } from '../src/services/aiService';

// Load env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testChat = async () => {
    console.log("Testing Chat Service...");
    try {
        const response = await chatWithAI("Hello, are you using Gemini?");
        console.log("✅ Chat Response:", response.reply);
    } catch (error: any) {
        // Error is already logged in service
        console.error("❌ Chat Test Failed:", error.message);
    }
};

testChat();
