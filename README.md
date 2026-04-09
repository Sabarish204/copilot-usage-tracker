# Copilot Usage Tracker

Local-first Visual Studio Code extension scaffold for tracking GitHub Copilot prompts, planned effort, actual effort, and efficiency.

## VS Code Support

**Supported Visual Studio Code versions: `1.105.0` and later.**

**This extension is intended to support up to 10 VS Code releases lower than the current project baseline.**

The current project baseline is `1.115.0`, so this plugin is documented and configured to support VS Code `1.105.0+`.

## What this v1 scaffold includes

- Prompt tracking UI inside the extension dashboard
- Daily and monthly prompt counts
- Local JSON storage in the extension's global storage directory
- Sidebar summary and prompt history
- Dashboard webview with `Save Prompt` and `Report` tabs
- Date-range summaries and modern `.xlsx` Excel report export
- Export to JSON

## Important limitation

This scaffold captures prompts that flow through the extension's own tracked entrypoints. It does not intercept prompts typed directly into the built-in GitHub Copilot Chat UI because that is not exposed through a stable public API for third-party extensions.

## Suggested next milestones

1. Add a richer prompt submission flow that hands off to your preferred Copilot workflow.
2. Replace JSON storage with SQLite if you want stronger query support.
3. Add prompt redaction and hash-only storage options.
4. Add charts and CSV export in the reports webview.
5. Add tests around aggregation and persistence.

## Project structure

- `src/extension.ts`: activation and command wiring
- `src/models.ts`: domain types
- `src/services/`: storage, tracking, and reporting logic
- `src/views/`: tree view and reports webview
- `media/`: extension assets

## How To Use In VS Code

1. Install the `.vsix` and reload VS Code if prompted.
2. In the left Activity Bar, select the `Copilot Tracker` icon.
3. Open the `Dashboard` view.
4. In the `Save Prompt` tab, enter the prompt text, planned effort hours, and actual effort hours.
5. Select `Save Prompt`.
6. Switch to the `Report` tab to generate summaries for a date range.
7. Select `Export Excel` if you want a modern `.xlsx` report file.

## How Clipboard Fill Works

Use the `Use Clipboard` button in the `Save Prompt` tab when you already copied prompt text from somewhere else.

1. Copy the prompt text you want to store.
2. Open `Copilot Tracker` > `Dashboard` > `Save Prompt`.
3. Select `Use Clipboard`.
4. The extension reads the current clipboard text and places it into the prompt textbox.
5. Enter `Planned Effort` and `Actual Effort` manually.
6. Select `Save Prompt`.

If the clipboard is empty, the prompt box will not be filled.

## Where Data Is Stored

The extension stores prompt data locally in a JSON file named:

- `copilot-usage-tracker.json`

The file is saved under VS Code's extension global storage folder for this extension:

- Windows: `%APPDATA%\Code\User\globalStorage\local-dev.copilot-usage-tracker\copilot-usage-tracker.json`
- Typical resolved Windows path: `C:\Users\<your-user>\AppData\Roaming\Code\User\globalStorage\local-dev.copilot-usage-tracker\copilot-usage-tracker.json`

This location comes from the extension's `globalStorageUri` and is created automatically when the extension runs.

You can also reopen the built-in onboarding guide from the Command Palette with:

- `Copilot Usage Tracker: Open Getting Started`
