function showLoader(show = true) {
  const loader = document.getElementById("loader-overlay");
  if (loader) loader.style.display = show ? "flex" : "none";
}
// --- Auth logic moved to auth.js ---

import {
  githubUser,
  githubToken,
  showUser,
  exchangeCodeForToken,
  fetchGitHubUser,
  persistAuthToStorage,
  restoreAuthFromStorage,
} from "./auth.js";

import { resetGistId } from "./gist.js";
export function loginWithGitHub() {
  showLoader(true);
  const redirectUri = window.location.origin + window.location.pathname;
  const url = `https://github.com/login/oauth/authorize?client_id=Ov23liCf78W2lLVcJspO&scope=gist&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
  resetGistId();
  window.location.href = url;
}

export function logoutGitHub() {
  showLoader(true);
  localStorage.removeItem("githubToken");
  localStorage.removeItem("githubUser");
  // Completely remove all milestones (local and in-memory)
  localStorage.removeItem("milestones");
  try {
    if (window.milestones) {
      window.milestones.length = 0;
    }
  } catch {}
  try {
    // If imported milestones variable exists
    if (typeof milestones !== 'undefined' && Array.isArray(milestones)) {
      milestones.length = 0;
    }
  } catch {}
  showUser(null);
  updateUI();
  setTimeout(() => showLoader(false), 600);
}

// Move handleOAuthRedirect back to ui.js since it's not in auth.js
async function handleOAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    showLoader(true);
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
    } finally {
      setTimeout(() => showLoader(false), 600);
    }
  }
}
// ...existing code...
// --- Gist and milestone logic moved to gist.js and milestones.js ---
import {
  milestones,
  loadMilestones,
  saveMilestones,
  addMilestone,
} from "./milestones.js";
// ...existing code...

// (Removed duplicate non-async milestone functions)

import { updateUI, setupEventListeners } from "./ui_render.js";

document.addEventListener("DOMContentLoaded", () => {
  // Restore session if available
  showLoader(true);
  const restoredUser = restoreAuthFromStorage();
  if (restoredUser) {
    showUser(restoredUser);
    loadMilestones().then(() => {
      updateUI();
      setTimeout(() => showLoader(false), 600);
    });
  } else {
    setTimeout(() => showLoader(false), 600);
  }
  handleOAuthRedirect();
  setupEventListeners();
});

// Only call loadMilestones if not already called above
if (!githubUser) {
  loadMilestones().then(updateUI);
}
