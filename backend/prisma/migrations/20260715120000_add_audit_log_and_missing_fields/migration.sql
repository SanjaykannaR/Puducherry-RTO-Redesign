-- AlterTable: Add refreshToken to User
ALTER TABLE "users" ADD COLUMN "refreshToken" TEXT;

-- AlterTable: Add refund fields to Payment
ALTER TABLE "payments" ADD COLUMN "refundedAt" DATETIME;
ALTER TABLE "payments" ADD COLUMN "refundReason" TEXT;

-- CreateTable: AuditLog
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
