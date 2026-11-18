# Member profile payment history
- [x] Show owner-only payment history and current membership on the existing personal page; refresh both together every 15 seconds and on window focus.
- [x] Pass 15 relevant tests and verify signed-out protection without runtime errors; preview compilation succeeds.
- [ ] Verify signed-in payment/profile read-back: blocked because no institute auth users exist; session minting failed.

# Additional CEO Lê Dung news
- [x] Add seven verified nonduplicate CEO Lê Dung articles as bilingual CMS summaries with original dates and source URLs; public article count increased from 10 to 17. Exclude the anniversary article with conflicting publication metadata.

# Member bank payments
- [x] Add member checkout, CMS bank setup/orders and atomic receipt confirmation updating institute-issued profiles.
- [x] Test server prices, identity whitelisting, fee approval and bank gates (9 tests passed); verify schema and signed-out checkout protection.
- [ ] Verify signed-in order and receipt/profile read-back: blocked because no institute auth users exist and bank/approved fees have not been configured.

# Partnership orders
- [x] Add separate editable partnership catalog, bank-transfer settings, public order/payment page and CMS receipt confirmation.
- [x] Verify schema, server-priced order validation (4 tests), disabled unconfigured checkout and desktop/mobile page without errors or overflow.
- [ ] Verify real order, transfer and staff receipt confirmation: blocked until the Institute supplies packages/prices, receiving bank details and an administrator account.

# Member management
- [x] Upgrade the existing CMS member tab with searchable profiles, status filters and editable member information, plan, dates, approval and suspension.
- [x] Verify member update rules (12 tests passed), successful preview compilation and signed-out CMS redirect without page errors.
- [ ] Verify authenticated save/read-back: blocked because no institute auth accounts exist; do not create a disposable first administrator.

# Membership plan management
- [x] Enable CMS creation, price editing and safe deletion of membership plans; synchronize public catalog, registration and institute issuance.
- [x] Test prices, custom-plan IDs and permissions; verify public registration and signed-out CMS blocking without browser errors.
- [ ] Verify signed-in creation, price save/read-back and deletion: blocked because no institute auth user exists and session minting failed; do not create a disposable first administrator.

# Membership confirmation workflow
- [x] Record institute approval after invitation email is accepted and display approval separately from membership validity.
- [x] Verify approval rules with 13 tests, same-origin invitation link, member sign-in and protected-page redirect without browser errors.
- [ ] Verify actual invitation email and approved profile read-back: blocked because the project has no institute admin/member accounts.
- [ ] Send detailed membership-information emails: blocked until the institute configures its own sender domain.

# Institute purpose from community proposal
- [x] Enrich bilingual mission, vision, five core values and community directions from the supplied draft without implying approval.
- [x] Verify mission directions, draft attribution, all five value headings and mobile layout without overflow.

# Event registration synchronization
- [x] Add event-specific registration page and public aggregate participant counts without exposing personal details.
- [x] Connect event page, assistant and nearest VIP Dinner links to the same event ID; retain requests in CRM.
- [x] Verify real group-of-three submission, CRM event ID, repeated submission deduplication, table count and registration link; remove temporary test data. Historical events have no registration form; 27 tests pass and mobile has no overflow.

# Automatic assistant suggestions
- [x] Optimize latest-content selection, nearest-event priority and duplicate suppression; 18 tests pass and live assistant shows three distinct links, most recent event history and no page errors.
- [x] Show latest published articles, experts and events automatically in the assistant, refreshing from CMS.
- [x] Test publication filtering, recency, historical events and live public suggestions on desktop/mobile.
- [ ] Verify administrator publish-to-suggestion end-to-end: blocked until an institute administrator account exists; live published suggestions and automatic refetch verified.

# Membership registration page
- [x] Add dedicated public registration with personal details and published tier selection.
- [x] Link administrator-confirmed requests to member profiles by explicit request ID, never email matching.
- [x] Test real request delivery, VIP selection, profile mapping and mobile/English presentation; remove test requests.
- [ ] Verify administrator invitation and signed-in profile read-back: blocked because no institute admin or member account exists.

