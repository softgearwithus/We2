# Institute Analytics Client Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace institute mock data with real API client/types and wire institute pages/components to use them with empty state handling.

**Architecture:** Add a typed client module under `frontend/lib/institute` that calls real endpoints using `API_BASE_URL` and includes browser auth headers. Create shared types for institute analytics data, then update institute pages/components to import from the new types/client instead of mock data.

**Tech Stack:** Next.js (React), TypeScript, fetch API

---

### Task 1: Create institute types module

**Files:**
- Create: `frontend/lib/institute/types.ts`

**Step 1: Write the failing test**

No test harness specified for frontend; skip tests.

**Step 2: Run test to verify it fails**

Skip (no frontend test runner).

**Step 3: Write minimal implementation**

Add interfaces:

```ts
export interface Student {
    id: string;
    name: string;
    department: string;
    year: number;
    cgpa: number;
    attendance: number;
    placementReadiness: number;
    skills: {
        coding: number;
        aptitude: number;
        communication: number;
        core: number;
    };
    status: string;
}

export interface DepartmentStats {
    name: string;
    studentCount: number;
    avgAttendance: number;
    avgReadiness: number;
    placementRate: number;
}

export interface PlacementMetrics {
    coding: number;
    aptitude: number;
    communication: number;
    core: number;
}

export interface PlacementTrend {
    month: string;
    placed: number;
    offers: number;
}

export interface ResumeQualityBucket {
    bucket: string;
    count: number;
}

export interface InterviewTrend {
    week: string;
    interviews: number;
    avgScore: number;
}

export interface SkillHeatmap {
    department: string;
    skills: PlacementMetrics;
}

export interface WeakArea {
    topic: string;
    domain: string;
    severity: 'Low' | 'Medium' | 'High' | string;
    impacted: number;
    action: string;
}

export interface InstituteDashboardData {
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
    problemCount: number;
    topStudents: Student[];
    departmentStats: DepartmentStats[];
}

export interface InstituteStudentQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    year?: number | null;
    department?: string | null;
    status?: string | null;
}

export interface InstituteStudentResponse {
    students: Student[];
    total: number;
    page: number;
    pageSize: number;
}
```

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 2: Create institute client module

**Files:**
- Create: `frontend/lib/institute/client.ts`

**Step 1: Write the failing test**

Skip (no frontend test runner).

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

Implement fetch helpers:

```ts
import API_BASE_URL from '@/app/lib/api-config';
import {
    InstituteDashboardData,
    InstituteStudentQuery,
    InstituteStudentResponse,
    PlacementMetrics,
    PlacementTrend,
    ResumeQualityBucket,
    InterviewTrend,
    SkillHeatmap,
    WeakArea,
} from './types';

const getAuthHeaders = (): HeadersInit => {
    if (typeof window === 'undefined') return {};
    const token = window.localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async <T>(path: string, options: RequestInit = {}, emptyValue: T): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...(options.headers || {}),
        },
    });

    if (response.status === 204 || response.status === 404) {
        return emptyValue;
    }

    if (!response.ok) {
        throw new Error(`Institute API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
};

export const fetchInstituteDashboard = () =>
    request<InstituteDashboardData>('/institute/dashboard', {}, {
        totalStudents: 0,
        placedStudents: 0,
        placementRate: 0,
        problemCount: 0,
        topStudents: [],
        departmentStats: [],
    });

export const fetchInstituteStudents = (query: InstituteStudentQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page != null) params.set('page', String(query.page));
    if (query.pageSize != null) params.set('pageSize', String(query.pageSize));
    if (query.search) params.set('search', query.search);
    if (query.year != null) params.set('year', String(query.year));
    if (query.department) params.set('department', query.department);
    if (query.status) params.set('status', query.status);

    const queryString = params.toString();
    return request<InstituteStudentResponse>(`/institute/students${queryString ? `?${queryString}` : ''}`, {}, {
        students: [],
        total: 0,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
    });
};

export const fetchPlacementMetrics = () =>
    request<PlacementMetrics>('/institute/placements/metrics', {}, {
        coding: 0,
        aptitude: 0,
        communication: 0,
        core: 0,
    });

export const fetchPlacementTrends = () =>
    request<PlacementTrend[]>('/institute/placements/trends', {}, []);

export const fetchResumeQuality = () =>
    request<ResumeQualityBucket[]>('/institute/placements/resume-quality', {}, []);

