---
title: "Sentient, Coding Agent Trust"
description: "Sentient is an open source tool that monitors coding agent activity and makes it transparent, Linux first, with macOS on the way."
pubDate: 2026-10-19
---

My sessions with Claude Code generate a lot of permission approvals to run things like scripts.  Sometimes the commands being called are extremely long, and if I have to stop my workflow and do a detailed review of the command, that will slow down my workflow considerably.  My job is not to monitor coding agents.  I want to create products and iterate quickly, so typically I start rubber stamping requests for permissions, but at the end of the day, I'm still wondering what exactly happened as a result of my prompts.  I've tried to set permissions via Claude Code's configuration, but lots of approval requests still flow through.  The actions scroll past in the chat, and many of them are unreadable anyway.  A 400-character `sed -i` or an inline Python script hides what it actually changed, so what starts as delegation quietly turns into blind trust.  I went back through my own Claude Code history to see how bad it was, across about 19 sessions there were 5,394 shell commands.  The median was 132 characters long and the longest was over 10,000.  Roughly 678 of them appear to modify files, changes that never show up as a tidy edit in the chat.  In order to gain more transparency into what coding agents are actually doing, I built [Sentient](https://github.com/nosaka4i/sentient).  Not only does Sentient review a coding agent's own logs, it is also being built to check kernel-level events to correlate and confirm.  Trust, but check.

## See what your agent actually did

Which files were read/changed/deleted, which executables were run, which network connections were made, everything is streamlined and visible in a simple dashboard.  Risky operations are flagged in Sentient, where the user can drill down deeper into what happened.

![Sentient dashboard (mockup)](/blog/sentient/dashboard.png)

## Don't let the model vouch for the model

The agent's own logs aren't enough evidence, they're written by the same process being checked so they can be incomplete or wrong, by accident or otherwise.  And a shell script can change files the log never names, so Sentient records what happened at the kernel level, independently of the agent.  On Linux, kernel level events are derived from [Tetragon](https://tetragon.io/), an eBPF-based tool from the Cilium project.  The agent runs as a regular user, so it can't edit or switch off that record.  The agent's logs are used only for the story: which prompt, which stated reason.  The gaps between what the logs claim and what the kernel saw turn out to be the most useful alerts.  Summaries, diffs and flags are computed with deterministic rules, not by another model.  A model should not vouch for a model.  And since it's a tool about trust, it has to be trustworthy itself.  Sentient is open source, local-only and read-only toward your projects, absolutely no telemetry.

![Sentient alert detail (mockup)](/blog/sentient/alert.png)

## How it's put together

Sentient has two primary components: `sentientd` is a small monitor that runs as root under systemd, so the agent can't stop it or tamper with its records.  `sen` is the CLI for Sentient and can also act as a web server for the web UI.  `sen status` gives you the summary in the terminal, and `sen serve` runs the web dashboard on localhost.  You can reach the dashboard from your phone over an SSH tunnel or Tailscale.
Here's what `sen status` looks like with sample data:

```
$ sen status
Monitored from Oct 6 09:12 (1d 6h ago)

NEEDS ATTENTION (4)
#    DATE          AGENT    REPO     SEVERITY   RESOURCE   ACTION    PATH
43   Oct 7 14:52   claude   nosaka   high       file       update    ~/.zshrc
41   Oct 7 14:33   claude   nosaka   medium     file       update    ios/Config.plist
44   Oct 7 15:02   claude   nosaka   medium     file       update    reminders.ts, scheduler.ts +1 more
42   Oct 7 14:40   claude   nosaka   low        file       delete    old_snooze_stub.ts

LAST 24H
RESOURCE    ACTION    COUNT   SUMMARY
prompt      request   4       2 repos · agent worked 1h 58m
file        read      214     38 outside repo
file        update    9       +248 −61
command     execute   41      2 failed
network     connect   5       github.com, registry.npmjs.org, localhost:3000
git         commit    3
```

## Where it stands

Sentient is still relatively new and Claude Code is the first agent supported, other popular coding agents will follow.  And Linux comes first because that's where my own agent runs and eBPF needs no vendor approval.  macOS is planned for a release in the near future which will first leverage Apple's built-in `eslogger` while I wait on Apple to grant the Endpoint Security entitlement.  Today Sentient reads Claude Code's session logs which powers `sen status` and the dashboard.  Kernel capture through Tetragon is the next big piece, then the rules that decide what needs your attention.  If you're delegating more and more to coding agents and feeling that same creeping blind trust, follow along on GitHub at [nosaka4i/sentient](https://github.com/nosaka4i/sentient).
