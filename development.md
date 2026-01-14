# Developer Operations | Engress 🛠️

This document is intended for developers who want to contribute to Engress or build it from source.

## 🏗️ Technical Stack
- **Backend**: Go (Golang)
- **Frontend**: React + TypeScript + Vite
- **Framework**: [Wails v2](https://wails.io/)
- **State Management**: React Hooks
- **Styling**: Vanilla CSS (Modern CSS)

## 🔧 Prerequisites
Before you begin, ensure you have the following installed:
- [Go](https://golang.org/dl/) (version 1.23 or higher)
- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [NPM](https://www.npmjs.com/)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

To install Wails CLI:
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/lelehuy/Engress.git
cd Engress
```

### 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install
cd ..

# Go dependencies
go mod tidy
```

### 3. Run in Development Mode
This starts the Go backend and the Vite frontend with hot-reload enabled.
```bash
wails dev
```

## 📦 Building for Production

### macOS
To build a universal macOS application:
```bash
wails build -platform darwin/universal
```

### Windows
```bash
wails build -platform windows/amd64
```

The output will be located in the `build/bin` directory.

## 📂 Project Structure
- `/` - Go main entry point and Wails configuration.
- `/frontend/src` - All React frontend code.
- `/frontend/src/components` - Reusable UI components.
- `/frontend/src/pages` - Main application views.
- `/build` - Icons and platform-specific build assets.

## 🤝 Contributing
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Back to [README.md](./README.md)*
