You are editing the README.md for this project.

Goal
Add a new plain-text section titled HEALTH CHECKLIST to README.md. Do not use markdown hash headings (#) or asterisks. Keep the section exactly as provided below. Preserve all existing content and append this section near the end under a new heading line that is plain text (no #).

Edits
1) If README.md does not exist, create it and include the existing top content from the repository description (if available), then append the section below.
2) If README.md exists, append the section below at the end of the file with one blank line before it.

Insert exactly this block (do not alter wording, punctuation, or spacing):

HEALTH CHECKLIST

Quick start
[ ] Install dependencies with npm ci
[ ] Typecheck passes with npm run typecheck
[ ] Lint passes with npm run lint
[ ] Start backend with bun run backend/server.ts
[ ] Start app with npx expo start

Backend
[ ] Health endpoint returns 200 at http://localhost:3001/health
[ ] CORS is restricted in production via ALLOWED_ORIGINS
[ ] Rate limiting is active and body size is capped to 1 MB
[ ] Server logs show method, path, status, and duration

Auth
[ ] Sign in works and a Firebase token is issued on the client
[ ] Requests include Authorization Bearer token
[ ] Protected mutations fail with 401 when unauthenticated
[ ] Protected mutations succeed when authenticated

Data flows
[ ] Home list loads from tRPC events.list
[ ] Event detail loads from tRPC events.byId
[ ] Toggle favorite updates immediately and persists per user
[ ] Add child works and shows success or error
[ ] Create event works with validation errors shown to the user
[ ] Create booking respects server inventory rules and shows a toast

UX states
[ ] LoadingState shows while fetching
[ ] ErrorState shows on failure with a working retry
[ ] EmptyState shows when lists are empty

Accessibility
[ ] All tappable controls meet a minimum 44 px size or use AccessiblePressable
[ ] Important actions include accessibilityLabel
[ ] Text and icon contrast meets WCAG AA on primary backgrounds

Performance
[ ] Images use consistent sizes and caching
[ ] Unused icons and modules are removed from bundles
[ ] Query caching is configured with sensible stale times

Security and secrets
[ ] No MailerLite keys or other secrets on the client
[ ] Server reads secrets from environment variables only
[ ] All input and output are validated with shared zod schemas

Dev ergonomics
[ ] Dev all-in-one works if defined (dev:all to run backend and app together)
[ ] Prettier format succeeds with npm run format
[ ] CI runs typecheck and lint on push and pull requests

Troubleshooting quick checks
[ ] If lists do not load, confirm EXPO_PUBLIC_API_BASE_URL and backend port
[ ] If protected calls fail, confirm Authorization header and Firebase Admin env vars
[ ] If bookings fail, confirm event has sufficient spotsLeft

Acceptance checks
- README.md ends with the HEALTH CHECKLIST section exactly as above.
- No hashtags (#) or asterisks were introduced in this section.
- Existing README content remains unchanged above the new section.

Output
- Show the final diff for README.md.
- Print the last 60 lines of README.md so I can visually confirm the new section.
