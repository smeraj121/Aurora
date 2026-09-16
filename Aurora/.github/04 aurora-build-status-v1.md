# Aurora V1.1 — Actual Build Status

**Supersedes:** MVC Specification v2.0
**Relationship to MVP v1.0:** MVP remains the long-term product vision and is *not* corrected here — this document is the source of truth for **what is actually implemented today**. Any code agent working on Aurora should read this document, not MVC v2.0, for current scope and data model.

**Status:** Living document — update this file whenever a feature's build status changes.

---

## 0. How to read this document

Each feature below is tagged:

- ✅ **Built** — implemented and in use
- ⚠️ **Partial** — some backend/frontend exists but incomplete
- 🚧 **Placeholder** — route exists, no real implementation (`PlaceholderView`)
- ❌ **Not built** — no code exists
- ❓ **Unverified** — a route/file exists but its contents haven't been inspected; do not assume it works

---

## 1. Core Data Model Corrections

MVP v1.0 and MVC v2.0 both describe a data model that **does not match the real schema**. Use this section, not those docs, for entity names.

### Multi-tenancy

- Real term: **`tenants`** table (`id`, `name`, `slug`, `business_type_id`, `phone`, `email`, `address`, `city`, `state`, `country`, `postal_code`, `timezone`, `currency`, `is_active`).
- Every tenant-owned table carrlies **`tenant_id`**, not `BusinessId` as MVC describes.
- Tenant selection at login uses `tenants.slug` (`TenantSelectionPage`) — not documented in either prior spec.
- `business_types` table classifies tenants (salon, clinic, etc.) — also undocumented previously.

### Authentication

- Real flow: **phone number + OTP** (`otp_verifications` table: `phone`, `otp`, `purpose`, `expires_at`, `verified_at`, `attempt_count`), not email + password as both prior docs state.
- JWT access token + rotating refresh token (`refresh_tokens` table: `token_hash`, `expires_at`, `is_revoked`).
- ⚠️ **Needs verification:** `userRepository.js` selects a `password_hash` column in some queries, but no such column exists in the current schema dump. Confirm whether this is dead code or a missing migration before trusting any password-based auth path.

### Roles

- Real values of `users.system_role`: **`Owner`**, **`Staff`**, **`Customer`**, **`SuperAdmin`**.
- MVP's Owner/Manager/Receptionist/Staff permission matrix does **not** exist in the codebase — do not implement against it.
- `SuperAdmin` is a real, separate role with its own login (`SuperAdminLoginPage`) and tenant-management page (`TenantManagement`) — entirely undocumented in prior specs.

### Working hours

- No tenant-level `WorkingHours`/`DayHours` entity exists.
- Real mechanism: **per-staff** `staff.start_time`, `staff.end_time`, `staff.weekly_off`. There is no lunch-break structure and no business-level open/close configuration anywhere in the schema.

### Appointments

Real `appointments` table is richer than either prior doc's `Appointment` interface. In addition to the expected fields, it includes:
`confirmation_status`, `booking_source`, `check_in_time`, `check_out_time`, `actual_start_time`, `actual_end_time`, `cancellation_reason`, `cancelled_by_user_id`, `is_package_appointment`, `customer_package_id`.

