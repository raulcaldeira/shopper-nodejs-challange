-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('WATER', 'GAS');

-- CreateTable
CREATE TABLE "measures" (
    "id" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "measure_type" "MeasureType" NOT NULL,
    "image_url" TEXT NOT NULL,
    "recognized_value" INTEGER NOT NULL,
    "confirmed_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measures_pkey" PRIMARY KEY ("id")
);
