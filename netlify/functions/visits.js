const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
console.log("MongoDB URI exists:", !!uri); // Log if URI exists (don't log the actual URI)

exports.handler = async function(event, context) {
  console.log("Function invoked with method:", event.httpMethod);
  console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Just return mock data for now
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      total: 42, 
      today: 7,
      debug: {
        method: event.httpMethod,
        hasUri: !!process.env.MONGODB_URI,
        time: new Date().toISOString()
      }
    })
  };
};
