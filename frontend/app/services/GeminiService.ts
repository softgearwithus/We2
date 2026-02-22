
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async generateInterviewDrill(topic: string = "Computer Science and Software Engineering"): Promise<any> {
        const fallbackData = {
            theme: "Client Technical Interface (Fallback)",
            reading: [
                {
                    level: "Easy",
                    text: "Effective communication is the bridge between confusion and clarity. In technical roles, it is not enough to just write good code; one must also explain the logic behind it to stakeholders who may not context."
                },
                {
                    level: "Medium",
                    text: "When architecting distributed systems, we must consider the trade-offs between consistency and availability as described by the CAP theorem. A robust system design anticipates failure and implements redundancy to ensure uninterrupted service delivery."
                },
                {
                    level: "Hard",
                    text: "Idempotency is a critical property in API design, ensuring that multiple identical requests yield the same result as a single request. This prevents unintended side effects, such as duplicate payments or database entries, particularly in eventual consistency models."
                }
            ],
            listening: [
                "The deployment pipeline failed due to a missing environment variable.",
                "Please optimize the database query to reduce latency below 200 milliseconds.",
                "We need to implement rate limiting to prevent API abuse from external clients."
            ],
            extempore: {
                topic: "Explain the concept of 'Technical Debt' to a non-technical project manager.",
                keyPoints: [
                    "Metaphor of financial debt (interest)",
                    "Short-term speed vs Long-term maintenance",
                    "Necessity of refactoring",
                    "Impact on future feature delivery"
                ]
            },
            technical: [
                { title: "Introduction", prompt: "Please introduce yourself, including your name, current designation, and your background in computer science." },
                { title: "Core CS Concepts", prompt: "Explain the difference between an Array and a Linked List. What are the time complexities for searching and inserting in both?" },
                { title: "Architecture & Design", prompt: "Design a scalable rate limiter for a public API. What distributed storage would you use and why?" },
                { title: "Problem Solving Experience", prompt: "Describe a complex logic problem you solved in the past. How did you approach it and handle edge cases?" }
            ]
        };

        if (this.apiKey === 'mock-key') {
            console.warn("No valid Gemini API key found. Skipping API call and using fallback mock data.");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return fallbackData;
        }

        const prompt = `Generate a communication drill for a software engineer interview. 
        Topic: ${topic}.
        Return ONLY valid JSON with this structure:
        {
            "theme": "string",
            "reading": [{"level": "Easy", "text": "string"}, {"level": "Medium", "text": "string"}, {"level": "Hard", "text": "string"}],
            "listening": ["string", "string", "string"],
            "extempore": {"topic": "string", "keyPoints": ["string", "string", "string", "string"]},
            "technical": [
                { "title": "Introduction", "prompt": "Please introduce yourself, including your name, current designation, and your background in computer science." },
                { "title": "Core CS Concepts", "prompt": "string (A technical question about core CS fundamentals, e.g. Data Structures, Algorithms, or OS)" },
                { "title": "Architecture & Design", "prompt": "string (A system design or architecture scenario question)" },
                { "title": "Problem Solving Experience", "prompt": "string (A behavioral-technical question asking about a complex logic problem they solved)" }
            ]
        }
        Do not include markdown formatting like \`\`\`json. just raw json.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // simple cleanup if model returns markdown
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini API Error, falling back to mock:", error);
            // Fallback mock data
            return fallbackData;
        }
    }
}

let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = async (): Promise<GeminiService> => {
    if (!geminiServiceInstance) {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'mock-key';
        geminiServiceInstance = new GeminiService(apiKey);
    }
    return geminiServiceInstance;
};
