// Video Editor Types

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";

export interface Scene {
  id: string;
  name: string;
  duration: number; // in seconds
  thumbnail?: string;
  description?: string;
  type: "video" | "image" | "generated";
  url?: string;
}

export interface TrackItem {
  id: string;
  type: "video" | "audio" | "image" | "text" | "effect";
  name: string;
  startTime: number;
  duration: number;
  url?: string;
  properties?: any; // For text content, styles, volume, etc.
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "overlay";
  items: TrackItem[];
  isMuted?: boolean;
  isLocked?: boolean;
}

export interface VideoProject {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  duration: number;
  scenes: Scene[];
  timeline: TimelineTrack[];
  createdAt: Date;
  updatedAt: Date;
}

// Strategy Types (for the new flow)
export interface CampaignStrategy {
  id: string;
  campaignId: string;
  intent: {
    idea: string;
    goal: string;
    targetAudience: string;
  };
  budget: {
    amount: number;
    currency: string;
    interval: "daily" | "lifetime";
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    deliveryTime: "any" | "business_hours" | "evenings" | "weekends";
  };
  targeting: {
    locations: string[];
    ageRange: [number, number];
    genders: ("male" | "female" | "all")[];
    interests: string[];
    deviceTypes: ("tv" | "mobile" | "desktop")[];
  };
  placements: string[]; // e.g. "Samsung TV Plus", "Hulu", etc.
  videoSettings?: VideoOverlaySettings;
}

// Legacy definitions (kept for compatibility if needed, but likely to be refactored)
export interface BannerSettings {
  enabled: boolean;
  text: string;
  position: "top" | "bottom";
  alignment: "left" | "center" | "right";
  backgroundColor: string;
  textColor: string;
}
export interface EndScreenSettings {
  enabled: boolean;
  duration: number;
  ctaText: string;
  ctaUrl: string;
  showLogo: boolean;
  backgroundColor: string;
  backgroundImage?: string;
}
export interface QRCodeSettings {
  enabled: boolean;
  url: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size: number;
}
export interface MusicSettings {
  selectedTrackId: number | null;
  volume: number;
  isMuted: boolean;
}
export interface VoiceSettings {
  script: string;
  selectedVoice: string;
  speed: number;
  generateVoiceover: boolean;
}
export interface AIInputSettings {
  model: string;
  creativity: number;
  autoEnhance: boolean;
  style: string;
}
export interface GeneralSettings {
  aspectRatio: string;
  resolution: string;
  fps: number;
  loop: boolean;
  watermark: boolean;
}
export interface VideoOverlaySettings {
  banner: BannerSettings;
  endScreen: EndScreenSettings;
  qrCode: QRCodeSettings;
  music: MusicSettings;
  voice: VoiceSettings;
  network?: {
    selected: "none" | "espn" | "hulu" | "peacock" | "tubi";
  };
  aiSettings?: AIInputSettings;
  generalSettings?: GeneralSettings;
}
export const defaultOverlaySettings: VideoOverlaySettings = {
  banner: { enabled: true, text: "Visit our website", position: "bottom", alignment: "center", backgroundColor: "#000000", textColor: "#ffffff" },
  endScreen: { enabled: true, duration: 5, ctaText: "Learn More", ctaUrl: "", showLogo: true, backgroundColor: "#1a1a2e" },
  qrCode: { enabled: true, url: "https://example.com/qr", position: "top-right", size: 100 },
  music: { selectedTrackId: null, volume: 70, isMuted: false },
  voice: { script: "", selectedVoice: "professional", speed: 1.0, generateVoiceover: false },
  network: { selected: "none" },
  aiSettings: { model: "balanced", creativity: 70, autoEnhance: true, style: "cinematic" },
  generalSettings: { aspectRatio: "16:9", resolution: "1080p", fps: 30, loop: false, watermark: false },
};
