export interface LocationInfo {
    lat: number;
    lng: number;
    zoom: number;
    type: string;
}

export const LOCATION_DATA: Record<string, LocationInfo> = {
    "United States": { lat: 37.0902, lng: -95.7129, zoom: 4, type: "Country" },
    "United Kingdom": { lat: 55.3781, lng: -3.4360, zoom: 6, type: "Country" },
    "Canada": { lat: 56.1304, lng: -106.3468, zoom: 4, type: "Country" },
    "Europe": { lat: 54.5260, lng: 15.2551, zoom: 4, type: "Region" },
    "California, US": { lat: 36.7783, lng: -119.4179, zoom: 6, type: "State" },
    "New York, US": { lat: 40.7128, lng: -74.0060, zoom: 7, type: "State" },
    "Texas, US": { lat: 31.9686, lng: -99.9018, zoom: 6, type: "State" },
    "London, UK": { lat: 51.5074, lng: -0.1278, zoom: 10, type: "City" },
    "Manchester, UK": { lat: 53.4808, lng: -2.2426, zoom: 11, type: "City" },
    "Paris, FR": { lat: 48.8566, lng: 2.3522, zoom: 11, type: "City" },
    "Berlin, DE": { lat: 52.5200, lng: 13.4050, zoom: 11, type: "City" },
};
