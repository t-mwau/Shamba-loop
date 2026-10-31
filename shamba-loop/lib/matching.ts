import type { WasteType } from "@/types";

const EARTH_RADIUS_KM = 6_371;

export function distanceInKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function scoreListingMatch(
  listing: { wasteType: WasteType; distanceKm: number },
  preferences: { wasteTypes: WasteType[]; maxDistanceKm: number },
): number {
  if (preferences.maxDistanceKm <= 0 || listing.distanceKm < 0) return 0;
  if (!preferences.wasteTypes.includes(listing.wasteType)) return 0;
  if (listing.distanceKm > preferences.maxDistanceKm) return 0;

  const proximityScore = 1 - listing.distanceKm / preferences.maxDistanceKm;
  return Math.round(65 + proximityScore * 35);
}
