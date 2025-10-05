// ui_render.js - UI rendering and event listeners

import { milestones, addMilestone, loadMilestones } from "./milestones.js";
import { githubUser, showUser } from "./auth.js";
import { loginWithGitHub, logoutGitHub } from "./ui.js";
import { QUOTES } from "./quotes.js";

// Track selected milestone by unique key (date+label) for each bar, persist in localStorage
const SELECTED_MILESTONE_KEY = "selectedMilestone";
// Each value is {date, label} or null
let selectedMilestone = {
  year: null,
  month: null,
  week: null,
  day: null,
  custom: null,
};

function saveSelectedMilestone() {
  localStorage.setItem(
    SELECTED_MILESTONE_KEY,
    JSON.stringify(selectedMilestone)
  );
}

function loadSelectedMilestone() {
  const data = localStorage.getItem(SELECTED_MILESTONE_KEY);
  if (data) {
    try {
      selectedMilestone = JSON.parse(data);
    } catch (e) {}
  }
}

function showDailyQuote(date) {
  // Find the daily-quote in the footer only
  const el = document.getElementById("daily-quote");
  if (!el) return;
  // Use day of year as index for quote
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const quote = QUOTES[dayOfYear % QUOTES.length];
  el.textContent = quote;
}

export function updateUI() {
  const now = new Date();
  // Show daily quote
  showDailyQuote(now);
  // Year
  const yearPercent = getYearProgress(now);
  document.getElementById("progress-bar-year").style.width =
    yearPercent.toFixed(6) + "%";
  document.getElementById("progress-text-year").textContent =
    yearPercent.toFixed(6) + "% of 100%";
  renderMilestoneMarkers(
    "progress-bar-bg-year",
    new Date(now.getFullYear(), 0, 1),
    new Date(now.getFullYear() + 1, 0, 1),
    "milestone-info-year",
    "year"
  );
  // Month
  const monthPercent = getMonthProgress(now);
  document.getElementById("progress-bar-month").style.width =
    monthPercent.toFixed(6) + "%";
  document.getElementById("progress-text-month").textContent =
    monthPercent.toFixed(6) + "% of 100%";
  renderMilestoneMarkers(
    "progress-bar-bg-month",
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
    "milestone-info-month",
    "month"
  );
  // Week
  const weekPercent = getWeekProgress(now);
  document.getElementById("progress-bar-week").style.width =
    weekPercent.toFixed(6) + "%";
  document.getElementById("progress-text-week").textContent =
    weekPercent.toFixed(6) + "% of 100%";
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  renderMilestoneMarkers(
    "progress-bar-bg-week",
    weekStart,
    weekEnd,
    "milestone-info-week",
    "week"
  );
  // Day
  const dayPercent = getDayProgress(now);
  document.getElementById("progress-bar-day").style.width =
    dayPercent.toFixed(6) + "%";
  document.getElementById("progress-text-day").textContent =
    dayPercent.toFixed(6) + "% of 100%";
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(24, 0, 0, 0);
  renderMilestoneMarkers(
    "progress-bar-bg-day",
    dayStart,
    dayEnd,
    "milestone-info-day",
    "day"
  );
  // Custom Range
  const startInput = document.getElementById("custom-start");
  const endInput = document.getElementById("custom-end");
  if (startInput && endInput) {
    const customPercent = getCustomRangeProgress(
      startInput.value,
      endInput.value,
      now
    );
    document.getElementById("progress-bar-custom").style.width =
      customPercent.toFixed(6) + "%";
    document.getElementById("progress-text-custom").textContent =
      customPercent > 0
        ? customPercent.toFixed(6) + "% of 100%"
        : "Enter valid dates";
    if (startInput.value && endInput.value) {
      renderMilestoneMarkers(
        "progress-bar-bg-custom",
        new Date(startInput.value),
        new Date(endInput.value),
        "milestone-info-custom",
        "custom"
      );
    } else {
      clearMilestoneMarkers("progress-bar-bg-custom");
    }
  }
  // Date info
  document.getElementById(
    "date-info"
  ).textContent = `Today: ${now.toLocaleDateString()} | Day ${Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  )} of ${now.getFullYear()}`;
}

