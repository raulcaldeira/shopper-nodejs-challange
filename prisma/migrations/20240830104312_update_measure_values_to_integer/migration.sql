/*
  Warnings:

  - You are about to alter the column `recognized_value` on the `measures` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `confirmed_value` on the `measures` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "measures" ALTER COLUMN "recognized_value" SET DATA TYPE INTEGER,
ALTER COLUMN "confirmed_value" SET DATA TYPE INTEGER;
