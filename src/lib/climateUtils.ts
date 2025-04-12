import { ClimateData, MonthlyData, ExtremeWeatherEvent } from './climateData';

/**
 * Calculate the average monthly rainfall for a location
 */
export function calculateAverageRainfall(monthlyData: MonthlyData[]): number {
  if (!monthlyData || monthlyData.length === 0) return 0;
  
  const totalRainfall = monthlyData.reduce((sum, month) => sum + month.rainfall, 0);
  return totalRainfall / monthlyData.length;
}

/**
 * Calculate the average monthly temperature for a location
 */
export function calculateAverageTemperature(monthlyData: MonthlyData[]): number {
  if (!monthlyData || monthlyData.length === 0) return 0;
  
  const totalTemperature = monthlyData.reduce((sum, month) => sum + month.temperature, 0);
  return totalTemperature / monthlyData.length;
}

/**
 * Get the wettest months for a location
 */
export function getWettestMonths(monthlyData: MonthlyData[], count: number = 3): MonthlyData[] {
  if (!monthlyData || monthlyData.length === 0) return [];
  
  return [...monthlyData]
    .sort((a, b) => b.rainfall - a.rainfall)
    .slice(0, count);
}

/**
 * Get the driest months for a location
 */
export function getDriestMonths(monthlyData: MonthlyData[], count: number = 3): MonthlyData[] {
  if (!monthlyData || monthlyData.length === 0) return [];
  
  return [...monthlyData]
    .sort((a, b) => a.rainfall - b.rainfall)
    .slice(0, count);
}

/**
 * Get the hottest months for a location
 */
export function getHottestMonths(monthlyData: MonthlyData[], count: number = 3): MonthlyData[] {
  if (!monthlyData || monthlyData.length === 0) return [];
  
  return [...monthlyData]
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, count);
}

/**
 * Get the coolest months for a location
 */
export function getCoolestMonths(monthlyData: MonthlyData[], count: number = 3): MonthlyData[] {
  if (!monthlyData || monthlyData.length === 0) return [];
  
  return [...monthlyData]
    .sort((a, b) => a.temperature - b.temperature)
    .slice(0, count);
}

/**
 * Calculate the rainfall variability (coefficient of variation)
 */
export function calculateRainfallVariability(monthlyData: MonthlyData[]): number {
  if (!monthlyData || monthlyData.length === 0) return 0;
  
  const average = calculateAverageRainfall(monthlyData);
  const squaredDifferences = monthlyData.map(month => Math.pow(month.rainfall - average, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / monthlyData.length;
  const standardDeviation = Math.sqrt(variance);
  
  return standardDeviation / average;
}

/**
 * Calculate the temperature range for a location
 */
export function calculateTemperatureRange(monthlyData: MonthlyData[]): number {
  if (!monthlyData || monthlyData.length === 0) return 0;
  
  const temperatures = monthlyData.map(month => month.temperature);
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);
  
  return maxTemp - minTemp;
}

/**
 * Get extreme weather events by type
 */
export function getExtremeEventsByType(events: ExtremeWeatherEvent[], type: 'flood' | 'drought' | 'landslide' | 'cyclone'): ExtremeWeatherEvent[] {
  if (!events || events.length === 0) return [];
  
  return events.filter(event => event.type === type);
}

/**
 * Get extreme weather events by severity
 */
export function getExtremeEventsBySeverity(events: ExtremeWeatherEvent[], severity: 'low' | 'moderate' | 'high' | 'extreme'): ExtremeWeatherEvent[] {
  if (!events || events.length === 0) return [];
  
  return events.filter(event => event.severity === severity);
}

/**
 * Calculate the linear regression for trend data
 */
export function calculateLinearRegression(data: { year: number; value: number }[]): { slope: number; intercept: number; r2: number } {
  if (!data || data.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }
  
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.year, 0);
  const sumY = data.reduce((sum, point) => sum + point.value, 0);
  const sumXY = data.reduce((sum, point) => sum + (point.year * point.value), 0);
  const sumXX = data.reduce((sum, point) => sum + (point.year * point.year), 0);
  const sumYY = data.reduce((sum, point) => sum + (point.value * point.value), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const meanY = sumY / n;
  const totalVariation = data.reduce((sum, point) => sum + Math.pow(point.value - meanY, 2), 0);
  const unexplainedVariation = data.reduce((sum, point) => {
    const predictedY = slope * point.year + intercept;
    return sum + Math.pow(point.value - predictedY, 2);
  }, 0);
  const r2 = 1 - (unexplainedVariation / totalVariation);
  
  return { slope, intercept, r2 };
}

/**
 * Generate climate design recommendations based on climate data
 */
export function generateClimateDesignRecommendations(climateData: ClimateData): string[] {
  if (!climateData) return [];
  
  const recommendations: string[] = [];
  
  // Rainfall-based recommendations
  const wettestMonths = getWettestMonths(climateData.monthlyData, 3);
  const rainfallVariability = calculateRainfallVariability(climateData.monthlyData);
  
  if (climateData.annualRainfall > 2000) {
    recommendations.push(`Design robust drainage systems to handle high annual rainfall (${climateData.annualRainfall}mm).`);
  }
  
  if (wettestMonths[0].rainfall > 300) {
    recommendations.push(`Consider flood mitigation measures for ${wettestMonths.map(m => m.month).join(', ')} when rainfall exceeds 300mm.`);
  }
  
  if (rainfallVariability > 0.5) {
    recommendations.push('Implement water storage systems to manage high rainfall variability between seasons.');
  }
  
  // Temperature-based recommendations
  const temperatureRange = calculateTemperatureRange(climateData.monthlyData);
  const hottestMonths = getHottestMonths(climateData.monthlyData, 1);
  
  if (temperatureRange > 5) {
    recommendations.push(`Account for thermal expansion in materials due to temperature range of ${temperatureRange.toFixed(1)}°C.`);
  }
  
  if (hottestMonths[0].temperature > 28) {
    recommendations.push(`Incorporate passive cooling design for hot periods (${hottestMonths[0].month}: ${hottestMonths[0].temperature}°C).`);
  }
  
  // Extreme event recommendations
  const floods = getExtremeEventsByType(climateData.extremeEvents, 'flood');
  const landslides = getExtremeEventsByType(climateData.extremeEvents, 'landslide');
  const droughts = getExtremeEventsByType(climateData.extremeEvents, 'drought');
  const cyclones = getExtremeEventsByType(climateData.extremeEvents, 'cyclone');
  
  if (floods.length > 0) {
    recommendations.push('Elevate critical infrastructure above historical flood levels.');
  }
  
  if (landslides.length > 0) {
    recommendations.push('Implement slope stabilization measures and avoid construction on steep slopes.');
  }
  
  if (droughts.length > 0) {
    recommendations.push('Design water-efficient systems and consider rainwater harvesting.');
  }
  
  if (cyclones.length > 0) {
    recommendations.push('Strengthen structures to withstand high wind loads from cyclonic events.');
  }
  
  // Trend-based recommendations
  const rainfallTrend = calculateLinearRegression(climateData.rainfallTrend);
  const temperatureTrend = calculateLinearRegression(climateData.temperatureTrend);
  
  if (rainfallTrend.slope > 5) {
    recommendations.push('Future-proof drainage systems to accommodate increasing rainfall trends.');
  } else if (rainfallTrend.slope < -5) {
    recommendations.push('Consider water conservation measures due to decreasing rainfall trends.');
  }
  
  if (temperatureTrend.slope > 0.05) {
    recommendations.push('Enhance thermal insulation to address rising temperature trends.');
  }
  
  return recommendations;
}
