import { NextRequest, NextResponse } from 'next/server';
import { mapLayers, sriLankaDistricts } from '@/lib/mapData';

export async function GET(request: NextRequest) {
  // Get parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const layerId = searchParams.get('layer');
  const pointId = searchParams.get('point');
  const dataType = searchParams.get('type') || 'layers'; // layers, districts, or point
  
  // Return specific layer data
  if (dataType === 'layers' && layerId) {
    const layer = mapLayers.find(layer => layer.id === layerId);
    
    if (!layer) {
      return NextResponse.json(
        { error: 'Layer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(layer);
  }
  
  // Return specific point data
  if (dataType === 'point' && pointId) {
    let point = null;
    
    // Search for the point in all layers
    for (const layer of mapLayers) {
      const foundPoint = layer.points.find(point => point.id === pointId);
      if (foundPoint) {
        point = {
          ...foundPoint,
          layer: {
            id: layer.id,
            name: layer.name
          }
        };
        break;
      }
    }
    
    if (!point) {
      return NextResponse.json(
        { error: 'Point not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(point);
  }
  
  // Return district data
  if (dataType === 'districts') {
    return NextResponse.json(sriLankaDistricts);
  }
  
  // Return all layers (default)
  return NextResponse.json({
    layers: mapLayers.map(layer => ({
      id: layer.id,
      name: layer.name,
      description: layer.description,
      visible: layer.visible,
      pointCount: layer.points.length
    }))
  });
}
