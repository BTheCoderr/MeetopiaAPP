CREATE INDEX IF NOT EXISTS "Message_senderId_idx"
ON "Message"("senderId");

CREATE INDEX IF NOT EXISTS "Session_userId_idx"
ON "Session"("userId");

CREATE INDEX IF NOT EXISTS "Report_reporterId_idx"
ON "Report"("reporterId");

CREATE INDEX IF NOT EXISTS "Report_reportedUserId_idx"
ON "Report"("reportedUserId");

CREATE INDEX IF NOT EXISTS "Feedback_userId_idx"
ON "Feedback"("userId");
