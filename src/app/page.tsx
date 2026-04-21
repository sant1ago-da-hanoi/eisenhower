import { MatrixBoard } from "@/components/matrix-board";
import { QuickAdd } from "@/components/quick-add";
import { TagManager } from "@/components/tag-manager";
import { getAllTags, getAllTasks } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
	const [tasks, tags] = await Promise.all([getAllTasks(), getAllTags()]);

	return (
		<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
			<header className="mb-6 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Eisenhower Matrix
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Phân loại task theo{" "}
						<span className="font-medium text-foreground">Urgent</span> ×{" "}
						<span className="font-medium text-foreground">Important</span>. Kéo
						thả giữa các ô để đổi mức ưu tiên. Nhấn{" "}
						<kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
							N
						</kbd>{" "}
						để thêm nhanh vào Backlog.
					</p>
				</div>
				<TagManager tags={tags} />
			</header>

			<MatrixBoard tasks={tasks} tags={tags} />

			<QuickAdd />

			<footer className="mt-10 text-center text-xs text-muted-foreground">
				{tasks.length} task · {tags.length} tag
			</footer>
		</main>
	);
}
