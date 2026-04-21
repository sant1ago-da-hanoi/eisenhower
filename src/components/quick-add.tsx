"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createTask } from "@/app/actions";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * Global keyboard shortcut: press `N` anywhere (outside of inputs)
 * to capture a task straight into BACKLOG.
 */
export function QuickAdd() {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			// Ignore if user is typing into a field
			const target = e.target as HTMLElement | null;
			if (!target) return;
			const tag = target.tagName;
			const isEditable =
				tag === "INPUT" ||
				tag === "TEXTAREA" ||
				tag === "SELECT" ||
				target.isContentEditable;
			if (isEditable) return;

			// No modifiers (let Ctrl+N / Cmd+N be the browser's "new window")
			if (e.ctrlKey || e.metaKey || e.altKey) return;

			if (e.key === "n" || e.key === "N") {
				e.preventDefault();
				setOpen(true);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed) return;
		startTransition(async () => {
			try {
				await createTask({
					title: trimmed,
					notes: null,
					quadrant: "BACKLOG",
					tagIds: [],
				});
				setTitle("");
				setOpen(false);
				toast.success("Đã thêm vào Backlog", { duration: 1500 });
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
			}
		});
	}

	useEffect(() => {
		if (open) {
			// Dialog animates in; focus after the next frame so the input exists.
			const id = requestAnimationFrame(() => inputRef.current?.focus());
			return () => cancelAnimationFrame(id);
		}
	}, [open]);

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) setTitle("");
			}}
		>
			<DialogContent className="top-[20%] translate-y-0 sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Thêm nhanh vào Backlog</DialogTitle>
					<DialogDescription>
						Ghi nhanh ý tưởng. Có thể phân loại quadrant sau.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<Input
						ref={inputRef}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Task gì đó cần làm..."
						className="text-base"
						disabled={isPending}
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						<kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
							Enter
						</kbd>{" "}
						để lưu,{" "}
						<kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
							Esc
						</kbd>{" "}
						để hủy.
					</p>
				</form>
			</DialogContent>
		</Dialog>
	);
}
