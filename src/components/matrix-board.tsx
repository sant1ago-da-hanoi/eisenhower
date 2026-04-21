"use client";

import {
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { moveTask } from "@/app/actions";
import { QuadrantColumn } from "@/components/quadrant-column";
import { TaskFormDialog } from "@/components/task-form-dialog";
import type { TaskWithTags } from "@/db/queries";
import type { Quadrant, Tag } from "@/db/schema";
import { QUADRANT_CONFIG, QUADRANT_ORDER } from "@/lib/quadrant";

type Props = {
	tasks: TaskWithTags[];
	tags: Tag[];
};

type OptimisticAction = { type: "move"; taskId: string; quadrant: Quadrant };

export function MatrixBoard({ tasks, tags }: Props) {
	const [optimisticTasks, applyOptimistic] = useOptimistic(
		tasks,
		(state, action: OptimisticAction) => {
			if (action.type === "move") {
				return state.map((t) =>
					t.id === action.taskId ? { ...t, quadrant: action.quadrant } : t,
				);
			}
			return state;
		},
	);
	const [, startTransition] = useTransition();

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null);
	const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant>("Q1");

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	);

	function handleCreate(quadrant: Quadrant) {
		setEditingTask(null);
		setDefaultQuadrant(quadrant);
		setDialogOpen(true);
	}

	function handleEdit(task: TaskWithTags) {
		setEditingTask(task);
		setDialogOpen(true);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over) return;

		// `over.id` can be a quadrant id or another task id.
		const overData = over.data.current as
			| { type: "quadrant"; quadrant: Quadrant }
			| { type: "task"; quadrant: Quadrant }
			| undefined;

		const targetQuadrant = overData?.quadrant;
		if (!targetQuadrant) return;

		const activeTask = optimisticTasks.find((t) => t.id === active.id);
		if (!activeTask || activeTask.quadrant === targetQuadrant) return;

		startTransition(async () => {
			applyOptimistic({
				type: "move",
				taskId: String(active.id),
				quadrant: targetQuadrant,
			});
			try {
				await moveTask({
					id: String(active.id),
					quadrant: targetQuadrant,
				});
				toast.success(`→ ${QUADRANT_CONFIG[targetQuadrant].verb}`, {
					duration: 1500,
				});
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Không di chuyển được",
				);
			}
		});
	}

	return (
		<>
			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<div className="grid gap-3 md:grid-cols-2 md:gap-4">
					{QUADRANT_ORDER.map((q) => (
						<QuadrantColumn
							key={q}
							quadrant={q}
							tasks={optimisticTasks.filter((t) => t.quadrant === q)}
							onCreate={handleCreate}
							onEdit={handleEdit}
						/>
					))}
				</div>
			</DndContext>

			<TaskFormDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				tags={tags}
				task={
					editingTask
						? {
								id: editingTask.id,
								title: editingTask.title,
								notes: editingTask.notes,
								quadrant: editingTask.quadrant,
								tagIds: editingTask.tags.map((t) => t.id),
							}
						: null
				}
				defaultQuadrant={defaultQuadrant}
			/>
		</>
	);
}
