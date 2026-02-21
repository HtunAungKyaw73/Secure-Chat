# Lessons Learned: Git Branch Management

## 1. The Problem
When adding a new feature branch, files from a recently completed feature were disappearing on branch switch. This was caused by branching off a base branch *before* the previous feature branch had been merged back in.

**Example of what went wrong:**
```
master
└─ feature/real-time-chat-app
   ├─ feature/theme-toggle  ← (diverged here, never merged back)
   └─ feature/secure-rooms  ← (also branched here, missing theme-toggle commits)
```

Switching to `feature/secure-rooms` made all theme toggle files disappear because that branch simply didn't have those commits yet.

## 2. The Fix

**Step 1:** Merge the completed feature branch back into the base first:
```bash
git checkout feature/real-time-chat-app
git merge feature/theme-toggle --no-edit
```

**Step 2:** Rebase the new feature branch on top of the updated base:
```bash
git checkout feature/secure-rooms
git stash                          # if you have uncommitted changes
git rebase feature/real-time-chat-app
git stash pop                      # restore uncommitted changes
```

After this, the history is clean and linear:
```
master
└─ feature/real-time-chat-app  (includes all theme-toggle commits)
   └─ feature/secure-rooms     (built on top of both)
```

## 3. New Knowledge
- **[Agent Note]:** Always merge a completed feature branch back into the base branch **before** creating the next feature branch. The correct order is:
  1. Finish `feature/A` → merge into `feature/base`
  2. Create `feature/B` from `feature/base` (which now includes A)

- **[Agent Note]:** If a new feature branch was mistakenly created without the previous feature's commits, use `git rebase <base-branch>` on the new branch to replay its commits on top of the updated base. Use `git stash` first if there are uncommitted changes.

- **[Agent Note]:** `git log --oneline --all --graph` is the best quick command to visualize the branch state and catch divergence problems early.
