# Institute Dashboard Real-Data Design
Date: 2026-02-20
Status: Approved

## Context
The institute experience currently renders rich UI but relies on mock data in both the backend analytics service and the frontend institute client. The admin flow creates student accounts with a real `collegeId` (UUID) in `User`, but the analytics endpoints still generate synthetic students (`college_1`, `college_2`, etc). This design replaces mock analytics with real, college-scoped data while keeping the current UI and page structure intact.

## Goals
- Power all institute pages (dashboard, students, placements, skills, reports) from real data.
- Scope every institute query by `req.user.collegeId` and role-based access.
- Keep existing API entry points and frontend components where possible.
- Provide reliable fallbacks and empty states instead of mock data.

## Non-Goals
- Full recruitment CRM (company pipelines, offer management, ATS) in this iteration.
- Major UI redesign of the institute pages.
- Replacing student-facing features outside of institute analytics.

## Assumptions
- Every student account has `User.collegeId` set via the admin flow.
- College admins log in via the institute portal and carry `collegeId` in JWT payload.
- Existing activity data (DSA submissions, interviews, simulations, resumes) may be incomplete, so metrics must tolerate sparse data.

## Proposed Architecture
### Data Sources
- `User` (role=student, collegeId) for scoping and identity.
- New `StudentProfile` table for academic metadata.
- `dsa_submissions` and `dsa_user_states` for coding performance.
- `interview_sessions` for communication scores and mock interview trends.
- `resumes` for resume quality (store analysis score on save).
- `simulations` for aptitude and readiness proxy when available.

### New Entity: StudentProfile
Create `student_profiles` to capture academic and placement metadata not in `User`.

Fields:
- id (uuid)
- userId (uuid, unique)
- collegeId (uuid, indexed, optional denormalization)
- department (string)
- year (int)
- cgpa (float)
- attendance (int, 0-100)
- placementStatus (enum: Placed, Looking, Higher Studies, At Risk)
- placementStatusUpdatedAt (timestamp, optional)
- resumeScore (int, 0-100, optional)
- skillScores (json: coding, aptitude, communication, core, optional)
- createdAt, updatedAt

Notes:
- Academic fields are editable by admins or imported in bulk.
- `skillScores` and `resumeScore` can be computed periodically or updated as new data arrives.

## Analytics Computation
### Student Skills (per student)
If `StudentProfile.skillScores` exists, use it. Otherwise compute from activity:

- codingScore:
  - acceptanceRate = acceptedSubmissions / totalSubmissions * 100
  - avgMastery = average of `dsa_user_states.mastery`
  - codingScore = clamp(0.7 * acceptanceRate + 0.3 * avgMastery)

- communicationScore:
  - avg of `interview_sessions.overallScore` for BEHAVIORAL, HR, GROUP_DISCUSSION
  - default 0 if none

- aptitudeScore:
  - avg of `simulations.score` for `MODE_1_PLACEMENT`
  - default 0 if none

- coreScore:
  - if profile value exists use it
  - else coreScore = clamp(0.6 * codingScore + 0.4 * aptitudeScore)

### Placement Readiness (per student)
If `StudentProfile.placementReadiness` exists, use it. Otherwise:

- resumeScore = `StudentProfile.resumeScore` if available, else null
- base weights: coding 0.4, aptitude 0.2, communication 0.2, resume 0.2
- renormalize weights for missing inputs
- readiness = weighted average, clamp 0-100

### Status (per student)
Use `StudentProfile.placementStatus` if present. Otherwise:
- readiness >= 80 -> Placed
- readiness >= 65 -> Looking
- attendance < 65 -> At Risk
- else -> Higher Studies

## API Contracts
Keep the existing analytics endpoints and response shapes, replacing mock data:

1) GET `/analytics/institute/dashboard`
- totalStudents
- placedStudents
- placementRate
- departmentStats [{ name, studentCount, avgAttendance, avgReadiness, placementRate }]
- topStudents (top readiness)
- problemCount (total DSA problems)

2) GET `/analytics/institute/students`
- paginated list of Student objects
- filters: query, department, year, status

3) GET `/analytics/institute/placements`
- PlacementMetrics { coding, aptitude, communication, core }

Add supporting endpoints for charts that are currently static:

4) GET `/analytics/institute/placements/trends`
- [{ month, placed, offers }]
- placed from `placementStatusUpdatedAt` or derived completion data
- offers optional (null or 0 if not tracked)

5) GET `/analytics/institute/placements/resume-quality`
- [{ bucket, count }]
- buckets: 80-100, 60-79, 40-59, <40

6) GET `/analytics/institute/interviews/trends`
- [{ week, interviews, avgScore }]

7) GET `/analytics/institute/skills/heatmap`
- [{ department, skills: { coding, aptitude, communication, core } }]

8) GET `/analytics/institute/skills/weak-areas`
- [{ topic, domain, severity, impacted, action }]
- derived from lowest-scoring DSA categories or dept averages

All endpoints require JWT; reject requests without collegeId or without college_admin/super_admin roles.

## Frontend Integration
- Replace mock fallbacks in `frontend/lib/institute/client.ts` with real API errors and empty states.
- Update chart components to consume new trend endpoints.
- Keep existing UI structure and styling.

## Error Handling and Empty States
- If `collegeId` is missing: 403 with a clear message.
- If no students: return empty arrays and zeroed metrics.
- If partial data: compute what is available and return safe defaults (0 or null).
- Frontend should show "No data yet" placeholders instead of mock data.

## Performance and Caching
- Fetch student IDs for a college once per request and reuse for aggregates.
- Use TypeORM query builders with joins and groupings to reduce round trips.
- Add indexes on `User.collegeId` and `StudentProfile.collegeId`.

## Testing
- Unit tests for analytics computation (mock repositories).
- Integration test covering `/analytics/institute/*` endpoints with seeded users and activity data.
- Frontend smoke test: dashboard, students, placements, skills, reports load without mock data.

## Migration and Backfill
- Add `student_profiles` table with nullable fields.
- Backfill by creating empty profiles for existing student users.
- Optional: provide CSV import endpoint for department/year/cgpa/attendance.

## Rollout Plan
1) Introduce StudentProfile and new analytics computations.
2) Update institute pages to use real endpoints and show empty states.
3) Add trend endpoints and wire charts.
4) Optionally add placement-drive data later for offers/avgPackage.
