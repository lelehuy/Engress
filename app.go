package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx                    context.Context
	isPaused               bool
	pauseCounter           int
	currentCategory        string
	currentTimeStr         string
	isHUDScratchpadVisible bool
	lastHUDNotes           string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.startFocusEngine()
	a.StartScheduler()

	// Start macOS Desktop HUD Helper
	go func() {
		// Clean up any existing instances first
		exec.Command("pkill", "engress_hud").Run()
		time.Sleep(200 * time.Millisecond)
		exec.Command("./engress_hud").Run()
	}()
	go a.startHUDCommandListener()
	go a.startHUDNotesWatcher()

	// Daily Alert Logic
	state, _ := a.LoadState()
	today := time.Now().Format("2006-01-02")

	if state.UserProfile.IsSetupComplete && state.UserProfile.LastOpenDate != today {
		briefing := a.GetEngressBriefing()

		// Update last open date
		state.UserProfile.LastOpenDate = today
		a.SaveState(state)

		// Show intrusive alert
		runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
			Type:          runtime.InfoDialog,
			Title:         "ENGRESS: Mission Briefing",
			Message:       briefing,
			Buttons:       []string{"I Understand"},
			DefaultButton: "I Understand",
		})
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) LogSession(category string, reflection string, score float64, homework string, duration int, learnings string, content string, sourceURL string, screenshot string) {
	state, _ := a.LoadState()
	state.DailyLogs = append(state.DailyLogs, DailyLog{
		ID:         fmt.Sprintf("%d", time.Now().UnixNano()),
		Date:       time.Now().Format("2006-01-02"),
		Duration:   duration,
		Module:     category,
		Reflection: reflection,
		Score:      score,
		Homework:   homework,
		Learnings:  learnings,
		Content:    content,
		SourceURL:  sourceURL,
		Screenshot: screenshot,
		Time:       time.Now().Format("15:04"),
	})
	a.SaveState(state)
}

func (a *App) UpdateLastLogSession(reflection string, score float64, homework string, learnings string) {
	state, _ := a.LoadState()
	if len(state.DailyLogs) > 0 {
		idx := len(state.DailyLogs) - 1
		state.DailyLogs[idx].Reflection = reflection
		state.DailyLogs[idx].Score = score
		state.DailyLogs[idx].Homework = homework
		state.DailyLogs[idx].Learnings = learnings
		a.SaveState(state)
	}
}

func (a *App) StartScheduler() {
	ticker := time.NewTicker(30 * time.Second) // Check more frequently
	go func() {
		for range ticker.C {
			now := time.Now()
			hour := now.Hour()
			minute := now.Minute()
			// 1. Time-based reminders: User custom time
			currentTime := fmt.Sprintf("%02d:%02d", hour, minute)
			state, _ := a.LoadState()

			isReminderTime := false
			if state.UserProfile.ReminderEnabled {
				for _, t := range state.UserProfile.ReminderTimes {
					if t == currentTime {
						isReminderTime = true
						break
					}
				}
			}

			if isReminderTime {
				today := now.Format("2006-01-02")
				todaysDuration := 0
				for _, log := range state.DailyLogs {
					if log.Date == today {
						todaysDuration += log.Duration
					}
				}

				// Target is at least 120 mins. If less, confront.
				if todaysDuration < 120 {
					briefing := a.GetEngressBriefing()
					a.Notify("ENGRESS: Focus Check", fmt.Sprintf("It is %02d:%02d. Your daily mission is incomplete. %s", hour, minute, briefing))
					runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
						Type:          runtime.WarningDialog,
						Title:         "ENGRESS: Focus Check",
						Message:       fmt.Sprintf("It is %02d:%02d.\n\n%s", hour, minute, briefing),
						Buttons:       []string{"Training Now", "Ignore Mission"},
						DefaultButton: "Training Now",
					})
				}
			}

			// 2. Pause reminder: If paused, increment counter. Every 20 mins
			if a.isPaused {
				a.pauseCounter++
				if a.pauseCounter >= 40 { // 20 minutes
					a.pauseCounter = 0
					a.Notify("ENGRESS: Discipline Warning", "You have been paused for 20 minutes. Resume your training.")
					runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
						Type:          runtime.WarningDialog,
						Title:         "ENGRESS: Discipline Warning",
						Message:       "You have been paused for 20 minutes. Stop making excuses and resume your training.",
						Buttons:       []string{"Resume Training", "Keep Paused"},
						DefaultButton: "Resume Training",
					})
				}
			} else {
				a.pauseCounter = 0
			}
		}
	}()
}

