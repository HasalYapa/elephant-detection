'use client';

import React, { useState, useEffect, useRef } from 'react';
import './map.css';
import dynamic from 'next/dynamic';
import { MapLayer, MapPoint } from '@/lib/mapData';
import { getMarkerColor, getCenterOfPoints, getBoundsOfPoints } from '@/lib/mapUtils';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const LayersControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.LayersControl),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);

// Import Leaflet CSS
const LeafletCSS = () => (
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
    integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
    crossOrigin=""
  />
);

export default function MapDashboardPage() {
  // State for map data
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [visiblePoints, setVisiblePoints] = useState<MapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ref for map
  const mapRef = useRef<any>(null);

  // Fetch map layers on component mount
  useEffect(() => {
    const fetchMapLayers = async () => {
      try {
        const response = await fetch('/api/map-data');
        if (!response.ok) {
          throw new Error('Failed to fetch map data');
        }
        const data = await response.json();

        // Fetch details for each layer
        const layersWithDetails = await Promise.all(
          data.layers.map(async (layerSummary: any) => {
            const detailResponse = await fetch(`/api/map-data?layer=${layerSummary.id}`);
            if (!detailResponse.ok) {
              throw new Error(`Failed to fetch details for layer ${layerSummary.id}`);
            }
            return await detailResponse.json();
          })
        );

        setMapLayers(layersWithDetails);

        // Set initially visible layers
        const initialVisibleLayers = layersWithDetails
          .filter((layer: MapLayer) => layer.visible)
          .map((layer: MapLayer) => layer.id);

        setSelectedLayers(initialVisibleLayers);
      } catch (err) {
        console.error('Error fetching map data:', err);
        setError('Failed to load map data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapLayers();
  }, []);

  // Update visible points when selected layers or filters change
  useEffect(() => {
    if (!mapLayers.length) return;

    // Get points from selected layers
    let points: MapPoint[] = [];

    selectedLayers.forEach(layerId => {
      const layer = mapLayers.find(l => l.id === layerId);
      if (layer) {
        points = [...points, ...layer.points];
      }
    });

    // Apply type filter
    if (typeFilter !== 'all') {
      points = points.filter(point => point.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      points = points.filter(point => point.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      points = points.filter(point =>
        point.name.toLowerCase().includes(query) ||
        point.description.toLowerCase().includes(query)
      );
    }

    setVisiblePoints(points);

    // Reset selected point if it's no longer visible
    if (selectedPoint && !points.some(p => p.id === selectedPoint.id)) {
      setSelectedPoint(null);
    }

    // Update map bounds if points are available
    if (points.length > 0 && mapRef.current) {
      const bounds = getBoundsOfPoints(points);
      mapRef.current.fitBounds(bounds);
    }
  }, [selectedLayers, typeFilter, statusFilter, searchQuery, mapLayers, selectedPoint]);

  // Handle layer toggle
  const handleLayerToggle = (layerId: string) => {
    setSelectedLayers(prev => {
      if (prev.includes(layerId)) {
        return prev.filter(id => id !== layerId);
      } else {
        return [...prev, layerId];
      }
    });
  };

  // Handle point selection
  const handlePointSelect = (point: MapPoint) => {
    setSelectedPoint(point);
  };

  // Get marker icon based on point type
  const getMarkerIcon = (point: MapPoint) => {
    if (typeof window === 'undefined') return null;

    const L = require('leaflet');

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${getMarkerColor(point)}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <>
      <LeafletCSS />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Map Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-lg mb-4">
            Explore civil engineering projects, resources, hazards, and infrastructure across Sri Lanka.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Map Layers</h2>
                    <div className="space-y-2">
                      {mapLayers.map(layer => (
                        <div key={layer.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`layer-${layer.id}`}
                            checked={selectedLayers.includes(layer.id)}
                            onChange={() => handleLayerToggle(layer.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`layer-${layer.id}`} className="ml-2 block text-sm text-gray-900">
                            {layer.name} ({layer.points.length})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">Filters</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          id="type-filter"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="all">All Types</option>
                          <option value="project">Projects</option>
                          <option value="resource">Resources</option>
                          <option value="hazard">Hazards</option>
                          <option value="infrastructure">Infrastructure</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          id="status-filter"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="all">All Statuses</option>
                          <option value="planned">Planned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                        <input
                          type="text"
                          id="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name or description"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">Results</h2>
                    <p className="text-sm text-gray-600 mb-2">
                      Showing {visiblePoints.length} points on the map
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {visiblePoints.map(point => (
                        <div
                          key={point.id}
                          className={`p-2 rounded cursor-pointer text-sm ${
                            selectedPoint?.id === point.id
                              ? 'bg-blue-100 border border-blue-300'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handlePointSelect(point)}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getMarkerColor(point) }}
                            ></div>
                            <span className="font-medium">{point.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{point.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300">
                  {typeof window !== 'undefined' && (
                    <MapContainer
                      center={[7.8731, 80.7718]} // Center of Sri Lanka
                      zoom={8}
                      style={{ height: '100%', width: '100%' }}
                      whenCreated={(map) => { mapRef.current = map; }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {visiblePoints.map(point => (
                        <Marker
                          key={point.id}
                          position={[point.coordinates[1], point.coordinates[0]]}
                          icon={getMarkerIcon(point)}
                          eventHandlers={{
                            click: () => handlePointSelect(point)
                          }}
                        >
                          <Popup>
                            <div>
                              <h3 className="font-bold">{point.name}</h3>
                              <p className="text-sm">{point.description}</p>
                              {point.status && (
                                <p className="text-xs mt-1">
                                  Status: <span className="font-semibold">{point.status}</span>
                                </p>
                              )}
                              {point.riskLevel && (
                                <p className="text-xs mt-1">
                                  Risk Level: <span className="font-semibold">{point.riskLevel}</span>
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      <ZoomControl position="bottomright" />
                    </MapContainer>
                  )}
                </div>

                {selectedPoint && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{selectedPoint.name}</h3>
                      <button
                        onClick={() => setSelectedPoint(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedPoint.description}</p>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Type:</span> {selectedPoint.type.charAt(0).toUpperCase() + selectedPoint.type.slice(1)}</p>
                        {selectedPoint.status && (
                          <p><span className="font-medium">Status:</span> {selectedPoint.status.charAt(0).toUpperCase() + selectedPoint.status.slice(1)}</p>
                        )}
                        {selectedPoint.riskLevel && (
                          <p><span className="font-medium">Risk Level:</span> {selectedPoint.riskLevel.charAt(0).toUpperCase() + selectedPoint.riskLevel.slice(1)}</p>
                        )}
                      </div>
                      <div>
                        <p><span className="font-medium">Coordinates:</span> {selectedPoint.coordinates[1].toFixed(4)}, {selectedPoint.coordinates[0].toFixed(4)}</p>
                      </div>
                    </div>

                    {selectedPoint.properties && Object.keys(selectedPoint.properties).length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium">Additional Information</h4>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          {Object.entries(selectedPoint.properties).map(([key, value]) => (
                            <p key={key}>
                              <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span> {value}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setView(
                              [selectedPoint.coordinates[1], selectedPoint.coordinates[0]],
                              14
                            );
                          }
                        }}
                      >
                        Zoom to Location
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-3">Related CiviWise Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/site-analyzer" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-blue-600">Site Feasibility Analyzer</h3>
                <p className="text-sm text-gray-600 mt-1">Analyze site conditions for construction projects</p>
              </a>
              <a href="/design-assistant" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-blue-600">Civil Design Assistant</h3>
                <p className="text-sm text-gray-600 mt-1">Get design recommendations for your project</p>
              </a>
              <a href="/climate-explorer" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-blue-600">Climate Explorer</h3>
                <p className="text-sm text-gray-600 mt-1">Explore climate data for different regions</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
