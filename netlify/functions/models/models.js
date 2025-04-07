// Available models
const availableModels = [
  "best.pt",
  "yolov8n.pt",
  "yolov8s.pt"
];

// Currently active model
let activeModel = "best.pt";

exports.handler = async function(event, context) {
  // Handle different HTTP methods
  switch (event.httpMethod) {
    case 'GET':
      // Return list of available models
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          models: availableModels,
          active: activeModel
        })
      };
      
    case 'POST':
      try {
        // Parse request body
        const data = JSON.parse(event.body);
        
        // Check if model is specified
        if (!data.model) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No model specified' })
          };
        }
        
        // Check if model exists
        if (!availableModels.includes(data.model)) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Model not found' })
          };
        }
        
        // Set active model
        activeModel = data.model;
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            message: `Model ${activeModel} loaded successfully`,
            active: activeModel
          })
        };
      } catch (error) {
        console.error('Error loading model:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to load model' })
        };
      }
      
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
  }
};
