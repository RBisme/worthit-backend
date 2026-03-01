import 'dotenv/config';
import fetch from 'node-fetch';

const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetUserRequest xmlns="urn:ebay:apis:eBLBaseComponents"></GetUserRequest>`;

const run = async () => {
  const res = await fetch("https://api.ebay.com/ws/api.dll", {
    method: "POST",
    headers: {
      "X-EBAY-API-SITEID": "0",
      "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
      "X-EBAY-API-CALL-NAME": "GetUser",
      "Content-Type": "text/xml",
      "X-EBAY-API-IAF-TOKEN": process.env.EBAY_PROD_TOKEN,
      "SOAPAction": ""
    },
    body: xml
  });

  const text = await res.text();
  console.log(text);
};

run();
