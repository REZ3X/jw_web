/**
 * @file constants.js — Shared constants for the JogjaWaskita platform.
 */

/** Department metadata */
export const DEPARTMENTS = {
  city_major_gov: {
    label: "Pemerintah Kota",
    short: "Pemkot",
    color: "bg-blue-500/10 text-blue-400",
    dotColor: "bg-blue-400",
    description: "Isu umum kota, infrastruktur jalan, masalah antar dinas",
  },
  fire_department: {
    label: "Pemadam Kebakaran",
    short: "Damkar",
    color: "bg-orange-500/10 text-orange-400",
    dotColor: "bg-orange-400",
    description: "Darurat kebakaran, hidran, keselamatan kebakaran",
  },
  health_department: {
    label: "Dinas Kesehatan",
    short: "Dinkes",
    color: "bg-emerald-500/10 text-emerald-400",
    dotColor: "bg-emerald-400",
    description: "Rumah sakit, klinik, masalah kesehatan masyarakat",
  },
  environment_department: {
    label: "Dinas Lingkungan Hidup",
    short: "DLH",
    color: "bg-green-500/10 text-green-400",
    dotColor: "bg-green-400",
    description: "Polusi, sampah, masalah lingkungan",
  },
  police_department: {
    label: "Kepolisian",
    short: "Polisi",
    color: "bg-indigo-500/10 text-indigo-400",
    dotColor: "bg-indigo-400",
    description: "Kriminalitas, masalah keamanan",
  },
};

/** Role display names and badge colors */
export const ROLES = {
  basic:                    { label: "Warga",        color: "bg-bg-elevated text-text-secondary" },
  city_major_gov:           { label: "Pemkot",color: "bg-blue-500/10 text-blue-400" },
  fire_department:          { label: "Damkar",      color: "bg-orange-500/10 text-orange-400" },
  health_department:        { label: "Dinkes",    color: "bg-emerald-500/10 text-emerald-400" },
  environment_department:   { label: "DLH",    color: "bg-green-500/10 text-green-400" },
  police_department:        { label: "Polisi",    color: "bg-indigo-500/10 text-indigo-400" },
  dev:                      { label: "Developer",      color: "bg-purple-500/10 text-purple-400" },
};

/** Post status metadata */
export const POST_STATUS = {
  pending:      { label: "Menunggu",     color: "bg-amber-500/10 text-amber-400",   dotColor: "bg-amber-400" },
  in_progress:  { label: "Diproses", color: "bg-blue-500/10 text-blue-400",     dotColor: "bg-blue-400" },
  closed:       { label: "Selesai",    color: "bg-emerald-500/10 text-emerald-400",dotColor: "bg-emerald-400" },
};

/** Sort options for posts feed */
export const POST_SORT_OPTIONS = [
  { value: "recent", label: "Terbaru" },
  { value: "most_upvoted", label: "Paling Banyak Upvote" },
  { value: "most_discussed", label: "Paling Rame" },
];

/** Sort options for comments */
export const COMMENT_SORT_OPTIONS = [
  { value: "recent", label: "Terbaru" },
  { value: "most_upvote", label: "Paling Banyak Upvote" },
  { value: "most_downvote", label: "Paling Banyak Downvote" },
  { value: "popular", label: "Paling Populer" },
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
