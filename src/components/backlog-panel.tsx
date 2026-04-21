"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, Inbox } from "lucide-react";
import { useState } from "react";
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
	const [expanded, setExpanded] = useState(true);
	const { setNodeRef, isOver } = useDroppable({
		id: "BACKLOG",
		data: { type: "quadrant", quadrant: "BACKLOG" },
	});

	const pending = tasks.filter((t) => !t.completed).length;

	return (
		<section
			ref={setNodeRef}
			className={cn(
				"mt-8 rounded-xl border-2 bg-muted/30 transition dark:bg-muted/10",
				isOver
					? "border-foreground/40 ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
					: "border-dashed border-border",
			)}
		>
			<header className="flex items-center justify-between gap-2 px-4 py-3">
				<Button
					variant="ghost"
					onClick={() => setExpanded((v) => !v)}
					className="h-auto justify-start gap-2 bg-transparent px-0 hover:bg-transparent"
				>
					<Inbox className="size-4 text-muted-foreground" />
					<span className="text-sm font-semibold uppercase tracking-wide">
						Backlog
					</span>
					<span className="text-xs font-normal text-muted-foreground">
						· {tasks.length}
						{pending > 0 && tasks.length !== pending && (
							<span> ({pending} chưa xong)</span>
						)}
					</span>
					{pending >= 10 && (
						<span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
							Nhiều quá, phân loại đi!
						</span>
					)}
					<ChevronDown
						className={cn(
							"size-4 text-muted-foreground transition-transform",
							!expanded && "-rotate-90",
						)}
					/>
				</Button>
				<Button variant="outline" size="sm" onClick={onCreate}>
					<span className="font-mono text-xs text-muted-foreground mr-1">
						N
					</span>
					Thêm nhanh
				</Button>
			</header>

			{expanded && (
				<div className="border-t border-border/50 p-3">
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
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
