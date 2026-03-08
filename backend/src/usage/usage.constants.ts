const parsedLimit = Number(process.env.FREE_PLAN_SECTION_LIMIT_SECONDS);
export const FREE_PLAN_SECTION_LIMIT_SECONDS = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : 10 * 60;

export const USAGE_SECTION_KEYS = {
    DSA: 'dsa',
    SQL: 'sql',
    TEST_SERIES: 'test_series',
    INTERVIEW_AUDIO: 'interview_audio',
    INTERVIEW_VIDEO: 'interview_video',
    PREPARATION: 'preparation',
    PROJECT_LABS: 'project_labs',
    PROJECT_BUILDER: 'project_builder',
    RESUME: 'resume',
} as const;

export type UsageSectionKey = typeof USAGE_SECTION_KEYS[keyof typeof USAGE_SECTION_KEYS];

export const USAGE_RESET_INTERVAL_DAYS = 30;
