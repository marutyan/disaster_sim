export interface GeographicPoint {
  latitude: number;
  longitude: number;
}

const METERS_PER_DEGREE_LATITUDE = 111_320;

export function geographicToLocalMeters(
  origin: GeographicPoint,
  point: GeographicPoint,
): { east: number; north: number } {
  const latitudeRadians = (origin.latitude * Math.PI) / 180;
  const metersPerDegreeLongitude =
    METERS_PER_DEGREE_LATITUDE * Math.cos(latitudeRadians);

  return {
    east: (point.longitude - origin.longitude) * metersPerDegreeLongitude,
    north: (point.latitude - origin.latitude) * METERS_PER_DEGREE_LATITUDE,
  };
}

export function localMetersToGeographic(
  origin: GeographicPoint,
  local: { east: number; north: number },
): GeographicPoint {
  const latitudeRadians = (origin.latitude * Math.PI) / 180;
  const metersPerDegreeLongitude =
    METERS_PER_DEGREE_LATITUDE * Math.cos(latitudeRadians);

  return {
    latitude: origin.latitude + local.north / METERS_PER_DEGREE_LATITUDE,
    longitude: origin.longitude + local.east / metersPerDegreeLongitude,
  };
}
