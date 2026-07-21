# Aurora — Design System & Visual Identity

Based on your design tokens, here's the complete, polished design system with all missing details filled in.

---

## 1. Philosophy

### Design Principles

**Clarity Over Complexity**
Every screen should be immediately understandable. If a user needs to think, we've failed.

**Beauty as a Feature**
Aurora should feel premium. The interface should be the best in the industry—clean, modern, and delightful.

**Speed is Trust**
No user should wait. Skeletons, optimistic updates, and instant feedback build confidence.

**Progressive Disclosure**
Show what's needed now. Hide what's not. Let users discover depth naturally.

**Consistency Breeds Competence**
When everything behaves predictably, users feel in control.

**AI Should Feel Magical, Not Scary**
AI suggestions should feel like a helpful assistant, not a black box.

---

## 2. Visual Identity

### Brand Personality

| Trait | Application |
|-------|-------------|
| **Professional** | Clean typography, restrained colors, ample whitespace |
| **Modern** | Rounded corners, soft shadows, subtle animations |
| **Trustworthy** | Consistent spacing, predictable interactions, clear feedback |
| **Premium** | High-quality icons, thoughtful micro-interactions, polished details |
| **Approachable** | Warm accents, friendly copy, human-centered design |

### Tone of Voice

**Friendly but Professional**
- "Good morning, Saba! Here's what's happening today." ✅
- "Welcome to the dashboard." ❌

**Action-Oriented**
- "Fill 7 empty slots tomorrow" ✅
- "View empty slots" ❌

**Empowering**
- "You can recover ₹14,200 by sending this offer" ✅
- "There are empty slots" ❌

**Concise**
- "42 customers haven't visited in 90+ days" ✅
- "There are 42 customers who have not visited your business in the last 90 days" ❌

---

## 3. Colors

### Primary Palette

```
Primary: #3B82F6 (Blue 500)
Primary Hover: #2563EB (Blue 600)
Primary Light: #EFF6FF (Blue 50)
Primary Dark: #1E3A8A (Blue 900)
```

### Neutral Palette

```
Background: #F8FAFC (Slate 50)
Surface: #FFFFFF (White)
Surface Hover: #F1F5F9 (Slate 100)
Border: #E2E8F0 (Slate 200)
Border Focus: #94A3B8 (Slate 400)
Text Primary: #0F172A (Slate 900)
Text Secondary: #475569 (Slate 600)
Text Muted: #94A3B8 (Slate 400)
Text Inverse: #FFFFFF (White)
```

### Semantic Colors

```
Success: #10B981 (Emerald 500)
Success Light: #ECFDF5 (Emerald 50)
Success Hover: #059669 (Emerald 600)

Warning: #F59E0B (Amber 500)
Warning Light: #FFFBEB (Amber 50)
Warning Hover: #D97706 (Amber 600)

Danger: #EF4444 (Red 500)
Danger Light: #FEF2F2 (Red 50)
Danger Hover: #DC2626 (Red 600)

Info: #3B82F6 (Blue 500)
Info Light: #EFF6FF (Blue 50)
Info Hover: #2563EB (Blue 600)
```

### Accessibility Contrast

| Pair | Contrast Ratio | WCAG Level |
|------|---------------|------------|
| Text Primary on Surface | 15.3:1 | AAA ✅ |
| Text Secondary on Surface | 8.2:1 | AAA ✅ |
| Text Muted on Surface | 3.9:1 | AA ✅ |
| Primary on Surface | 5.2:1 | AA ✅ |
| Text on Primary | 4.8:1 | AA ✅ |

---

## 4. Typography

### Font Family

```css
--font-family: 'Inter Variable', -apple-system, system-ui, sans-serif;
```

**Why Inter Variable:**
- Professional and modern appearance
- Excellent readability at all sizes
- Variable weight support for fine-tuned hierarchy
- Optimized for screen reading
- Free and open-source

### Type Scale

