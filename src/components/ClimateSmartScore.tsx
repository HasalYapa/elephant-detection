'use client';

import React from 'react';

interface ClimateScoreProps {
  siteData: {
    region: string;
    elevation: number;
    rainfall: number;
    soilType: string;
    floodRisk: 'low' | 'moderate' | 'high';
    landslideRisk: 'low' | 'moderate' | 'high';
    erosionRisk: 'low' | 'moderate' | 'high';
  };
  projectData?: {
    projectType: string;
    buildingHeight?: string;
    buildingArea?: string;
    proximityToWater?: string;
    terrain?: string;
  };
}

interface ScoreResult {
  score: number;
  starRating: number;
  category: string;
  badges: string[];
  floodScore: number;
  heatScore: number;
  waterScore: number;
  erosionScore: number;
  recommendations: string[];
}

const ClimateSmartScore: React.FC<ClimateScoreProps> = ({ siteData, projectData }) => {

  // Calculate the Climate Smart Score
  const scoreResult = calculateClimateSmartScore(siteData, projectData);

  // Generate star display
  const stars = Array(5).fill(0).map((_, i) => (
    <span key={i} className={`text-2xl ${i < scoreResult.starRating ? 'text-yellow-400' : 'text-gray-300'}`}>
      ★
    </span>
  ));

  // Get category color
  const getCategoryColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-500 text-green-800';
    if (score >= 60) return 'bg-blue-100 border-blue-500 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    if (score >= 20) return 'bg-orange-100 border-orange-500 text-orange-800';
    return 'bg-red-100 border-red-500 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Climate Smart Score</h2>

      <div className="flex flex-col md:flex-row items-center mb-6">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className={`text-center p-4 rounded-full border-4 ${getScoreColor(scoreResult.score)} h-24 w-24 flex items-center justify-center`}>
            <span className="text-3xl font-bold">{scoreResult.score}</span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <div className="flex mb-2">
            {stars}
          </div>
          <h3 className={`text-xl font-semibold ${getCategoryColor(scoreResult.score)}`}>
            {scoreResult.category}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Flood Resilience</h4>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${scoreResult.floodScore}%` }}></div>
            </div>
            <span className="ml-2 text-sm font-medium text-blue-800">{scoreResult.floodScore}</span>
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <h4 className="font-medium text-red-800 mb-1">Heat Management</h4>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${scoreResult.heatScore}%` }}></div>
            </div>
            <span className="ml-2 text-sm font-medium text-red-800">{scoreResult.heatScore}</span>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="font-medium text-green-800 mb-1">Water Management</h4>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${scoreResult.waterScore}%` }}></div>
            </div>
            <span className="ml-2 text-sm font-medium text-green-800">{scoreResult.waterScore}</span>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-1">Erosion Control</h4>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${scoreResult.erosionScore}%` }}></div>
            </div>
            <span className="ml-2 text-sm font-medium text-yellow-800">{scoreResult.erosionScore}</span>
          </div>
        </div>
      </div>

      {scoreResult.badges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Earned Badges</h3>
          <div className="flex flex-wrap gap-2">
            {scoreResult.badges.includes('floodMaster') && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">🌊</span> Flood Master
              </div>
            )}
            {scoreResult.badges.includes('heatTamer') && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">🌡️</span> Heat Tamer
              </div>
            )}
            {scoreResult.badges.includes('waterWizard') && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">💧</span> Water Wizard
              </div>
            )}
            {scoreResult.badges.includes('climateChampion') && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">🏆</span> Climate Champion
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Improvement Recommendations</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {scoreResult.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate the Climate Smart Score
function calculateClimateSmartScore(
  siteData: ClimateScoreProps['siteData'],
  projectData?: ClimateScoreProps['projectData']
): ScoreResult {
  // Base scores calculation
  let floodScore = calculateFloodScore(siteData);
  let heatScore = calculateHeatScore(siteData);
  let waterScore = calculateWaterScore(siteData);
  let erosionScore = calculateErosionScore(siteData);

  // Apply project-specific adjustments if available
  if (projectData) {
    floodScore = adjustFloodScore(floodScore, siteData, projectData);
    heatScore = adjustHeatScore(heatScore, siteData, projectData);
    waterScore = adjustWaterScore(waterScore, siteData, projectData);
    erosionScore = adjustErosionScore(erosionScore, siteData, projectData);
  }

  // Calculate weighted score based on region
  const weights = getRegionalWeights(siteData.region);
  const weightedScore = (
    floodScore * weights.flood +
    heatScore * weights.heat +
    waterScore * weights.water +
    erosionScore * weights.erosion
  ) / (weights.flood + weights.heat + weights.water + weights.erosion);

  // Round to nearest integer
  const finalScore = Math.round(weightedScore);

  // Determine star rating (1-5)
  const starRating = Math.max(1, Math.min(5, Math.ceil(finalScore / 20)));

  // Determine category
  let category = 'Poor';
  if (finalScore >= 80) category = 'Excellent';
  else if (finalScore >= 60) category = 'Good';
  else if (finalScore >= 40) category = 'Average';
  else if (finalScore >= 20) category = 'BelowAverage';

  // Generate badges
  const badges: string[] = [];
  if (floodScore >= 85) badges.push('floodMaster');
  if (heatScore >= 85) badges.push('heatTamer');
  if (waterScore >= 85) badges.push('waterWizard');
  if (finalScore >= 90) badges.push('climateChampion');

  // Generate recommendations
  const recommendations = generateRecommendations(siteData, projectData, {
    floodScore, heatScore, waterScore, erosionScore
  });

  return {
    score: finalScore,
    starRating,
    category,
    badges,
    floodScore,
    heatScore,
    waterScore,
    erosionScore,
    recommendations
  };
}

// Helper functions for score calculations
function calculateFloodScore(siteData: ClimateScoreProps['siteData']): number {
  let score = 50; // Base score

  // Adjust based on flood risk
  if (siteData.floodRisk === 'low') score += 30;
  else if (siteData.floodRisk === 'moderate') score += 10;
  else score -= 20;

  // Adjust based on elevation
  if (siteData.elevation > 100) score += 15;
  else if (siteData.elevation > 50) score += 5;
  else score -= 5;

  // Adjust based on rainfall
  if (siteData.rainfall < 1500) score += 10;
  else if (siteData.rainfall < 2500) score -= 5;
  else score -= 15;

  return Math.max(0, Math.min(100, score));
}

function calculateHeatScore(siteData: ClimateScoreProps['siteData']): number {
  let score = 60; // Base score

  // Adjust based on elevation (higher elevation = cooler)
  if (siteData.elevation > 1000) score += 25;
  else if (siteData.elevation > 500) score += 15;
  else if (siteData.elevation > 100) score += 5;

  // Adjust based on region
  if (siteData.region === 'Central Highlands') score += 20;
  else if (siteData.region === 'Western Coast') score -= 10;
  else if (siteData.region === 'Northern Plains') score -= 15;

  return Math.max(0, Math.min(100, score));
}

function calculateWaterScore(siteData: ClimateScoreProps['siteData']): number {
  let score = 55; // Base score

  // Adjust based on rainfall
  if (siteData.rainfall > 3000) score += 25;
  else if (siteData.rainfall > 2000) score += 15;
  else if (siteData.rainfall > 1000) score += 5;
  else score -= 10;

  // Adjust based on soil type
  if (siteData.soilType === 'Clay') score -= 10;
  else if (siteData.soilType === 'Sandy') score += 5;
  else if (siteData.soilType === 'Loamy') score += 15;

  return Math.max(0, Math.min(100, score));
}

function calculateErosionScore(siteData: ClimateScoreProps['siteData']): number {
  let score = 50; // Base score

  // Adjust based on erosion risk
  if (siteData.erosionRisk === 'low') score += 30;
  else if (siteData.erosionRisk === 'moderate') score += 10;
  else score -= 20;

  // Adjust based on soil type
  if (siteData.soilType === 'Rocky') score += 20;
  else if (siteData.soilType === 'Clay') score += 10;
  else if (siteData.soilType === 'Sandy') score -= 15;

  // Adjust based on rainfall
  if (siteData.rainfall > 3000) score -= 15;
  else if (siteData.rainfall > 2000) score -= 5;

  return Math.max(0, Math.min(100, score));
}

// Project-specific adjustments
function adjustFloodScore(
  score: number,
  siteData: ClimateScoreProps['siteData'],
  projectData: ClimateScoreProps['projectData']
): number {
  let adjustedScore = score;

  if (projectData.proximityToWater === 'very close') {
    adjustedScore -= 20;
  } else if (projectData.proximityToWater === 'nearby') {
    adjustedScore -= 10;
  }

  if (projectData.projectType === 'bridge' || projectData.projectType === 'culvert') {
    adjustedScore -= 15;
  }

  if (projectData.terrain === 'flat') {
    adjustedScore -= 5;
  } else if (projectData.terrain === 'sloped') {
    adjustedScore += 10;
  }

  return Math.max(0, Math.min(100, adjustedScore));
}

function adjustHeatScore(
  score: number,
  siteData: ClimateScoreProps['siteData'],
  projectData: ClimateScoreProps['projectData']
): number {
  let adjustedScore = score;

  if (projectData.projectType === 'house' || projectData.projectType === 'apartment') {
    if (projectData.buildingHeight === 'high-rise') {
      adjustedScore -= 15;
    } else if (projectData.buildingHeight === 'mid-rise') {
      adjustedScore -= 5;
    }

    if (projectData.buildingArea === 'large') {
      adjustedScore -= 10;
    }
  }

  return Math.max(0, Math.min(100, adjustedScore));
}

function adjustWaterScore(
  score: number,
  siteData: ClimateScoreProps['siteData'],
  projectData: ClimateScoreProps['projectData']
): number {
  let adjustedScore = score;

  if (projectData.projectType === 'house' || projectData.projectType === 'apartment') {
    if (projectData.buildingArea === 'large') {
      adjustedScore -= 15;
    } else if (projectData.buildingArea === 'medium') {
      adjustedScore -= 5;
    }
  }

  if (projectData.proximityToWater === 'very close') {
    adjustedScore += 15;
  } else if (projectData.proximityToWater === 'nearby') {
    adjustedScore += 5;
  }

  return Math.max(0, Math.min(100, adjustedScore));
}

function adjustErosionScore(
  score: number,
  siteData: ClimateScoreProps['siteData'],
  projectData: ClimateScoreProps['projectData']
): number {
  let adjustedScore = score;

  if (projectData.terrain === 'steep') {
    adjustedScore -= 25;
  } else if (projectData.terrain === 'sloped') {
    adjustedScore -= 15;
  }

  if (projectData.projectType === 'road' || projectData.projectType === 'retaining-wall') {
    adjustedScore -= 10;
  }

  return Math.max(0, Math.min(100, adjustedScore));
}

// Regional weights
function getRegionalWeights(region: string): { flood: number; heat: number; water: number; erosion: number } {
  switch (region) {
    case 'Western Coast':
      return { flood: 0.4, heat: 0.3, water: 0.2, erosion: 0.1 };
    case 'Central Highlands':
      return { flood: 0.2, heat: 0.1, water: 0.3, erosion: 0.4 };
    case 'Northern Plains':
      return { flood: 0.3, heat: 0.4, water: 0.2, erosion: 0.1 };
    case 'Eastern Coast':
      return { flood: 0.4, heat: 0.2, water: 0.3, erosion: 0.1 };
    case 'Southern Hills':
      return { flood: 0.3, heat: 0.2, water: 0.2, erosion: 0.3 };
    default:
      return { flood: 0.25, heat: 0.25, water: 0.25, erosion: 0.25 };
  }
}

// Generate recommendations
function generateRecommendations(
  siteData: ClimateScoreProps['siteData'],
  projectData?: ClimateScoreProps['projectData'],
  scores?: { floodScore: number; heatScore: number; waterScore: number; erosionScore: number }
): string[] {
  const recommendations: string[] = [];

  // Flood recommendations
  if (scores?.floodScore < 50 || siteData.floodRisk === 'high') {
    recommendations.push('Elevate the building foundation to reduce flood risk.');
    recommendations.push('Implement proper drainage systems around the construction site.');
    recommendations.push('Consider flood barriers or retaining walls for additional protection.');
  }

  // Heat recommendations
  if (scores?.heatScore < 60) {
    recommendations.push('Use light-colored, reflective materials for roofing to reduce heat absorption.');
    recommendations.push('Incorporate natural ventilation in the building design.');
    recommendations.push('Plant shade trees around the building to reduce ambient temperature.');
  }

  // Water recommendations
  if (scores?.waterScore < 60) {
    recommendations.push('Implement rainwater harvesting systems to utilize rainfall effectively.');
    recommendations.push('Design permeable surfaces to allow groundwater recharge.');
    recommendations.push('Consider greywater recycling systems for water conservation.');
  }

  // Erosion recommendations
  if (scores?.erosionScore < 50 || siteData.erosionRisk === 'high') {
    recommendations.push('Implement terracing or stepped design on sloped terrain.');
    recommendations.push('Use vegetation and ground cover to prevent soil erosion.');
    recommendations.push('Install erosion control barriers during construction.');
  }

  // Project-specific recommendations
  if (projectData) {
    if (projectData.projectType === 'house' || projectData.projectType === 'apartment') {
      recommendations.push('Orient the building to maximize natural light while minimizing heat gain.');
    } else if (projectData.projectType === 'road') {
      recommendations.push('Design proper side drains and culverts to manage water runoff.');
    } else if (projectData.projectType === 'bridge') {
      recommendations.push('Ensure the bridge design accounts for maximum flood levels and flow rates.');
    }
  }

  // Limit to 5 recommendations
  return recommendations.slice(0, 5);
}

export default ClimateSmartScore;
