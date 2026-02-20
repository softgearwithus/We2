export type SkillforgeTrack = {
    id: string;
    name: string;
    topicId: string;
    description: string;
    audience: string;
    icon: string;
    color: string;
    bg: string;
    topics: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        bg: string;
    }>;
};

export const SKILLFORGE_TRACKS: SkillforgeTrack[] = [
    {
        id: 'programming',
        name: 'Programming Skills',
        topicId: 'programming-languages',
        description: 'Foundational programming mastery across languages.',
        audience: 'Beginners to advanced coders',
        icon: 'code',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        topics: [
            { id: 'python', name: 'Python', description: 'Core syntax, data structures, and scripting.', icon: 'python', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'javascript', name: 'JavaScript', description: 'Modern JS, DOM, and async patterns.', icon: 'javascript', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { id: 'java', name: 'Java', description: 'OOP mastery and backend fundamentals.', icon: 'java', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'cpp', name: 'C++', description: 'Performance, STL, and algorithmic depth.', icon: 'cpp', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'go', name: 'Go', description: 'Concurrency-friendly systems programming.', icon: 'go', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        ],
    },
    {
        id: 'technology',
        name: 'Full Stack Development',
        topicId: 'technology-stacks',
        description: 'Web platforms, backend services, and deployment.',
        audience: 'Full-stack engineers',
        icon: 'cpu',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        topics: [
            { id: 'html', name: 'HTML5', description: 'Semantic markup and structure.', icon: 'html', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'css', name: 'CSS3', description: 'Layouts, responsiveness, and theming.', icon: 'css', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'javascript', name: 'JavaScript', description: 'Web logic and interaction.', icon: 'javascript', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { id: 'typescript', name: 'TypeScript', description: 'Typed JavaScript for scale.', icon: 'typescript', color: 'text-blue-600', bg: 'bg-blue-600/10' },
            { id: 'react', name: 'React.js', description: 'Component architecture and state.', icon: 'react', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { id: 'next', name: 'Next.js', description: 'SSR, routing, and production builds.', icon: 'next', color: 'text-slate-600', bg: 'bg-slate-200/60' },
            { id: 'node', name: 'Node.js', description: 'APIs, services, and middleware.', icon: 'node', color: 'text-green-500', bg: 'bg-green-500/10' },
            { id: 'graphql', name: 'GraphQL', description: 'Flexible APIs and schemas.', icon: 'graphql', color: 'text-pink-500', bg: 'bg-pink-500/10' },
            { id: 'mongodb', name: 'MongoDB', description: 'NoSQL data modeling.', icon: 'mongodb', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'docker', name: 'Docker', description: 'Containers and deployment workflow.', icon: 'docker', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ],
    },
    {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        topicId: 'dsa-topics',
        description: 'Interview-focused algorithm training.',
        audience: 'Placement prep',
        icon: 'target',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        topics: [
            { id: 'arrays', name: 'Arrays & Strings', description: 'Fundamental patterns and sliding window.', icon: 'array', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'linkedlist', name: 'Linked Lists', description: 'Pointer mastery and operations.', icon: 'list', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'trees', name: 'Trees & Graphs', description: 'Traversals and graph algorithms.', icon: 'tree', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'dp', name: 'Dynamic Programming', description: 'Optimization patterns and recursion.', icon: 'dp', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        ],
    },
    {
        id: 'system-design',
        name: 'System Design',
        topicId: 'system-design-topics',
        description: 'Scalable architecture and trade-offs.',
        audience: 'Mid-level + senior roles',
        icon: 'layout',
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        topics: [
            { id: 'hld', name: 'High Level Design', description: 'Architecture patterns and scale.', icon: 'cloud', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'lld', name: 'Low Level Design', description: 'Class design and SOLID.', icon: 'cpu', color: 'text-slate-500', bg: 'bg-slate-200/60' },
        ],
    },
    {
        id: 'aptitude',
        name: 'Speed Aptitude',
        topicId: 'aptitude-topics',
        description: 'Quant, logical, and verbal strength.',
        audience: 'Campus tests',
        icon: 'calculator',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        topics: [
            { id: 'quant', name: 'Quantitative Aptitude', description: 'Numbers, algebra, and data.', icon: 'calculator', color: 'text-pink-500', bg: 'bg-pink-500/10' },
            { id: 'logical', name: 'Logical Reasoning', description: 'Patterns and decision logic.', icon: 'puzzle', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'verbal', name: 'Verbal Ability', description: 'Grammar, comprehension, vocab.', icon: 'book', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ],
    },
    {
        id: 'aiml',
        name: 'AI & Machine Learning',
        topicId: 'aiml-topics',
        description: 'Data-driven modeling and ML systems.',
        audience: 'Data + ML tracks',
        icon: 'brain',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        topics: [
            { id: 'python-ml', name: 'Python for ML', description: 'Numpy, Pandas, and ML stack.', icon: 'python', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'ml-basics', name: 'ML Fundamentals', description: 'Supervised + unsupervised.', icon: 'chart', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'deep-learning', name: 'Deep Learning', description: 'Neural nets, CNNs, RNNs.', icon: 'cpu', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        ],
    },
    {
        id: 'datascience',
        name: 'Data Science',
        topicId: 'datascience-topics',
        description: 'Analytics, SQL, and visualization.',
        audience: 'Analytics roles',
        icon: 'database',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        topics: [
            { id: 'sql', name: 'SQL & Databases', description: 'Queries, joins, and modeling.', icon: 'database', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'pandas', name: 'Pandas & Visualization', description: 'Data wrangling and visuals.', icon: 'chart', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'stats', name: 'Statistics', description: 'Probability and distributions.', icon: 'math', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ],
    },
    {
        id: 'blockchain',
        name: 'Web3 & Blockchain',
        topicId: 'blockchain-topics',
        description: 'Smart contracts and decentralized apps.',
        audience: 'Web3 builders',
        icon: 'bitcoin',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        topics: [
            { id: 'crypto', name: 'Crypto Basics', description: 'Consensus and security.', icon: 'bitcoin', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'solidity', name: 'Solidity', description: 'Smart contracts engineering.', icon: 'code', color: 'text-slate-600', bg: 'bg-slate-200/60' },
            { id: 'web3js', name: 'Web3.js', description: 'Integrate wallets and chains.', icon: 'globe', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ],
    },
    {
        id: 'tools',
        name: 'Developer Tools',
        topicId: 'tools-topics',
        description: 'Productivity tools for developers.',
        audience: 'All engineers',
        icon: 'terminal',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        topics: [
            { id: 'git', name: 'Git & GitHub', description: 'Branching, PRs, workflows.', icon: 'git', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'linux', name: 'Linux', description: 'CLI productivity and shell.', icon: 'terminal', color: 'text-slate-600', bg: 'bg-slate-200/60' },
            { id: 'vscode', name: 'VS Code', description: 'Speed up dev workflows.', icon: 'code', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ],
    },
    {
        id: 'core',
        name: 'CS Fundamentals',
        topicId: 'core-topics',
        description: 'OS, DBMS, and Networking.',
        audience: 'Interview essentials',
        icon: 'book',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        topics: [
            { id: 'os', name: 'Operating Systems', description: 'Processes, memory, scheduling.', icon: 'cpu', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'dbms', name: 'DBMS', description: 'Transactions and normalization.', icon: 'database', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'cn', name: 'Computer Networks', description: 'HTTP, TCP/IP, and DNS.', icon: 'network', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ],
    },
    {
        id: 'hr',
        name: 'Behavioral Skills',
        topicId: 'hr-topics',
        description: 'Communication and leadership.',
        audience: 'Interviews + growth',
        icon: 'users',
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        topics: [
            { id: 'comm', name: 'Communication', description: 'Speaking with clarity and impact.', icon: 'message', color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { id: 'leadership', name: 'Leadership', description: 'Ownership and influence.', icon: 'users', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'resume', name: 'Resume Prep', description: 'Portfolio and storytelling.', icon: 'file', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ],
    },
];
