
# Scene-by-Scene Video Generation

## Overview
This feature adds an alternative video generation mode that generates each scene individually, giving users granular control over their TV ad content. Instead of creating one full video, the system will generate a separate video clip for each scene in the script, which can then be stitched together or refined individually in the Video Editor.

## Current Architecture

The current flow generates a single full video from the entire script:
1. User selects a script with multiple scenes (e.g., 4 scenes)
2. `generate-video-from-script` creates ONE video using the combined `fullScript` and voiceover
3. The single video URL is passed to the Video Editor

## Proposed Scene-by-Scene Flow

```text
+------------------+     +-------------------+     +------------------+
|  Script Selected |---->| Choose Generation |---->| Generation Mode  |
|  (4 scenes)      |     |      Mode         |     |    Executes      |
+------------------+     +-------------------+     +------------------+
                               |                         |
                    +----------+----------+              |
                    |                     |              v
               Full Video           Scene-by-Scene    +------------------+
               (existing)           (new option)      | Progress Tracker |
                    |                     |           | Scene 1/4 ✓      |
                    v                     v           | Scene 2/4 ...    |
             Single MP4             4 MP4 clips       +------------------+
                                          |
                                          v
                                    +------------------+
                                    | Video Editor     |
                                    | with scene clips |
                                    +------------------+
```

## Implementation Details

### 1. Frontend Changes (ScriptSelection.tsx)

**Add Generation Mode Toggle**
- New state: `generationMode: "full" | "scene-by-scene"`
- Radio/toggle UI in the settings area to let users choose between:
  - "Full Video" - Generate a single cohesive video (current behavior)
  - "Scene-by-Scene" - Generate each scene individually

**Progress Tracking UI**
- New state for tracking multi-scene generation progress:
  - `sceneGenerationProgress: { current: number, total: number, completed: string[] }`
- Enhanced loading skeleton showing:
  - Current scene being generated (e.g., "Generating Scene 2 of 4")
  - Progress bar with percentage
  - Thumbnails of completed scenes appearing as they finish
  - Estimated time remaining

**Updated Video Version Interface**
```typescript
interface VideoVersion {
  id: string;
  url: string;                    // Full stitched URL or first scene for scene-by-scene
  thumbnailUrl?: string;
  duration: string;
  aspectRatio: string;
  language: string;
  cameraMovement: string;
  generatedAt: Date;
  generationMode: "full" | "scene-by-scene";  // NEW
  sceneVideos?: {                              // NEW - for scene-by-scene mode
    sceneNumber: number;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: string;
  }[];
}
```

### 2. New Edge Function: generate-scenes-batch

Create a new edge function that orchestrates scene-by-scene generation:

**Location**: `supabase/functions/generate-scenes-batch/index.ts`

**Responsibilities**:
- Accept script with scenes array
- Loop through each scene and call Seedance 1.5 Pro for each
- Upload each scene video to storage individually
- Return array of scene video URLs
- Update campaign storyboard with all scene URLs

**Key Logic**:
```typescript
// Process scenes sequentially to avoid rate limits
for (const scene of script.scenes) {
  const visualPrompt = buildVisualPrompt(scene, cameraMovement);
  const audioPrompt = buildAudioPrompt(scene.voiceover, language);
  
  // Generate video for this scene
  const videoUrl = await generateWithSeedance(visualPrompt, audioPrompt, duration, aspectRatio);
  
  // Upload to storage
  const storedUrl = await uploadToStorage(videoUrl, campaignId, scene.sceneNumber);
  
  results.push({
    sceneNumber: scene.sceneNumber,
    videoUrl: storedUrl,
    duration: scene.duration
  });
}
```

### 3. Update Existing Edge Function: generate-video-scene

The existing `generate-video-scene` function already supports single-scene generation. We need to update it to:
- Accept language and camera movement parameters (currently missing)
- Ensure consistent behavior with `generate-video-from-script`

### 4. Real-time Progress Updates

**Option A: Polling (Simpler)**
- Frontend polls for status every 2-3 seconds
- Edge function updates a campaign metadata field with progress
- Less complex, works within current architecture

**Option B: Database Realtime (Preferred)**
- Add a `generation_progress` JSONB column to campaigns table
- Subscribe to realtime changes on this column
- Edge function updates progress after each scene completes

### 5. Video Editor Integration

When navigating to Video Editor with scene-by-scene videos:
- Pass `sceneVideos` array in navigation state
- Each scene in the editor gets its individual `videoUrl` populated
- Users can preview/regenerate individual scenes
- Timeline shows distinct clips instead of one video

## UI/UX Considerations

### Generation Mode Selector
Position in the Script Selection footer, alongside existing settings:
```
[Model: Seedance Pro] [Language: EN] [Camera: Auto] [Duration: 5s] [Ratio: 16:9]
[Generation Mode: (●) Full Video  ( ) Scene-by-Scene]
```

### Scene-by-Scene Progress Display
```
+----------------------------------------+
|  Generating Scene 2 of 4               |
|  [████████░░░░░░░░░░░░] 50%           |
|                                        |
|  ✓ Scene 1 - Opening Hook (5s)         |
|  ◐ Scene 2 - Problem Statement         |
|  ○ Scene 3 - Solution                  |
|  ○ Scene 4 - Call to Action            |
|                                        |
|  Est. time remaining: ~45 seconds      |
+----------------------------------------+
```

### Preview Thumbnails
As each scene completes, show a small thumbnail grid:
```
+-------+  +-------+  +-------+  +-------+
| Sc 1  |  | Sc 2  |  | Sc 3  |  | Sc 4  |
|  ✓    |  |  ✓    |  |  ...  |  |   ○   |
+-------+  +-------+  +-------+  +-------+
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/generate-scenes-batch/index.ts` | Create | New function for batch scene generation |
| `supabase/functions/generate-video-scene/index.ts` | Modify | Add language/camera params |
| `src/pages/ScriptSelection.tsx` | Modify | Add mode toggle, progress UI, scene handling |
| `src/pages/VideoEditor.tsx` | Modify | Handle scene-by-scene video data |
| `supabase/config.toml` | Modify | Add new function config |

## Technical Considerations

1. **Rate Limiting**: Seedance has rate limits; sequential processing with delays between scenes
2. **Timeout Management**: Edge functions have 60s default timeout; may need to extend for 4+ scenes
3. **Error Handling**: If one scene fails, option to retry just that scene
4. **Storage Costs**: Multiple clips = more storage; consider cleanup strategies
5. **Aspect Ratio Consistency**: All scenes must use same aspect ratio for seamless editing

## Estimated Generation Times

| Scenes | Full Video | Scene-by-Scene |
|--------|------------|----------------|
| 3      | ~30-45s    | ~60-90s        |
| 4      | ~30-45s    | ~80-120s       |
| 5      | ~30-45s    | ~100-150s      |

Scene-by-scene takes longer but provides:
- Granular control per scene
- Ability to regenerate individual scenes
- Per-scene voiceover language options (future enhancement)
- Independent camera movements per scene
