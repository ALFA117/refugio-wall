import { z } from "zod";

// A guardian is trusted-source data (the DCL server), but still validated shape-first —
// bounds on string length and numeric ranges catch a malformed/buggy payload before it ever
// reaches KV, rather than silently storing garbage the Wall would then render.
export const GuardianSchema = z.object({
  displayName: z.string().trim().min(1).max(64),
  brasas: z.number().int().min(0).max(1_000_000),
  gamesPlayed: z.number().int().min(0).max(100_000).optional(),
});

export const IngestSchema = z.object({
  entries: z.array(GuardianSchema).max(50),
});
