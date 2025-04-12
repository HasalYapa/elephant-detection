import { NextRequest, NextResponse } from 'next/server';
import { climateDataset } from '@/lib/climateData';

export async function GET(request: NextRequest) {
  // Get parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location');
  const dataType = searchParams.get('dataType') || 'rainfall'; // rainfall or temperature
  
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
  
  // Get trend data based on dataType
  let trendData;
  let analysis = '';
  
  if (dataType === 'temperature') {
    trendData = locationData.temperatureTrend;
    
    // Simple trend analysis
    const firstValue = trendData[0].value;
    const lastValue = trendData[trendData.length - 1].value;
    const difference = lastValue - firstValue;
    const percentChange = (difference / firstValue) * 100;
    
    if (difference > 0.5) {
      analysis = `Temperature in ${locationData.name} has shown a significant increase of ${difference.toFixed(1)}°C (${percentChange.toFixed(1)}%) over the past decade. This warming trend may impact local ecosystems and infrastructure.`;
    } else if (difference > 0.1) {
      analysis = `Temperature in ${locationData.name} has shown a moderate increase of ${difference.toFixed(1)}°C (${percentChange.toFixed(1)}%) over the past decade, consistent with global warming trends.`;
    } else {
      analysis = `Temperature in ${locationData.name} has remained relatively stable over the past decade, with only a slight change of ${difference.toFixed(1)}°C (${percentChange.toFixed(1)}%).`;
    }
  } else {
    trendData = locationData.rainfallTrend;
    
    // Simple trend analysis
    const firstValue = trendData[0].value;
    const lastValue = trendData[trendData.length - 1].value;
    const difference = lastValue - firstValue;
    const percentChange = (difference / firstValue) * 100;
    
    if (difference > 100) {
      analysis = `Rainfall in ${locationData.name} has increased significantly by ${difference.toFixed(0)}mm (${percentChange.toFixed(1)}%) over the past decade. This may increase flood risk and impact drainage requirements.`;
    } else if (difference > 50) {
      analysis = `Rainfall in ${locationData.name} has shown a moderate increase of ${difference.toFixed(0)}mm (${percentChange.toFixed(1)}%) over the past decade. Consider enhanced drainage systems for construction projects.`;
    } else if (difference < -50) {
      analysis = `Rainfall in ${locationData.name} has decreased by ${Math.abs(difference).toFixed(0)}mm (${Math.abs(percentChange).toFixed(1)}%) over the past decade. This may impact water resource planning.`;
    } else {
      analysis = `Rainfall in ${locationData.name} has remained relatively stable over the past decade, with only a slight change of ${difference.toFixed(0)}mm (${percentChange.toFixed(1)}%).`;
    }
  }
  
  // Calculate linear regression for trend line
  const n = trendData.length;
  const sumX = trendData.reduce((sum, point) => sum + point.year, 0);
  const sumY = trendData.reduce((sum, point) => sum + point.value, 0);
  const sumXY = trendData.reduce((sum, point) => sum + (point.year * point.value), 0);
  const sumXX = trendData.reduce((sum, point) => sum + (point.year * point.year), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const trendLine = trendData.map(point => ({
    year: point.year,
    value: slope * point.year + intercept
  }));
  
  return NextResponse.json({
    location: locationData.name,
    dataType,
    trendData,
    trendLine,
    analysis,
    slope,
    annualChange: slope,
    decadeChange: slope * 10
  });
}
