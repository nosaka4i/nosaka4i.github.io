---
title: "Sentient, Coding Agent Trust"
description: "Sentient is an open source tool that monitors all coding agent activity and provides complete transparency, Linux first, with macOS on the way."
pubDate: 2026-10-19
draft: true
---

My sessions with Claude Code generate a lot of permission approvals to run things like scripts, sometimes the commands being called are extremely long and if I have to stop my workflow and do a detailed review of the command, that will slow down my workflow considerably.  My job is not to monitor coding agents, I want to create products and iterate quickly so typically I start rubber stamping requests for permissions, but at the end of the day, I'm still wondering what exactly happened as a result of my prompts.  I've tried to set permissions via Claude's configuration, but lots of approval requests still flow through.  The actions scroll past in the chat and many of them are unreadable anyway, a 400-character `sed -i` or an inline Python script hides what it actually changed, so what starts as delegation quietly turns into blind trust.  I went back through my own Claude Code history to see how bad it was, across about 19 sessions there were 5,394 shell commands, the median was 132 characters long, the longest was over 10,000, and roughly 678 of them appear to modify files, changes that never show up as a tidy edit in the chat.  In order to gain more transparency into what coding agents are actually doing, I built [Sentient](https://github.com/nosaka4i/sentient), not only does Sentient review a coding agent's own logs, but it checks kernel level events to correlate and confirm, trust, but check.

## See what your agent actually did

What files were read/changed/deleted, which executables were run, check which network connections were made, get a timeline view of what operations took place, everything streamlined and visible in a simple dashboard.  Risky operations are flagged in Sentient where the user can drill down deeper into what happened.

![Sentient dashboard (mockup)](/blog/sentient/dashboard.png)

## Don't let the model vouch for the model

The agent's own logs aren't enough evidence, they're written by the same process being checked, so they can be incomplete or wrong, by accident or otherwise, and a shell script can change files the log never names.  So Sentient records what happened at the kernel level, independently of the agent, using [Tetragon](https://tetragon.io/), an eBPF-based tool from the Cilium project, which the agent, running as a regular user, can't edit or switch off, and it uses the agent's logs only for the story, which prompt, which stated reason.  The gaps between what the logs claim and what the kernel saw turn out to be the most useful alerts.  Summaries, diffs and flags are computed with deterministic rules, not by another model, a model should not vouch for a model.  And since it's a tool about trust, it has to be trustworthy itself, open source, local-only, read-only toward your projects, and no telemetry.

![Sentient alert detail (mockup)](/blog/sentient/alert.png)

## How it's put together

There are two pieces, `sentientd`, a small monitor that runs as root under systemd so the agent can't stop it or tamper with its records, and `sen`, the command line tool that runs as you and asks the monitor what happened.  `sen status` gives you the summary in the terminal, and `sen serve` runs the web dashboard on localhost, which you can reach from your phone over an SSH tunnel or Tailscale.  One honest caveat, if the account your agent runs as can `sudo` without a password, the boundary between the agent and the monitor is gone, Sentient's health page warns you about it, and better still, run your agents in a separate account or a sandbox.

<!-- screenshot: sen status in a terminal -->

## Where it stands

Sentient is early, Claude Code is the first agent supported, Linux comes first because that's where my own agent runs and eBPF needs no vendor approval, and macOS support, which matters since most agent users are on Macs, is planned before a real launch, starting with Apple's built-in `eslogger` while I wait on Apple to grant the Endpoint Security entitlement.  Today it reads Claude Code's session logs and powers `sen status` and the dashboard, kernel capture through Tetragon is the next big piece, then the rules that decide what needs your attention.  If you're delegating more and more to coding agents and feeling that same creeping blind trust, follow along on GitHub at [nosaka4i/sentient](https://github.com/nosaka4i/sentient).
