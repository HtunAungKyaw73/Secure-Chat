# Plan: [Feature Name]
**Reference Spec:** `_spec/feature-name.md`
**Complexity:** Low / Medium / High

## 1. Proposed Architecture
- **State Management:** (e.g., Context API, Redux, or Local State)
- **Data Flow:** (e.g., Component A fetches from Endpoint B)

## 2. File Changes
| Action | Path | Description |
| :--- | :--- | :--- |
| Create | `src/components/NewComp.tsx` | Main UI component |
| Modify | `src/App.tsx` | Inject new component |
| Create | `src/hooks/useData.ts` | Logic for API calls |

## 3. Implementation Steps
1. [ ] Setup boilerplate and folder structure.
2. [ ] Implement core logic/hooks.
3. [ ] Build UI components.
4. [ ] Connect UI to logic.

## 4. Verification Strategy
- **Manual:** "Check browser console for 200 OK."
- **Automated:** `npm test src/components/NewComp.test.tsx`