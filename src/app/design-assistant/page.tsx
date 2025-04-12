'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { generatePDF } from '../../lib/pdfGenerator';
import { generateDXF } from '../../lib/dxfGenerator';
import { generateSimpleDXF } from '../../lib/simpleDxfGenerator';
import { generateEnhancedDXF } from '../../lib/enhancedDxfGenerator';
import { generateProfessionalDXF } from '../../lib/professionalDxfGenerator';
import { exportAsText } from '../../lib/textExporter';
import { exportAsCSV } from '../../lib/csvExporter';
import Notification from '../../components/Notification';
import HelpModal from '../../components/HelpModal';

// Define types for our form and recommendations
interface FormData {
  projectType: string;
  location: string;
  soilType: string;
  terrain: string;
  buildingHeight?: string;
  buildingArea?: string;
  proximityToWater?: string;
}

interface Recommendations {
  foundation: {
    type: string;
    description: string;
    considerations: string[];
  };
  drainage: {
    type: string;
    description: string;
    considerations: string[];
  };
  slopeStability: {
    risk: 'low' | 'moderate' | 'high';
    description: string;
    recommendations: string[];
  };
}

export default function DesignAssistantPage() {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    projectType: '',
    location: '',
    soilType: '',
    terrain: '',
    buildingHeight: '',
    buildingArea: '',
    proximityToWater: '',
  });

  // State for recommendations
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);

  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  // State for showing additional fields
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  // State for notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // State for help modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Show additional fields when project type is selected
    if (name === 'projectType' && value) {
      setShowAdditionalFields(true);
    }
  };

  // Generate recommendations based on form data
  const generateRecommendations = async () => {
    setIsLoading(true);

    try {
      // Call the API endpoint
      const response = await fetch('/api/design-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate recommendations: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // You could set an error state here to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine if form is complete enough to generate recommendations
  const isFormValid = () => {
    return formData.projectType && formData.soilType && formData.terrain;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Civil Design Assistant</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-lg mb-4">
          Choose a project type to get recommendations for foundation type, drainage needs,
          and slope stability guidance based on site conditions.
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Project Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">Project Type</label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a project type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment Building</option>
                <option value="bridge">Bridge</option>
                <option value="retaining-wall">Retaining Wall</option>
                <option value="road">Road</option>
                <option value="culvert">Culvert</option>
              </select>
            </div>

            {showAdditionalFields && (
              <>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Project Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter location or coordinates"
                  />
                </div>

                <div>
                  <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">Soil Type</label>
                  <select
                    id="soilType"
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select soil type</option>
                    <option value="clay">Clay</option>
                    <option value="silt">Silt</option>
                    <option value="sand">Sand</option>
                    <option value="gravel">Gravel</option>
                    <option value="rock">Rock</option>
                    <option value="organic">Organic</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="terrain" className="block text-sm font-medium text-gray-700">Terrain Type</label>
                  <select
                    id="terrain"
                    name="terrain"
                    value={formData.terrain}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select terrain type</option>
                    <option value="flat">Flat</option>
                    <option value="gentle-slope">Gentle Slope</option>
                    <option value="steep-slope">Steep Slope</option>
                    <option value="hill-top">Hill Top</option>
                    <option value="valley">Valley</option>
                    <option value="coastal">Coastal</option>
                  </select>
                </div>

                {(formData.projectType === 'house' || formData.projectType === 'apartment') && (
                  <>
                    <div>
                      <label htmlFor="buildingHeight" className="block text-sm font-medium text-gray-700">Building Height (m)</label>
                      <input
                        type="text"
                        id="buildingHeight"
                        name="buildingHeight"
                        value={formData.buildingHeight}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div>
                      <label htmlFor="buildingArea" className="block text-sm font-medium text-gray-700">Building Area (sq.m)</label>
                      <input
                        type="text"
                        id="buildingArea"
                        name="buildingArea"
                        value={formData.buildingArea}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., 200"
                      />
                    </div>
                  </>
                )}

                {(formData.projectType === 'bridge' || formData.projectType === 'culvert' || formData.projectType === 'retaining-wall') && (
                  <div>
                    <label htmlFor="proximityToWater" className="block text-sm font-medium text-gray-700">Proximity to Water Body</label>
                    <select
                      id="proximityToWater"
                      name="proximityToWater"
                      value={formData.proximityToWater}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select proximity</option>
                      <option value="adjacent">Adjacent (0-10m)</option>
                      <option value="near">Near (10-50m)</option>
                      <option value="distant">Distant (>50m)</option>
                      <option value="none">No water body nearby</option>
                    </select>
                  </div>
                )}

                <button
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${(!isFormValid() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={generateRecommendations}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Recommendations'}
                </button>
              </>
            )}
          </div>
        </div>

        {recommendations && (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Design Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Foundation Type</h3>
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {recommendations.foundation.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{recommendations.foundation.description}</p>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key Considerations:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {recommendations.foundation.considerations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Drainage Needs</h3>
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {recommendations.drainage.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{recommendations.drainage.description}</p>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key Considerations:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {recommendations.drainage.considerations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Slope Stability</h3>
                  <div className="mb-2">
                    <span className={`inline-block text-sm font-medium px-2.5 py-0.5 rounded ${
                      recommendations.slopeStability.risk === 'low' ? 'bg-green-100 text-green-800' :
                      recommendations.slopeStability.risk === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recommendations.slopeStability.risk.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{recommendations.slopeStability.description}</p>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {recommendations.slopeStability.recommendations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Export Options</h2>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                  onClick={() => {
                    generatePDF(formData, recommendations);
                    setNotification({ message: 'PDF report downloaded successfully!', type: 'success' });
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Download PDF Report
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                  onClick={() => {
                    try {
                      // Try the professional DXF generator first (most advanced version)
                      const success = generateProfessionalDXF(formData, recommendations);
                      if (success) {
                        setNotification({
                          message: 'Professional AutoCAD DXF file with schematics downloaded successfully!',
                          type: 'success'
                        });
                        return;
                      }

                      // If professional DXF fails, try the enhanced DXF generator
                      const enhancedSuccess = generateEnhancedDXF(formData, recommendations);
                      if (enhancedSuccess) {
                        setNotification({ message: 'Enhanced AutoCAD DXF file downloaded successfully!', type: 'success' });
                        return;
                      }

                      // If enhanced DXF fails, try the simple DXF generator
                      generateSimpleDXF(formData, recommendations);
                      setNotification({ message: 'AutoCAD DXF file downloaded successfully!', type: 'success' });
                    } catch (error) {
                      console.error('Error with DXF generators:', error);
                      try {
                        // Try CSV export as second option
                        exportAsCSV(formData, recommendations);
                        setNotification({
                          message: 'Exported as CSV file for AutoCAD import. DXF generation failed.',
                          type: 'info'
                        });
                      } catch (csvError) {
                        console.error('Error with CSV export:', csvError);
                        try {
                          // Fallback to text export as last resort
                          exportAsText(formData, recommendations);
                          setNotification({
                            message: 'Exported as text file with AutoCAD instructions. Other export methods failed.',
                            type: 'info'
                          });
                        } catch (textError) {
                          console.error('Error with text export:', textError);
                          setNotification({ message: 'Error exporting to AutoCAD. Please try again.', type: 'error' });
                        }
                      }
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export to AutoCAD
                </button>

                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-2"
                  onClick={() => setIsHelpModalOpen(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  How to Use
                </button>
              </div>
            </div>


          </div>
        )}
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Help Modal */}
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          title="How to Use AutoCAD Export"
          content={
          <div className="space-y-4">
            <p>CiviWise provides multiple ways to export your design recommendations to AutoCAD:</p>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="font-bold text-lg">Professional DXF File (Preferred Method)</h3>
              <p className="mt-1">The system will attempt to generate a professional DXF file with foundation schematics, which is the native format for AutoCAD.</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Click the "Export to AutoCAD" button</li>
                <li>Save the .dxf file when prompted</li>
                <li>In AutoCAD, use the "Insert" command or drag and drop the file</li>
                <li>The file includes proper layers, blocks, and foundation schematics</li>
                <li>All entities are organized by layer for easy editing</li>
              </ol>
              <p className="text-sm text-gray-600 mt-2">This method includes visual schematics of foundation types and proper AutoCAD entities.</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <h3 className="font-bold text-lg">CSV File (Alternative Method)</h3>
              <p className="mt-1">If DXF generation fails, a CSV file will be created as a fallback.</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>In AutoCAD, go to Insert → Data Link</li>
                <li>Create a new Excel Data Link and select the CSV file</li>
                <li>Follow the wizard to import the data</li>
                <li>Use the TEXT command to convert data points to text entities</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-bold text-lg">Text File (Last Resort)</h3>
              <p className="mt-1">If both DXF and CSV methods fail, a text file with instructions will be provided.</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>In AutoCAD, use the MTEXT command</li>
                <li>Create a text box by clicking two points</li>
                <li>Copy and paste the content from the text file</li>
                <li>Format as needed</li>
              </ol>
            </div>

            <p className="text-sm text-gray-600 mt-4">Note: The export method used will be indicated in the notification message that appears after clicking the "Export to AutoCAD" button.</p>
          </div>
        }
      />

    </div>
  );
}
