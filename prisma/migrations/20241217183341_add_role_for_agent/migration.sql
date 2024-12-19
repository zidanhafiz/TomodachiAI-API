/*
  Warnings:

  - You are about to drop the column `gender` on the `agents` table. All the data in the column will be lost.
  - The `personality` column on the `agents` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('ASSISTANT', 'FRIEND', 'GIRLFRIEND', 'BOYFRIEND', 'HUSBAND', 'WIFE');

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "gender",
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "role" "AgentRole",
DROP COLUMN "personality",
ADD COLUMN     "personality" TEXT[];

-- DropEnum
DROP TYPE "AgentGender";
