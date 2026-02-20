# Institute Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace institute mock analytics with real, college-scoped data for the full institute suite (dashboard, students, placements, skills, reports).

**Architecture:** Add a `StudentProfile` entity to capture academic metadata, then compute institute analytics in `AnalyticsService` from real users, DSA submissions, interviews, simulations, and resume data. Keep current API entry points and update frontend clients/components to consume real endpoints and show empty states.

**Tech Stack:** NestJS, TypeORM, Postgres, Next.js (App Router), Recharts, Framer Motion.

---

### Task 1: Add StudentProfile entity and module

**Files:**
- Create: `backend/src/students/student-profile.entity.ts`
- Create: `backend/src/students/students.module.ts`
- Modify: `backend/src/app.module.ts`

**Step 1: Write failing test**

Create `backend/src/students/students.module.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { StudentsModule } from './students.module';

describe('StudentsModule', () => {
    it('should compile the module', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [StudentsModule],
        }).compile();

        expect(moduleRef).toBeDefined();
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- students.module.spec.ts`
Expected: FAIL (module not found).

**Step 3: Write minimal implementation**

Create `backend/src/students/student-profile.entity.ts`:

```ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PlacementStatus {
    PLACED = 'Placed',
    LOOKING = 'Looking',
    HIGHER_STUDIES = 'Higher Studies',
    AT_RISK = 'At Risk',
}

@Entity('student_profiles')
@Index(['collegeId'])
@Index(['userId'], { unique: true })
export class StudentProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid', nullable: true })
    collegeId: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    department: string | null;

    @Column({ type: 'int', nullable: true })
    year: number | null;

    @Column({ type: 'float', nullable: true })
    cgpa: number | null;

    @Column({ type: 'int', nullable: true })
    attendance: number | null;

    @Column({ type: 'varchar', length: 32, nullable: true })
    placementStatus: PlacementStatus | null;

    @Column({ type: 'timestamp', nullable: true })
    placementStatusUpdatedAt: Date | null;

    @Column({ type: 'int', nullable: true })
    resumeScore: number | null;

    @Column({ type: 'simple-json', nullable: true })
    skillScores: {
        coding?: number;
        aptitude?: number;
        communication?: number;
        core?: number;
    } | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
```

Create `backend/src/students/students.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from './student-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StudentProfile])],
    exports: [TypeOrmModule],
})
export class StudentsModule {}
```

Update `backend/src/app.module.ts` to include `StudentProfile` and `StudentsModule`:

```ts
import { StudentProfile } from './students/student-profile.entity';
import { StudentsModule } from './students/students.module';
```

Add `StudentProfile` to TypeORM entities list and `StudentsModule` to imports.

**Step 4: Run test to verify it passes**

Run: `npm test -- students.module.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/students backend/src/app.module.ts
git commit -m "feat: add student profile entity"
```

---

### Task 2: Create analytics DTOs and helper utilities

**Files:**
- Create: `backend/src/analytics/dto/institute-analytics.dto.ts`
- Modify: `backend/src/analytics/analytics.service.ts`

**Step 1: Write failing test**

Create `backend/src/analytics/analytics.service.spec.ts` with a minimal test that imports the DTOs and validates typing:

```ts
import { InstituteStudentResponse } from './dto/institute-analytics.dto';

describe('Institute analytics DTOs', () => {
    it('should allow empty response shape', () => {
        const response: InstituteStudentResponse = {
            data: [],
            total: 0,
            page: 0,
            pageSize: 25,
        };
        expect(response.total).toBe(0);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- analytics.service.spec.ts`
Expected: FAIL (DTO file missing).

**Step 3: Write minimal implementation**

Create `backend/src/analytics/dto/institute-analytics.dto.ts`:

```ts
export interface InstituteStudentDTO {
    id: string;
    name: string;
    department: string | null;
    year: number | null;
    cgpa: number | null;
    attendance: number | null;
    placementReadiness: number;
    skills: {
        coding: number;
        aptitude: number;
        communication: number;
        core: number;
    };
    status: string;
}

export interface InstituteStudentResponse {
    data: InstituteStudentDTO[];
    total: number;
    page: number;
    pageSize: number;
}

export interface DepartmentStatsDTO {
    name: string;
    studentCount: number;
    avgAttendance: number;
    avgReadiness: number;
    placementRate: number;
}

export interface PlacementMetricsDTO {
    coding: number;
    aptitude: number;
    communication: number;
    core: number;
}

export interface PlacementTrendDTO {
    month: string;
    placed: number;
    offers: number;
}

export interface ResumeQualityBucketDTO {
    bucket: string;
    count: number;
}

export interface InterviewTrendDTO {
    week: string;
    interviews: number;
    avgScore: number;
}

export interface SkillHeatmapDTO {
    department: string;
    skills: PlacementMetricsDTO;
}

export interface WeakAreaDTO {
    topic: string;
    domain: string;
    severity: 'High' | 'Medium' | 'Low';
    impacted: string;
    action: string;
}
```

