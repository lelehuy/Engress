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

## Updates & Versioning

Engress features a built-in update mechanism. The application automatically checks for new releases on GitHub.
If a new version is found, users can download and launch the installer directly from the application settings.

### How to Release a New Version (For Developers)

1.  **Bump Version in Code**:
    Update the version string in `app.go`:
    ```go
    // app.go
    func (a *App) GetAppVersion() string {
        return "v0.0.X" // Change to new version
    }
    ```

2.  **Build the Project**:
    Run the packaging script to create the `.dmg` installer:
    ```bash
    ./package.sh
    ```

3.  **Commit and Tag**:
    ```bash
    git add .
    git commit -m "Bump version to v0.0.X"
    git push
    ```

4.  **Create GitHub Release**:
    - Go to GitHub Repository > Releases > Draft a new release.
    - Tag version: `v0.0.X` (Must match the code).
    - Title: `Engress v0.0.X`.
    - Upload the `Engress-Setup.dmg` file from your project folder.
    - Publish Release.

The application will now detect the update for all users.
