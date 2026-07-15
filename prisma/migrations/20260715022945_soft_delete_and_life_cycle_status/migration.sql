-- CreateEnum
CREATE TYPE "TENANT_STATUS" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_technician_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_tenant_id_fkey";

-- DropIndex
DROP INDEX "ticket_status_idx";

-- DropIndex
DROP INDEX "ticket_tenant_id_idx";

-- DropIndex
DROP INDEX "user_tenant_id_idx";

-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "TENANT_STATUS" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "tenant_slug_status_deleted_at_idx" ON "tenant"("slug", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "ticket_tenant_id_technician_id_status_idx" ON "ticket"("tenant_id", "technician_id", "status");

-- CreateIndex
CREATE INDEX "ticket_tenant_id_employee_id_status_idx" ON "ticket"("tenant_id", "employee_id", "status");

-- CreateIndex
CREATE INDEX "ticket_tenant_id_status_created_at_idx" ON "ticket"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "user_tenant_id_role_is_active_deleted_at_idx" ON "user"("tenant_id", "role", "is_active", "deleted_at");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