func (a *App) SetPauseState(paused bool) {
	a.isPaused = paused
	runtime.EventsEmit(a.ctx, "pause-state-changed", paused)
	if paused {
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:          runtime.WarningDialog,
			Title:         "ENGRESS: Training Halted",
			Message:       "Mission is paused. Comfort is a slow death for progress. Don't be too long.",
			Buttons:       []string{"Understood"},
			DefaultButton: "Understood",
		})
		// Force HUD update immediately
		os.WriteFile("/tmp/sentinel_timer.txt", []byte("HIDDEN"), 0644)
	}
}

func (a *App) startHUDCommandListener() {
	cmdPath := "/tmp/engress_cmd.txt"
	for {
		time.Sleep(500 * time.Millisecond)
		if _, err := os.Stat(cmdPath); err == nil {
			data, err := os.ReadFile(cmdPath)
			if err == nil {
				cmd := string(data)
				os.Remove(cmdPath) // Clear command

				switch cmd {
				case "TOGGLE_PAUSE":
					a.SetPauseState(!a.isPaused)
					runtime.WindowShow(a.ctx)
				case "STOP":
					runtime.EventsEmit(a.ctx, "hud-stop", true)
					runtime.WindowShow(a.ctx)
				case "OPEN":
					runtime.WindowShow(a.ctx)
				case "HIDE_SCRATCHPAD":
					a.isHUDScratchpadVisible = false
				}
			}
		}
	}
}

func (a *App) SetSessionCategory(category string) {
	a.currentCategory = category
	a.UpdateTrayTime(a.currentTimeStr)
}

func (a *App) GetConsistencyPhase() string {
	state, _ := a.LoadState()
	return a.analyzeConsistency(state.DailyLogs)
}

func (a *App) GetEngressBriefing() string {
	state, _ := a.LoadState()
	logs := state.DailyLogs

	// 1. Analyze Core Metrics
	consistencyPhase := a.analyzeConsistency(logs)
	weakest := a.analyzeWeakness(logs)
	isDrifting := a.detectDrift(logs)
	isComfortZone := a.checkComfortZone(logs)

	name := state.UserProfile.Name
	if name == "" {
		name = "Candidate"
	}

	// 2. Identity-Based Messaging Engine
	switch consistencyPhase {
	case "Neglect":
		return fmt.Sprintf("%s, this is not preparation. This is self-sabotage. Your discipline broke. Don't pretend it didn't.", name)
	case "Avoiding":
		return fmt.Sprintf("%s, you're practicing what's easy. Not what you need. Stop avoiding %s.", name, weakest)
	case "Slipping":
		if isDrifting {
			return fmt.Sprintf("%s, you're drifting. Your sessions are getting shorter and your focus is fading. This is how discipline dies.", name)
		}
		return fmt.Sprintf("%s, your standards are dropping. Reset your standard now.", name)
	case "Stable":
		if isComfortZone {
			return fmt.Sprintf("%s, stable execution, but you're hiding in your comfort zone. Confront %s today.", name, weakest)
		}
		return fmt.Sprintf("%s, keep the standard. Your discipline is being tested every day. Don't let it break.", name)
	}

	return fmt.Sprintf("%s, your discipline is being tested. Stand your ground.", name)
}

