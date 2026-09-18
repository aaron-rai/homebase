/*
  Warnings:

  - A unique constraint covering the columns `[apiTokenHash]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "apiTokenHash" TEXT,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';

-- CreateIndex
CREATE UNIQUE INDEX "users_apiTokenHash_key" ON "users"("apiTokenHash");
