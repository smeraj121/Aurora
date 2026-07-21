# Aurora — Sprint Stories (MVC v2)

**Version:** 2.0  
**Status:** Living Document  
**Last Updated:** May 2026  

---

## 📋 Table of Contents

- [Sprint 0 — Foundation](#sprint-0--foundation-week-1)
- [Sprint 1 — Design System](#sprint-1--design-system-week-2)
- [Sprint 2 — Authentication & Business Setup](#sprint-2--authentication--business-setup-weeks-3-4)
- [Sprint 3 — Calendar & Staff](#sprint-3--calendar--staff-weeks-5-6)
- [Sprint 4 — Appointments](#sprint-4--appointments-weeks-7-8)
- [Sprint 5 — Customers & Services](#sprint-5--customers--services-weeks-9-10)
- [Sprint 6 — Dashboard & Opportunity Feed](#sprint-6--dashboard--opportunity-feed-week-11)
- [Sprint 7 — AI Opportunities Engine](#sprint-7--ai-opportunities-engine-weeks-12-13)
- [Sprint 8 — Campaigns & WhatsApp](#sprint-8--campaigns--whatsapp-weeks-14-15)
- [Sprint 9 — Online Booking](#sprint-9--online-booking-weeks-16-17)
- [Sprint 10 — Billing & Polish](#sprint-10--billing--polish-weeks-18-19)

---

## Sprint 0 — Foundation (Week 1)

**Goal:** Set up the development environment and project structure.

---

### Story 0.1: Initialize Frontend Project

**As a** developer  
**I want to** set up the React + TypeScript project with Vite  
**So that** I can start building the application

**Acceptance Criteria:**
- [ ] Project initialized with `npm create vite@latest`
- [ ] TypeScript configured
- [ ] ESLint and Prettier set up
- [ ] Folder structure created (`src/features`, `src/shared`, `src/app`)
- [ ] `package.json` with all dependencies
- [ ] Development server runs at `http://localhost:5173`

**Technical Notes:**
- Use React 19
- Vite 5
- TypeScript 5

---

### Story 0.2: Configure Tailwind CSS

**As a** developer  
**I want to** configure Tailwind CSS with design tokens  
**So that** I have a consistent styling system

**Acceptance Criteria:**
- [ ] Tailwind CSS installed and configured
- [ ] Design tokens defined (`colors`, `spacing`, `typography`)
- [ ] Custom theme in `tailwind.config.js`
- [ ] `@apply` directives work

**Technical Notes:**
- Use design tokens from `DESIGN.md`
- Primary color: `#3B82F6`
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

---

### Story 0.3: Install shadcn/ui Components

**As a** developer  
**I want to** install and configure shadcn/ui  
**So that** I have a component library foundation

**Acceptance Criteria:**
- [ ] shadcn/ui initialized
- [ ] Core components installed:
  - [ ] Button
  - [ ] Card
  - [ ] Badge
  - [ ] Avatar
  - [ ] Dialog
  - [ ] Toast
  - [ ] Input
  - [ ] Label
  - [ ] Select
- [ ] Components styled with design tokens
- [ ] Component variants work

**Technical Notes:**
- Use `npx shadcn-ui@latest init`
- Components in `src/shared/components/ui/`

---

### Story 0.4: Set Up API Client

**As a** developer  
**I want to** set up the API client with authentication  
**So that** I can communicate with the backend

**Acceptance Criteria:**
- [ ] Axios client configured
- [ ] Base URL from environment variable
- [ ] Request interceptor for auth token
- [ ] Response interceptor for error handling
- [ ] API service structure defined

---

### Story 0.5: Create Navigation Layout

**As a** salon owner  
**I want to** see a navigation sidebar  
**So that** I can navigate between sections

**Acceptance Criteria:**
- [ ] Sidebar with navigation items
- [ ] Active section highlighted
- [ ] Business name/logo at top
- [ ] User profile at bottom
- [ ] Responsive (collapsible on tablet)
- [ ] Navigation items:
  - [ ] Dashboard (Home)
  - [ ] Calendar
  - [ ] Appointments
  - [ ] Customers
  - [ ] Staff
  - [ ] Services
  - [ ] Opportunities
  - [ ] Settings

**Technical Notes:**
- Sidebar width: 240px
- Collapsed: 64px (icon-only)

---

### Story 0.6: Set Up Backend (Optional - if building backend)

**As a** developer  
**I want to** set up the backend API  
**So that** I can store data in the cloud

**Acceptance Criteria:**
- [ ] .NET 8 Web API project initialized
- [ ] PostgreSQL database configured
- [ ] Entity Framework Core setup
- [ ] Multi-tenancy design (BusinessId in all tables)
- [ ] JWT authentication configured
- [ ] API endpoints structured

**Technical Notes:**
- All tables have BusinessId
- All queries filter by BusinessId

---

## Sprint 1 — Design System (Week 2)

**Goal:** Build the complete design system and component library.

---

### Story 1.1: Implement Design Tokens

**As a** developer  
**I want to** implement all design tokens as CSS variables  
**So that** the design system is consistent

**Acceptance Criteria:**
- [ ] Color tokens defined
- [ ] Spacing tokens defined
- [ ] Typography tokens defined
- [ ] Border radius tokens defined
- [ ] Shadow tokens defined
- [ ] Animation tokens defined

---

### Story 1.2: Build Button Component

**As a** developer  
**I want to** create a reusable Button component  
**So that** I have consistent buttons everywhere

**Acceptance Criteria:**
- [ ] Variants: `primary`, `secondary`, `ghost`, `danger`
- [ ] Sizes: `sm`, `md`, `lg`
- [ ] Loading state (spinner)
- [ ] Disabled state
- [ ] Icon support (left/right)

---

### Story 1.3: Build Form Components

**As a** developer  
**I want to** create reusable form components  
**So that** I have consistent form fields

**Acceptance Criteria:**
- [ ] Input component with label
- [ ] Required indicator (`*`)
- [ ] Error state with message
- [ ] Disabled state
- [ ] Select component
- [ ] Textarea component
- [ ] Date picker component
- [ ] Time picker component

---

### Story 1.4: Build Card Component

**As a** developer  
**I want to** create a reusable Card component  
**So that** I have consistent card layouts

**Acceptance Criteria:**
- [ ] Header with title
- [ ] Content area
- [ ] Footer with actions
- [ ] Hover state (lift 2px)

**Technical Notes:**
- Card padding: 24px
- Border radius: 16px
- Shadow: default

---

### Story 1.5: Build Badge Component

**As a** developer  
**I want to** create a reusable Badge component  
**So that** I can show status indicators

**Acceptance Criteria:**
- [ ] Variants: `default`, `success`, `warning`, `danger`, `info`
- [ ] Sizes: `sm`, `md`

---

### Story 1.6: Build Dialog/Modal Component

**As a** developer  
**I want to** create a reusable Dialog component  
**So that** I can show modals with content

**Acceptance Criteria:**
- [ ] Overlay with blur
- [ ] Animation (fade in)
- [ ] Close button
- [ ] Header with title
- [ ] Content area
- [ ] Footer with actions

---

### Story 1.7: Build Toast Component

**As a** developer  
**I want to** create a reusable Toast component  
**So that** I can show notifications

**Acceptance Criteria:**
- [ ] Variants: `success`, `error`, `warning`, `info`
- [ ] Auto-dismiss after 3 seconds
- [ ] Close button
- [ ] Animation (slide in)

---

### Story 1.8: Build Skeleton Component

**As a** developer  
**I want to** create Skeleton loaders  
**So that** I can show loading states

**Acceptance Criteria:**
- [ ] Text skeleton
- [ ] Card skeleton
- [ ] Circle skeleton
- [ ] Animation (pulse)

---

### Story 1.9: Build Empty State Component

**As a** developer  
**I want to** create Empty State components  
**So that** I can show no-data messages

**Acceptance Criteria:**
- [ ] Icon
- [ ] Title
- [ ] Description
- [ ] Action button (optional)

---

### Story 1.10: Build Avatar Component

**As a** developer  
**I want to** create a reusable Avatar component  
**So that** I can display user/avatar images

**Acceptance Criteria:**
- [ ] Image support
- [ ] Fallback (initials)
- [ ] Sizes: `sm`, `md`, `lg`, `xl`
- [ ] Status indicator (online/offline)

---

## Sprint 2 — Authentication & Business Setup (Weeks 3-4)

**Goal:** Implement authentication and business onboarding.

---

### Story 2.1: Build Sign Up Page

**As a** new user  
**I want to** create an account  
**So that** I can start using Aurora

**Acceptance Criteria:**
- [ ] Sign up form: Email, Password, Confirm Password
- [ ] Email format validation
- [ ] Password strength validation (min 8 chars)
- [ ] Password confirmation validation
- [ ] Loading state on submit
- [ ] Success redirect to business setup
- [ ] Error messages for failures

---

### Story 2.2: Build Sign In Page

**As a** registered user  
**I want to** sign in to my account  
**So that** I can access my business data

**Acceptance Criteria:**
- [ ] Sign in form: Email, Password
- [ ] "Remember me" checkbox
- [ ] Forgot password link
- [ ] Loading state on submit
- [ ] Success redirect to dashboard
- [ ] Error messages for failures
- [ ] Session persists across page reloads

---

### Story 2.3: Build Business Onboarding Flow

**As a** new user  
**I want to** set up my business profile  
**So that** I can customize Aurora for my business

**Acceptance Criteria:**
- [ ] Step 1: Business name
- [ ] Step 2: Business address, phone, email
- [ ] Step 3: Logo upload (optional)
- [ ] Step 4: Working hours setup
- [ ] Progress indicator
- [ ] Save and continue
- [ ] Skip optional steps

---

### Story 2.4: Build Business Settings Page

**As a** salon owner  
**I want to** update my business settings  
**So that** I can keep my profile current

**Acceptance Criteria:**
- [ ] Business name edit
- [ ] Address, phone, email edit
- [ ] Logo upload
- [ ] Working hours editor
- [ ] Save changes
- [ ] Loading state
- [ ] Success toast

---

### Story 2.5: Build Working Hours Editor

**As a** salon owner  
**I want to** set my working hours  
**So that** the calendar knows when I'm open

**Acceptance Criteria:**
- [ ] Day selector (Mon-Sun)
- [ ] Open/Closed toggle
- [ ] Open time picker
- [ ] Close time picker
- [ ] Multiple break periods
- [ ] Copy hours from previous day
- [ ] Save changes
- [ ] Validation (open < close)

---

### Story 2.6: Implement Authentication State Management

**As a** developer  
**I want to** manage authentication state globally  
**So that** the app knows if the user is logged in

**Acceptance Criteria:**
- [ ] Auth context/state
- [ ] User data stored
- [ ] Token stored securely
- [ ] Auto-logout on token expiry
- [ ] Protected routes (require auth)
- [ ] Public routes (no auth required)

---

### Story 2.7: Implement Multi-Tenancy Data Layer

**As a** developer  
**I want to** design the data layer for multi-tenancy  
**So that** each business has isolated data

**Acceptance Criteria:**
- [ ] BusinessId in all tables
- [ ] All queries filter by BusinessId
- [ ] Current BusinessId stored in context
- [ ] Data migrations include BusinessId
- [ ] No cross-business data leakage

**Technical Notes:**
- Single business per account initially
- Future: SaaS with multiple businesses

---

## Sprint 3 — Calendar & Staff (Weeks 5-6)

**Goal:** Build the calendar with staff management.

---

### Story 3.1: Create Staff Data Model

**As a** developer  
**I want to** create the Staff data model  
**So that** I can store staff information

**Acceptance Criteria:**
- [ ] Staff interface defined
- [ ] Sample staff data created
- [ ] Staff API endpoints
- [ ] Staff store/context created

**Data Model:**
```typescript
interface Staff {
  id: string;
  businessId: string;
  name: string;
  role: string;
  color: string;
  services: string[];
  isActive: boolean;
  schedule: StaffSchedule;
}
```

---

### Story 3.2: Build Staff Management Page

**As a** salon owner  
**I want to** view and manage staff members  
**So that** I can see who's working

**Acceptance Criteria:**
- [ ] Staff list with cards
- [ ] Each card shows: name, role, color, status
- [ ] Add staff button
- [ ] Edit staff (name, role, color, services)
- [ ] Activate/deactivate staff
- [ ] Delete staff (with confirmation)

---

### Story 3.3: Build Staff Schedule Editor

**As a** salon owner  
**I want to** set staff working hours  
**So that** I can manage staff availability

**Acceptance Criteria:**
- [ ] Day selector (Mon-Sun)
- [ ] Open/Closed toggle
- [ ] Open time picker
- [ ] Close time picker
- [ ] Multiple break periods
- [ ] Copy from business hours
- [ ] Save changes

---

### Story 3.4: Create Service Data Model

**As a** developer  
**I want to** create the Service data model  
**So that** I can store service information

**Acceptance Criteria:**
- [ ] Service interface defined
- [ ] Service API endpoints
- [ ] Service store/context created

**Data Model:**
```typescript
interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  category: string;
  isActive: boolean;
}
```

---

### Story 3.5: Build Service Management Page

**As a** salon owner  
**I want to** manage services  
**So that** I can keep service catalog current

**Acceptance Criteria:**
- [ ] Service list
- [ ] Add service: Name, Duration, Price, Category
- [ ] Edit service
- [ ] Activate/deactivate service
- [ ] Delete service (with confirmation)

---

### Story 3.6: Build Calendar Header

**As a** salon owner  
**I want to** navigate through dates  
**So that** I can view different days

**Acceptance Criteria:**
- [ ] Shows current date
- [ ] Previous/Next buttons
- [ ] Today button
- [ ] Date picker
- [ ] View toggle: Day | Week | Month

---

### Story 3.7: Build Day View

**As a** salon owner  
**I want to** see all staff schedules for a day  
**So that** I can manage the day's appointments

**Acceptance Criteria:**
- [ ] Time slots (30-min increments)
- [ ] Staff columns with color coding
- [ ] Appointments displayed in slots
- [ ] Empty slots visible
- [ ] Scrollable (for long days)
- [ ] Click slot → Book appointment
- [ ] Click appointment → View details

**Technical Notes:**
- Hours: 9:00 AM - 8:00 PM
- Time format: 30-min slots
- Business hours from settings

---

### Story 3.8: Build Week View

**As a** salon owner  
**I want to** see the whole week at a glance  
**So that** I can plan ahead

**Acceptance Criteria:**
- [ ] 7-day grid
- [ ] Staff columns
- [ ] Appointments displayed
- [ ] Color coding by staff
- [ ] Click day → Switch to Day view

---

### Story 3.9: Build Month View

**As a** salon owner  
**I want to** see the month overview  
**So that** I can see busy/free days

**Acceptance Criteria:**
- [ ] Month grid
- [ ] Appointment dots
- [ ] Staff color coding
- [ ] Click day → Switch to Day view

---

## Sprint 4 — Appointments (Weeks 7-8)

**Goal:** Implement full appointment management.

---

### Story 4.1: Create Appointment Data Model

**As a** developer  
**I want to** create the Appointment data model  
**So that** I can store appointment data

**Acceptance Criteria:**
- [ ] Appointment interface defined
- [ ] Status enum defined
- [ ] Appointment API endpoints
- [ ] Appointment store/context created

**Data Model:**
```typescript
interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Story 4.2: Build Appointment Booking Modal

**As a** receptionist  
**I want to** book appointments quickly  
**So that** I can serve clients efficiently

**Acceptance Criteria:**
- [ ] Step 1: Select Staff (with availability)
- [ ] Step 2: Select Date
- [ ] Step 3: Select Time (from available slots)
- [ ] Step 4: Select/Add Client (search)
- [ ] Step 5: Select Service
- [ ] Step 6: Add Notes (optional)
- [ ] Step 7: Confirm Booking
- [ ] Toast notification on success
- [ ] Conflict detection (staff not double-booked)

---

### Story 4.3: Build Quick Booking from Calendar

**As a** receptionist  
**I want to** click on an empty slot to book  
**So that** I can book quickly

**Acceptance Criteria:**
- [ ] Click empty slot → Open booking modal
- [ ] Staff and time pre-filled
- [ ] Available slots highlighted
- [ ] Visual feedback on selection

---

### Story 4.4: Build Appointment Details View

**As** a receptionist/salon owner  
**I want to** view appointment details  
**So that** I can see all information

**Acceptance Criteria:**
- [ ] Shows: Client, Service, Staff, Date, Time
- [ ] Shows: Status, Notes
- [ ] Edit button
- [ ] Status change actions
- [ ] Cancel button
- [ ] Close button

---

### Story 4.5: Implement Appointment Status Management

**As** a receptionist/salon owner  
**I want to** update appointment status  
**So that** I can track the appointment lifecycle

**Acceptance Criteria:**
- [ ] Status dropdown: Scheduled → Confirmed → Completed
- [ ] Cancel: Scheduled/Confirmed → Cancelled
- [ ] No-Show: Confirmed → No-Show
- [ ] Status change requires confirmation (for destructive actions)
- [ ] Visual indicator in calendar
- [ ] Audit log of status changes

---

### Story 4.6: Build Today's Appointments View

**As** a salon owner  
**I want to** see all appointments for today  
**So that** I know what's happening

**Acceptance Criteria:**
- [ ] List of today's appointments
- [ ] Shows: Time, Client, Service, Staff, Status
- [ ] Quick actions: Complete, Confirm, Cancel
- [ ] Filter by status
- [ ] Count badges: Total, Confirmed, Pending
- [ ] Empty state: "No appointments today"

---

### Story 4.7: Implement Appointment Cards in Calendar

**As** a salon owner  
**I want to** see appointments in the calendar  
**So that** I have a visual view of the schedule

**Acceptance Criteria:**
- [ ] Color coding by staff
- [ ] Status indicator (border/icon)
- [ ] Shows client name
- [ ] Shows service name
- [ ] Shows time
- [ ] Click → Open details
- [ ] Muted appearance for past appointments
- [ ] Strike-through for cancelled
- [ ] Green indicator for completed

---

### Story 4.8: Implement Appointment Conflict Detection

**As** a receptionist  
**I want to** be prevented from double-booking  
**So that** staff don't have conflicts

**Acceptance Criteria:**
- [ ] Staff availability checked before booking
- [ ] Alert shown if conflict exists
- [ ] Suggest alternative times
- [ ] Show occupied slots in time picker

---

## Sprint 5 — Customers & Services (Weeks 9-10)

**Goal:** Build customer management and service history.

---

### Story 5.1: Create Customer Data Model

**As a** developer  
**I want to** create the Customer data model  
**So that** I can store customer information

**Acceptance Criteria:**
- [ ] Customer interface defined
- [ ] Customer API endpoints
- [ ] Customer store/context created

**Data Model:**
```typescript
interface Customer {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  preferredStaffId?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Story 5.2: Build Customer Management Page

**As** a salon owner  
**I want to** view and manage customers  
**So that** I can serve them better

**Acceptance Criteria:**
- [ ] Customer list with search
- [ ] Search by name and phone
- [ ] List shows: Name, Phone, Total Visits, Last Visit
- [ ] Add customer button
- [ ] Edit customer
- [ ] Delete customer (with confirmation)

---

### Story 5.3: Build Customer Profile View

**As** a salon owner  
**I want to** view a customer's full profile  
**So that** I can see their complete history

**Acceptance Criteria:**
- [ ] Personal details: Name, Phone, Email, Birthday, Gender
- [ ] Preferences: Preferred Staff, Notes
- [ ] Stats: Total Visits, Total Spent, Last Visit
- [ ] Quick actions: Book Appointment, Call, Message

---

### Story 5.4: Build Customer Service History

**As** a salon owner  
**I want to** see a customer's service history  
**So that** I know what treatments they've had

**Acceptance Criteria:**
- [ ] Timeline of past appointments
- [ ] Shows: Date, Service, Staff, Amount, Status
- [ ] Filter by service
- [ ] Sort by date (newest first)
- [ ] Notes visible
- [ ] Click appointment → View details

---

### Story 5.5: Build Add/Edit Customer Forms

**As** a receptionist  
**I want to** add or edit customer information  
**So that** I can keep customer records up to date

**Acceptance Criteria:**
- [ ] Form fields: First Name, Last Name, Phone, Email
- [ ] Optional fields: Birthday, Gender, Preferred Staff, Notes
- [ ] Phone number required
- [ ] Validation for phone format
- [ ] Save and Cancel buttons

---

### Story 5.6: Build Customer Search (Debounced)

**As** a receptionist  
**I want to** search for customers quickly  
**So that** I can find them during booking

**Acceptance Criteria:**
- [ ] Search input with debounce (300ms)
- [ ] Search by name
- [ ] Search by phone
- [ ] Results show matching customers
- [ ] "No results" state
- [ ] Create new customer from search

---

### Story 5.7: Track Customer Visit Statistics

**As** a salon owner  
**I want to** see customer visit statistics  
**So that** I know which customers are valuable

**Acceptance Criteria:**
- [ ] Total visits count
- [ ] Total spend amount
- [ ] Last visit date
- [ ] Average visit value
- [ ] Days since last visit
- [ ] Next birthday (if available)

---

## Sprint 6 — Dashboard & Opportunity Feed (Week 11)

**Goal:** Create the business owner's dashboard with Opportunity Feed as the hero.

---

### Story 6.1: Build Dashboard Layout

**As** a salon owner  
**I want to** see a dashboard when I open the app  
**So that** I get a quick overview

**Acceptance Criteria:**
- [ ] Greeting with business name
- [ ] Today's date
- [ ] Opportunity Feed (hero section)
- [ ] Today's overview metrics
- [ ] Today's timeline
- [ ] Upcoming birthdays
- [ ] Quick actions

---

### Story 6.2: Build Opportunity Feed (Hero)

**As** a salon owner  
**I want to** see prioritized opportunities  
**So that** I know what to do today

**Acceptance Criteria:**
- [ ] Shows count of opportunities
- [ ] Lists each opportunity with:
  - [ ] Priority color (🟢/🟡/🔵)
  - [ ] Title
  - [ ] Description
  - [ ] Potential revenue (if applicable)
- [ ] Click opportunity → Open details
- [ ] "Review All Opportunities" link
- [ ] Refresh button

**Opportunity Types:**
- Empty slots
- Inactive customers
- Birthdays
- Staff overbooked
- Staff underbooked
- Revenue opportunity

---

### Story 6.3: Build Today's Overview Metrics

**As** a salon owner  
**I want to** see key metrics at a glance  
**So that** I know how the day is going

**Acceptance Criteria:**
- [ ] Revenue Today: Amount, trend
- [ ] Appointments Today: Count, change
- [ ] Occupancy: Percentage, change
- [ ] New Customers: Count, change
- [ ] Click metric → Show details

---

### Story 6.4: Build Revenue This Month Widget

**As** a salon owner  
**I want to** see monthly revenue  
**So that** I know how the month is going

**Acceptance Criteria:**
- [ ] Total revenue for month
- [ ] Trend (↑/↓) vs previous month
- [ ] Click → Show monthly breakdown

---

### Story 6.5: Build Today's Timeline

**As** a salon owner  
**I want to** see today's schedule at a glance  
**So that** I know who's booked

**Acceptance Criteria:**
- [ ] Shows next 5 appointments
- [ ] Shows: Time, Customer, Service, Staff
- [ ] Empty slots visible
- [ ] Click appointment → Open details
- [ ] "View Full Calendar" link

---

### Story 6.6: Build Upcoming Birthdays Widget

**As** a salon owner  
**I want to** see upcoming birthdays  
**So that** I can send birthday offers

**Acceptance Criteria:**
- [ ] Shows next 3 birthdays
- [ ] Shows: Name, Date, Days until birthday
- [ ] "Send Offer" action
- [ ] "View All Birthdays" link

---

### Story 6.7: Build Returning Customers Widget

**As** a salon owner  
**I want to** see customers returning soon  
**So that** I can welcome them back

**Acceptance Criteria:**
- [ ] Shows customers with appointments in next 3 days
- [ ] Shows: Name, Days since last visit
- [ ] Click → View customer profile

---

### Story 6.8: Build Dashboard Loading States

**As** a salon owner  
**I want to** see loading states when data loads  
**So that** I know the app is working

**Acceptance Criteria:**
- [ ] Skeleton for Opportunity Feed
- [ ] Skeleton for metrics
- [ ] Skeleton for timeline
- [ ] Skeleton for birthdays
- [ ] No blank pages

---

## Sprint 7 — AI Opportunities Engine (Weeks 12-13)

**Goal:** Implement AI opportunity detection.

---

### Story 7.1: Implement Empty Slot Detection

**As** a salon owner  
**I want to** see empty slots identified  
**So that** I can fill them

**Acceptance Criteria:**
- [ ] Detect empty slots for tomorrow
- [ ] Count of empty slots
- [ ] Time range displayed
- [ ] Staff with empty slots listed
- [ ] Potential revenue calculated
- [ ] "Create Campaign" action

**Logic:**
```
Look at tomorrow's schedule
  ↓
Find gaps between appointments
  ↓
Calculate duration of each gap
  ↓
Estimate potential revenue per gap
  ↓
Group by staff member
  ↓
Present as opportunity
```

---

### Story 7.2: Implement Inactive Customers Detection

**As** a salon owner  
**I want to** see inactive customers identified  
**So that** I can re-engage them

**Acceptance Criteria:**
- [ ] Detect customers inactive for 90+ days
- [ ] Count of inactive customers
- [ ] Average spend displayed
- [ ] Potential revenue calculated
- [ ] Filter by: All/High Value/Medium/Low
- [ ] "Re-engage" action

**Logic:**
```
Query customers with:
  - Last visit > 90 days ago
  - No upcoming appointments
  - Active phone number

Calculate:
  - Average spend per customer
  - Total potential revenue

Group by:
  - High value (> ₹5,000 CLV)
  - Medium value (₹2,000-5,000 CLV)
  - Low value (< ₹2,000 CLV)
```

---

### Story 7.3: Implement Upcoming Birthdays Detection

**As** a salon owner  
**I want to** see upcoming birthdays  
**So that** I can send birthday offers

**Acceptance Criteria:**
- [ ] Detect birthdays in next 7 days
- [ ] Count of birthdays
- [ ] List of customers with dates
- [ ] CLV displayed
- [ ] "Send Birthday Offers" action

**Logic:**
```
Query customers with:
  - Birthday in next 7 days
  - Active phone number
  - Not recently contacted

Sort by:
  - CLV (high value first)
  - Date (soonest first)
```

---

### Story 7.4: Implement Staff Utilization Detection

**As** a salon owner  
**I want to** see staff utilization  
**So that** I can balance workload

**Acceptance Criteria:**
- [ ] Detect staff overbooked (>90%)
- [ ] Detect staff underbooked (<50%)
- [ ] Show utilization percentage
- [ ] "View Staff Schedule" action

---

### Story 7.5: Implement Revenue Opportunity Detection

**As** a salon owner  
**I want to** see revenue opportunities  
**So that** I can recover lost revenue

**Acceptance Criteria:**
- [ ] Calculate potential revenue from empty slots
- [ ] Calculate potential revenue from inactive customers
- [ ] Total opportunity value displayed
- [ ] Prioritize by revenue impact

**Logic:**
```
Potential Revenue = (Empty Slots × Average Service Price) +
                   (Inactive Customers × Average Spend)
```

---

### Story 7.6: Build AI Opportunities Page

**As** a salon owner  
**I want to** see all AI opportunities  
**So that** I can grow my business

**Acceptance Criteria:**
- [ ] List of all opportunities
- [ ] Priority labels: High, Medium
- [ ] Each opportunity shows: Title, Description, Potential Revenue
- [ ] Action buttons
- [ ] Sort by priority
- [ ] Filter by type

---

### Story 7.7: Implement Opportunity Refresh

**As** a salon owner  
**I want to** refresh opportunities  
**So that** I see the latest data

**Acceptance Criteria:**
- [ ] Refresh button
- [ ] Auto-refresh on dashboard load
- [ ] Last updated timestamp
- [ ] Loading state during refresh

---

## Sprint 8 — Campaigns & WhatsApp (Weeks 14-15)

**Goal:** Implement one-click WhatsApp campaigns.

---

### Story 8.1: Build Campaign Creation Modal

**As** a salon owner  
**I want to** create a campaign for empty slots  
**So that** I can fill them

**Acceptance Criteria:**
- [ ] Campaign name input
- [ ] Target type: Empty slots (auto-selected)
- [ ] Suggested audience shown
- [ ] Message editor with placeholders
- [ ] Channel: WhatsApp (toggle)
- [ ] Expected bookings shown
- [ ] Expected revenue shown
- [ ] Send button

**Flow (4 Clicks):**
```
Opportunity → Suggested Audience → Suggested Message → Review → Send
```

---

### Story 8.2: Build Re-engage Campaign Modal

**As** a salon owner  
**I want to** create a re-engagement campaign  
**So that** I can bring back inactive customers

**Acceptance Criteria:**
- [ ] Filter: All/High Value/Medium/Low
- [ ] Offer type: Discount/Free Add-on/Consultation
- [ ] Message editor with placeholders
- [ ] Customer count shown
- [ ] Send button

---

### Story 8.3: Build Birthday Offer Modal

**As** a salon owner  
**I want to** send birthday offers  
**So that** I can delight customers

**Acceptance Criteria:**
- [ ] List of customers with upcoming birthdays
- [ ] Offer type: Discount/Free Treatment/Gift Package
- [ ] Message editor with placeholders
- [ ] Customer count shown
- [ ] Send button

---

### Story 8.4: Implement WhatsApp Integration

**As** a salon owner  
**I want to** send WhatsApp messages  
**So that** I can communicate with customers

**Acceptance Criteria:**
- [ ] Twilio WhatsApp Business API integration
- [ ] Message templates
- [ ] Send message function
- [ ] Success/error feedback
- [ ] Message logging

---

### Story 8.5: Build Campaign History

**As** a salon owner  
**I want to** see campaign history  
**So that** I can track results

**Acceptance Criteria:**
- [ ] List of sent campaigns
- [ ] Shows: Date, Type, Audience, Status
- [ ] Shows: Bookings generated
- [ ] Shows: Revenue recovered

---

### Story 8.6: Implement Booking Confirmation

**As** a customer  
**I want to** receive a booking confirmation  
**So that** I know my appointment is confirmed

**Acceptance Criteria:**
- [ ] Confirmation sent when appointment is booked
- [ ] Includes: Customer name, Service, Staff, Date, Time
- [ ] Includes: Business name and location
- [ ] Reply options: CONFIRM, RESCHEDULE

---

### Story 8.7: Implement Appointment Reminder

**As** a customer  
**I want to** receive a reminder 24 hours before  
**So that** I don't forget my appointment

**Acceptance Criteria:**
- [ ] Reminder sent 24 hours before appointment
- [ ] Includes: Customer name, Service, Staff, Date, Time
- [ ] Includes: Business name and location
- [ ] Reply options: CONFIRM, RESCHEDULE

---

## Sprint 9 — Online Booking (Weeks 16-17)

**Goal:** Allow customers to book appointments without calling.

---

### Story 9.1: Build Public Booking Page

**As** a customer  
**I want to** book an appointment online  
**So that** I don't need to call

**Acceptance Criteria:**
- [ ] Business branding (logo, name)
- [ ] Service selection
- [ ] Staff selection (optional)
- [ ] Date/time selection with availability
- [ ] Contact details form
- [ ] Confirmation page

---

### Story 9.2: Implement Service Selection

**As** a customer  
**I want to** choose a service  
**So that** I can book what I need

**Acceptance Criteria:**
- [ ] List of active services
- [ ] Shows: Name, Price, Duration
- [ ] Service categories
- [ ] Search/filter

---

### Story 9.3: Implement Staff Selection

**As** a customer  
**I want to** choose a staff member  
**So that** I can book with my preferred expert

**Acceptance Criteria:**
- [ ] List of staff for selected service
- [ ] Shows: Name, Rating (if available)
- [ ] Optional selection
- [ ] If not selected, auto-assign

---

### Story 9.4: Implement Date/Time Selection

**As** a customer  
**I want to** choose a date and time  
**So that** I can book at my convenience

**Acceptance Criteria:**
- [ ] Date picker
- [ ] Available time slots shown
- [ ] Staff availability checked
- [ ] Business hours respected
- [ ] Booked slots disabled

---

### Story 9.5: Implement Contact Details Form

**As** a customer  
**I want to** enter my contact details  
**So that** the business can confirm my booking

**Acceptance Criteria:**
- [ ] Name (required)
- [ ] Phone (required)
- [ ] Email (optional)
- [ ] Notes (optional)
- [ ] Validation
- [ ] Submit button

---

### Story 9.6: Implement Booking Confirmation Page

**As** a customer  
**I want to** see booking confirmation  
**So that** I know my booking is successful

**Acceptance Criteria:**
- [ ] Shows booking details
- [ ] Booking reference number
- [ ] WhatsApp confirmation sent
- [ ] Calendar added to business
- [ ] "Add to Calendar" link

---

### Story 9.7: Implement Online Booking to Calendar Sync

**As** a salon owner  
**I want to** see online bookings in my calendar  
**So that** I can manage all appointments in one place

**Acceptance Criteria:**
- [ ] Online bookings appear in calendar
- [ ] Status: "Pending" until confirmed
- [ ] "Accept" and "Decline" actions
- [ ] Auto-confirmation (optional)

---

## Sprint 10 — Billing & Polish (Weeks 18-19)

**Goal:** Add lightweight billing and polish the application.

---

### Story 10.1: Build Billing for Completed Appointments

**As** a receptionist  
**I want to** generate invoices for completed appointments  
**So that** I can record payments

**Acceptance Criteria:**
- [ ] Click "Complete" on appointment
- [ ] Invoice generated automatically
- [ ] Shows: Service, Price, Total
- [ ] Payment method selection: Cash/Card/UPI
- [ ] Record payment button

---

### Story 10.2: Build Invoice View

**As** a salon owner  
**I want to** view invoices  
**So that** I can track payments

**Acceptance Criteria:**
- [ ] Invoice number
- [ ] Customer details
- [ ] Service details
- [ ] Amount
- [ ] Payment status: Paid/Pending
- [ ] Print/Download option

---

### Story 10.3: Build Customer Invoice History

**As** a salon owner  
**I want to** see a customer's invoice history  
**So that** I know their spending

**Acceptance Criteria:**
- [ ] Invoices shown in customer profile
- [ ] Shows: Date, Service, Amount, Status
- [ ] Click → View invoice

---

### Story 10.4: Implement Lite Billing Dashboard Widget

**As** a salon owner  
**I want to** see today's revenue  
**So that** I know how the day is going

**Acceptance Criteria:**
- [ ] Shows today's total revenue
- [ ] Shows today's completed appointments
- [ ] Shows pending payments
- [ ] Click → Show details

---

### Story 10.5: Add Animations

**As** a salon owner  
**I want to** see smooth animations  
**So that** the app feels polished

**Acceptance Criteria:**
- [ ] Page transitions (fade)
- [ ] Card hover lift
- [ ] Modal open animation
- [ ] Toast slide-in animation
- [ ] Loading skeleton pulse
- [ ] Opportunity card animations

---

### Story 10.6: Improve Accessibility

**As** a salon owner with accessibility needs  
**I want to** use the app with keyboard only  
**So that** I can navigate easily

**Acceptance Criteria:**
- [ ] Keyboard navigation: Tab, Enter, Escape
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Color contrast: 4.5:1 minimum
- [ ] Screen reader support

---

### Story 10.7: Mobile Responsiveness

**As** a salon owner  
**I want to** use the app on my tablet  
**So that** I can manage on the go

**Acceptance Criteria:**
- [ ] Sidebar collapses on tablet
- [ ] Calendar adjusts to screen width
- [ ] Cards stack on mobile
- [ ] Touch-friendly (44px tap targets)
- [ ] No horizontal scroll
- [ ] Opportunity Feed readable on mobile

---

### Story 10.8: Add Empty and Error States

**As** a developer  
**I want to** handle empty and error states gracefully  
**So that** users aren't confused

**Acceptance Criteria:**
- [ ] Empty state: "No appointments today"
- [ ] Empty state: "No customers found"
- [ ] Empty state: "No opportunities yet"
- [ ] Error state: "Failed to load data"
- [ ] Retry button on error
- [ ] Loading skeletons for all lists

---

### Story 10.9: Performance Optimization

**As** a salon owner  
**I want to** use the app quickly  
**So that** I don't waste time waiting

**Acceptance Criteria:**
- [ ] Dashboard loads in < 2 seconds
- [ ] Calendar loads in < 1.5 seconds
- [ ] Booking completes in < 1 second
- [ ] Opportunity Feed loads in < 500ms
- [ ] Campaign sends in < 3 seconds

---

## 🎯 Sprint Completion Checklist

Each sprint is complete when:

```
✅ All stories in the sprint are done
✅ Features are tested manually
✅ No critical bugs
✅ Code is clean and documented
✅ Sprint demo is prepared
✅ Features work with authentication
✅ Multi-tenant ready
```

---

## 📊 Sprint Summary

| Sprint | Feature | Duration | Stories |
|--------|---------|----------|---------|
| 0 | Foundation | 1 Week | 6 |
| 1 | Design System | 1 Week | 10 |
| 2 | Authentication & Business Setup | 2 Weeks | 7 |
| 3 | Calendar & Staff | 2 Weeks | 9 |
| 4 | Appointments | 2 Weeks | 8 |
| 5 | Customers & Services | 2 Weeks | 7 |
| 6 | Dashboard & Opportunity Feed | 1 Week | 8 |
| 7 | AI Opportunities Engine | 2 Weeks | 7 |
| 8 | Campaigns & WhatsApp | 2 Weeks | 7 |
| 9 | Online Booking | 2 Weeks | 7 |
| 10 | Billing & Polish | 2 Weeks | 9 |

**Total:** 19 Weeks (~4.5 months)

---

*This document will be updated as stories are added, refined, or reprioritized during development. The hero feature is the Opportunity Feed that answers: "What should I do today to make more money?"*