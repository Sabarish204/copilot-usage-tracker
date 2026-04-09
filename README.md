# Copilot Usage Tracker

Track Copilot-related work inside Visual Studio Code with a simple local-first workflow. Save prompt notes, planned effort, actual effort, and generated reports without sending your data to an external service.

## Why Use It

- Save prompt entries with planned and actual effort
- Review daily and monthly usage summaries
- Generate date-range reports in the dashboard
- Export reports to `.xlsx` and JSON
- Keep data stored locally in VS Code extension storage

## What It Tracks

This extension tracks prompts that you save through its own dashboard workflow.

It does not read or intercept prompts typed directly into the built-in GitHub Copilot Chat UI. VS Code does not expose that as a stable public API for third-party extensions.

## Features

- Activity Bar entry with a dedicated `Copilot Tracker` view
- Dashboard with `Save Prompt` and `Report` tabs
- Sidebar summary for today, this month, and recent prompt history
- Clipboard fill for quickly pasting prompt text
- Date-range reporting with totals and efficiency metrics
- Excel export with a modern `.xlsx` file
- JSON export for backup or further analysis

## Quick Start

1. Install the extension from the Visual Studio Marketplace.
2. Open VS Code.
3. In the Activity Bar, select `Copilot Tracker`.
4. Open the `Dashboard` view.
5. In `Save Prompt`, enter:
   - Prompt text
   - Planned effort in hours
   - Actual effort in hours
6. Select `Save Prompt`.
7. Open the `Report` tab to generate summaries for a date range.
8. Select `Export Excel` to create a `.xlsx` report if needed.

## Clipboard Fill

Use `Use Clipboard` when you already copied prompt text from somewhere else.

1. Copy the prompt text.
2. Open `Copilot Tracker` > `Dashboard` > `Save Prompt`.
3. Select `Use Clipboard`.
4. Review the inserted text.
5. Enter planned and actual effort.
6. Select `Save Prompt`.

If the clipboard is empty, nothing is inserted.

## Commands

- `Copilot Usage Tracker: Open Dashboard`
- `Copilot Usage Tracker: Open Getting Started`
- `Copilot Usage Tracker: Refresh`
- `Copilot Usage Tracker: Export JSON`

## Data Storage And Privacy

The extension stores data locally in VS Code global storage using a JSON file named `copilot-usage-tracker.json`.

Typical Windows development path:

- `%APPDATA%\Code\User\globalStorage\<publisher>.<extension-name>\copilot-usage-tracker.json`

Nothing in this extension requires a hosted backend for basic tracking and reporting.

## VS Code Support

Supported Visual Studio Code versions: `1.105.0` and later.

## Project Structure

- `src/extension.ts`: activation and command wiring
- `src/models.ts`: domain types
- `src/services/`: storage, tracking, report generation, and export logic
- `src/views/`: sidebar and dashboard webview
- `media/`: icons and walkthrough assets

## Development

```bash
npm install
npm run compile
```

Package the extension locally:

```bash
vsce package
```

## Roadmap Ideas

1. Add charts to the report dashboard.
2. Support CSV export alongside Excel and JSON.
3. Add prompt redaction or hash-only storage options.
4. Replace JSON storage with SQLite for richer querying.
5. Add automated tests around aggregation and persistence.

## License

MIT
