export type HiringPipelineStageTemplate = {
  name: string;
  kind: 'assessment' | 'step';
  description: string;
};

export type HiringRoleTemplate = {
  key: string;
  name: string;
  subtitle: string;
  defaultTitle: string;
  defaultJobProfile: string;
  defaultType: 'Full-Time' | 'Internship' | 'Contract';
  defaultWorkMode: 'Offline' | 'Hybrid' | 'Remote';
  defaultExperience: string;
  defaultSkills: string[];
  defaultLanguage: string;
  defaultTimeLimitMinutes: number;
  defaultDescription: string;
  stages: HiringPipelineStageTemplate[];
};

export const HIRING_ROLE_TEMPLATES: HiringRoleTemplate[] = [
  {
    key: 'engineer',
    name: 'Engineer',
    subtitle: 'Backend, frontend, full-stack, data, mobile',
    defaultTitle: 'Software Engineer',
    defaultJobProfile: 'Product Engineering',
    defaultType: 'Full-Time',
    defaultWorkMode: 'Hybrid',
    defaultExperience: '0-3 years',
    defaultSkills: ['TypeScript', 'React', 'Node.js', 'SQL', 'Testing'],
    defaultLanguage: 'typescript',
    defaultTimeLimitMinutes: 90,
    defaultDescription:
      'Build, debug, and ship product features with clear ownership, tests, and practical tradeoff reasoning.',
    stages: [
      {
        name: 'Take-home assessment',
        kind: 'assessment',
        description: 'Coding exercise or feature build from role context',
      },
      {
        name: 'Debugging assessment',
        kind: 'assessment',
        description: 'Bugfix or code-review exercise against realistic code',
      },
      {
        name: 'Take-home walkthrough',
        kind: 'step',
        description: 'Candidate explains design choices, tests, and tradeoffs',
      },
      {
        name: 'On-site',
        kind: 'step',
        description: 'Live technical and collaboration discussion',
      },
      {
        name: 'Final debrief',
        kind: 'step',
        description: 'Hiring team decision and offer calibration',
      },
    ],
  },
  {
    key: 'senior_staff_engineer',
    name: 'Senior / Staff Engineer',
    subtitle: 'ML, DevOps, platform, security',
    defaultTitle: 'Senior Software Engineer',
    defaultJobProfile: 'Senior Engineering',
    defaultType: 'Full-Time',
    defaultWorkMode: 'Hybrid',
    defaultExperience: '4+ years',
    defaultSkills: ['System Design', 'Architecture', 'Reliability', 'Mentoring'],
    defaultLanguage: 'typescript',
    defaultTimeLimitMinutes: 120,
    defaultDescription:
      'Own ambiguous technical work, improve systems, mentor engineers, and make high-quality architecture decisions.',
    stages: [
      {
        name: 'Architecture assessment',
        kind: 'assessment',
        description: 'Design or refactor a system slice using real product context',
      },
      {
        name: 'Production debugging',
        kind: 'assessment',
        description: 'Investigate a realistic incident, bottleneck, or reliability issue',
      },
      {
        name: 'Technical walkthrough',
        kind: 'step',
        description: 'Deep-dive on tradeoffs, quality, and long-term maintainability',
      },
      {
        name: 'Cross-functional round',
        kind: 'step',
        description: 'Product, delivery, and communication calibration',
      },
      {
        name: 'Leadership panel',
        kind: 'step',
        description: 'Scope, influence, mentoring, and judgment',
      },
      {
        name: 'Final debrief',
        kind: 'step',
        description: 'Team decision and leveling discussion',
      },
    ],
  },
  {
    key: 'engineering_manager',
    name: 'Engineering Manager',
    subtitle: 'People leadership, delivery, cross-functional',
    defaultTitle: 'Engineering Manager',
    defaultJobProfile: 'Engineering Leadership',
    defaultType: 'Full-Time',
    defaultWorkMode: 'Hybrid',
    defaultExperience: '5+ years',
    defaultSkills: ['People Management', 'Delivery', 'Hiring', 'Stakeholders'],
    defaultLanguage: 'markdown',
    defaultTimeLimitMinutes: 75,
    defaultDescription:
      'Lead engineering teams, create execution clarity, coach engineers, and partner across product and business.',
    stages: [
      {
        name: 'Manager case study',
        kind: 'assessment',
        description: 'Written response to a delivery, people, or prioritization scenario',
      },
      {
        name: 'People leadership round',
        kind: 'step',
        description: 'Coaching, feedback, conflict, and hiring signal',
      },
      {
        name: 'Execution round',
        kind: 'step',
        description: 'Planning, tradeoffs, metrics, and stakeholder alignment',
      },
      {
        name: 'Cross-functional panel',
        kind: 'step',
        description: 'Product, design, business, and communication depth',
      },
      {
        name: 'Final debrief',
        kind: 'step',
        description: 'Offer decision and leadership calibration',
      },
    ],
  },
  {
    key: 'intern_new_grad',
    name: 'Intern / New Grad',
    subtitle: 'Early-career, internship scope',
    defaultTitle: 'Software Engineering Intern',
    defaultJobProfile: 'Early Career Engineering',
    defaultType: 'Internship',
    defaultWorkMode: 'Hybrid',
    defaultExperience: '0-1 years',
    defaultSkills: ['DSA', 'JavaScript', 'Python', 'Projects', 'Communication'],
    defaultLanguage: 'javascript',
    defaultTimeLimitMinutes: 75,
    defaultDescription:
      'Assess fundamentals, learning speed, project ownership, and practical implementation ability.',
    stages: [
      {
        name: 'Fundamentals assessment',
        kind: 'assessment',
        description: 'Small coding task with tests and explanation',
      },
      {
        name: 'Project walkthrough',
        kind: 'assessment',
        description: 'Resume/project discussion with practical technical questions',
      },
      {
        name: 'Technical screen',
        kind: 'step',
        description: 'Live fundamentals and communication round',
      },
      {
        name: 'Final debrief',
        kind: 'step',
        description: 'Team decision and internship matching',
      },
    ],
  },
  {
    key: 'forward_deployed_gtm',
    name: 'Forward-deployed / GTM',
    subtitle: 'Sales engineering, solutions, customer success',
    defaultTitle: 'Forward Deployed Engineer',
    defaultJobProfile: 'Solutions Engineering',
    defaultType: 'Full-Time',
    defaultWorkMode: 'Remote',
    defaultExperience: '1-4 years',
    defaultSkills: ['APIs', 'Customer Discovery', 'Demos', 'SQL', 'Writing'],
    defaultLanguage: 'typescript',
    defaultTimeLimitMinutes: 90,
    defaultDescription:
      'Solve customer problems with technical judgment, communication, product thinking, and fast implementation.',
    stages: [
      {
        name: 'Customer scenario assessment',
        kind: 'assessment',
        description: 'Technical solution and written customer response',
      },
      {
        name: 'Demo walkthrough',
        kind: 'step',
        description: 'Present the solution and handle constraints',
      },
      {
        name: 'Technical screen',
        kind: 'step',
        description: 'APIs, debugging, and integration fluency',
      },
      {
        name: 'Final debrief',
        kind: 'step',
        description: 'Role fit and customer-facing calibration',
      },
    ],
  },
  {
    key: 'data_ml_engineer',
    name: 'Data / ML Engineer',
    subtitle: 'Pipelines, modeling, analytics, ML systems',
    defaultTitle: 'Data Engineer',
    defaultJobProfile: 'Data and ML Engineering',
    defaultType: 'Full-Time',
    defaultWorkMode: 'Hybrid',
    defaultExperience: '1-4 years',
    defaultSkills: ['Python', 'SQL', 'Pipelines', 'ML', 'Data Quality'],
    defaultLanguage: 'python',
    defaultTimeLimitMinutes: 90,
    defaultDescription:
      'Build reliable data products, reason about quality, model tradeoffs, and operationalize data workflows.',
    stages: [
      {
        name: 'Data task assessment',
        kind: 'assessment',
        description: 'Pipeline, analysis, or ML task with quality checks',
      },
      {
        name: 'Debugging assessment',
        kind: 'assessment',
        description: 'Find data quality, performance, or modeling issues',
      },
      {
        name: 'Technical walkthrough',
        kind: 'step',
        description: 'Explain assumptions, metrics, and deployment tradeoffs',
      },
      {
        name: 'Stakeholder round',
        kind: 'step',
        description: 'Translate technical work into product and business outcomes',
      },
      {
        name: 'Final debrief',
        kind: 'step',
        description: 'Hiring decision and team matching',
      },
    ],
  },
];

export const getHiringRoleTemplate = (key?: string | null) =>
  HIRING_ROLE_TEMPLATES.find((template) => template.key === key);
