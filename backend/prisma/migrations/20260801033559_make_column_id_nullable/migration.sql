-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_column_id_fkey";

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "column_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "project_columns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
