"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTask, updateTask } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QUADRANTS, type Quadrant, type Tag } from "@/db/schema";
import { QUADRANT_CONFIG } from "@/lib/quadrant";
import { cn } from "@/lib/utils";

const formSchema = z.object({
	title: z.string().trim().min(1, "Không được bỏ trống").max(200),
	notes: z.string().trim().max(2000).optional().or(z.literal("")),
	quadrant: z.enum(QUADRANTS),
	tagIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

type EditingTask = {
	id: string;
	title: string;
	notes: string | null;
	quadrant: Quadrant;
	tagIds: string[];
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tags: Tag[];
	/** If provided, we're editing; otherwise we're creating. */
	task?: EditingTask | null;
	/** Default quadrant when creating (e.g. the quadrant the "+" button belongs to). */
	defaultQuadrant?: Quadrant;
};

export function TaskFormDialog({
	open,
	onOpenChange,
	tags,
	task,
	defaultQuadrant,
}: Props) {
	const isEditing = !!task;
	const [isPending, startTransition] = useTransition();
	const titleId = useId();
	const notesId = useId();
	const quadrantId = useId();

	const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
		task?.tagIds ?? [],
	);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: task?.title ?? "",
			notes: task?.notes ?? "",
			quadrant: task?.quadrant ?? defaultQuadrant ?? "Q1",
			tagIds: task?.tagIds ?? [],
		},
	});

	const currentQuadrant = watch("quadrant");

	// When dialog opens with new props, sync form state.
	useEffect(() => {
		if (open) {
			reset({
				title: task?.title ?? "",
				notes: task?.notes ?? "",
				quadrant: task?.quadrant ?? defaultQuadrant ?? "Q1",
				tagIds: task?.tagIds ?? [],
			});
			setSelectedTagIds(task?.tagIds ?? []);
		}
	}, [open, task, defaultQuadrant, reset]);

	function toggleTag(tagId: string) {
		setSelectedTagIds((prev) => {
			const next = prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId];
			setValue("tagIds", next);
			return next;
		});
	}

	function onSubmit(values: FormValues) {
		startTransition(async () => {
			try {
				const payload = {
					title: values.title,
					notes: values.notes?.length ? values.notes : null,
					quadrant: values.quadrant,
					tagIds: selectedTagIds,
				};
				if (isEditing && task) {
					await updateTask({ id: task.id, ...payload });
					toast.success("Đã cập nhật task");
				} else {
					await createTask(payload);
					toast.success("Đã tạo task");
				}
				onOpenChange(false);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
				toast.error(message);
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Sửa task" : "Tạo task mới"}</DialogTitle>
					<DialogDescription>
						Chọn đúng quadrant theo mức độ khẩn cấp và quan trọng.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
					noValidate
				>
					<div className="space-y-2">
						<Label htmlFor={titleId}>Tiêu đề</Label>
						<Input
							id={titleId}
							placeholder="Ví dụ: Chuẩn bị slide cho họp 9h"
							autoFocus
							{...register("title")}
						/>
						{errors.title && (
							<p className="text-xs text-destructive">{errors.title.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={notesId}>Ghi chú</Label>
						<Textarea
							id={notesId}
							rows={3}
							placeholder="Mô tả chi tiết (không bắt buộc)"
							{...register("notes")}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={quadrantId}>Quadrant</Label>
						<Select
							value={currentQuadrant}
							onValueChange={(v) =>
								setValue("quadrant", v as Quadrant, { shouldDirty: true })
							}
						>
							<SelectTrigger id={quadrantId}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{QUADRANTS.map((q) => {
									const cfg = QUADRANT_CONFIG[q];
									return (
										<SelectItem key={q} value={q}>
											<span className={cn("font-medium", cfg.accentText)}>
												{cfg.verb}
											</span>
											<span className="text-muted-foreground ml-2">
												· {cfg.label}
											</span>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>

					{tags.length > 0 && (
						<div className="space-y-2">
							<Label>Tags</Label>
							<div className="flex flex-wrap gap-2">
								{tags.map((tag) => {
									const active = selectedTagIds.includes(tag.id);
									return (
										<button
											key={tag.id}
											type="button"
											onClick={() => toggleTag(tag.id)}
											className={cn(
												"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition",
												active
													? "border-foreground/40 bg-foreground/10"
													: "border-border hover:bg-accent",
											)}
										>
											<span
												className="size-2 rounded-full"
												style={{ backgroundColor: tag.color }}
												aria-hidden
											/>
											{tag.name}
										</button>
									);
								})}
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending
								? "Đang lưu..."
								: isEditing
									? "Lưu thay đổi"
									: "Tạo task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
