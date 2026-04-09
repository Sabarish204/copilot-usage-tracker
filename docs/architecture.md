# Architecture

## V1 goals

- Track prompts captured through extension-owned entrypoints
- Store data locally on disk
- Surface daily, monthly, and date-range reporting in VS Code
- Keep persistence abstract so JSON can later be replaced with SQLite

## Components

### Extension host

- Registers commands, tree view, and reports webview
- Coordinates storage and reporting services

### Prompt tracker service

- Creates prompt records
- Computes preview text and efficiency
- Applies privacy setting for prompt storage

### Storage service

- Uses `context.globalStorageUri`
- Persists data as JSON in v1
- Can be replaced by a SQLite repository with the same interface

### Reporting service

- Computes today and month counts
- Aggregates selected date ranges
- Produces day-by-day summaries for the reports UI

### Sidebar view

- Shows top-level summaries and recent prompts

### Reports webview

- Accepts `from` and `to` dates
- Shows aggregate metrics and day-level rows

## Capture strategy

Supported:

- Command-based tracked prompt entry
- Future custom chat participant owned by this extension
- Future prompt form in the reports or details webview

Not supported through stable public APIs:

- Reading prompts typed into native GitHub Copilot Chat
- Intercepting inline completions from GitHub Copilot

## Future SQLite schema

```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  day_key TEXT NOT NULL,
  month_key TEXT NOT NULL,
  source TEXT NOT NULL,
  prompt_text TEXT,
  prompt_preview TEXT NOT NULL,
  planned_effort_hours REAL,
  actual_effort_hours REAL,
  efficiency_pct REAL,
  notes TEXT
);

CREATE INDEX idx_prompts_day_key ON prompts(day_key);
CREATE INDEX idx_prompts_month_key ON prompts(month_key);
CREATE INDEX idx_prompts_created_at ON prompts(created_at);
```
