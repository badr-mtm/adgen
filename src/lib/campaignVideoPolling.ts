import { supabase } from "@/integrations/supabase/client";

type PollOptions = {
  timeoutMs?: number;
  intervalMs?: number;
  /** Only accept results written after this moment (helps avoid picking up an older URL). */
  startedAt?: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isEdgeFunctionNetworkError(err: unknown): boolean {
  const e = err as any;
  const name = String(e?.name ?? "");
  const message = String(e?.message ?? "");
  const contextMessage = String(e?.context?.message ?? e?.context?.value?.message ?? "");

  // Supabase JS wraps fetch failures as FunctionsFetchError
  if (name === "FunctionsFetchError") return true;

  const combined = `${message} ${contextMessage}`.toLowerCase();
  return combined.includes("failed to fetch") || combined.includes("failed to send a request");
}

export function getFullVideoUrlFromStoryboard(storyboard: any): string | null {
  return (
    storyboard?.selectedScript?.generatedVideoUrl ||
    storyboard?.generatedVideoUrl ||
    storyboard?.videoUrl ||
    null
  );
}

function updatedAfterStart(updatedAt: string | null | undefined, startedAt?: number) {
  if (!startedAt) return true;
  const t = updatedAt ? Date.parse(updatedAt) : NaN;
  if (Number.isNaN(t)) return true;
  // allow a small clock-skew window
  return t >= startedAt - 5_000;
}

export async function pollForCampaignFullVideoUrl(
  campaignId: string,
  opts: PollOptions = {}
): Promise<string | null> {
  const timeoutMs = opts.timeoutMs ?? 3 * 60_000;
  const intervalMs = opts.intervalMs ?? 2_000;
  const startedAt = opts.startedAt;
  const t0 = Date.now();

  while (Date.now() - t0 < timeoutMs) {
    const { data, error } = await supabase
      .from("campaigns")
      .select("storyboard,updated_at")
      .eq("id", campaignId)
      .single();

    if (!error && data) {
      if (!updatedAfterStart(data.updated_at, startedAt)) {
        await sleep(intervalMs);
        continue;
      }

      const url = getFullVideoUrlFromStoryboard(data.storyboard as any);
      if (url) return url;
    }

    await sleep(intervalMs);
  }

  return null;
}

export async function pollForCampaignSceneVideoUrl(
  campaignId: string,
  sceneNumber: number,
  opts: PollOptions = {}
): Promise<string | null> {
  const timeoutMs = opts.timeoutMs ?? 3 * 60_000;
  const intervalMs = opts.intervalMs ?? 2_000;
  const startedAt = opts.startedAt;
  const t0 = Date.now();

  while (Date.now() - t0 < timeoutMs) {
    const { data, error } = await supabase
      .from("campaigns")
      .select("storyboard,updated_at")
      .eq("id", campaignId)
      .single();

    if (!error && data) {
      if (!updatedAfterStart(data.updated_at, startedAt)) {
        await sleep(intervalMs);
        continue;
      }

      const storyboard = data.storyboard as any;
      const scenes = Array.isArray(storyboard?.scenes) ? storyboard.scenes : [];
      const scene = scenes.find((s: any) => s?.sceneNumber === sceneNumber);
      const url = scene?.videoUrl;
      if (typeof url === "string" && url.length > 0) return url;
    }

    await sleep(intervalMs);
  }

  return null;
}
