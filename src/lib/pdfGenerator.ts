import jsPDF from 'jspdf';

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

interface ProjectData {
  projectType: string;
  location: string;
  soilType: string;
  terrain: string;
  buildingHeight?: string;
  buildingArea?: string;
  proximityToWater?: string;
}

/**
 * Generate a PDF report for design recommendations
 * @param projectData The project data
 * @param recommendations The recommendations data
 * @returns void - triggers a download
 */
export const generatePDF = (projectData: ProjectData, recommendations: RecommendationData): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set font size and styles
  const titleFont = 18;
  const headingFont = 14;
  const subheadingFont = 12;
  const normalFont = 10;
  const smallFont = 8;
  
  // Add title
  doc.setFontSize(titleFont);
  doc.setFont('helvetica', 'bold');
  doc.text('CiviWise Design Recommendations Report', 105, 20, { align: 'center' });
  
  // Add project information
  doc.setFontSize(headingFont);
  doc.text('Project Information', 20, 35);
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  // Format project type with first letter capitalized
  const formatProjectType = (type: string): string => {
    if (type === 'retaining-wall') return 'Retaining Wall';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Add project details
  let yPos = 45;
  doc.text(`Project Type: ${formatProjectType(projectData.projectType)}`, 20, yPos);
  yPos += 7;
  
  if (projectData.location) {
    doc.text(`Location: ${projectData.location}`, 20, yPos);
    yPos += 7;
  }
  
  doc.text(`Soil Type: ${projectData.soilType.charAt(0).toUpperCase() + projectData.soilType.slice(1)}`, 20, yPos);
  yPos += 7;
  
  doc.text(`Terrain: ${projectData.terrain.replace('-', ' ').charAt(0).toUpperCase() + projectData.terrain.replace('-', ' ').slice(1)}`, 20, yPos);
  yPos += 7;
  
  if (projectData.buildingHeight) {
    doc.text(`Building Height: ${projectData.buildingHeight} m`, 20, yPos);
    yPos += 7;
  }
  
  if (projectData.buildingArea) {
    doc.text(`Building Area: ${projectData.buildingArea} sq.m`, 20, yPos);
    yPos += 7;
  }
  
  if (projectData.proximityToWater) {
    doc.text(`Proximity to Water: ${projectData.proximityToWater}`, 20, yPos);
    yPos += 7;
  }
  
  // Add date
  doc.setFontSize(smallFont);
  doc.text(`Generated on: ${new Date(recommendations.timestamp).toLocaleString()}`, 20, yPos);
  yPos += 12;
  
  // Add Foundation Recommendations
  doc.setFontSize(headingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Foundation Recommendations', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(subheadingFont);
  doc.text(`Type: ${recommendations.foundation.type}`, 20, yPos);
  yPos += 7;
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  // Add description with word wrapping
  const foundationDescLines = doc.splitTextToSize(recommendations.foundation.description, 170);
  doc.text(foundationDescLines, 20, yPos);
  yPos += foundationDescLines.length * 7;
  
  // Add considerations
  doc.setFontSize(subheadingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Considerations:', 20, yPos);
  yPos += 7;
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  recommendations.foundation.considerations.forEach(consideration => {
    const lines = doc.splitTextToSize(`• ${consideration}`, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 7;
  });
  
  yPos += 5;
  
  // Add Drainage Recommendations
  doc.setFontSize(headingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Drainage Recommendations', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(subheadingFont);
  doc.text(`Type: ${recommendations.drainage.type}`, 20, yPos);
  yPos += 7;
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  // Add description with word wrapping
  const drainageDescLines = doc.splitTextToSize(recommendations.drainage.description, 170);
  doc.text(drainageDescLines, 20, yPos);
  yPos += drainageDescLines.length * 7;
  
  // Add considerations
  doc.setFontSize(subheadingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Considerations:', 20, yPos);
  yPos += 7;
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  recommendations.drainage.considerations.forEach(consideration => {
    const lines = doc.splitTextToSize(`• ${consideration}`, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 7;
  });
  
  // Check if we need a new page for slope stability
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 5;
  }
  
  // Add Slope Stability Recommendations
  doc.setFontSize(headingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Slope Stability Assessment', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(subheadingFont);
  doc.text(`Risk Level: ${recommendations.slopeStability.risk.toUpperCase()}`, 20, yPos);
  yPos += 7;
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  // Add description with word wrapping
  const slopeDescLines = doc.splitTextToSize(recommendations.slopeStability.description, 170);
  doc.text(slopeDescLines, 20, yPos);
  yPos += slopeDescLines.length * 7;
  
  // Add recommendations
  doc.setFontSize(subheadingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations:', 20, yPos);
  yPos += 7;
  
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  
  recommendations.slopeStability.recommendations.forEach(recommendation => {
    const lines = doc.splitTextToSize(`• ${recommendation}`, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 7;
  });
  
  // Add footer
  doc.setFontSize(smallFont);
  doc.text('This report was generated by CiviWise - Smart Civil Engineering Platform for Sri Lanka', 105, 285, { align: 'center' });
  
  // Save the PDF
  doc.save('CiviWise-Design-Recommendations.pdf');
};
