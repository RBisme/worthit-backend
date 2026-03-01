let tokenStore = {
  accessToken: null,
  expiresAt: 0
};

const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_API_BASE = "https://api.ebay.com/buy/browse/v1";

async function refreshToken() {
  const now = Date.now();
  if (tokenStore.accessToken && now < tokenStore.expiresAt - 5 * 60 * 1000) {
    return tokenStore.accessToken;
  }

  const auth = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope"
  });

  if (!res.ok) {
    console.error("EBAY TOKEN REFRESH FAILED");
    throw new Error("EBAY_AUTH_FAILURE");
  }

  const data = await res.json();
  tokenStore.accessToken = data.access_token;
  tokenStore.expiresAt = Date.now() + data.expires_in * 1000;

  return tokenStore.accessToken;
}

export async function ebayGet(endpoint, params = {}) {
  const token = await refreshToken();

  const url = new URL(`${EBAY_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`EBAY_API_ERROR_${res.status}`);
  }

  return {
    data: await res.json()
  };
}
