import type { Quadrant } from "@/db/schema";

export type QuadrantConfig = {
	id: Quadrant;
	label: string;
	verb: string;
	tagline: string;
	urgent: boolean | null;
	important: boolean | null;
	accent: string;
	accentBorder: string;
	accentText: string;
};

export const QUADRANT_CONFIG: Record<Quadrant, QuadrantConfig> = {
	BACKLOG: {
		id: "BACKLOG",
		label: "Backlog",
		verb: "Capture",
		tagline: "Ghi nhanh — chưa phân loại, kéo lên matrix khi sẵn sàng",
		urgent: null,
		important: null,
		accent: "bg-muted/40 dark:bg-muted/20",
		accentBorder: "border-border",
		accentText: "text-muted-foreground",
	},
	Q1: {
		id: "Q1",
		label: "Urgent & Important",
		verb: "Do",
		tagline: "Làm ngay — khủng hoảng, deadline cận kề",
		urgent: true,
		important: true,
		accent: "bg-red-500/10 dark:bg-red-500/15",
		accentBorder: "border-red-500/40 dark:border-red-500/30",
		accentText: "text-red-600 dark:text-red-400",
	},
	Q2: {
		id: "Q2",
		label: "Not Urgent & Important",
		verb: "Schedule",
		tagline: "Lên lịch — mục tiêu dài hạn, phát triển",
		urgent: false,
		important: true,
		accent: "bg-emerald-500/10 dark:bg-emerald-500/15",
		accentBorder: "border-emerald-500/40 dark:border-emerald-500/30",
		accentText: "text-emerald-600 dark:text-emerald-400",
	},
	Q3: {
		id: "Q3",
		label: "Urgent & Not Important",
		verb: "Delegate",
		tagline: "Giao việc — gián đoạn, họp không cần thiết",
		urgent: true,
		important: false,
		accent: "bg-amber-500/10 dark:bg-amber-500/15",
		accentBorder: "border-amber-500/40 dark:border-amber-500/30",
		accentText: "text-amber-600 dark:text-amber-400",
	},
	Q4: {
		id: "Q4",
		label: "Not Urgent & Not Important",
		verb: "Delete",
		tagline: "Loại bỏ — xao lãng, lãng phí thời gian",
		urgent: false,
		important: false,
		accent: "bg-slate-500/10 dark:bg-slate-500/15",
		accentBorder: "border-slate-500/40 dark:border-slate-500/30",
		accentText: "text-slate-600 dark:text-slate-400",
	},
};

/** Order for rendering the 2×2 matrix (excludes BACKLOG). */
export const QUADRANT_ORDER: Array<"Q1" | "Q2" | "Q3" | "Q4"> = [
	"Q1",
	"Q2",
	"Q3",
	"Q4",
];
