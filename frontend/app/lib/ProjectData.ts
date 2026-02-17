import {
    Layout, Server, Smartphone, Brain, Cloud, Globe, Code2,
    Database, Box, Link2, Gamepad2, Settings, Terminal, Shield, Zap, Layers,
    Monitor, Cpu, HardDrive, Wifi, PenTool, Hash, FileCode, Command, Table
} from 'lucide-react';

export interface ProjectTask {
    id: string;
    title: string;
    status: 'pending' | 'completed';
}

export interface ProjectReadme {
    problem: string;
    solution: string;
    features: string[];
    outcomes: string[];
}

export interface ProjectDetails {
    frontend?: string;
    backend?: string;
    database?: string;
    architecture?: string;
    prerequisites: string[];
    tools: string[];
    resources: { title: string; url: string; type: 'docs' | 'design' | 'guide' | 'video' }[];
}

export interface ProjectType {
    id: string;
    title: string;
    description: string;
    complexity: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    skills: string[];
    tags: string[];
    completionPercentage?: number;
    tasks: ProjectTask[];
    readme: ProjectReadme;
    details: ProjectDetails;
}

export interface TechStackTiers {
    beginner: ProjectType[];
    intermediate: ProjectType[];
    advanced: ProjectType[];
}

export interface TechStack {
    id: string;
    name: string;
    icon: any;
    description: string;
    popularity: number;
    difficulty: 'Low' | 'Medium' | 'High';
    tiers: TechStackTiers;
}

export interface DomainType {
    id: string;
    title: string;
    icon: any;
    description: string;
    whyChoose?: string;
    avgSalary?: string;
    popularApps?: string[];
    stacks: TechStack[];
}

// --- Helper ---
const createProject = (
    id: string,
    title: string,
    desc: string,
    complexity: 'Beginner' | 'Intermediate' | 'Advanced',
    time: string,
    skills: string[],
    tags: string[],
    details: Omit<ProjectDetails, 'resources'> & { resources?: { title: string; url: string; type: 'docs' | 'design' | 'guide' | 'video' }[] }
): ProjectType => ({
    id,
    title,
    description: desc,
    complexity,
    estimatedTime: time,
    skills,
    tags,
    tasks: [
        { id: 't1', title: 'Setup Development Environment', status: 'pending' },
        { id: 't2', title: 'Initialize Project Structure', status: 'pending' },
        { id: 't3', title: 'Implement Core Features', status: 'pending' },
        { id: 't4', title: 'Testing & Polish', status: 'pending' }
    ],
    readme: {
        problem: `In the real world, developers need to build solutions like a ${title} to solve specific user needs.`,
        solution: `This project guides you through building a ${complexity.toLowerCase()} level ${title} using ${skills[0]}.`,
        features: ['Responsive & Interactive UI', 'Efficient Data Handling', 'Best Practice Architecture', 'Error Handling'],
        outcomes: [`Mastery of ${skills.join(', ')}`, 'Understanding of project lifecycle', 'Portfolio-ready asset']
    },
    details: {
        ...details,
        resources: details.resources || [
            { title: 'Official Documentation', url: '#', type: 'docs' },
            { title: 'Project Guide', url: '#', type: 'guide' }
        ]
    }
});


