"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import type { TaskWithTags } from "@/db/queries";
import { cn } from "@/lib/utils";

type Props = {
	tasks: TaskWithTags[];
	onEdit: (task: TaskWithTags) => void;
	onCreate: () => void;
};

export function BacklogPanel({ tasks, onEdit, onCreate }: Props) {
	// Expand on desktop by default, collapse on mobile to save scroll space.
	const [expanded, setExpanded] = useState(true);
	useEffect(() => {
		if (window.matchMedia("(max-width: 639px)").matches) {
			setExpanded(false);
		}
	}, []);

	const { setNodeRef, isOver } = useDroppable({
		id: "BACKLOG",
		data: { type: "quadrant", quadrant: "BACKLOG" },
	});

	const pending = tasks.filter((t) => !t.completed).length;

	return (
		<section
			ref={setNodeRef}
			className={cn(
				"mt-6 rounded-xl border-2 bg-muted/30 transition sm:mt-8 dark:bg-muted/10",
				isOver
					? "border-foreground/40 ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
					: "border-dashed border-border",
			)}
		>
			<header className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
				<Button
					variant="ghost"
					onClick={() => setExpanded((v) => !v)}
					className="h-auto min-w-0 justify-start gap-2 bg-transparent px-0 hover:bg-transparent"
				>
					<Inbox className="size-4 shrink-0 text-muted-foreground" />
					<span className="text-xs font-semibold uppercase tracking-wide sm:text-sm">
						Backlog
					</span>
					<span className="text-xs font-normal text-muted-foreground">
						· {tasks.length}
						{pending > 0 && tasks.length !== pending && (
							<span className="hidden sm:inline"> ({pending} chưa xong)</span>
						)}
					</span>
					{pending >= 10 && (
						<span className="hidden rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-700 sm:inline dark:text-amber-400">
							Nhiều quá, phân loại đi!
						</span>
					)}
					<ChevronDown
						className={cn(
							"size-4 shrink-0 text-muted-foreground transition-transform",
							!expanded && "-rotate-90",
						)}
					/>
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onCreate}
					className="shrink-0"
				>
					<span className="mr-1 hidden font-mono text-xs text-muted-foreground sm:inline">
						N
					</span>
					<span className="hidden sm:inline">Thêm nhanh</span>
					<span className="sm:hidden">+</span>
				</Button>
			</header>

			{expanded && (
				<div className="border-t border-border/50 p-2 sm:p-3">
					<SortableContext
						items={tasks.map((t) => t.id)}
						strategy={verticalListSortingStrategy}
					>
						{tasks.length === 0 ? (
							<p className="flex min-h-16 items-center justify-center rounded-lg border border-dashed border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
								Chưa có task nào. Nhấn{" "}
								<kbd className="mx-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
									N
								</kbd>{" "}
								để thêm nhanh.
							</p>
						) : (
							<div className="grid gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3">
								{tasks.map((task) => (
									<TaskCard
										key={task.id}
										task={task}
										onEdit={() => onEdit(task)}
									/>
								))}
							</div>
						)}
					</SortableContext>
				</div>
			)}
		</section>
	);
}
