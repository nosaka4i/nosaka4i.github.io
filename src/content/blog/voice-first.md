---
title: "Why voice-first"
description: "Typing at an assistant defeats the point of having one. Some notes on what \"voice-first\" actually means for how Nosaka is built."
pubDate: 2026-07-22
---

Most "AI assistants" are chat apps with a microphone bolted on. You still end up staring at a screen, reading a wall of text back, typing a follow-up. That's not what an assistant is for. If you have to operate it like software, it isn't an assistant — it's a form with better autocomplete.

Nosaka is built the other way around: voice is the interface, not an add-on to one. That sounds like a small distinction. In practice it changes almost every decision.

## A concrete example

Ask Nosaka to show your reminders. If you only have a couple, she just reads them — done, no ceremony. But if you've got a long list, reading the whole thing out loud is genuinely bad voice UX. Nobody wants to sit through fifteen items read one by one, and there's no way to skim a spoken list the way you'd skim a screen.

So instead, past a few items, Nosaka gives you the count and asks: *"You have seven reminders. Want me to read them?"* Say yes, and she reads the list — no restating the count, no repeating herself, straight into it. Say no, and she just says *"Okay"* and moves on, the way an actual person would, not a chime or a blank pause.

That's the whole idea. A phone menu doesn't read you every option before letting you choose — it gives you a bounded choice and waits. Nosaka works the same way: say only what's useful, ask only when it's genuinely ambiguous, and never make you sit through something a person could just glance past.

## What "voice-first" actually means

It's not "has speech-to-text." It's that the entire interaction — what to say, how much, when to just act versus ask, how to acknowledge without sounding like a notification — is designed around a spoken conversation from the start, not adapted from a chat window afterward. A chat interface can dump a wall of text and let you scroll. Voice can't. Every response has to earn the time it takes to say out loud.

Nosaka is still in private testing, and a lot of this is still being tuned in real use — but this is the standard everything gets built against: would a good human assistant actually say it this way?
