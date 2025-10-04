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
  const redirectUri = window.location.origin + window.location.pathname;
  const url = `https://github.com/login/oauth/authorize?client_id=Ov23liCf78W2lLVcJspO&scope=gist&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
  resetGistId();
  window.location.href = url;
}

export function logoutGitHub() {
  localStorage.removeItem("githubToken");
  localStorage.removeItem("githubUser");
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
