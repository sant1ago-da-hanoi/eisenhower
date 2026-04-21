import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { type Quadrant, tags, tasks, taskTags } from "./schema";

export type TaskWithTags = Awaited<ReturnType<typeof getAllTasks>>[number];

/** Fetch every task, eagerly hydrating tags, sorted by quadrant position. */
export async function getAllTasks() {
	const rows = await db.query.tasks.findMany({
		orderBy: [asc(tasks.quadrant), asc(tasks.position), desc(tasks.createdAt)],
		with: {
			taskTags: {
				with: { tag: true },
			},
		},
	});

	return rows.map((row) => ({
		id: row.id,
		title: row.title,
		notes: row.notes,
		quadrant: row.quadrant,
		position: row.position,
		completed: row.completed,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		tags: row.taskTags.map((tt) => tt.tag),
	}));
}

export async function getTasksByQuadrant(quadrant: Quadrant) {
	const all = await getAllTasks();
	return all.filter((t) => t.quadrant === quadrant);
}

export async function getAllTags() {
	return db.select().from(tags).orderBy(asc(tags.name)).all();
}

export async function getTaskTagIds(taskId: string) {
	const rows = await db
		.select({ tagId: taskTags.tagId })
		.from(taskTags)
		.where(eq(taskTags.taskId, taskId))
		.all();
	return rows.map((r) => r.tagId);
}
