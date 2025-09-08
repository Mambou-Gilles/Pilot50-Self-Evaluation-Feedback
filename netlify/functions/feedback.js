// /netlify/functions/feedback.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { cohort } = event.queryStringParameters;
    
    if (!cohort) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters.' }),
      };
    }
    
    const url = `${process.env.GOOGLE_SCRIPT_URL}?cohort=${encodeURIComponent(cohort)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from the source.' }),
    };
  }
};