// Helper functions needed for updateUI
function getYearProgress(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear() + 1, 0, 1);
  const elapsed = date - start;
  const total = end - start;
  return (elapsed / total) * 100;
}
function getMonthProgress(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const elapsed = date - start;
  const total = end - start;
  return (elapsed / total) * 100;
}
function getWeekProgress(date = new Date()) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  const elapsed = date - start;
  const total = end - start;
  return (elapsed / total) * 100;
}
function getDayProgress(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(24, 0, 0, 0);
  const elapsed = date - start;
  const total = end - start;
  return (elapsed / total) * 100;
}
function getCustomRangeProgress(startDate, endDate, now = new Date()) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  if (now < start) return 0;
  if (now > end) return 100;
  const elapsed = now - start;
  const total = end - start;
  return (elapsed / total) * 100;
}
function clearMilestoneMarkers(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  Array.from(
    bar.querySelectorAll(".milestone-marker, .milestone-marker-label")
  ).forEach((e) => e.remove());
}
function isSameMilestone(a, b) {
  if (!a || !b) return false;
  return a.date === b.date && (a.label || "") === (b.label || "");
}

function renderMilestoneMarkers(barId, rangeStart, rangeEnd, infoId, selKey) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  clearMilestoneMarkers(barId);
  const info = infoId ? document.getElementById(infoId) : null;
  if (info) info.textContent = "";
  milestones.forEach((m) => {
    let d;
    // For day bar, use both date and time for milestone position
    if (barId === "progress-bar-bg-day" && m.time) {
      // m.time is in HH:MM format
      const [h, min] = m.time.split(":");
      d = new Date(m.date);
      if (!isNaN(h) && !isNaN(min)) {
        d.setHours(Number(h), Number(min), 0, 0);
      }
    } else {
      d = new Date(m.date);
    }
    if (isNaN(d) || d < rangeStart || d > rangeEnd) return;
    const percent = ((d - rangeStart) / (rangeEnd - rangeStart)) * 100;
    const marker = document.createElement("div");
    marker.className = "milestone-marker";
    marker.style.left = percent + "%";
    marker.tabIndex = 0;
    marker.style.position = "absolute";

    // Restore selection and label if selected
    if (
      selKey &&
      selectedMilestone[selKey] &&
      isSameMilestone(selectedMilestone[selKey], {
        date: m.date,
        label: m.label,
      })
    ) {
      marker.classList.add("selected");
      if (info)
        info.textContent =
          (m.label ? m.label + " - " : "") +
          d.toLocaleDateString() +
          (m.time ? " " + m.time : "");
    }
    marker.addEventListener("click", (e) => {
      e.stopPropagation();
      if (info)
        info.textContent =
          (m.label ? m.label + " - " : "") +
          d.toLocaleDateString() +
          (m.time ? " " + m.time : "");
      bar
        .querySelectorAll(".milestone-marker.selected")
        .forEach((el) => el.classList.remove("selected"));
      marker.classList.add("selected");
      if (selKey) {
        selectedMilestone[selKey] = { date: m.date, label: m.label };
        saveSelectedMilestone();
      }
    });
    bar.appendChild(marker);
  });
}

