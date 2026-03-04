# AI Interviewer Voice - Local QA

This repo runs a 2-service flow for Vapi:

- Next.js frontend (3000)
- NestJS backend (3001)

Vapi handles the live interview call. The backend provisions a Vapi assistant per session and stores the call analysis.

## Prereqs

- Docker running
- A user that can access `/dashboard/interview` (plan >= standard)
- At least 1 remaining video interview credit

## Environment

Vapi requires these environment variables:

- Backend: `VAPI_API_KEY`, `VAPI_BASE_URL` (optional; defaults to https://api.vapi.ai)
- Frontend: `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
- Backend webhook: `BASE_URL` (public URL for Vapi to POST to `/interview/vapi/webhook`)

## Run

1) Start services

```bash
docker compose up -d --build
```

2) Login to the frontend, upload a resume, start an interview

- Resume upload creates a Vapi knowledge base for personalization.
- Interview duration is fixed at 15 minutes.

3) Voice QA checklist

- Start session and confirm Vapi connects.
- Speak naturally; transcript appears in the chat feed.
- Toggle mute to confirm the mic control works.

4) End interview and verify report

- Click `End Call`
- The UI polls `/interview/vapi/sessions/:id/report` until available.

## Useful endpoints

- Backend report: `GET http://localhost:3001/interview/vapi/sessions/:id/report`
- Vapi webhook: `POST http://localhost:3001/interview/vapi/webhook`
