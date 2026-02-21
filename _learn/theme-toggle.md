# Lessons Learned: Theme Toggle (Dark/Light Mode)

## 1. Successes
- Successfully implemented a premium dark/light theme toggle using `next-themes`.
- Implemented the browser-native **View Transitions API** for a circular ripple effect emanating from the click point — no extra animation library needed.
- Applied dual Tailwind `dark:` class variants across the entire UI for full body coverage.

## 2. Friction Points & Bugs

- **Issue:** Theme toggle button clicked but nothing changed visually.
- **Root Cause (Part 1):** `next-themes` was configured with `attribute="data-theme"`, which adds `data-theme="dark"` on `<html>`. However, Tailwind v4's `dark:` variant by default looks for a `.dark` **class** — not a data attribute. They were not in sync.
- **Root Cause (Part 2):** Tailwind v4 defaults to **media-query-based** dark mode. It requires an explicit directive to switch to class-based mode.
- **Fix:** Two changes were needed together:
  1. In `layout.tsx`, change `ThemeProvider` to `attribute="class"` so `next-themes` adds/removes the `.dark` class.
  2. In `globals.css`, add the Tailwind v4 class-based dark mode directive:
     ```css
     @variant dark (&:where(.dark, .dark *));
     ```

## 3. Future Technical Debt
- The View Transitions API is not yet supported in Firefox (falls back to instant switch gracefully).
- Consider adding a transition indicator or animation skeleton for low-end devices.

## 4. New Knowledge
- **[Agent Note]:** In **Tailwind v4**, dark mode is **media-query based by default**. To make `dark:` classes respond to a `.dark` class on `<html>`, you MUST add this directive at the top of `globals.css`:
  ```css
  @variant dark (&:where(.dark, .dark *));
  ```
  Without this, `dark:` classes will never activate regardless of what class is on `<html>`.

- **[Agent Note]:** When using `next-themes` with Tailwind v4 `dark:` classes, always set `attribute="class"` on `ThemeProvider`. Using `attribute="data-theme"` will break Tailwind's `dark:` variant.

- **[Agent Note]:** To make the View Transitions ripple originate from the exact click point, capture `e.clientX` / `e.clientY` and set them as `--x` / `--y` on `document.documentElement` **before** calling `startViewTransition`. Then reference them in CSS as `clip-path: circle(0% at var(--x) var(--y))`.

- **[Agent Note]:** Avoid using CSS `transition` on `background-color` or `color` alongside View Transitions — they conflict. If using View Transitions for theme switching, set `transition: background-color 0s, color 0s` on `body` to let the View Transition animation handle the visual change instead.