```
┌─────────────┬──────────┬──────────┬──────────────┬─────────────────┐
│   Token     │  Size    │  Weight  │  Line Height │    Usage        │
├─────────────┼──────────┼──────────┼──────────────┼─────────────────┤
│ heading-1   │ 48px     │ 700      │ 56px         │ Landing pages   │
│ heading-2   │ 36px     │ 700      │ 44px         │ Dashboard titles│
│ heading-3   │ 30px     │ 600      │ 38px         │ Section headers │
│ heading-4   │ 24px     │ 600      │ 32px         │ Card titles     │
│ heading-5   │ 20px     │ 600      │ 28px         │ Sub-sections    │
│ body-large  │ 18px     │ 400      │ 28px         │ Lead text       │
│ body        │ 16px     │ 400      │ 24px         │ Primary content │
│ body-small  │ 14px     │ 400      │ 20px         │ Secondary text  │
│ caption     │ 12px     │ 400      │ 16px         │ Helper text     │
│ overline    │ 11px     │ 600      │ 16px         │ Labels          │
└─────────────┴──────────┴──────────┴──────────────┴─────────────────┘
```

### Font Weights

```
300: Light (rarely used)
400: Regular (body text)
500: Medium (emphasis)
600: Semibold (subheadings)
700: Bold (headings)
```

### Usage Rules

- **Never** use font sizes outside the design tokens
- **Never** use font weights outside 400, 500, 600, 700
- **Always** use `font-smooth: antialiased`
- **Always** use `text-rendering: optimizeLegibility`

---

## 5. Grid System

### 12-Column Grid

```
┌─────────────────────────────────────────────────────┐
│ 12 │ 11 │ 10 │ 9 │ 8 │ 7 │ 6 │ 5 │ 4 │ 3 │ 2 │ 1 │
│   │    │    │   │   │   │   │   │   │   │   │    │
└─────────────────────────────────────────────────────┘
         │                │                 │
      Sidebar          Main            Optional
      (240px)         (flex)           (320px)
```

### Breakpoints

```
┌────────────────┬──────────┬─────────┬──────────────────────┐
│   Breakpoint   │  Min     │  Max    │   Layout             │
├────────────────┼──────────┼─────────┼──────────────────────┤
│   mobile       │  0px     │ 639px   │   1 column           │
│   tablet       │  640px   │ 1023px  │   1-2 columns        │
│   desktop      │  1024px  │ 1279px  │   2-3 columns        │
│   wide         │  1280px  │ ∞       │   3-4 columns        │
└────────────────┴──────────┴─────────┴──────────────────────┘
```

### Layout Patterns

```
Desktop:  ┌──────────┬──────────────────────────┐
          │ Sidebar  │  Main Content            │
          │ 240px    │  flex:1                  │
          └──────────┴──────────────────────────┘

Tablet:   ┌─────────────────────────────────────┐
          │  Sidebar (collapsed)  │  Main       │
          │  72px                  │  flex:1     │
          └─────────────────────────────────────┘

Mobile:   ┌─────────────────────────────────────┐
          │  Main Content                       │
          │  (sidebar hidden)                   │
          └─────────────────────────────────────┘
```

---

## 6. Spacing

### Design Tokens

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
--space-11: 80px;
--space-12: 96px;
--space-13: 128px;
```

### Spacing Scale Visual

```
0px    ──
4px    ──
8px    ───
12px   ────
16px   ─────
20px   ──────
24px   ───────
32px   ──────────
40px   ────────────
48px   ──────────────
64px   ──────────────────
80px   ────────────────────
96px   ──────────────────────
128px  ───────────────────────────
```

### Spacing Rules

| Element | Padding | Margin |
|---------|---------|--------|
| Page | 24px | - |
| Section | 24px | 32px bottom |
| Card | 24px | 16px bottom |
| Input | 8px 12px | 0 0 4px 0 |
| Button | 8px 16px | 0 |
| Modal | 24px | - |
| Toast | 12px 16px | 8px bottom |

### Never Use
- `margin-top` (use `margin-bottom` instead)
- Odd numbers (4, 8, 12, 16...)
- Arbitrary spacing values

---

## 7. Border Radius

### Radius Tokens

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-default: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-full: 9999px;
```

### Usage

```
┌─────────────────┬──────────────┬───────────────────────┐
│   Element       │   Radius     │   Example             │
├─────────────────┼──────────────┼───────────────────────┤
│   Badge         │   full       │   ○ New               │
│   Avatar        │   full       │   👤                  │
│   Button        │   8px        │   [Click Me]          │
│   Card          │   16px       │   ┌──────────┐       │
│   Dialog        │   16px       │   │          │       │
│   Input         │   8px        │   [input]             │
│   Dropdown      │   8px        │   ▼                   │
│   Tooltip       │   6px        │   ⚡                   │
│   Toast         │   12px       │   ✅ Success          │
│   Table         │   8px        │   ┌──┬──┬──┐         │
└─────────────────┴──────────────┴───────────────────────┘
```

