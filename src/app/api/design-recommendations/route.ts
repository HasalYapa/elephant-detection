import { NextRequest, NextResponse } from 'next/server';

// Define types for our request and response
interface RequestData {
  projectType: string;
  location: string;
  soilType: string;
  terrain: string;
  buildingHeight?: string;
  buildingArea?: string;
  proximityToWater?: string;
}

interface ResponseData {
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

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data: RequestData = await request.json();
    
    // Generate recommendations based on the input data
    const recommendations = generateRecommendations(data);
    
    // Return the recommendations
    return NextResponse.json({
      ...recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// Function to generate recommendations based on input data
function generateRecommendations(data: RequestData): Omit<ResponseData, 'timestamp'> {
  // Default recommendations
  let foundation = {
    type: 'Shallow Foundation',
    description: 'A standard shallow foundation is suitable for this project.',
    considerations: [
      'Ensure proper soil compaction before construction',
      'Maintain minimum depth requirements as per local building codes',
      'Consider seasonal water table variations'
    ]
  };
  
  let drainage = {
    type: 'Surface Drainage',
    description: 'Basic surface drainage systems should be sufficient.',
    considerations: [
      'Ensure proper slope away from the structure',
      'Install gutters and downspouts',
      'Consider local rainfall patterns'
    ]
  };
  
  let slopeStability = {
    risk: 'low' as const,
    description: 'The site has low slope stability risk.',
    recommendations: [
      'Standard erosion control measures are sufficient',
      'Regular inspection during rainy season',
      'Maintain vegetation cover where appropriate'
    ]
  };

  // Adjust recommendations based on project type
  if (data.projectType === 'house' || data.projectType === 'apartment') {
    if (data.soilType === 'clay') {
      foundation = {
        type: 'Pile Foundation',
        description: 'Clay soils can be expansive and may require deeper foundations.',
        considerations: [
          'Consider seasonal moisture changes in clay soil',
          'Design for potential soil expansion and contraction',
          'Ensure adequate depth to reach stable soil layers',
          'Consider reinforced concrete for better stability'
        ]
      };
    } else if (data.soilType === 'sand' || data.soilType === 'gravel') {
      foundation = {
        type: 'Spread Footing',
        description: 'Sand and gravel provide good drainage and bearing capacity.',
        considerations: [
          'Ensure proper compaction of granular soils',
          'Consider potential for settlement',
          'Design footings with appropriate width for load distribution',
          'Verify absence of loose sand layers'
        ]
      };
    }
    
    if (data.terrain === 'steep-slope' || data.terrain === 'hill-top') {
      slopeStability = {
        risk: 'high' as const,
        description: 'Steep slopes require careful consideration for stability.',
        recommendations: [
          'Conduct detailed geotechnical investigation',
          'Consider retaining walls or terracing',
          'Implement comprehensive drainage systems',
          'Regular monitoring during and after construction',
          'Consult with NBRO for slope stability assessment'
        ]
      };
      
      drainage = {
        type: 'Comprehensive Drainage System',
        description: 'Hillside locations require careful water management.',
        considerations: [
          'Implement interceptor drains upslope of the building',
          'Install subsurface drainage systems',
          'Consider retention basins for heavy rainfall events',
          'Regular maintenance of all drainage components',
          'Ensure proper discharge points away from slopes'
        ]
      };
    }
  } else if (data.projectType === 'bridge') {
    foundation = {
      type: 'Deep Foundation',
      description: 'Bridges typically require deep foundations to handle loads and span water bodies.',
      considerations: [
        'Conduct detailed soil investigation at pier locations',
        'Consider scour potential for foundations near water',
        'Design for lateral loads from water flow',
        'Ensure adequate embedment into stable strata',
        'Consider pile or caisson foundations'
      ]
    };
    
    drainage = {
      type: 'Bridge Deck Drainage',
      description: 'Proper drainage of the bridge deck is essential.',
      considerations: [
        'Design appropriate cross slopes for deck drainage',
        'Install scuppers or drainage pipes at regular intervals',
        'Consider expansion joint drainage',
        'Protect abutments and piers from erosion',
        'Design for 100-year flood levels'
      ]
    };
  } else if (data.projectType === 'retaining-wall') {
    foundation = {
      type: 'Spread Footing with Heel',
      description: 'Retaining walls require foundations designed for both vertical and lateral loads.',
      considerations: [
        'Design for overturning and sliding resistance',
        'Include drainage behind the wall to reduce hydrostatic pressure',
        'Consider stepped footings for sloped sites',
        'Ensure proper soil bearing capacity',
        'Design for appropriate safety factors'
      ]
    };
    
    drainage = {
      type: 'Weep Holes and Drainage Layer',
      description: 'Retaining walls require proper drainage to prevent hydrostatic pressure buildup.',
      considerations: [
        'Install weep holes at regular intervals',
        'Include granular drainage layer behind the wall',
        'Consider geotextile filter fabric to prevent clogging',
        'Install drainage pipe at the base of the wall',
        'Ensure proper outlet for collected water'
      ]
    };
    
    if (data.terrain === 'steep-slope') {
      slopeStability = {
        risk: 'high' as const,
        description: 'Retaining walls on steep slopes require careful design.',
        recommendations: [
          'Consider tiered retaining wall system',
          'Conduct global stability analysis',
          'Implement comprehensive drainage systems',
          'Consider soil reinforcement techniques',
          'Regular monitoring during and after construction',
          'Consult with NBRO for slope stability assessment'
        ]
      };
    }
  } else if (data.projectType === 'road') {
    foundation = {
      type: 'Layered Pavement Structure',
      description: 'Roads require properly designed pavement structures based on expected traffic.',
      considerations: [
        'Design appropriate subbase and base layers',
        'Consider California Bearing Ratio (CBR) of subgrade',
        'Design for expected traffic loads and volume',
        'Consider local availability of materials',
        'Ensure proper compaction of all layers'
      ]
    };
    
    drainage = {
      type: 'Roadside Drainage System',
      description: 'Proper drainage is essential for road longevity.',
      considerations: [
        'Design appropriate cross slopes for surface drainage',
        'Include side ditches or curb and gutter systems',
        'Design culverts for cross drainage',
        'Consider subsurface drainage for high water table areas',
        'Design for appropriate storm return periods'
      ]
    };
  } else if (data.projectType === 'culvert') {
    foundation = {
      type: 'Reinforced Concrete Base',
      description: 'Culverts require stable foundations to prevent settlement and maintain flow.',
      considerations: [
        'Design for expected hydraulic loads',
        'Consider potential for scour and erosion',
        'Ensure proper bedding material',
        'Design headwalls and wingwalls for inlet/outlet protection',
        'Consider potential for differential settlement'
      ]
    };
    
    drainage = {
      type: 'Hydraulic Design',
      description: 'Culverts are drainage structures and require proper hydraulic design.',
      considerations: [
        'Size culvert based on watershed characteristics',
        'Design for appropriate storm return period',
        'Consider inlet and outlet control conditions',
        'Design energy dissipation at outlet if needed',
        'Consider debris potential and maintenance access'
      ]
    };
  }
  
  // Adjust recommendations based on terrain
  if (data.terrain === 'coastal') {
    foundation.considerations.push('Design for potential salt water exposure');
    foundation.considerations.push('Consider effects of tidal variations');
    
    drainage.considerations.push('Design for potential storm surge events');
    drainage.considerations.push('Consider salt water intrusion prevention');
  } else if (data.terrain === 'valley') {
    drainage.considerations.push('Consider potential for water accumulation');
    drainage.considerations.push('Design for potential flooding events');
    
    slopeStability.recommendations.push('Consider potential for water flow from surrounding higher areas');
  }
  
  // Adjust recommendations based on soil type
  if (data.soilType === 'organic') {
    foundation = {
      type: 'Pile Foundation',
      description: 'Organic soils have poor bearing capacity and high compressibility.',
      considerations: [
        'Consider complete removal of organic soil if feasible',
        'Use piles to transfer loads to competent strata below',
        'Design for potential long-term settlement',
        'Consider potential for negative skin friction on piles',
        'Regular monitoring during construction'
      ]
    };
  } else if (data.soilType === 'rock') {
    foundation = {
      type: 'Rock Socket Foundation',
      description: 'Rock provides excellent bearing capacity but may require specialized construction.',
      considerations: [
        'Verify rock quality and weathering',
        'Consider potential for differential settlement at rock/soil interfaces',
        'Design for appropriate rock socket depth',
        'Consider specialized drilling equipment requirements',
        'Verify absence of cavities or fractures'
      ]
    };
    
    slopeStability.risk = 'low';
    slopeStability.description = 'Rock typically provides good slope stability.';
  }
  
  return {
    foundation,
    drainage,
    slopeStability
  };
}
