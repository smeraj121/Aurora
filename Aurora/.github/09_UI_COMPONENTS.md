# Aurora — UI Components Specification

**Version:** 2.0  
**Status:** Living Document  
**Last Updated:** May 2026  
**Audience:** Frontend Developers, Backend Developers, AI Coding Agents

---

## 📋 Table of Contents

- [1. Design Philosophy](#1-design-philosophy)
- [2. Layout System](#2-layout-system)
- [3. Typography](#3-typography)
- [4. Spacing System](#4-spacing-system)
- [5. Atoms](#5-atoms)
- [6. Molecules](#6-molecules)
- [7. Organisms](#7-organisms)
- [8. Templates](#8-templates)
- [9. Calendar Components](#9-calendar-components)
- [10. Navigation](#10-navigation)
- [11. Dialogs](#11-dialogs)
- [12. Feedback Components](#12-feedback-components)
- [13. Dashboard Widgets](#13-dashboard-widgets)
- [14. AI Components](#14-ai-components)
- [15. Badges](#15-badges)
- [16. Icons](#16-icons)
- [17. Responsive Rules](#17-responsive-rules)
- [18. Accessibility](#18-accessibility)
- [19. Component Naming Convention](#19-component-naming-convention)
- [20. Implementation Notes](#20-implementation-notes)

---

## 1. Design Philosophy

### Aurora's Personality

Aurora should feel like:

| Reference | Why |
|-----------|-----|
| **Linear** | Clean, productive, tool-focused |
| **Stripe Dashboard** | Professional, data-rich, polished |
| **Notion** | Calm, organized, information hierarchy |
| **Raycast** | Fast, keyboard-first, modern |
| **Google Calendar** | Familiar scheduling, clean, reliable |

### Key Principles

| Principle | Application |
|-----------|-------------|
| **Professional** | Never playful or consumer-grade |
| **Calm** | No flashing, no motion sickness |
| **Modern** | Latest design patterns, rounded corners |
| **Clean** | Generous whitespace, clear hierarchy |
| **Information Dense** | Show what matters, hide what doesn't |
| **Business Productivity First** | Speed over flash |
| **Desktop-First** | Tablet capable, mobile usable |
| **Minimal Animations** | Only where functional |

### What Aurora Is NOT

- ❌ Not flashy consumer app
- ❌ Not social media style
- ❌ Not playful or whimsical
- ❌ Not mobile-first
- ❌ Not animation-heavy

### Mental Model

> "Aurora is a professional tool for business owners. Every interaction should feel like using a premium business application—not a game, not a social app, not a marketing page."

---

## 2. Layout System

### App Shell

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────┬──────────────────────────────────────────────────────┐ │
│  │        │  Top Bar                                            │ │
│  │        │  ┌────────────────────────────────────────────────┐ │ │
│  │        │  │  Page Title          │   Search   │ Profile   │ │ │
│  │        │  └────────────────────────────────────────────────┘ │ │
│  │        │                                                    │ │
│  │        │  Content Area                                       │ │
│  │        │                                                    │ │
│  │        │  ┌────────────────────────────────────────────────┐ │ │
│  │        │  │                                                │ │ │
│  │        │  │                                                │ │ │
│  │        │  │                                                │ │ │
│  │        │  └────────────────────────────────────────────────┘ │ │
│  │        │                                                    │ │
│  └────────┴──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Sidebar

| Property | Value |
|----------|-------|
| Width (expanded) | 240px |
| Width (collapsed) | 64px |
| Background | White (Surface) |
| Border | Right border |
| Position | Fixed |
| Z-Index | 30 |

**Sidebar Items:**
```
┌──────────────────────────────────────┐
│  🏠  Aurora                         │  ← Logo
│  ─────────────────────────────────  │
│  📊  Dashboard                      │
│  📅  Calendar                       │
│  📋  Appointments                   │
│  👤  Customers                      │
│  👥  Staff                          │
│  💇  Services                       │
│  ⚡  Opportunities                  │
│  📈  Dashboard                      │
│  ─────────────────────────────────  │
│  ⚙️  Settings                       │
│  👤  Profile                        │
└──────────────────────────────────────┘
```

### Top Bar

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | White (Surface) |
| Border | Bottom border |
| Position | Fixed |
| Z-Index | 20 |

**Top Bar Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  ☰  Dashboard                🔍 Search...    🔔  👤 Profile │
└──────────────────────────────────────────────────────────────┘
```

### Content Area

| Property | Value |
|----------|-------|
| Padding | 24px |
| Max Width | 1440px |
| Margin | Auto (centered) |

### Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop | ≥1024px | Full sidebar, 3-4 columns |
| Tablet | 768-1023px | Collapsed sidebar, 2-3 columns |
| Mobile | <768px | Hidden sidebar, 1-2 columns |

---

## 3. Typography

### Font Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  Page Title           32px / 40px / 600    "Dashboard"            │
│  Section Title        24px / 32px / 600    "Today's Overview"     │
│  Card Title           20px / 28px / 600    "Revenue"              │
│  Subtitle             16px / 24px / 500    "Last 30 days"         │
│  Body                 16px / 24px / 400    "Main content text"    │
│  Body Small           14px / 20px / 400    "Secondary text"       │
│  Caption              12px / 16px / 400    "Helper text"          │
│  Label                14px / 20px / 500    "Email Address"        │
│  Helper Text          12px / 16px / 400    "Required field"       │
│  Table Text           14px / 20px / 400    "Data in tables"       │
│  Button Text          14px / 20px / 500    "Save Changes"         │
│  Error Text           12px / 16px / 500    "Invalid email"        │
│  Success Text         12px / 16px / 500    "Saved successfully"   │
└─────────────────────────────────────────────────────────────────────┘
```

### Usage Rules

| Rule | Application |
|------|-------------|
| Use Page Title once per page | Dashboard heading |
| Use Section Title for content sections | Revenue, Appointments |
| Use Card Title inside cards | Revenue Card title |
| Never use heading sizes smaller than body | Always use design tokens |
| Never use bold for body text | Keep body at 400 weight |

---

## 4. Spacing System

### Spacing Scale

```
┌──────────┬─────────┬──────────────────────────────────────────────────┐
│  Token   │  Value  │  Usage                                          │
├──────────┼─────────┼──────────────────────────────────────────────────┤
│  space-0 │  0px    │  No spacing                                     │
│  space-1 │  4px    │  Icons, small gaps in buttons                   │
│  space-2 │  8px    │  Input padding, small component gaps            │
│  space-3 │  12px   │  Between related items                          │
│  space-4 │  16px   │  Default padding for components                 │
│  space-5 │  20px   │  Card content spacing                           │
│  space-6 │  24px   │  Page padding, section spacing                  │
│  space-7 │  32px   │  Major section spacing                          │
│  space-8 │  40px   │  Large section spacing                          │
│  space-9 │  48px   │  Page section separation                        │
│  space-10│  64px   │  Dashboard metric separation                    │
└──────────┴─────────┴──────────────────────────────────────────────────┘
```

### Spacing Rules

| Context | Spacing |
|---------|---------|
| Page padding | 24px |
| Card padding | 24px |
| Card content gap | 16px |
| Section spacing | 32px |
| Form field gap | 20px |
| Button gap | 8px |
| Icon margin | 8px |
| Table cell padding | 12px 16px |

---

## 5. Atoms

### AuroraButton

**Purpose:** Primary interaction element.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Variants:                                                         │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐          │
│  │Primary│  │Second │  │ Ghost │  │Danger │  │ Icon  │          │
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘          │
│                                                                    │
│  Sizes:                                                            │
│  ┌───────┐  ┌──────────────┐  ┌──────────────────────┐           │
│  │  sm   │  │      md      │  │         lg           │           │
│  └───────┘  └──────────────┘  └──────────────────────┘           │
│                                                                    │
│  States:                                                           │
│  ┌───────┐  ┌───────┐  ┌─────────┐  ┌───────┐  ┌────────┐      │
│  │Default│  │ Hover │  │Pressed │  │Disabled│  │Loading │      │
│  └───────┘  └───────┘  └─────────┘  └───────┘  └────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | Primary | White | None | Primary Dark |
| Secondary | White | Primary | Border | Background Hover |
| Ghost | Transparent | Primary | None | Background Hover |
| Danger | Danger | White | None | Danger Hover |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 32px | 0 12px | 14px |
| md | 40px | 0 16px | 14px |
| lg | 48px | 0 24px | 16px |

**Props:**
```typescript
interface AuroraButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Accessibility:**
- `role="button"`
- `tabIndex={0}`
- `aria-disabled={disabled}`
- `aria-label` when icon-only

---

### AuroraInput

**Purpose:** Form input with label and validation.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Label                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Placeholder text                        [Icon]              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  Helper / Error text                                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| Height | 44px |
| Padding | 8px 12px |
| Border | 1px solid |
| Border Radius | 8px |
| Font | 16px / 400 |
| Background | White |

**Variants:**
- `text` — Default text input
- `search` — With search icon
- `password` — Toggle visibility
- `number` — With number controls
- `currency` — With currency prefix
- `phone` — With country code
- `date` — Date picker
- `time` — Time picker

**States:**
- Default
- Focus (primary border + shadow)
- Error (danger border + error message)
- Success (success border + success message)
- Disabled
- Loading

**Props:**
```typescript
interface AuroraInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'search' | 'password' | 'number' | 'currency' | 'phone' | 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

**Validation Rules:**
- Label above input
- Required fields marked with `*`
- Error message below input
- Reserve space for validation message
- Never use placeholder as label

---

### AuroraBadge

**Purpose:** Status and categorical indicators.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Success │  │ Warning │  │ Danger  │  │  Info   │  │ Revenue │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│                                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  New    │  │Inactive │  │ Birthday│  │Cancelled│             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Success | Green Light | Green | None |
| Warning | Yellow Light | Yellow Dark | None |
| Error | Red Light | Red | None |
| Info | Blue Light | Blue | None |
| Revenue | Purple Light | Purple | None |
| New | Blue Light | Blue | None |
| Inactive | Gray Light | Gray | None |
| Birthday | Pink Light | Pink | None |
| Cancelled | Red Light | Red | None |
| Completed | Green Light | Green | None |
| Confirmed | Blue Light | Blue | None |

**Props:**
```typescript
interface AuroraBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'revenue' | 'new' | 'inactive' | 'birthday' | 'cancelled' | 'completed' | 'confirmed';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

---

### AuroraAvatar

**Purpose:** User/Staff/Client image or initials.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Sizes:                                                            │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                              │
│  │     │  │     │  │     │  │     │                              │
│  │ sm  │  │ md  │  │ lg  │  │ xl  │                              │
│  └─────┘  └─────┘  └─────┘  └─────┘                              │
│                                                                    │
│  States:                                                           │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                              │
│  │Image│  │Init │  │Online│  │ Off │                              │
│  └─────┘  └─────┘  └─────┘  └─────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Size | Diameter | Font |
|------|----------|------|
| sm | 32px | 12px |
| md | 40px | 14px |
| lg | 48px | 16px |
| xl | 64px | 20px |

**Props:**
```typescript
interface AuroraAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  onClick?: () => void;
}
```

**Accessibility:**
- `role="img"`
- `aria-label={name}`
- Fallback to initials if no image

---

### AuroraIcon

**Purpose:** Consistent icon usage.

**Rules:**
- Use Lucide icons only
- Never mix icon libraries
- Size: md (20px) by default
- Stroke width: 2px
- Color: inherit from text

**Props:**
```typescript
interface AuroraIconProps {
  name: keyof LucideIcons;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}
```

---

### AuroraSpinner

**Purpose:** Loading indicator.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                              │
│  │  ⭕  │  │  ⭕  │  │  ⭕  │  │  ⭕  │                              │
│  │  xs  │  │  sm  │  │  md  │  │  lg  │                              │
│  └─────┘  └─────┘  └─────┘  └─────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface AuroraSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
}
```

---

## 6. Molecules

### AuroraSearchBox

**Purpose:** Global search input with results.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  🔍 Search clients, appointments, services...              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Results (dropdown):                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  👤 Anita Singh            Customer    HydraFacial         │  │
│  │  📅 Today 11:00 AM         Appointment  Priya              │  │
│  │  💇 HydraFacial            Service     ₹2,500              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Debounce 300ms
- Show loading while searching
- Max 5 results
- Keyboard navigation (↑↓ Enter)
- Escape closes

**Props:**
```typescript
interface AuroraSearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSelect: (result: SearchResult) => void;
  results: SearchResult[];
  loading?: boolean;
}
```

---

### AuroraMetricCard

**Purpose:** Key metric display.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  📊 Revenue Today                ↑ 18%                     │  │
│  │  ₹38,500                                                   │  │
│  │  vs yesterday                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout:**
```
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────────┐  │
│  │  Icon          Label          Trend    │  │
│  │               Value                     │  │
│  │               Subtitle                  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**Specifications:**
- Padding: 24px
- Background: White
- Border Radius: 16px
- Shadow: default
- Hover: lift 2px

**Props:**
```typescript
interface AuroraMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  onClick?: () => void;
}
```

---

### AuroraAppointmentCard

**Purpose:** Appointment display in calendar and lists.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  11:00 AM                ●  Confirmed                     │  │
│  │  HydraFacial             🕐 60 min                       │  │
│  │  Anita Singh             👤 Priya                       │  │
│  │  📝 Notes: Prefers organic                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  10:00 AM                ⚪  Pending                      │  │
│  │  Chemical Peel           🕐 45 min                       │  │
│  │  Neha Sharma             👤 Neha                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| Height | 56-72px (compact) / 80-100px (detailed) |
| Padding | 8px 12px |
| Background | White |
| Border Radius | 8px |
| Border Left | 3px colored |

**Status Indicators:**
- Scheduled: Blue border
- Confirmed: Green border
- Completed: Gray border
- Cancelled: Red border + strikethrough
- No-Show: Yellow border

**Props:**
```typescript
interface AuroraAppointmentCardProps {
  appointment: Appointment;
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
  onStatusChange?: (status: AppointmentStatus) => void;
}
```

---

### AuroraCustomerCard

**Purpose:** Customer display in lists.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  👤 Anita Singh              🏷️ VIP                      │  │
│  │  📞 +91 98765 43210          🏢 12 visits                │  │
│  │  ✉️ anita.singh@gmail.com    💰 ₹28,500 CLV             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface AuroraCustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  onBook?: () => void;
}
```

---

### AuroraOpportunityCard

**Purpose:** AI opportunity display.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  🟢 3 empty slots worth ₹7,500           High Priority    │  │
│  │  Tomorrow between 1 PM - 4 PM                              │  │
│  │  Potential revenue: ₹7,500                                 │  │
│  │  [Create Campaign →]                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  🟡 18 inactive customers                Medium Priority   │  │
│  │  Haven't visited in 90+ days                               │  │
│  │  Potential revenue: ₹77,400                                │  │
│  │  [Re-engage Now →]                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Priority Colors:**
- 🟢 Green: High priority
- 🟡 Yellow: Medium priority
- 🔵 Blue: Informational

**Props:**
```typescript
interface AuroraOpportunityCardProps {
  opportunity: Opportunity;
  onAction: (action: string) => void;
  onDismiss?: () => void;
}
```

---

## 7. Organisms

### AuroraSidebar

**Purpose:** Main navigation.

```
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │  🏠  Aurora                   │  │  ← Logo
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📊  Dashboard                │  │  ← Active
│  │  📅  Calendar                 │  │
│  │  📋  Appointments             │  │
│  │  👤  Customers                │  │
│  │  👥  Staff                    │  │
│  │  💇  Services                 │  │
│  │  ⚡  Opportunities            │  │
│  │  📈  Reports                  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ⚙️  Settings                 │  │
│  │  👤  Profile                  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Behavior:**
- Hover expands from collapsed (64px → 240px)
- Active section highlighted
- Keyboard: `⌘K` to open command palette

---

### AuroraCalendarGrid

**Purpose:** Calendar display with appointments.

```
┌─────────────────────────────────────────────────────────────────────┐
│  📅 May 24, 2026                          [<] [Today] [>]         │
│  [Day] [Week] [Month]                                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┬──────────┬──────────┐                     │
│  │ Time    │ Priya    │ Neha     │ Riya     │                     │
│  ├─────────┼──────────┼──────────┼──────────┤                     │
│  │ 9:00    │ ┌──────┐ │          │          │                     │
│  │         │ │Anita  │ │          │          │                     │
│  ├─────────┤ └──────┘ ├──────────┼──────────┤                     │
│  │ 10:00   │          │ ┌──────┐ │          │                     │
│  │         │          │ │Neha  │ │          │                     │
│  ├─────────┤          │ └──────┘ ├──────────┤                     │
│  │ 11:00   │          │          │          │                     │
│  │         │  EMPTY   │  EMPTY   │  EMPTY   │                     │
│  ├─────────┤          │          │          │                     │
│  │ 12:00   │          │          │ ┌──────┐ │                     │
│  │         │          │          │ │Riya  │ │                     │
│  └─────────┴──────────┴──────────┴└──────┘─┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Drag & drop appointments
- Click slot to book
- Double-click appointment to edit
- Right-click context menu
- Scrollable time grid
- Current time indicator

---

### AuroraDashboard

**Purpose:** Main dashboard layout.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Good Morning, Saba! 🎉                                          │
│  Here's what's happening at Glow Skin Clinic.                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┬──────────┐                   │
│  │ Revenue  │Appts     │Occupancy │New       │                   │
│  │ ₹38,500  │ 24       │ 68%      │ 5        │                   │
│  │ ↑ 18%    │ ↑ 4      │ ↑ 12%    │ ↑ 2      │                   │
│  └──────────┴──────────┴──────────┴──────────┘                   │
├─────────────────────────────────────────────────────────────────────┤
│  ⚡ Today's Opportunities                                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🟢 3 empty slots worth ₹7,500                           │   │
│  │ 🟡 18 inactive customers                                 │   │
│  │ 🟢 2 birthdays today                                     │   │
│  │ [Review Opportunities →]                                 │   │
│  └────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  📅 Today's Timeline                                              │
│  9:00 AM  │ Anita Singh  │ HydraFacial  │ Priya                  │
│  10:00 AM │ Neha Sharma  │ Chemical Peel│ Neha                   │
│  11:00 AM │ (Empty)      │              │                         │
│  [View Full Calendar →]                                           │
├─────────────────────────────────────────────────────────────────────┤
│  🎂 Upcoming Birthdays  │  🔄 Returning Customers                │
│  Anita Singh - Today    │  3 clients returning                   │
│  Neha Sharma - Tomorrow │  [Send Re-engagement →]               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Templates

### DashboardLayout

**Purpose:** Main application layout.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────┬──────────────────────────────────────────────────────┐ │
│  │        │  ┌────────────────────────────────────────────────┐ │ │
│  │        │  │  Dashboard                  🔍  👤           │ │ │
│  │        │  └────────────────────────────────────────────────┘ │ │
│  │        │                                                    │ │
│  │        │  ┌────────────────────────────────────────────────┐ │ │
│  │        │  │                                                │ │ │
│  │        │  │  Content Area                                  │ │ │
│  │        │  │                                                │ │ │
│  │        │  └────────────────────────────────────────────────┘ │ │
│  └────────┴──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

### SettingsLayout

**Purpose:** Settings with tabs.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                      │
│                                                                    │
│  [General] [Business] [Staff] [Services] [Notifications]          │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  Settings Content Area                                     │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### AuthenticationLayout

**Purpose:** Login/Signup pages.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    ┌──────────────────────────┐                   │
│                    │  Aurora                  │                   │
│                    │  Growth Operating System │                   │
│                    │                          │                   │
│                    │  ┌────────────────────┐  │                   │
│                    │  │  Email             │  │                   │
│                    │  └────────────────────┘  │                   │
│                    │  ┌────────────────────┐  │                   │
│                    │  │  Password          │  │                   │
│                    │  └────────────────────┘  │                   │
│                    │                          │                   │
│                    │  [Sign In]              │                   │
│                    │                          │                   │
│                    │  Don't have an account? │                   │
│                    │  [Start Free Trial]     │                   │
│                    └──────────────────────────┘                   │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Calendar Components

### AppointmentBlock

**Purpose:** Individual appointment in calendar.

```
┌────────────────────────────────────────┐
│  ┌──────────────────────────────────┐  │
│  │  Anita Singh        ● Confirmed │  │
│  │  HydraFacial        🕐 60 min   │  │
│  └──────────────────────────────────┘  │
│  ← 3px colored border                  │
└────────────────────────────────────────┘
```

**Behavior:**
- Drag to move
- Resize handles
- Click to open details
- Double-click to edit
- Right-click for context menu

---

### TimeGrid

**Purpose:** Calendar time slots.

```
┌───────────────────────────────────────────────┐
│  9:00 AM  ├──────────────────────────────────┤
│  9:30 AM  ├──────────────────────────────────┤
│  10:00 AM ├──────────────────────────────────┤
│  10:30 AM ├──────────────────────────────────┤
│  11:00 AM ├──────────────────────────────────┤
│  11:30 AM ├──────────────────────────────────┤
│  12:00 PM ├──────────────────────────────────┤
└───────────────────────────────────────────────┘
```

**Specifications:**
- 30-minute increments
- Current time indicator (red line)
- Business hours highlight
- Weekend shading (optional)

---

## 10. Navigation

### AuroraTabs

**Purpose:** Tab navigation.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Overview │  │ Revenue  │  │  Staff   │  │ Customers│         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│  ────────────────────────────────────────────────────────────────── │
│                                                                    │
│  Tab Content                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface AuroraTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

---

## 11. Dialogs

### AuroraDialog

**Purpose:** Modal dialogs.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ✏️ Edit Appointment                                      │   │
│  │  ───────────────────────────────────────────────────────── │   │
│  │                                                           │   │
│  │  Content Area                                             │   │
│  │                                                           │   │
│  │  ───────────────────────────────────────────────────────── │   │
│  │  [Save Changes] [Cancel]                                 │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Types:**
- `confirmation` — Are you sure?
- `delete` — Confirm deletion
- `edit` — Edit form
- `create` — Create form
- `side-panel` — Slides from right

**Props:**
```typescript
interface AuroraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}
```

---

## 12. Feedback Components

### AuroraToast

**Purpose:** Temporary notifications.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ✅ Success       Appointment confirmed!                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ❌ Error         Failed to save appointment               │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Warning      Please check payment details             │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Variants:**
- `success` — Green
- `error` — Red
- `warning` — Yellow
- `info` — Blue

**Behavior:**
- Auto-dismiss after 3 seconds
- Manual dismiss
- Multiple toasts stack

---

### AuroraSkeleton

**Purpose:** Loading placeholders.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ████████████████                ██████                  │   │
│  │  ████████████████████████████████████                    │   │
│  │  ████████                                                │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                            │   │
│  │  │██████│  │██████│  │██████│                            │   │
│  │  └──────┘  └──────┘  └──────┘                            │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Variants:**
- `text` — Line of text
- `card` — Card placeholder
- `circle` — Avatar placeholder
- `metric` — Metric card placeholder

---

### AuroraEmptyState

**Purpose:** No data display.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                           📭                                       │
│                                                                    │
│                   No appointments today                           │
│                                                                    │
│            Your schedule is clear. Take a break or                │
│            start promoting to fill tomorrow's slots.              │
│                                                                    │
│                    [Create Appointment]                           │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 13. Dashboard Widgets

### RevenueWidget

**Purpose:** Display revenue metrics.

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Revenue Today                         ↑ 18%                   │
│  ₹38,500                                                         │
│  vs yesterday ₹32,600                                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  [Mini Sparkline Chart]                                    │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### AppointmentTimelineWidget

**Purpose:** Today's appointment list.

```
┌─────────────────────────────────────────────────────────────────────┐
│  📅 Today's Timeline                                              │
│                                                                    │
│  9:00 AM  ┌────────────────────────────────────────────────────┐  │
│           │ Anita Singh   HydraFacial   Priya    ● Confirmed │  │
│  10:00 AM └────────────────────────────────────────────────────┘  │
│           ┌────────────────────────────────────────────────────┐  │
│           │ Neha Sharma   Chemical Peel   Neha    ⚪ Pending  │  │
│  11:00 AM └────────────────────────────────────────────────────┘  │
│           │ (Empty)                                              │
│  12:00 PM ┌────────────────────────────────────────────────────┐  │
│           │ Riya Kapoor   Laser Session   Riya    ● Confirmed │  │
│           └────────────────────────────────────────────────────┘  │
│                                                                    │
│  [View Full Calendar →]                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

### OpportunityWidget

**Purpose:** Display AI opportunities.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚡ Today's Opportunities                                         │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🟢 3 empty slots worth ₹7,500                            │   │
│  │ 🟡 18 inactive customers                                  │   │
│  │ 🟢 2 birthdays today                                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [Review All Opportunities →]                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### BirthdayWidget

**Purpose:** Display upcoming birthdays.

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎂 Upcoming Birthdays                                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Today     │ Anita Singh   │ Send Offer                   │   │
│  │  Tomorrow  │ Neha Sharma   │ Send Offer                   │   │
│  │  In 2 days │ Riya Kapoor   │ Send Offer                   │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 14. AI Components

### AuroraOpportunityCard

**Purpose:** Display AI opportunity.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  🔴 High Priority                                        │   │
│  │                                                           │   │
│  │  3 empty slots worth ₹7,500                              │   │
│  │  Tomorrow between 1 PM - 4 PM                            │   │
│  │                                                           │   │
│  │  ┌──────────────────┐  ┌──────────────────┐              │   │
│  │  │  Priya: 2 slots  │  │  Neha: 1 slot   │              │   │
│  │  │  ₹5,000          │  │  ₹2,500          │              │   │
│  │  └──────────────────┘  └──────────────────┘              │   │
│  │                                                           │   │
│  │  [Create Campaign →]                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### AuroraCampaignSuggestion

**Purpose:** Display campaign suggestion.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  💡 Suggested Campaign                                    │   │
│  │                                                           │   │
│  │  Monsoon Glow Facial Offer                                │   │
│  │  Target: 62 customers · Expected: 6-9 bookings           │   │
│  │  Potential Revenue: ₹18,000+                             │   │
│  │                                                           │   │
│  │  "Special offer! Book a HydraFacial this week            │   │
│  │   and get 20% off. Valid for limited slots."             │   │
│  │                                                           │   │
│  │  [Send Campaign] [Edit]                                  │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. Badges

### Badge Specifications

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Success  │  │ Warning  │  │ Danger   │  │  Info    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Revenue  │  │   New    │  │ Inactive │  │ Birthday │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │Completed │  │Confirmed │  │Cancelled │  │ No-Show  │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

| Badge | Background | Text | Use |
|-------|------------|------|-----|
| Success | Green Light | Green | Paid, Completed, Active |
| Warning | Yellow Light | Yellow Dark | Pending, Expiring |
| Danger | Red Light | Red | Cancelled, No-Show, Error |
| Info | Blue Light | Blue | Confirmed, New, Info |
| Revenue | Purple Light | Purple | Revenue indicators |
| New | Blue Light | Blue | New customers, new items |
| Inactive | Gray Light | Gray | Inactive customers |
| Birthday | Pink Light | Pink | Birthday offers |
| Completed | Green Light | Green | Completed appointments |
| Confirmed | Blue Light | Blue | Confirmed appointments |
| Cancelled | Red Light | Red | Cancelled appointments |
| No-Show | Yellow Light | Yellow Dark | No-show appointments |

---

## 16. Icons

### Icon Philosophy

| Rule | Application |
|------|-------------|
| **Use Lucide icons** | Consistent, well-designed, comprehensive |
| **Never mix icon libraries** | Use only Lucide |
| **Default size: md (20px)** | Consistent sizing |
| **Stroke width: 2px** | Premium feel |
| **Color: inherit from text** | Always use currentColor |
| **Icon with text: 8px gap** | Consistent spacing |

### Icon Sizes

| Size | Pixel | Use |
|------|-------|-----|
| xs | 12px | Inline with small text |
| sm | 16px | Inline with body text |
| md | 20px | Default, buttons |
| lg | 24px | Navigation, headings |
| xl | 32px | Empty states, hero |

### Icon Usage Rules

| Context | Use Icon |
|---------|----------|
| Button with text | ✅ Yes, left or right |
| Icon-only button | ✅ Yes, with aria-label |
| Navigation | ✅ Yes |
| Section header | ✅ Yes |
| Paragraph text | ❌ No |
| Body text | ❌ No |

---

## 17. Responsive Rules

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────┬──────────────────────────────────────────────────────┐ │
│  │        │  Full sidebar, 3-4 columns                         │ │
│  │        │                                                    │ │
│  │ 240px  │  Dashboard: 4 metric cards in row                  │ │
│  │        │  Calendar: full time grid                          │ │
│  │        │  Table: full table                                 │ │
│  └────────┴──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Tablet (768-1023px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌────────┬──────────────────────────────────────────────────────┐ │
│  │  Icon  │  Collapsed sidebar, 2-3 columns                    │ │
│  │  only  │                                                    │ │
│  │ 64px   │  Dashboard: 2 metric cards per row                 │ │
│  │        │  Calendar: simplified view                         │ │
│  │        │  Table: scrollable                                 │ │
│  └────────┴──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Header (hamburger menu)                                   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │  Hidden sidebar, 1-2 columns                              │ │
│  │                                                           │ │
│  │  Dashboard: 1-2 metric cards per row                      │ │
│  │  Calendar: day view only                                  │ │
│  │  Table: stacked layout                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 18. Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate button |
| Space | Toggle checkbox |
| Escape | Close dialog |
| Arrow keys | Navigate list |
| Home/End | Jump to start/end |

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### ARIA Guidelines

| Element | ARIA |
|---------|------|
| Dialog | `role="dialog"`, `aria-modal="true"` |
| Button | `role="button"` |
| Icon | `aria-hidden="true"` |
| Icon-only button | `aria-label="Description"` |
| Tab | `role="tab"`, `aria-selected` |
| Tab panel | `role="tabpanel"` |

### Contrast Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text | 3:1 |
| UI components | 3:1 |
| Non-text (icons) | 3:1 |

### Touch Targets

- Minimum touch target: 44px × 44px
- Interactive elements: 44px height minimum

---

## 19. Component Naming Convention

### Naming Pattern

```
Aurora[ComponentName][Variant]?[Size]?
```

### Examples

```
✅ AuroraButton
✅ AuroraButtonPrimary
✅ AuroraButtonLarge
✅ AuroraInput
✅ AuroraInputSearch
✅ AuroraMetricCard
✅ AuroraOpportunityCard
✅ AuroraDialog
✅ AuroraDialogConfirmation
```

### Component Categories

| Prefix | Category | Example |
|--------|----------|---------|
| Aurora | General component | AuroraButton |
| AuroraMetric | Metric display | AuroraMetricCard |
| AuroraOpportunity | AI component | AuroraOpportunityCard |
| AuroraCalendar | Calendar component | AuroraCalendarGrid |

### File Structure

```
src/shared/components/
├── ui/
│   ├── AuroraButton.tsx
│   ├── AuroraInput.tsx
│   ├── AuroraBadge.tsx
│   └── ...
├── atoms/
│   ├── AuroraAvatar.tsx
│   ├── AuroraIcon.tsx
│   └── AuroraSpinner.tsx
├── molecules/
│   ├── AuroraSearchBox.tsx
│   ├── AuroraMetricCard.tsx
│   ├── AuroraAppointmentCard.tsx
│   ├── AuroraCustomerCard.tsx
│   └── AuroraOpportunityCard.tsx
├── organisms/
│   ├── AuroraSidebar.tsx
│   ├── AuroraCalendarGrid.tsx
│   ├── AuroraDashboard.tsx
│   └── AuroraCustomerProfile.tsx
└── templates/
    ├── DashboardLayout.tsx
    ├── SettingsLayout.tsx
    └── AuthenticationLayout.tsx
```

---

## 20. Implementation Notes

### For Frontend Developers

1. **Always use components from this document**
   - Never create custom styles
   - Never use raw HTML elements

2. **Follow the spacing system**
   - Use spacing tokens from Section 4
   - Never use custom padding/margin

3. **Use design tokens**
   - Colors from design system
   - Font sizes from design system

4. **Test accessibility**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast

5. **Write component stories**
   - Each component should have a story
   - Show all variants
   - Show all states

### For AI Coding Agents

1. **Use the component library**
   - Import from `@/components/ui`
   - Use correct import paths

2. **Follow the patterns**
   - Copy existing component usage
   - Use same props pattern

3. **Check accessibility**
   - Add aria-labels
   - Ensure keyboard navigation
   - Test contrast

4. **Write clean code**
   - Use TypeScript
   - Use proper typing
   - Add JSDoc comments

### Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|------------------|
| Inline styles | Use design tokens |
| Custom padding | Use spacing system |
| Hardcoded colors | Use color tokens |
| Missing aria-labels | Always add aria-labels |
| Unresponsive layout | Follow responsive rules |
| No focus states | Add :focus-visible |
| Poor contrast | Check WCAG requirements |

---

*This document is the source of truth for all UI components. Every screen must use these components consistently.*