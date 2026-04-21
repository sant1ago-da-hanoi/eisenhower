"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTask, toggleTaskCompleted } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskWithTags } from "@/db/queries";
import { cn } from "@/lib/utils";

type Props = {
	task: TaskWithTags;
	onEdit: () => void;
};

export function TaskCard({ task, onEdit }: Props) {
	const [isPending, startTransition] = useTransition();

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: { type: "task", quadrant: task.quadrant },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	function handleToggle(checked: boolean) {
		startTransition(async () => {
			try {
				await toggleTaskCompleted({ id: task.id, completed: checked });
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
			}
		});
	}

	function handleDelete() {
		startTransition(async () => {
			try {
				await deleteTask({ id: task.id });
				toast.success("Đã xóa task");
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
			}
		});
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"group/card relative rounded-lg border bg-card p-3 shadow-sm transition",
				"hover:border-foreground/30",
				isDragging && "opacity-60 shadow-lg ring-2 ring-foreground/20",
				task.completed && "opacity-60",
				isPending && "pointer-events-none opacity-50",
			)}
		>
			<div className="flex items-start gap-2">
				<Checkbox
					checked={task.completed}
					onCheckedChange={(v) => handleToggle(v === true)}
					className="mt-0.5"
					aria-label="Đánh dấu hoàn thành"
				/>

				{/* Drag handle area — the text */}
				<button
					type="button"
					className="min-w-0 flex-1 cursor-grab text-left active:cursor-grabbing"
					{...attributes}
					{...listeners}
				>
					<p
						className={cn(
							"text-sm font-medium leading-snug break-words",
							task.completed && "line-through",
						)}
					>
						{task.title}
					</p>
					{task.notes && (
						<p className="mt-1 line-clamp-2 text-xs text-muted-foreground break-words">
							{task.notes}
						</p>
					)}
					{task.tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1">
							{task.tags.map((tag) => (
								<span
									key={tag.id}
									className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground"
								>
									<span
										className="size-1.5 rounded-full"
										style={{ backgroundColor: tag.color }}
										aria-hidden
									/>
									{tag.name}
								</span>
							))}
						</div>
					)}
				</button>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="size-7 shrink-0 opacity-0 group-hover/card:opacity-100 data-[state=open]:opacity-100"
								aria-label="Mở menu"
							>
								<MoreHorizontal className="size-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onSelect={onEdit}>
							<Pencil className="mr-2 size-4" />
							Sửa
						</DropdownMenuItem>
						<DropdownMenuItem variant="destructive" onSelect={handleDelete}>
							<Trash2 className="mr-2 size-4" />
							Xóa
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
