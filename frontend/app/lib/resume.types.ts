export interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
        summary?: string;
        location?: string;
    };
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: {
        languages: string[];
        frameworks: string[];
        tools: string[];
    };
    projects: ProjectItem[];
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string; // or 'Present'
    location: string;
    description: string[]; // Bullet points
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    location: string;
    gpa?: string;
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string[];
    technologies: string[];
    link?: string;
}

export const initialResumeState: ResumeData = {
    personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        summary: 'Passionate Software Engineer with experience in building scalable web applications using React and Node.js.',
    },
    experience: [
        {
            id: '1',
            company: 'Tech Corp',
            position: 'Software Engineer',
            startDate: '2023-01',
            endDate: 'Present',
            location: 'San Francisco, CA',
            description: [
                'Developed and maintained critical microservices.',
                'Improved system performance by 20%.',
            ],
        },
    ],
    education: [
        {
            id: '1',
            institution: 'University of Engineering',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2019-09',
            endDate: '2023-05',
            location: 'New York, NY',
            gpa: '3.8',
        },
    ],
    skills: {
        languages: ['JavaScript', 'TypeScript', 'Python'],
        frameworks: ['React', 'Next.js', 'NestJS'],
        tools: ['Git', 'Docker', 'AWS'],
    },
    projects: [
        {
            id: '1',
            name: 'E-commerce Platform',
            description: ['Built a full-stack e-commerce site with payment integration.'],
            technologies: ['React', 'Node.js', 'Stripe'],
            link: 'github.com/johndoe/ecommerce',
        },
    ],
};
