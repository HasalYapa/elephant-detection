import { Drawing, Line, Text, Layer } from 'dxf-writer';

interface ProjectData {
  projectType: string;
  location: string;
  soilType: string;
  terrain: string;
  buildingHeight?: string;
  buildingArea?: string;
  proximityToWater?: string;
}

interface RecommendationData {
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
  timestamp: string;
}

/**
 * Generate a DXF file for AutoCAD based on project data and recommendations
 * @param projectData The project data
 * @param recommendations The recommendations data
 */
export const generateDXF = (projectData: ProjectData, recommendations: RecommendationData): void => {
  try {
  // Create a new drawing
  const drawing = new Drawing();

  // Add layers
  drawing.addLayer('Title', 1, 'continuous');
  drawing.addLayer('ProjectInfo', 2, 'continuous');
  drawing.addLayer('Foundation', 3, 'continuous');
  drawing.addLayer('Drainage', 4, 'continuous');
  drawing.addLayer('SlopeStability', 5, 'continuous');
  drawing.addLayer('Border', 6, 'continuous');

  // Set current layer
  drawing.setCurrentLayer('Border');

  // Draw border (A3 size in mm: 420x297)
  drawing.drawLine(0, 0, 420, 0);
  drawing.drawLine(420, 0, 420, 297);
  drawing.drawLine(420, 297, 0, 297);
  drawing.drawLine(0, 297, 0, 0);

  // Draw title block border
  drawing.drawLine(0, 270, 420, 270);

  // Add title block
  drawing.setCurrentLayer('Title');
  drawing.drawText(210, 280, 10, 0, 'CIVIWISE DESIGN RECOMMENDATIONS');

  // Format project type with first letter capitalized
  const formatProjectType = (type: string): string => {
    if (type === 'retaining-wall') return 'Retaining Wall';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Add project information
  drawing.setCurrentLayer('ProjectInfo');
  drawing.drawText(20, 260, 5, 0, `Project Type: ${formatProjectType(projectData.projectType)}`);

  let yPos = 250;

  if (projectData.location) {
    drawing.drawText(20, yPos, 5, 0, `Location: ${projectData.location}`);
    yPos -= 10;
  }

  drawing.drawText(20, yPos, 5, 0, `Soil Type: ${projectData.soilType.charAt(0).toUpperCase() + projectData.soilType.slice(1)}`);
  yPos -= 10;

  drawing.drawText(20, yPos, 5, 0, `Terrain: ${projectData.terrain.replace('-', ' ').charAt(0).toUpperCase() + projectData.terrain.replace('-', ' ').slice(1)}`);
  yPos -= 10;

  if (projectData.buildingHeight) {
    drawing.drawText(20, yPos, 5, 0, `Building Height: ${projectData.buildingHeight} m`);
    yPos -= 10;
  }

  if (projectData.buildingArea) {
    drawing.drawText(20, yPos, 5, 0, `Building Area: ${projectData.buildingArea} sq.m`);
    yPos -= 10;
  }

  if (projectData.proximityToWater) {
    drawing.drawText(20, yPos, 5, 0, `Proximity to Water: ${projectData.proximityToWater}`);
    yPos -= 10;
  }

  drawing.drawText(20, yPos, 3, 0, `Generated on: ${new Date(recommendations.timestamp).toLocaleString()}`);
  yPos -= 20;

  // Add foundation recommendations
  drawing.setCurrentLayer('Foundation');
  drawing.drawText(20, yPos, 7, 0, 'FOUNDATION RECOMMENDATIONS');
  yPos -= 10;

  drawing.drawText(20, yPos, 5, 0, `Type: ${recommendations.foundation.type}`);
  yPos -= 10;

  // Split description into multiple lines if needed
  const foundationDescLines = splitTextIntoLines(recommendations.foundation.description, 80);
  foundationDescLines.forEach(line => {
    drawing.drawText(20, yPos, 4, 0, line);
    yPos -= 7;
  });

  drawing.drawText(20, yPos, 5, 0, 'Key Considerations:');
  yPos -= 7;

  recommendations.foundation.considerations.forEach(consideration => {
    const lines = splitTextIntoLines(`• ${consideration}`, 80);
    lines.forEach(line => {
      drawing.drawText(20, yPos, 4, 0, line);
      yPos -= 7;
    });
  });

  yPos -= 10;

  // Add drainage recommendations
  drawing.setCurrentLayer('Drainage');
  drawing.drawText(20, yPos, 7, 0, 'DRAINAGE RECOMMENDATIONS');
  yPos -= 10;

  drawing.drawText(20, yPos, 5, 0, `Type: ${recommendations.drainage.type}`);
  yPos -= 10;

  // Split description into multiple lines if needed
  const drainageDescLines = splitTextIntoLines(recommendations.drainage.description, 80);
  drainageDescLines.forEach(line => {
    drawing.drawText(20, yPos, 4, 0, line);
    yPos -= 7;
  });

  drawing.drawText(20, yPos, 5, 0, 'Key Considerations:');
  yPos -= 7;

  recommendations.drainage.considerations.forEach(consideration => {
    const lines = splitTextIntoLines(`• ${consideration}`, 80);
    lines.forEach(line => {
      drawing.drawText(20, yPos, 4, 0, line);
      yPos -= 7;
    });
  });

  yPos -= 10;

  // Add slope stability recommendations
  drawing.setCurrentLayer('SlopeStability');
  drawing.drawText(20, yPos, 7, 0, 'SLOPE STABILITY ASSESSMENT');
  yPos -= 10;

  drawing.drawText(20, yPos, 5, 0, `Risk Level: ${recommendations.slopeStability.risk.toUpperCase()}`);
  yPos -= 10;

  // Split description into multiple lines if needed
  const slopeDescLines = splitTextIntoLines(recommendations.slopeStability.description, 80);
  slopeDescLines.forEach(line => {
    drawing.drawText(20, yPos, 4, 0, line);
    yPos -= 7;
  });

  drawing.drawText(20, yPos, 5, 0, 'Recommendations:');
  yPos -= 7;

  recommendations.slopeStability.recommendations.forEach(recommendation => {
    const lines = splitTextIntoLines(`• ${recommendation}`, 80);
    lines.forEach(line => {
      drawing.drawText(20, yPos, 4, 0, line);
      yPos -= 7;
    });
  });

  // Add footer
  drawing.setCurrentLayer('Title');
  drawing.drawText(210, 10, 3, 0, 'CiviWise - Smart Civil Engineering Platform for Sri Lanka', { textAlignmentPoint: 'middle' });

  // Generate DXF content
  const dxfString = drawing.toDxfString();

  // Create a blob and download
  const blob = new Blob([dxfString], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CiviWise-Design-Recommendations.dxf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
  } catch (error) {
    console.error('Error generating DXF file:', error);
    alert('Error generating DXF file. Please check the console for details.');
  }
};

/**
 * Helper function to split text into lines of a maximum length
 * @param text The text to split
 * @param maxLength The maximum length of each line
 * @returns An array of lines
 */
function splitTextIntoLines(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}
