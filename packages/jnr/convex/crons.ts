import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// GDPR Article 5(1)(e) — Storage limitation
// Purge sentenceHistory records older than 90 days
// Runs daily at 03:00 UTC (off-peak)
crons.daily(
  "purge expired sentence history",
  { hourUTC: 3, minuteUTC: 0 },
  internal.retention.purgeExpiredData
);

export default crons;
