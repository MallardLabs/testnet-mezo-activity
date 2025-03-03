const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize the Fauna client with the secret
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET
});

exports.handler = async function(event, context) {
  console.log("Counter function invoked with method:", event.httpMethod);
  
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
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log("Today's date:", today);
    
    if (event.httpMethod === 'GET') {
      console.log("Processing GET request");
      
      // Try to get the counter document
      try {
        const result = await client.query(
          q.Get(
            q.Match(q.Index('counters_by_name'), 'visit-counter')
          )
        );
        
        console.log("Retrieved counter document:", result);
        
        const data = result.data;
        const todayCount = data.daily && data.daily[today] ? data.daily[today] : 0;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            total: data.total || 0, 
            today: todayCount,
            debug: {
              time: new Date().toISOString(),
              fauna: true
            }
          })
        };
      } catch (err) {
        console.log("Counter not found, returning zeros:", err.message);
        // If the counter doesn't exist yet, return zeros
        if (err.name === 'NotFound') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              total: 0, 
              today: 0,
              debug: {
                time: new Date().toISOString(),
                error: "Counter not found"
              }
            })
          };
        }
        throw err;
      }
      
    } else if (event.httpMethod === 'POST') {
      console.log("Processing POST request");
      
      // Try to get the counter document
      let counterExists = true;
      let data = { total: 0, daily: {} };
      
      try {
        const result = await client.query(
          q.Get(
            q.Match(q.Index('counters_by_name'), 'visit-counter')
          )
        );
        console.log("Retrieved existing counter:", result);
        data = result.data;
      } catch (err) {
        console.log("Counter not found, will create new one:", err.message);
        if (err.name === 'NotFound') {
          counterExists = false;
        } else {
          throw err;
        }
      }
      
      // Increment the counts
      data.total = (data.total || 0) + 1;
      data.daily = data.daily || {};
      data.daily[today] = (data.daily[today] || 0) + 1;
      
      console.log("Updated counts:", { total: data.total, today: data.daily[today] });
      
      // Update or create the counter
      if (counterExists) {
        console.log("Updating existing counter");
        await client.query(
          q.Update(
            q.Select(
              'ref',
              q.Get(
                q.Match(q.Index('counters_by_name'), 'visit-counter')
              )
            ),
            { data }
          )
        );
      } else {
        console.log("Creating new counter");
        await client.query(
          q.Create(
            q.Collection('counters'),
            { 
              data: {
                name: 'visit-counter',
                ...data
              }
            }
          )
        );
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          total: data.total, 
          today: data.daily[today],
          debug: {
            time: new Date().toISOString(),
            fauna: true
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
        description: error.description,
        stack: error.stack
      })
    };
  }
}; 