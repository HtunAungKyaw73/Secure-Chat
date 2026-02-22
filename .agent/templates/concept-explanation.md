# 🧠 Concept Explanation: {{Concept Name}}

> **Metadata**
> - **Source Spec:** `_spec/{{feature}}.md`
> - **Primary Files:** `{{path/to/file.ts}}`
> - **Patterns Used:** `{{e.g., Singleton, Observer, Factory}}`
> - **Status:** 🟡 Draft (Change to 🟢 Verified after implementation)

---

## 1. Theoretical Foundation
*Explain the "Vibe" and the "Logic" using high-level principles.*

* **The Problem:** What specific pain point does this concept solve?
* **The Solution:** A high-level explanation of the chosen approach.
* **References:** [Link to Official Docs or RFCs]

---

## 2. Implementation Architecture
*How the "Vibe" manifests in the `src/` folder.*

* **Entry Point:** Where does the logic start? (e.g., `server.ts` or a specific hook).
* **Data Flow:** Describe how data moves (e.g., "Client → Middleware → Controller → Redis").
* **State Impact:** Does this modify the database, global state, or local cache?

---

## 3. Annotated Logic (The "Why" per Line)
*Focus on intent rather than syntax.*

### // {{Snippet Title}}
```typescript
{{Code Snippet}}
```

### Code Patterns and Intent

**Lines {{XX-XX}} [{{Pattern Name}}]:**
* **Intent:** Why was it written this way? (e.g., "To ensure idempotency" or "To prevent race conditions").
* **Mechanism:** How does the code achieve this technically?

---

### Edge Case Handling

**Lines {{YY-ZZ}} [Edge Case Handling]:**
* **Scenario:** What specific error or user behavior is being caught here? (e.g., "User disconnects mid-stream").

---

### 4. Operational Guardrails
> Rules for the Antigravity Agent when refactoring or extending this code.

* **Never Change:** What parts of this logic are "load-bearing" and must not be altered?
* **Failure Modes:** How does this fail? (e.g., "Socket disconnect triggers a cleanup that must not be bypassed").
* **Testing Requirement:** What specific test suite validates this concept?

---

### 5. Evolutionary Notes (The "Learn" Link)
> Context for the future version of the project.

* **Technical Debt:** What was "hacked" or simplified for the current version?
* **Future Vision:** Link to `_learn/{{feature}}.md` for post-implementation insights.