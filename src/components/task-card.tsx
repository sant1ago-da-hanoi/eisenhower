"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTask, toggleTaskCompleted } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
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

/** Visual-only card, used by both the sortable wrapper and DragOverlay. */
export function TaskCardView({
	task,
	dragging = false,
	overlay = false,
	onToggle,
	onEdit,
	onDelete,
	dragHandleProps,
}: {
	task: TaskWithTags;
	dragging?: boolean;
	overlay?: boolean;
	onToggle?: (checked: boolean) => void;
	onEdit?: () => void;
	onDelete?: () => void;
	dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
	return (
		<div
			className={cn(
				"group/card relative rounded-lg border bg-card p-3 shadow-sm transition-shadow",
				!overlay && "hover:border-foreground/30",
				task.completed && !overlay && "opacity-60",
				overlay && "cursor-grabbing shadow-2xl ring-2 ring-foreground/30",
			)}
		>
			<div className="flex items-start gap-2">
				<Checkbox
					checked={task.completed}
					onCheckedChange={(v) => onToggle?.(v === true)}
					className="mt-0.5"
					aria-label="Đánh dấu hoàn thành"
					disabled={overlay || dragging}
				/>

				<Button
					variant="ghost"
					className={cn(
						"block h-auto min-w-0 flex-1 flex-col items-stretch justify-start whitespace-normal rounded-none bg-transparent px-0 py-0 text-left font-normal hover:bg-transparent",
						overlay
							? "!cursor-grabbing"
							: "!cursor-grab touch-none active:!cursor-grabbing",
					)}
					{...dragHandleProps}
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
				</Button>

				{!overlay && (
					<DropdownMenu>
						<DropdownMenuTrigger
							aria-label="Mở menu"
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon-sm" }),
								"shrink-0 opacity-0 group-hover/card:opacity-100 aria-expanded:opacity-100",
							)}
						>
							<MoreHorizontal className="size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onEdit}>
								<Pencil className="mr-2 size-4" />
								Sửa
							</DropdownMenuItem>
							<DropdownMenuItem variant="destructive" onClick={onDelete}>
								<Trash2 className="mr-2 size-4" />
								Xóa
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</div>
	);
}

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

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		// Hide the original card while its DragOverlay clone follows the cursor,
		// but keep its space reserved so neighbours don't shift around.
		opacity: isDragging ? 0 : 1,
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
			className={cn(isPending && "pointer-events-none opacity-50")}
		>
			<TaskCardView
				task={task}
				dragging={isDragging}
				onToggle={handleToggle}
				onEdit={onEdit}
				onDelete={handleDelete}
				dragHandleProps={{
					...attributes,
					...listeners,
				}}
			/>
		</div>
	);
}
