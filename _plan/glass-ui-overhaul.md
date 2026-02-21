# Plan: Glassmorphism UI Overhaul

## Proposed Architecture

Transition the application to a high-density "Glass" aesthetic using standard CSS `backdrop-blur` and custom radial gradients for background depth.

### 1. Design System (CSS Variables)
Define a set of reusable glassmorphism tokens in `globals.css`:
- `--glass-bg`: Translucent background using `rgba`.
- `--glass-border`: High-contrast thin border.
- `--glass-blur`: Backdrop blur radius.
- `--bg-glow`: Radial gradient for background depth.

### 2. Layout Strategy
- Use a dedicated absolute-positioned `div` in the root `layout.tsx` to host animated background "glows".
- Containers (Lobby cards, Chat header, Auth forms) will use the `.glass` utility class.

## File Changes

| File Path | Change Description |
|-----------|--------------------|
| `src/app/globals.css` | Add `.glass` utility, background glow gradients, and transition overrides. |
| `src/app/layout.tsx` | Add global background glow elements. |
| `src/app/page.tsx` | Redesign Lobby with glass cards and amethyst accents. |
| `src/app/room/[id]/page.tsx` | Overhaul Chat UI: glass header, translucent message lane, and glass bubbles. |
| `src/app/login/page.tsx` | Re-theme login form as a glass card. |
| `src/app/register/page.tsx` | Re-theme register form as a glass card. |

## Implementation Steps

### Phase 1: Foundation
- [ ] Implement global glass styles in `globals.css`.
- [ ] Add background glow layers to `layout.tsx`.

### Phase 2: Lobby Redesign
- [ ] Update `LobbyPage` components to use glass tiles.
- [ ] Enhance hover effects with scaling and glow intensity increases.

### Phase 3: Room Redesign
- [ ] Implement glass header with integrated member list.
- [ ] Redesign message bubbles using translucent amethyst/frost textures.
- [ ] Remove all opaque container backgrounds for full "lane integration".

### Phase 4: Polishing
- [ ] Update Auth pages.
- [ ] Finalize typography weights (Amethyst Deep Space spec).

## Verification Strategy

### UI Testing
- Use **Browser Agent** to verify backdrop blur performance and color contrast.
- Visual check of "Glow" animations.

### Technical Check
- `npm run build` to ensure no CSS or Tailwind v4 regressions.
- Verify member tracking visibility on glass panels.
