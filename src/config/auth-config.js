/**
 * Authentication Configuration
 * This file contains environment-specific OAuth settings
 */

export const AUTH_CONFIG = {
  // Local development environment
  localhost: {
    clientId: "Ov23liCf78W2lLVcJspO",
    redirectUri: "http://localhost:5500/",
    backendUrl: "https://yearprogress-4s7k.onrender.com",
  },

  // GitHub Codespaces environment
  codespaces: {
    clientId: "Ov23liCf78W2lLVcJspO",
    redirectUri: window.location?.origin + "/" || "http://localhost:5500/",
    backendUrl: "https://yearprogress-4s7k.onrender.com",
  },

  // Production environment (GitHub Pages)
  production: {
    clientId: "Ov23liCf78W2lLVcJspO",
    redirectUri: "https://pappater.github.io/yearprogress/",
    backendUrl: "https://yearprogress-4s7k.onrender.com",
  },
};

/**
 * Environment detection utility
 * @returns {string} Current environment name
 */
export function detectEnvironment() {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "localhost";
  } else if (
    hostname.includes("codespaces") ||
    hostname.includes("github.dev")
  ) {
    return "codespaces";
  } else {
    return "production";
  }
}

/**
 * Get configuration for current environment
 * @returns {Object} Configuration object
 */
export function getAuthConfig() {
  const environment = detectEnvironment();
  const config = AUTH_CONFIG[environment];

  // Check for build-time environment variables that can override defaults
  const buildTimeOverrides = {};

  // Vite environment variables
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_GITHUB_CLIENT_ID) {
      buildTimeOverrides.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    }
    if (import.meta.env.VITE_GITHUB_REDIRECT_URI) {
      buildTimeOverrides.redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    }
    if (import.meta.env.VITE_BACKEND_URL) {
      buildTimeOverrides.backendUrl = import.meta.env.VITE_BACKEND_URL;
    }
  }

  // Create React App environment variables
  if (typeof process !== "undefined" && process.env) {
    if (process.env.REACT_APP_GITHUB_CLIENT_ID) {
      buildTimeOverrides.clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    }
    if (process.env.REACT_APP_GITHUB_REDIRECT_URI) {
      buildTimeOverrides.redirectUri =
        process.env.REACT_APP_GITHUB_REDIRECT_URI;
    }
    if (process.env.REACT_APP_BACKEND_URL) {
      buildTimeOverrides.backendUrl = process.env.REACT_APP_BACKEND_URL;
    }
  }

  // Merge config with build-time overrides
  const finalConfig = { ...config, ...buildTimeOverrides };

  console.log(`AuthConfig: Using ${environment} environment`, finalConfig);
  return finalConfig;
}

// Export individual configs for direct access if needed
export { AUTH_CONFIG as default };