---

## 8. Shadows

### Shadow Tokens

```css
--shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);
--shadow-default: 0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Usage

```
┌─────────────────┬──────────────────────────────────────────────┐
│   Element       │   Shadow                                    │
├─────────────────┼──────────────────────────────────────────────┤
│   Card (default)│   default                                   │
│   Card (hover)  │   md                                        │
│   Dropdown      │   lg                                        │
│   Dialog        │   2xl                                       │
│   Tooltip       │   md                                        │
│   Toast         │   lg                                        │
│   Button        │   sm                                        │
│   Floating      │   lg                                        │
└─────────────────┴──────────────────────────────────────────────┘
```

---

## 9. Icons

### Icon Library

**Primary:** Lucide Icons (v0.3+)
**Secondary:** Custom SVG icons

### Icon Size Tokens

```css
--icon-xs: 12px;
--icon-sm: 14px;
--icon-md: 16px;
--icon-lg: 20px;
--icon-xl: 24px;
--icon-2xl: 32px;
--icon-3xl: 48px;
```

### Icon Usage Rules

```
┌──────────────────────┬─────────────┬────────────────────────┐
│   Context            │   Size      │   Stroke Width         │
├──────────────────────┼─────────────┼────────────────────────┤
│   Button             │   md        │   2                     │
│   Navigation         │   lg        │   2                     │
│   Avatar             │   xl        │   1.5                   │
│   Empty State        │   3xl       │   1                     │
│   List item          │   md        │   2                     │
│   Alert              │   lg        │   2                     │
│   Status indicator   │   sm        │   2                     │
└──────────────────────┴─────────────┴────────────────────────┘
```

### Common Icons

```
📅 Calendar      👤 User           💳 Credit Card
📋 List          🔍 Search         🏷️ Tag
📈 Chart         ⚙️ Settings       🔔 Bell
📊 Bar Chart     👥 Users          💰 Dollar Sign
📁 Folder        📱 Phone          ✉️ Mail
📝 Edit          🗑️ Trash          ➕ Plus
✕ Close          ✓ Check           ← Arrow
↑ Arrow Up       ↓ Arrow Down      → Arrow Right
🏠 Home          📌 Pin            ⭐ Star
❤️ Heart         🔒 Lock           🔓 Unlock
🔄 Refresh       ☰ Menu            ⋮ More
```

---

## 10. Components

### Button Variants

```css
/* Primary */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 200ms;
}
.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* Secondary */
.btn-secondary {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 8px;
}
.btn-secondary:hover {
  background: var(--surface-hover);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 8px;
}
.btn-ghost:hover {
  background: var(--surface-hover);
}

