"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import type { TaskWithTags } from "@/db/queries";
import type { Quadrant } from "@/db/schema";
import { QUADRANT_CONFIG } from "@/lib/quadrant";
import { cn } from "@/lib/utils";

type Props = {
	quadrant: Quadrant;
	tasks: TaskWithTags[];
	onCreate: (quadrant: Quadrant) => void;
	onEdit: (task: TaskWithTags) => void;
};

export function QuadrantColumn({ quadrant, tasks, onCreate, onEdit }: Props) {
	const cfg = QUADRANT_CONFIG[quadrant];
	const { setNodeRef, isOver } = useDroppable({
		id: quadrant,
		data: { type: "quadrant", quadrant },
	});

	const activeTasks = tasks.filter((t) => !t.completed);
	const doneCount = tasks.length - activeTasks.length;

	return (
		<section
			ref={setNodeRef}
			className={cn(
				"flex min-h-[200px] flex-col rounded-xl border-2 p-2 transition sm:min-h-[260px] sm:p-3",
				cfg.accent,
				cfg.accentBorder,
				isOver &&
					"ring-2 ring-foreground/30 ring-offset-2 ring-offset-background",
			)}
		>
			<header className="mb-2 flex items-start justify-between gap-1 sm:mb-3 sm:gap-2">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-x-2">
						<h2
							className={cn(
								"text-xs font-bold uppercase tracking-wide sm:text-sm",
								cfg.accentText,
							)}
						>
							{cfg.verb}
						</h2>
						<span className="text-xs text-muted-foreground">
							· {tasks.length}
							{doneCount > 0 && (
								<span className="ml-1 text-muted-foreground/70">
									({doneCount} done)
								</span>
							)}
						</span>
					</div>
					<p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
						{cfg.tagline}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					className="shrink-0"
					onClick={() => onCreate(quadrant)}
					aria-label={`Thêm task vào ${cfg.verb}`}
				>
					<Plus className="size-4" />
				</Button>
			</header>

			<SortableContext
				items={tasks.map((t) => t.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="flex flex-1 flex-col gap-1.5 sm:gap-2">
					{tasks.length === 0 ? (
						<Button
							variant="ghost"
							onClick={() => onCreate(quadrant)}
							className="flex h-auto flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 bg-transparent px-2 py-4 text-center text-[11px] font-normal leading-tight text-muted-foreground hover:border-foreground/40 hover:bg-transparent hover:text-foreground sm:py-6 sm:text-xs"
						>
							<span className="hidden sm:inline">
								Kéo task vào đây hoặc + để tạo mới
							</span>
							<span className="sm:hidden">+ để tạo</span>
						</Button>
					) : (
						tasks.map((task) => (
							<TaskCard key={task.id} task={task} onEdit={() => onEdit(task)} />
						))
					)}
				</div>
			</SortableContext>
		</section>
	);
}
