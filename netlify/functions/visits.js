const { getStore } = require('@netlify/blobs');

exports.handler = async function(event, context) {
  console.log("Function invoked with method:", event.httpMethod);
  console.log("Headers:", JSON.stringify(event.headers));
  
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
    console.log("Getting KV store...");
    const store = getStore('visit-counter');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log("Today's date:", today);
    
    if (event.httpMethod === 'GET') {
      console.log("Processing GET request");
      
      // Get the visit counts
      let totalVisits = 0;
      let todayVisits = 0;
      
      try {
        // Get total visits
        console.log("Fetching total visits...");
        const totalData = await store.get('total-visits');
        console.log("Total visits data exists:", !!totalData);
        
        if (totalData) {
          const textData = await totalData.text();
          console.log("Total visits raw data:", textData);
          totalVisits = parseInt(textData) || 0;
        }
        
        // Get today's visits
        console.log(`Fetching today's visits (${today})...`);
        const todayData = await store.get(`daily-visits-${today}`);
        console.log("Today visits data exists:", !!todayData);
        
        if (todayData) {
          const textData = await todayData.text();
          console.log("Today visits raw data:", textData);
          todayVisits = parseInt(textData) || 0;
        }
      } catch (error) {
        console.error("Error reading from KV store:", error);
      }
      
      console.log("Retrieved counts:", { total: totalVisits, today: todayVisits });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          total: totalVisits, 
          today: todayVisits,
          debug: {
            time: new Date().toISOString(),
            today: today
          }
        })
      };
      
    } else if (event.httpMethod === 'POST') {
      console.log("Processing POST request");
      
      // Get current counts
      let totalVisits = 0;
      let todayVisits = 0;
      
      try {
        // Get total visits
        console.log("Fetching total visits...");
        const totalData = await store.get('total-visits');
        console.log("Total visits data exists:", !!totalData);
        
        if (totalData) {
          const textData = await totalData.text();
          console.log("Total visits raw data:", textData);
          totalVisits = parseInt(textData) || 0;
        }
        
        // Get today's visits
        console.log(`Fetching today's visits (${today})...`);
        const todayData = await store.get(`daily-visits-${today}`);
        console.log("Today visits data exists:", !!todayData);
        
        if (todayData) {
          const textData = await todayData.text();
          console.log("Today visits raw data:", textData);
          todayVisits = parseInt(textData) || 0;
        }
      } catch (error) {
        console.error("Error reading from KV store:", error);
      }
      
      // Increment counts
      totalVisits++;
      todayVisits++;
      
      console.log("Incrementing counts to:", { total: totalVisits, today: todayVisits });
      
      // Save updated counts
      try {
        console.log("Saving total visits:", totalVisits);
        await store.set('total-visits', totalVisits.toString());
        
        console.log(`Saving today's visits (${today}):`, todayVisits);
        await store.set(`daily-visits-${today}`, todayVisits.toString());
        
        console.log("Save operation completed");
      } catch (error) {
        console.error("Error writing to KV store:", error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: "Failed to save visit data",
            message: error.message,
            stack: error.stack
          })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          total: totalVisits, 
          today: todayVisits,
          debug: {
            time: new Date().toISOString(),
            today: today
          }
        })
      };
    }
    
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      })
    };
  }
};
