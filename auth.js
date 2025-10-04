// auth.js - GitHub OAuth logic and token/user management

export let githubUser = null;
export let githubToken = null;

export function restoreAuthFromStorage() {
  githubToken = localStorage.getItem('githubToken');
  const userStr = localStorage.getItem('githubUser');
  if (githubToken && userStr) {
    githubUser = JSON.parse(userStr);
    return githubUser;
  }
  return null;
}

export function persistAuthToStorage(token, user) {
  localStorage.setItem('githubToken', token);
  localStorage.setItem('githubUser', JSON.stringify(user));
}

import { resetGistId } from './gist.js';
export function clearAuthFromStorage() {
  localStorage.removeItem('githubToken');
  localStorage.removeItem('githubUser');
  resetGistId();
}

export function showUser(user) {
  const info = document.getElementById('user-info');
  const loginBtn = document.getElementById('login-github');
  const logoutBtn = document.getElementById('logout-github');
  if (user) {
    info.textContent = `Logged in as ${user.login}`;
    info.style.display = '';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = '';
  } else {
    info.textContent = '';
    info.style.display = 'none';
    loginBtn.style.display = '';
    logoutBtn.style.display = 'none';
  }
}

export async function exchangeCodeForToken(code, backendUrl) {
  const res = await fetch(`${backendUrl}/auth/github/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('OAuth exchange failed');
  const data = await res.json();
  return data.access_token;
}

export async function fetchGitHubUser(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return await res.json();
}
