-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CRITICAL', 'NORMAL');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'CRITICAL';

-- DropEnum
DROP TYPE "NotificationStatus";
