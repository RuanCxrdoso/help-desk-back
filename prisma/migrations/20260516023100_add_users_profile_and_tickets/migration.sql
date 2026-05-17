/*
  Warnings:

  - The values [SUPER_ADMIN] on the enum `ROLE` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `role` on the `super_admin` table. All the data in the column will be lost.

*/

-- AlterTable (MOVIDO PARA CIMA: Deleta a coluna antes de mexer no Enum)
ALTER TABLE "super_admin" DROP COLUMN "role";

-- CreateEnum
CREATE TYPE "TICKET_STATUS" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TICKET_PRIORITY" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
BEGIN;
CREATE TYPE "ROLE_new" AS ENUM ('EMPLOYEE', 'TECHNICIAN', 'ADMIN');
-- A linha que alterava o default do super_admin foi removida daqui
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "public"."ROLE_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- CreateTable
CREATE TABLE "admin_profile" (
    "admin_id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,

    CONSTRAINT "admin_profile_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "technician_profile" (
    "technician_id" TEXT NOT NULL,
    "support_level" INTEGER NOT NULL,
    "specialties" TEXT[],

    CONSTRAINT "technician_profile_pkey" PRIMARY KEY ("technician_id")
);

-- CreateTable
CREATE TABLE "employee_profile" (
    "employee_id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "employee_profile_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TICKET_STATUS" NOT NULL DEFAULT 'OPEN',
    "priority" "TICKET_PRIORITY" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_tenant_id_idx" ON "ticket"("tenant_id");

-- CreateIndex
CREATE INDEX "ticket_status_idx" ON "ticket"("status");

-- CreateIndex
CREATE INDEX "user_tenant_id_idx" ON "user"("tenant_id");

-- AddForeignKey
ALTER TABLE "admin_profile" ADD CONSTRAINT "admin_profile_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_profile" ADD CONSTRAINT "technician_profile_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;