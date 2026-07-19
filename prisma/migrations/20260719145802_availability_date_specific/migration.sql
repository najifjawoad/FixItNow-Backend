/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `availability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[technicianId,date,startTime]` on the table `availability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[availabilityId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availabilityId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "availability_technicianId_idx";

-- AlterTable
ALTER TABLE "availability" DROP COLUMN "dayOfWeek",
ADD COLUMN     "date" DATE NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "availabilityId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "availability_technicianId_date_idx" ON "availability"("technicianId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_technicianId_date_startTime_key" ON "availability"("technicianId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_availabilityId_key" ON "bookings"("availabilityId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
