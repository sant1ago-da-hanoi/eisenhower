# Eisenhower Matrix

Task manager theo [triết lý Eisenhower](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method) — phân loại công việc theo 2 trục **Urgent** × **Important**.

|                   | Urgent                   | Not Urgent              |
| ----------------- | ------------------------ | ----------------------- |
| **Important**     | **Q1** — Do (làm ngay)   | **Q2** — Schedule (lên lịch) |
| **Not Important** | **Q3** — Delegate (giao) | **Q4** — Delete (loại bỏ)    |

## Stack

- **Framework**: [Next.js 16](https://nextjs.org) App Router + Turbopack
- **Language**: TypeScript 6
- **DB**: SQLite qua [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) + [Drizzle ORM](https://orm.drizzle.team)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI)
- **Drag-drop**: [`@dnd-kit`](https://dndkit.com)
- **Forms**: `react-hook-form` + `zod`
- **Lint/Format**: [Biome](https://biomejs.dev)
- **Runtime**: [Bun](https://bun.sh)

## Features

- Matrix 2×2 với 4 quadrant màu (đỏ / xanh lá / vàng / xám)
- CRUD task (title, notes, quadrant, tags) qua dialog
- Đánh dấu hoàn thành (checkbox + strikethrough)
- **Drag-drop giữa quadrants** với optimistic UI (không giật)
- Quản lý tags (tên + màu), assign nhiều tag/task
- Toast notifications (sonner)
- Seed data mẫu để test

## Getting started

```bash
bun install
bun run db:migrate   # tạo file ./data/app.db + chạy migrations
bun run db:seed      # (tùy chọn) nạp 9 task + 3 tag demo
bun dev              # http://localhost:3000
```

## Scripts

| Command | Mô tả |
| --- | --- |
| `bun dev` | Dev server (Turbopack) |
| `bun run build` | Production build |
| `bun start` | Chạy production build |
| `bun run lint` | Biome check |
| `bun run lint:fix` | Biome check + auto-fix |
| `bun run format` | Biome format |
| `bun run db:generate` | Sinh migration mới từ thay đổi schema |
| `bun run db:migrate` | Áp dụng migrations vào DB |
| `bun run db:push` | Push schema thẳng vào DB (không migration — dev only) |
| `bun run db:studio` | Mở Drizzle Studio GUI |
| `bun run db:seed` | Reset + seed demo data (chạy qua `tsx`) |

## Cấu trúc

```
src/
├── app/
│   ├── actions.ts          # Server Actions (zod-validated CRUD)
│   ├── layout.tsx
│   └── page.tsx            # Server Component: fetch tasks + tags
├── components/
│   ├── matrix-board.tsx    # DndContext + useOptimistic
│   ├── quadrant-column.tsx # Droppable zone
│   ├── task-card.tsx       # Sortable task card
│   ├── task-form-dialog.tsx
│   ├── tag-manager.tsx
│   └── ui/                 # shadcn/ui
├── db/
│   ├── schema.ts           # tasks / tags / task_tags
│   ├── client.ts           # drizzle + better-sqlite3
│   ├── queries.ts          # read queries
│   └── seed.ts             # standalone seeder
└── lib/
    ├── quadrant.ts         # Q1–Q4 config (colors, labels)
    └── utils.ts
drizzle/                    # Generated SQL migrations
data/app.db                 # SQLite file (gitignored)
```

## Lưu ý kỹ thuật

- **`better-sqlite3` là native binding** → phải build khi `bun install`. Nếu báo lỗi, chạy `bun pm trust better-sqlite3`.
- **Seed script chạy bằng `tsx`** thay vì bun runtime vì binding của `better-sqlite3` không tương thích với engine của bun.
- **File DB (`./data/app.db`)** được gitignore. DB path có thể override bằng `DATABASE_URL`.
- **shadcn hiện tại dùng Base UI** (không phải Radix) → không có `asChild`, thay bằng prop `render`.

## Deploy

Vì dùng SQLite file trên disk, **không deploy được lên Vercel serverless** (filesystem ephemeral). Chọn host có persistent storage:

- [Fly.io](https://fly.io) (có volume)
- [Railway](https://railway.app)
- VPS tự host (Docker)
- Cloudflare Workers + [D1](https://developers.cloudflare.com/d1/) (cần đổi driver)

## License

[MIT](./LICENSE)
