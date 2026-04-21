"use server";

import { and, eq, max } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { QUADRANTS, tags, tasks, taskTags } from "@/db/schema";

// ---------- Validation ----------

const quadrantSchema = z.enum(QUADRANTS);

const createTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(200),
	notes: z.string().trim().max(2000).optional().nullable(),
	quadrant: quadrantSchema,
	tagIds: z.array(z.string()).optional().default([]),
});

const updateTaskSchema = z.object({
	id: z.string().min(1),
	title: z.string().trim().min(1).max(200),
	notes: z.string().trim().max(2000).optional().nullable(),
	quadrant: quadrantSchema,
	tagIds: z.array(z.string()).optional().default([]),
});

const moveTaskSchema = z.object({
	id: z.string().min(1),
	quadrant: quadrantSchema,
});

const toggleTaskSchema = z.object({
	id: z.string().min(1),
	completed: z.boolean(),
});

const deleteTaskSchema = z.object({
	id: z.string().min(1),
});

const createTagSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(50),
	color: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, "Color must be hex like #a1b2c3")
		.default("#64748b"),
});

const deleteTagSchema = z.object({
	id: z.string().min(1),
});

// ---------- Helpers ----------

async function nextPosition(quadrant: string): Promise<number> {
	const row = await db
		.select({ max: max(tasks.position) })
		.from(tasks)
		.where(eq(tasks.quadrant, quadrant as (typeof QUADRANTS)[number]))
		.get();
	return (row?.max ?? -1) + 1;
}

function bumpUpdatedAt() {
	return { updatedAt: new Date() };
}

async function syncTaskTags(taskId: string, tagIds: string[]) {
	await db.delete(taskTags).where(eq(taskTags.taskId, taskId));
	if (tagIds.length === 0) return;
	await db
		.insert(taskTags)
		.values(tagIds.map((tagId) => ({ taskId, tagId })))
		.run();
}

function done() {
	revalidatePath("/");
}

// ---------- Tasks ----------

export async function createTask(input: z.input<typeof createTaskSchema>) {
	const data = createTaskSchema.parse(input);
	const id = nanoid(12);
	const position = await nextPosition(data.quadrant);

	db.insert(tasks)
		.values({
			id,
			title: data.title,
			notes: data.notes ?? null,
			quadrant: data.quadrant,
			position,
		})
		.run();

	if (data.tagIds.length > 0) {
		await syncTaskTags(id, data.tagIds);
	}

	done();
	return { id };
}

export async function updateTask(input: z.input<typeof updateTaskSchema>) {
	const data = updateTaskSchema.parse(input);

	db.update(tasks)
		.set({
			title: data.title,
			notes: data.notes ?? null,
			quadrant: data.quadrant,
			...bumpUpdatedAt(),
		})
		.where(eq(tasks.id, data.id))
		.run();

	await syncTaskTags(data.id, data.tagIds);
	done();
}

export async function moveTask(input: z.input<typeof moveTaskSchema>) {
	const data = moveTaskSchema.parse(input);
	const position = await nextPosition(data.quadrant);

	db.update(tasks)
		.set({
			quadrant: data.quadrant,
			position,
			...bumpUpdatedAt(),
		})
		.where(eq(tasks.id, data.id))
		.run();

	done();
}

export async function toggleTaskCompleted(
	input: z.input<typeof toggleTaskSchema>,
) {
	const data = toggleTaskSchema.parse(input);
	db.update(tasks)
		.set({ completed: data.completed, ...bumpUpdatedAt() })
		.where(eq(tasks.id, data.id))
		.run();
	done();
}

export async function deleteTask(input: z.input<typeof deleteTaskSchema>) {
	const data = deleteTaskSchema.parse(input);
	db.delete(tasks).where(eq(tasks.id, data.id)).run();
	done();
}

// ---------- Tags ----------

export async function createTag(input: z.input<typeof createTagSchema>) {
	const data = createTagSchema.parse(input);
	const id = nanoid(10);
	db.insert(tags).values({ id, name: data.name, color: data.color }).run();
	done();
	return { id };
}

export async function deleteTag(input: z.input<typeof deleteTagSchema>) {
	const data = deleteTagSchema.parse(input);
	db.delete(tags).where(eq(tags.id, data.id)).run();
	done();
}

// ---------- Bulk helpers (used by seed / cleanup) ----------

export async function clearCompletedInQuadrant(
	input: z.input<typeof quadrantSchema>,
) {
	const quadrant = quadrantSchema.parse(input);
	db.delete(tasks)
		.where(and(eq(tasks.quadrant, quadrant), eq(tasks.completed, true)))
		.run();
	done();
}