func (a *App) analyzeConsistency(logs []DailyLog) string {
	if len(logs) == 0 {
		return "Neglect"
	}

	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

	hasToday := false
	hasYesterday := false
	for _, log := range logs {
		if log.Date == today {
			hasToday = true
		}
		if log.Date == yesterday {
			hasYesterday = true
		}
	}

	if !hasToday && !hasYesterday {
		return "Neglect"
	}

	// Check for "Avoiding" - if one module is missing for too long
	counts := make(map[string]int)
	for _, log := range logs {
		counts[log.Module]++
	}
	for _, m := range []string{"Writing", "Speaking", "Reading", "Listening"} {
		if counts[m] == 0 && len(logs) > 3 {
			return "Avoiding"
		}
	}

	if !hasToday {
		return "Slipping"
	}

	return "Stable"
}

func (a *App) detectDrift(logs []DailyLog) bool {
	if len(logs) < 4 {
		return false
	}
	// Simplified: Check if average duration of last 2 sessions is less than previous 2
	last2 := (logs[len(logs)-1].Duration + logs[len(logs)-2].Duration) / 2
	prev2 := (logs[len(logs)-3].Duration + logs[len(logs)-4].Duration) / 2
	return last2 < prev2
}

func (a *App) checkComfortZone(logs []DailyLog) bool {
	if len(logs) < 5 {
		return false
	}
	counts := make(map[string]int)
	for _, log := range logs {
		counts[log.Module]++
	}
	// If one module is > 60% of total logs
	for _, count := range counts {
		if float64(count)/float64(len(logs)) > 0.6 {
			return true
		}
	}
	return false
}

func (a *App) analyzeWeakness(logs []DailyLog) string {
	counts := map[string]int{
		"Reading":   0,
		"Writing":   0,
		"Listening": 0,
		"Speaking":  0,
	}

	for _, log := range logs {
		counts[log.Module]++
	}

	minVal := 1000000
	weakest := "Writing"
	for _, m := range []string{"Writing", "Speaking", "Reading", "Listening"} {
		if counts[m] < minVal {
			minVal = counts[m]
			weakest = m
		}
	}
	return weakest
}

func (a *App) AddVocabulary(word string, def string, sentences string) {
	state, _ := a.LoadState()
	item := VocabItem{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Word:      word,
		Def:       def,
		Sentences: sentences,
		DateAdded: time.Now().Format("2006-01-02"),
		Time:      time.Now().Format("15:04"),
	}
	state.Vocabulary = append(state.Vocabulary, item)
	a.SaveState(state)
}

func (a *App) DeleteVocabulary(id string) {
	state, err := a.LoadState()
	if err != nil || state == nil {
		return
	}
	var newList []VocabItem
	deleted := false
	for _, item := range state.Vocabulary {
		if item.ID != id {
			newList = append(newList, item)
		} else {
			deleted = true
		}
	}
	if deleted {
		state.Vocabulary = newList
		a.SaveState(state)
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Deleted",
			Message: "Vocabulary entry removed successfully.",
		})
	}
}

func (a *App) DeleteLog(id string) {
	state, err := a.LoadState()
	if err != nil || state == nil {
		return
	}
	var newList []DailyLog
	deleted := false
	for _, log := range state.DailyLogs {
		if log.ID != id {
			newList = append(newList, log)
		} else {
			deleted = true
		}
	}
	if deleted {
		state.DailyLogs = newList
		a.SaveState(state)
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Deleted",
			Message: "Session log erased successfully.",
		})
	}
}

func (a *App) GetAppState() AppState {
	state, err := a.LoadState()
	if err != nil || state == nil {
		return AppState{}
	}
	return *state
}

func (a *App) UpdateTestDate(date string) {
	state, _ := a.LoadState()
	state.UserProfile.TestDate = date
	a.SaveState(state)
}

func (a *App) UpdateProfileName(name string) {
	state, _ := a.LoadState()
	state.UserProfile.Name = name
	a.SaveState(state)
}

