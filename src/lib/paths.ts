"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns the base path prefix for the application.
 * In production when served under /gov-jobs/, this returns "/gov-jobs".
 * In local development, this returns "".
 */
export function getBasePath(): string {
  // 1. Explicit environment variable if configured
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH) {
    const envBase = process.env.NEXT_PUBLIC_BASE_PATH.trim();
    if (envBase && envBase !== "/") {
      return envBase.replace(/\/+$/, "");
    }
  }

  // 2. In browser runtime, inspect window.location.pathname
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/gov-jobs")) {
      return "/gov-jobs";
    }
    // Generic check for other reverse-proxy subpaths (excluding known local routes and assets)
    const match = pathname.match(/^(\/[^/]+)/);
    if (
      match &&
      match[1] &&
      match[1] !== "/settings" &&
      match[1] !== "/api" &&
      match[1] !== "/_next"
    ) {
      return match[1];
    }
  }

  return "";
}

/**
 * Generates an application URL preserving the deployed subpath prefix.
 * e.g., getAppUrl("/settings") -> "/gov-jobs/settings" (in production)
 *                              -> "/settings" (in local development)
 *       getAppUrl("/")         -> "/gov-jobs/" (in production)
 *                              -> "/" (in local development)
 */
export function getAppUrl(path: string): string {
  const base = getBasePath();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!base) return cleanPath;
  return cleanPath === "/" ? `${base}/` : `${base}${cleanPath}`;
}

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

/**
 * React hook that returns an application URL matching the current deployment prefix,
 * utilizing useSyncExternalStore to subscribe to browser location changes.
 */
export function useAppUrl(path: string): string {
  return useSyncExternalStore(
    subscribe,
    () => getAppUrl(path),
    () => (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH ? getAppUrl(path) : path)
  );
}
