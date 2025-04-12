'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ClimateData } from '@/lib/climateData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ClimateExplorerPage() {
  // State for location data
  const [locations, setLocations] = useState<{ id: string; name: string; province: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('colombo');
  const [climateData, setClimateData] = useState<ClimateData | null>(null);

  // State for trend analysis
  const [rainfallTrend, setRainfallTrend] = useState<any>(null);
  const [temperatureTrend, setTemperatureTrend] = useState<any>(null);

  // State for climate recommendations
  const [climateRecommendations, setClimateRecommendations] = useState<any>(null);

  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/climate-data');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        setLocations(data.locations);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
      }
    };

    fetchLocations();
  }, []);

  // Fetch climate data when selected location changes
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchClimateData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/climate-data?location=${selectedLocation}`);
        if (!response.ok) {
          throw new Error('Failed to fetch climate data');
        }
        const data = await response.json();
        setClimateData(data);
      } catch (err) {
        console.error('Error fetching climate data:', err);
        setError('Failed to load climate data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClimateData();
  }, [selectedLocation]);

  // Fetch trend analysis and recommendations when selected location changes
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchTrendData = async () => {
      try {
        // Fetch rainfall trend
        const rainfallResponse = await fetch(`/api/climate-trends?location=${selectedLocation}&dataType=rainfall`);
        if (!rainfallResponse.ok) {
          throw new Error('Failed to fetch rainfall trend data');
        }
        const rainfallData = await rainfallResponse.json();
        setRainfallTrend(rainfallData);

        // Fetch temperature trend
        const temperatureResponse = await fetch(`/api/climate-trends?location=${selectedLocation}&dataType=temperature`);
        if (!temperatureResponse.ok) {
          throw new Error('Failed to fetch temperature trend data');
        }
        const temperatureData = await temperatureResponse.json();
        setTemperatureTrend(temperatureData);

        // Fetch climate recommendations
        const recommendationsResponse = await fetch(`/api/climate-recommendations?location=${selectedLocation}`);
        if (!recommendationsResponse.ok) {
          throw new Error('Failed to fetch climate recommendations');
        }
        const recommendationsData = await recommendationsResponse.json();
        setClimateRecommendations(recommendationsData);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError('Failed to load trend data. Please try again later.');
      }
    };

    fetchTrendData();
  }, [selectedLocation]);

  // Prepare monthly rainfall chart data
  const rainfallChartData = {
    labels: climateData?.monthlyData.map(data => data.month) || [],
    datasets: [
      {
        label: 'Monthly Rainfall (mm)',
        data: climateData?.monthlyData.map(data => data.rainfall) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Prepare monthly temperature chart data
  const temperatureChartData = {
    labels: climateData?.monthlyData.map(data => data.month) || [],
    datasets: [
      {
        label: 'Monthly Temperature (°C)',
        data: climateData?.monthlyData.map(data => data.temperature) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Prepare rainfall trend chart data
  const rainfallTrendChartData = {
    labels: rainfallTrend?.trendData.map((data: any) => data.year) || [],
    datasets: [
      {
        label: 'Annual Rainfall (mm)',
        data: rainfallTrend?.trendData.map((data: any) => data.value) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Trend Line',
        data: rainfallTrend?.trendLine.map((data: any) => data.value) || [],
        backgroundColor: 'rgba(255, 99, 132, 0)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  // Prepare temperature trend chart data
  const temperatureTrendChartData = {
    labels: temperatureTrend?.trendData.map((data: any) => data.year) || [],
    datasets: [
      {
        label: 'Annual Temperature (°C)',
        data: temperatureTrend?.trendData.map((data: any) => data.value) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Trend Line',
        data: temperatureTrend?.trendLine.map((data: any) => data.value) || [],
        backgroundColor: 'rgba(54, 162, 235, 0)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Climate Explorer</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-lg mb-4">
          Explore climate data for different regions in Sri Lanka, including rainfall patterns,
          temperature trends, and extreme weather events.
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Location Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Select Location</label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}, {location.province} Province
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              {climateData && (
                <div>
                  <h3 className="font-medium text-gray-900">{climateData.name} Climate Summary</h3>
                  <p className="text-sm text-gray-600 mt-1">Elevation: {climateData.elevation}m</p>
                  <p className="text-sm text-gray-600">Annual Rainfall: {climateData.annualRainfall}mm</p>
                  <p className="text-sm text-gray-600">Average Temperature: {climateData.averageTemperature}°C</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : climateData && (
          <div className="space-y-8">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Monthly Rainfall Pattern</h2>
              <div className="h-80">
                <Bar data={rainfallChartData} options={chartOptions} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  {climateData.name} experiences {
                    climateData.monthlyData.reduce((max, month) => month.rainfall > max.rainfall ? month : max, climateData.monthlyData[0]).month
                  } as the wettest month with {
                    climateData.monthlyData.reduce((max, month) => month.rainfall > max.rainfall ? month : max, climateData.monthlyData[0]).rainfall
                  }mm of rainfall, while {
                    climateData.monthlyData.reduce((min, month) => month.rainfall < min.rainfall ? month : min, climateData.monthlyData[0]).month
                  } is the driest with only {
                    climateData.monthlyData.reduce((min, month) => month.rainfall < min.rainfall ? month : min, climateData.monthlyData[0]).rainfall
                  }mm.
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Monthly Temperature Pattern</h2>
              <div className="h-80">
                <Line data={temperatureChartData} options={chartOptions} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  {climateData.name} experiences {
                    climateData.monthlyData.reduce((max, month) => month.temperature > max.temperature ? month : max, climateData.monthlyData[0]).month
                  } as the hottest month with an average of {
                    climateData.monthlyData.reduce((max, month) => month.temperature > max.temperature ? month : max, climateData.monthlyData[0]).temperature
                  }°C, while {
                    climateData.monthlyData.reduce((min, month) => month.temperature < min.temperature ? month : min, climateData.monthlyData[0]).month
                  } is the coolest at {
                    climateData.monthlyData.reduce((min, month) => month.temperature < min.temperature ? month : min, climateData.monthlyData[0]).temperature
                  }°C.
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Rainfall Trend Analysis</h2>
              <div className="h-80">
                <Line data={rainfallTrendChartData} options={chartOptions} />
              </div>
              {rainfallTrend && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>{rainfallTrend.analysis}</p>
                  <p className="mt-2">
                    Annual change rate: {rainfallTrend.annualChange > 0 ? '+' : ''}{rainfallTrend.annualChange.toFixed(1)}mm per year
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Temperature Trend Analysis</h2>
              <div className="h-80">
                <Line data={temperatureTrendChartData} options={chartOptions} />
              </div>
              {temperatureTrend && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>{temperatureTrend.analysis}</p>
                  <p className="mt-2">
                    Annual change rate: {temperatureTrend.annualChange > 0 ? '+' : ''}{temperatureTrend.annualChange.toFixed(2)}°C per year
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Extreme Weather Events</h2>
              <div className="space-y-4">
                {climateData.extremeEvents.length > 0 ? (
                  climateData.extremeEvents.map((event, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          event.severity === 'extreme' ? 'bg-red-500' :
                          event.severity === 'high' ? 'bg-orange-500' :
                          event.severity === 'moderate' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <h3 className="font-medium text-gray-900">
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} - {new Date(event.date).toLocaleDateString()}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.affectedAreas.map((area, i) => (
                          <span key={i} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No extreme weather events recorded for this location.</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Climate Implications for Construction</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Design Recommendations</h3>
                <ul className="mt-2 space-y-2 text-sm text-blue-800">
                  {climateRecommendations && climateRecommendations.recommendations ? (
                    climateRecommendations.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recommendation}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong>Drainage Systems:</strong> Design for peak rainfall of {
                            climateData.monthlyData.reduce((max, month) => month.rainfall > max.rainfall ? month : max, climateData.monthlyData[0]).rainfall
                          }mm in {
                            climateData.monthlyData.reduce((max, month) => month.rainfall > max.rainfall ? month : max, climateData.monthlyData[0]).month
                          }.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong>Material Selection:</strong> Consider temperature range of {
                            climateData.monthlyData.reduce((min, month) => month.temperature < min.temperature ? month : min, climateData.monthlyData[0]).temperature
                          }°C to {
                            climateData.monthlyData.reduce((max, month) => month.temperature > max.temperature ? month : max, climateData.monthlyData[0]).temperature
                          }°C for thermal expansion.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong>Construction Scheduling:</strong> Plan for potential delays during {
                            climateData.monthlyData.slice().sort((a, b) => b.rainfall - a.rainfall).slice(0, 3).map(m => m.month).join(', ')
                          } due to heavy rainfall.
                        </span>
                      </li>
                    </>
                  )}
                </ul>

                {climateRecommendations && climateRecommendations.insights && (
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Climate Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                      <div>
                        <p><strong>Wettest Months:</strong> {climateRecommendations.insights.wettestMonths.map((m: any) => m.month).join(', ')}</p>
                        <p><strong>Driest Months:</strong> {climateRecommendations.insights.driestMonths.map((m: any) => m.month).join(', ')}</p>
                        <p><strong>Rainfall Variability:</strong> {(climateRecommendations.insights.rainfallVariability * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p><strong>Hottest Months:</strong> {climateRecommendations.insights.hottestMonths.map((m: any) => m.month).join(', ')}</p>
                        <p><strong>Coolest Months:</strong> {climateRecommendations.insights.coolestMonths.map((m: any) => m.month).join(', ')}</p>
                        <p><strong>Temperature Range:</strong> {climateRecommendations.insights.temperatureRange.toFixed(1)}°C</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-3">Related CiviWise Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/site-analyzer" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-blue-600">Site Feasibility Analyzer</h3>
              <p className="text-sm text-gray-600 mt-1">Analyze site conditions including rainfall and flood risk</p>
            </a>
            <a href="/design-assistant" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-blue-600">Civil Design Assistant</h3>
              <p className="text-sm text-gray-600 mt-1">Get climate-aware design recommendations</p>
            </a>
            <a href="/code-helper" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-blue-600">Code Helper</h3>
              <p className="text-sm text-gray-600 mt-1">Access climate-related building codes and regulations</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
