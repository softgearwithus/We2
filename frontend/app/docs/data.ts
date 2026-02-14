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
        description: "Welcome to We2. Understand our dual-pathway ecosystem: Prep0 and We2Hub.",
        category: "Getting Started",
        lastUpdated: "Feb 2024",
        content: `
# Welcome to We2

We2 is the world's first hybrid career platform designed for modern software engineering. Our ecosystem is built on two core pillars:

## 1. Prep0 (Placement Readiness)
Prep0 is designed for students who are in the middle of their placement cycles. It focuses on:
- **DSA Mastery**: 450+ curated problems from FAANG interviews.
- **System Design**: Both HLD and LLD fundamentals for modern engineering.
- **CS Fundamentals**: Deep dives into OS, DBMS, and Computer Networks.
- **AI Mentorship**: Use our AI mentors to clarify doubts instantly.

## 2. We2Hub (Industrial Simulation)
We2Hub is where learning turns into professional experience. Instead of tutorials, you join a **Simulation Sprint**:
- **21-Day Cycles**: Work in a team of 5-8 people on a real production-grade project.
- **Professional Workflows**: Use JIRA for tasks, Slack for comms, and GitHub for PR reviews.
- **Agile Methodology**: Participate in standups, grooming sessions, and retrospectives.

[Explore Prep0](/prep0) | [Explore We2Hub](/we2hub)
        `,
        relatedLinks: [
            { label: "Account Setup", href: "/docs/account-setup" },
            { label: "Student Dashboard", href: "/docs/student-dashboard-guide" }
        ]
    },
    "dsa-roadmap-2024": {
        title: "DSA Roadmap 2024",
        description: "The definitive 20-week guide to mastering Data Structures and Algorithms.",
        category: "Prep0: DSA & Interviews",
        lastUpdated: "Feb 2024",
        content: `
# DSA Roadmap 2024

Mastering DSA isn't about memorizing 1000 problems. It's about recognizing patterns. Here is our 20-week structured path:

## Phase 1: Foundations (Week 1-4)
- **Arrays & Hashing**: Two Sum, Top K Frequent, Valid Sudoku.
- **Two Pointers**: Valid Palindrome, 3Sum, Container with most water.
- **Sliding Window**: Best time to buy/sell stock, Longest repeating character replacement.

## Phase 2: Core Structures (Week 5-10)
- **Trees**: Balanced Binary Tree, LCA of BST, Level Order Traversal.
- **Heaps**: Kth Largest element, Median from data stream.
- **Linked Lists**: Reverse Linked List, Merge Two Sorted Lists.

## Phase 3: Advanced Patterns (Week 11-20)
- **Dynamic Programming**: Climbing Stairs, House Robber, Coin Change.
- **Graphs**: Number of Islands, Max Area of Island, Pacific Atlantic Water Flow.
- **Greedy Algorithms**: Maximum Subarray, Jump Game.

[Go to Problem Dashboard](/dashboard/problems)
        `,
        relatedLinks: [
            { label: "Resume Lab", href: "/docs/resume-lab-instructions" },
            { label: "Mock Interviews", href: "/docs/mock-interview-prep" }
        ]
    },
    "sprint-methodology": {
        title: "Sprint Methodology",
        description: "How we simulate elite engineering cycles inside We2Hub.",
        category: "We2Hub: Simulations",
        lastUpdated: "Feb 2024",
        content: `
# Sprint Methodology (21-Day Cycle)

At We2Hub, we replicate the workflow of companies like Uber and Google. Here is how your 21-day simulation will look:

## Week 1: Onboarding & Architecture
- **Day 1**: System Walkthrough & Tech Stack Setup (Docker, K8s).
- **Day 3**: Sprint Planning. Estimation of Story Points for your tasks.
- **Day 5**: Feature Design Documents (FDD) submission.

## Week 2: Build & Collaborate
- **Day 8-12**: Active Coding. PRs must be raised with at least 2 peer reviews.
- **Day 14**: Mid-Sprint Retrospective. Adjusting velocity.

## Week 3: Ship & Present
- **Day 18**: Feature Freeze. Focus on E2E testing and bug fixing.
- **Day 21**: Final Demo. Presentation to "Stakeholders" (Industry Mentors).

[Join the next Simulation](/simulation/enroll)
        `,
        relatedLinks: [
            { label: "JIRA Guide", href: "/docs/agile-jira-guide" },
            { label: "Git Workflows", href: "/docs/git-github-workflows" }
        ]
    },
    "account-setup": {
        title: "Account Setup",
        description: "Your first steps to becoming a We2 builder.",
        category: "Getting Started",
        lastUpdated: "Feb 2024",
        content: `
# Account Setup

Getting your account ready is the first step towards your career transformation. Follow these steps:

## 1. Registration
Sign up using your college email or a professional Gmail account. We recommend using the same email you use for GitHub to sync your professional identity.

## 2. Preference Selection
Choose your primary goal:
- **Placement Readiness**: Focus on Prep0 features.
- **Industry Experience**: Join We2Hub simulations.

## 3. Profile Completion
Upload 2-3 projects you've worked on. Our AI will analyze these to provide personalized mentors and curriculum recommendations.

[Join Now](/register) | [Login to Dashboard](/login)
        `,
        relatedLinks: [
            { label: "Student Dashboard", href: "/docs/student-dashboard-guide" },
            { label: "Platform Overview", href: "/docs/platform-overview" }
        ]
    },
    "student-dashboard-guide": {
        title: "Student Dashboard Guide",
        description: "Navigating your personalized mission control.",
        category: "Getting Started",
        lastUpdated: "Feb 2024",
        content: `
# Student Dashboard Guide

Your dashboard is where you track your transformation. It is divided into three main sections:

## 1. Performance Heatmap
Track your consistency across DSA problems and simulation sprint tasks. Green streaks represent days of high contribution.

## 2. Mission Roadmap
This is your dynamic curriculum. As you solve problems or complete tasks, new "Levels" unlock.

## 3. AI Mentor Hub
Connect with specialized AI mentors for **System Design**, **DSA**, or **Behavioral** preparation.

[Go to Dashboard](/dashboard)
        `,
        relatedLinks: [
            { label: "Resume Lab", href: "/docs/resume-lab-instructions" },
            { label: "DSA Roadmap", href: "/docs/dsa-roadmap-2024" }
        ]
    },
    "resume-lab-instructions": {
        title: "Resume Lab Instructions",
        description: "Use our AI-powered Resume Lab to beat the ATS 100%.",
        category: "Prep0: DSA & Interviews",
        lastUpdated: "Feb 2024",
        content: `
# Resume Lab Instructions

The Resume Lab is part of **Prep0: Placement Readiness**. It helps you build a resume that hiring managers love.

## 1. Upload & Scan
Upload your current resume (PDF). Our AI will score it across:
- **Quantifiability**: Are you using data to back your claims?
- **Keywords**: Does your tech stack match the role?
- **Format**: Is it ATS-friendly?

## 2. AI Enhancements
Our AI will suggest "Bullet Point Improvements". It helps you swap "I coded a website" with "Built a high-fidelity Next.js platform reducing bounce rate by 40%".

## 3. Export
Export your high-fidelity, polished resume in professional LaTeX-based formatting.

[Go to Resume Lab](/resumes)
        `,
        relatedLinks: [
            { label: "Mock Interviews", href: "/docs/mock-interview-prep" },
            { label: "DSA Roadmap", href: "/docs/dsa-roadmap-2024" }
        ]
    },
    "agile-jira-guide": {
        title: "Agile & JIRA Guide",
        description: "Master industry project management workflows.",
        category: "We2Hub: Simulations",
        lastUpdated: "Feb 2024",
        content: `
# Agile & JIRA Guide

In a **We2Hub Simulation**, you don't just "do projects". You follow Agile.

## 1. The Backlog
Every feature is broken down into **User Stories**. You'll pick tasks from the "To Do" column and move them to "In Progress".

## 2. Story Points
We use Fibonacci sequences (1, 2, 3, 5) to estimate effort. You'll learn how to "Punt" tasks if they are too large for a sprint.

## 3. Burn-down Charts
Track your team's velocity. Our dashboard provides a real-time burn-down chart during your 21-day simulation.

[View Active Simulation](/simulations)
        `,
        relatedLinks: [
            { label: "Sprint Methodology", href: "/docs/sprint-methodology" },
            { label: "Docker Guide", href: "/docs/docker-containers" }
        ]
    },
    "docker-containers": {
        title: "Docker & Containers",
        description: "Mastering containerization for modern deployments.",
        category: "Infrastructure & Tools",
        lastUpdated: "Feb 2024",
        content: `
# Docker & Containers

Modern apps run in containers. At We2, all simulations require you to containerize your features.

## 1. Dockerfile Basics
Learn to write optimized Dockerfiles:
- **Multi-stage builds** to reduce image size.
- **Layer caching** for faster CI/CD.

## 2. Docker Compose
Manage multi-service simulations (Backend, Frontend, DB) with a single command.

## 3. Deployment
Deploy your containers to our staging environment using Kubernetes (K8s) clusters.

[Practice with Cloud Lab](/simulation/lab)
        `
    }
};

