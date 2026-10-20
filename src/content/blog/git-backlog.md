---
title: "Introducing git-backlog"
description: "A lightweight, opinionated backlog CLI that leverages git's distributed source management mechanics.  Ideal for small teams of developers, product managers, or even AI coding agents."
pubDate: 2026-09-08
---

I needed a lightweight backlog tool to manage all the things that I wanted/needed to work on for the nosaka project and I didn't want some third-party tool that required integration or access permissions for a coding agent.  The closest command-line tool integrated with git, git-bug, is a bug tracker rather than a backlog, so I decided to make git-backlog, built from the ground up using 100% Claude Code.  With git-backlog, the backlog lives in the git repository right next to the code, all state, changes, versions use the git semantics.  If the agentic coder can access the git repo, it basically has access to git-backlog, no additional permissions required.  The project is open source and I've been dogfooding this for the last month or so.  This is not ideal for large projects with many users and doesn't try to replace tools like Jira or Basecamp where you need more complicated project management and tracking.

## How it works

git-backlog is a git subcommand.  Once the binary is on your `PATH`, git picks it up and you run it as `git backlog`.  Items aren't stored in a file or a database.  They're stored as real git objects under `refs/backlog/*`, and each item is its own ref.  Every change to an item, whether a priority bump, a move or a comment, is a commit on that ref, so the full history of every item comes for free.  Syncing is plain `git push` and `git fetch` under the hood.  `git backlog sync` pushes and fetches the backlog refs and reconciles any item that was edited on two clones at the same time.  That's exactly the situation I'm in with my Mac and my Linux box.  The architecture is modeled on [git-bug](https://github.com/git-bug/git-bug), independently implemented in Go and MIT licensed.

```
go install github.com/nosaka4i/git-backlog@latest

git backlog init
git backlog add "fix flaky scheduler test" --priority p1
git backlog move <id> current
git backlog list
git backlog sync
```

Here's what `git backlog list` looks like on a small demo repo:

```
last 24h: 4 new, 0 closed

current (1):
ID       PRIORITY  TITLE                            LABELS
bc5dd99  p0        voice reminders: snooze support  sprint-3

backlog (3):
ID       PRIORITY  TITLE                     LABELS
0ad011d  p1        fix flaky scheduler test
bd4c2ae  p2        write install docs        docs
1a105e5  none      dark mode for dashboard

closed (0):
(empty)
```

## Deliberately small

git-backlog decides *what* to work on next, not why or how.  That's what design docs and GitHub Issues are for.  An item has a title, a description and a comment.  It also has a priority (`p0`, `p1`, `p2` or none), labels and a track.  The track is one of `backlog`, `current` or `closed`, and closing an item is just moving it to `closed`.  Milestones, epics and burndown charts were all considered and deliberately left out.  A label like `sprint-12` already covers "bundle these and find them later", and every feature that doesn't get added is one less thing to learn.

## Built for coding agents too

This is the part I care about most.  I let Claude Code use `git backlog` freely in all my repos.  It files items when it spots something worth doing later, moves them along as it works, and leaves comments on what it found, so nothing gets lost.  Two things make that work well.  Every read command takes `--json`, so an agent gets structured output instead of scraping a table.  And there's `--as-agent`.  If a human and an agent share the same checkout, every change gets attributed to the same git identity, and a back-and-forth in the comments looks like one person talking to themselves.  So you configure a separate identity for the agent once:

```
git config backlog.agent.name "Claude"
git config backlog.agent.email "noreply@anthropic.com"
git backlog comment <id> "looks flaky under load" --as-agent
```

From then on, `git backlog show` makes it clear who did what, me or the model:

```
id:          bc5dd99
title:       voice reminders: snooze support
description: (none)
track:       current
priority:    p0
labels:      sprint-3
comment:     snooze sheet done, wiring scheduler next
owner:       stephen <hello@nosaka.ai>
created:     2026-09-08 04:30:50 +0000
updated:     2026-09-08 04:30:50 +0000
sync:        no remote configured

history:
  2026-09-08 04:30:50 +0000  0c42be11d09f  Claude <noreply@anthropic.com>
      Updated comment
  2026-09-08 04:30:50 +0000  f04cb0077fba  stephen <hello@nosaka.ai>
      Moved to current
  2026-09-08 04:30:50 +0000  a7482e791b27  stephen <hello@nosaka.ai>
      Set labels to sprint-3
  2026-09-08 04:30:50 +0000  bc5dd996f860  stephen <hello@nosaka.ai>
      Added item
```

You can find the source code at [nosaka4i/git-backlog](https://github.com/nosaka4i/git-backlog), all feedback can be sent to [me](mailto:hello@nosaka.ai).
