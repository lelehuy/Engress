package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

func (a *App) getStoragePath() string {
	home, _ := os.UserHomeDir()
	path := filepath.Join(home, "Library", "Application Support", "Engress")
	os.MkdirAll(path, 0755)
	return filepath.Join(path, "data.json")
}

func (a *App) LoadState() (*AppState, error) {
	path := a.getStoragePath()
	file, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			// Return default state
			return &AppState{
				UserProfile: UserProfile{
					TestDate:        "2026-03-01",
					TargetScore:     7.5,
					IsSetupComplete: false,
					ReminderTimes:   []string{"10:00", "22:00"},
					ReminderEnabled: true,
				},
				DailyLogs: []DailyLog{},
			}, nil
		}
		return nil, err
	}

	var state AppState
	err = json.Unmarshal(file, &state)
	return &state, err
}

func (a *App) SaveState(state *AppState) error {
	path := a.getStoragePath()
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func (a *App) GetState() *AppState {
	state, _ := a.LoadState()
	return state
}

func (a *App) SetState(state AppState) {
	a.SaveState(&state)
}