func (a *App) UpdateReminders(enabled bool, reminderTimes []string) {
	state, _ := a.LoadState()
	state.UserProfile.ReminderEnabled = enabled
	state.UserProfile.ReminderTimes = reminderTimes
	a.SaveState(state)
}

func (a *App) CompleteSetup(name string, date string) {
	state, _ := a.LoadState()
	state.UserProfile.Name = name
	state.UserProfile.TestDate = date
	state.UserProfile.IsSetupComplete = true
	a.SaveState(state)
}

func (a *App) ExportData() {
	state, _ := a.LoadState()
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.ErrorDialog,
			Title:   "Export Failed",
			Message: "Could not format data for export.",
		})
		return
	}

	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: "engress-progress-report.json",
		Title:           "Export Progress Data",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON Files (*.json)", Pattern: "*.json"},
		},
	})

	if err != nil || path == "" {
		return
	}

	err = os.WriteFile(path, data, 0644)
	if err != nil {
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.ErrorDialog,
			Title:   "Export Failed",
			Message: "Could not save the file: " + err.Error(),
		})
	} else {
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Export Successful",
			Message: "Your progress data has been saved to: " + path,
		})
	}
}

func (a *App) Notify(title string, message string) {
	// Native Mac notification via osascript
	script := fmt.Sprintf(`display notification "%s" with title "%s" sound name "Glass"`, message, title)
	exec.Command("osascript", "-e", script).Run()
}

func (a *App) UpdateTrayTime(timeStr string) {
	// 1. Update Window Title (Fallback/Internal)
	timeStr = strings.TrimSpace(timeStr)
	a.currentTimeStr = timeStr
	if timeStr == "" {
		runtime.WindowSetTitle(a.ctx, "Engress")
	} else {
		runtime.WindowSetTitle(a.ctx, "Engress ["+timeStr+"]")
	}

	// 2. Update macOS HUD Helper
	// Content: Time|Category|ScratchpadVisible
	scratchVisible := "0"
	if a.isHUDScratchpadVisible {
		scratchVisible = "1"
	}

	upperTime := strings.ToUpper(timeStr)
	if a.isPaused || timeStr == "" || upperTime == "HIDDEN" || upperTime == "HIDE" {
		os.WriteFile("/tmp/sentinel_timer.txt", []byte("HIDDEN"), 0644)
	} else {
		content := fmt.Sprintf("%s|%s|%s", timeStr, a.currentCategory, scratchVisible)
		os.WriteFile("/tmp/sentinel_timer.txt", []byte(content), 0644)
	}
}

func (a *App) UpdateNotes(notes string) {
	os.WriteFile("/tmp/engress_notes.txt", []byte(notes), 0644)
}

func (a *App) SetHUDScratchpadVisible(visible bool) {
	a.isHUDScratchpadVisible = visible
	a.UpdateTrayTime(a.currentTimeStr)
}

func (a *App) startHUDNotesWatcher() {
	ticker := time.NewTicker(500 * time.Millisecond)
	for range ticker.C {
		if !a.isHUDScratchpadVisible {
			continue
		}
		data, err := os.ReadFile("/tmp/engress_notes_hud.txt")
		if err == nil {
			content := string(data)
			if content != a.lastHUDNotes {
				a.lastHUDNotes = content
				runtime.EventsEmit(a.ctx, "hud-notes-update", content)
			}
		}
	}
}

// GetAppVersion returns the current application version
func (a *App) GetAppVersion() string {
	return "v1.0.0"
}

type UpdateInfo struct {
	Available   bool   `json:"available"`
	Version     string `json:"version"`
	Body        string `json:"body"`
	DownloadUrl string `json:"download_url"`
	Error       string `json:"error"`
}

