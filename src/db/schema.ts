import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

/**
 * Eisenhower matrix quadrants.
 * Q1 = urgent + important (Do)
 * Q2 = not urgent + important (Schedule)
 * Q3 = urgent + not important (Delegate)
 * Q4 = not urgent + not important (Delete)
 */
export const QUADRANTS = ["Q1", "Q2", "Q3", "Q4"] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export const tasks = sqliteTable(
	"tasks",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		notes: text("notes"),
		quadrant: text("quadrant", { enum: QUADRANTS }).notNull(),
		/** Order within the quadrant. Lower = earlier. */
		position: integer("position").notNull().default(0),
		completed: integer("completed", { mode: "boolean" })
			.notNull()
			.default(false),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [index("tasks_quadrant_idx").on(t.quadrant, t.position)],
);

export const tags = sqliteTable("tags", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	color: text("color").notNull().default("#64748b"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const taskTags = sqliteTable(
	"task_tags",
	{
		taskId: text("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.taskId, t.tagId] })],
);

export const tasksRelations = relations(tasks, ({ many }) => ({
	taskTags: many(taskTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	taskTags: many(taskTags),
}));

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
	task: one(tasks, { fields: [taskTags.taskId], references: [tasks.id] }),
	tag: one(tags, { fields: [taskTags.tagId], references: [tags.id] }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
