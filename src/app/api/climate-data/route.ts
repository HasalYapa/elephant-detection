import { NextRequest, NextResponse } from 'next/server';
import { climateDataset, ClimateData } from '@/lib/climateData';

export async function GET(request: NextRequest) {
  // Get location parameter from URL
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location');
  
  // If location is provided, return data for that location
  if (location) {
    const locationData = climateDataset.find(data => data.id === location);
    
    if (!locationData) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(locationData);
  }
  
  // If no location is provided, return a list of available locations
  const locations = climateDataset.map(data => ({
    id: data.id,
    name: data.name,
    province: data.province,
    coordinates: data.coordinates
  }));
  
  return NextResponse.json({ locations });
}
