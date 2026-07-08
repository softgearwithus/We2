# Company Panel Production QA Gate

Use this as the release checklist before marking the company hiring panel production-ready. Each case should pass for owner/admin permissions and fail safely for unauthorized users where applicable.

## Auth, Session, And Access
1. Company owner can sign in and land on `/industry/dashboard`.
2. Company teammate can sign in and land on `/industry/dashboard`.
3. Student cannot access `/industry/dashboard`.
4. Unauthenticated user is redirected from every `/industry/*` private route.
5. Expired token redirects without losing public job browsing.
6. Revoked session shows the session-revoked flow.
7. 2FA-disabled company user signs in without a 2FA challenge.
8. 2FA-enabled company user with a saved secret sees the login challenge.
9. Wrong 2FA code is rejected.
10. Correct 2FA code completes login and logout clears company dashboard access.

## Individual And Security Settings
11. Individual profile loads saved name, email, timezone, and avatar fields.
12. Individual profile saves valid edits.
13. Invalid profile payload shows field-level or clear API error.
14. Password change rejects wrong current password.
15. Password change succeeds with correct current password.
16. Password change invalidates older sessions.
17. 2FA setup shows a secret/QR and requires verification.
18. 2FA disable requires valid confirmation and generic profile update cannot enable or disable 2FA.
19. Delete/deactivate account requires password confirmation.
20. Non-owner cannot deactivate the company workspace.

## Team And Permissions
21. Team tab lists owner.
22. Team tab lists active teammates.
23. Team tab lists pending invites.
24. Owner can invite an admin and see email delivery status.
25. Owner can invite a member; failed email delivery exposes a copyable invite link.
26. Duplicate pending invite is rejected.
27. Resend invite updates expiry, link, delivery status, and delivery error.
28. Revoke invite prevents acceptance.
29. Accepted invite creates a company member.
30. Member sees shared company drives and assessments.
31. Admin can create roles if allowed.
32. Member cannot remove owner.
33. Owner cannot be removed by anyone.
34. Role change from member to admin persists.
35. Removed teammate loses company resource access.

## Billing
36. Billing tab loads current plan.
37. Usage counters match backend counts.
38. Checkout order is created for company pro plan.
39. Invalid Razorpay signature is rejected.
40. Valid payment updates subscription state.
41. Payment history shows the completed order.
42. Failed payment remains non-active.
43. Student billing endpoints remain unchanged.
44. Non-company user cannot hit company billing APIs.
45. Cross-company billing data is blocked.

## Company Profile And Context
46. Company profile loads default profile.
47. Company display/legal name saves.
48. Company slug uniqueness is enforced.
49. Website/support email validation works.
50. Company description and context save.
51. Hiring defaults save and reload.
52. Inherit company profile toggle affects assessment generation context.
53. Parsed repo tech stack appears in context where available.
54. Profile changes are reflected in new role generation.
55. Cross-company profile access is blocked.

## API Keys And Audit Log
56. API key can be created with valid scopes.
57. API key secret is shown only once.
58. API key list shows prefix, scopes, status, and last-used.
59. Revoked API key cannot be used.
60. Invalid scope is rejected.
61. Cross-company API key revoke is blocked.
62. Audit log records settings changes.
63. Audit log records team invite changes with email delivery metadata.
64. Audit log records billing events.
65. Audit log records GitHub link/parse/delete actions.
66. Audit log records assessment generation attempts.

## GitHub Integrations
67. Config-missing state lists missing GitHub env vars.
68. Connect GitHub redirects to GitHub App install URL.
69. Callback stores installation for the company.
70. Sync granted repos lists available repos.
71. Main linked list stays empty until a repo is linked.
72. Link Repository moves repo to linked list.
73. Parse stores README, languages, topics, tree summary, and manifests.
74. Re-parse overwrites latest stored context.
75. Branch edit clears parsed context and requires re-parse.
76. Delete context removes stored snapshot.
77. Unlink removes repo from linked list.
78. Revoked GitHub access marks repo as revoked on sync.
79. Revoked repo cannot be used for assessment generation.
80. Cross-company repo IDs are rejected.

## Assessment Generation And History
81. New Assessment opens prompt-first flow.
82. Existing role flow pulls role context.
83. New role flow creates role then attaches assessment.
84. Job description paste is stored as context.
85. Job description upload is parsed for txt, md, and pdf.
86. Job description URL fetch has clear timeout/content errors.
87. Parsed repo picker only allows parsed linked repos.
88. Unparsed repo cannot generate assessment.
89. Generated JSON includes title, brief, tasks, files, constraints, rubric, reviewer notes, and handoff notes.
90. Guardrail check rejects vague/missing rubric or impossible time limit.
91. Failed generation creates a generation-run record.
92. Successful generation saves to company library.
93. Attached assessment appears in role ATS invite dropdown.
94. Cross-company assessment attach is blocked.
95. Refresh restores local assessment draft.

## Role, ATS, Screening, Interview, And Student Flow
96. Company can create role, attach assessment, and publish posting.
97. Student can apply and sees application history.
98. Apply saves resume preview and keeps status as applied/pending screening.
99. Screen pending candidates scores only unscreened submitted candidates deterministically.
100. Score below threshold rejects candidate, sends rejection email, and student sees rejected.
101. Score above threshold shortlists candidate, sends next-step email, and student sees shortlisted/interview invited.
102. Automatic screening creates candidate interview link for shortlisted candidates when interviewer config exists.
103. Email failure still preserves visible invite/interview link/status and retry state.
104. Interview launch failure marks retryable state.
105. Retry interview can relaunch only for shortlisted candidates.
106. Candidate invite only allows assessments attached to that role.
107. ATS table shows candidate count, score, stage, student-facing status, email status, and interview status.
108. Candidate review updates stage, decision, score, notes, and summary.
109. Dashboard counts match ATS pipeline state.
110. Student dashboard link opens interview when invited.

## Production UX And Safety
111. Mobile ATS candidate table remains usable horizontally.
112. Settings tabs fit on mobile without overlap.
113. Integrations repo rows fit long repo names and branch names.
114. All destructive repo actions are clear and reversible where possible.
115. Loading states prevent duplicate submissions.
116. Empty states explain next action without dead ends.
117. Error states use clear, non-technical wording.
118. No private repo raw context is exposed to students.
119. Candidate-facing assessment excludes secrets/internal prompts.
120. Backend and frontend typechecks pass before release.
