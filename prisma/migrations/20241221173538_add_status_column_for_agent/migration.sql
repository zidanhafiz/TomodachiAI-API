-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('IDLE', 'PROCESSING', 'ERROR');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "status" "AgentStatus" NOT NULL DEFAULT 'IDLE';
