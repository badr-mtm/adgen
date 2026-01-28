/**
 * Determines the appropriate page to navigate to based on campaign progress.
 * Campaigns without completed strategy/video should resume where user stopped.
 */

interface CampaignStoryboard {
  strategy?: any;
  scripts?: any[];
  selectedScript?: {
    generatedVideoUrl?: string;
  };
  scenes?: any[];
  generatedVideoUrl?: string;
  videoUrl?: string;
}

interface Campaign {
  id: string;
  status?: string;
  storyboard?: CampaignStoryboard | null;
  generation_progress?: {
    status?: string;
  } | null;
}

export type CampaignStage = 
  | 'script-selection'  // User needs to select/generate scripts
  | 'storyboard'        // User is working on storyboard/scenes
  | 'video-editor'      // Video is generated, user can edit
  | 'campaign-details'; // Campaign is complete, show details

/**
 * Determines the current stage of a campaign based on its data
 */
export function getCampaignStage(campaign: Campaign): CampaignStage {
  const storyboard = campaign.storyboard;
  const progress = campaign.generation_progress;

  // Check if video exists (fully complete)
  const hasVideo = !!(
    storyboard?.selectedScript?.generatedVideoUrl ||
    storyboard?.generatedVideoUrl ||
    storyboard?.videoUrl
  );

  // If video exists, campaign is ready for details or editing
  if (hasVideo) {
    return 'campaign-details';
  }

  // Check if storyboard has scenes (meaning scripts were selected)
  const hasScenes = storyboard?.scenes && storyboard.scenes.length > 0;
  const hasSelectedScript = !!storyboard?.selectedScript;
  
  // Check if currently generating
  const isGenerating = progress?.status === 'generating';

  // If has scenes or selected script, user is in storyboard stage
  if (hasScenes || hasSelectedScript || isGenerating) {
    return 'storyboard';
  }

  // Check if scripts exist (user started but didn't finish script selection)
  const hasScripts = storyboard?.scripts && storyboard.scripts.length > 0;
  
  if (hasScripts) {
    return 'script-selection';
  }

  // Default: user needs to start with script selection
  return 'script-selection';
}

/**
 * Returns the appropriate route path for a campaign based on its stage
 */
export function getCampaignRoute(campaign: Campaign): string {
  const stage = getCampaignStage(campaign);
  
  switch (stage) {
    case 'script-selection':
      return `/script-selection/${campaign.id}`;
    case 'storyboard':
      return `/storyboard/${campaign.id}`;
    case 'video-editor':
      return `/video-editor/${campaign.id}`;
    case 'campaign-details':
      return `/campaign/${campaign.id}`;
    default:
      return `/campaign/${campaign.id}`;
  }
}

/**
 * Checks if a campaign is complete (has generated video)
 */
export function isCampaignComplete(campaign: Campaign): boolean {
  const storyboard = campaign.storyboard;
  return !!(
    storyboard?.selectedScript?.generatedVideoUrl ||
    storyboard?.generatedVideoUrl ||
    storyboard?.videoUrl
  );
}

/**
 * Gets a human-readable status label for the campaign stage
 */
export function getCampaignStageLabel(campaign: Campaign): string {
  const stage = getCampaignStage(campaign);
  
  switch (stage) {
    case 'script-selection':
      return 'Select Script';
    case 'storyboard':
      return 'Edit Storyboard';
    case 'video-editor':
      return 'Edit Video';
    case 'campaign-details':
      return 'Ready';
    default:
      return 'Draft';
  }
}
