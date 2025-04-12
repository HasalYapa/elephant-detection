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
 * Generate an enhanced DXF file for AutoCAD with proper formatting and layout
 * This uses a direct DXF format approach for maximum compatibility
 */
export const generateEnhancedDXF = (projectData: ProjectData, recommendations: RecommendationData): void => {
  try {
    // Format project type with first letter capitalized
    const formatProjectType = (type: string): string => {
      if (type === 'retaining-wall') return 'Retaining Wall';
      return type.charAt(0).toUpperCase() + type.slice(1);
    };

    // Create a professional DXF template with proper sections and entities
    let dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
420.0
20
297.0
30
0.0
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
VPORT
0
VPORT
2
*ACTIVE
70
0
10
0.0
20
0.0
11
1.0
21
1.0
12
210.0
22
148.5
13
0.0
23
0.0
14
10.0
24
10.0
15
10.0
25
10.0
16
0.0
26
0.0
36
1.0
17
0.0
27
0.0
37
0.0
40
297.0
41
1.42
42
50.0
43
0.0
44
0.0
50
0.0
51
0.0
71
0
72
100
73
1
74
3
75
0
76
1
77
0
78
0
0
ENDTAB
0
TABLE
2
LTYPE
0
LTYPE
2
CONTINUOUS
70
0
3
Solid line
72
65
73
0
40
0.0
0
LTYPE
2
DASHED
70
0
3
Dashed line
72
65
73
2
40
10.0
49
8.0
74
0
49
-2.0
74
0
0
LTYPE
2
DASHDOT
70
0
3
Dash-dot line
72
65
73
4
40
20.0
49
12.0
74
0
49
-5.0
74
0
49
0.0
74
0
49
-5.0
74
0
0
ENDTAB
0
TABLE
2
LAYER
0
LAYER
2
0
70
0
62
7
6
CONTINUOUS
0
LAYER
2
TITLE
70
0
62
5
6
CONTINUOUS
0
LAYER
2
BORDER
70
0
62
1
6
CONTINUOUS
0
LAYER
2
PROJECT_INFO
70
0
62
3
6
CONTINUOUS
0
LAYER
2
FOUNDATION
70
0
62
4
6
CONTINUOUS
0
LAYER
2
DRAINAGE
70
0
62
6
6
CONTINUOUS
0
LAYER
2
SLOPE
70
0
62
2
6
CONTINUOUS
0
ENDTAB
0
TABLE
2
STYLE
0
STYLE
2
STANDARD
70
0
40
0.0
41
1.0
50
0.0
71
0
42
2.5
3
txt
4

0
STYLE
2
TITLE
70
0
40
0.0
41
1.0
50
0.0
71
0
42
5.0
3
txt
4

0
STYLE
2
SUBTITLE
70
0
40
0.0
41
1.0
50
0.0
71
0
42
3.5
3
txt
4

0
ENDTAB
0
ENDSEC
0
SECTION
2
BLOCKS
0
BLOCK
2
TITLE_BLOCK
70
0
10
0.0
20
0.0
30
0.0
3
TITLE_BLOCK
0
LINE
8
BORDER
10
0.0
20
0.0
30
0.0
11
420.0
21
0.0
31
0.0
0
LINE
8
BORDER
10
420.0
20
0.0
30
0.0
11
420.0
21
297.0
31
0.0
0
LINE
8
BORDER
10
420.0
20
297.0
30
0.0
11
0.0
21
297.0
31
0.0
0
LINE
8
BORDER
10
0.0
20
297.0
30
0.0
11
0.0
21
0.0
31
0.0
0
LINE
8
BORDER
10
0.0
20
267.0
30
0.0
11
420.0
21
267.0
31
0.0
0
TEXT
8
TITLE
10
210.0
20
282.0
30
0.0
40
10.0
1
CIVIWISE DESIGN RECOMMENDATIONS
50
0.0
72
1
73
2
11
210.0
21
282.0
31
0.0
0
ENDBLK
0
ENDSEC
0
SECTION
2
ENTITIES
0
INSERT
8
BORDER
2
TITLE_BLOCK
10
0.0
20
0.0
30
0.0
41
1.0
42
1.0
43
1.0
50
0.0
0
TEXT
8
PROJECT_INFO
10
20.0
20
250.0
30
0.0
40
5.0
1
PROJECT INFORMATION
50
0.0
0
TEXT
8
PROJECT_INFO
10
20.0
20
240.0
30
0.0
40
3.5
1
Project Type: ${formatProjectType(projectData.projectType)}
50
0.0
0
TEXT
8
PROJECT_INFO
10
20.0
20
235.0
30
0.0
40
3.5
1
Soil Type: ${projectData.soilType.charAt(0).toUpperCase() + projectData.soilType.slice(1)}
50
0.0
0
TEXT
8
PROJECT_INFO
10
20.0
20
230.0
30
0.0
40
3.5
1
Terrain: ${projectData.terrain.replace('-', ' ').charAt(0).toUpperCase() + projectData.terrain.replace('-', ' ').slice(1)}
50
0.0
0`;

    // Add optional project information
    let yPos = 225;
    
    if (projectData.location) {
      dxfContent += `
TEXT
8
PROJECT_INFO
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Location: ${projectData.location}
50
0.0
0`;
      yPos -= 5;
    }
    
    if (projectData.buildingHeight) {
      dxfContent += `
TEXT
8
PROJECT_INFO
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Building Height: ${projectData.buildingHeight} m
50
0.0
0`;
      yPos -= 5;
    }
    
    if (projectData.buildingArea) {
      dxfContent += `
TEXT
8
PROJECT_INFO
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Building Area: ${projectData.buildingArea} sq.m
50
0.0
0`;
      yPos -= 5;
    }
    
    if (projectData.proximityToWater) {
      dxfContent += `
TEXT
8
PROJECT_INFO
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Proximity to Water: ${projectData.proximityToWater}
50
0.0
0`;
      yPos -= 5;
    }
    
    // Add date
    dxfContent += `
TEXT
8
PROJECT_INFO
10
20.0
20
${yPos}
30
0.0
40
2.5
1
Generated on: ${new Date(recommendations.timestamp).toLocaleString()}
50
0.0
0`;
    
    // Add foundation recommendations
    yPos -= 15;
    dxfContent += `
TEXT
8
FOUNDATION
10
20.0
20
${yPos}
30
0.0
40
5.0
1
FOUNDATION RECOMMENDATIONS
50
0.0
0`;
    
    yPos -= 10;
    dxfContent += `
TEXT
8
FOUNDATION
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Type: ${recommendations.foundation.type}
50
0.0
0`;
    
    yPos -= 5;
    dxfContent += `
TEXT
8
FOUNDATION
10
20.0
20
${yPos}
30
0.0
40
3.0
1
${recommendations.foundation.description}
50
0.0
0`;
    
    yPos -= 7;
    dxfContent += `
TEXT
8
FOUNDATION
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Key Considerations:
50
0.0
0`;
    
    recommendations.foundation.considerations.forEach((consideration, index) => {
      yPos -= 5;
      dxfContent += `
TEXT
8
FOUNDATION
10
25.0
20
${yPos}
30
0.0
40
3.0
1
${index + 1}. ${consideration}
50
0.0
0`;
    });
    
    // Add drainage recommendations
    yPos -= 15;
    dxfContent += `
TEXT
8
DRAINAGE
10
20.0
20
${yPos}
30
0.0
40
5.0
1
DRAINAGE RECOMMENDATIONS
50
0.0
0`;
    
    yPos -= 10;
    dxfContent += `
TEXT
8
DRAINAGE
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Type: ${recommendations.drainage.type}
50
0.0
0`;
    
    yPos -= 5;
    dxfContent += `
TEXT
8
DRAINAGE
10
20.0
20
${yPos}
30
0.0
40
3.0
1
${recommendations.drainage.description}
50
0.0
0`;
    
    yPos -= 7;
    dxfContent += `
TEXT
8
DRAINAGE
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Key Considerations:
50
0.0
0`;
    
    recommendations.drainage.considerations.forEach((consideration, index) => {
      yPos -= 5;
      dxfContent += `
TEXT
8
DRAINAGE
10
25.0
20
${yPos}
30
0.0
40
3.0
1
${index + 1}. ${consideration}
50
0.0
0`;
    });
    
    // Add slope stability assessment
    yPos -= 15;
    dxfContent += `
TEXT
8
SLOPE
10
20.0
20
${yPos}
30
0.0
40
5.0
1
SLOPE STABILITY ASSESSMENT
50
0.0
0`;
    
    yPos -= 10;
    dxfContent += `
TEXT
8
SLOPE
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Risk Level: ${recommendations.slopeStability.risk.toUpperCase()}
50
0.0
0`;
    
    yPos -= 5;
    dxfContent += `
TEXT
8
SLOPE
10
20.0
20
${yPos}
30
0.0
40
3.0
1
${recommendations.slopeStability.description}
50
0.0
0`;
    
    yPos -= 7;
    dxfContent += `
TEXT
8
SLOPE
10
20.0
20
${yPos}
30
0.0
40
3.5
1
Recommendations:
50
0.0
0`;
    
    recommendations.slopeStability.recommendations.forEach((recommendation, index) => {
      yPos -= 5;
      dxfContent += `
TEXT
8
SLOPE
10
25.0
20
${yPos}
30
0.0
40
3.0
1
${index + 1}. ${recommendation}
50
0.0
0`;
    });
    
    // Add footer
    dxfContent += `
TEXT
8
TITLE
10
210.0
20
10.0
30
0.0
40
3.0
1
CiviWise - Smart Civil Engineering Platform for Sri Lanka
50
0.0
72
1
73
2
11
210.0
21
10.0
31
0.0
0
ENDSEC
0
SECTION
2
OBJECTS
0
DICTIONARY
5
C
100
AcDbDictionary
3
ACAD_GROUP
350
D
3
ACAD_MLINESTYLE
350
17
0
DICTIONARY
5
D
100
AcDbDictionary
0
DICTIONARY
5
1A
330
C
100
AcDbDictionary
0
DICTIONARY
5
17
100
AcDbDictionary
0
ENDSEC
0
EOF`;

    // Create a blob and download
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
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
    
    return true;
  } catch (error) {
    console.error('Error generating enhanced DXF file:', error);
    return false;
  }
};
