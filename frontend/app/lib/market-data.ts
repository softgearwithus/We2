export interface JobTrend {
    id: string;
    role: string;
    demandGrowth: number; // percentage
    averageSalary: string;
    openingsGlobally: string;
    icon: string;
    color: string;
}

export interface TopLanguage {
    id: string;
    name: string;
    share: number; // percentage out of 100
    trending: 'up' | 'down' | 'stable';
    color: string;
}

export interface MarketInsight {
    id: string;
    title: string;
    description: string;
    impactLevel: 'High' | 'Medium' | 'Low';
    date: string;
}

export interface ProfileEnhancement {
    id: string;
    category: 'Skill' | 'Project' | 'Certification';
    title: string;
    rationale: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const MARKET_DATA = {
    globalStats: {
        totalActiveJobs: '3.2M+',
        newJobsToday: '12,450',
        remoteWorkPercentage: 35,
        averageHiringTime: '24 Days',
    },

    jobTrends: [
        {
            id: 'ai-eng',
            role: 'AI / Machine Learning Engineer',
            demandGrowth: 45,
            averageSalary: '$140k - $220k',
            openingsGlobally: '150k+',
            icon: 'brain',
            color: 'text-violet-500 bg-violet-50',
        },
        {
            id: 'fullstack',
            role: 'Full Stack Developer',
            demandGrowth: 12,
            averageSalary: '$110k - $160k',
            openingsGlobally: '450k+',
            icon: 'layers',
            color: 'text-emerald-500 bg-emerald-50',
        },
        {
            id: 'cloud',
            role: 'Cloud Architect',
            demandGrowth: 22,
            averageSalary: '$135k - $190k',
            openingsGlobally: '95k+',
            icon: 'cloud',
            color: 'text-sky-500 bg-sky-50',
        },
        {
            id: 'cyber',
            role: 'Cybersecurity Analyst',
            demandGrowth: 30,
            averageSalary: '$105k - $155k',
            openingsGlobally: '210k+',
            icon: 'shield',
            color: 'text-rose-500 bg-rose-50',
        }
    ] as JobTrend[],

    topLanguages: [
        { id: 'py', name: 'Python', share: 27, trending: 'up', color: 'bg-yellow-400' },
        { id: 'js', name: 'JavaScript', share: 22, trending: 'stable', color: 'bg-yellow-300' },
        { id: 'ts', name: 'TypeScript', share: 15, trending: 'up', color: 'bg-blue-500' },
        { id: 'java', name: 'Java', share: 11, trending: 'down', color: 'bg-orange-500' },
        { id: 'go', name: 'Go', share: 8, trending: 'up', color: 'bg-cyan-500' },
        { id: 'rs', name: 'Rust', share: 5, trending: 'up', color: 'bg-orange-700' },
        { id: 'other', name: 'Others', share: 12, trending: 'stable', color: 'bg-slate-300' }
    ] as TopLanguage[],

    insights: [
        {
            id: 'ins-1',
            title: 'Shift Towards AI-Augmented Development',
            description: 'Companies are increasingly looking for developers who can integrate LLMs (Large Language Models) into existing products rather than strictly building models from scratch.',
            impactLevel: 'High',
            date: 'Feb 2026',
        },
        {
            id: 'ins-2',
            title: 'The Rise of Platform Engineering',
            description: 'DevOps is evolving into Platform Engineering, focusing on creating internal developer portals to reduce cognitive load on product teams.',
            impactLevel: 'Medium',
            date: 'Jan 2026',
        },
        {
            id: 'ins-3',
            title: 'Return to Office vs. Remote Balancing',
            description: 'While full remote roles remain highly competitive, hybrid roles (2-3 days in office) are seeing a surge in geographic hubs.',
            impactLevel: 'Low',
            date: 'Jan 2026',
        }
    ] as MarketInsight[],

    enhancements: [
        {
            id: 'enh-1',
            category: 'Project',
            title: 'Build a RAG Application',
            rationale: 'Retrieval-Augmented Generation is the most requested practical AI skill. Adding a RAG pipeline to your portfolio directly addresses the "AI-Augmented" market trend.',
            difficulty: 'Intermediate',
        },
        {
            id: 'enh-2',
            category: 'Skill',
            title: 'Learn TypeScript deeply',
            rationale: 'TypeScript has become the default for massive enterprise applications. Being strongly typed reduces bugs and is increasingly a hard requirement over plain JavaScript.',
            difficulty: 'Beginner',
        },
        {
            id: 'enh-3',
            category: 'Certification',
            title: 'AWS Certified Solutions Architect',
            rationale: 'Validates your ability to design resilient, high-performing cloud architectures. Highly valued for Cloud & DevOps transitions.',
            difficulty: 'Advanced',
        }
    ] as ProfileEnhancement[]
};
