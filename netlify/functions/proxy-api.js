const https = require('https');

exports.handler = async function(event, context) {
  try {
    // The URL we want to fetch
    const apiUrl = 'https://activity.test.mezo.org/';
    
    // Create a promise that resolves with the response headers
    const response = await new Promise((resolve, reject) => {
      const res = https.get(apiUrl, (res) => {
        // Set up the response headers
        const headers = {
          'Content-Type': res.headers['content-type'] || 'application/json',
          'Transfer-Encoding': 'chunked'
        };
        
        resolve({
          statusCode: res.statusCode,
          headers: headers,
          body: '' // We'll stream the body
        });
      }).on('error', (error) => {
        reject(error);
      });
      
      // Stream the response body
      context.succeed({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Transfer-Encoding': 'chunked'
        },
        body: '',
        isBase64Encoded: false
      });
      
      res.on('data', (chunk) => {
        context.succeed({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Transfer-Encoding': 'chunked'
          },
          body: chunk.toString(),
          isBase64Encoded: false
        });
      });
    });
    
    // Return the response with streaming enabled
    return {
      statusCode: response.statusCode,
      headers: response.headers,
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
