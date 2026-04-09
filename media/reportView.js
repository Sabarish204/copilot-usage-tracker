(function () {
  const vscode = acquireVsCodeApi();
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const panels = Array.from(document.querySelectorAll(".panel"));
  const savePromptForm = document.getElementById("save-prompt-form");
  const form = document.getElementById("report-form");
  const output = document.getElementById("output");
  const fromInput = document.getElementById("from");
  const toInput = document.getElementById("to");
  const promptTextInput = document.getElementById("prompt-text");
  const plannedInput = document.getElementById("planned-hours");
  const actualInput = document.getElementById("actual-hours");
  const saveStatus = document.getElementById("save-status");
  const reportStatus = document.getElementById("report-status");
  const exportButton = document.getElementById("export-report");
  const fillSelectionButton = document.getElementById("fill-selection");
  const fillClipboardButton = document.getElementById("fill-clipboard");
  const todayCount = document.getElementById("today-count");
  const monthCount = document.getElementById("month-count");
  const recentPrompts = document.getElementById("recent-prompts");
  const promptLength = document.getElementById("prompt-length");

  function switchTab(targetId) {
    tabButtons.forEach(function (button) {
      button.classList.toggle("active", button.dataset.tabTarget === targetId);
    });

    panels.forEach(function (panel) {
      panel.classList.toggle("active", panel.id === targetId);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hasUpToTwoDecimals(value) {
    return /^\d+(\.\d{1,2})?$/.test(String(value).trim());
  }

  function formatHours(value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return "-";
    }

    return numericValue.toFixed(2);
  }

  function renderRecentPrompts(prompts) {
    if (!prompts.length) {
      recentPrompts.innerHTML = "<div class='muted'>No prompts saved yet.</div>";
      return;
    }

    const rows = prompts.map(function (prompt) {
      return `
        <tr>
          <td>${escapeHtml(prompt.dayKey)}</td>
          <td>${escapeHtml(prompt.promptPreview)}</td>
          <td>${escapeHtml(formatHours(prompt.plannedEffortHours))}</td>
          <td>${escapeHtml(formatHours(prompt.actualEffortHours))}</td>
          <td>${escapeHtml(prompt.efficiencyPct ?? 0)}%</td>
        </tr>
      `;
    }).join("");

    recentPrompts.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Prompt</th>
            <th>Planned</th>
            <th>Actual</th>
            <th>Saved</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function updatePromptLength() {
    promptLength.textContent = `${promptTextInput.value.trim().length} characters`;
  }

  function renderReport(report) {
    const rows = report.byDay.map((day) => `
      <tr>
        <td>${day.dayKey}</td>
        <td>${day.totalPrompts}</td>
        <td>${formatHours(day.totalPlannedHours)}</td>
        <td>${formatHours(day.totalActualHours)}</td>
        <td>${day.efficiencyPct}%</td>
      </tr>
    `).join("");

    output.innerHTML = `
      <div class="metrics">
        <div class="metric"><strong>Total Prompts</strong><br>${report.totalPrompts}</div>
        <div class="metric"><strong>Total Planned Hours</strong><br>${formatHours(report.totalPlannedHours)}</div>
        <div class="metric"><strong>Total Actual Hours</strong><br>${formatHours(report.totalActualHours)}</div>
        <div class="metric"><strong>Efficiency Saved</strong><br>${report.efficiencyPct}%</div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Prompts</th>
              <th>Planned</th>
              <th>Actual</th>
              <th>Efficiency Saved</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      switchTab(button.dataset.tabTarget);
    });
  });

  savePromptForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveStatus.textContent = "";

    if (!promptTextInput.value.trim()) {
      saveStatus.textContent = "Prompt is required.";
      return;
    }

    if (!hasUpToTwoDecimals(plannedInput.value) || !hasUpToTwoDecimals(actualInput.value)) {
      saveStatus.textContent = "Planned and actual effort must use up to 2 decimal places, for example 0.35.";
      return;
    }

    vscode.postMessage({
      type: "savePrompt",
      promptText: promptTextInput.value,
      plannedHours: Number(plannedInput.value),
      actualHours: Number(actualInput.value)
    });
  });

  fillSelectionButton.addEventListener("click", function () {
    saveStatus.textContent = "Pulling text from the current editor selection...";
    vscode.postMessage({
      type: "fillFromSelection"
    });
  });

  fillClipboardButton.addEventListener("click", function () {
    saveStatus.textContent = "Pulling text from your clipboard...";
    vscode.postMessage({
      type: "fillFromClipboard"
    });
  });

  promptTextInput.addEventListener("input", updatePromptLength);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    reportStatus.textContent = "Generating report...";
    vscode.postMessage({
      type: "generateReport",
      from: fromInput.value,
      to: toInput.value
    });
  });

  exportButton.addEventListener("click", function () {
    reportStatus.textContent = "Preparing Excel export...";
    vscode.postMessage({
      type: "exportReport",
      from: fromInput.value,
      to: toInput.value
    });
  });

  window.addEventListener("message", function (event) {
    const message = event.data;

    if (message.type === "bootstrap") {
      fromInput.value = message.payload.defaultFrom;
      toInput.value = message.payload.defaultTo;
      todayCount.textContent = String(message.payload.todayCount);
      monthCount.textContent = String(message.payload.monthCount);
      renderRecentPrompts(message.payload.recentPrompts);
      return;
    }

    if (message.type === "reportResult") {
      reportStatus.textContent = "Report generated.";
      renderReport(message.payload);
      switchTab("report-panel");
      return;
    }

    if (message.type === "promptSaved") {
      saveStatus.textContent = message.payload.message;
      promptTextInput.value = "";
      plannedInput.value = "1";
      actualInput.value = "1";
      updatePromptLength();
      return;
    }

    if (message.type === "saveError") {
      saveStatus.textContent = message.payload.message;
      return;
    }

    if (message.type === "promptPrefilled") {
      if (!message.payload.text) {
        saveStatus.textContent = `No text found in ${message.payload.source}.`;
        return;
      }

      promptTextInput.value = message.payload.text;
      updatePromptLength();
      saveStatus.textContent = `Prompt text filled from ${message.payload.source}.`;
      return;
    }

    if (message.type === "reportExported") {
      reportStatus.textContent = message.payload.message;
    }
  });

  updatePromptLength();
}());
