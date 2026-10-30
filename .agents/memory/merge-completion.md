---
name: Merge completion verification
description: Avoid declaring an imported-repository merge complete based only on staged files.
---

Verify that the incoming ref is an ancestor of the resulting local branch, no active merge remains, and no unmerged index entries remain.

**Why:** In this environment, separately editing and staging conflict resolutions repeatedly failed to persist across turns. Later inspection showed single-parent checkpoints without the incoming commit, allowing the same conflict to recur. The exact cause of the intervening state changes was not established.

**How to apply:** A clean index alone is insufficient evidence of a completed merge. When the user explicitly chooses incoming conflict content and the working tree is clean, an atomic merge with that conflict preference can complete both resolution and history recording. Verify the selected content and generated output afterward. Never claim completion while the incoming commit remains outside local ancestry.
