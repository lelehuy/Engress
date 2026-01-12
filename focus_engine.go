package main

import (
	"os/exec"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) startFocusEngine() {
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				url := a.getActiveURL()
				if url != "" {
					a.processURL(url)
					// Emit event to frontend
					runtime.EventsEmit(a.ctx, "url-active", url)
				}
			case <-a.ctx.Done():
				return
			}
		}
	}()
}

func (a *App) getActiveURL() string {
	// Try Google Chrome first
	script := `tell application "Google Chrome" to get URL of active tab of window 1`
	cmd := exec.Command("osascript", "-e", script)
	out, err := cmd.Output()
	if err == nil {
		return strings.TrimSpace(string(out))
	}

	// Try Safari if Chrome fails
	script = `tell application "Safari" to get URL of current tab of window 1`
	cmd = exec.Command("osascript", "-e", script)
	out, err = cmd.Output()
	if err == nil {
		return strings.TrimSpace(string(out))
	}

	return ""
}

func (a *App) processURL(url string) {
	// Simple passthrough for URL monitoring in UI
	runtime.EventsEmit(a.ctx, "url-active", url)
}

func (a *App) lockBrowser() {
	// Not used anymore as per user request
}

func (a *App) AddCredits(amount int) {
	// Not used anymore as per user request
}
