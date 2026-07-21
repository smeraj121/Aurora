# Aurora — Development Roadmap

**Version:** 1.0  
**Status:** Living Document  
**Last Updated:** May 2026  
**Total Duration:** 22 Weeks (5.5 Months)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Sprint Structure](#sprint-structure)
- [Sprint 0 — Foundation](#sprint-0--foundation-week-1)
- [Sprint 1 — Design System](#sprint-1--design-system-week-2)
- [Sprint 2 — Calendar & Staff](#sprint-2--calendar--staff-weeks-3-4)
- [Sprint 3 — Appointments](#sprint-3--appointments-weeks-5-6)
- [Sprint 4 — Customers](#sprint-4--customers-weeks-7-8)
- [Sprint 5 — Dashboard](#sprint-5--dashboard-week-9)
- [Sprint 6 — Billing](#sprint-6--billing-weeks-10-11)
- [Sprint 7 — Reports](#sprint-7--reports-week-12)
- [Sprint 8 — Online Booking](#sprint-8--online-booking-weeks-13-14)
- [Sprint 9 — WhatsApp Automation](#sprint-9--whatsapp-automation-weeks-15-16)
- [Sprint 10 — AI Opportunity Engine](#sprint-10--ai-opportunity-engine-weeks-17-18)
- [Sprint 11 — Polish & Pilot](#sprint-11--polish--pilot-weeks-19-20)
- [Post-Pilot](#post-pilot-weeks-21-22)
- [Sprint Cadence](#sprint-cadence)
- [Quality Gates](#quality-gates)
- [Risk Management](#risk-management)
- [Resources](#resources)
- [Success Metrics](#success-metrics)

---

## Overview

### What We're Building

Aurora is a **Growth Operating System** for appointment-based businesses (salons, dermatology clinics, aesthetic centers). This roadmap details the 22-week journey to deliver a production-ready MVP.

### Why This Structure

| Approach | Benefit |
|----------|---------|
| **2-Week Sprints** | Predictable delivery cadence, regular feedback |
| **Vertical Slices** | Complete features, not partial components |
| **Production-Ready** | Every sprint delivers deployable software |
| **AI-First** | AI capabilities integrated from day one |

### Quick Reference

| Sprint | Feature | Duration | Status |
|--------|---------|----------|--------|
| 0 | Foundation | 1 Week | 🚧 In Progress |
| 1 | Design System | 1 Week | 📋 Planned |
| 2 | Calendar & Staff | 2 Weeks | 📋 Planned |
| 3 | Appointments | 2 Weeks | 📋 Planned |
| 4 | Customers | 2 Weeks | 📋 Planned |
| 5 | Dashboard | 1 Week | 📋 Planned |
| 6 | Billing | 2 Weeks | 📋 Planned |
| 7 | Reports | 1 Week | 📋 Planned |
| 8 | Online Booking | 2 Weeks | 📋 Planned |
| 9 | WhatsApp Automation | 2 Weeks | 📋 Planned |
| 10 | AI Opportunity Engine | 2 Weeks | 📋 Planned |
| 11 | Polish & Pilot | 2 Weeks | 📋 Planned |
| — | Post-Pilot | 2 Weeks | 📋 Planned |

---

## Sprint Structure

### Sprint Rhythm

```
┌─────────────────────────────────────────────────────────────┐
│  Sprint Start (Monday)                                      │
│  └─ Sprint Planning (2 hours)                              │
│  └─ Kickoff                                                │
├─────────────────────────────────────────────────────────────┤
│  Daily (Tuesday-Friday)                                     │
│  └─ Daily Standup (15 min)                                 │
│  └─ Development & Testing                                  │
├─────────────────────────────────────────────────────────────┤
│  Sprint End (Friday)                                        │
│  └─ Sprint Review (1 hour)                                 │
│  └─ Sprint Retrospective (1 hour)                          │
│  └─ Demo (30 min)                                          │
└─────────────────────────────────────────────────────────────┘
```

### Every Sprint Delivers

- ✅ Working, tested software
- ✅ Updated documentation
- ✅ Production-ready code
- ✅ No regressions
- ✅ Demonstrable feature

---

## Sprint 0 — Foundation (Week 1)

**Goal:** Establish the development environment, project structure, and core infrastructure for all future work.

### Backend Tasks

| Task | Description | Priority |
|------|-------------|----------|
| Project Setup | Initialize .NET 8 Web API | High |
| Database | Configure PostgreSQL with EF Core | High |
| Architecture | Implement Clean Architecture folders | High |
| Domain Models | Create BaseEntity and core entities | High |
| Authentication | Set up JWT with BCrypt | High |
| Multi-Tenancy | Implement tenant middleware | High |
| Logging | Configure Serilog structured logging | Medium |

### Frontend Tasks

| Task | Description | Priority |
|------|-------------|----------|
| Project Setup | Initialize React + TypeScript with Vite | High |
| Styling | Configure Tailwind CSS with design tokens | High |
| Components | Set up shadcn/ui library | High |
| Routing | Implement React Router | High |
| State | Configure TanStack Query | High |
| Forms | Set up React Hook Form + Zod | High |
| API Client | Create axios client with interceptors | High |

### Infrastructure Tasks

| Task | Description | Priority |
|------|-------------|----------|
| Docker | Create Docker Compose configuration | High |
| Environment | Set up environment variables | High |
| Database | Create initial migration scripts | High |
| Git | Configure repository and branch strategy | High |
| CI/CD | Set up GitHub Actions | Medium |

### Documentation Tasks

| Task | Description | Priority |
|------|-------------|----------|
| PRD | Complete product requirements document | High |
| Design | Finalize design system | High |
| Architecture | Document technical architecture | High |
| Onboarding | Create developer guide | Medium |

### Deliverables

```
✅ Working development environment
✅ Database schema with migrations
✅ Authentication flow working
✅ Multi-tenancy configured
✅ Frontend dev server running
✅ Complete project documentation
✅ Docker Compose setup
```

---

## Sprint 1 — Design System (Week 2)

**Goal:** Build the complete design system foundation ensuring visual consistency across all features.

### Design Tokens

```
┌─────────────────────────────────────────────────────────────┐
│  Colors                                                    │
│  ├─ Primary: #3B82F6                                      │
│  ├─ Neutral: Slate 50-900                                 │
│  ├─ Semantic: Success, Warning, Danger, Info              │
│  └─ Surface: White, Hover, Border                         │
├─────────────────────────────────────────────────────────────┤
│  Typography                                                │
│  ├─ Font: Inter Variable                                  │
│  ├─ Scale: 12px → 48px                                    │
│  └─ Weights: 400, 500, 600, 700                          │
├─────────────────────────────────────────────────────────────┤
│  Spacing                                                   │
│  ├─ Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64         │
│  └─ Never invent custom spacing                            │
├─────────────────────────────────────────────────────────────┤
│  Radius                                                    │
│  ├─ sm: 4px, md: 6px, default: 8px, lg: 12px             │
│  ├─ xl: 16px, 2xl: 20px, full: 9999px                    │
├─────────────────────────────────────────────────────────────┤
│  Shadows                                                   │
│  ├─ sm, default, md, lg, xl, 2xl                         │
│  └─ Consistent across components                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Library

| Component | Variants | Status |
|-----------|----------|--------|
| Button | Primary, Secondary, Ghost, Danger | ✅ |
| Input | Default, Error, Disabled | ✅ |
| Card | Default, Hover | ✅ |
| Badge | Default, Success, Warning, Error | ✅ |
| Avatar | Default, Fallback | ✅ |
| Table | Default, Striped, Hover | ✅ |
| Dialog | Default, Confirmation | ✅ |
| Toast | Success, Error, Warning, Info | ✅ |
| Skeleton | Text, Card, Circle | ✅ |
| Layout | Sidebar, Header, Main | ✅ |

### Deliverables

```
✅ Complete design tokens implemented
✅ Component library built and documented
✅ Storybook setup for components
✅ Responsive layout foundation
✅ Component testing in place
```

---

## Sprint 2 — Calendar & Staff (Weeks 3-4)

**Goal:** Build the heart of Aurora — a beautiful, functional calendar with staff management.

### Calendar Views

```
┌─────────────────────────────────────────────────────────────┐
│  Month View                                                 │
│  ┌──┬──┬──┬──┬──┬──┬──┐                                   │
│  │Mon│Tue│Wed│Thu│Fri│Sat│Sun│                             │
│  ├──┼──┼──┼──┼──┼──┼──┤                                   │
│  │24 │25 │26 │27 │28 │29 │30 │                             │
│  │ ● │ ● │   │ ● │ ● │   │   │                             │
│  └──┴──┴──┴──┴──┴──┴──┘                                   │
├─────────────────────────────────────────────────────────────┤
│  Week View                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ 9:00     │ Dr.Arjun │ Priya    │ Neha     │             │
│  │ 10:00    │ ████     │ ██████   │ ██       │             │
│  │ 11:00    │          │ ████████ │          │             │
│  │ 12:00    │ ████     │          │ ████     │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
├─────────────────────────────────────────────────────────────┤
│  Day View                                                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │ 9:00 │  ┌─────────────────────────────┐       │       │
│  │      │  │ HydraFacial - Anita Singh   │       │       │
│  │ 10:00│  │                              │       │       │
│  │ 11:00│  │  ┌────────────┐             │       │       │
│  │      │  │  │Chemical Peel│            │       │       │
│  └──────┴──┴──────────────┴─────────────┘       │       │
└─────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description | Status |
|---------|-------------|--------|
| Month View | Grid with appointment dots | MVP |
| Week View | Timeline with staff columns | MVP |
| Day View | Detailed hourly view | MVP |
| Drag & Drop | Reorder appointments | MVP |
| Staff Management | CRUD with availability | MVP |
| Color Coding | Staff-specific colors | MVP |
| Navigation | Prev/Next, Today, Date picker | MVP |
| View Toggle | Day/Week/Month switching | MVP |

### API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│  Staff                                                      │
│  GET    /api/v1/staff                                      │
│  GET    /api/v1/staff/{id}                                 │
│  POST   /api/v1/staff                                      │
│  PUT    /api/v1/staff/{id}                                 │
│  GET    /api/v1/staff/{id}/schedule                        │
│  PUT    /api/v1/staff/{id}/schedule                        │
│  GET    /api/v1/staff/{id}/availability                    │
├─────────────────────────────────────────────────────────────┤
│  Calendar                                                   │
│  GET    /api/v1/calendar/availability?date=2026-05-24      │
│  GET    /api/v1/calendar/week?start=2026-05-24             │
│  GET    /api/v1/calendar/month?month=2026-05               │
└─────────────────────────────────────────────────────────────┘
```

### Deliverables

```
✅ Staff CRUD operations
✅ Staff schedule configuration
✅ Calendar day/week/month views
✅ Staff resource view
✅ Drag & drop functionality
✅ Calendar navigation
```

---

## Sprint 3 — Appointments (Weeks 5-6)

**Goal:** Implement full appointment management with drag-and-drop functionality.

### Appointment Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Scheduled                                 │
│                         ↓                                    │
│  ┌─────────────────────┼─────────────────────┐             │
│  ↓                     ↓                     ↓             │
│  Confirmed           Cancelled            No-Show           │
│      ↓                                                       │
│  In Progress                                                 │
│      ↓                                                       │
│   Completed                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description | Status |
|---------|-------------|--------|
| CRUD Operations | Create, Read, Update, Delete | MVP |
| Status Management | Schedule → Confirm → Complete | MVP |
| Conflict Detection | Prevent double booking | MVP |
| Appointment Cards | Display in calendar | MVP |
| Creation Flow | Customer → Service → Staff → Time | MVP |
| Search | By customer, service, staff | MVP |
| Filtering | By status, date range | MVP |

### Validation Rules

| Rule | Validation |
|------|------------|
| Customer Required | Must select existing customer |
| Service Required | Must select active service |
| Staff Required | Must select available staff |
| Time Future | Start time must be in future |
| No Conflict | Staff not double-booked |
| Within Hours | Within business hours |
| Duration Valid | Between 15-480 minutes |

### Appointment Card Design

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 11:00 AM            │ Status: Confirmed             │   │
│  │ HydraFacial         │ Staff: Priya                 │   │
│  │ Anita Singh         │ Duration: 60 min             │   │
│  │ ────────────────────────────────────────────────── │   │
│  │ Notes: Prefers organic products                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Deliverables

```
✅ Appointment CRUD operations
✅ Calendar integration with appointments
✅ Drag-and-drop functionality
✅ Status management workflow
✅ Conflict detection
✅ Appointment search
```

---

## Sprint 4 — Customers (Weeks 7-8)

**Goal:** Build comprehensive customer profiles with visit history and timeline.

### Customer Profile

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Anita Singh                      VIP                   │
│  +91 98765 43210  anita.singh@gmail.com                     │
│  Total Visits: 12  Last Visit: 10 May 2025                 │
│  [Message] [Call] [Book Appointment]                       │
├─────────────────────────────────────────────────────────────┤
│  Customer Lifetime Value: ₹28,500                          │
│  Loyalty Tier: Gold (3 more to Platinum)                   │
│  Preferred Expert: Priya                                   │
├─────────────────────────────────────────────────────────────┤
│  Timeline                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Today    ⏰ 11:00 AM  HydraFacial                 │   │
│  │ 10 May   ✅ Visit    ₹2,500  HydraFacial          │   │
│  │ 28 Apr   ✅ Visit    ₹3,500  Chemical Peel        │   │
│  │ 15 Apr   ✅ Visit    ₹2,500  HydraFacial          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Notes                                                     │
│  Prefers organic products. Sensitive to fragrances.        │
└─────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description | Status |
|---------|-------------|--------|
| CRUD Operations | Create, Read, Update, Delete | MVP |
| Customer Search | By name, phone | MVP |
| Profile View | Complete customer information | MVP |
| Visit History | Timeline of all visits | MVP |
| Notes | Free-text notes | MVP |
| CLV Calculation | Automatic lifetime value | MVP |
| Preferred Staff | Auto-assign on booking | MVP |
| Birthday Tracking | Upcoming birthday reminders | MVP |

### CLV Calculation

```typescript
// Customer Lifetime Value Formula
CLV = (Average Visit Value) × (Average Visits/Year) × (Average Retention Years)

// Example
CLV = (₹2,500) × (12 visits/year) × (3 years) = ₹90,000
```

### Deliverables

```
✅ Customer CRUD operations
✅ Customer timeline with history
✅ CLV calculation
✅ Advanced search functionality
✅ Customer notes
✅ Birthday tracking
```

---

## Sprint 5 — Dashboard (Week 9)

**Goal:** Create the business owner's morning briefing with AI insights.

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Good Morning, Saba 🎉                                     │
│  Here's what's happening with Glow Skin Clinic today.      │
├─────────────────────────────────────────────────────────────┤
│  Revenue        Appointments    Occupancy    New Customers │
│  ₹38,500        24             68%          5             │
│  ↑ 18%          ↑ 4            ↑ 12%        ↑ 2           │
├─────────────────────────────────────────────────────────────┤
│  🎯 AI Business Advisor                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ You have 7 empty slots tomorrow                    │   │
│  │ Estimated lost revenue: ₹14,200                    │   │
│  │ [Send Campaign]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Today's Schedule                                          │
│  Dr. Arjun ████████░░ 80%    Priya █████████░ 90%        │
│  Neha ██████░░░░ 60%         Riya ████████░░ 80%        │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions                                             │
│  [+ New Appointment] [+ New Customer] [Billing] [Report]  │
└─────────────────────────────────────────────────────────────┘
```

### Metrics Cards

| Metric | Calculation | Display |
|--------|-------------|---------|
| Revenue | Sum of today's completed appointments | ₹38,500 ↑ 18% |
| Appointments | Count of today's appointments | 24 ↑ 4 |
| Occupancy | (Booked / Total capacity) × 100 | 68% ↑ 12% |
| New Customers | Count of first-time customers today | 5 ↑ 2 |

### AI Business Advisor

**Opportunity Types:**

| Type | Detection | Action |
|------|-----------|--------|
| Empty Slots | Tomorrow's schedule gaps | Create campaign |
| Inactive Customers | 90+ days no visit | Send re-engagement |
| Birthdays | Next 7 days | Send birthday offers |

### Deliverables

```
✅ Dashboard metrics display
✅ AI Business Advisor section
✅ Today's schedule view
✅ Quick actions
✅ Real-time data updates
```

---

## Sprint 6 — Billing (Weeks 10-11)

**Goal:** Implement invoice generation and payment tracking.

### Invoice Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Service Completed                                      │
│         ↓                                                  │
│  2. Open Billing                                           │
│         ↓                                                  │
│  3. Select Customer                                        │
│         ↓                                                  │
│  4. Add Services (auto-populated)                          │
│         ↓                                                  │
│  5. Apply Discounts (if any)                               │
│         ↓                                                  │
│  6. Calculate Tax                                          │
│         ↓                                                  │
│  7. Select Payment Method                                  │
│         ↓                                                  │
│  8. Record Payment                                         │
│         ↓                                                  │
│  9. Send WhatsApp Invoice                                  │
└─────────────────────────────────────────────────────────────┘
```

### Invoice Structure

```
┌─────────────────────────────────────────────────────────────┐
│  INVOICE #INV-2026-001                                     │
│  Glow Skin Clinic                                          │
│  Date: 24 May 2026                                         │
├─────────────────────────────────────────────────────────────┤
│  Customer: Anita Singh                                     │
│  Phone: +91 98765 43210                                    │
├─────────────────────────────────────────────────────────────┤
│  Item                Qty    Price    Total                 │
│  HydraFacial         1      ₹2,500   ₹2,500              │
│  Chemical Peel       1      ₹3,500   ₹3,500              │
├─────────────────────────────────────────────────────────────┤
│  Subtotal:                             ₹6,000              │
│  Discount (10%):                       -₹600               │
│  GST (18%):                            ₹972                │
│  Total:                                ₹6,372              │
├─────────────────────────────────────────────────────────────┤
│  Payment Method: UPI                                       │
│  Payment Status: Paid ✅                                   │
└─────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description | Status |
|---------|-------------|--------|
| Invoice Generation | From appointment or customer | MVP |
| Payment Recording | Cash, Card, UPI | MVP |
| Discounts | Percentage or fixed | MVP |
| Tax Calculation | GST/other taxes | MVP |
| Invoice History | Customer timeline | MVP |
| PDF Export | Download invoice | MVP |
| WhatsApp Sending | Send invoice via WhatsApp | MVP |

### Deliverables

```
✅ Invoice generation
✅ Payment recording
✅ Discount and tax calculation
✅ PDF generation
✅ WhatsApp invoice sending
✅ Customer invoice history
```

---

## Sprint 7 — Reports (Week 12)

**Goal:** Provide actionable business insights through reports.

### Report Types

```
┌─────────────────────────────────────────────────────────────┐
│  Overview                                                   │
│  ├─ Total Revenue: ₹4,28,500 ↑ 14%                       │
│  ├─ Total Appointments: 256 ↑ 12%                        │
│  ├─ New Customers: 48 ↑ 20%                              │
│  └─ Repeat Customers: 62% ↑ 8%                           │
├─────────────────────────────────────────────────────────────┤
│  Revenue                                                    │
│  ├─ Daily/Weekly/Monthly trends                           │
│  └─ Top services by revenue                               │
├─────────────────────────────────────────────────────────────┤
│  Appointments                                               │
│  ├─ Volume trends                                         │
│  └─ Status breakdown (Completed, No-Show, Cancelled)      │
├─────────────────────────────────────────────────────────────┤
│  Customers                                                  │
│  ├─ Growth trends                                          │
│  ├─ Retention rate                                         │
│  └─ Churn analysis                                         │
├─────────────────────────────────────────────────────────────┤
│  Staff                                                      │
│  ├─ Revenue by staff                                       │
│  ├─ Utilization rate                                       │
│  └─ Performance metrics                                    │
└─────────────────────────────────────────────────────────────┘
```

### Chart Requirements

| Chart | Type | Data |
|-------|------|------|
| Revenue | Line/Bar | Daily revenue over 30 days |
| Top Services | Horizontal Bar | Revenue by service |
| Staff Performance | Pie/Donut | Revenue distribution |
| Appointments | Bar | Count by day/week |
| Retention | Line | Customer retention rate |

### Deliverables

```
✅ Revenue reports
✅ Appointment reports
✅ Customer reports
✅ Staff performance reports
✅ Chart visualizations
✅ Export functionality (PDF/CSV)
```

---

## Sprint 8 — Online Booking (Weeks 13-14)

**Goal:** Allow customers to book appointments without calling reception.

### Booking Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Customer visits business.aurora.app                       │
│         ↓                                                  │
│  Step 1: Choose Service                                    │
│         ↓                                                  │
│  Step 2: Choose Staff (optional)                           │
│         ↓                                                  │
│  Step 3: Choose Date & Time                                │
│         ↓                                                  │
│  Step 4: Enter Contact Details                             │
│         ↓                                                  │
│  Step 5: Confirm Booking                                   │
│         ↓                                                  │
│  WhatsApp Confirmation Sent                                │
└─────────────────────────────────────────────────────────────┘
```

### Booking Page

```
┌─────────────────────────────────────────────────────────────┐
│  Glow Skin Clinic 🏆                                      │
│  Book your appointment in seconds                         │
├─────────────────────────────────────────────────────────────┤
│  1. Choose Service                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ HydraFacial    ₹2,500  60 mins   ⭐4.9          │   │
│  │ ○ Hair Color     ₹3,000  90 mins   ⭐4.8          │   │
│  │ ○ Laser Session  ₹4,000  45 mins   ⭐4.9          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  2. Choose Expert (Optional)                              │
│  Priya  9.5/10  │  Neha  9.3/10  │  Dr. Arjun 9.7/10   │
│                                                           │
│  3. Pick Date & Time                                      │
│  ┌──┬──┬──┬──┬──┐  ┌──────────────┐                      │
│  │Mo│Tu│We│Th│Fr│  │ 9:00  10:00  │                      │
│  │24│25│26│27│28│  │ 11:00 12:00  │                      │
│  └──┴──┴──┴──┴──┘  │ 1:00  2:00   │                      │
│                     │ 3:00  4:00   │                      │
│                     └──────────────┘                      │
│                                                           │
│  4. Your Details                                          │
│  Name: ________  Phone: ________                          │
│  Email: ________ (optional)                               │
│                                                           │
│  [Book Appointment]                                       │
└─────────────────────────────────────────────────────────────┘
```

### WhatsApp Booking

```
Customer: "Hi, I want to book a HydraFacial tomorrow. 10:30 AM."
         ↓
System: "Hello! We have the following slots available tomorrow:
         - 11:00 AM (Priya)
         - 1:30 PM (Priya)
         - 3:00 PM (Neha)
         Please reply with your preferred time."
         ↓
Customer: "1:30 PM"
         ↓
System: "Great! Your appointment is confirmed for tomorrow at 1:30 PM
         with Priya. We'll send you a reminder before your appointment."
```

### Deliverables

```
✅ Public booking page
✅ End-to-end booking flow
✅ WhatsApp confirmation
✅ Business-specific booking links
✅ Availability display
```

---

## Sprint 9 — WhatsApp Automation (Weeks 15-16)

**Goal:** Automate communication to reduce no-shows and improve customer experience.

### Notification Templates

| Template | Trigger | Example |
|----------|---------|---------|
| Confirmation | Booking created | "Hi {name}, your {service} with {staff} is confirmed..." |
| Reminder | 24 hours before | "Reminder: Your appointment is tomorrow at {time}..." |
| Reschedule | Appointment changed | "Your appointment has been rescheduled to {new_date}..." |
| Cancellation | Appointment cancelled | "Your appointment has been cancelled. Click to reschedule." |
| No-Show | Missed appointment | "We missed you! Click to reschedule." |
| Review Request | After service | "How was your experience? Rate us: {link}" |
| Birthday Wish | Customer birthday | "Happy Birthday! Enjoy 20% off your next service" |
| Payment Receipt | Payment recorded | "Thank you for your payment of ₹{amount}." |

### Message Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Booking Created (T+0)                                     │
│  ↓                                                         │
│  Send Confirmation                                         │
│  ↓                                                         │
│  Wait 24 hours                                             │
│  ↓                                                         │
│  Send Reminder (T-24 hours from appointment)              │
│  ↓                                                         │
│  Wait for appointment time                                 │
│  ↓                                                         │
│  Service Completed                                          │
│  ↓                                                         │
│  Send Review Request                                       │
└─────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description | Status |
|---------|-------------|--------|
| Twilio Integration | WhatsApp Business API | MVP |
| Template Management | Create, edit, preview | MVP |
| Confirmation | Auto-send on booking | MVP |
| Reminders | Auto-send 24h before | MVP |
| Opt-Out | Respect customer preferences | MVP |
| Message Logging | Audit trail | MVP |
| Scheduling | Send at optimal times | MVP |

### Deliverables

```
✅ WhatsApp integration
✅ Automated confirmations
✅ Automated reminders
✅ Template management
✅ Notification history
✅ Opt-out management
```

---

## Sprint 10 — AI Opportunity Engine (Weeks 17-18)

**Goal:** Help businesses increase revenue through AI-driven suggestions.

### Opportunity Detection

| Opportunity | Detection | Display |
|-------------|-----------|---------|
| Empty Slots | Tomorrow's schedule gaps | "Fill 7 empty slots tomorrow - Potential revenue: ₹14,200" |
| Inactive Customers | 90+ days no visit | "42 customers haven't visited - Potential: ₹1,82,000" |
| Birthdays | Next 7 days | "8 birthdays this week - Send offers" |
| Revenue Decline | Revenue down 10%+ | "Revenue down 12% this week - Offer campaign needed" |

### AI Display

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 AI Business Advisor                                    │
│                                                           │
│  ⚡ HIGH PRIORITY                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Empty Slots Tomorrow                               │   │
│  │ 7 empty slots between 1 PM - 5 PM                  │   │
│  │ Estimated lost revenue: ₹14,200                    │   │
│  │ Expected bookings: 6-9                            │   │
│  │ [Send Campaign →]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ⚡ HIGH PRIORITY                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Inactive Customers                                 │   │
│  │ 42 customers haven't visited in 90+ days           │   │
│  │ Average spend: ₹4,300 per customer                 │   │
│  │ Potential revenue: ₹1,82,000                       │   │
│  │ [Send Re-engagement →]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  💡 MEDIUM PRIORITY                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Upcoming Birthdays                                 │   │
│  │ 8 birthdays in the next 7 days                     │   │
│  │ [Send Birthday Offers →]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  [View All Opportunities →]                               │
└─────────────────────────────────────────────────────────────┘
```

### AI Engine Logic

```typescript
class OpportunityEngine {
  async detect(tenantId: string): Promise<Opportunity[]> {
    const opportunities = [];
    
    // 1. Empty Slots
    const slots = await this.getEmptySlots(tenantId);
    if (slots.count > 0) {
      opportunities.push({
        type: 'empty_slot',
        title: `Fill ${slots.count} empty slots tomorrow`,
        potentialRevenue: slots.estimatedRevenue,
        expectedBookings: { min: 3, max: 6 },
        priority: 'high',
        action: { type: 'create_campaign', label: 'Send Campaign' }
      });
    }
    
    // 2. Inactive Customers
    const inactive = await this.getInactiveCustomers(tenantId);
    if (inactive.count > 0) {
      opportunities.push({
        type: 'inactive',
        title: `${inactive.count} customers inactive for 90+ days`,
        potentialRevenue: inactive.potentialRevenue,
        expectedBookings: { min: 4, max: 8 },
        priority: 'high',
        action: { type: 'send_offer', label: 'Send Offer' }
      });
    }
    
    // 3. Birthdays
    const birthdays = await this.getUpcomingBirthdays(tenantId);
    if (birthdays.count > 0) {
      opportunities.push({
        type: 'birthday',
        title: `${birthdays.count} birthdays in the next 7 days`,
        potentialRevenue: birthdays.estimatedRevenue,
        expectedBookings: { min: 2, max: 4 },
        priority: 'medium',
        action: { type: 'send_offer', label: 'Send Birthday Offers' }
      });
    }
    
    return this.sortByPriority(opportunities);
  }
}
```

### Deliverables

```
✅ Opportunity detection
✅ Empty slot detection
✅ Inactive customer detection
✅ Birthday detection
✅ Campaign creation
✅ Success tracking
```

---

## Sprint 11 — Polish & Pilot (Weeks 19-20)

**Goal:** Prepare for pilot launch with 3 businesses.

### Performance Optimization

| Area | Action | Priority |
|------|--------|----------|
| Database | Review and add indexes | High |
| Queries | Optimize slow queries | High |
| Caching | Implement Redis caching | Medium |
| Bundles | Code splitting optimization | Medium |
| Images | Lazy loading and compression | Medium |

### Security Audit

| Area | Action | Priority |
|------|--------|----------|
| Authentication | Review JWT flow | High |
| Authorization | Test all role permissions | High |
| Input Validation | Check all endpoints | High |
| SQL Injection | Verify EF Core usage | High |
| XSS | Check escaping and sanitization | Medium |

### Accessibility Audit

| Area | Requirement | Priority |
|------|-------------|----------|
| Keyboard Navigation | All functionality via keyboard | High |
| Screen Readers | ARIA labels, roles | High |
| Color Contrast | 4.5:1 minimum | High |
| Focus Indicators | Visible on all interactive elements | High |
| Alt Text | All images have descriptions | Medium |

### Pilot Preparation

```
┌─────────────────────────────────────────────────────────────┐
│  Week 19                                                    │
│  ├─ Performance optimization                               │
│  ├─ Security audit                                         │
│  └─ Accessibility audit                                    │
├─────────────────────────────────────────────────────────────┤
│  Week 20                                                    │
│  ├─ Onboard 3 pilot businesses                             │
│  ├─ Data migration assistance                              │
│  ├─ Training sessions                                      │
│  └─ Feedback collection                                    │
└─────────────────────────────────────────────────────────────┘
```

### Deliverables

```
✅ Production-ready application
✅ 3 pilot businesses onboarded
✅ Feedback collected
✅ Bug fixes applied
✅ Documentation complete
```

---

## Post-Pilot (Weeks 21-22)

**Goal:** Address feedback and prepare for public launch.

### Week 21 — Feedback Review

| Task | Description |
|------|-------------|
| Review Feedback | Analyze pilot business feedback |
| Prioritize Improvements | Identify critical and nice-to-have fixes |
| Critical Fixes | Address blocking issues |
| Performance Tuning | Optimize based on real usage |

### Week 22 — Launch Preparation

| Task | Description |
|------|-------------|
| Finalize Pricing | Define tiered pricing plans |
| Marketing Materials | Prepare launch materials |
| Sales Enablement | Train sales team |
| Launch Plan | Execute public launch strategy |

### Deliverables

```
✅ Pilot feedback addressed
✅ Critical issues fixed
✅ Pricing finalized
✅ Marketing materials ready
✅ Launch plan in place
```

---

## Sprint Cadence

### Meetings

| Meeting | Frequency | Duration | Participants |
|---------|-----------|----------|--------------|
| Daily Standup | Daily | 15 min | Team |
| Sprint Planning | Bi-weekly | 2 hours | Team + PO |
| Sprint Review | Bi-weekly | 1 hour | Team + Stakeholders |
| Sprint Retro | Bi-weekly | 1 hour | Team |
| Weekly Demo | Weekly | 30 min | Team + Business |

### Communication Channels

| Channel | Purpose |
|---------|---------|
| Slack | Daily communication |
| Linear/Jira | Project management |
| Notion | Documentation |
| Figma | Design collaboration |
| GitHub | Code repository |

---

## Quality Gates

### Code Quality

| Gate | Check | Pass/Fail |
|------|-------|-----------|
| Linting | ESLint errors | 0 |
| Formatting | Prettier | Pass |
| Types | TypeScript | No errors |
| Tests | Unit tests pass | 100% |
| Coverage | > 70% | Required |

### PR Review Checklist

```
┌─────────────────────────────────────────────────────────────┐
│  PR Checklist                                               │
│  [ ] Code compiles without errors                          │
│  [ ] All types are correct                                 │
│  [ ] Validation implemented                                │
│  [ ] Responsive design works                               │
│  [ ] Accessibility standards met                           │
│  [ ] Loading states shown                                  │
│  [ ] Empty states shown                                    │
│  [ ] Error states shown                                    │
│  [ ] Documentation updated                                 │
│  [ ] No TODOs remain                                       │
│  [ ] No duplicate code                                     │
│  [ ] Tests pass                                            │
│  [ ] Self-reviewed                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Risk Management

### Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| Scope Creep | High | High | Strict MVP scope, PO approval | Product |
| Technical Debt | Medium | High | Code reviews, refactoring sprints | Tech Lead |
| Integration Issues | Medium | High | Early integration testing | Backend |
| Performance | Medium | Medium | Performance testing from day 1 | Tech Lead |
| UI/UX Mismatch | Medium | High | Early user testing, design reviews | Design |
| API Rate Limits | Low | High | Multiple provider fallback | Backend |

### Contingency Plan

| Scenario | Action |
|----------|--------|
| Sprint Delay | Reduce scope, not quality |
| Feature Block | Pivot to next priority |
| Team Member Leaves | Cross-train, documentation |
| Production Outage | Rollback, incident response |

---

## Resources

### Team

| Role | Allocation | Responsibilities |
|------|-----------|------------------|
| Lead Architect | 100% | Architecture, code quality, technical decisions |
| Frontend Developer | 100% | React implementation, UI components |
| Backend Developer | 100% | .NET API, database, integrations |
| UI/UX Designer | 50% | Design system, prototypes, user testing |
| Product Owner | 25% | Requirements, prioritization, feedback |

### Infrastructure

| Environment | Purpose | Provider |
|-------------|---------|----------|
| Development | Local coding | Docker Compose |
| Staging | Testing | Cloud (AWS/Azure) |
| Production | Pilot launch | Cloud (AWS/Azure) |

### Tools

| Category | Tool |
|----------|------|
| Code Repository | GitHub |
| Project Management | Linear |
| Documentation | Notion |
| Design | Figma |
| Communication | Slack |
| CI/CD | GitHub Actions |
| Monitoring | Application Insights |

---

## Success Metrics

### Sprint Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sprint Completion | 90% of committed stories | Sprint Review |
| Test Coverage | 70%+ | Automated tests |
| Bug Rate | < 2 per sprint | QA reports |
| Build Success | > 95% | CI/CD pipeline |
| Performance | < 3s load time | Performance tests |

### Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pilot Satisfaction | > 4.5/5 | Survey feedback |
| Feature Adoption | > 80% | Usage analytics |
| NPS Score | > 60 | Customer survey |
| Revenue Impact | > 20% increase | Business metrics |

### Success Criteria

```
✅ All sprints completed on schedule
✅ All MVP features implemented
✅ 3 pilot businesses onboarded
✅ Positive pilot feedback (>4.5/5)
✅ Product ready for public launch
✅ Business metrics show improvement
```

---

*This roadmap is a living document. It will be updated based on progress, feedback, and changing requirements. Every sprint should review and adjust the roadmap as needed.*

---