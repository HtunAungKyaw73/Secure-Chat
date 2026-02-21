# Specification: Glassmorphism UI Overhaul

## Objective
To replace the current Indigo-themed UI with a state-of-the-art "Glassmorphism" design system. The goal is to create a premium, high-density aesthetic that feels integrated, modern, and visually stunning, as the current Indigo theme was found to be insufficiently premium.

## User Stories
- **As a User**, I want to feel like I am using a cutting-edge application that uses modern design trends like backdrop blurs and subtle reflections.
- **As a User**, I want a consistent, dark-mode-first aesthetic (Amethyst Deep Space) that uses vibrant gradients as accents.
- **As a User**, I want to see a clear distinction between the background (glows/space) and the UI elements (glass tiles).

## Functional Requirements

### 1. Design Tokens (The "Glass" Spec)
- **Base Layer**: Deep charcoal/black (`zinc-950`).
- **Glow Layer**: Radial gradients (Amethyst/Violet) positioned behind main UI containers.
- **Glass Layer**:
    - **Backdrop Blur**: `backdrop-blur-xl` (24px+ blur).
    - **Background**: `white/5` (Light) | `zinc-900/40` (Dark).
    - **Border**: `1px solid rgba(255, 255, 255, 0.1)` (Top/Left) and `1px solid rgba(255, 255, 255, 0.05)` (Bottom/Right) to simulate thickness.
    - **Shadow**: Subtle, elongated shadows to create floating depth.

### 2. Main Page (Lobby)
- The room cards should be transformed into "Glass Tiles".
- The background should feature a permanent, subtle animated radial glow that flows as the user moves their mouse.
- The "Discover" and "Chat Rooms" headings should use thinner, more spaced-out typography with high-contrast sharp weights.

### 3. Room Page (Chat)
- **Glass Header**: The top bar should be a semi-transparent glass pane with a bottom border highlight.
- **Integrated Chat Lane**: The chat container itself should be completely transparent, with messages floating over the "glow-enhanced" background.
- **Glass Bubbles**:
    - My messages: Violet gradient bubble with glass border.
    - Other messages: Frosted glass bubble with white/zinc border.
- **Member Tracking**: The "Talking with" section needs to be integrated into the glass header without opaque backgrounds.

### 4. Auth Pages (Login/Register)
- The auth forms should be centered glass cards on a deep space background.

## Constraints
- **Performance**: Ensure `backdrop-blur` doesn't lag the interface on standard hardware.
- **Accessibility**: Text contrast must meet WCAG AA standards despite translucent backgrounds.
- **Compatibility**: Must use Tailwind CSS v4 patterns where applicable.