// CheckUpdate checks GitHub releases and returns the update info
func (a *App) CheckUpdate() UpdateInfo {
	currentVersion := a.GetAppVersion()
	info := UpdateInfo{Available: false, Version: currentVersion}

	resp, err := http.Get("https://api.github.com/repos/lelehuy/Engress/releases/latest")
	if err != nil {
		info.Error = "Could not connect to update server."
		return info
	}
	defer resp.Body.Close()

	var release struct {
		TagName string `json:"tag_name"`
		Body    string `json:"body"`
		Assets  []struct {
			Name               string `json:"name"`
			BrowserDownloadUrl string `json:"browser_download_url"`
		} `json:"assets"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		info.Error = "Failed to parse update data."
		return info
	}

	// Normalize versions for comparison (remove v, V, and any leading dot after v/V)
	cleanVersion := func(v string) string {
		v = strings.TrimPrefix(v, "v")
		v = strings.TrimPrefix(v, "V")
		v = strings.TrimPrefix(v, ".")
		return strings.ToLower(v)
	}

	normLatest := cleanVersion(release.TagName)
	normCurrent := cleanVersion(currentVersion)

	if release.TagName != "" && normLatest != normCurrent {
		// New version available
		info.Available = true
		info.Version = release.TagName
		info.Body = release.Body

		// Find DMG
		for _, asset := range release.Assets {
			if strings.HasSuffix(asset.Name, ".dmg") {
				info.DownloadUrl = asset.BrowserDownloadUrl
				break
			}
		}
	}

	return info
}

// DownloadUpdate downloads the installer and performs a direct installation if possible
func (a *App) DownloadUpdate(url string, version string) string {
	if url == "" {
		return "Download URL is invalid."
	}

	filename := fmt.Sprintf("Engress-%s.dmg", version)
	tmpDir := os.TempDir()
	filePath := fmt.Sprintf("%s/%s", tmpDir, filename)

	// Create file
	out, err := os.Create(filePath)
	if err != nil {
		return "Could not create temporary file."
	}
	defer out.Close()

	// Download
	resp, err := http.Get(url)
	if err != nil {
		return "Download failed."
	}
	defer resp.Body.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "Failed to save installer."
	}

	// Direct Install Attempt
	mountPoint := fmt.Sprintf("%s/engress_update", tmpDir)
	os.MkdirAll(mountPoint, 0755)

	// 1. Mount DMG
	exec.Command("hdiutil", "attach", filePath, "-mountpoint", mountPoint, "-nobrowse", "-quiet").Run()

	// 3. Perform Copy
	// We use rsync here because it's better at handling existing directories and showing failures
	copyCmd := exec.Command("rsync", "-a", "--delete", fmt.Sprintf("%s/Engress.app", mountPoint), "/Applications/")
	err = copyCmd.Run()

	// 4. Detach
	exec.Command("hdiutil", "detach", mountPoint, "-quiet").Run()
	os.RemoveAll(mountPoint)

	if err != nil {
		fmt.Printf("Direct install failed: %v\n", err)
		// Fallback to opening DMG if automated copy failed (e.g. permissions)
		exec.Command("open", filePath).Start()
		return "Manual Action Required: Copy Engress to Applications."
	}

	return "Success"
}

// ShowWindow shows the application window
func (a *App) ShowWindow() {
	runtime.WindowShow(a.ctx)
}

// Quit quits the application
func (a *App) Quit() {
	exec.Command("pkill", "engress_hud").Run()
	runtime.Quit(a.ctx)
}

func (a *App) shutdown(ctx context.Context) {
	exec.Command("pkill", "engress_hud").Run()
}

// ResetAppData wipes the user's local data
func (a *App) ResetAppData() string {
	path := a.getStoragePath()
	err := os.Remove(path)
	if err != nil && !os.IsNotExist(err) {
		return "Failed to delete data: " + err.Error()
	}
	return "Success"
}

// CompleteTutorial marks the tutorial as seen
func (a *App) CompleteTutorial() {
	state, _ := a.LoadState()
	state.UserProfile.TutorialSeen = true
	a.SaveState(state)
}
