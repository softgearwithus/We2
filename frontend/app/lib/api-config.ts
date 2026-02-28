// API Configuration
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required.');
}

const API_BASE_URL = apiBaseUrl;

if (process.env.NODE_ENV === 'production' && API_BASE_URL.includes('localhost')) {
    throw new Error('NEXT_PUBLIC_API_URL must not point to localhost in production.');
}

if (process.env.NODE_ENV !== 'production') {
    const isLocalhost =
        API_BASE_URL.startsWith('http://localhost') ||
        API_BASE_URL.startsWith('http://127.0.0.1');
    const isDockerBackend = API_BASE_URL.startsWith('http://backend');
    if (!isLocalhost && !isDockerBackend) {
        throw new Error('NEXT_PUBLIC_API_URL must point to localhost or backend in development.');
    }
}

export const API_ENDPOINTS = {
    // Auth
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,

    // Users
    PROFILE: `${API_BASE_URL}/users/profile`,
    DASHBOARD_STATS: `${API_BASE_URL}/users/dashboard-stats`,

    // Simulations
    SIMULATIONS: `${API_BASE_URL}/simulations`,
    SIMULATION_STATS: `${API_BASE_URL}/simulations/stats`,

    // Tasks
    TASKS: `${API_BASE_URL}/tasks`,

    // Teams
    TEAMS: `${API_BASE_URL}/teams`,
    MY_TEAMS: `${API_BASE_URL}/teams/my-teams`,

    // Performance
    PERFORMANCE: `${API_BASE_URL}/performance`,
    PERFORMANCE_ME: `${API_BASE_URL}/performance/me`,

    // Achievements
    ACHIEVEMENTS: `${API_BASE_URL}/achievements`,
    ACHIEVEMENTS_ME: `${API_BASE_URL}/achievements/me`,
    ACHIEVEMENTS_XP: `${API_BASE_URL}/achievements/me/xp`,

    // Interviews
    INTERVIEWS: `${API_BASE_URL}/interview`,
    INTERVIEWS_ME: `${API_BASE_URL}/interviews/me`,
    INTERVIEWS_STATS: `${API_BASE_URL}/interviews/me/stats`,

    // Certifications
    CERTIFICATIONS: `${API_BASE_URL}/certifications`,
    CERTIFICATIONS_ME: `${API_BASE_URL}/certifications/me`,
    CERTIFICATIONS_VERIFY: `${API_BASE_URL}/certifications/verify`,

    // Projects
    PROJECTS: `${API_BASE_URL}/projects`,

    // Health
    HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
