# Plan: Theme Toggle
**Status:** 🟡 Draft
**Date:** 2026-02-21
**Spec:** `_spec/theme-toggle.md`

## 1. Approach
Install `next-themes` to handle system detection, `localStorage` persistence, and flicker-free theme injection. Then extend all of `page.tsx`'s hardcoded dark Tailwind classes to include `dark:` variants so light mode becomes functional.

## 2. Implementation Steps

### Step 1: Install dependency
```bash
npm i next-themes
```

### Step 2: Update `src/app/layout.tsx`
- Add `ThemeProvider` from `next-themes` wrapping `{children}`.
- Set `attribute="class"` and `defaultTheme="system"` so Tailwind's `.dark` class strategy works.

### Step 3: Update `src/app/globals.css`
- Remove the unused `--background` / `--foreground` CSS vars (they're overridden by Tailwind anyway).
- Ensure `html` has `color-scheme` support.

### Step 4: Update `src/app/page.tsx`
- Add the `Sun` / `Moon` icons from `lucide-react` (already installed).
- Import `useTheme` from `next-themes`.
- Add a theme toggle `<button>` in the header next to the Leave button.
- Convert every hardcoded dark class to a paired `light:` / `dark:` pair. Key changes:

| Element | Current | After |
|---|---|---|
| Page bg | `bg-zinc-950` | `bg-white dark:bg-zinc-950` |
| Chat panel bg | `bg-zinc-900/50` | `bg-zinc-100/80 dark:bg-zinc-900/50` |
| Header bg | `bg-zinc-900/80` | `bg-white/80 dark:bg-zinc-900/80` |
| Input bg | `bg-zinc-950` | `bg-white dark:bg-zinc-950` |
| Received bubble | `bg-zinc-800/80` | `bg-zinc-200 dark:bg-zinc-800/80` |
| Text colors | `text-zinc-100` | `text-zinc-900 dark:text-zinc-100` |

### Step 5: Tailwind v4 dark mode config
- Tailwind v4 uses `@variant dark` in CSS or `theme.extend.darkMode` in config. Confirm the dark mode strategy is set to `class` (not `media`) in `globals.css` or the Tailwind config.

## 3. Verification Plan

### Manual Test
1. Run `npm run dev` and open `http://localhost:3000`.
2. Enter a username and join the chat.
3. Click the Sun/Moon button in the header — the entire UI should smoothly switch between light and dark.
4. Reload the page — the chosen theme should persist (no flicker).
5. Open DevTools → Application → Local Storage → confirm `theme` key is set.
6. Test with system preference: set your OS to Dark/Light mode and verify the app respects it on first load.
