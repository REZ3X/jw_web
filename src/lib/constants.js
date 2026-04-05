/**
 * @file constants.js — Shared constants for the JogjaWaskita platform.
 *
 * Centralises department labels, role display names, status badges,
 * color mappings, and sort options used across all UI components.
 */

/** Department metadata: label, color classes, and icon names (Lucide) */
export const DEPARTMENTS = {
  city_major_gov: {
    label: "City Government",
    short: "City Gov",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
    icon: "Building2",
    description: "General city issues, road infrastructure, inter-department concerns",
  },
  fire_department: {
    label: "Fire Department",
    short: "Fire Dept",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dotColor: "bg-orange-500",
    icon: "Flame",
    description: "Fire emergencies, fire hydrants, fire safety",
  },
  health_department: {
    label: "Health Department",
    short: "Health Dept",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    icon: "Heart",
    description: "Hospitals, clinics, public health concerns",
  },
  environment_department: {
    label: "Environment Department",
    short: "Environment",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    dotColor: "bg-green-500",
    icon: "TreePine",
    description: "Pollution, waste management, environmental issues",
  },
  police_department: {
    label: "Police Department",
    short: "Police Dept",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    dotColor: "bg-indigo-500",
    icon: "Shield",
    description: "Criminal activity, law enforcement issues",
  },
};

/** Role display names and badge colors */
export const ROLES = {
  basic: { label: "Citizen", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  city_major_gov: { label: "City Government", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  fire_department: { label: "Fire Dept", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  health_department: { label: "Health Dept", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  environment_department: { label: "Environment", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  police_department: { label: "Police Dept", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  dev: { label: "Developer", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
};

/** Post status metadata */
export const POST_STATUS = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", dotColor: "bg-amber-500" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", dotColor: "bg-blue-500" },
  closed: { label: "Resolved", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", dotColor: "bg-emerald-500" },
};

/** Sort options for posts feed */
export const POST_SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "most_upvoted", label: "Most Upvoted" },
  { value: "most_discussed", label: "Most Discussed" },
];

/** Sort options for comments */
export const COMMENT_SORT_OPTIONS = [
  { value: "recent", label: "Newest" },
  { value: "most_upvote", label: "Most Upvoted" },
  { value: "most_downvote", label: "Most Downvoted" },
  { value: "popular", label: "Most Popular" },
];

/** Government department keys as array (for filtering) */
export const GOV_ROLES = [
  "city_major_gov",
  "fire_department",
  "health_department",
  "environment_department",
  "police_department",
];

/** All valid roles */
export const ALL_ROLES = ["basic", ...GOV_ROLES, "dev"];
