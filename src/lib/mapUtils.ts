import { MapPoint } from './mapData';

/**
 * Calculate the distance between two points in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Find points within a certain radius of a location
 */
export function findPointsWithinRadius(
  points: MapPoint[], 
  lat: number, 
  lon: number, 
  radiusKm: number
): MapPoint[] {
  return points.filter(point => {
    const [pointLon, pointLat] = point.coordinates;
    const distance = calculateDistance(lat, lon, pointLat, pointLon);
    return distance <= radiusKm;
  });
}

/**
 * Get the center coordinates of a set of points
 */
export function getCenterOfPoints(points: MapPoint[]): [number, number] {
  if (points.length === 0) {
    // Default to center of Sri Lanka if no points
    return [80.7718, 7.8731];
  }
  
  let sumLat = 0;
  let sumLon = 0;
  
  points.forEach(point => {
    const [lon, lat] = point.coordinates;
    sumLat += lat;
    sumLon += lon;
  });
  
  return [sumLon / points.length, sumLat / points.length];
}

/**
 * Get the bounds of a set of points
 */
export function getBoundsOfPoints(points: MapPoint[]): [[number, number], [number, number]] {
  if (points.length === 0) {
    // Default to Sri Lanka bounds if no points
    return [[79.5, 5.9], [81.9, 9.9]];
  }
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  
  points.forEach(point => {
    const [lon, lat] = point.coordinates;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  });
  
  // Add a small buffer
  const buffer = 0.1;
  return [[minLon - buffer, minLat - buffer], [maxLon + buffer, maxLat + buffer]];
}

/**
 * Get marker icon based on point type
 */
export function getMarkerIcon(type: string): string {
  switch (type) {
    case 'project':
      return '/icons/project-marker.svg';
    case 'resource':
      return '/icons/resource-marker.svg';
    case 'hazard':
      return '/icons/hazard-marker.svg';
    case 'infrastructure':
      return '/icons/infrastructure-marker.svg';
    default:
      return '/icons/default-marker.svg';
  }
}

/**
 * Get marker color based on point type or status
 */
export function getMarkerColor(point: MapPoint): string {
  // First check type
  switch (point.type) {
    case 'project':
      // For projects, use status to determine color
      switch (point.status) {
        case 'planned':
          return '#3498db'; // Blue
        case 'in-progress':
          return '#f39c12'; // Orange
        case 'completed':
          return '#2ecc71'; // Green
        default:
          return '#3498db'; // Default blue
      }
    case 'resource':
      return '#27ae60'; // Green
    case 'hazard':
      // For hazards, use risk level to determine color
      switch (point.riskLevel) {
        case 'low':
          return '#2ecc71'; // Green
        case 'moderate':
          return '#f39c12'; // Orange
        case 'high':
          return '#e74c3c'; // Red
        case 'extreme':
          return '#c0392b'; // Dark red
        default:
          return '#e74c3c'; // Default red
      }
    case 'infrastructure':
      return '#9b59b6'; // Purple
    default:
      return '#95a5a6'; // Default gray
  }
}
