Title: Admin-managed Home Reviews (Testimonials)
Date: 2026-02-20
Status: Draft (approved in chat)

Overview
- Goal: Let super admins create, edit, and manage the home page reviews using the same fields already shown on the home page.
- Scope: Backend module + API + admin page + home page fetch.

Data Model (TypeORM)
- Entity: Testimonial
- Fields:
  - id (uuid, primary)
  - name (string)
  - role (string)
  - image (string URL)
  - package (string)
  - text (string, long)
  - verified (boolean)
  - gradient (string, Tailwind class name like "from-blue-50 to-blue-100/50")
  - isActive (boolean, default true)
  - sortOrder (int, default 0)
  - createdAt, updatedAt (timestamps)

API & Auth
- Public endpoint:
  - GET /testimonials/public
  - Returns only isActive=true, ordered by sortOrder ASC, createdAt DESC.
- Admin endpoints (super_admin only, JWT + RolesGuard):
  - GET /testimonials (list all)
  - POST /testimonials (create)
  - PATCH /testimonials/:id (update)
  - DELETE /testimonials/:id (delete)
- Validation:
  - name/role/package: string, max length
  - image: URL
  - text: string, max length
  - verified/isActive: boolean
  - sortOrder: integer

Admin Panel UX
- New page: /admin/testimonials
- List cards/table with actions: edit, toggle active, delete.
- Create/Edit form fields:
  - name, role, image URL, package, text
  - verified toggle
  - gradient select (predefined list)
  - isActive toggle
  - sortOrder input
- Success/error toast or inline message on save/delete.

Home Page Integration
- Replace the hardcoded list in Testimonials component with API data.
- Use fallback empty array if fetch fails to avoid crash.
- Keep the UI layout and card styles the same; only data source changes.

Error Handling
- Admin errors show a clear message and keep form state.
- Backend returns validation errors for bad input.
- Public endpoint failure degrades gracefully (no testimonials shown).

Testing & Verification
- Manual check:
  - Create a testimonial in admin panel, refresh home page to confirm it appears.
  - Toggle isActive to verify hide/show.
  - Edit fields to verify update.
  - Delete to verify removal.
