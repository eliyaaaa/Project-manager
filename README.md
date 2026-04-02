# Project Manager

A focused, Hebrew-first project and task management app built for people juggling multiple complex projects at once. Fast, local-first, and designed around clarity over clutter.

---

## Project Overview

Project Manager is a single-page React application that gives you a unified workspace to track projects, tasks, follow-ups, and recurring topics — all without a backend or login.

### What it does

**Dashboard** — A live command center showing:
- Stat cards: active projects, overdue tasks, tasks due today, total completed
- Urgent & immediate: overdue tasks + follow-ups due today, all in one panel
- This week: tasks due within the next 7 days
- Follow-ups today: tasks with a scheduled callback date landing on today
- Recurring topics: grouped recurring tasks, each showing its next open item
- Projects overview: progress bars, status badges, and open task counts

**Projects** — A color-coded card grid with per-project progress, status, description, and a "next task" preview. Drill into any project to see its full task list with inline completion toggles.

**Tasks** — Full task list with filtering by project, priority, status, and free-text search. Tasks support subtasks, due dates, priority levels, assignees, notes, and an embedded follow-up date.

**Task types**:
- `regular` — standalone task
- `project` — linked to a project
- `recurring` — belongs to a named recurring topic (e.g. "Weekly Sync", "Invoicing")

**Follow-Ups** — Dedicated screen for two follow-up stores:
- Task follow-ups (attached to an existing task)
- General follow-ups (standalone reminders with title, date, notes, and status)
- Both support create, edit (pencil icon), and delete (trash icon with confirmation)

**Calendar** — Monthly calendar view showing tasks by due date.

**Review** — A focused page listing all open tasks for a structured weekly review.

### UX Details
- Smooth modal open/close animations (slide up / slide down)
- Page transition fade on every navigation
- Task completion strikethrough animation
- Toast notifications on task completion, deletion, and project completion
- Progressive disclosure in the new task form (primary fields visible by default, advanced fields expandable)
- Active sidebar item highlighted with an indigo accent border

### Data
Data is stored in **Supabase** (cloud Postgres database). The Supabase client is initialized in `src/utils/supabaseClient.js` and can be imported into any component:

```js
import { supabase } from '../utils/supabaseClient'
```

Connection credentials are stored in `.env.local` (gitignored — never committed):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | lucide-react |
| State Management | React Context API (`AppContext` + `ToastContext`) |
| Routing | Manual state-based routing (`currentPage` in context) |
| Persistence | Supabase (Postgres cloud DB) |
| Language | JavaScript (JSX) |
| Date Utilities | Custom (`dateUtils.js` — no date-fns or dayjs) |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

> **Requirements:** Node.js 18+ and npm 9+

---

## Project Structure

```
src/
├── App.jsx                          # Root component + page routing
├── main.jsx                         # React entry point
├── index.css                        # Tailwind + custom animations
├── context/
│   ├── AppContext.jsx                # Global state, localStorage, all CRUD actions
│   └── ToastContext.jsx              # Toast notification system
├── components/
│   ├── Sidebar.jsx                  # Navigation sidebar with active state
│   ├── Dashboard.jsx                # Main dashboard with all summary panels
│   ├── TaskList.jsx                 # Full task list with filters
│   ├── ProjectList.jsx              # Project cards grid
│   ├── ProjectDetail.jsx            # Single project + its tasks
│   ├── FollowUps.jsx                # Follow-ups management screen
│   ├── CalendarView.jsx             # Monthly calendar view
│   ├── ReviewPage.jsx               # Weekly review — all open tasks
│   ├── ToastContainer.jsx           # Fixed toast renderer
│   └── modals/
│       ├── TaskModal.jsx            # Create / edit task
│       ├── ProjectModal.jsx         # Create / edit project
│       ├── FollowUpModal.jsx        # Create / edit task follow-up
│       └── GeneralFollowUpEditModal.jsx  # Edit standalone follow-up
└── utils/
    ├── constants.js                 # Status maps, priorities, colors
    ├── dateUtils.js                 # Date helpers (today, diff, labels, format)
    └── supabaseClient.js            # Supabase client (initialized, ready to use)
```

---

## Roadmap

- [x] Basic UI, Sidebar, and Dashboard
- [x] Projects with progress tracking and color coding
- [x] Tasks with subtasks, priorities, due dates, and follow-ups
- [x] Recurring topics grouping
- [x] General follow-ups with full CRUD
- [x] Calendar view and Review page
- [x] Modal animations, page transitions, and toast notifications
- [x] Progressive disclosure in task creation form
- [x] Supabase client initialized — cloud database connected
- [ ] Advanced task filtering and saved filter presets
- [ ] Multi-user support and real-time syncing

---

## Design Philosophy

**Minimal, not sparse.** Every element earns its place. No decorative clutter — just information and action.

**Progressive disclosure.** The new task form shows only what you need upfront. Advanced fields expand on demand. You're never overwhelmed.

**Immediate feedback.** Task completion triggers a strikethrough animation. Project completion fires a celebratory toast. The UI talks back.

**Visual consistency.** A tight color system: `slate-900` sidebar, `indigo` for primary actions, `red/amber/emerald` for urgency and status. Each project gets a persistent color thread across every view.

**RTL-first.** Every layout, icon placement, and alignment was designed for right-to-left Hebrew reading from the start — not retrofitted.

**Cloud-backed.** Data is stored in Supabase (Postgres), making it persistent, secure, and accessible from any device.
