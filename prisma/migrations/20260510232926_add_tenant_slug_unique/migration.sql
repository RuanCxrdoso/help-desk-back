/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");
