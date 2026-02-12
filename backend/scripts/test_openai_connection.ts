
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testOpenAI = async () => {
    console.log("Testing OpenAI Connection...");

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        console.error("❌ OPENAI_API_KEY is missing in process.env");
        return;
    }

    console.log(`✅ API Key found (starts with: ${key.substring(0, 8)}...)`);

    const openai = new OpenAI({ apiKey: key });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello, are you working?" }],
        });
        console.log("✅ OpenAI Response:", response.choices[0].message.content);
    } catch (error: any) {
        console.error("❌ OpenAI API Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
};

testOpenAI();
