/**
 * @file constants.js — Shared constants for the JogjaWaskita platform.
 */

/** Department metadata */
export const DEPARTMENTS = {
  city_major_gov: {
    label: "City Government",
    short: "City Gov",
    color: "bg-blue-500/10 text-blue-400",
    dotColor: "bg-blue-400",
    description: "General city issues, road infrastructure, inter-department concerns",
  },
  fire_department: {
    label: "Fire Department",
    short: "Fire Dept",
    color: "bg-orange-500/10 text-orange-400",
    dotColor: "bg-orange-400",
    description: "Fire emergencies, fire hydrants, fire safety",
  },
  health_department: {
    label: "Health Department",
    short: "Health Dept",
    color: "bg-emerald-500/10 text-emerald-400",
    dotColor: "bg-emerald-400",
    description: "Hospitals, clinics, public health concerns",
  },
  environment_department: {
    label: "Environment Department",
    short: "Environment",
    color: "bg-green-500/10 text-green-400",
    dotColor: "bg-green-400",
    description: "Pollution, waste management, environmental issues",
  },
  police_department: {
    label: "Police Department",
    short: "Police Dept",
    color: "bg-indigo-500/10 text-indigo-400",
    dotColor: "bg-indigo-400",
    description: "Criminal activity, law enforcement issues",
  },
};

/** Role display names and badge colors */
export const ROLES = {
  basic:                    { label: "Citizen",        color: "bg-bg-elevated text-text-secondary" },
  city_major_gov:           { label: "City Government",color: "bg-blue-500/10 text-blue-400" },
  fire_department:          { label: "Fire Dept",      color: "bg-orange-500/10 text-orange-400" },
  health_department:        { label: "Health Dept",    color: "bg-emerald-500/10 text-emerald-400" },
  environment_department:   { label: "Environment",    color: "bg-green-500/10 text-green-400" },
  police_department:        { label: "Police Dept",    color: "bg-indigo-500/10 text-indigo-400" },
  dev:                      { label: "Developer",      color: "bg-purple-500/10 text-purple-400" },
};

/** Post status metadata */
export const POST_STATUS = {
  pending:      { label: "Pending",     color: "bg-amber-500/10 text-amber-400",   dotColor: "bg-amber-400" },
  in_progress:  { label: "In Progress", color: "bg-blue-500/10 text-blue-400",     dotColor: "bg-blue-400" },
  closed:       { label: "Resolved",    color: "bg-emerald-500/10 text-emerald-400",dotColor: "bg-emerald-400" },
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
