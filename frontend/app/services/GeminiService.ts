
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async generateInterviewDrill(topic: string = "General Software Engineering"): Promise<any> {
        const prompt = `Generate a communication drill for a software engineer interview. 
        Topic: ${topic}.
        Return ONLY valid JSON with this structure:
        {
            "theme": "string",
            "reading": [{"level": "Easy", "text": "string"}, {"level": "Medium", "text": "string"}, {"level": "Hard", "text": "string"}],
            "listening": ["string", "string", "string"],
            "extempore": {"topic": "string", "keyPoints": ["string", "string", "string", "string"]}
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
            return {
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
                }
            };
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
