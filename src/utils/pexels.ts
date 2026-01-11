/**
 * Pexels API Utility
 * Provides free cinematic video fallbacks for testing and production.
 */

const PEXELS_API_KEY = (import.meta as any).env.VITE_PEXELS_API_KEY || "";

export interface PexelsVideo {
    id: number;
    width: number;
    height: number;
    url: string;
    image: string;
    duration: number;
    video_files: {
        id: number;
        quality: "hd" | "sd";
        file_type: string;
        width: number;
        height: number;
        link: string;
    }[];
}

export const searchPexelsVideos = async (query: string): Promise<string | null> => {
    if (!PEXELS_API_KEY) {
        console.warn("Pexels API Key missing. Returning high-quality placeholder.");
        return getRandomCinematicPlaceholder(query);
    }

    try {
        const response = await fetch(
            `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY,
                },
            }
        );

        if (!response.ok) throw new Error("Pexels API Error");

        const data = await response.json();
        if (data.videos && data.videos.length > 0) {
            // Prefer HD 1080p if available
            const video: PexelsVideo = data.videos[0];
            const bestFile = video.video_files.find(f => f.width === 1920) || video.video_files[0];
            return bestFile.link;
        }

        return getRandomCinematicPlaceholder(query);
    } catch (err) {
        console.error("Pexels Fetch Failed:", err);
        return getRandomCinematicPlaceholder(query);
    }
};

/**
 * Returns a high-quality cinematic placeholder if search fails or no key provided.
 * These are direct links to premium-looking stock footage for testing.
 */
const getRandomCinematicPlaceholder = (query: string): string => {
    const placeholders = [
        "https://player.vimeo.com/external/434045526.sd.mp4?s=c27dc3699b051b54c1537a775ee9542a4df6782a&profile_id=164&oauth2_token_id=57447761", // Urban Cinematic
        "https://player.vimeo.com/external/459389137.sd.mp4?s=8720743bc21f84010a86d11f725350438cf56f64&profile_id=164&oauth2_token_id=57447761", // Nature Aerial
        "https://player.vimeo.com/external/370331493.sd.mp4?s=7b92739c36294909a3dc8f6efcfdded1b86d9a0d&profile_id=164&oauth2_token_id=57447761", // Tech/Future
        "https://player.vimeo.com/external/517090025.sd.mp4?s=d0097651034c44917452d21e8605c31f47cbe3f0&profile_id=164&oauth2_token_id=57447761", // Lifestyle/Premium
    ];

    // Use query to pick a stable placeholder
    const index = query.length % placeholders.length;
    return placeholders[index];
};
