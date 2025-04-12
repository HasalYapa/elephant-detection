import { NextRequest, NextResponse } from 'next/server';
import { climateDataset } from '@/lib/climateData';
import { 
  generateClimateDesignRecommendations,
  getWettestMonths,
  getDriestMonths,
  getHottestMonths,
  getCoolestMonths,
  calculateRainfallVariability,
  calculateTemperatureRange
} from '@/lib/climateUtils';

export async function GET(request: NextRequest) {
  // Get location parameter from URL
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location');
  
  // If location is not provided, return error
  if (!location) {
    return NextResponse.json(
      { error: 'Location parameter is required' },
      { status: 400 }
    );
  }
  
  // Find location data
  const locationData = climateDataset.find(data => data.id === location);
  
  if (!locationData) {
    return NextResponse.json(
      { error: 'Location not found' },
      { status: 404 }
    );
  }
  
  // Generate climate design recommendations
  const recommendations = generateClimateDesignRecommendations(locationData);
  
  // Get additional climate insights
  const wettestMonths = getWettestMonths(locationData.monthlyData, 3);
  const driestMonths = getDriestMonths(locationData.monthlyData, 3);
  const hottestMonths = getHottestMonths(locationData.monthlyData, 3);
  const coolestMonths = getCoolestMonths(locationData.monthlyData, 3);
  const rainfallVariability = calculateRainfallVariability(locationData.monthlyData);
  const temperatureRange = calculateTemperatureRange(locationData.monthlyData);
  
  return NextResponse.json({
    location: locationData.name,
    recommendations,
    insights: {
      wettestMonths,
      driestMonths,
      hottestMonths,
      coolestMonths,
      rainfallVariability,
      temperatureRange,
      extremeEventCount: locationData.extremeEvents.length,
      extremeEventTypes: [...new Set(locationData.extremeEvents.map(event => event.type))]
    }
  });
}
