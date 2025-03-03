const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async function(event, context) {
  try {
    await client.connect();
    const database = client.db('visit-counter');
    const visits = database.collection('visits');
    
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': 'https://test-mezo.activity.mallardlabs.xyz',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle OPTIONS request (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers
      };
    }
    
    if (event.httpMethod === 'GET') {
      // Get current counts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalCount = await visits.countDocuments();
      const todayCount = await visits.countDocuments({
        timestamp: { $gte: today }
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ total: totalCount, today: todayCount })
      };
      
    } else if (event.httpMethod === 'POST') {
      // Record a new visit
      await visits.insertOne({
        timestamp: new Date(),
        page: event.body ? JSON.parse(event.body).page : '/',
        userAgent: event.headers['user-agent']
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://test-mezo.activity.mallardlabs.xyz'
      },
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.close();
  }
};
