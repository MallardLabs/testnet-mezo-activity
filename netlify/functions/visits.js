const { getStore } = require('@netlify/blobs');

exports.handler = async function(event, context) {
  console.log("Function invoked with method:", event.httpMethod);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-cache'
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Get the store
    const store = getStore('visit-counter');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    if (event.httpMethod === 'GET') {
      console.log("Processing GET request");
      
      // Get the visit counts
      let totalVisits = 0;
      let todayVisits = 0;
      
      try {
        // Get total visits
        const totalData = await store.get('total-visits');
        if (totalData) {
          totalVisits = parseInt(await totalData.text()) || 0;
        }
        
        // Get today's visits
        const todayData = await store.get(`daily-visits-${today}`);
        if (todayData) {
          todayVisits = parseInt(await todayData.text()) || 0;
        }
      } catch (error) {
        console.error("Error reading from KV store:", error);
      }
      
      console.log("Retrieved counts:", { total: totalVisits, today: todayVisits });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ total: totalVisits, today: todayVisits })
      };
      
    } else if (event.httpMethod === 'POST') {
      console.log("Processing POST request");
      
      // Get current counts
      let totalVisits = 0;
      let todayVisits = 0;
      
      try {
        // Get total visits
        const totalData = await store.get('total-visits');
        if (totalData) {
          totalVisits = parseInt(await totalData.text()) || 0;
        }
        
        // Get today's visits
        const todayData = await store.get(`daily-visits-${today}`);
        if (todayData) {
          todayVisits = parseInt(await todayData.text()) || 0;
        }
      } catch (error) {
        console.error("Error reading from KV store:", error);
      }
      
      // Increment counts
      totalVisits++;
      todayVisits++;
      
      // Save updated counts
      await store.set('total-visits', totalVisits.toString());
      await store.set(`daily-visits-${today}`, todayVisits.toString());
      
      console.log("Updated counts:", { total: totalVisits, today: todayVisits });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          total: totalVisits, 
          today: todayVisits 
        })
      };
    }
    
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
