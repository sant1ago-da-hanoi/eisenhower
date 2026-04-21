"use client";

import dynamic from "next/dynamic";
import type { TaskWithTags } from "@/db/queries";
import type { Tag } from "@/db/schema";
import { QUADRANT_CONFIG, QUADRANT_ORDER } from "@/lib/quadrant";
import { cn } from "@/lib/utils";

/**
 * dnd-kit's `DndContext` generates non-deterministic DOM ids
 * (`DndDescribedBy-N`), which causes hydration mismatches when
 * rendered on the server. Load the board client-only.
 */
const MatrixBoard = dynamic(
	() => import("@/components/matrix-board").then((m) => m.MatrixBoard),
	{
		ssr: false,
		loading: () => <MatrixSkeleton />,
	},
);

type Props = {
	tasks: TaskWithTags[];
	tags: Tag[];
};

export function MatrixBoardClient({ tasks, tags }: Props) {
	return <MatrixBoard tasks={tasks} tags={tags} />;
}

function MatrixSkeleton() {
	return (
		<>
			<div className="grid gap-3 md:grid-cols-2 md:gap-4">
				{QUADRANT_ORDER.map((q) => {
					const cfg = QUADRANT_CONFIG[q];
					return (
						<section
							key={q}
							className={cn(
								"flex min-h-[260px] flex-col rounded-xl border-2 p-3",
								cfg.accent,
								cfg.accentBorder,
							)}
						>
							<header className="mb-3">
								<h2
									className={cn(
										"text-sm font-bold uppercase tracking-wide",
										cfg.accentText,
									)}
								>
									{cfg.verb}
								</h2>
								<p className="mt-0.5 text-xs text-muted-foreground">
									{cfg.tagline}
								</p>
							</header>
							<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground">
								Đang tải...
							</div>
						</section>
					);
				})}
			</div>
			<section className="mt-8 rounded-xl border-2 border-dashed border-border bg-muted/30 p-3 dark:bg-muted/10">
				<div className="h-16" />
			</section>
		</>
	);
}
