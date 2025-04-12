import { NextRequest, NextResponse } from 'next/server';

// Define regions for Sri Lanka
const regions = [
  {
    name: 'Central Highlands',
    bounds: { minLat: 6.5, maxLat: 7.5, minLng: 80.4, maxLng: 81.0 },
    data: {
      elevation: {
        value: 1250,
        unit: 'meters',
        source: 'SRTM Digital Elevation Model'
      },
      rainfall: {
        annual: 2500,
        unit: 'mm',
        risk: 'moderate',
        source: 'Sri Lanka Meteorological Department'
      },
      soil: {
        type: 'Red-Yellow Podzolic',
        characteristics: 'Well-drained, moderately deep, suitable for construction',
        source: 'Satellite imagery analysis'
      },
      riskAssessment: {
        overall: 'low',
        flood: 'low',
        landslide: 'moderate',
        erosion: 'low'
      }
    }
  },
  {
    name: 'Western Coast',
    bounds: { minLat: 6.0, maxLat: 8.0, minLng: 79.5, maxLng: 80.0 },
    data: {
      elevation: {
        value: 15,
        unit: 'meters',
        source: 'SRTM Digital Elevation Model'
      },
      rainfall: {
        annual: 2300,
        unit: 'mm',
        risk: 'high',
        source: 'Sri Lanka Meteorological Department'
      },
      soil: {
        type: 'Alluvial',
        characteristics: 'Poorly drained, high water table, requires special foundation design',
        source: 'Satellite imagery analysis'
      },
      riskAssessment: {
        overall: 'moderate',
        flood: 'high',
        landslide: 'low',
        erosion: 'moderate'
      }
    }
  },
  {
    name: 'Northern Plains',
    bounds: { minLat: 8.0, maxLat: 9.8, minLng: 79.8, maxLng: 81.0 },
    data: {
      elevation: {
        value: 45,
        unit: 'meters',
        source: 'SRTM Digital Elevation Model'
      },
      rainfall: {
        annual: 1200,
        unit: 'mm',
        risk: 'low',
        source: 'Sri Lanka Meteorological Department'
      },
      soil: {
        type: 'Red-Yellow Latosol',
        characteristics: 'Well-drained, deep, good for construction with proper compaction',
        source: 'Satellite imagery analysis'
      },
      riskAssessment: {
        overall: 'low',
        flood: 'low',
        landslide: 'low',
        erosion: 'moderate'
      }
    }
  },
  {
    name: 'Eastern Coast',
    bounds: { minLat: 6.0, maxLat: 9.0, minLng: 81.3, maxLng: 82.0 },
    data: {
      elevation: {
        value: 20,
        unit: 'meters',
        source: 'SRTM Digital Elevation Model'
      },
      rainfall: {
        annual: 1800,
        unit: 'mm',
        risk: 'moderate',
        source: 'Sri Lanka Meteorological Department'
      },
      soil: {
        type: 'Sandy Regosol',
        characteristics: 'Well-drained, shallow, requires erosion control measures',
        source: 'Satellite imagery analysis'
      },
      riskAssessment: {
        overall: 'moderate',
        flood: 'moderate',
        landslide: 'low',
        erosion: 'high'
      }
    }
  },
  {
    name: 'Southern Hills',
    bounds: { minLat: 5.9, maxLat: 6.5, minLng: 80.3, maxLng: 81.0 },
    data: {
      elevation: {
        value: 350,
        unit: 'meters',
        source: 'SRTM Digital Elevation Model'
      },
      rainfall: {
        annual: 2100,
        unit: 'mm',
        risk: 'moderate',
        source: 'Sri Lanka Meteorological Department'
      },
      soil: {
        type: 'Reddish Brown Earth',
        characteristics: 'Moderately drained, medium depth, suitable for construction with proper drainage',
        source: 'Satellite imagery analysis'
      },
      riskAssessment: {
        overall: 'moderate',
        flood: 'low',
        landslide: 'moderate',
        erosion: 'moderate'
      }
    }
  }
];

// Default data for locations that don't match any region
const defaultSiteData = {
  elevation: {
    value: 100,
    unit: 'meters',
    source: 'SRTM Digital Elevation Model'
  },
  rainfall: {
    annual: 1800,
    unit: 'mm',
    risk: 'moderate',
    source: 'Sri Lanka Meteorological Department'
  },
  soil: {
    type: 'Unknown',
    characteristics: 'Site-specific soil testing recommended before construction',
    source: 'Satellite imagery analysis'
  },
  riskAssessment: {
    overall: 'moderate',
    flood: 'moderate',
    landslide: 'moderate',
    erosion: 'moderate'
  }
};

export async function GET(request: NextRequest) {
  // Get coordinates from URL params
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  // Parse coordinates
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Find the region that contains these coordinates
  let siteData = defaultSiteData;
  let regionName = 'Unknown Region';

  for (const region of regions) {
    const { bounds } = region;
    if (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLng &&
      longitude <= bounds.maxLng
    ) {
      siteData = region.data;
      regionName = region.name;
      break;
    }
  }

  // Add some randomization to make data more realistic
  const randomizedData = {
    ...siteData,
    elevation: {
      ...siteData.elevation,
      value: Math.round(siteData.elevation.value * (0.9 + Math.random() * 0.2)) // ±10%
    },
    rainfall: {
      ...siteData.rainfall,
      annual: Math.round(siteData.rainfall.annual * (0.9 + Math.random() * 0.2)) // ±10%
    }
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return data for the region
  return NextResponse.json({
    coordinates: { lat, lng },
    region: regionName,
    data: randomizedData,
    timestamp: new Date().toISOString()
  });
}