Status values actually used in code: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`. `no_show` appears in two staff-query `NOT IN` filters but is **not** part of the standard status vocabulary used elsewhere (appointment creation/update/cancel flows never set or check for it) — treat it as inconsistent, not canonical.

### Packages (undocumented in both prior specs)

A full package/session-bundle system is built:
- `packages` — named bundles with `total_price`, `discount_percentage`, `validity_days`
- `package_services` — which services + quantities a package template includes
- `customer_packages` — a customer's purchased instance of a package, tracking `used_sessions`/`total_sessions`
- `customer_package_services` — per-service usage tracking within a purchased package

This is **not** the same as MVC's excluded "Memberships" — it's a real, shipped feature and should be documented as such going forward.

### Reviews (undocumented in both prior specs)

`reviews` table: 1–5 `rating`, tied to `staff_id`, `customer_id`, optional `appointment_id`, with owner reply support (`reply_text`, `reply_date`). Feeds Staff performance and Reports.

---

## 2. Feature Status

| Feature | MVP says | MVC says | Actual status |
|---|---|---|---|
| Authentication | Email/password, 4-tier roles | Email/password | ✅ Built — phone+OTP, JWT+refresh, 4 roles (Owner/Staff/Customer/SuperAdmin) |
| Multi-tenancy | Basic mention | `BusinessId` design | ✅ Built — `tenant_id`, slug-based tenant selection |
| Dashboard | AI opportunity hero + metrics | Opportunity Feed hero | ✅ Built (KPIs, revenue chart, schedule timeline) — ❌ no opportunity feed, no AI |
| Calendar | Day/Week/Month, drag-drop | Day/Week/Month | ⚠️ Calendar page exists (`CalendarView`) — drag-and-drop/resize not confirmed in this conversation |
| Appointments | Full CRUD + status flow | Full CRUD + status flow | ✅ Built — richer field set than either doc describes (see §1) |
| Customers | Profiles, CLV, timeline | Profiles, stats | ✅ Built — no CLV field/calculation exists; has packages, history, stats instead |
| Staff | Schedule, services, metrics | Schedule, services | ✅ Built — per-staff hours, designations, service assignment, stats |
| **Packages** | Not mentioned | Excluded ("Memberships") | ✅ **Built** — undocumented in both prior specs, see §1 |
| Billing / Invoices | Critical, full invoice model | P0, "Basic Billing" | 🚧 **Placeholder only** — `/billing` route renders `PlaceholderView`. No invoice table exists. |
| Reports & Analytics | Standalone page | Explicitly *not* standalone (folded into dashboard) | ✅ Built — **standalone page**, contradicting MVC's stated design philosophy |
| **Customer Engagement** | Not named (partially = "AI Opportunity Engine" birthday piece) | Not named (partially = "Opportunity Feed" / "Birthday Opportunities" / "Suggested Campaigns") | ✅ **Built** — standalone manual page (Birthday / Upcoming Appointment / Follow-up), backend-generated message + WhatsApp deep link, staff clicks to open WhatsApp. No dashboard integration, no campaigns, no audience segmentation, no auto-send, no results tracking, no empty-slot/overbooked-staff detection |
| Opportunity Feed (dashboard hero) | N/A (MVP has separate AI section) | **Hero feature, P0** | ❌ Not built |
| Empty Slot Detection | ✅ in scope | ✅ P0 | ❌ Not built |
| Inactive Customer Detection | ✅ in scope | ✅ P0 | ❌ Not built (Customer Engagement's "Follow-up" filter is the closest analog, but it's manual/on-demand, not a proactive feed item) |
| Birthday Detection | ✅ in scope | ✅ P0 | ✅ Built — via Customer Engagement page, not dashboard |
| Suggested/One-click Campaigns | ✅ in scope | ✅ P0 | ❌ Not built — no campaign entity, no audience suggestion, no automated send |
| WhatsApp Automation (Twilio) | ✅ in scope | Confirmations/reminders P1 | ❌ Not built, explicitly out of scope per Customer Engagement PRD. WhatsApp is opened manually (`wa.me` deep link); nothing is server-sent |
| Online Booking | ✅ in scope | ✅ P1 | ❌ Not built — no public booking routes/controllers |
| AI Opportunity Engine | ✅ MVP-scoped AI | Folded into Opportunity Feed | ❌ Not built |
| AI Assistant page | Not in either doc by this name | Not in either doc | ❓ **Unverified** — route exists in `App.tsx` (`AIAssistantView`), contents never inspected |
| Settings page | Not detailed | Not detailed | ❓ **Unverified** — route exists (`SettingsView`), contents never inspected |
| Inventory | Excluded (v2) | Excluded (v2) | 🚧 Placeholder route only |
| Marketing | Not mentioned | Not mentioned | 🚧 Placeholder route only |
| Reviews | Not mentioned | Not mentioned | ✅ Built (schema + used by Staff/Reports) |

---

## 3. What Reports & Customer Engagement actually replaced

MVC's philosophy was: one dashboard, one "Opportunity Feed," no separate pages for insights or actions. The real V1.1 build diverged from that intentionally, in favor of:

- **Reports & Analytics** — a dedicated, deeper analytics page (KPIs with period-over-period comparison, revenue/booking trend with adaptive granularity, service category breakdown with per-service drill-down, top services, package performance, customer overview incl. anonymous walk-in tracking, day-of-week bookings, staff performance, deterministic business observations, CSV export).
- **Customer Engagement** — a dedicated, manual, staff-triggered workflow for Birthday / Upcoming Appointment / Follow-up outreach, with backend-generated context, suggested offer, message, and WhatsApp deep link — but no automation, no campaigns, no send tracking.

If future work wants to move toward MVC's original "Opportunity Feed" vision, it should be treated as a **new integration project** — pulling data that Reports and Customer Engagement already compute into a dashboard-level feed — rather than assuming that feed already exists.

---

## 4. Confirmed Not Built (do not assume otherwise)

- Billing / Invoicing (beyond raw `paid_amount`/`payment_status` fields on `appointments`)
- Online booking (public-facing)
- WhatsApp/SMS/Email automation of any kind
- AI-driven anything (opportunity detection, message generation, recommendations)
- Campaign creation/sending/tracking
- Inventory management
- Marketing module
- Multi-branch support
- CLV (customer lifetime value) calculation

---

## 5. Open Items Requiring Confirmation

1. **`AIAssistantView`** and **`SettingsView`** — real implementation status unknown; inspect before documenting further or building on top of them.
2. **`password_hash` in `userRepository.js`** — referenced in queries but absent from the schema dump; confirm whether this is dead/legacy code.
3. **`no_show` status** — appears in two `staffRepository` filters but nowhere in the appointment lifecycle code (create/update/cancel/finish). Confirm whether it's a planned-but-unused status or should be removed from those two queries for consistency.
4. **Calendar drag-and-drop/resize** — claimed by both prior docs as MVP-critical; not verified in this conversation. Confirm actual behavior before relying on this doc's "⚠️" tag.

---

*This document should be kept current. When a 🚧/❌/❓ item is built or verified, update its row in §2 and remove it from §4/§5 accordingly.*
