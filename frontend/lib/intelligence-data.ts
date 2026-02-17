export type Category = 'AI_NEWS' | 'PLACEMENT_TRENDS' | 'SKILL_INSIGHTS' | 'EDITORIAL' | 'DAILY_GROWTH';

export interface ContentItem {
    id: string;
    title: string;
    summary: string;
    category: Category;
    readTime: string; // e.g., "3 min read"
    date: string;
    imageUrl?: string;
    impactTag: 'High Priority' | 'Skill Boost' | 'Career Growth' | 'Trending';
    relevanceScore: number; // 0-100
    deepKnowledge?: {
        introduction: string;
        keyPoints: string[];
        technicalDetails?: string;
        whatNext: string[];
    };
    skillsMapped?: string[];
}

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
    { id: 'AI_NEWS', label: 'AI & Tech', color: 'bg-blue-500' },
    { id: 'PLACEMENT_TRENDS', label: 'Hiring Trends', color: 'bg-green-500' },
    { id: 'SKILL_INSIGHTS', label: 'Skill Demand', color: 'bg-purple-500' },
    { id: 'EDITORIAL', label: 'Career Strategy', color: 'bg-orange-500' },
    { id: 'DAILY_GROWTH', label: 'Daily Growth', color: 'bg-pink-500' },
];

export const MOCK_CONTENT: ContentItem[] = [
    {
        id: '1',
        title: 'The Rise of Agentic AI in Software Development',
        summary: 'How autonomous AI agents are changing the role of junior developers and what you need to learn to stay relevant.',
        category: 'AI_NEWS',
        readTime: '4 min read',
        date: '2026-02-17',
        impactTag: 'High Priority',
        relevanceScore: 95,
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
        deepKnowledge: {
            introduction: 'Agentic AI is moving beyond simple code completion. Tools like Devin and others are now capable of handling entire tasks. This shifts the demand from syntax knowledge to system design and problem decomposition.',
            keyPoints: [
                'Shift from "Writing Code" to "Reviewing & Architecting"',
                'Importance of debugging AI-generated code',
                'Rise of "AI Engineer" as a distinct role'
            ],
            whatNext: [
                'Learn to build with LLM APIs (LangChain, Vercel AI SDK)',
                'Focus on System Design fundamentals',
                'Practice code review on open source projects'
            ],
        },
        skillsMapped: ['System Design', 'AI Engineering', 'Code Review'],
    },
    {
        id: '2',
        title: 'Hiring Freeze Thawing: Servic-Based Companies Hiring Again',
        summary: 'Major service-based IT companies are resuming freshers hiring specifically for cloud and data roles.',
        category: 'PLACEMENT_TRENDS',
        readTime: '3 min read',
        date: '2026-02-16',
        impactTag: 'Trending',
        relevanceScore: 88,
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000',
        deepKnowledge: {
            introduction: 'After a prolonged slowdown, data suggests a 15% uptick in hiring intent from TCS, Infosys, and others for Q2 2026, driven by new cloud migration contracts.',
            keyPoints: [
                'Focus on Azure and AWS certifications',
                'Data Engineering roles are seeing the highest volume',
                'Lower demand for pure manual testing roles'
            ],
            whatNext: [
                'Get an AWS Cloud Practitioner certification',
                'Refresh SQL and Python skills',
                'Update resume to highlight any cloud projects'
            ],
        },
        skillsMapped: ['AWS', 'Azure', 'SQL', 'Data Engineering'],
    },
    {
        id: '3',
        title: 'Why Rust is Becoming Essential for Backend Roles',
        summary: 'Performance-critical applications are migrating to Rust. See why adding it to your resume can boost your shortlist chances.',
        category: 'SKILL_INSIGHTS',
        readTime: '5 min read',
        date: '2026-02-15',
        impactTag: 'Skill Boost',
        relevanceScore: 75,
        imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=1000',
        deepKnowledge: {
            introduction: 'Rust has been voted the most loved language for 10 years. Now, it is entering the mainstream enterprise backend space, replacing C++ and even Go in some high-throughput scenarios.',
            keyPoints: [
                'Memory safety without garbage collection',
                'Adoption by Microsoft, Google, and AWS',
                'High salary premium for Rust developers'
            ],
            whatNext: [
                'Build a simple CLI tool in Rust',
                'Read "The Rust Programming Language" book',
                'Contrast Rust memory model with Java/Python'
            ],
        },
        skillsMapped: ['Rust', 'Backend', 'Memory Management'],
    },
    {
        id: '4',
        title: 'Overcoming "Imposter Syndrome" Before Your First Interview',
        summary: 'Feeling like you don\'t know enough? You are not alone. Here are psychological tricks to boost confidence.',
        category: 'DAILY_GROWTH',
        readTime: '3 min read',
        date: '2026-02-17',
        impactTag: 'Career Growth',
        relevanceScore: 100,
        deepKnowledge: {
            introduction: '70% of high-achieving individuals experience imposter syndrome. It is actually a sign that you are challenging yourself.',
            keyPoints: [
                'Document your small wins daily',
                'Visualize the interview as a conversation, not an interrogation',
                'Focus on "I can learn" rather than "I know"'
            ],
            whatNext: [
                'Start a "Brag Document" of your achievements',
                'Practice mock interviews with peers',
                'Do a 5-minute power pose before study sessions'
            ],
        },
    },
    {
        id: '5',
        title: 'Top 5 Resume Mistaeks That Get You Rejected by ATS',
        summary: 'Avoid these common formatting and keyword errors to ensure your resume actually reaches a human recruiter.',
        category: 'EDITORIAL',
        readTime: '6 min read',
        date: '2026-02-14',
        impactTag: 'High Priority',
        relevanceScore: 92,
        deepKnowledge: {
            introduction: 'Applicant Tracking Systems (ATS) reject 75% of resumes before a human sees them. The biggest culprit is often simple formatting issues.',
            keyPoints: [
                'Using columns or text boxes (ATS can\'t read them)',
                'Missing standard section headers',
                'Keyword stuffing (making it unreadable for humans)'
            ],
            whatNext: [
                'Use a single-column layout',
                'Scan your resume with our Synapse ATS tool',
                'Quantify your impact (e.g., "Improved speed by 20%")'
            ],
        },
        skillsMapped: ['Resume Writing', 'Soft Skills'],
    }
];

export const DAILY_STREAK_FACTS = [
    "Did you know? Consistent learners are 40% more likely to crack FAANG interviews.",
    "Streak tip: Reading just one article a day keeps your industry awareness in the top 10%.",
    "Fact: 85% of jobs are filled via networking and internal referrals. Stay informed!",
];
