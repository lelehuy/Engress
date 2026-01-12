# Engress | The Elite Exam Sentinel 🛡️

**Engress** is a high-performance, local-first companion application for IELTS and TOEFL candidates. It transforms mundane study routines into high-stakes "missions," providing the focus mechanisms and psychological feedback needed to maintain long-term discipline.

Built for the **Candidate** who demands clarity, privacy, and zero-distraction execution.

---

## ⚡ Key Systems

### 1. Sentinel HUD (Heads-Up Display)
A futuristic desktop overlay that keeps your critical metrics visible while you work in other applications (browser, PDF readers, etc.).
- **Focus Timer**: Real-time tracking of your active session.
- **Floating Scratchpad**: A resizable, always-on-top taking notes area that stays with you during Listening and Speaking simulations.

### 2. Focus Lab (Study Vault)
Custom-built simulation environments for every skill:
- **Writing Workspace**: Markdown-friendly essay engine with word count intensity tracking.
- **Speaking Recorder**: Session-based audio capture and note-taking.
- **Reading/Listening Calculators**: Instant band-score estimation based on raw input.
- **Vocabulary Forge**: A dedicated system to capture and internalize new language patterns.

### 3. Mission Analytics
Turn raw data into strategic intelligence:
- **Execution Pulse**: Track your neural gain over time.
- **Strategic Roadmap**: Visualize your journey to the target score.
- **Consistency Engine**: Real-time briefing on your study habits (Neglect, Slipping, or Stable Phases).

### 4. Smart Scheduler & Reminders
- Native macOS notifications when you drift from your target.
- Strategic brief every morning to reset your standards.

---

## 🛠️ Technical Architecture

- **Backend**: Go (Wails)
- **Frontend**: React (Vite, TypeScript, TailwindCSS/Framer Motion)
- **HUD Systems**: Swift (Native macOS Cocoa Panels)
- **Storage**: Local-only SQLite/JSON for absolute privacy.

---

## 🚀 Development & Build

### Prerequisites
- Go 1.21+
- Node.js & NPM
- Xcode (for Swift HUD compilation)

### Live Development
```bash
wails dev
```

### Universal Production Build (macOS)
```bash
# Build universal binary and package into DMG
./package.sh
```

---

## 📦 Deployment Protocol

1. Bump version in `app.go` (`GetAppVersion`).
2. Run `./package.sh` to generate the latest `Engress-Setup.dmg`.
3. Create a GitHub Release with the tag matching the version (e.g., `v0.2.0`).
4. Upload the DMG. The built-in Sentinel Update system will handle the rest.

---

## 🛡️ Privacy Standard
Engress is **Private by Design**. Your essays, voice recordings, and progress data never leave your local machine.

---
*Developed for elite candidates by the Engress Protocol.*