export const PROJECT_DOMAINS: DomainType[] = [
    {
        id: 'web_fundamentals',
        title: 'Web Fundamentals',
        icon: FileCode,
        description: 'The foundation of the web. Start here.',
        whyChoose: 'Essential for every web developer. Universally used.',
        avgSalary: '₹ 3-6 LPA',
        popularApps: ['All Websites'],
        stacks: [
            {
                id: 'html_css',
                name: 'HTML & CSS',
                icon: Layout,
                description: 'Structure & Style.',
                popularity: 100,
                difficulty: 'Low',
                tiers: {
                    beginner: [createProject('fund-html-1', 'Personal Resume', 'A digital resume.', 'Beginner', '3 Hours', ['HTML5', 'CSS3'], ['Portfolio'], { frontend: 'HTML/CSS', prerequisites: ['None'], tools: ['VS Code'] })],
                    intermediate: [createProject('fund-html-2', 'Landing Page', 'Product landing page.', 'Intermediate', '8 Hours', ['Flexbox', 'Grid'], ['Marketing'], { frontend: 'HTML/CSS', prerequisites: ['Basic HTML'], tools: ['VS Code', 'Chrome DevTools'] })],
                    advanced: [createProject('fund-html-3', 'CSS Animations', 'Complex animations.', 'Advanced', '15 Hours', ['Keyframes', 'Transform'], ['Creative'], { frontend: 'Advanced CSS', prerequisites: ['CSS Basics'], tools: ['VS Code'] })]
                }
            },
            {
                id: 'javascript',
                name: 'JavaScript',
                icon: Code2,
                description: 'Web Logic.',
                popularity: 100,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('fund-js-1', 'Digital Clock', 'Live time display.', 'Beginner', '2 Hours', ['Date Object', 'DOM'], ['Utility'], { frontend: 'Vanilla JS', prerequisites: ['HTML/CSS'], tools: ['Browser Console'] })],
                    intermediate: [createProject('fund-js-2', 'Weather App', 'Fetch API usage.', 'Intermediate', '10 Hours', ['Fetch API', 'Promises'], ['API'], { frontend: 'JS + HTML/CSS', backend: 'OpenWeatherMap API', prerequisites: ['Basic JS'], tools: ['VS Code'] })],
                    advanced: [createProject('fund-js-3', 'Vanilla SPA', 'Single Page App framework.', 'Advanced', '30 Hours', ['History API', 'Classes'], ['Architecture'], { frontend: 'Vanilla JS', architecture: 'MVC', prerequisites: ['Intermediate JS'], tools: ['VS Code'] })]
                }
            }
        ]
    },
    {
        id: 'frontend',
        title: 'Frontend Development',
        icon: Layout,
        description: 'Build interactive UIs.',
        whyChoose: 'Visual feedback, high demand, creative.',
        avgSalary: '₹ 5-18 LPA',
        popularApps: ['Instagram', 'Netflix'],
        stacks: [
            {
                id: 'react',
                name: 'React.js',
                icon: Globe,
                description: 'The standard lib.',
                popularity: 98,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('fe-react-1', 'Todo List', 'State management basics.', 'Beginner', '5 Hours', ['Hooks', 'State'], ['Productivity'], { frontend: 'React', tools: ['Vite'], prerequisites: ['One week of JS'] })],
                    intermediate: [createProject('fe-react-2', 'Movie DB', 'Search movies via API.', 'Intermediate', '15 Hours', ['Context API', 'Axios'], ['Media'], { frontend: 'React + Tailwind', backend: 'TMDB API', tools: ['Postman'], prerequisites: ['React Basics'] })],
                    advanced: [createProject('fe-react-3', 'E-commerce', 'Full shop w/ cart.', 'Advanced', '40 Hours', ['Redux', 'Stripe'], ['Commerce'], { frontend: 'React', backend: 'Mock API/Firebase', architecture: 'Component-Based', tools: ['Redux DevTools'], prerequisites: ['React Context'] })]
                }
            },
            {
                id: 'angular',
                name: 'Angular',
                icon: Box,
                description: 'Battery-included framework.',
                popularity: 85,
                difficulty: 'High',
                tiers: {
                    beginner: [createProject('fe-ang-1', 'Task Tracker', 'Basic CRUD.', 'Beginner', '8 Hours', ['Components', 'Services'], ['Tool'], { frontend: 'Angular', tools: ['Angular CLI'], prerequisites: ['TypeScript'] })],
                    intermediate: [createProject('fe-ang-2', 'Dashboard', 'Admin interface.', 'Intermediate', '20 Hours', ['RxJS', 'Material UI'], ['Business'], { frontend: 'Angular Material', tools: ['Angular CLI'], prerequisites: ['Angular Basics'] })],
                    advanced: [createProject('fe-ang-3', 'CRM System', 'Complex forms & state.', 'Advanced', '50 Hours', ['NgRx', 'Guards'], ['Enterprise'], { frontend: 'Angular', architecture: 'Module-based', tools: ['Redux DevTools'], prerequisites: ['RxJS'] })]
                }
            },
            {
                id: 'nextjs',
                name: 'Next.js',
                icon: Zap,
                description: 'Production React.',
                popularity: 95,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('fe-next-1', 'Blog', 'SSG Blog.', 'Beginner', '6 Hours', ['SSG', 'Markdown'], ['Content'], { frontend: 'Next.js', tools: ['Vercel'], prerequisites: ['React'] })],
                    intermediate: [createProject('fe-next-2', 'Job Board', 'SSR Listings.', 'Intermediate', '18 Hours', ['SSR', 'API Routes'], ['Platform'], { frontend: 'Next.js + Tailwind', backend: 'Next API', database: 'MongoDB', tools: ['Vercel'], prerequisites: ['React Hooks'] })],
                    advanced: [createProject('fe-next-3', 'SaaS App', 'Full stack subscription.', 'Advanced', '60 Hours', ['Authjs', 'Prisma'], ['SaaS'], { frontend: 'Next.js App Router', backend: 'Server Actions', database: 'PostgreSQL', architecture: 'Serverless', tools: ['Stripe CLI'], prerequisites: ['Advanced React'] })]
                }
            },
            {
                id: 'vue',
                name: 'Vue.js',
                icon: Layers,
                description: 'Progressive framework.',
                popularity: 85,
                difficulty: 'Low',
                tiers: {
                    beginner: [createProject('fe-vue-1', 'Quote Gen', 'Random quotes.', 'Beginner', '4 Hours', ['Options API'], ['Fun'], { frontend: 'Vue 3', tools: ['Vite'], prerequisites: ['JS'] })],
                    intermediate: [createProject('fe-vue-2', 'Chat UI', 'Message interface.', 'Intermediate', '12 Hours', ['Composition API', 'Pinia'], ['Social'], { frontend: 'Vue + Tailwind', tools: ['Vue DevTools'], prerequisites: ['Vue Basics'] })],
                    advanced: [createProject('fe-vue-3', 'Kanban Board', 'Drag & drop tasks.', 'Advanced', '35 Hours', ['VueUse', 'Firebase'], ['Productivity'], { frontend: 'Vue', backend: 'Firebase', tools: ['Vite'], prerequisites: ['State Management'] })]
                }
            }
        ]
    },
    {
        id: 'backend',
        title: 'Backend Development',
        icon: Server,
        description: 'Server logic & APIs.',
        whyChoose: 'Powering the logic behind every app.',
        avgSalary: '₹ 6-25 LPA',
        popularApps: ['Uber', 'Slack'],
        stacks: [
            {
                id: 'nodejs',
                name: 'Node.js',
                icon: Terminal,
                description: 'JS on server.',
                popularity: 96,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('be-node-1', 'File Server', 'Serve static files.', 'Beginner', '5 Hours', ['fs module', 'http'], ['System'], { backend: 'Node Native', tools: ['Postman'], prerequisites: ['JS'] })],
                    intermediate: [createProject('be-node-2', 'Auth API', 'JWT logic.', 'Intermediate', '15 Hours', ['Express', 'JWT'], ['Security'], { backend: 'Express', database: 'MongoDB', tools: ['Postman'], prerequisites: ['Node Basics'] })],
                    advanced: [createProject('be-node-3', 'Real-time Chat', 'WebSockets.', 'Advanced', '35 Hours', ['Socket.io', 'Redis'], ['Social'], { backend: 'Node + Socket.io', database: 'Redis', architecture: 'Event-driven', tools: ['Wscat'], prerequisites: ['Async JS'] })]
                }
            },
            {
                id: 'java',
                name: 'Java / Spring',
                icon: Box,
                description: 'Enterprise king.',
                popularity: 90,
                difficulty: 'High',
                tiers: {
                    beginner: [createProject('be-java-1', 'Console Bank', 'ATM Logic.', 'Beginner', '6 Hours', ['OOP', 'Collections'], ['Fintech'], { backend: 'Core Java', tools: ['IntelliJ'], prerequisites: ['None'] })],
                    intermediate: [createProject('be-java-2', 'Student API', 'REST API.', 'Intermediate', '20 Hours', ['Spring Boot', 'H2'], ['Education'], { backend: 'Spring Boot', database: 'H2/MySQL', tools: ['Maven'], prerequisites: ['Java OOP'] })],
                    advanced: [createProject('be-java-3', 'Microservices', 'Distributed system.', 'Advanced', '70 Hours', ['Cloud', 'Docker'], ['Scale'], { backend: 'Spring Cloud', architecture: 'Microservices', database: 'PostgreSQL', tools: ['Docker'], prerequisites: ['Spring Boot'] })]
                }
            },
            {
                id: 'python',
                name: 'Python (Django)',
                icon: Code2,
                description: 'Rapid dev.',
                popularity: 92,
                difficulty: 'Low',
                tiers: {
                    beginner: [createProject('be-py-1', 'Notes API', 'Simple CRUD.', 'Beginner', '5 Hours', ['Flask', 'SQLite'], ['Utility'], { backend: 'Flask', database: 'SQLite', tools: ['Pip'], prerequisites: ['Python Basics'] })],
                    intermediate: [createProject('be-py-2', 'E-shop Config', 'Product logic.', 'Intermediate', '20 Hours', ['Django', 'ORM'], ['Commerce'], { backend: 'Django', database: 'PostgreSQL', tools: ['Admin Panel'], prerequisites: ['Python'] })],
                    advanced: [createProject('be-py-3', 'Social Network', 'Complex models.', 'Advanced', '50 Hours', ['DRF', 'Celery'], ['Social'], { backend: 'Django REST', architecture: 'Monolith', database: 'PostgreSQL', tools: ['Redis'], prerequisites: ['Django'] })]
                }
            },
            {
                id: 'golang',
                name: 'Go (Golang)',
                icon: Zap,
                description: 'Cloud native performance.',
                popularity: 88,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('be-go-1', 'Web Server', 'Basic HTTP.', 'Beginner', '4 Hours', ['net/http'], ['Web'], { backend: 'Standard Lib', tools: ['Go CLI'], prerequisites: ['Syntax'] })],
                    intermediate: [createProject('be-go-2', 'URL Shortener', 'Bitly clone.', 'Intermediate', '12 Hours', ['Gin', 'Redis'], ['Tool'], { backend: 'Gin', database: 'Redis', tools: ['Postman'], prerequisites: ['Go Basics'] })],
                    advanced: [createProject('be-go-3', 'gRPC Service', 'Microservice comms.', 'Advanced', '40 Hours', ['Protobuf', 'gRPC'], ['System'], { backend: 'Go + gRPC', architecture: 'Microservices', tools: ['BloomRPC'], prerequisites: ['Concurrency'] })]
                }
            },
            {
                id: 'csharp',
                name: 'C# / .NET',
                icon: Monitor,
                description: 'Microsoft powerhouse.',
                popularity: 85,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('be-cs-1', 'Todo Console', 'Task list.', 'Beginner', '4 Hours', ['System.IO'], ['Utility'], { backend: 'Core C#', tools: ['Visual Studio'], prerequisites: ['OOP'] })],
                    intermediate: [createProject('be-cs-2', 'Inventory API', 'Stock mgmt.', 'Intermediate', '15 Hours', ['ASP.NET Core', 'EF'], ['Business'], { backend: 'ASP.NET Core', database: 'SQL Server', tools: ['SSMS'], prerequisites: ['C#'] })],
                    advanced: [createProject('be-cs-3', 'Real-time Dash', 'SignalR updates.', 'Advanced', '35 Hours', ['SignalR', 'Azure'], ['Live'], { backend: 'ASP.NET + SignalR', architecture: 'Event-driven', tools: ['Azure'], prerequisites: ['ASP.NET'] })]
                }
            }
        ]
    },
    {
        id: 'mobile',
        title: 'Mobile Development',
        icon: Smartphone,
        description: 'iOS & Android.',
        whyChoose: 'Impact millions of users directly.',
        avgSalary: '₹ 6-20 LPA',
        popularApps: ['TikTok', 'Zomato'],
        stacks: [
            {
                id: 'flutter',
                name: 'Flutter',
                icon: Layers,
                description: 'Google\'s cross-platform UI.',
                popularity: 90,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('mb-fl-1', 'Biz Card', 'Static UI.', 'Beginner', '3 Hours', ['Widgets'], ['UI'], { frontend: 'Flutter Widgets', tools: ['Android Studio'], prerequisites: ['Dart'] })],
                    intermediate: [createProject('mb-fl-2', 'Weather App', 'API Calls.', 'Intermediate', '15 Hours', ['Bloc', 'Http'], ['Utility'], { frontend: 'Flutter', backend: 'Weather API', tools: ['Flutter DevTools'], prerequisites: ['Flutter Basics'] })],
                    advanced: [createProject('mb-fl-3', 'E-commerce', 'Full app.', 'Advanced', '45 Hours', ['Firebase', 'Provider'], ['Commerce'], { frontend: 'Flutter', backend: 'Firebase', tools: ['Xcode/Android Studio'], prerequisites: ['State Mgmt'] })]
                }
            },
            {
                id: 'reactnative',
                name: 'React Native',
                icon: Globe,
                description: 'JS for mobile.',
                popularity: 94,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('mb-rn-1', 'Stopwatch', 'Timer app.', 'Beginner', '4 Hours', ['Hooks'], ['Tool'], { frontend: 'React Native', tools: ['Expo'], prerequisites: ['React'] })],
                    intermediate: [createProject('mb-rn-2', 'News Reader', 'Scrollable list.', 'Intermediate', '12 Hours', ['FlatList', 'API'], ['Media'], { frontend: 'React Native', backend: 'News API', tools: ['Simulator'], prerequisites: ['RN Basics'] })],
                    advanced: [createProject('mb-rn-3', 'Food Delivery', 'Maps & tracking.', 'Advanced', '50 Hours', ['Maps', 'Redux'], ['Service'], { frontend: 'React Native', backend: 'Node/Firebase', tools: ['Android Studio'], prerequisites: ['Navigation'] })]
                }
            },
            {
                id: 'swift',
                name: 'Swift',
                icon: Smartphone,
                description: 'Native iOS.',
                popularity: 80,
                difficulty: 'High',
                tiers: {
                    beginner: [createProject('mb-sw-1', 'Tip Calc', 'Simple math.', 'Beginner', '4 Hours', ['SwiftUI'], ['Tool'], { frontend: 'SwiftUI', tools: ['Xcode'], prerequisites: ['None'] })],
                    intermediate: [createProject('mb-sw-2', 'To-Do CoreData', 'Local storage.', 'Intermediate', '15 Hours', ['CoreData'], ['Productivity'], { frontend: 'SwiftUI', database: 'CoreData', tools: ['Xcode'], prerequisites: ['Swift'] })],
                    advanced: [createProject('mb-sw-3', 'AR Measure', 'ARKit ruler.', 'Advanced', '40 Hours', ['ARKit'], ['Utility'], { frontend: 'ARKit + SceneKit', tools: ['LiDAR Device'], prerequisites: ['SwiftUI'] })]
                }
            },
            {
                id: 'dart',
                name: 'Dart',
                icon: Terminal,
                description: 'Language behind Flutter.',
                popularity: 75,
                difficulty: 'Low',
                tiers: {
                    beginner: [createProject('dt-1', 'Console Game', 'Guess number.', 'Beginner', '2 Hours', ['IO', 'Random'], ['Game'], { backend: 'Dart CLI', tools: ['VS Code'], prerequisites: ['None'] })],
                    intermediate: [createProject('dt-2', 'CLI Tool', 'File utility.', 'Intermediate', '8 Hours', ['Args', 'Files'], ['Tool'], { backend: 'Dart Native', tools: ['Dart Pub'], prerequisites: ['Dart Syntax'] })],
                    advanced: [createProject('dt-3', 'Server', 'HTTP Server.', 'Advanced', '20 Hours', ['Shelf'], ['Backend'], { backend: 'Dart Shelf', tools: ['Postman'], prerequisites: ['Async Dart'] })]
                }
            }
        ]
    },
    {
        id: 'data',
        title: 'Data & AI',
        icon: Brain,
        description: 'Analyze & Predict.',
        whyChoose: 'Drive decisions with data.',
        avgSalary: '₹ 8-30 LPA',
        popularApps: ['ChatGPT', 'TensorFlow'],
        stacks: [
            {
                id: 'python_ai',
                name: 'Python',
                icon: Hash,
                description: 'AI Standard.',
                popularity: 99,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('da-py-1', 'Data Cleaning', 'Pandas basics.', 'Beginner', '6 Hours', ['Pandas'], ['Data'], { backend: 'Jupyter', tools: ['Anaconda'], prerequisites: ['Python'] })],
                    intermediate: [createProject('da-py-2', 'Stock Pred', 'Regression.', 'Intermediate', '15 Hours', ['Scikit-Learn'], ['ML'], { backend: 'Python ML', architecture: 'Model Pipeline', tools: ['Jupyter'], prerequisites: ['Pandas'] })],
                    advanced: [createProject('da-py-3', 'Computer Vision', 'Face detect.', 'Advanced', '40 Hours', ['OpenCV', 'YOLO'], ['AI'], { backend: 'PyTorch/TF', tools: ['GPU Colab'], prerequisites: ['Deep Learning'] })]
                }
            },
            {
                id: 'r_lang',
                name: 'R Language',
                icon: BarChart2,
                description: 'Statistical Computing.',
                popularity: 70,
                difficulty: 'High',
                tiers: {
                    beginner: [createProject('da-r-1', 'Sales Viz', 'Basic plots.', 'Beginner', '5 Hours', ['ggplot2'], ['Viz'], { backend: 'R Script', tools: ['RStudio'], prerequisites: ['Stats 101'] })],
                    intermediate: [createProject('da-r-2', 'Survey Analysis', 'Hypothesis test.', 'Intermediate', '15 Hours', ['dplyr', 'tidyr'], ['Stats'], { backend: 'R', tools: ['RStudio'], prerequisites: ['R Basics'] })],
                    advanced: [createProject('da-r-3', 'Shiny Dashboard', 'Interactive web app.', 'Advanced', '30 Hours', ['Shiny'], ['Web'], { frontend: 'Shiny UI', backend: 'R Server', tools: ['RStudio'], prerequisites: ['Data Viz'] })]
                }
            },
            {
                id: 'sql',
                name: 'SQL',
                icon: Database,
                description: 'Database Language.',
                popularity: 95,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('da-sql-1', 'Library DB', 'Schema design.', 'Beginner', '4 Hours', ['CREATE', 'INSERT'], ['DB'], { database: 'PostgreSQL', tools: ['pgAdmin'], prerequisites: ['None'] })],
                    intermediate: [createProject('da-sql-2', 'Sales Analysis', 'Complex queries.', 'Intermediate', '10 Hours', ['JOIN', 'GROUP BY'], ['Analytics'], { database: 'PostgreSQL', tools: ['DBeaver'], prerequisites: ['Basic SQL'] })],
                    advanced: [createProject('da-sql-3', 'Performance Tuning', 'Indexing & explain.', 'Advanced', '20 Hours', ['INDEX', 'EXPLAIN'], ['Optimization'], { database: 'PostgreSQL', tools: ['pgAdmin'], prerequisites: ['Intermediate SQL'] })]
                }
            }
        ]
    },
    {
        id: 'systems',
        title: 'Systems & Tools',
        icon: HardDrive,
        description: 'Low level & scripting.',
        whyChoose: 'Control hardware and automate pipelines.',
        avgSalary: '₹ 10-40 LPA',
        popularApps: ['Linux', 'Docker'],
        stacks: [
            {
                id: 'cpp',
                name: 'C++',
                icon: Cpu,
                description: 'High perf.',
                popularity: 85,
                difficulty: 'High',
                tiers: {
                    beginner: [createProject('sys-cpp-1', 'Students DB', 'File IO.', 'Beginner', '5 Hours', ['Fstream'], ['DB'], { backend: 'C++', tools: ['VS Code'], prerequisites: ['Syntax'] })],
                    intermediate: [createProject('sys-cpp-2', 'Chat Server', 'Sockets.', 'Intermediate', '20 Hours', ['Networking'], ['Net'], { backend: 'C++ Native', tools: ['GDB'], prerequisites: ['Pointers'] })],
                    advanced: [createProject('sys-cpp-3', 'Game Engine', '2D Renderer.', 'Advanced', '60 Hours', ['OpenGL', 'SDL'], ['Graphics'], { backend: 'C++', architecture: 'Engine', tools: ['CMake'], prerequisites: ['Linear Algebra'] })]
                }
            },
            {
                id: 'rust',
                name: 'Rust',
                icon: Shield,
                description: 'Memory safety.',
                popularity: 90,
                difficulty: 'High',
                tiers: {
                    beginner: [createProject('sys-rs-1', 'CLI Grep', 'Text search.', 'Beginner', '6 Hours', ['Clap'], ['Tool'], { backend: 'Rust', tools: ['Cargo'], prerequisites: ['None'] })],
                    intermediate: [createProject('sys-rs-2', 'HTTP Server', 'Async basics.', 'Intermediate', '20 Hours', ['Tokio', 'Hyper'], ['Web'], { backend: 'Rust Async', tools: ['Postman'], prerequisites: ['Rust Ownership'] })],
                    advanced: [createProject('sys-rs-3', 'Blockchain Node', 'P2P network.', 'Advanced', '80 Hours', ['Libp2p'], ['Crypto'], { backend: 'Rust', architecture: 'P2P', tools: ['Docker'], prerequisites: ['Advanced Rust'] })]
                }
            },
            {
                id: 'shell',
                name: 'Shell / Bash',
                icon: Terminal,
                description: 'Automation.',
                popularity: 80,
                difficulty: 'Medium',
                tiers: {
                    beginner: [createProject('sys-sh-1', 'Backup Script', 'Archive files.', 'Beginner', '2 Hours', ['Tar', 'Cron'], ['Ops'], { backend: 'Bash', tools: ['Terminal'], prerequisites: ['Linux Basics'] })],
                    intermediate: [createProject('sys-sh-2', 'Log Analyzer', 'Parse access logs.', 'Intermediate', '6 Hours', ['Awk', 'Sed'], ['Data'], { backend: 'Bash/Awk', tools: ['Linux'], prerequisites: ['Regex'] })],
                    advanced: [createProject('sys-sh-3', 'CI Pipeline', 'Build & Deploy.', 'Advanced', '15 Hours', ['Git', 'SSH'], ['DevOps'], { backend: 'Bash', architecture: 'Pipeline', tools: ['Jenkins/GitHub Actions'], prerequisites: ['Scripting'] })]
                }
            },
            {
                id: 'lua',
                name: 'Lua',
                icon: Settings,
                description: 'Embeddable scripting.',
                popularity: 60,
                difficulty: 'Low',
                tiers: {
                    beginner: [createProject('sys-lua-1', 'Calc Script', 'Basic logic.', 'Beginner', '2 Hours', ['Math'], ['Tool'], { backend: 'Lua', tools: ['ZeroBrane'], prerequisites: ['None'] })],
                    intermediate: [createProject('sys-lua-2', 'Game Mod', 'Modify game logic.', 'Intermediate', '10 Hours', ['API Hook'], ['Game'], { backend: 'Lua', tools: ['Roblox/Love2D'], prerequisites: ['Game Logic'] })],
                    advanced: [createProject('sys-lua-3', 'Neovim Plugin', 'Editor extension.', 'Advanced', '20 Hours', ['Vim API'], ['Tool'], { backend: 'Lua', tools: ['Neovim'], prerequisites: ['Vim'] })]
                }
            }
        ]
    }
];

import { BarChart2 } from 'lucide-react';
