export interface LocationInfo {
    lat: number;
    lng: number;
    zoom: number;
    type: string;
}

export const LOCATION_DATA: Record<string, LocationInfo> = {
    "United States": { lat: 37.0902, lng: -95.7129, zoom: 4, type: "Country" },
    "California, US": { lat: 36.7783, lng: -119.4179, zoom: 6, type: "State" },
    "New York, US": { lat: 40.7128, lng: -74.0060, zoom: 7, type: "State" },
    "Texas, US": { lat: 31.9686, lng: -99.9018, zoom: 6, type: "State" },
    "Florida, US": { lat: 27.6648, lng: -81.5158, zoom: 6, type: "State" },
    "Illinois, US": { lat: 40.6331, lng: -89.3985, zoom: 6, type: "State" },
    "Georgia, US": { lat: 32.1656, lng: -82.9001, zoom: 6, type: "State" },
    "Pennsylvania, US": { lat: 41.2033, lng: -77.1945, zoom: 7, type: "State" },
    "Ohio, US": { lat: 40.4173, lng: -82.9071, zoom: 7, type: "State" },
    "Michigan, US": { lat: 44.3148, lng: -85.6024, zoom: 6, type: "State" },
    "New Jersey, US": { lat: 40.0583, lng: -74.4057, zoom: 8, type: "State" },
    "Los Angeles, US": { lat: 34.0522, lng: -118.2437, zoom: 10, type: "City" },
    "New York City, US": { lat: 40.7128, lng: -74.0060, zoom: 11, type: "City" },
    "Chicago, US": { lat: 41.8781, lng: -87.6298, zoom: 11, type: "City" },
    "Houston, US": { lat: 29.7604, lng: -95.3698, zoom: 11, type: "City" },
    "Atlanta, US": { lat: 33.7490, lng: -84.3880, zoom: 11, type: "City" },
    "Miami, US": { lat: 25.7617, lng: -80.1918, zoom: 11, type: "City" },
    "Dallas, US": { lat: 32.7767, lng: -96.7970, zoom: 11, type: "City" },
};
