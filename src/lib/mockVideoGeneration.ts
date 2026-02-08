/**
 * Mock video generation module.
 * Replaces real Replicate API calls with simulated delays and sample video URLs
 * so users can prototype the full workflow without burning API credits.
 *
 * Toggle `MOCK_VIDEO_GENERATION` to `false` (or remove the guard in calling
 * code) to re-enable real generation.
 */

export const MOCK_VIDEO_GENERATION = true;

// Public-domain sample videos (Pexels free stock)
const SAMPLE_VIDEOS = [
  "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4",
  "https://videos.pexels.com/video-files/4769562/4769562-uhd_2560_1440_25fps.mp4",
  "https://videos.pexels.com/video-files/5752729/5752729-uhd_2560_1440_30fps.mp4",
];

const pick = (idx: number) => SAMPLE_VIDEOS[idx % SAMPLE_VIDEOS.length];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Simulate a full-video generation response */
export async function mockGenerateFullVideo(script: any): Promise<{
  videoUrl: string;
  script: any;
  storyboard: any;
}> {
  // Simulate 3-second delay
  await sleep(3000);

  const videoUrl = pick(0);
  return {
    videoUrl,
    script,
    storyboard: {
      selectedScript: script,
      generatedVideoUrl: videoUrl,
      generatedAt: new Date().toISOString(),
    },
  };
}

/** Simulate a single scene video generation response */
export async function mockGenerateScene(sceneNumber: number): Promise<{
  videoUrl: string;
  sceneNumber: number;
}> {
  // Simulate 2-second delay per scene
  await sleep(2000);

  return {
    videoUrl: pick(sceneNumber),
    sceneNumber,
  };
}

/** Simulate a batch scene generation response */
export async function mockGenerateScenesBatch(script: any): Promise<{
  sceneVideos: Array<{
    sceneNumber: number;
    videoUrl: string;
    status: "completed" | "failed";
  }>;
  completedCount: number;
  failedCount: number;
  storyboard: any;
}> {
  const scenes: any[] = script.scenes || [];
  // Simulate 2s per scene sequentially (for the progress feel)
  await sleep(Math.max(2000, scenes.length * 1000));

  const sceneVideos = scenes.map((s: any, i: number) => ({
    sceneNumber: s.sceneNumber ?? i + 1,
    videoUrl: pick(i),
    status: "completed" as const,
  }));

  return {
    sceneVideos,
    completedCount: sceneVideos.length,
    failedCount: 0,
    storyboard: {
      ...script,
      scenes: scenes.map((s: any, i: number) => ({
        ...s,
        videoUrl: pick(i),
        generatedAt: new Date().toISOString(),
      })),
    },
  };
}