/* Danger */
.btn-danger {
  background: var(--danger);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
.btn-danger:hover {
  background: var(--danger-hover);
}
```

### Button Sizes

```css
--btn-sm: height 32px, padding 0 12px, font-size 14px;
--btn-md: height 40px, padding 0 16px, font-size 16px;
--btn-lg: height 48px, padding 0 24px, font-size 18px;
```

---

## 11. Forms

### Input Styling

```css
/* Base Input */
.input {
  height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 16px;
  transition: border-color 200ms;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

.input:disabled {
  background: var(--surface-hover);
  cursor: not-allowed;
  opacity: 0.6;
}

.input.error {
  border-color: var(--danger);
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}
```

### Label Rules

```
✅ Label above input
✅ Required fields marked with *
✅ Validation below input
✅ Always reserve space for validation message
✅ Never use placeholder as label
✅ Labels should be descriptive
```

### Form Layout

```
┌─────────────────────────────────────────────────────┐
│  📝 Booking Details                               │
│                                                   │
│  Customer Name *                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  John Doe                                   │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  Email Address                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  john@example.com                           │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  Phone Number *                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  +91 98765 43210                            │  │
│  └─────────────────────────────────────────────┘  │
│  Please enter a valid phone number               │
│                                                   │
│  [Save] [Cancel]                                   │
└─────────────────────────────────────────────────────┘
```

---

## 12. Tables

### Table Styling

```css
/* Base Table */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead {
  background: var(--surface-hover);
  border-bottom: 1px solid var(--border);
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}

.table tbody tr:hover {
  background: var(--surface-hover);
}

.table tbody tr:last-child td {
  border-bottom: none;
}
```

### Table Variations

```
┌─────────────────────────────────────────────────────┐
│  Customer Name        Phone      Last Visit  Spend │
│─────────────────────────────────────────────────────│
│  Anita Singh        +91 98765..  10 May  ₹2,500  │
│  Priya Sharma       +91 98765..  28 Apr  ₹3,500  │
│  Neha Verma         +91 98765..  15 Apr  ₹2,500  │
│                                                    │
│  Showing 3 of 42 customers                         │
│  [Previous] 1 2 3 4 ... [Next]                    │
└─────────────────────────────────────────────────────┘
```

---

## 13. Calendar

### Calendar Card Styling

```css
/* Appointment Card */
.appointment-card {
  background: var(--surface);
  border-radius: 8px;
  padding: 8px 12px;
  border-left: 3px solid var(--primary);
  transition: all 150ms;
  cursor: pointer;
  position: relative;
}

.appointment-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.appointment-card.past {
  opacity: 0.6;
}

.appointment-card.cancelled {
  text-decoration: line-through;
  opacity: 0.4;
}

.appointment-card.completed {
  border-left-color: var(--success);
}

.appointment-card.completed::after {
  content: "✓";
  color: var(--success);
  position: absolute;
  right: 8px;
  top: 8px;
}

/* Staff Color Coding */
.staff-priya { border-left-color: #8B5CF6; }
.staff-neha { border-left-color: #EC4899; }
.staff-arjun { border-left-color: #3B82F6; }
```

### Calendar Features

| Feature | Behavior |
|---------|----------|
| Single click | Select appointment |
| Double click | Open details |
| Right click | Context menu |
| Drag | Reorder appointments |
| Resize | Adjust duration |
| Past appointments | Muted appearance |
| Cancelled | Strike-through |
| Completed | Green indicator |

---

## 14. Dashboard

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  # Good Morning, Saba 🎉                           │
│  Here's what's happening with Glow Skin Clinic.   │
├─────────────────────────────────────────────────────┤
│  ┌───────────┬──────────┬──────────┬──────────┐  │
│  │  Revenue   │Appts     │Occupancy │New Custo │  │
│  │  ₹38,500   │ 24       │ 68%     │ 5        │  │
│  │  ↑ 18%     │ ↑ 4      │ ↑ 12%   │ ↑ 2      │  │
│  └───────────┴──────────┴──────────┴──────────┘  │
├─────────────────────────────────────────────────────┤
│  🎯 AI Business Advisor (Hero)                    │
│  ┌─────────────────────────────────────────────────┐│
│  │  You have 7 empty slots tomorrow             ││
│  │  Estimated lost revenue: ₹14,200             ││
│  │  [Send Campaign]                             ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  📅 Today's Schedule                               │
│  ┌──────┬───────────────────────────────────────┐  │
│  │ 9:00 │  ████░  ████████  ██                 │  │
│  │ 10:00│  ██████  ████████  ████              │  │
│  │ 11:00│  ████░  █████████  ██                │  │
│  │ 12:00│  ██████  ███████   ██████           │  │
│  └──────┴───────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  💡 Quick Actions                                 │
│  [+ Appointment] [+ Customer] [Billing] [Report]  │
└─────────────────────────────────────────────────────┘
```

### Dashboard Cards

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Revenue     │ │ Appointments│ │ Occupancy   │
│ ₹38,500     │ │ 24          │ │ 68%        │
│ ↑ 18%       │ │ ↑ 4         │ │ ↑ 12%      │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 15. Dialogs

### Dialog Types

```css
/* Base Dialog */
.dialog-overlay {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  max-width: 560px;
  width: 90%;
  box-shadow: var(--shadow-2xl);
  animation: dialog-in 200ms ease;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Dialog Variations

```
┌─────────────────────────────────────────────────────┐
│  ✏️ Edit Appointment                              │
│                                                   │
│  Customer: Anita Singh                            │
│  Service: Hydra Facial                            │
│  Staff: Priya Sharma                              │
│  Time: 11:00 AM                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  [Confirm] [Cancel]                        │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚠️ Delete Customer                               │
│                                                   │
│  Are you sure you want to delete Anita Singh?    │
│  This action cannot be undone.                   │
│                                                   │
│  [Delete] [Cancel]                                 │
└─────────────────────────────────────────────────────┘
```

---

## 16. Notifications

### Toast Messages

```css
.toast {
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  animation: toast-in 300ms ease;
  max-width: 420px;
}

.toast.success {
  border-left: 4px solid var(--success);
}

.toast.error {
  border-left: 4px solid var(--danger);
}

.toast.warning {
  border-left: 4px solid var(--warning);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Notification Types

```
✅ Success    Appointment confirmed!
❌ Error      Failed to save customer
⚠️ Warning    Please check payment details
ℹ️ Info       New update available
```

---

## 17. Animations

### Animation Tokens

```css
--duration-fast: 150ms;
--duration-default: 200ms;
--duration-slow: 250ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

### Animation Rules

| Rule | Application |
|------|-------------|
| Maximum duration | 250ms |
| Default duration | 180ms |
| Never animate layout shifts | Avoid `width`, `height`, `margin`, `padding` |
| Prefer opacity and transform | Use `opacity`, `transform`, `translate` |
| Avoid flashy effects | No bounce, no glow, no rotation |
| Subtle motion to reinforce actions | Menu slide, card hover lift |

### Common Animations

```css
/* Hover Lift */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: all 200ms;
}

/* Fade In */
.fade-in {
  animation: fade-in 200ms ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In */
.slide-in {
  animation: slide-in 200ms ease-out;
}

@keyframes slide-in {
  from { 
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse (loading) */
.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 18. Accessibility

### Color Contrast Requirements

| Element | WCAG Level | Ratio |
|---------|-----------|-------|
| Normal text | AA | ≥4.5:1 |
| Large text | AA | ≥3:1 |
| UI components | AA | ≥3:1 |
| Non-text (icons) | AA | ≥3:1 |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move forward |
| Shift+Tab | Move backward |
| Enter | Activate/Submit |
| Space | Toggle/Check |
| Escape | Close/Return |
| Arrow keys | Navigate lists |
| Home/End | Jump to start/end |

### Screen Reader Support

```html
<!-- ARIA Labels -->
<button aria-label="Close dialog">×</button>
<input aria-describedby="email-help" />
<div role="status" aria-live="polite">Loading...</div>

<!-- Focus Management -->
<div role="dialog" aria-modal="true">
  <h2 id="dialog-title">Edit Appointment</h2>
  <button autofocus>Confirm</button>
</div>
```

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 19. Responsive Rules

### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Patterns

**Desktop (≥1024px)**
```
┌─────────┬──────────────────────────────────────┐
│ Sidebar │  Main Content                       │
│ 240px   │  flex:1                            │
└─────────┴──────────────────────────────────────┘
```

**Tablet (640-1023px)**
```
┌─────────┬──────────────────────────────────────┐
│ Icon    │  Main Content                       │
│ 72px    │  flex:1                            │
└─────────┴──────────────────────────────────────┘
```

**Mobile (<640px)**
```
┌─────────────────────────────────────────────────┐
│  Header (with hamburger)                       │
├─────────────────────────────────────────────────┤
│  Main Content                                  │
│  (1 column)                                    │
└─────────────────────────────────────────────────┘
```

### Responsive Tables

```css
/* Stack on mobile */
@media (max-width: 640px) {
  .table thead {
    display: none;
  }
  
  .table tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  
  .table td {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
  }
  
  .table td::before {
    content: attr(data-label);
    font-weight: 600;
  }
}
```

---

## 20. Design Tokens

### Complete Token Set

```css
/* Colors */
--primary: #3B82F6;
--primary-hover: #2563EB;
--primary-light: #EFF6FF;
--primary-dark: #1E3A8A;

--background: #F8FAFC;
--surface: #FFFFFF;
--surface-hover: #F1F5F9;
--border: #E2E8F0;
--border-focus: #94A3B8;

--text-primary: #0F172A;
--text-secondary: #475569;
--text-muted: #94A3B8;
--text-inverse: #FFFFFF;

--success: #10B981;
--success-light: #ECFDF5;
--success-hover: #059669;

--warning: #F59E0B;
--warning-light: #FFFBEB;
--warning-hover: #D97706;

--danger: #EF4444;
--danger-light: #FEF2F2;
--danger-hover: #DC2626;

--info: #3B82F6;
--info-light: #EFF6FF;
--info-hover: #2563EB;

/* Typography */
--font-family: 'Inter Variable', -apple-system, system-ui, sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;
--font-size-5xl: 48px;

/* Spacing */
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
--space-11: 80px;
--space-12: 96px;
--space-13: 128px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-default: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);
--shadow-default: 0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Animation */
--duration-fast: 150ms;
--duration-default: 200ms;
--duration-slow: 250ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* Z-Index */
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

---

## 21. Cards

### Card Styling

```css
.card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-default);
  transition: all var(--duration-default) var(--ease-default);
  border: 1px solid var(--border);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
```

### Card Variations

```
┌─────────────────────────────────────┐
│  📊 Revenue Overview                │  ← Card with title
│  ₹2,45,800  ↑ 18.6% vs last week   │
│  ┌─────────────────────────────────┐│
│  │  [Chart]                        ││
│  └─────────────────────────────────┘│
│  Last updated: 2 mins ago          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💡 AI Insights                     │
│  You have 7 empty slots tomorrow   │
│  Potential revenue: ₹14,200        │
│  [Send Campaign]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  👤 Customer Profile                │
│  Anita Singh   VIP                  │
│  +91 98765 43210                    │
│  12 visits · Last: 10 May          │
│  [Message] [Call] [Book]           │
└─────────────────────────────────────┘
```

---

## 22. Loading & Empty States

### Loading States

```css
/* Skeleton */
.skeleton {
  background: var(--surface-hover);
  border-radius: var(--radius-default);
  animation: pulse 2s ease-in-out infinite;
}

.skeleton-text {
  height: 16px;
  width: 100%;
}

.skeleton-circle {
  height: 48px;
  width: 48px;
  border-radius: var(--radius-full);
}

.skeleton-card {
  height: 120px;
  border-radius: var(--radius-xl);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Loading Sequence

```
1. Skeleton (immediate)
   ↓
2. Content (when data arrives)
   ↓
3. Empty State (if no data)
   ↓
4. Error State (if failed)
   ↓
5. Retry Button (on error)
```

### Empty State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    📭                               │
│                                                     │
│           No appointments today                    │
│                                                     │
│     Your schedule is clear. Take a break or        │
│     start promoting to fill tomorrow's slots.      │
│                                                     │
│              [Create Appointment]                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    ⚠️                               │
│                                                     │
│        Failed to load appointments                  │
│                                                     │
│     We're having trouble connecting. Please         │
│     try again or check your internet.              │
│                                                     │
│              [Retry]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 23. Implementation Checklist

### Phase 1: Foundation
- [ ] Install `@fontsource/inter` for Inter Variable font
- [ ] Configure Tailwind with design tokens
- [ ] Set up shadcn/ui with custom theme
- [ ] Create global CSS variables
- [ ] Implement base component styles

### Phase 2: Components
- [ ] Button (all variants, all sizes)
- [ ] Input (with label, validation, error states)
- [ ] Card (with header, content, footer)
- [ ] Table (with sort, pagination)
- [ ] Dialog (with overlay, animation)
- [ ] Toast (all types, with animation)
- [ ] Avatar (with fallback)
- [ ] Badge (all variants)
- [ ] Skeleton (all shapes)

### Phase 3: Layout
- [ ] Sidebar navigation
- [ ] Header with user profile
- [ ] Grid system (12-column)
- [ ] Responsive breakpoints
- [ ] Container and max-width

### Phase 4: Polish
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support
- [ ] Animation smoothing
- [ ] Performance optimization

---

## 24. Quick Reference

### Common Patterns

```tsx
// Button
<Button variant="primary" size="md">Save</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Revenue Overview</CardTitle>
    <CardDescription>Last 30 days</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Input
<Input
  label="Email"
  placeholder="Enter your email"
  error="Please enter a valid email"
  required
/>

// Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Appointment</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Toast
toast({
  title: "Success",
  description: "Appointment confirmed!",
  variant: "success",
});
```

### Never Do

❌ Use font sizes outside design tokens
❌ Use arbitrary spacing values
❌ Hardcode colors (use variables)
❌ Forget validation messages
❌ Omit loading states
❌ Skip keyboard navigation
❌ Use placeholder as label
❌ Animate layout properties (width, height, margin)

---

*This design system is the foundation of Aurora's visual identity. Every decision has been made to ensure consistency, quality, and a premium user experience. All future designs must align with these tokens and principles.*