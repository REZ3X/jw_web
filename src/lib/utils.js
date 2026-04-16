/**
 * @file utils.js — Shared utility functions.
 */

import { formatDistanceToNow, format, parseISO, addHours } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DEPARTMENTS, ROLES, POST_STATUS } from "./constants";

/**
 * Merge class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string as a human-readable relative time.
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const parsed = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    const dateWithTimezoneOffset = addHours(parsed, 7);
    return formatDistanceToNow(dateWithTimezoneOffset, { addSuffix: true, locale: idLocale });
  } catch {
    return dateStr;
  }
}

/** Format a date string as a readable date. */
export function formatDate(dateStr, fmt = "d MMM yyyy") {
  if (!dateStr) return "";
  try {
    const parsed = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    const dateWithTimezoneOffset = addHours(parsed, 7);
    return format(dateWithTimezoneOffset, fmt, { locale: idLocale });
  } catch {
    return dateStr;
  }
}

/** Format a date as "d MMM yyyy, HH:mm" */
export function formatDateTime(dateStr) {
  return formatDate(dateStr, "d MMM yyyy, HH:mm");
}

/** Get department display info from a role/department key */
export function getDepartment(key) {
  return DEPARTMENTS[key] || { label: key, color: "bg-gray-100 text-gray-600", dotColor: "bg-gray-400", icon: "HelpCircle" };
}

/** Get role display info */
export function getRole(key) {
  return ROLES[key] || { label: key, color: "bg-gray-100 text-gray-600" };
}

/** Get post status display info */
export function getStatus(key) {
  return POST_STATUS[key] || { label: key, color: "bg-gray-100 text-gray-600", dotColor: "bg-gray-400" };
}

/**
 * Extract #hashtags from caption text.
 * Returns array of tag strings without the '#'.
 */
export function extractTags(text) {
  if (!text) return [];
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.map((t) => t.slice(1)) : [];
}

/**
 * Parse caption text to render inline tags as styled elements.
 * Returns an array of { type: 'text' | 'tag', value: string } segments.
 */
export function parseCaption(caption) {
  if (!caption) return [];
  const parts = caption.split(/(#[\w]+)/g);
  return parts.map((part) => {
    if (part.startsWith("#")) {
      return { type: "tag", value: part.slice(1) };
    }
    return { type: "text", value: part };
  });
}

/** Truncate text with ellipsis */
export function truncate(str, maxLength = 200) {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/** Format a number with K/M suffix for large values */
export function formatCount(num) {
  if (num === undefined || num === null) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

/**
 * Build a URLSearchParams string from an object, omitting null/undefined values.
 */
export function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      qs.set(key, String(val));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}
