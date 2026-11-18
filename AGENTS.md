<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Assistant suggestions poll public CMS: latest article/expert plus nearest upcoming event (else latest past); dedupe by ID, normalized titles and source URLs; never persist chat.
- About-page tabs use controlled accessible Tabs panels; council entries reuse published CMS experts with council roles so navigation never implies unverified appointments.
- Public membership registration reuses the shared form and published tier catalog; institute-admin issuance imports an explicitly selected CRM request, sends a same-origin auth invitation, then inserts an approved profile with timestamps; personal-page approval is separate from term validity, and visitor submissions never auto-activate membership or link CRM by email.
- Founder portrait uses supplied photos and bilingual paragraph-level press citations; never infer awards/dates from captions.
- Article/event photos come from the original source with bilingual attribution on CMS rows, rendered via EventPhoto; never substitute generic images.
- Member dashboard reads the verified owner's profile/payment snapshots under RLS and polls one query; active membership gates activity records. Public Dinner schedules never imply reserved seats; never match CRM by email.
- Member page, assistant and news event registration links share the event-ID page and form; submitLead validates the published future occurrence, stores participant quantity on the CRM request, and never guarantees a seat.
- Public event counts use an aggregate-only database function, counting the maximum requested group size once per normalized email/event; no public registrant identities or customer consultation statuses enter the totals.
- Assistant factual lookup includes sourced public posts and experts; dated past events return no registration action and appear as event history, so archived coverage never becomes a fabricated upcoming schedule.
- Department-addressed contact messages use the shared contact schema on client and server and retain department labels in CRM request messages; no unverified phone numbers or email addresses are displayed.
- Researched news stores publisher, HTTPS source and original date; publish attributed bilingual summaries, not copied full articles.
- Recurring schedules reuse events/staff RLS: one row per occurrence and nullable positive capacity.
- Website search indexes published CMS and curated bilingual pages only, linking stable anchors; exclude CRM and private chats.
- Guest assistant uses a public text-only session transport; account threads retain authoritative owner-only history. Personal tools derive identity from verified auth and read only active institute-issued member profiles and records under RLS, never email-matched CRM data or staff notes.
- Admins invite and edit institute-issued members under RLS; whitelist profile fields, preserve auth identity and invitation history, and separate approval from activation/term validity. Existing-account email links prevent visitor signup activating membership.
- UI text lives in `src/content/vi.ts` and `en.ts` (same `Dict` shape); components import the live `t` from `src/content/i18n.ts`, and the root remounts on language change so `t` stays current.
- Public form submissions go through `submitLead` in `src/lib/leads.functions.ts` (zod-validated, server-side insert into `leads`); visitors never read leads.
- CRM access is role-based via `public.user_roles` + `has_role()` (admin/staff); the first account created becomes admin via trigger.
- Editable site content (courses, posts, experts, events) lives in DB tables with `<field>` + optional `<field>_en` columns; public pages read published rows via `publicContentQuery` (src/lib/cms.functions.ts) and render with `L(row, field)`; staff edit at `/cms` through the browser client under RLS.
- CMS registration tracking reads course-source CRM leads under staff RLS and invalidates the shared leads query prefix after status changes, so both management views use the same records; legacy quantities are extracted only from the known registration message format.
- Canonical customers are keyed by trimmed, lowercase email; every lead remains a separate request linked by customer_id. Database triggers synchronize the customer-level status on all requests, including new submissions, and CRM lists one customer with request history.
- CMS shared tracking reuses the CRM customer query/updates; source filters count unique customers.
- Membership plans are an extensible CMS catalog with generated stable IDs; staff create/edit/delete unused plans under RLS, while foreign keys preserve referenced plans (hide instead). Public display and registration use published rows, issuance verifies the selected catalog row, and server-side title resolution prevents catalog drift.
- CMS photos upload to private cms-media (public buckets blocked) as browser-resized WebP large/thumb with long-lived signed links in image_url/image_thumb_url; never bundle CMS media in code.
- Partnership orders use a separate catalog and bank settings; validated public submissions snapshot server-priced totals as pending, staff-only confirmation stamps receipt in a trigger, and no public order reads expose partner identities.
- Member payment orders bind to verified institute profiles; admin receipt trigger atomically approves/activates the selected plan and term. Collection requires confirmed fees; owners read only their orders.
- Clients/partners/sponsors are CMS `partners` rows shown on the homepage only when published; never invent organizations.
- Article bodies are Tiptap HTML (legacy plain text allowed); render only via `sanitizeRichHtml` since staff input is public.
- Server functions need Lovable-hosted secrets (service key, AI key); custom domains must point to Lovable hosting, since self-hosted copies fail every form and AI call.