Add helper functions in `analytics.service.ts` for clamp and weighted averages.

**Step 4: Run test to verify it passes**

Run: `npm test -- analytics.service.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/analytics/dto backend/src/analytics/analytics.service.ts backend/src/analytics/analytics.service.spec.ts
git commit -m "feat: add institute analytics DTOs"
```

---

### Task 3: Replace mock institute analytics with real aggregation

**Files:**
- Modify: `backend/src/analytics/analytics.service.ts`
- Modify: `backend/src/analytics/analytics.module.ts`
- Modify: `backend/src/analytics/analytics.controller.ts`

**Step 1: Write failing test**

Create `backend/src/analytics/analytics.institute.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { StudentProfile } from '../students/student-profile.entity';
import { Submission } from '../dsa/entities/submission.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { Simulation } from '../simulations/entities/simulation.entity';
import { Resume } from '../resume/entities/resume.entity';
import { DsaProblem } from '../dsa/entities/dsa-problem.entity';

describe('Institute analytics', () => {
    it('returns zeroed dashboard for empty college', async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                { provide: getRepositoryToken(User), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(StudentProfile), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(Submission), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(InterviewSession), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(Simulation), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(Resume), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(DsaProblem), useValue: { count: async () => 0 } },
            ],
        }).compile();

        const service = moduleRef.get(AnalyticsService);
        const result = await service.getInstituteDashboard('college-1');
        expect(result.totalStudents).toBe(0);
        expect(result.placementRate).toBe(0);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- analytics.institute.spec.ts`
Expected: FAIL (missing dependencies / current mock implementation).

**Step 3: Write minimal implementation**

In `analytics.module.ts`, add repositories for `User`, `StudentProfile`, `InterviewSession`, `Simulation`, and `Resume`.

In `analytics.service.ts`, replace mock generation with:
- Fetch college-scoped students (role=student, collegeId).
- Fetch StudentProfile records for those users.
- Compute skills/readiness per student (use profile skillScores if present).
- Compute department stats, top students, placement metrics.
- Add new methods: `getInstitutePlacementTrends`, `getInstituteResumeQuality`, `getInstituteInterviewTrends`, `getInstituteSkillHeatmap`, `getInstituteWeakAreas`.

In `analytics.controller.ts`, add endpoints for:
- `/analytics/institute/placements/trends`
- `/analytics/institute/placements/resume-quality`
- `/analytics/institute/interviews/trends`
- `/analytics/institute/skills/heatmap`
- `/analytics/institute/skills/weak-areas`

**Step 4: Run test to verify it passes**

Run: `npm test -- analytics.institute.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/analytics backend/src/students
git commit -m "feat: compute institute analytics from real data"
```

---

### Task 4: Update institute client to use real endpoints and empty states

**Files:**
- Modify: `frontend/lib/institute/client.ts`
- Modify: `frontend/lib/institute/types.ts`

**Step 1: Write failing test**

Create `frontend/lib/institute/client.spec.ts`:

```ts
import { fetchInstituteDashboard } from './client';

describe('institute client', () => {
    it('throws on non-200 response', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => 'fail' });
        await expect(fetchInstituteDashboard()).rejects.toThrow('Failed to load institute dashboard');
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- client.spec.ts`
Expected: FAIL (no test runner in frontend yet).

**Step 3: Write minimal implementation**

Update `client.ts` to:
- Remove mock fallback.
- Add fetchers for the new endpoints.
- Return empty objects on 204/404 with a consistent shape.

Update `types.ts` to include new trend/heatmap types.

**Step 4: Run test to verify it passes**

Run: `npm test -- client.spec.ts`
Expected: PASS (if vitest/jest set up). If no frontend test runner exists, document and skip.

**Step 5: Commit**

```bash
git add frontend/lib/institute
git commit -m "feat: wire institute client to real analytics"
```

