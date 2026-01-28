import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  pollForCampaignFullVideoUrl,
  pollForCampaignSceneVideoUrl,
} from "@/lib/campaignVideoPolling";

export type GenerationProgress = {
  status: "idle" | "generating" | "completed" | "failed";
  mode?: "full" | "scene";
  sceneNumber?: number;
  startedAt?: number;
};

/**
 * On mount, checks if the campaign has an in-progress generation and resumes polling.
 * Calls `onVideoReady` when a URL is found.
 */
export function useGenerationResume(
  campaignId: string | undefined,
  onVideoReady: (url: string, mode: "full" | "scene", sceneNumber?: number) => void,
  opts?: { enabled?: boolean }
) {
  const enabled = opts?.enabled ?? true;
  const resumedRef = useRef(false);

  useEffect(() => {
    if (!campaignId || !enabled || resumedRef.current) return;

    const checkAndResume = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("generation_progress,storyboard")
        .eq("id", campaignId)
        .maybeSingle();

      if (error || !data) return;

      const progress = data.generation_progress as GenerationProgress | null;
      if (!progress || progress.status !== "generating") return;

      // Already completed while we were away?
      const storyboard = data.storyboard as any;
      if (progress.mode === "full") {
        const existingUrl =
          storyboard?.selectedScript?.generatedVideoUrl ||
          storyboard?.generatedVideoUrl ||
          storyboard?.videoUrl;
        if (existingUrl) {
          // Clear stale progress
          await supabase
            .from("campaigns")
            .update({ generation_progress: { status: "completed" } })
            .eq("id", campaignId);
          onVideoReady(existingUrl, "full");
          resumedRef.current = true;
          return;
        }
      } else if (progress.mode === "scene" && progress.sceneNumber) {
        const scenes = Array.isArray(storyboard?.scenes) ? storyboard.scenes : [];
        const scene = scenes.find((s: any) => s.sceneNumber === progress.sceneNumber);
        if (scene?.videoUrl) {
          await supabase
            .from("campaigns")
            .update({ generation_progress: { status: "completed" } })
            .eq("id", campaignId);
          onVideoReady(scene.videoUrl, "scene", progress.sceneNumber);
          resumedRef.current = true;
          return;
        }
      }

      // Still generating — start polling
      resumedRef.current = true;

      if (progress.mode === "full") {
        const url = await pollForCampaignFullVideoUrl(campaignId, {
          startedAt: progress.startedAt,
        });
        if (url) {
          await supabase
            .from("campaigns")
            .update({ generation_progress: { status: "completed" } })
            .eq("id", campaignId);
          onVideoReady(url, "full");
        }
      } else if (progress.mode === "scene" && progress.sceneNumber) {
        const url = await pollForCampaignSceneVideoUrl(campaignId, progress.sceneNumber, {
          startedAt: progress.startedAt,
        });
        if (url) {
          await supabase
            .from("campaigns")
            .update({ generation_progress: { status: "completed" } })
            .eq("id", campaignId);
          onVideoReady(url, "scene", progress.sceneNumber);
        }
      }
    };

    checkAndResume();
  }, [campaignId, enabled, onVideoReady]);
}
