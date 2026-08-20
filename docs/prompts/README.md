# JapJapVan research agents — concurrent Grok 4.6 headless

Two waves. Wave 1 writes six research notes in parallel. Wave 2 reads those notes and writes the three user-facing Traditional Chinese docs.

You do **not** need this chat. A cold `grok --prompt-file` session is enough.

## What gets written

| Wave | Prompt | Output |
| --- | --- | --- |
| 1 | `wave1/01-unit-econ.md` | `docs/research/01-unit-econ.md` |
| 1 | `wave1/02-demand-market.md` | `docs/research/02-demand-market.md` |
| 1 | `wave1/03-sourcing-hk.md` | `docs/research/03-sourcing-hk.md` |
| 1 | `wave1/04-sourcing-jp.md` | `docs/research/04-sourcing-jp.md` |
| 1 | `wave1/05-ops-compliance.md` | `docs/research/05-ops-compliance.md` |
| 1 | `wave1/06-competitor-intel.md` | `docs/research/06-competitor-intel.md` |
| 2 | `wave2/07-feasibility.md` | `docs/feasibility-harvard-econ.md` |
| 2 | `wave2/08-sourcing.md` | `docs/sourcing-channels.md` |
| 2 | `wave2/09-story.md` | `docs/zero-to-one-story.md` |

Locked numbers: `docs/research/_shared-facts.md`.  
Tax/PE/GST canon: `docs/hk-ca-tax-price-advantage-2026.md` (do not rewrite).

## Run later (this is the whole point)

From the repo root, with `grok` on PATH:

```bash
# Wave 1 — six jobs at once
sh scripts/run-research-wave1.sh

# Wait until the six docs/research/0N-*.md files exist and look complete.
# Then:
sh scripts/run-research-wave2.sh
```

Equivalent one-liners if you want six terminals instead of the script:

```bash
grok --prompt-file docs/prompts/wave1/01-unit-econ.md -m grok-4.6 --cwd "$PWD" --yolo --no-plan --no-subagents
```

Flags that matter:

- `--prompt-file` — prompts are files, not stdin
- `-m grok-4.6`
- `--yolo` — tools run without asking
- `--no-plan` — do not re-enter plan mode
- `--no-subagents` — six jobs stay six jobs
- `--cwd` — repo root so relative paths resolve

JSON session logs land in `docs/research/_logs/`. The markdown the user reads is what the agent **writes with the write tool**, not stdout.

## Do not

- Start wave 2 before wave 1 notes exist (the wave-2 script will refuse)
- Edit `src/` or the tax memo from these agents
- Treat catalog `weeklyVelocity` as Year 1 sales
