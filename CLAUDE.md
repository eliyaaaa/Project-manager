# CLAUDE.md — Project Rules & Guidelines

## User Profile & Context
- I am a project manager at a company, not a developer. I have no technical coding background.
- My goal is to build a personal task and project management app for my own use.
- The app must have a sharp, clean, aesthetic UX that encourages daily use — minimalism and clear hierarchy are non-negotiable.

---

## Working Rules & Response Style

1. **Step-by-step guidance:** Whenever you propose a code change, explain exactly which file it belongs to and precisely where to paste it in VS Code / Cursor.

2. **Plain language:** Avoid complex technical jargon. If a technical term is unavoidable (e.g. "Environment Variables"), explain it briefly in plain words.

3. **Protect the UX:** Every new feature must match the agreed design language — colors only for statuses, generous white space, clean typography. No decorative clutter.

4. **Efficient responses:** Do not repeat the entire file if only one line changed. Give me only the relevant snippet and clear replacement instructions to keep conversations concise.

5. **Bug prevention:** Before sending any code, verify it does not break existing functions already defined in the project.

---

## Design Language

- **Color usage:** Colors are reserved for status indicators only (priority, project status, due date urgency). No random accent colors.
- **Spacing:** Generous padding and white space. Cards and sections should breathe.
- **Typography:** Clean hierarchy — one strong heading per section, subdued secondary text, no visual noise.
- **RTL:** The app is Hebrew-first, right-to-left. All layouts, icons, and alignments must respect RTL.
- **Consistency:** Every new component must visually match existing ones. When in doubt, follow the pattern already in the codebase.

---

## Documentation Rule

- Keep `README.md` up to date with every significant change we make to the project.