export const fetchInterviewTrends = () =>
    request<InterviewTrend[]>('/institute/placements/interviews', {}, []);

export const fetchSkillHeatmap = () =>
    request<SkillHeatmap[]>('/institute/skills/heatmap', {}, []);

export const fetchWeakAreas = () =>
    request<WeakArea[]>('/institute/skills/weak-areas', {}, []);
```

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 3: Wire dashboard page to client/types

**Files:**
- Modify: `frontend/app/institute/dashboard/page.tsx`

**Step 1: Write the failing test**

Skip.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Replace mock data imports with `fetchInstituteDashboard` and types.
- Use `useEffect` and `useState` to load dashboard data on client.
- Provide empty state values from client or local defaults.

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 4: Wire students page and components to client/types

**Files:**
- Modify: `frontend/app/institute/students/page.tsx`
- Modify: `frontend/components/institute/Students/StudentTable.tsx`
- Modify: `frontend/components/institute/Students/StudentProfileModal.tsx`

**Step 1: Write the failing test**

Skip.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Replace mock data imports with `fetchInstituteStudents` and `Student` type.
- Load students with query params based on filters/search.
- Keep filtering logic aligned with API query; if API already filters, use returned list.
- Update type imports in `StudentTable` and `StudentProfileModal` to use new `types.ts`.

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 5: Wire placements data to client/types

**Files:**
- Modify: `frontend/app/institute/placements/page.tsx`
- Modify: `frontend/components/institute/Placements/ReadinessMetrics.tsx`

**Step 1: Write the failing test**

Skip.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Replace mock student data usage with `fetchPlacementMetrics` and types.
- Update `ReadinessMetrics` to accept a metrics object instead of students array (or compute from API response).

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 6: Wire leaderboard to client/types

**Files:**
- Modify: `frontend/components/institute/Reports/LeaderBoard.tsx`

**Step 1: Write the failing test**

Skip.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Replace mock data usage with data from `fetchInstituteDashboard` (top students, department stats).
- Ensure empty states when arrays are empty.

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 7: Wire placement charts and skills data to client/types

**Files:**
- Modify: `frontend/components/institute/Placements/ResumeQualityChart.tsx`
- Modify: `frontend/components/institute/Placements/MockInterviewTrends.tsx`
- Modify: `frontend/components/institute/Dashboard/PlacementChart.tsx`
- Modify: `frontend/components/institute/Skills/SkillHeatmap.tsx`
- Modify: `frontend/components/institute/Skills/WeakAreaList.tsx`

**Step 1: Write the failing test**

Skip.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Replace internal mock arrays with data fetched from client methods:
  - `fetchPlacementTrends` for PlacementChart
  - `fetchResumeQuality` for ResumeQualityChart
  - `fetchInterviewTrends` for MockInterviewTrends
  - `fetchSkillHeatmap` for SkillHeatmap
  - `fetchWeakAreas` for WeakAreaList
- Use empty arrays from client for 204/404.

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

Do not commit in this task; final commit handled after all changes.

### Task 8: Final commit and verification

**Files:**
- Modify: `frontend/lib/institute/client.ts`
- Modify: `frontend/lib/institute/types.ts`
- Modify: `frontend/app/institute/dashboard/page.tsx`
- Modify: `frontend/app/institute/students/page.tsx`
- Modify: `frontend/app/institute/placements/page.tsx`
- Modify: `frontend/components/institute/Students/StudentTable.tsx`
- Modify: `frontend/components/institute/Students/StudentProfileModal.tsx`
- Modify: `frontend/components/institute/Reports/LeaderBoard.tsx`
- Modify: `frontend/components/institute/Placements/ReadinessMetrics.tsx`
- Modify: `frontend/components/institute/Placements/ResumeQualityChart.tsx`
- Modify: `frontend/components/institute/Placements/MockInterviewTrends.tsx`
- Modify: `frontend/components/institute/Dashboard/PlacementChart.tsx`
- Modify: `frontend/components/institute/Skills/SkillHeatmap.tsx`
- Modify: `frontend/components/institute/Skills/WeakAreaList.tsx`

**Step 1: Write the failing test**

Skip.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Ensure all required files are created and imports updated.
- Add empty states where needed (no UI changes beyond data wiring).

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

```bash
git add frontend/lib/institute frontend/app/institute frontend/components/institute
git commit -m "feat: wire institute client to real analytics"
```
