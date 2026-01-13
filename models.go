package main

type UserProfile struct {
	Name            string   `json:"name"`
	TestDate        string   `json:"test_date"`
	TargetScore     float64  `json:"target_score"`
	LastOpenDate    string   `json:"last_open_date"`    // For tracking daily alerts
	IsSetupComplete bool     `json:"is_setup_complete"` // New flag
	ReminderTimes   []string `json:"reminder_times"`    // ["10:00", "22:00"]
	ReminderEnabled bool     `json:"reminder_enabled"`
	TutorialSeen    bool     `json:"tutorial_seen"`
}

type Scores struct {
	Reading   float64 `json:"reading"`
	Writing   float64 `json:"writing"`
	Listening float64 `json:"listening"`
	Speaking  float64 `json:"speaking"`
}

type DailyLog struct {
	ID         string  `json:"id"`
	Date       string  `json:"date"`
	Module     string  `json:"module"`     // "writing", "speaking", "reading"
	Duration   int     `json:"duration"`   // in minutes
	Score      float64 `json:"score"`      // Raw score or Band
	Reflection string  `json:"reflection"` // User notes (Obstacles)
	Homework   string  `json:"homework"`   // "Tomorrow's focus"
	Learnings  string  `json:"learnings"`  // Key points/Notes
	Content    string  `json:"content"`    // Actual work (essays, notes, etc.)
	SourceURL  string  `json:"source_url"` // Original question URL
	Screenshot string  `json:"screenshot"` // Base64 encoded image
	Time       string  `json:"time"`       // "15:04"
}

type VocabItem struct {
	ID        string `json:"id"`
	Word      string `json:"word"`
	Def       string `json:"def"`
	Sentences string `json:"sentences"` // Stored as newline separated
	DateAdded string `json:"date_added"`
	Time      string `json:"time"`
}

type AppState struct {
	UserProfile UserProfile `json:"user_profile"`
	DailyLogs   []DailyLog  `json:"daily_logs"`
	Vocabulary  []VocabItem `json:"vocabulary"`
}