---

### Task 5: Wire placements charts to real endpoints

**Files:**
- Modify: `frontend/components/institute/Dashboard/PlacementChart.tsx`
- Modify: `frontend/components/institute/Placements/ResumeQualityChart.tsx`
- Modify: `frontend/components/institute/Placements/MockInterviewTrends.tsx`

**Step 1: Write failing test**

Skip UI tests if frontend test runner is absent; instead add a manual verification note to the PR.

**Step 2: Write minimal implementation**

- `PlacementChart`: fetch placements trends, fallback to empty dataset.
- `ResumeQualityChart`: fetch resume quality buckets.
- `MockInterviewTrends`: fetch interview trends.

**Step 3: Manual verification**

Run: `npm run dev` (frontend) and visit:
- `/institute/dashboard`
- `/institute/placements`
Expected: charts render without placeholder static data.

**Step 4: Commit**

```bash
git add frontend/components/institute
git commit -m "feat: wire institute charts to analytics"
```

---

### Task 6: Wire skills and reports to real endpoints

**Files:**
- Modify: `frontend/components/institute/Skills/SkillHeatmap.tsx`
- Modify: `frontend/components/institute/Skills/WeakAreaList.tsx`
- Modify: `frontend/app/institute/reports/page.tsx`

**Step 1: Write failing test**

Skip UI tests if frontend test runner is absent; document manual verification.

**Step 2: Write minimal implementation**

- Fetch skill heatmap from `/analytics/institute/skills/heatmap`.
- Fetch weak areas from `/analytics/institute/skills/weak-areas`.
- Reports page uses real students and empty state messaging.

**Step 3: Manual verification**

Visit `/institute/skills` and `/institute/reports`.

**Step 4: Commit**

```bash
git add frontend/components/institute frontend/app/institute
git commit -m "feat: wire institute skills and reports"
```

---

### Task 7: Update students data contract and modal import

**Files:**
- Modify: `frontend/components/institute/Students/StudentProfileModal.tsx`
- Modify: `frontend/lib/institute/types.ts`

**Step 1: Write failing test**

Skip UI tests if frontend test runner is absent; document manual verification.

**Step 2: Write minimal implementation**

- Fix `StudentProfileModal` import to use `frontend/lib/institute/types.ts` (not mockData).
- Ensure student types allow nullable fields (department/year/cgpa/attendance).

**Step 3: Manual verification**

Visit `/institute/students`, open a profile modal.

**Step 4: Commit**

```bash
git add frontend/components/institute/Students frontend/lib/institute/types.ts
git commit -m "fix: align student modal with real data"
```

---

### Task 8: Add admin data entry for student profiles (optional)

**Files:**
- Create: `backend/src/students/dto/update-student-profile.dto.ts`
- Create: `backend/src/students/students.controller.ts`
- Modify: `backend/src/students/students.module.ts`

**Step 1: Write failing test**

Create `backend/src/students/students.controller.spec.ts` with a simple compile test.

**Step 2: Run test to verify it fails**

Run: `npm test -- students.controller.spec.ts`
Expected: FAIL (controller missing).

**Step 3: Write minimal implementation**

- Add admin-only endpoints to create/update student profile data.
- Use roles guard (super_admin, college_admin).

**Step 4: Run test to verify it passes**

Run: `npm test -- students.controller.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/students
git commit -m "feat: add student profile admin endpoints"
```

---

### Task 9: Documentation and manual verification notes

**Files:**
- Modify: `docs/plans/2026-02-20-institute-dashboard-implementation-plan.md`

**Step 1: Update plan with verification notes**

Add a short section describing manual checks (dashboard, students, placements, skills, reports) and expected behavior.

#### Manual Verification Checklist

- `/institute/dashboard`: stats cards render, department performance list populates, placement chart loads with live data, top performers render or show empty state.
- `/institute/students`: table populates via API, filters/search update results, pagination updates page/total correctly, empty state when no students.
- `/institute/placements`: readiness metrics use live averages, resume quality and interview trends charts load without static data.
- `/institute/skills`: heatmap loads from API (projects derived from coding/core), weak areas list renders or shows empty state.
- `/institute/reports`: leaderboard renders from API data, shows loading/empty state appropriately.

**Step 2: Commit**

```bash
git add docs/plans/2026-02-20-institute-dashboard-implementation-plan.md
git commit -m "docs: add institute analytics verification steps"
```
