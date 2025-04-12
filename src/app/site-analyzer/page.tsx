'use client';

import React, { useState } from 'react';
import MapComponent from '../../components/MapComponent';
import ClimateSmartScore from '../../components/ClimateSmartScore';

interface SiteData {
  coordinates: {
    lat: string | null;
    lng: string | null;
  };
  region?: string;
  data: {
    elevation: {
      value: number;
      unit: string;
      source: string;
    };
    rainfall: {
      annual: number;
      unit: string;
      risk: string;
      source: string;
    };
    soil: {
      type: string;
      characteristics: string;
      source: string;
    };
    riskAssessment: {
      overall: string;
      flood: string;
      landslide: string;
      erosion: string;
    };
  };
  timestamp: string;
}

export default function SiteAnalyzerPage() {
  const [latitude, setLatitude] = useState<string>('7.8731');
  const [longitude, setLongitude] = useState<string>('80.7718');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    setLongitude(lngLat.lng.toFixed(6));
    setLatitude(lngLat.lat.toFixed(6));
  };

  const analyzeSite = async () => {
    if (!latitude || !longitude) {
      setError('Please enter both latitude and longitude');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add a console log to debug the request
      console.log(`Fetching data for coordinates: ${latitude}, ${longitude}`);

      const response = await fetch(`/api/site-data?lat=${latitude}&lng=${longitude}`);

      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`Failed to fetch site data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setSiteData(data);
    } catch (err) {
      console.error('Error in analyzeSite:', err);
      setError('An error occurred while analyzing the site. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Site Feasibility Analyzer</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-lg mb-4">
          Enter a project location to analyze site feasibility based on elevation data,
          rainfall/flood risk, and soil type prediction.
        </p>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Location Input</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden h-64">
              <MapComponent
                height="100%"
                width="100%"
                initialCenter={[parseFloat(longitude), parseFloat(latitude)]}
                initialZoom={6}
                onMapClick={handleMapClick}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="text"
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 7.8731"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="text"
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 80.7718"
                />
              </div>
              <button
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={analyzeSite}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Site'}
              </button>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">Analysis Results</h2>
            {siteData && siteData.region && (
              <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800">
                  <span className="font-medium">Region:</span> {siteData.region}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Elevation Data</h3>
                {siteData ? (
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-blue-600">{siteData.data.elevation.value} {siteData.data.elevation.unit}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {siteData.data.elevation.source}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Select a location to view elevation data</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Rainfall/Flood Risk</h3>
                {siteData ? (
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-blue-600">{siteData.data.rainfall.annual} {siteData.data.rainfall.unit}/year</p>
                    <p className="mt-1">
                      Risk Level:
                      <span className={`ml-1 font-medium ${
                        siteData.data.rainfall.risk === 'low' ? 'text-green-600' :
                        siteData.data.rainfall.risk === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {siteData.data.rainfall.risk.charAt(0).toUpperCase() + siteData.data.rainfall.risk.slice(1)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Source: {siteData.data.rainfall.source}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Select a location to view rainfall data</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Soil Type Prediction</h3>
                {siteData ? (
                  <div className="mt-2">
                    <p className="text-lg font-bold text-blue-600">{siteData.data.soil.type}</p>
                    <p className="text-sm mt-1">{siteData.data.soil.characteristics}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {siteData.data.soil.source}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Select a location to view soil data</p>
                )}
              </div>
            </div>
          </div>

          {siteData && (
            <>
              {/* Climate Smart Score */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Climate Smart Score</h2>
                <ClimateSmartScore
                  siteData={{
                    region: siteData.region || 'Central Highlands',
                    elevation: siteData.data.elevation.value,
                    rainfall: siteData.data.rainfall.annual,
                    soilType: siteData.data.soil.type,
                    floodRisk: siteData.data.riskAssessment.flood as 'low' | 'moderate' | 'high',
                    landslideRisk: siteData.data.riskAssessment.landslide as 'low' | 'moderate' | 'high',
                    erosionRisk: siteData.data.riskAssessment.erosion as 'low' | 'moderate' | 'high'
                  }}
                />
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Site Risk Report</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Overall Risk Assessment</h3>
                  <div className="flex items-center">
                    <div className={`w-24 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      siteData.data.riskAssessment.overall === 'low' ? 'bg-green-500' :
                      siteData.data.riskAssessment.overall === 'moderate' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {siteData.data.riskAssessment.overall.toUpperCase()}
                    </div>
                    <p className="ml-3 text-gray-700">
                      This site has a {siteData.data.riskAssessment.overall} overall risk for construction.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Flood Risk</h4>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      siteData.data.riskAssessment.flood === 'low' ? 'bg-green-100 text-green-800' :
                      siteData.data.riskAssessment.flood === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {siteData.data.riskAssessment.flood.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Landslide Risk</h4>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      siteData.data.riskAssessment.landslide === 'low' ? 'bg-green-100 text-green-800' :
                      siteData.data.riskAssessment.landslide === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {siteData.data.riskAssessment.landslide.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Erosion Risk</h4>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      siteData.data.riskAssessment.erosion === 'low' ? 'bg-green-100 text-green-800' :
                      siteData.data.riskAssessment.erosion === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {siteData.data.riskAssessment.erosion.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">Risk Mitigation Recommendations</h4>
                  <ul className="mt-2 text-xs text-gray-600 space-y-1 list-disc pl-4">
                    {siteData.data.riskAssessment.flood === 'high' && (
                      <li>Consider elevated foundations and proper drainage systems</li>
                    )}
                    {(siteData.data.riskAssessment.landslide === 'high' || siteData.data.riskAssessment.landslide === 'moderate') && (
                      <li>Implement slope stabilization measures and retaining walls</li>
                    )}
                    {siteData.data.riskAssessment.erosion === 'high' && (
                      <li>Install erosion control measures such as vegetation and drainage</li>
                    )}
                    {siteData.data.riskAssessment.overall === 'low' && (
                      <li>Standard construction practices should be sufficient</li>
                    )}
                    {siteData.data.soil.type === 'Alluvial' && (
                      <li>Special foundation design required for alluvial soil</li>
                    )}
                    {siteData.data.rainfall.risk === 'high' && (
                      <li>Design for high rainfall with enhanced drainage capacity</li>
                    )}
                  </ul>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Analysis based on data from multiple sources including satellite imagery, meteorological data, and geological surveys.</p>
                  <p className="mt-1">Generated on: {new Date(siteData.timestamp).toLocaleString()}</p>
                </div>
              </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
