// --- Auth logic moved to auth.js ---

import { githubUser, githubToken, showUser, exchangeCodeForToken, fetchGitHubUser, persistAuthToStorage, restoreAuthFromStorage } from './auth.js';


import { resetGistId } from './gist.js';
export function loginWithGitHub() {
  const redirectUri = window.location.origin + window.location.pathname;
  const url = `https://github.com/login/oauth/authorize?client_id=Ov23liCf78W2lLVcJspO&scope=gist&redirect_uri=${encodeURIComponent(redirectUri)}`;
  resetGistId();
  window.location.href = url;
}

export function logoutGitHub() {
  localStorage.removeItem('githubToken');
  localStorage.removeItem('githubUser');
  showUser(null);
  loadMilestones().then(updateUI);
}

// Move handleOAuthRedirect back to ui.js since it's not in auth.js
async function handleOAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    try {
      const token = await exchangeCodeForToken(code, "http://127.0.0.1:3001");
      const user = await fetchGitHubUser(token);
      persistAuthToStorage(token, user);
      showUser(user);
      await loadMilestones();
      updateUI();
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      alert("GitHub login failed: " + e.message);
    }
  }
}
// ...existing code...
// --- Gist and milestone logic moved to gist.js and milestones.js ---
import { milestones, loadMilestones, saveMilestones, addMilestone } from './milestones.js';
// ...existing code...

// (Removed duplicate non-async milestone functions)
function clearMilestoneMarkers(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  // Remove old markers
  Array.from(
    bar.querySelectorAll(".milestone-marker, .milestone-marker-label")
  ).forEach((e) => e.remove());
}
function renderMilestoneMarkers(barId, rangeStart, rangeEnd, infoId, selKey) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  clearMilestoneMarkers(barId);
  const info = infoId ? document.getElementById(infoId) : null;
  if (info) info.textContent = "";
  let milestoneIdx = 0;
  milestones.forEach((m) => {
    const d = new Date(m.date);
    if (isNaN(d) || d < rangeStart || d > rangeEnd) return;
    const percent = ((d - rangeStart) / (rangeEnd - rangeStart)) * 100;
    const marker = document.createElement("div");
    marker.className = "milestone-marker";
    marker.style.left = percent + "%";
    marker.tabIndex = 0;
    marker.style.position = "absolute";
    if (selKey && selectedMilestone[selKey] === milestoneIdx) {
      marker.classList.add("selected");
      if (info)
        info.textContent =
          (m.label ? m.label + " - " : "") + d.toLocaleDateString();
    }
    marker.addEventListener("click", (e) => {
      e.stopPropagation();
      if (info)
        info.textContent =
          (m.label ? m.label + " - " : "") + d.toLocaleDateString();
      bar
        .querySelectorAll(".milestone-marker.selected")
        .forEach((el) => el.classList.remove("selected"));
      marker.classList.add("selected");
      if (selKey) selectedMilestone[selKey] = milestoneIdx;
    });
    bar.appendChild(marker);
    milestoneIdx++;
  });
  // Hide info and highlight if click outside
  if (info && selKey) {
    document.addEventListener("click", function clearMilestoneInfo(e) {
      if (!bar.contains(e.target)) {
        info.textContent = "";
        bar
          .querySelectorAll(".milestone-marker.selected")
          .forEach((el) => el.classList.remove("selected"));
        selectedMilestone[selKey] = null;
        document.removeEventListener("click", clearMilestoneInfo);
      }
    });
  }
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


import { updateUI, setupEventListeners } from './ui_render.js';

document.addEventListener("DOMContentLoaded", () => {
  // Restore session if available
  const restoredUser = restoreAuthFromStorage();
  if (restoredUser) {
    showUser(restoredUser);
    loadMilestones().then(updateUI);
  }
  handleOAuthRedirect();
  setupEventListeners();
});

// Only call loadMilestones if not already called above
if (!githubUser) {
  loadMilestones().then(updateUI);
}
