const parsedLimit = Number(process.env.FREE_PLAN_SECTION_LIMIT_SECONDS);
export const FREE_PLAN_SECTION_LIMIT_SECONDS = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : 5;

export const USAGE_SECTION_KEYS = {
    DSA: 'dsa',
    SQL: 'sql',
    TEST_SERIES_SUBJECT: 'test_series_subject',
    TEST_SERIES_COMPANY: 'test_series_company',
    TEST_SERIES_COMMUNICATION: 'test_series_communication',
    INTERVIEW_AUDIO: 'interview_audio',
    INTERVIEW_VIDEO: 'interview_video',
    PREPARATION: 'preparation',
    PROJECT_LABS: 'project_labs',
    PROJECT_BUILDER: 'project_builder',
    RESUME: 'resume',
} as const;

export type UsageSectionKey = typeof USAGE_SECTION_KEYS[keyof typeof USAGE_SECTION_KEYS];
