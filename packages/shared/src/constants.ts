export const CATEGORY_COLORS = {
  "#2563EB": { bg: "#EFF6FF", text: "#2563EB", label: "Blue" },
  "#16A34A": { bg: "#F0FDF4", text: "#16A34A", label: "Green" },
  "#D97706": { bg: "#FFFBEB", text: "#D97706", label: "Amber" },
  "#DC2626": { bg: "#FEF2F2", text: "#DC2626", label: "Red" },
  "#9333EA": { bg: "#FAF5FF", text: "#9333EA", label: "Purple" },
  "#DB2777": { bg: "#FDF2F8", text: "#DB2777", label: "Pink" },
  "#0D9488": { bg: "#F0FDFA", text: "#0D9488", label: "Teal" },
  "#EA580C": { bg: "#FFF7ED", text: "#EA580C", label: "Coral" },
} as const;

export type CategoryColorKey = keyof typeof CATEGORY_COLORS;

export const MAX_CATEGORIES = 10;
