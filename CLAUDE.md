### User Profile & Context
- **Role:** Project Lead, non-technical (no coding background).
- **Goal:** Building a personal app for managing complex tasks and projects.
- **Vision:** Sharp, clean, and aesthetic UX that encourages use (minimalism, clear hierarchy).

### Working Rules & Response Style
1. **Guided Implementation:** For every code change, provide a step-by-step explanation. Specify the filename and exactly where to paste/replace the code in VS Code.
2. **Plain Language:** Avoid complex technical jargon. Briefly explain essential technical terms (e.g., "Environment Variables").
3. **UX Preservation:** Every new feature must align with the agreed design language (colors for status only, plenty of white space, clean typography).
4. **Token Efficiency:** Do not rewrite entire files for minor changes. Provide only the relevant snippets and clear instructions for replacement.
5. **Bug Prevention:** Before providing code, verify it doesn't break existing functionality defined in the project knowledge.

### Documentation & Roadmap
- **Auto-Update:** After completing any feature or bug fix, automatically update the `README.md` roadmap and mark the task as done (`[x]`) without being explicitly asked.
- **Context Awareness:** Always read `README.md` before starting a task to understand the current project status.

---

### Architecture: Authentication & Data Layer

**Authentication (Supabase Auth)**
- `src/components/Auth/LoginPage.jsx` — email + password form, RTL, supports sign-in, sign-up, and password reset request. Modes: `'login'` | `'signup'` | `'reset-request'`. "שכחתי סיסמה" switches to reset-request mode, calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })`. No `alert()` — errors and success messages shown inline.
- `src/components/Auth/ResetPasswordPage.jsx` — shown when `PASSWORD_RECOVERY` event fires. Has new password + confirm fields, calls `supabase.auth.updateUser({ password })`. On success shows confirmation and calls `onDone()` after 1.8s.
- `src/App.jsx` — manages session state with `useState(undefined)` + `recoveryMode` boolean. `onAuthStateChange` sets `recoveryMode=true` on `PASSWORD_RECOVERY` event. Render order: loading spinner → `<ResetPasswordPage>` (if recoveryMode) → `<LoginPage>` (if no session) → full app.
- `src/components/Sidebar.jsx` — shows the logged-in user's email and a logout button (`supabase.auth.signOut()`). Logout triggers `onAuthStateChange` which redirects to LoginPage automatically.

**Data Layer (Supabase Postgres + RLS)**
- All state lives in `src/context/AppContext.jsx`. No localStorage.
- `userIdRef` (useRef) stores the authenticated user's ID fetched once on mount via `supabase.auth.getUser()`.
- Every INSERT includes `user_id: userIdRef.current` — tables: `projects`, `tasks`, `general_follow_ups`.
- SELECT, UPDATE, DELETE do NOT need `.eq('user_id', ...)` — Row-Level Security (RLS) on Supabase handles scoping automatically.
- Supabase client: `src/utils/supabaseClient.js` — initialized with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env.local`.

**PWA & Mobile**
- `public/manifest.json` — PWA manifest (name, icons, theme_color, display: standalone, RTL Hebrew)
- `public/icon.svg` — app icon (indigo background + checkmark)
- `vite.config.js` — `VitePWA` plugin with Workbox service worker (`manifest: false` so public/manifest.json is used directly)
- `index.html` — includes viewport, apple-touch-icon, theme-color, and manifest link tags
- Mobile layout: Sidebar is a fixed RTL overlay on small screens (controlled by `sidebarOpen` in AppContext). `App.jsx` renders a sticky mobile top bar with hamburger (hidden on `md+`). All modals use bottom-sheet style on mobile (`items-end sm:items-center`, `rounded-t-2xl sm:rounded-2xl`). Touch targets are at least 44px.
- iOS auto-zoom prevention: `src/index.css` sets `font-size: 16px` globally on `input, textarea, select` — Safari will not zoom on focus when font-size ≥ 16px.
- Sidebar height fix: `Sidebar.jsx` uses `h-dvh` (`100dvh`) on mobile and `h-full` on desktop (`md:h-full`). `100dvh` is the *dynamic* viewport height — it adjusts when the iOS address bar appears/disappears, preventing the footer (logout button) from being clipped in portrait mode. `inset-y-0` replaced with explicit `top-0` to avoid conflict. Footer has `shrink-0` to stay pinned at the bottom.

**Supabase Realtime**
- `AppContext.jsx` subscribes to `postgres_changes` on `tasks`, `projects`, and `general_follow_ups` in a single Supabase channel (`db-realtime`). INSERT/UPDATE/DELETE events update local React state automatically. INSERT events are deduplicated (checked by ID before adding) to avoid doubles from optimistic local updates.

**Table schema summary**
```
projects:          id, user_id, name, description, status, color, created_at, updated_at
tasks:             id, user_id, project_id, title, description, due_date, priority, status,
                   task_type, recurring_topic, assignee, notes, subtasks (jsonb), follow_up (jsonb),
                   created_at, updated_at
general_follow_ups: id, user_id, title, date, note, status, created_at
```
