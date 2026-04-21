"use client";

import { Tag as TagIcon, Trash2 } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { createTag, deleteTag } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tag } from "@/db/schema";

const DEFAULT_COLORS = [
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#06b6d4",
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
	"#64748b",
];

type Props = {
	tags: Tag[];
};

export function TagManager({ tags }: Props) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [color, setColor] = useState(DEFAULT_COLORS[0] ?? "#64748b");
	const [isPending, startTransition] = useTransition();
	const nameId = useId();

	function handleCreate() {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error("Nhập tên tag");
			return;
		}
		startTransition(async () => {
			try {
				await createTag({ name: trimmed, color });
				setName("");
				toast.success("Đã tạo tag");
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
			}
		});
	}

	function handleDelete(id: string) {
		startTransition(async () => {
			try {
				await deleteTag({ id });
				toast.success("Đã xóa tag");
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="outline" size="sm">
						<TagIcon className="mr-1.5 size-3.5" />
						Tags ({tags.length})
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Quản lý tags</DialogTitle>
					<DialogDescription>
						Tạo nhãn để phân loại task theo dự án hoặc ngữ cảnh.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={nameId}>Tên tag mới</Label>
						<div className="flex gap-2">
							<Input
								id={nameId}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="work, personal, urgent..."
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleCreate();
									}
								}}
							/>
							<Button onClick={handleCreate} disabled={isPending}>
								Tạo
							</Button>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{DEFAULT_COLORS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setColor(c)}
									className="size-6 rounded-full border-2 transition"
									style={{
										backgroundColor: c,
										borderColor:
											color === c ? "var(--foreground)" : "transparent",
									}}
									aria-label={`Chọn màu ${c}`}
								/>
							))}
						</div>
					</div>

					<div className="space-y-1">
						{tags.length === 0 ? (
							<p className="text-xs text-muted-foreground">Chưa có tag nào.</p>
						) : (
							tags.map((tag) => (
								<div
									key={tag.id}
									className="flex items-center justify-between rounded-md border px-3 py-2"
								>
									<div className="flex items-center gap-2">
										<span
											className="size-3 rounded-full"
											style={{ backgroundColor: tag.color }}
											aria-hidden
										/>
										<span className="text-sm">{tag.name}</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() => handleDelete(tag.id)}
										disabled={isPending}
										aria-label={`Xóa ${tag.name}`}
									>
										<Trash2 className="size-3.5" />
									</Button>
								</div>
							))
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
