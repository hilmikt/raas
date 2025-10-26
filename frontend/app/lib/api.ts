import type { MilestonesResponse } from "@/app/lib/milestones";
import type { ReputationRecord } from "@/app/lib/reputation";

export async function fetchMilestones(): Promise<MilestonesResponse> {
  const res = await fetch("/api/milestones", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load milestones (${res.status})`);
  }
  return (await res.json()) as MilestonesResponse;
}

export async function fetchReputation(): Promise<ReputationRecord[]> {
  const res = await fetch("/api/reputation", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load reputation (${res.status})`);
  }
  return (await res.json()) as ReputationRecord[];
}
