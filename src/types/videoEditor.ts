// Video Editor Types

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

export interface VideoOverlaySettings {
  banner: BannerSettings;
  endScreen: EndScreenSettings;
  qrCode: QRCodeSettings;
  music: MusicSettings;
  voice: VoiceSettings;
}

export const defaultOverlaySettings: VideoOverlaySettings = {
  banner: {
    enabled: false,
    text: "Visit our website",
    position: "bottom",
    alignment: "center",
    backgroundColor: "#000000",
    textColor: "#ffffff",
  },
  endScreen: {
    enabled: true,
    duration: 5,
    ctaText: "Learn More",
    ctaUrl: "",
    showLogo: true,
    backgroundColor: "#1a1a2e",
  },
  qrCode: {
    enabled: false,
    url: "",
    position: "top-right",
    size: 100,
  },
  music: {
    selectedTrackId: null,
    volume: 70,
    isMuted: false,
  },
  voice: {
    script: "",
    selectedVoice: "professional",
    speed: 1.0,
    generateVoiceover: false,
  },
};
