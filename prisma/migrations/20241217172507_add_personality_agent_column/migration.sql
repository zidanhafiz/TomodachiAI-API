-- CreateEnum
CREATE TYPE "AgentGender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "gender" "AgentGender" NOT NULL DEFAULT 'MALE',
ADD COLUMN     "personality" TEXT NOT NULL DEFAULT 'You are a helpful assistant';
