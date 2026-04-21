import { MatrixBoardClient } from "@/components/matrix-board-client";
import { QuickAdd } from "@/components/quick-add";
import { TagManager } from "@/components/tag-manager";
import { getAllTags, getAllTasks } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
	const [tasks, tags] = await Promise.all([getAllTasks(), getAllTags()]);

	return (
		<main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6 sm:py-8">
			<header className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-6 sm:items-end sm:gap-4">
				<div className="min-w-0 flex-1">
					<h1 className="text-xl font-bold tracking-tight sm:text-3xl">
						Eisenhower Matrix
					</h1>
					<p className="mt-1 hidden text-sm text-muted-foreground sm:block">
						Phân loại task theo{" "}
						<span className="font-medium text-foreground">Urgent</span> ×{" "}
						<span className="font-medium text-foreground">Important</span>. Kéo
						thả giữa các ô để đổi mức ưu tiên. Nhấn{" "}
						<kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
							N
						</kbd>{" "}
						để thêm nhanh vào Backlog.
					</p>
					<p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
						Urgent × Important
					</p>
				</div>
				<TagManager tags={tags} />
			</header>

			<MatrixBoardClient tasks={tasks} tags={tags} />

			<QuickAdd />

			<footer className="mt-6 text-center text-xs text-muted-foreground sm:mt-10">
				{tasks.length} task · {tags.length} tag
			</footer>
		</main>
	);
}
