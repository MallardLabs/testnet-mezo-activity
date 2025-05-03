const https = require('https');

exports.handler = async function(event, context) {
  try {
    // Get pagination parameters from query string
    const { page = 1, limit = 100 } = event.queryStringParameters || {};
    
    // The URL we want to fetch
    const apiUrl = `https://activity.test.mezo.org/?page=${page}&limit=${limit}`;
    
    // Create a promise that resolves with the response
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
    
    // Parse the response to check if we need to fetch more pages
    const parsedResponse = JSON.parse(response.body);
    
    // If the response is an array and we have a next page token, fetch more
    if (Array.isArray(parsedResponse) && parsedResponse.length === limit) {
      // Fetch next page
      const nextPageResponse = await new Promise((resolve, reject) => {
        https.get(`${apiUrl}&page=${parseInt(page) + 1}`, (res) => {
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
      
      // Combine responses
      const nextPageData = JSON.parse(nextPageResponse.body);
      parsedResponse.push(...nextPageData);
    }
    
    // Return the response
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parsedResponse),
      isBase64Encoded: false
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};
