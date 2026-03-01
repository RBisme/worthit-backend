import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getEbayAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('EBAY_CLIENT_ID or EBAY_CLIENT_SECRET not set');
  }

  const basicAuth = Buffer
    .from(clientId + ':' + clientSecret)
    .toString('base64');

  const response = await fetch(
    'https://api.ebay.com/identity/v1/oauth2/token',
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + basicAuth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error('eBay token error ' + response.status + ': ' + text);
  }

  const data = await response.json();

  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000) - 60000;

  return cachedToken;
}
