const https = require('https');

exports.handler = async function(event, context) {
  try {
    // The URL we want to fetch
    const apiUrl = 'https://activity.test.mezo.org/';
    
    // Fetch the data
    const response = await new Promise((resolve, reject) => {
      https.get(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
        
        res.on('error', (error) => {
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
    
    // Return the response
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: response.body
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};
