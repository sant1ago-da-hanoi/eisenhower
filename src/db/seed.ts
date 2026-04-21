import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "./schema";
import { tags, tasks, taskTags } from "./schema";

const DB_PATH = process.env.DATABASE_URL ?? "./data/app.db";

mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function main() {
	console.log("🌱 Seeding...");

	db.delete(taskTags).run();
	db.delete(tasks).run();
	db.delete(tags).run();

	const tagDefs = [
		{ id: nanoid(10), name: "work", color: "#3b82f6" },
		{ id: nanoid(10), name: "personal", color: "#22c55e" },
		{ id: nanoid(10), name: "health", color: "#ef4444" },
	];
	db.insert(tags).values(tagDefs).run();

	const taskDefs = [
		// Backlog — chưa phân loại
		{
			title: "Ý tưởng: viết blog về productivity",
			quadrant: "BACKLOG" as const,
			tagIdxs: [1],
		},
		{
			title: "Research tool mới cho team",
			quadrant: "BACKLOG" as const,
			tagIdxs: [0],
		},
		{
			title: "Refactor module auth — lúc nào rảnh",
			quadrant: "BACKLOG" as const,
			tagIdxs: [0],
		},
		// Q1 — Do
		{
			title: "Fix production bug đang ảnh hưởng khách hàng",
			notes: "Logs cho thấy lỗi timeout ở checkout API.",
			quadrant: "Q1" as const,
			tagIdxs: [0],
		},
		{
			title: "Gửi proposal cho khách hàng, deadline hôm nay",
			quadrant: "Q1" as const,
			tagIdxs: [0],
		},
		// Q2 — Schedule
		{
			title: "Tập gym 3 buổi/tuần",
			notes: "Mục tiêu dài hạn, cần duy trì.",
			quadrant: "Q2" as const,
			tagIdxs: [2],
		},
		{
			title: "Đọc sách 'Deep Work' — 30 phút mỗi tối",
			quadrant: "Q2" as const,
			tagIdxs: [1],
		},
		{
			title: "Lên plan học tiếng Anh cho Q3",
			quadrant: "Q2" as const,
			tagIdxs: [1],
		},
		// Q3 — Delegate
		{
			title: "Họp standup sáng mai lúc 9h",
			notes: "Có thể nhờ team member khác tham gia thay.",
			quadrant: "Q3" as const,
			tagIdxs: [0],
		},
		{
			title: "Trả lời email không quan trọng",
			quadrant: "Q3" as const,
			tagIdxs: [0],
		},
		// Q4 — Delete
		{
			title: "Lướt TikTok vô bổ",
			quadrant: "Q4" as const,
			tagIdxs: [1],
		},
		{
			title: "Xem lại tin nhắn group chat không cần thiết",
			quadrant: "Q4" as const,
			tagIdxs: [],
		},
	];

	taskDefs.forEach((t, idx) => {
		const id = nanoid(12);
		db.insert(tasks)
			.values({
				id,
				title: t.title,
				notes: t.notes ?? null,
				quadrant: t.quadrant,
				position: idx,
			})
			.run();
		t.tagIdxs.forEach((i) => {
			const tag = tagDefs[i];
			if (!tag) return;
			db.insert(taskTags).values({ taskId: id, tagId: tag.id }).run();
		});
	});

	console.log(`✓ Seeded ${taskDefs.length} tasks, ${tagDefs.length} tags`);
	sqlite.close();
}

main().catch((err) => {
	console.error(err);
	sqlite.close();
	process.exit(1);
});