export function setupEventListeners() {
  loadSelectedMilestone();
  document
    .getElementById("login-github")
    .addEventListener("click", loginWithGitHub);
  document
    .getElementById("logout-github")
    .addEventListener("click", logoutGitHub);
  // Add Milestone button
  // Modal logic for adding milestone
  const showModalBtn = document.getElementById("show-add-milestone-modal");
  const modal = document.getElementById("add-milestone-modal");
  const form = document.getElementById("add-milestone-form");
  const cancelBtn = document.getElementById("cancel-add-milestone");
  if (showModalBtn && modal && form && cancelBtn) {
    showModalBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      modal.style.zIndex = 10001;
      modal.focus && modal.focus();
    });
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      form.reset();
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("[Milestone Modal] Add button clicked");
      const date = document.getElementById("modal-milestone-date").value;
      const time = document.getElementById("modal-milestone-time").value;
      const label = document.getElementById("modal-milestone-label").value;
      const color = document.getElementById("modal-milestone-color").value;
      const icon = document.getElementById("modal-milestone-icon").value;
      const milestone = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        date,
        time: time || "",
        label,
        customization: { color: color || "#00cec9", icon: icon || "" },
      };
      try {
        const mod = await import("./milestoneData.js");
        await mod.addMilestone(milestone);
        modal.style.display = "none";
        form.reset();
        // Reload milestones and update UI
        window.milestones = await mod.getMilestones();
        updateUI();
        // If milestone panel is open, re-render it
        const panel = document.getElementById("milestone-panel");
        if (panel && panel.style.right === "0px") {
          import("./milestonePanel.js").then((mod) =>
            mod.renderMilestonePanel()
          );
        }
      } catch (err) {
        alert("Failed to add milestone: " + (err?.message || err));
      }
    });
  }
  // Milestone panel open/close
  const openPanelBtn = document.getElementById("open-milestone-panel");
  const closePanelBtn = document.getElementById("close-milestone-panel");
  if (openPanelBtn) {
    openPanelBtn.addEventListener("click", () => {
      import("./milestonePanel.js").then((mod) => {
        mod.openMilestonePanel();
        mod.renderMilestonePanel();
      });
    });
  }
  if (closePanelBtn) {
    closePanelBtn.addEventListener("click", () => {
      import("./milestonePanel.js").then((mod) => mod.closeMilestonePanel());
    });
  }

  // Copy/Share/Download Progress
  const copyBtn = document.getElementById("copy-progress");
  if (copyBtn) copyBtn.addEventListener("click", copyProgressText);
  const shareBtn = document.getElementById("share-image");
  if (shareBtn) shareBtn.addEventListener("click", shareProgressImage);
  const downloadBtn = document.getElementById("download-image");
  if (downloadBtn) downloadBtn.addEventListener("click", downloadProgressImage);

  loadMilestones().then(updateUI);
  setInterval(updateUI, 1000);
}

// --- Copy/share/download logic ---
function getProgressText() {
  const year = document.getElementById("progress-text-year").textContent;
  const month = document.getElementById("progress-text-month").textContent;
  const week = document.getElementById("progress-text-week").textContent;
  const day = document.getElementById("progress-text-day").textContent;
  const custom = document.getElementById("progress-text-custom").textContent;
  const today = document.getElementById("date-info").textContent;
  return `Year Progress: ${year}\nMonth Progress: ${month}\nWeek Progress: ${week}\nDay Progress: ${day}\nCustom Range: ${custom}\n${today}`;
}

function copyProgressText() {
  const text = getProgressText();
  navigator.clipboard.writeText(text).then(() => {
    alert("Progress copied to clipboard!");
  });
}

function shareProgressImage() {
  if (window.html2canvas) {
    html2canvas(document.querySelector(".container")).then((canvas) => {
      if (navigator.share) {
        canvas.toBlob((blob) => {
          const file = new File([blob], "progress.png", { type: "image/png" });
          navigator.share({
            files: [file],
            title: "My Progress",
            text: "Check out my progress!",
          });
        });
      } else {
        // fallback: open image in new tab
        const url = canvas.toDataURL("image/png");
        window.open(url, "_blank");
      }
    });
  } else {
    alert("Image sharing requires html2canvas.");
  }
}

function downloadProgressImage() {
  if (window.html2canvas) {
    html2canvas(document.querySelector(".container")).then((canvas) => {
      const link = document.createElement("a");
      link.download = "progress.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  } else {
    alert("Image download requires html2canvas.");
  }
}

// Export any other UI helpers as needed
