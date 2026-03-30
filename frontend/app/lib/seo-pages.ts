export type SeoPageData = {
    title: string;
    subDescription: string;
    heroHeadline: string;
    heroHeadlineSpan: string;
    category: 'prep' | 'tools' | 'services' | 'company' | 'stack' | 'type';
    slug: string;
};

export const seoPages: Record<string, SeoPageData> = {
    // ----------------------------------------
    // CORE PLATFORM & ROLE PREP
    // ----------------------------------------
    'ai-interview-practice': {
        category: 'prep',
        slug: 'ai-interview-practice',
        title: '#1 AI Interview Practice & Real-Time Mock Interview Platform | Emble',
        heroHeadline: 'The Ultimate ',
        heroHeadlineSpan: 'AI Interview Practice',
        subDescription: 'Practice real, rigorous tech interviews with our state-of-the-art voice AI. Simulate exact interview environments, solve live coding problems, and get immediate, actionable feedback to guarantee your placement.',
    },
    'frontend-developer': {
        category: 'prep',
        slug: 'frontend-developer',
        title: 'Frontend Developer Mock Interviews | React, JS & UI Design',
        heroHeadline: 'Acing Your ',
        heroHeadlineSpan: 'Frontend Interviews',
        subDescription: 'Master your frontend interviews. Practice React, JavaScript internals, and UI system design with our Voice AI interviewer. Get real-time feedback and increase your offer rate.',
    },
    'backend-engineer': {
        category: 'prep',
        slug: 'backend-engineer',
        title: 'Backend Engineer System Design & Mock Interviews',
        heroHeadline: 'Acing Your ',
        heroHeadlineSpan: 'Backend Interviews',
        subDescription: 'Simulate deep technical backend interviews. Architect scalable systems, discuss database optimization, and practice Node/Python/Java with a 24/7 AI staff engineer.',
    },
    'data-scientist': {
        category: 'prep',
        slug: 'data-scientist',
        title: 'AI Mock Interviews for Data Scientists & ML Engineers',
        heroHeadline: 'Acing Your ',
        heroHeadlineSpan: 'Data Science Interviews',
        subDescription: 'Ace your Data Science interviews. Practice SQL, statistical modeling, and ML deployment scenarios with industry-standard AI mock interviews.',
    },
    'full-stack-developer': {
        category: 'prep',
        slug: 'full-stack-developer',
        title: 'Full Stack Developer Tech Interviews & Coding Exams',
        heroHeadline: 'Acing Your ',
        heroHeadlineSpan: 'Full Stack Interviews',
        subDescription: 'End-to-end full stack interview prep. From database schema design to React state management, simulate the exact technical interviews top companies use.',
    },
    'faang-interviews': {
        category: 'prep',
        slug: 'faang-interviews',
        title: 'FAANG Interview Preparation | Top Tech Mock Interviews',
        heroHeadline: 'Acing Your ',
        heroHeadlineSpan: 'FAANG Interviews',
        subDescription: 'Targeting Google, Meta, or Amazon? Train for rigorous DSA, behavioral, and system design rounds with AI trained on real MAANG interview questions.',
    },
    'campus-placements': {
        category: 'prep',
        slug: 'campus-placements',
        title: 'Campus Placement Preparation & Tech Interview Guide',
        heroHeadline: 'Acing Your ',
        heroHeadlineSpan: 'Campus Placements',
        subDescription: 'The ultimate toolkit for graduates. Improve your resume, practice company-specific test series, and beat the ATS to land your first software engineering role.',
    },

    // ----------------------------------------
    // COMPANY-SPECIFIC MOCK INTERVIEWS (High Volume Search Intent)
    // ----------------------------------------
    'google-mock-interview': {
        category: 'company',
        slug: 'google-mock-interview',
        title: 'Google Mock Interview Practice | DSA & System Design',
        heroHeadline: 'Simulate Your ',
        heroHeadlineSpan: 'Google Interview',
        subDescription: 'Prepare for Google\'s notoriously rigorous looping process. Test yourself on hard LC graphs, dynamic programming, and scalable backend system design.',
    },
    'amazon-leadership-principles-practice': {
        category: 'company',
        slug: 'amazon-leadership-principles-practice',
        title: 'Amazon Leadership Principles Mock Interview Practice AI',
        heroHeadline: 'Master Amazon\'s ',
        heroHeadlineSpan: 'Leadership Principles',
        subDescription: 'Amazon\'s behavioral bar is arguably the highest stringency round in big tech. Practice the STAR method strictly calibrated against their 16 unique leadership principles.',
    },
    'meta-engineering-interviews': {
        category: 'company',
        slug: 'meta-engineering-interviews',
        title: 'Meta Engineering Mock Interview | Speed & Scale Prep',
        heroHeadline: 'Pass The ',
        heroHeadlineSpan: 'Meta Engineer Loop',
        subDescription: 'Meta engineering candidates are judged on execution speed. Practice rapidly solving common coding patterns and architecting high-traffic monolithic architectures.',
    },
    'microsoft-dsa-prep': {
        category: 'company',
        slug: 'microsoft-dsa-prep',
        title: 'Microsoft DSA & Behavioral Mock Interview Simulator',
        heroHeadline: 'Prepare for ',
        heroHeadlineSpan: 'Microsoft Loop',
        subDescription: 'Practice object-oriented design and array/string manipulations perfectly tailored for Microsoft’s technical screening panels with AI feedback.',
    },
    'uber-system-design': {
        category: 'company',
        slug: 'uber-system-design',
        title: 'Uber System Design Interview Practice',
        heroHeadline: 'Crush the ',
        heroHeadlineSpan: 'Uber System Design',
        subDescription: 'Uber relies heavily on complex geographic distributed systems. Simulate architecting highly-concurrent mapping algorithms and supply-and-demand microservices.',
    },

    // ----------------------------------------
    // TECH STACK & LANGUAGE SPECIFIC INTERVIEWS
    // ----------------------------------------
    'react-js-interview-practice': {
        category: 'stack',
        slug: 'react-js-interview-practice',
        title: 'React.js Coding Interview Practice | Mock Tech Prep',
        heroHeadline: 'Ace Your ',
        heroHeadlineSpan: 'React.js Interview',
        subDescription: 'Dive deep into React hooks, reconciliation, concurrent mode, and complex state management tasks with our Frontend AI evaluator.',
    },
    'python-coding-interviews': {
        category: 'stack',
        slug: 'python-coding-interviews',
        title: 'Python Coding Interview Prep | Data & Backend',
        heroHeadline: 'Pass Your ',
        heroHeadlineSpan: 'Python Tech Round',
        subDescription: 'Be ready for Python specific questions regarding the GIL, decorators, list comprehensions, and data pipeline structuring.',
    },
    'java-backend-prep': {
        category: 'stack',
        slug: 'java-backend-prep',
        title: 'Java Backend Architect Interview Simulator',
        heroHeadline: 'Succeed in ',
        heroHeadlineSpan: 'Java Spring Boot Rounds',
        subDescription: 'Enterprise software relies on Java. Drill through multithreading, garbage collection, and Spring dependency injection architectures.',
    },
    'node-js-system-design': {
        category: 'stack',
        slug: 'node-js-system-design',
        title: 'Node.js Backend & API Design Mock Interviews',
        heroHeadline: 'Conquer Your ',
        heroHeadlineSpan: 'Node.js Interview',
        subDescription: 'Deep dive into V8 engine mechanics, event-loop blocking, and high-performance asynchronous API streaming.',
    },
    'sql-data-science-tests': {
        category: 'stack',
        slug: 'sql-data-science-tests',
        title: 'Advanced SQL Mock Interviews | Data Analyst & Data Science',
        heroHeadline: 'Nail Your ',
        heroHeadlineSpan: 'Advanced SQL Test',
        subDescription: 'Practice complex window functions, CTEs, optimized joins, and query execution planning for heavy datasets.',
    },

    // ----------------------------------------
    // INTERVIEW ROUND TYPES (The "How do I..." queries)
    // ----------------------------------------
    'system-design-interviews': {
        category: 'type',
        slug: 'system-design-interviews',
        title: 'System Design Mock Interviews | Scalable Architectures',
        heroHeadline: 'Dominate ',
        heroHeadlineSpan: 'System Design Rounds',
        subDescription: 'The defining factor for mid-to-senior engineering roles. Practice designing load balancers, database sharding, caching layers and message queues interactively.',
    },
    'behavioral-cultural-fit-prep': {
        category: 'type',
        slug: 'behavioral-cultural-fit-prep',
        title: 'Cultural Fit & Behavioral Interview Practice',
        heroHeadline: 'Perfect Your ',
        heroHeadlineSpan: 'Behavioral Fit',
        subDescription: 'Don\'t lose an offer because of weak soft skills. Run through conflict resolution, weakness explanations, and team collaboration scenarios.',
    },
    'object-oriented-design-mock': {
        category: 'type',
        slug: 'object-oriented-design-mock',
        title: 'Object-Oriented Design (OOD) Mock Interviews',
        heroHeadline: 'Master ',
        heroHeadlineSpan: 'OOD Interviews',
        subDescription: 'Simulate designing parking lots, library management systems, and abstract factory patterns rigorously with an AI senior architect.',
    },

    // ----------------------------------------
    // FREE TOOLS
    // ----------------------------------------
    'ats-resume-checker': {
        category: 'tools',
        slug: 'ats-resume-checker',
        title: 'Free ATS Resume Checker & Grader for Tech Roles',
        heroHeadline: 'Beat the ',
        heroHeadlineSpan: 'ATS Resume Scanners',
        subDescription: 'Don\'t get rejected by robots. Upload your resume to our AI-powered ATS checker. Get an instant score, formatting fixes, and keyword optimizations.',
    },
    'behavioral-mock-interviews': {
        category: 'tools',
        slug: 'behavioral-mock-interviews',
        title: 'Behavioral Mock Interviews | Practice STAR Method with AI',
        heroHeadline: 'Nail Your ',
        heroHeadlineSpan: 'Behavioral Interviews',
        subDescription: 'Nail the culture fit round. Practice leadership principles and behavioral questions using your voice, and get actionable feedback on your STAR method delivery.',
    },
    'dsa-interview-practice': {
        category: 'tools',
        slug: 'dsa-interview-practice',
        title: 'DSA Interview Practice | Live AI Coding Mentor',
        heroHeadline: 'Master Your ',
        heroHeadlineSpan: 'DSA Interviews',
        subDescription: 'Struggling with LeetCode? Share your screen and explain your thought process to an AI mentor that provides hints, not just answers, for Data Structures & Algorithms.',
    },

    // ----------------------------------------
    // PREMIUM SERVICES
    // ----------------------------------------
    'expert-mock-interviews': {
        category: 'services',
        slug: 'expert-mock-interviews',
        title: 'Book 1:1 Tech Mock Interviews with Industry Experts',
        heroHeadline: 'Book 1:1 ',
        heroHeadlineSpan: 'Expert Mock Interviews',
        subDescription: 'Combine our AI platform with real human insights. Book a live 1:1 mock interview with senior engineers from top tech companies for precise, actionable feedback.',
    }
};

export const getAllSeoPages = () => Object.values(seoPages);

export const getSeoPageBySlug = (slug: string): SeoPageData | undefined => {
    return seoPages[slug];
};
