const https = require('https');

exports.handler = async function(event, context) {
  try {
    // The URL we want to fetch
    const apiUrl = 'https://activity.test.mezo.org/';
    
    // Create a promise that resolves with the response
    const response = await new Promise((resolve, reject) => {
      const chunks = [];
      
      https.get(apiUrl, (res) => {
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body.toString()
          });
        });
        
        res.on('error', (error) => {
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
    
    // Return the response with streaming enabled
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: response.body,
      isBase64Encoded: false
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};
