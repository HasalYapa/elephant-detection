import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Generate AI response based on user query
    const response = generateAIResponse(message);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return the AI response
    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Function to generate AI response based on user query
function generateAIResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Check for specific code-related queries
  if (lowerQuery.includes('setback') || lowerQuery.includes('distance from')) {
    return "According to UDA regulations, the minimum setback requirements for residential buildings are:\n\n- Front: 3m from the road boundary\n- Rear: 2.5m from the property line\n- Side: 1m from the property line\n\nFor buildings taller than 2 stories, additional setbacks may be required. You can find more details in the UDA Planning and Building Regulations document.";
  }
  
  if (lowerQuery.includes('slope') || lowerQuery.includes('hill')) {
    return "NBRO Guidelines for Construction in Hilly Areas specify that:\n\n- For slopes greater than 30°, detailed geotechnical investigation is required\n- Cut slopes should not exceed 45° without proper retention structures\n- Minimum safe distance from a slope is typically 5m, but increases with slope height\n- Surface drainage must be provided to divert water away from slopes\n\nI recommend consulting the full NBRO guidelines for your specific situation.";
  }
  
  if (lowerQuery.includes('foundation') || lowerQuery.includes('soil')) {
    return "For foundation design in Sri Lanka, you should consider:\n\n1. ICTAD SCA/3/1 specifies minimum foundation depths:\n   - 0.6m for firm soil\n   - 0.9m for ordinary soil\n   - 1.2m or more for soft soil\n\n2. NBRO Soil Testing Requirements mandate soil tests for:\n   - Buildings over 2 stories\n   - Structures on slopes greater than 15°\n   - Areas with known soil issues\n\nThe foundation type should be selected based on soil bearing capacity and structure loads.";
  }
  
  if (lowerQuery.includes('concrete') || lowerQuery.includes('cement')) {
    return "For concrete specifications in Sri Lanka:\n\n1. SLS 107 provides standards for Ordinary Portland Cement\n2. ICTAD SCA/3/1 specifies concrete grades:\n   - Grade 15 (15 MPa): Non-structural applications\n   - Grade 20 (20 MPa): General structural work\n   - Grade 25 (25 MPa): Reinforced concrete structures\n   - Grade 30+ (30+ MPa): Special structures, water-retaining structures\n\n3. Minimum cement content for structural concrete is 300 kg/m³\n4. Maximum water-cement ratio is 0.55 for normal exposure conditions";
  }
  
  if (lowerQuery.includes('road') || lowerQuery.includes('highway')) {
    return "RDA Highway Design Manual specifies:\n\n1. Minimum carriageway widths:\n   - National highways: 7.0m\n   - Provincial roads: 6.0m\n   - Local roads: 4.5m\n\n2. Minimum shoulder widths:\n   - National highways: 2.0m\n   - Provincial roads: 1.5m\n   - Local roads: 1.0m\n\n3. Design speeds:\n   - National highways: 80-100 km/h\n   - Provincial roads: 60-80 km/h\n   - Local roads: 40-60 km/h\n\nAdditional requirements apply for drainage, pavement design, and geometric design.";
  }
  
  if (lowerQuery.includes('water') || lowerQuery.includes('drainage')) {
    return "For water supply and drainage systems:\n\n1. ICTAD SCA/4/I (Water Supply) specifies:\n   - Minimum water pressure: 1.5 bar at property boundary\n   - Pipe materials: uPVC, HDPE, or GI depending on application\n   - Storage requirements: 1-day consumption capacity\n\n2. ICTAD SCA/4/II (Sewerage) requires:\n   - Minimum pipe slope: 1:100 for laterals\n   - Minimum pipe diameter: 100mm for building sewers\n   - Manholes at maximum 30m intervals and at direction changes\n\n3. Stormwater drainage should be designed for 10-year return period rainfall intensity";
  }
  
  if (lowerQuery.includes('load factor') || lowerQuery.includes('design load')) {
    return "According to Sri Lankan design codes, which follow British Standards (BS):\n\n1. Load factors for structural design:\n   - Dead load: 1.4\n   - Live load: 1.6\n   - Wind load: 1.4\n   - Earthquake load: 1.0\n\n2. Load combinations:\n   - 1.4 DL + 1.6 LL\n   - 1.2 DL + 1.2 LL + 1.2 WL\n   - 1.4 DL + 1.4 WL\n   - 1.0 DL + 1.0 EQ\n\n3. Material factors:\n   - Concrete: 1.5\n   - Steel: 1.15\n\nThese values are based on BS 8110 for concrete design and BS 5950 for steel design.";
  }
  
  if (lowerQuery.includes('fire') || lowerQuery.includes('safety')) {
    return "Fire safety requirements in Sri Lankan building codes include:\n\n1. Fire resistance ratings (ICTAD/UDA):\n   - Residential: 1-hour for structural elements\n   - Commercial: 2-hour for structural elements\n   - Industrial: 3-hour for structural elements\n\n2. Means of egress:\n   - Maximum travel distance to exit: 30m (unsprinklered), 45m (sprinklered)\n   - Minimum exit width: 1.0m\n   - Maximum occupancy per exit width: 50 persons per meter\n\n3. Fire detection and suppression:\n   - Automatic sprinklers required for buildings over 30m height\n   - Fire alarm systems required for public buildings\n   - Fire extinguishers at maximum 30m intervals\n\nConsult the ICTAD Fire Safety Guidelines for detailed requirements.";
  }
  
  // Default response for other queries
  return "I don't have specific information about that in my knowledge base. Please try asking about Sri Lankan building codes, standards, or regulations related to:\n\n- Building setbacks and zoning (UDA)\n- Construction on slopes and hilly areas (NBRO)\n- Foundation requirements and soil testing\n- Concrete and material specifications (SLS)\n- Road and highway design (RDA)\n- Water supply and drainage systems (ICTAD)\n- Load factors and structural design\n- Fire safety requirements\n\nOr you can search for specific codes using the search function above.";
}
