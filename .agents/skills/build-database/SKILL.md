# Database Build Skill (build-database)

You are executing the `build-database` skill. Your objective is to design, implement, and modify database schemas and relationships while strictly adhering to the project's data architecture, PostgreSQL (Supabase) constraints, and Prisma ORM conventions.

## 1. Preparation & Context Routing
- ALWAYS read `@docs/Architecture/Database.md` before starting to understand the current schema, naming conventions (`snake_case` for tables/columns mapped via `@@map` and `@map`), and cascade rules.
- Check `@docs/Development/Tech-Stack.md` to ensure alignment with Prisma v7+ and Supabase configurations.

## 2. Implementation Steps

### Step 1: Model Definition (schema.prisma)
- [cite_start]ALL structural changes must be made exclusively inside `backend/prisma/schema.prisma`. Do not create separate `.entity.ts` files for database models.
- Define all scalar types, constraints, and default values explicitly using Prisma syntax.
- [cite_start]Add standard audit columns (`created_at`, `updated_at`, `deleted_at` for soft deletes) to every new business model[cite: 276].
- Use `@default(dbgenerated("uuid_generate_v4()"))` or Prisma's `@default(uuid())` for UUID primary keys.

### Step 2: Relationships & Cascade Rules
- Establish clear relationships using Prisma's `@relation` attribute.
- Explicitly define `onDelete` and `onUpdate` behaviors. Follow the strict cascade rules defined in the architecture docs (e.g., `Restrict` for parent-child business entities, `Cascade` for junction tables).

### Step 3: Performance Optimization
- Identify frequently queried columns (like email, status, workspace_id) and define Database Indexes using Prisma's `@@index`.
- Add `@@unique` or `@unique` constraints to columns where data duplication is strictly forbidden.

### Step 4: Database Synchronization (Prisma CLI)
- After modifying the schema, instruct the user to format it: `npx prisma format`.
- Remind the user to run migrations: `npx prisma migrate dev --name <descriptive_name>`. (This utilizes the `DIRECT_URL` defined in `prisma.config.ts`) [cite_start][cite: 211, 277].

## 3. Example Execution Scenario

**User Input:** "Tạo bảng Product và Category, quan hệ 1-nhiều, product cần đánh index ở cột name và sku."

**Agent Behavior:**
1. **Context Loaded:** Reads `@docs/Architecture/Database.md` to check existing schema rules.
2. **Target File:** `backend/prisma/schema.prisma`
3. **Implementation:** Generates the `Category` and `Product` models inside the `.prisma` file. Adds a relation in `Product` pointing to `Category`. Maps table names using `@@map("categories")` and `@@map("products")`. Adds `@@index([name])` and `@unique` on the `sku` field in the `Product` model.
4. **Follow-up:** Provides the exact `npx prisma migrate dev` command for the user to execute and reminds them to update `@docs/Architecture/Database.md` via the `update-docs` skill.

## 4. Guardrails (Do Not)
- DO NOT declare `url` or `directUrl` variables inside `schema.prisma`. [cite_start]Prisma 7 requires these connections to be loaded via `prisma.config.ts`[cite: 193, 277].
- [cite_start]DO NOT manually modify tables or columns directly in the Supabase Dashboard[cite: 275]. The `.prisma` file is the absolute single source of truth.
- DO NOT execute destructive operations (like removing a column or dropping a table) without explicitly warning the user first.
- [cite_start]DO NOT hard delete business entities; always implement the `deleted_at` (soft delete) pattern[cite: 276].