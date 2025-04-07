const { Buffer } = require('buffer');

// This is a placeholder for the actual ML model
// In a real implementation, you would use TensorFlow.js or another JS ML library
const mockDetect = (imageBuffer) => {
  // Mock detection result
  return {
    detections: [
      {
        class: "elephant",
        confidence: 0.85,
        bbox: [100, 150, 400, 380]
      }
    ]
  };
};

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    
    // Check if image data is provided
    if (!data.image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }
    
    // Remove data URL prefix if present
    const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Process image (mock detection for now)
    const result = mockDetect(buffer);
    
    // Return detection results
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Detection error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image' })
    };
  }
};
