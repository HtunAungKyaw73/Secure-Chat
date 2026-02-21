# Spec: Theme Toggle
**Status:** 🟡 Draft
**Date:** 2026-02-21

## 1. Objective
Add a beautiful and seamless dark/light mode toggle with a premium, animated transition to match the overall VibeChat aesthetic.

## 2. User Stories
- **As a user**, I want to **switch between dark and light themes**, so that **I can comfortably use the app in any lighting condition**.
- **As a user**, I want to **have my theme preference saved**, so that **I don't have to toggle it every time I reload the page**.

## 3. Functional Requirements
- [ ] Add a toggle button (e.g., Sun/Moon icon) in the header of the chat interface.
- [ ] Implement system preference detection by default using Next.js `next-themes` library or simple Tailwind Dark Mode setup.
- [ ] Ensure the entire app (backgrounds, text colors, message bubbles, inputs) supports both `dark:` and light styles appropriately.
- [ ] Add a smooth micro-animation or color transition when switching themes.
- [ ] Save the user's theme choice to `localStorage` (via `next-themes` or custom approach).

## 4. Constraints & Out of Scope
- No custom themes beyond predefined Light and Dark (e.g., no custom color pickers or "Dracula/Nord" themes).
- No complex theme synchronisation across multiple sessions or devices (client-side persistence only).
