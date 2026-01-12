# Engress

Engress is a local-first, distraction-free companion app designed to help you prepare for IELTS/TOEFL exams. It combines focus timers, vocabulary tracking, and mission-style progress monitoring.

## Features

- **Sentinal Focus HUD**: A persistent desktop overlay to keep you on track.
- **Local Vault**: Store vocabulary, notes, and session logs privately on your machine.
- **Mission Analytics**: Track your consistency and progress with detailed metrics.
- **Study Schedule**: Manage your daily study routine.

## Development

To run in live development mode:

```bash
wails dev
```

## Build

To build the application for macOS:

```bash
wails build -platform darwin/universal
```

Or use the helper script to create a DMG:

```bash
./package.sh
```

## Updates

Engress features an automatic update checker that polls the GitHub repository for new releases.
