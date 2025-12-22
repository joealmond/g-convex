import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily decay logic at midnight UTC
crons.daily(
  "apply-vote-decay",
  { hourUTC: 0, minuteUTC: 0 },
  internal.products.applyTimeDecay,
);

export default crons;