# CEO Lê Dung profile
- [x] Add a bilingual founder portrait to Explore the Institute using all three supplied photographs and verified press sources.
- [x] Verify photographs, source links and Vietnamese/English presentation on desktop and mobile.

# Article photographs
- [x] Add CMS-editable attributed photographs from original sources to all ten published news articles.
- [x] Verify all ten article photos load with bilingual captions and no mobile overflow.

# Nearest VIP Dinner
- [x] Share nearest published upcoming Dinner selection across member page and assistant, with event-specific registration link.
- [x] Verify nearest/date/hidden rules with tests and registration form preselection; CMS currently has no published upcoming Dinner.
- [ ] Verify signed-in recommendation and registration read-back: blocked until the institute creates a member account and publishes a real future Dinner.

# Event photographs
- [x] Find and verify documentary images from all seven existing events' original sources.
- [x] Store attributed event photos and display them with corresponding event records.
- [x] Verify all seven photos load, bilingual captions render and desktop/mobile layouts fit.

# Member personal page
- [x] Add protected member page with selected plan, own consultation history and published VIP Dinner schedule.
- [x] Test active membership gate and published upcoming/past Dinner filtering.
- [x] Verify member entry, email-link sign-in screen, signed-out route blocking and mobile fit.
- [ ] Verify signed-in member read-back: blocked because no auth users exist; institute admin must create and invite a member first.

# Verified CMS content
- [x] Expand sourced news, experts and dated events without duplicate records.
- [x] Verify expanded public catalog and live assistant answers with source links.
- [x] Add sourced real expert profiles, event history and news to CMS.
- [x] Enable assistant article lookup and distinguish past events from registration opportunities.
- [x] Verify live guest answers and public display.

# Contact page
- [x] Upgrade bilingual message form and department directory without inventing direct contacts.
- [x] Verify department-addressed messages reach CRM and mobile layout.
- [ ] Add department phone/email: blocked until the institute supplies official contacts.

# Founder news
- [x] Research and verify original articles about Lê Dung / CEO 1983.
- [x] Add attributed bilingual summaries to CMS and publish on News & Events.
- [x] Verify public display, source links and mobile layout.

# Customer AI assistant
- [x] Add owner-only conversation history and streaming assistant grounded in published institute content.
- [x] Add bilingual threaded chat pages and website entry point.
- [x] Verify real AI tool lookup and follow-up answers, public page and mobile layout.
- [ ] Verify signed-in history restoration across two conversations: blocked because no auth accounts exist; first signup becomes institute admin, so a disposable account must not be created.

# Website search
- [x] Add bilingual global search across published CMS content and primary pages.
- [x] Verify search matching, opening the correct content, and compact layouts.

# Doanh Tri community
- [x] Upgrade network page with draft-based membership comparison and bilingual community activities.
- [x] Connect membership requests to canonical CRM customers and CMS source tracking.
- [x] Test real registration delivery and desktop/mobile presentation.

# Recurring events
- [x] Add CMS recurring-event view with per-session date, time and seat capacity.
- [x] Validate positive integer capacity with tests and confirm database columns exist.
- [ ] Verify administrator save/read-back: blocked because no auth account exists; first signup becomes institute admin, so a disposable account must not be created.

# Membership CMS and assistant
- [x] Store four draft tiers in the database and add CMS editing fields.
- [x] Use published catalog in community display, registration and assistant recommendations.
- [x] Verify actual catalog rows, public display, VIP selection and live AI recommendation plus size-change follow-up.
- [ ] Verify signed-in CMS editing and chat persistence: blocked because no institute auth account exists.

# Guest and member chatbot
- [x] Enable public guest Q&A and separate signed-in member chat.
- [x] Add admin invitation workflow, member profiles, tier terms and activity/benefit records.
- [x] Restrict personal tools to verified active members; inspect owner RLS, test term/usage rules and confirm signed-out private endpoint returns 401.
- [x] Verify real guest Q&A through the widget and member sign-in prompt.
- [ ] Verify member invitation email, private lookup and two-account isolation end-to-end: blocked because no institute admin/member accounts exist; do not create a disposable first admin.