export interface DocArticle {
    title: string;
    description: string;
    content: string;
    category: string;
    lastUpdated: string;
    relatedLinks?: { label: string; href: string }[];
}

export const docsData: Record<string, DocArticle> = {
    "platform-overview": {
        title: "Platform Overview",
        description: "Welcome to Emble. Understand India's First Integrated AI Placement Ecosystem Hub.",
        category: "Getting Started",
        lastUpdated: "Feb 2024",
        content: `
# Welcome to Emble

Emble is more than just a course - it's an end-to-end career ecosystem. We combine industry-exact training with deep-tech AI simulations (Voice and Video) to ensure you don't just learn, but master the industrial logic required by top engineering teams.

## Phase 1: Recruitment Readiness
This phase bridges the logic gap that video lectures miss, ensuring you're ready for every screening:
- **200+ DSA Questions**: Hand-picked problem set covering all patterns asked in MNCs.
- **Top 50 SQL Questions**: Master complex database queries and schema designs.
- **AI Interview Simulation**: Practice with voice and video interviews that provide real-time feedback.
- **Resume & Skills Audit**: Get your profile scanned by AI for ATS optimization.

## Phase 2: Industrial Mastery
Stop being just another "fresher". Build industrial proof-of-work across:
- **GitHub Mastery**: Professional collaboration, branching, PR reviews.
- **Professional Deployment**: Rendering, hosting, and production-ready deployments.
- **Industrial Standards**: Clean code, modular architecture, and documentation.
- **Production Systems**: Navigation of microservices and DevOps.

[Explore Pricing](/pricing) | [Discover Phase 1](/dashboard/preparation)
        `,
        relatedLinks: [
            { label: "Account Setup", href: "/docs/account-setup" },
            { label: "Student Dashboard", href: "/docs/student-dashboard-guide" }
        ]
    },
    "dsa-roadmap-2024": {
        title: "DSA & Interview Roadmap",
        description: "The definitive guide to bridging the logic gap with MNC-focused questions and AI simulations.",
        category: "Placement Mode: DSA & Interviews",
        lastUpdated: "Feb 2024",
        content: `
# DSA & Interview Strategy

We don't focus on 1000s of generic questions. We focus on the "Logic Gap". 

## 1. 200+ Company-Picked DSA Challenges
We have curated a hand-picked problem set covering the most crucial patterns asked in top product-based company interviews (Google, Amazon, Microsoft, etc.). 
- **Focus Areas**: Trees, Graphs, Dynamic Programming, Two Pointers, Sliding Window.
- **Methodology**: Learn the underlying industrial logic, rather than memorizing individual solutions.

## 2. Top 50 SQL Scenarios
Master the database layer with 50 complex SQL queries and schema design tasks that actually show up in high-paying placement rounds.

## 3. AI Interview Simulation (Audiotail)
It's a two-stage process:
- First, **Audiotail** masters your voice presence and verbal logic.
- Then, our **Video AI** analyzes your body language, technical accuracy, and confidence.
- It's like having a senior engineer from a top tech firm coaching you 24/7.

[Go to Problem Dashboard](/dashboard/problems)
        `,
        relatedLinks: [
            { label: "Resume Lab", href: "/docs/resume-lab-instructions" },
            { label: "Sprint Methodology", href: "/docs/sprint-methodology" }
        ]
    },
    "sprint-methodology": {
        title: "Industrial Simulation Sprints",
        description: "How we simulate elite engineering cycles and industrial excellence.",
        category: "Job Simulation: Simulations",
        lastUpdated: "Feb 2024",
        content: `
# Industrial Simulation

Learn like a student, build like a professional. At Emble, you participate in industrial sprint simulations modeled after global remote engineering standards.

## The Four Pillars of Industrial Excellence

1. **GitHub Mastery**
   Master professional collaboration. Learn branching, PR reviews, and industrial git standards. Your commits will be reviewed asynchronously, just like in a global remote engineering team.

2. **Professional Deployment**
   Move beyond localhost. Master rendering, hosting, and production-ready deployments to AWS and Kubernetes clusters.

3. **Industrial Standards**
   Write code that survives. Learn clean code, modular architecture, and strict documentation logic.

4. **Production Systems**
   Understand real-world scale. Navigate microservices and production-grade DevOps using Docker and CI/CD pipelines.

[Join Job Simulation](/dashboard/projects)
        `,
        relatedLinks: [
            { label: "Curriculum FAQ", href: "/curriculum#faq" },
            { label: "Tech Stack & Docker", href: "/docs/docker-containers" }
        ]
    },
    "account-setup": {
        title: "Account Setup",
        description: "Your first steps to entering the Emble Ecosystem Hub.",
        category: "Getting Started",
        lastUpdated: "Feb 2024",
        content: `
# Journey Initiation

Getting your account ready is the first step towards your career transformation. Follow these simple steps:

## 1. Path Selection
Choose your path—**Standard** or **Pro**. Both pathways give you access to incredible placement resources, but the Pro tier unlocks personalized premium AI mentor simulations.

## 2. Profile & Baseline Audit
Once you're in, the AI adaptive engine audits your current skills. 
- Ensure your resume is uploaded for the **ATS Optimization Engine**.
- Set your target companies (e.g. Google, Amazon, FlipKart).

## 3. Personalized Roadmap
The engine creates a personalized roadmap through **Placement Mode** and **Industrial Simulation**. You will receive daily sprint tasks and a Readiness Score tracker to monitor your improvement.

[Join Now](/register) | [Login to Dashboard](/login)
        `,
        relatedLinks: [
            { label: "Student Dashboard", href: "/docs/student-dashboard-guide" },
            { label: "Platform Overview", href: "/docs/platform-overview" }
        ]
    },
    "student-dashboard-guide": {
        title: "Student Dashboard Guide",
        description: "Navigating your personalized mission control (Amber Dashboard).",
        category: "Getting Started",
        lastUpdated: "Feb 2024",
        content: `
# The Amber Dashboard

Your dashboard is where you track your transformation. It features a stunning glassmorphism UI designed to highlight actionable data immediately.

## 1. Readiness Panel & Streak Tracking
At the top of your dashboard, you will see a **Live Countdown** to placement season (e.g., *78 Days remaining*). Your **Streak Tracker** counts consecutive days of high-quality industrial contribution. The **Readiness Score** aggregates your overall standing.

## 2. Radar Skill Chart
Our detailed hex-radar chart visually measures your proficiency across six crucial domains:
- **DSA**
- **Fundamentals**
- **Aptitude**
- **Communication**
- **Interview Confidence**
- **Company Specific Prep**

## 3. Quick Access Grid
Instantly dive into the next phase of your custom roadmap, whether that's an Audiotail simulation or a new Database system design chapter.

[Go to Dashboard](/dashboard)
        `,
        relatedLinks: [
            { label: "Resume Lab", href: "/docs/resume-lab-instructions" },
            { label: "DSA Roadmap", href: "/docs/dsa-roadmap-2024" }
        ]
    },
    "resume-lab-instructions": {
        title: "Behavioral & Resume Prep",
        description: "Use our AI tools to breeze through HR rounds and resume screening.",
        category: "Placement Mode: DSA & Interviews",
        lastUpdated: "Feb 2024",
        content: `
# Holistic Preparation

Technical skills alone won't secure the 50LPA+ package. Emble's Phase 1 ecosystem includes deep behavioral and HR preparation tools.

## 1. AI Resume & Skills Audit
Get your profile scanned by our AI to ensure it passes through top company filters effortlessly.
- **ATS Optimization**: We analyze semantic keyword density to match top MNC job descriptions.
- **Action Verbs**: Suggestions to convert passive project descriptions into active, impact-driven statements.

## 2. Behavioral & HR AI Prep
Receive AI feedback on tone, body language, and communication clarity.
- **Salary Negotiation Strategies**: Learn how to leverage multiple offers.
- **Leadership Principles**: Practice STAR methodology answers specifically tailored to companies like Amazon and Microsoft.

[Go to Resume Builder](/dashboard/interviews)
        `,
        relatedLinks: [
            { label: "Mock Interviews", href: "/dashboard/interviews" },
            { label: "DSA Roadmap", href: "/docs/dsa-roadmap-2024" }
        ]
    },
    "agile-jira-guide": {
        title: "Unified Tech Stack & Projects",
        description: "Master the exact tools used by modern elite engineering teams.",
        category: "Job Simulation: Simulations",
        lastUpdated: "Feb 2024",
        content: `
# The Unified Infrastructure Stack

At Emble, we don't teach outdated frameworks. Our Job Simulation projects are built on the **Unified Tech Stack** to guarantee industry relevance.

## 1. Frontend & Backend
- **React & Next.js**: Build highly interactive, SEO-optimized user interfaces.
- **Node & NestJS**: Architect scalable backend APIs using strict TypeScript typing.

## 2. Database & Architecture
- **PostgreSQL**: Master relational algebra, indexing, and complex joins.
- **System Design**: Both High-Level Design (HLD) and Low-Level Design (LLD) principles are enforced in code reviews.

## 3. DevOps & Scale
- **Docker**: Containerize every application ensuring environment parity.
- **AWS**: Deploy to professional cloud infrastructure.
- **GitHub CI/CD**: Automate testing and deployment pipelines.

[View Tech Curriculum](/curriculum)
        `,
        relatedLinks: [
            { label: "Sprint Methodology", href: "/docs/sprint-methodology" },
            { label: "Docker Guide", href: "/docs/docker-containers" }
        ]
    },
    "docker-containers": {
        title: "Earning as a Mentor",
        description: "Turn your skills into income by joining the Emble Mentor Network.",
        category: "Infrastructure & Tools",
        lastUpdated: "Feb 2024",
        content: `
# The Emble Expert Network

Are you an elite coder? Emble gives you the platform to monetize your expertise and guide the next generation of engineers.

## Qualifications
Got a great GATE score or a Candidate Master rating on Codeforces? We are looking for candidates who possess exceptional problem-solving abilities and clear communication.

## How it Works
1. **Apply Now**: Submit your profile with proof of work (LinkedIn, Codeforces handles).
2. **Onboarding**: Complete our brief mentor training module.
3. **Earn Well**: Set your schedule, take 1:1 sessions, conduct mock interviews, and earn competitive hourly rates.

Join the ecosystem not just as a learner, but as a leader.

[Apply to Mentorship](/mentor/apply)
        `
    }
};
